from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    initial_balance = Column(Numeric(18, 8), nullable=False)
    current_balance = Column(Numeric(18, 8), nullable=False)
    currency = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="accounts")
    trades = relationship("Trade", back_populates="account")
    deposits = relationship("Deposit", back_populates="account") 