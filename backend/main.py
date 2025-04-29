from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import json
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
import db
from db import engine, local_session
from sqlalchemy import and_,select, or_, update, delete
from sqlalchemy.orm import Session
from sqlalchemy.sql import exists
from pydantic import BaseModel

#Hashing information for user passwords
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

class RegistrationInfo(BaseModel):
    username: str
    password: str
    passwordConf: str
    phone_num: str
    street_num: str
    city: str
    state: str
    zip_code: int
    email: str

class LoginInfo(BaseModel):
    username: str
    password: str

class ProductInfo(BaseModel):
    prodName: str
    prodDesc: str
    price: int | None
    posted_by: str | None
    quantity: int | None

class ProductFinal(BaseModel):
  datetime_created: str
  idProducts: int
  is_active: bool
  is_exchanged: bool
  posted_by: str | None
  price: int
  prodDesc: str
  prodName: str
  quantity: int

class TransactionInfo(BaseModel):
    item_exchanged_1: int
    item_exchanged_2: int
    party_1: str
    party_2: str
    date_started: datetime | None = None
    date_ended: datetime | None = None
    hash_key: str | None = None
    via_1: str | None = None
    via_2: str | None = None
    quantity_1: int | None = None
    quantity_2: int | None = None
    value_1: int | None = None
    value_2: int | None = None
    part_stage: int | None = None

class TransactionReadable(BaseModel):
    idtransactions: int
    prod_1: str
    prod_2: str
    id_1: int
    id_2: int
    quant_1: int
    quant_2: int
    value_1: int
    value_2: int
    is_active: bool

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

#Implement CORS Middleware for all requests
origins = [
    "http://localhost:8081", 
    "http://127.0.0.1:8081", 
    "https://localhost:8081", 
    "https://127.0.0.1:8081"
]

app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins, 
    allow_credentials=True, 
    allow_methods=['*'], 
    allow_headers=['*']
)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(username: str, password: str):
    with local_session() as session:
        user = session.query(exists().where(db.User.username == username and db.User.password == password))
    
    #For implementing hashed passwords
    # if (not user and verify_password(password, user.password)):
    #     return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.post("/login")
async def login_for_access_token(
    # form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    form_data: LoginInfo
) -> Token:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@app.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user


@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return [{"item_id": "Foo", "owner": current_user.username}]

@app.post("/register")
async def register(registration_info: RegistrationInfo):
    #Remove passwordConf
    reg_info = registration_info.dict()
    reg_info.pop("passwordConf")

    with local_session() as session:
        new_user = db.User(**reg_info)
        session.add(new_user)
        session.commit()

#Return all product descriptions
@app.get("/products")
async def get_products():
    with local_session() as session:
        products = session.query(db.Products).all()
        products_arr = []
        for product in products:
            next_prod = vars(product)
            next_prod.pop('_sa_instance_state')
            products_arr.append(next_prod)
        return products_arr

#Add products for sale
@app.post("/products")
async def add_product(product_info: ProductInfo):
    #Generate data not given on frontend
    prod_info = product_info.dict()
    prod_info["datetime_created"] = datetime.now()
    prod_info["is_active"] = False
    prod_info["is_exchanged"] = False

    with local_session() as session:
        new_product = db.Products(**prod_info)
        session.add(new_product)
        session.commit()

#Delete a product
@app.delete("/products")
async def delete_product(product: int):
    print(product)

    with local_session() as session:
        query = delete(db.Products).where(db.Products.idProducts == product)
        session.execute(query)
        session.commit()

#Get a specific user
@app.post("/user")
async def get_user(username: str):
    with local_session() as session:
        statement = select(db.User).filter_by(username=username)
        user = session.scalars(statement).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return vars(user)

#Get all users
@app.get("/users")
async def get_users():
    with local_session() as session:
        users = session.query(db.User).all()
        users_arr = []
        for user in users:
            next_user = vars(user)
            next_user.pop('_sa_instance_state')
            users_arr.append(next_user)
        return users_arr

#Get a specific user's products
@app.post("/user_products")
async def get_user_products(username: str):
    with local_session() as session:
        statement = select(db.Products).filter_by(posted_by=username)
        products = session.scalars(statement).all()
        return products
    
#Approve a user
@app.post("/approve_user")
async def approve_user(username: str):
    with local_session() as session:
        statement = update(db.User).values({"is_approved": True}).where(db.User.username == username)
        session.execute(statement)
        session.commit()
    return {"message": "User approved successfully"}

#Delete a user
@app.post("/delete_user")
async def delete_user(username: str):
    with local_session() as session:
        query = delete(db.User).where(db.User.username == username)
        session.execute(query)
        session.commit()
    return {"message": "User deleted successfully"}

#Suspend a user
@app.post("/suspend_user")
async def suspend_user(username: str):
    with local_session() as session:
        statement = update(db.User).values({"is_approved": False}).where(db.User.username == username)
        session.execute(statement)
        session.commit()
    return {"message": "User suspended successfully"}

@app.get("/transactions")
async def get_transactions(username: str | None = None, active_status: bool | None = None, requested: bool | None = None):
    username = False if username is None else username
    active_status = False if active_status is None else active_status
    requested = False if requested is None else requested

    transactions_arr = []
    with local_session() as session:
        #All transactions
        if not username and not active_status:
            transactions = session.query(db.Transactions).all()
        #All active transactions
        elif not username:
            statement = select(db.Transactions).filter_by(is_active=active_status)
            transactions = session.scalars(statement).all()
        #All of one user's active transactions
        elif active_status:
            part_step = db.Transactions.part_stage
            #Requests received
            if requested:
                statement = select(db.Transactions).filter(
                    #Partner transaction, received from requestor
                    (((part_step == 0) & (db.Transactions.party_2 == username)) |
                    #Partner transaction, received from first pair
                    ((part_step == 1) & (db.Transactions.party_1 == username)) | 
                    #Partner transaction, received from requestee
                    ((part_step == 2) & (db.Transactions.via_1 == username)) |
                    #Non-partner transaction
                    ((db.Transactions.via_2 == None) & (db.Transactions.party_1 == username))) & 
                    (db.Transactions.is_active == active_status)
                )
            #Requests sent
            else:
                statement = select(db.Transactions).filter(
                    (((db.Transactions.party_2 == username) & (part_step == None)) |
                    ((part_step < 2) & (db.Transactions.via_2 == username)) |
                    ((part_step == 2) & (db.Transactions.party_1 == username))) & 
                    (db.Transactions.is_active == active_status)
                )
            transactions = session.scalars(statement).all()
        #One user's complete transactions
        else:
            statement = select(db.Transactions).filter(
                or_(
                    db.Transactions.party_1 == username,
                    db.Transactions.party_2 == username,
                    db.Transactions.via_1 == username,
                    db.Transactions.via_2 == username
                ),
                db.Transactions.is_active == active_status
            )
            transactions = session.scalars(statement).all()

        for transaction in transactions:
            next_transaction = vars(transaction)
            next_transaction.pop('_sa_instance_state')

            #Get product names
            statement = select(db.Products).filter_by(idProducts=next_transaction["item_exchanged_1"])
            product_1 = session.scalars(statement).first()
            if product_1 is None:
                raise HTTPException(status_code=404, detail="Product not found")
            prod_name_1 = product_1.prodName
            statement = select(db.Products).filter_by(idProducts=next_transaction["item_exchanged_2"])
            product_2 = session.scalars(statement).first()
            if product_2 is None:
                raise HTTPException(status_code=404, detail="Product not found")
            prod_name_2 = product_2.prodName

            read_transaction = {
                "idtransactions": next_transaction["idtransactions"],
                "prod_1": prod_name_1,
                "prod_2": prod_name_2,
                "id_1": next_transaction["item_exchanged_1"],
                "id_2": next_transaction["item_exchanged_2"],
                "quant_1": next_transaction["quantity_1"],
                "quant_2": next_transaction["quantity_2"],
                "value_1": next_transaction["value_1"],
                "value_2": next_transaction["value_2"],
                "is_active": next_transaction["is_active"],
            }
            transactions_arr.append(read_transaction)
    return transactions_arr
    
@app.post("/transactions")
async def add_transaction(transaction_info: TransactionInfo):
    #Generate data not given on frontend
    trans_info = transaction_info.dict()
    trans_info["date_started"] = str(datetime.now())
    hashed_dict = str(hash(json.dumps(trans_info, sort_keys=True)))
    trans_info["hash_key"] = hashed_dict

    with local_session() as session:
        new_trans = db.Transactions(**trans_info)
        session.add(new_trans)
        session.commit()
    return {"message": "Transaction added successfully"}

@app.post("/accept_transaction")
async def accept_transaction(transaction_info: TransactionReadable):
    trans_info = transaction_info.dict()
    og_trans: TransactionInfo =  await get_orig_transaction(trans_info['idtransactions'])
    og_trans = vars(og_trans)
    og_trans.pop('_sa_instance_state')

    with local_session() as session:
        if og_trans['part_stage'] == 0 or og_trans["part_stage"] == 2:
            #Alter values for updated transaction
            statement = select(db.Products).filter_by(idProducts=og_trans['item_exchanged_1'])
            product = session.scalars(statement).first()
            if product is None:
                raise HTTPException(status_code=404, detail=f"Product 1 ({og_trans['item_exchanged_1']}) not found")

            query = update(db.Transactions).values({"quantity_1": og_trans['quantity_1'] + 1, "value_1": product.price * (og_trans['quantity_1'] + 1), "part_stage": 1}).where(db.Transactions.idtransactions == trans_info['idtransactions'])
            session.execute(query)
            
            session.commit()
        else:
            #Create finished transaction
            dt_finished = str(datetime.now())
            query = update(db.Transactions).values({"date_ended": dt_finished, "is_active": 0}).where(db.Transactions.idtransactions == trans_info["idtransactions"])
            session.execute(query)
            session.commit()

            #Edit products with new values
            statement = select(db.Transactions).filter_by(idtransactions=trans_info["idtransactions"])
            real_transaction = session.scalars(statement).first()
            
            loss_1 = 1 if real_transaction.via_1 != None else 0
            loss_2 = 1 if real_transaction.via_2 != None else 0
            transfer_prod(trans_info['idtransactions'], real_transaction.party_1, real_transaction.party_2, real_transaction.item_exchanged_1, real_transaction.item_exchanged_2, real_transaction.quantity_1 - loss_2, real_transaction.quantity_2 - loss_1)
                
            if real_transaction.via_2 is not None and real_transaction.via_2 != real_transaction.party_1:
                transfer_prod(trans_info['idtransactions'], real_transaction.party_2, real_transaction.via_2, real_transaction.item_exchanged_1, real_transaction.item_exchanged_1, 1, 0)
            if real_transaction.via_1 is not None and real_transaction.via_1 != real_transaction.party_2:
                transfer_prod(trans_info['idtransactions'], real_transaction.party_1, real_transaction.via_1, real_transaction.item_exchanged_2, real_transaction.item_exchanged_2, 1, 0)

    return {"message": "Transaction updated successfully"}

@app.post("/delete_transaction")
async def delete_transaction(trans_id: int):
    with local_session() as session:
        query = delete(db.Transactions).where(db.Transactions.idtransactions == trans_id)
        session.execute(query)
        session.commit()
    return {"message": "Transaction deleted successfully"} 

@app.post("/og_transaction")
async def get_orig_transaction(trans_id: int):
    with local_session() as session:
        query = select(db.Transactions).filter(db.Transactions.idtransactions == trans_id)
        transaction = session.scalars(query).first()
        if transaction is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction
    
def transfer_prod(trans_id, party_1, party_2, prod_1, prod_2, quant_1, quant_2):
    with local_session() as session:
        #Transfer item 1 to party 2
        statement = select(db.Transactions).filter_by(idtransactions=trans_id)
        real_transaction = session.scalars(statement).first()
        statement = select(db.Products).filter_by(idProducts=prod_1)
        product = session.scalars(statement).first()
        if product is None:
            raise HTTPException(status_code=404, detail=f"Product 1 ({prod_1}) not found")

        new_quant = product.quantity - quant_1
        if new_quant <= 0 and quant_1 > 0:
            statement = update(db.Products).values({"posted_by": party_2}).where(db.Products.idProducts == product.idProducts)
            session.execute(statement)
            session.commit()
        elif quant_1 > 0:
            statement = update(db.Products).values({"quantity": new_quant}).where(db.Products.idProducts == product.idProducts)
            session.execute(statement)
            session.commit()

            statement = select(db.Products).filter_by(idProducts=prod_1)
            product_info = session.scalars(statement).first()
            prod_info = vars(product_info)
            prod_info.pop('_sa_instance_state')
            prod_info['idProducts'] = None
            prod_info["posted_by"] = party_2
            prod_info["quantity"] = quant_1
            prod_info["datetime_created"] = datetime.now()
            prod_info["is_active"] = False
            prod_info["is_exchanged"] = False

            new_product = db.Products(**prod_info)
            session.add(new_product)
            session.commit()

        #Transfer item 2 to party 1
        statement = select(db.Transactions).filter_by(idtransactions=trans_id)
        real_transaction = session.scalars(statement).first()
        statement = select(db.Products).filter_by(idProducts=prod_2)
        product = session.scalars(statement).first()
        if product is None:
            raise HTTPException(status_code=404, detail=f"Product 2 ({prod_2}) not found")

        new_quant = product.quantity - quant_2
        if new_quant <= 0 and quant_2 > 0:
            statement = update(db.Products).values({"posted_by": party_1}).where(db.Products.idProducts == product.idProducts)
            session.execute(statement)
            session.commit()
        elif quant_2 > 0:
            statement = update(db.Products).values({"quantity": new_quant}).where(db.Products.idProducts == product.idProducts)
            session.execute(statement)
            session.commit()

            statement = select(db.Products).filter_by(idProducts=prod_2)
            product_info = session.scalars(statement).first()
            prod_info = vars(product_info)
            prod_info.pop('_sa_instance_state')
            prod_info['idProducts'] = None
            prod_info["posted_by"] = party_1
            prod_info["quantity"] = quant_2
            prod_info["datetime_created"] = datetime.now()
            prod_info["is_active"] = False
            prod_info["is_exchanged"] = False

            new_product = db.Products(**prod_info)
            session.add(new_product)
            session.commit()