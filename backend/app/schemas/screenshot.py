from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ScreenshotType(str, Enum):
    HTF = "HTF"
    BEFORE = "BEFORE"
    AFTER = "AFTER"
    OTHER = "OTHER"

class ScreenshotBase(BaseModel):
    screenshot_type: ScreenshotType

class ScreenshotCreate(ScreenshotBase):
    # The file data will be handled separately in the endpoint
    pass

class ScreenshotUpdate(BaseModel):
    screenshot_type: Optional[ScreenshotType] = None

class ScreenshotResponse(ScreenshotBase):
    id: int
    trade_id: int
    file_path: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True 