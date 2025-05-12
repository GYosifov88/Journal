import logging
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.auth.password import verify_password

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def list_all_users():
    """List all users in the database and test passwords"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        logger.info(f"Found {len(users)} users in the database")
        
        for user in users:
            logger.info(f"User ID: {user.id}")
            logger.info(f"Username: {user.username}")
            logger.info(f"Email: {user.email}")
            logger.info(f"Password hash: {user.password_hash[:20]}... (length: {len(user.password_hash)})")
            logger.info(f"Created at: {user.created_at}")
            logger.info(f"Last login: {user.last_login}")
            logger.info("-" * 50)
            
            # Test password verification with a known password
            test_password = "password123"
            is_valid = verify_password(test_password, user.password_hash)
            logger.info(f"Password '{test_password}' is {'VALID' if is_valid else 'INVALID'}")
            
            # Try another common password
            test_password = "123456789"
            is_valid = verify_password(test_password, user.password_hash)
            logger.info(f"Password '{test_password}' is {'VALID' if is_valid else 'INVALID'}")
            
            logger.info("=" * 50)
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting database debug script")
    list_all_users()
    logger.info("Database debug script completed") 