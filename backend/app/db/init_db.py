from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db
from app.models import user, account, deposit, trade, trade_detail, trade_screenshot, goal, analysis_result
from app.auth.password import hash_password
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created")

def init_db():
    create_tables()
    
    # Check if admin user exists
    db = next(get_db())
    if db.query(user.User).filter(user.User.email == "admin@example.com").first():
        logger.info("Admin user already exists")
        return
    
    # Create admin user
    admin_user = user.User(
        username="admin",
        email="admin@example.com",
        password_hash=hash_password("admin123")
    )
    db.add(admin_user)
    db.commit()
    logger.info("Admin user created")

if __name__ == "__main__":
    init_db() 