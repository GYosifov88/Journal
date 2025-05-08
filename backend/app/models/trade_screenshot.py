from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class TradeScreenshot(Base):
    __tablename__ = "trade_screenshots"

    id = Column(Integer, primary_key=True, index=True)
    trade_id = Column(Integer, ForeignKey("trades.id"))
    screenshot_type = Column(String(20), nullable=False)
    file_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("screenshot_type IN ('HTF', 'BEFORE', 'AFTER', 'OTHER')"),
    )
    
    # Relationships
    trade = relationship("Trade", back_populates="screenshots") 