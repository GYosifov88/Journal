from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal

class AccountBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    currency: str = Field(..., min_length=2, max_length=10)

class AccountCreate(AccountBase):
    initial_balance: Decimal = Field(..., gt=0)
    
    @validator('initial_balance')
    def validate_initial_balance(cls, v):
        return round(v, 8)

class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    currency: Optional[str] = Field(None, min_length=2, max_length=10)

class AccountResponse(AccountBase):
    id: int
    user_id: int
    initial_balance: Decimal
    current_balance: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True 