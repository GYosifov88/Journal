from pydantic import BaseModel
from typing import Optional

class TradeDetailBase(BaseModel):
    step_1_conditions: Optional[str] = None
    step_2_bias: Optional[str] = None
    step_3_narrative: Optional[str] = None
    step_4_execution: Optional[str] = None
    comments: Optional[str] = None

class TradeDetailCreate(TradeDetailBase):
    pass

class TradeDetailUpdate(TradeDetailBase):
    pass

class TradeDetailResponse(TradeDetailBase):
    id: int
    trade_id: int
    
    class Config:
        from_attributes = True 