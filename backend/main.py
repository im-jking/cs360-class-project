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
from sqlalchemy import select, or_, update, delete
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

#Get a specific user
@app.post("/user")
async def get_user(username: str):
    with local_session() as session:
        statement = select(db.User).filter_by(username=username)
        user = session.scalars(statement).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return vars(user)

#Get a specific user's products
@app.post("/user_products")
async def get_user_products(username: str):
    with local_session() as session:
        statement = select(db.Products).filter_by(posted_by=username)
        products = session.scalars(statement).all()
        return products
    
@app.get("/transactions")
async def get_transactions(username: str | None = None, active_status: bool | None = None, requested: bool | None = None):
    username = False if username is None else username
    active_status = False if active_status is None else active_status
    requested = False if requested is None else requested

    transactions_arr = []
    with local_session() as session:
        if not username and not active_status:
            transactions = session.query(db.Transactions).all()
        elif not username:
            statement = select(db.Transactions).filter_by(is_active=active_status)
            transactions = session.scalars(statement).all()
        elif active_status:
            if requested:
                statement = select(db.Transactions).filter(
                    or_(
                        db.Transactions.party_1 == username,
                        db.Transactions.via_1 == username
                    ),
                    db.Transactions.is_active == active_status
                )
            else:
                statement = select(db.Transactions).filter(
                    or_(
                        db.Transactions.party_2 == username,
                        db.Transactions.via_2 == username
                    ),
                    db.Transactions.is_active == active_status
                )
            transactions = session.scalars(statement).all()
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
async def accept_transaction(trans_id: int):
    with local_session() as session:
        dt_finished = str(datetime.now())
        query = update(db.Transactions).values({"date_ended": dt_finished, "is_active": 0}).where(db.Transactions.idtransactions == trans_id)
        # session.scalars(query).all()
        session.execute(query)
        session.commit()
    return {"message": "Transaction updated successfully"}

@app.post("/delete_transaction")
async def delete_transaction(trans_id: int):
    with local_session() as session:
        query = delete(db.Transactions).where(db.Transactions.idtransactions == trans_id)
        # session.scalars(query).all()
        session.execute(query)
        session.commit()
    return {"message": "Transaction deleted successfully"} 