from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import database

DATABASE_URL = "postgresql://postgres:poma@localhost/lr4"

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
