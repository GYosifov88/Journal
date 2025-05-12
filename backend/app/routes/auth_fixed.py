from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.models.user import User
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token, get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/debug-users")
async def debug_list_users(db: Session = Depends(get_db)):
    """Temporary endpoint for debugging. Lists all users in the database."""
    try:
        users = db.query(User).all()
        user_list = []
        for user in users:
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "password_hash_length": len(user.password_hash) if user.password_hash else 0,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            user_list.append(user_data)
        return {"users": user_list, "count": len(user_list)}
    except Exception as e:
        logger.error(f"Error in debug_list_users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving users: {str(e)}"
        )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Registration attempt for username: {user.username}, email: {user.email}")
        
        # Check if username exists
        db_user_by_username = db.query(User).filter(User.username == user.username).first()
        if db_user_by_username:
            logger.warning(f"Registration failed: Username {user.username} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email exists
        db_user_by_email = db.query(User).filter(User.email == user.email).first()
        if db_user_by_email:
            logger.warning(f"Registration failed: Email {user.email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        logger.info(f"Hashing password for user: {user.username}")
        hashed_password = hash_password(user.password)
        logger.info(f"Password hashed successfully, length: {len(hashed_password)}")
        
        # Create new user
        logger.info(f"Creating user object for: {user.username}")
        db_user = User(
            username=user.username,
            email=user.email,
            password_hash=hashed_password
        )
        
        # Log the user object
        logger.info(f"User object created: {db_user.username}, {db_user.email}, password_hash length: {len(db_user.password_hash)}")
        
        # Add to database
        logger.info(f"Adding user to database: {user.username}")
        db.add(db_user)
        
        # Commit
        logger.info(f"Committing database changes for user: {user.username}")
        db.commit()
        
        # Refresh
        logger.info(f"Refreshing user object for: {user.username}")
        db.refresh(db_user)
        
        logger.info(f"User registered successfully: {db_user.username} (ID: {db_user.id})")
        
        # Return the user object
        return db_user
    
    except Exception as e:
        logger.error(f"Error during user registration: {str(e)}")
        logger.exception("Detailed exception info:")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during registration: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt for username/email: {form_data.username}")
        
        # Try to find user by email first
        db_user = db.query(User).filter(User.email == form_data.username).first()
        
        # If not found by email, try username
        if not db_user:
            logger.info(f"User not found by email, trying username: {form_data.username}")
            db_user = db.query(User).filter(User.username == form_data.username).first()
        
        if not db_user:
            logger.warning(f"Login failed: User not found for {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(form_data.password, db_user.password_hash):
            logger.warning(f"Login failed: Invalid password for user {db_user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last login
        db_user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token with user ID as integer
        access_token = create_access_token(
            data={"sub": str(db_user.id)}  # Convert to string to be safe
        )
        
        logger.info(f"Login successful for user {db_user.username} (ID: {db_user.id})")
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        logger.exception("Detailed exception info:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    try:
        # Create a new access token
        access_token = create_access_token(
            data={"sub": str(current_user.id)}  # Convert to string to be safe
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Error during token refresh: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error refreshing token"
        )

@router.post("/logout")
async def logout():
    # Since we're using JWT tokens, there's no server-side logout.
    # The client should discard the token.
    return {"message": "Successfully logged out"} 