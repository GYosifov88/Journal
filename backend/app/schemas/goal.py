from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

class PeriodType(str, Enum):
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"

class GoalBase(BaseModel):
    period_type: PeriodType
    start_date: date
    end_date: date
    profit_target: Optional[Decimal] = None
    trades_target: Optional[int] = None
    win_rate_target: Optional[Decimal] = None
    other_targets: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('profit_target', 'win_rate_target')
    def validate_decimal_fields(cls, v):
        if v is not None:
            return round(v, 2)
        return v
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    period_type: Optional[PeriodType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    profit_target: Optional[Decimal] = None
    trades_target: Optional[int] = None
    win_rate_target: Optional[Decimal] = None
    other_targets: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('profit_target', 'win_rate_target')
    def validate_decimal_fields(cls, v):
        if v is not None:
            return round(v, 2)
        return v
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v is not None and 'start_date' in values and values['start_date'] is not None and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True 