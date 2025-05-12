import os
import sys
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.auth.password import hash_password
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_test_user():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create a new database session
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
            return
        
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
        
        # Verify the user was created
        all_users = db.query(User).all()
        logger.info(f"Total users in database: {len(all_users)}")
        
        for user in all_users:
            logger.info(f"User: {user.id}, {user.username}, {user.email}")
        
    except Exception as e:
        logger.error(f"Error creating test user: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting test user creation")
    create_test_user()
    logger.info("Test completed") 