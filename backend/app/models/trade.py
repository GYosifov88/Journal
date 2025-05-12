from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    date_open = Column(DateTime(timezone=True), nullable=False)
    date_closed = Column(DateTime(timezone=True), nullable=True)
    currency_pair = Column(String(20), nullable=False)
    position_size = Column(Numeric(18, 8), nullable=False)
    direction = Column(String(10), nullable=False)
    entry_price = Column(Numeric(18, 8), nullable=False)
    stop_loss = Column(Numeric(18, 8), nullable=True)
    take_profit = Column(Numeric(18, 8), nullable=True)
    exit_price = Column(Numeric(18, 8), nullable=True)
    risk_reward = Column(Numeric(10, 2), nullable=True)
    win_loss = Column(String(10), nullable=True)
    profit_amount = Column(Numeric(18, 8), nullable=True)
    loss_amount = Column(Numeric(18, 8), nullable=True)
    profit_percentage = Column(Numeric(10, 2), nullable=True)
    loss_percentage = Column(Numeric(10, 2), nullable=True)
    balance_after = Column(Numeric(18, 8), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint("direction IN ('LONG', 'SHORT')"),
        CheckConstraint("win_loss IN ('WIN', 'LOSS', 'OPEN')"),
    )
    
    # Relationships
    # account = relationship("Account", back_populates="trades")
    # details = relationship("TradeDetail", back_populates="trade", uselist=False)
    # screenshots = relationship("TradeScreenshot", back_populates="trade") 