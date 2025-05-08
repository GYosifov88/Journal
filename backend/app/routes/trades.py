from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from app.db.database import get_db
from app.schemas.trade import TradeCreate, TradeUpdate, TradeResponse, TradeClose
from app.models.trade import Trade
from app.models.account import Account
from app.models.user import User
from app.auth.jwt import get_current_user

router = APIRouter()

def calculate_risk_reward(direction, entry_price, stop_loss, take_profit):
    if not stop_loss or not take_profit:
        return None
    
    if direction == "LONG":
        risk = entry_price - stop_loss
        reward = take_profit - entry_price
    else:  # SHORT
        risk = stop_loss - entry_price
        reward = entry_price - take_profit
    
    if risk <= 0:
        return None
    
    return round(reward / risk, 2)

@router.post("/accounts/{account_id}/trades", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(
    account_id: int,
    trade: TradeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if account exists and belongs to user
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Calculate risk/reward ratio
    risk_reward = calculate_risk_reward(
        trade.direction.value,
        trade.entry_price,
        trade.stop_loss,
        trade.take_profit
    )
    
    # Create trade
    db_trade = Trade(
        account_id=account_id,
        date_open=trade.date_open,
        currency_pair=trade.currency_pair,
        position_size=trade.position_size,
        direction=trade.direction.value,
        entry_price=trade.entry_price,
        stop_loss=trade.stop_loss,
        take_profit=trade.take_profit,
        risk_reward=risk_reward,
        win_loss="OPEN"
    )
    
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    
    return db_trade

@router.get("/accounts/{account_id}/trades", response_model=List[TradeResponse])
async def get_account_trades(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if account exists and belongs to user
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    return db.query(Trade).filter(Trade.account_id == account_id).all()

@router.get("/trades/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get trade with account check
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found"
        )
    
    return trade

@router.put("/trades/{trade_id}", response_model=TradeResponse)
async def update_trade(
    trade_id: int,
    trade_update: TradeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get trade with account check
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found"
        )
    
    # Update trade fields if provided
    if trade_update.date_open is not None:
        trade.date_open = trade_update.date_open
    
    if trade_update.currency_pair is not None:
        trade.currency_pair = trade_update.currency_pair
    
    if trade_update.position_size is not None:
        trade.position_size = trade_update.position_size
    
    if trade_update.direction is not None:
        trade.direction = trade_update.direction.value
    
    if trade_update.entry_price is not None:
        trade.entry_price = trade_update.entry_price
    
    if trade_update.stop_loss is not None:
        trade.stop_loss = trade_update.stop_loss
    
    if trade_update.take_profit is not None:
        trade.take_profit = trade_update.take_profit
    
    # Recalculate risk/reward ratio if relevant fields changed
    if (trade_update.direction is not None or 
        trade_update.entry_price is not None or 
        trade_update.stop_loss is not None or 
        trade_update.take_profit is not None):
        
        trade.risk_reward = calculate_risk_reward(
            trade.direction,
            trade.entry_price,
            trade.stop_loss,
            trade.take_profit
        )
    
    db.commit()
    db.refresh(trade)
    
    return trade

@router.patch("/trades/{trade_id}/close", response_model=TradeResponse)
async def close_trade(
    trade_id: int,
    trade_close: TradeClose,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get trade with account check
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found"
        )
    
    # Check if trade is already closed
    if trade.date_closed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trade is already closed"
        )
    
    # Update trade with closing data
    trade.date_closed = trade_close.date_closed
    trade.exit_price = trade_close.exit_price
    trade.win_loss = trade_close.win_loss.value
    
    # Calculate profit/loss
    account = db.query(Account).filter(Account.id == trade.account_id).first()
    position_size = Decimal(trade.position_size)
    entry_price = Decimal(trade.entry_price)
    exit_price = Decimal(trade_close.exit_price)
    
    if trade.direction == "LONG":
        if exit_price > entry_price:  # Profit
            profit_amount = position_size * (exit_price - entry_price)
            trade.profit_amount = profit_amount
            trade.profit_percentage = (exit_price / entry_price - 1) * 100
            account.current_balance += profit_amount
        else:  # Loss
            loss_amount = position_size * (entry_price - exit_price)
            trade.loss_amount = loss_amount
            trade.loss_percentage = (1 - exit_price / entry_price) * 100
            account.current_balance -= loss_amount
    else:  # SHORT
        if exit_price < entry_price:  # Profit
            profit_amount = position_size * (entry_price - exit_price)
            trade.profit_amount = profit_amount
            trade.profit_percentage = (1 - exit_price / entry_price) * 100
            account.current_balance += profit_amount
        else:  # Loss
            loss_amount = position_size * (exit_price - entry_price)
            trade.loss_amount = loss_amount
            trade.loss_percentage = (exit_price / entry_price - 1) * 100
            account.current_balance -= loss_amount
    
    # Update balance after trade
    trade.balance_after = account.current_balance
    
    db.commit()
    db.refresh(trade)
    
    return trade

@router.delete("/trades/{trade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trade(
    trade_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get trade with account check
    trade = db.query(Trade).join(Account).filter(
        Trade.id == trade_id,
        Account.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found"
        )
    
    # If trade was closed and had profit/loss, adjust account balance back
    if trade.date_closed:
        account = db.query(Account).filter(Account.id == trade.account_id).first()
        
        if trade.profit_amount:
            account.current_balance -= trade.profit_amount
        elif trade.loss_amount:
            account.current_balance += trade.loss_amount
    
    # Delete related records (done automatically with cascade delete in DB)
    db.delete(trade)
    db.commit()
    
    return None 