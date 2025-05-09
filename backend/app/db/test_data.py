# Script to create test data in the database
from sqlalchemy.orm import Session
from app.models.user import User
from app.auth.password import hash_password
import logging

def create_test_user(db: Session):
    """
    Creates a test user in the database if it doesn't already exist
    """
    logging.info("Checking for test user...")
    
    # Check if test user exists
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    
    if test_user:
        logging.info("Test user already exists with ID: %s", test_user.id)
        return test_user
    
    # Create test user
    logging.info("Creating test user...")
    
    # Hash the password 'password123'
    hashed_password = hash_password("password123")
    
    # Create user object
    test_user = User(
        username="testuser",
        email="test@example.com",
        password_hash=hashed_password
    )
    
    # Add to database
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    logging.info("Test user created with ID: %s", test_user.id)
    return test_user 