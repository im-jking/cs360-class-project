from sqlalchemy import create_engine, Table, Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

URL_DATABASE = "mysql+mysqlconnector://class_host:360classproj@localhost:3306/360_class"

engine = create_engine(URL_DATABASE, pool_size= 10, max_overflow= 30)

local_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

base = declarative_base()

class User(base):
    __tablename__ = 'users'

    idusers = Column(Integer, primary_key=True, unique=True, index=True, autoincrement=True)
    username = Column(String(45), primary_key=True, unique=True)
    credit = Column(Integer)
    is_admin = Column(Boolean)
    password = Column(String(45), nullable=True)
    phone_num = Column(String(45))
    street_num = Column(String(45))
    city = Column(String(45))
    state = Column(String(45))
    zip_code = Column(Integer)
    email = Column(String(45))
    is_approved = Column(Boolean)

class Products(base):
    __tablename__ = 'products'

    idProducts = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=True, unique=True)
    prodName =  Column(String(45))
    prodDesc = Column(String(100))
    price = Column(Integer)
    datetime_created = Column(DateTime)
    is_active = Column(Boolean)
    is_exchanged = Column(Boolean)
    posted_by = Column(String(45))
    quantity = Column(Integer)

class Transactions(base):
    __tablename__ = 'transactions'

    idtransactions = Column(Integer, primary_key=True, nullable=True, autoincrement=True)
    item_exchanged_1 = Column(Integer)
    item_exchanged_2 = Column(Integer)
    party_1 = Column(String(45))
    party_2 = Column(String(45))
    date_started = Column(DateTime)
    date_ended = Column(DateTime)
    hash_key = Column(String(45), nullable=True, unique=True)
    via_1 = Column(String(45), nullable=True)
    via_2 = Column(String(45), nullable=True)