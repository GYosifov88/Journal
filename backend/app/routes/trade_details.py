from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.trade_detail import TradeDetailCreate, TradeDetailUpdate, TradeDetailResponse
from app.models.trade_detail import TradeDetail
from app.models.trade import Trade
from app.models.account import Account
from app.models.user import User
from app.auth.jwt import get_current_user

router = APIRouter()

@router.post("/trades/{trade_id}/details", response_model=TradeDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_trade_details(
    trade_id: int,
    trade_detail: TradeDetailCreate,
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
    
    # Check if trade details already exist
    existing_details = db.query(TradeDetail).filter(TradeDetail.trade_id == trade_id).first()
    if existing_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trade details already exist for this trade"
        )
    
    # Create trade details
    db_trade_detail = TradeDetail(
        trade_id=trade_id,
        step_1_conditions=trade_detail.step_1_conditions,
        step_2_bias=trade_detail.step_2_bias,
        step_3_narrative=trade_detail.step_3_narrative,
        step_4_execution=trade_detail.step_4_execution,
        comments=trade_detail.comments
    )
    
    db.add(db_trade_detail)
    db.commit()
    db.refresh(db_trade_detail)
    
    return db_trade_detail

@router.get("/trades/{trade_id}/details", response_model=TradeDetailResponse)
async def get_trade_details(
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
    
    # Get trade details
    trade_detail = db.query(TradeDetail).filter(TradeDetail.trade_id == trade_id).first()
    
    if not trade_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade details not found"
        )
    
    return trade_detail

@router.put("/trades/{trade_id}/details", response_model=TradeDetailResponse)
async def update_trade_details(
    trade_id: int,
    trade_detail_update: TradeDetailUpdate,
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
    
    # Get trade details
    trade_detail = db.query(TradeDetail).filter(TradeDetail.trade_id == trade_id).first()
    
    if not trade_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade details not found"
        )
    
    # Update trade details fields if provided
    if trade_detail_update.step_1_conditions is not None:
        trade_detail.step_1_conditions = trade_detail_update.step_1_conditions
    
    if trade_detail_update.step_2_bias is not None:
        trade_detail.step_2_bias = trade_detail_update.step_2_bias
    
    if trade_detail_update.step_3_narrative is not None:
        trade_detail.step_3_narrative = trade_detail_update.step_3_narrative
    
    if trade_detail_update.step_4_execution is not None:
        trade_detail.step_4_execution = trade_detail_update.step_4_execution
    
    if trade_detail_update.comments is not None:
        trade_detail.comments = trade_detail_update.comments
    
    db.commit()
    db.refresh(trade_detail)
    
    return trade_detail 