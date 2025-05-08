from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class AnalysisBase(BaseModel):
    analysis_type: str
    result_data: Dict[str, Any]

class AnalysisCreate(AnalysisBase):
    pass

class AnalysisResponse(AnalysisBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PerformanceOverview(BaseModel):
    total_trades: int
    win_count: int
    loss_count: int
    open_count: int
    win_rate: float
    avg_profit: float
    avg_loss: float
    avg_risk_reward: float
    largest_profit: float
    largest_loss: float
    trading_period: Dict[str, Any]

class PatternAnalysis(BaseModel):
    patterns: List[Dict[str, Any]]
    correlations: List[Dict[str, Any]]
    time_analysis: Dict[str, Any]

class Recommendation(BaseModel):
    title: str
    description: str
    confidence: float
    category: str

class AnalysisRecommendations(BaseModel):
    recommendations: List[Recommendation] 