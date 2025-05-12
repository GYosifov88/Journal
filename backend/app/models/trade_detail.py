from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class TradeDetail(Base):
    __tablename__ = "trade_details"

    id = Column(Integer, primary_key=True, index=True)
    trade_id = Column(Integer, ForeignKey("trades.id"))
    step_1_conditions = Column(Text, nullable=True)
    step_2_bias = Column(Text, nullable=True)
    step_3_narrative = Column(Text, nullable=True)
    step_4_execution = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)
    
    # Relationships
    # trade = relationship("Trade", back_populates="details") 