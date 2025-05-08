from sqlalchemy import Column, Integer, String, DateTime, Date, Numeric, ForeignKey, Text, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    period_type = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    profit_target = Column(Numeric(10, 2), nullable=True)
    trades_target = Column(Integer, nullable=True)
    win_rate_target = Column(Numeric(5, 2), nullable=True)
    other_targets = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("period_type IN ('WEEKLY', 'MONTHLY', 'YEARLY')"),
    )
    
    # Relationships
    user = relationship("User", back_populates="goals") 