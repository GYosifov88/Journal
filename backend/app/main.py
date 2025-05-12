from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from app.routes import users, accounts, trades, deposits, trade_details, screenshots, goals, analysis
from app.routes import auth_fixed as auth  # Use our fixed auth module
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Forex & Crypto Trading Journal API",
    description="API for tracking and analyzing trading performance",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(trades.router, prefix="/api/trades", tags=["Trades"])
app.include_router(deposits.router, prefix="/api/deposits", tags=["Deposits"])
app.include_router(trade_details.router, prefix="/api/trade-details", tags=["Trade Details"])
app.include_router(screenshots.router, prefix="/api/screenshots", tags=["Screenshots"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

# Direct register endpoint for debugging
@app.post("/direct-register")
async def direct_register(user_data: dict = Body(...), db: Session = Depends(get_db)):
    try:
        logger.info(f"Direct registration attempt for: {user_data.get('username')}, {user_data.get('email')}")
        
        # Check if username exists
        db_user_by_username = db.query(User).filter(User.username == user_data.get('username')).first()
        if db_user_by_username:
            logger.warning(f"Registration failed: Username {user_data.get('username')} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email exists
        db_user_by_email = db.query(User).filter(User.email == user_data.get('email')).first()
        if db_user_by_email:
            logger.warning(f"Registration failed: Email {user_data.get('email')} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = hash_password(user_data.get('password'))
        logger.info(f"Password hashed, length: {len(hashed_password)}")
        
        # Create new user
        db_user = User(
            username=user_data.get('username'),
            email=user_data.get('email'),
            password_hash=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"User registered successfully: {db_user.username} (ID: {db_user.id})")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(db_user.id)})
        
        # Return user and token info
        return {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "access_token": access_token,
            "token_type": "bearer"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during direct registration: {str(e)}")
        logger.exception("Detailed exception info:")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during registration: {str(e)}"
        )

# Direct login endpoint for debugging
@app.post("/direct-login")
async def direct_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        logger.info(f"Direct login attempt for: {form_data.username}")
        
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
                detail=f"Invalid credentials - no user found with email/username: {form_data.username}",
            )
        
        logger.info(f"User found: {db_user.username} with ID {db_user.id}")
        
        # Verify password
        is_password_valid = verify_password(form_data.password, db_user.password_hash)
        logger.info(f"Password verification result: {is_password_valid}")
        
        if not is_password_valid:
            logger.warning(f"Login failed: Invalid password for user {db_user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials - password incorrect",
            )
        
        # Update last login
        db_user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        access_token = create_access_token(data={"sub": str(db_user.id)})
        
        logger.info(f"Login successful for user {db_user.username}")
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user_id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during direct login: {str(e)}")
        logger.exception("Detailed exception info:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during login: {str(e)}"
        )

# Debug endpoint to add a test user
@app.post("/debug-add-user")
async def debug_add_user(user_data: dict = Body(...), db: Session = Depends(get_db)):
    try:
        # Get user data from request
        username = user_data.get("username")
        email = user_data.get("email")
        password = user_data.get("password")
        
        if not username or not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing username, email, or password"
            )
        
        logger.info(f"Checking if user exists: {username}, {email}")
        
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            logger.info(f"User already exists: {existing_user.username}, {existing_user.email}")
            return {
                "message": "User already exists",
                "user": {
                    "id": existing_user.id,
                    "username": existing_user.username,
                    "email": existing_user.email
                }
            }
        
        # Create new user
        logger.info(f"Creating new user: {username}, {email}")
        hashed_password = hash_password(password)
        
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            created_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Created new user with ID: {new_user.id}")
        
        # Return the new user
        return {
            "message": "User created successfully",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during debug-add-user: {str(e)}")
        logger.exception("Detailed exception info:")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during user creation: {str(e)}"
        )

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Forex & Crypto Trading Journal API"}

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok", 
        "message": "API is running and healthy",
        "version": "1.0.0"
    } 