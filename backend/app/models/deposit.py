from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    amount = Column(Numeric(18, 8), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text)
    
    # Relationships
    account = relationship("Account", back_populates="deposits") 