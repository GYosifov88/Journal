from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal

class DepositBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    date: datetime
    notes: Optional[str] = None
    
    @validator('amount')
    def validate_amount(cls, v):
        return round(v, 8)

class DepositCreate(DepositBase):
    pass

class DepositUpdate(BaseModel):
    amount: Optional[Decimal] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None
    
    @validator('amount')
    def validate_amount(cls, v):
        if v is not None:
            return round(v, 8)
        return v

class DepositResponse(DepositBase):
    id: int
    account_id: int
    
    class Config:
        from_attributes = True 