import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv(Path(__file__).with_name('.env'))

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'mysql+pymysql://root:@localhost:3306/road_master',
)

# Railway expone la conexión como mysql://...; SQLAlchemy con PyMySQL requiere mysql+pymysql://...
if DATABASE_URL.startswith('mysql://'):
    DATABASE_URL = DATABASE_URL.replace('mysql://', 'mysql+pymysql://', 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
