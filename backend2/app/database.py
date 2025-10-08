from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    # Test the connection
    with engine.connect() as connection:
        logger.info("✅ Database connection established successfully!")
        logger.info(f"📊 Connected to database: {os.getenv('DB_NAME')}")
        logger.info(f"🔌 Using host: {os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}")
except Exception as e:
    logger.error(f"❌ Failed to connect to database: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 