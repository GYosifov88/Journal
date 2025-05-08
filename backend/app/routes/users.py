from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.models.user import User
from app.auth.jwt import get_current_user
from app.auth.password import hash_password, verify_password

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_info(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if username exists and is not the current user
    if user_update.username and user_update.username != current_user.username:
        db_user = db.query(User).filter(User.username == user_update.username).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username
    
    # Check if email exists and is not the current user
    if user_update.email and user_update.email != current_user.email:
        db_user = db.query(User).filter(User.email == user_update.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.patch("/password")
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not verify_password(password_change.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.password_hash = hash_password(password_change.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"} 