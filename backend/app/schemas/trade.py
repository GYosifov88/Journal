from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

class Direction(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class WinLoss(str, Enum):
    WIN = "WIN"
    LOSS = "LOSS"
    OPEN = "OPEN"

class TradeBase(BaseModel):
    currency_pair: str = Field(..., min_length=2, max_length=20)
    position_size: Decimal = Field(..., gt=0)
    direction: Direction
    entry_price: Decimal = Field(..., gt=0)
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    
    @validator('position_size', 'entry_price', 'stop_loss', 'take_profit')
    def validate_decimal_fields(cls, v):
        if v is not None:
            return round(v, 8)
        return v

class TradeCreate(TradeBase):
    date_open: datetime
    
class TradeUpdate(BaseModel):
    date_open: Optional[datetime] = None
    currency_pair: Optional[str] = None
    position_size: Optional[Decimal] = None
    direction: Optional[Direction] = None
    entry_price: Optional[Decimal] = None
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    exit_price: Optional[Decimal] = None
    win_loss: Optional[WinLoss] = None
    
    @validator('position_size', 'entry_price', 'stop_loss', 'take_profit', 'exit_price')
    def validate_decimal_fields(cls, v):
        if v is not None:
            return round(v, 8)
        return v

class TradeClose(BaseModel):
    date_closed: datetime
    exit_price: Decimal = Field(..., gt=0)
    win_loss: WinLoss
    
    @validator('exit_price')
    def validate_exit_price(cls, v):
        return round(v, 8)

class TradeResponse(TradeBase):
    id: int
    account_id: int
    date_open: datetime
    date_closed: Optional[datetime] = None
    exit_price: Optional[Decimal] = None
    risk_reward: Optional[Decimal] = None
    win_loss: Optional[WinLoss] = None
    profit_amount: Optional[Decimal] = None
    loss_amount: Optional[Decimal] = None
    profit_percentage: Optional[Decimal] = None
    loss_percentage: Optional[Decimal] = None
    balance_after: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 