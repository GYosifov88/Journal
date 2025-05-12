import logging
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.auth.password import hash_password

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_user(username, email, password):
    """Create a new user in the database"""
    db = SessionLocal()
    try:
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
        
        logger.info(f"User created successfully: {new_user.username} (ID: {new_user.id})")
        return new_user
        
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Create a specific user for testing
    username = "george"
    email = "george_197@abv.bg"
    password = "123456789"
    
    logger.info(f"Creating user: {username} with email: {email}")
    user = create_user(username, email, password)
    logger.info(f"User creation completed") 