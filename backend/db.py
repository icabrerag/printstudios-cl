import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    if ENVIRONMENT in {"development", "local", "test"}:
        DATABASE_URL = "mysql+pymysql://root:pstudiosdb@localhost:3307/printstudios"
    else:
        raise RuntimeError("DATABASE_URL is required when ENVIRONMENT is not development/local/test")


def mysql_connect_args() -> dict:
    if os.getenv("MYSQL_SSL_ENABLED", "false").lower() not in {"1", "true", "yes", "on"}:
        return {}
    ssl_config = {"check_hostname": False}
    ssl_ca = os.getenv("MYSQL_SSL_CA")
    if ssl_ca:
        ssl_config["ca"] = ssl_ca
    return {"ssl": ssl_config}


engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True, connect_args=mysql_connect_args())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
