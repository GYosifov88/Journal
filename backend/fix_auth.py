import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create a standalone database just for authentication
DATABASE_URL = "sqlite:///./auth_test.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Simple User model without relationships
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

def create_test_user():
    db = SessionLocal()
    try:
        # Test user data
        username = "testuser123"
        email = "testuser123@example.com"
        password = "password123"
        
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            logger.info(f"User already exists: {existing_user.username} (ID: {existing_user.id})")
            return existing_user
        
        # Hash password
        hashed_password = hash_password(password)
        logger.info(f"Password hashed: {len(hashed_password)} characters")
        
        # Create user
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password
        )
        
        # Add to database
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Test user created: {new_user.username} (ID: {new_user.id})")
        return new_user
        
    except Exception as e:
        logger.error(f"Error creating test user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def test_login(username_or_email, password):
    db = SessionLocal()
    try:
        # Try to find user by email
        db_user = db.query(User).filter(User.email == username_or_email).first()
        
        # If not found by email, try username
        if not db_user:
            db_user = db.query(User).filter(User.username == username_or_email).first()
        
        if not db_user:
            logger.error(f"Login failed: User not found for {username_or_email}")
            return False, "User not found"
        
        # Verify password
        if not verify_password(password, db_user.password_hash):
            logger.error(f"Login failed: Invalid password for user {db_user.username}")
            return False, "Invalid password"
        
        logger.info(f"Login successful for user {db_user.username} (ID: {db_user.id})")
        return True, db_user
        
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return False, str(e)
    finally:
        db.close()

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        logger.info(f"Total users in database: {len(users)}")
        
        for user in users:
            logger.info(f"User: {user.id}, {user.username}, {user.email}, password_hash_length: {len(user.password_hash)}")
        
        return users
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        return []
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting authentication test")
    
    # Setup database
    setup_db()
    
    # Create test user
    test_user = create_test_user()
    
    # List users
    users = list_users()
    
    # Test login with email
    success, result = test_login("testuser123@example.com", "password123")
    logger.info(f"Login with email: {'Success' if success else 'Failed'} - {result}")
    
    # Test login with username
    success, result = test_login("testuser123", "password123")
    logger.info(f"Login with username: {'Success' if success else 'Failed'} - {result}")
    
    # Test login with wrong password
    success, result = test_login("testuser123", "wrongpassword")
    logger.info(f"Login with wrong password: {'Success' if success else 'Failed'} - {result}")
    
    # Test login with non-existent user
    success, result = test_login("nonexistentuser", "password123")
    logger.info(f"Login with non-existent user: {'Success' if success else 'Failed'} - {result}")
    
    logger.info("Authentication test completed") 