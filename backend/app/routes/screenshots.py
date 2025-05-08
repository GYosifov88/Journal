from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from uuid import uuid4
from datetime import datetime

from app.db.database import get_db
from app.schemas.screenshot import ScreenshotType, ScreenshotResponse
from app.models.trade_screenshot import TradeScreenshot
from app.models.trade import Trade
from app.models.account import Account
from app.models.user import User
from app.auth.jwt import get_current_user

router = APIRouter()

# Configure screenshots directory
UPLOAD_DIR = "uploads/screenshots"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/trades/{trade_id}/screenshots", response_model=ScreenshotResponse, status_code=status.HTTP_201_CREATED)
async def upload_screenshot(
    trade_id: int,
    screenshot_type: ScreenshotType = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if trade exists and belongs to user
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found"
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and GIF images are allowed"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_extension}"
    
    # Create user-specific directory
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    
    # Create trade-specific directory
    trade_dir = os.path.join(user_dir, str(trade_id))
    os.makedirs(trade_dir, exist_ok=True)
    
    # Save the file
    file_path = os.path.join(trade_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create screenshot record
    db_screenshot = TradeScreenshot(
        trade_id=trade_id,
        screenshot_type=screenshot_type.value,
        file_path=file_path
    )
    
    db.add(db_screenshot)
    db.commit()
    db.refresh(db_screenshot)
    
    return db_screenshot

@router.get("/trades/{trade_id}/screenshots", response_model=List[ScreenshotResponse])
async def get_trade_screenshots(
    trade_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if trade exists and belongs to user
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found"
        )
    
    return db.query(TradeScreenshot).filter(TradeScreenshot.trade_id == trade_id).all()

@router.get("/screenshots/{screenshot_id}")
async def get_screenshot(
    screenshot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get screenshot with user check
    screenshot = db.query(TradeScreenshot).join(Trade).join(Account).filter(
        TradeScreenshot.id == screenshot_id,
        Account.user_id == current_user.id
    ).first()
    
    if not screenshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot not found"
        )
    
    # Check if file exists
    if not os.path.isfile(screenshot.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot file not found"
        )
    
    return FileResponse(screenshot.file_path)

@router.delete("/screenshots/{screenshot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_screenshot(
    screenshot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get screenshot with user check
    screenshot = db.query(TradeScreenshot).join(Trade).join(Account).filter(
        TradeScreenshot.id == screenshot_id,
        Account.user_id == current_user.id
    ).first()
    
    if not screenshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot not found"
        )
    
    # Delete file if it exists
    if os.path.isfile(screenshot.file_path):
        os.remove(screenshot.file_path)
    
    # Delete record
    db.delete(screenshot)
    db.commit()
    
    return None 