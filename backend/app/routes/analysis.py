from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
from sqlalchemy import func, desc, and_

from app.db.database import get_db
from app.schemas.analysis import (
    PerformanceOverview, 
    PatternAnalysis, 
    AnalysisRecommendations,
    AnalysisResponse,
    AnalysisCreate
)
from app.models.trade import Trade
from app.models.account import Account
from app.models.user import User
from app.models.analysis_result import AnalysisResult
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/overview", response_model=PerformanceOverview)
async def get_performance_overview(
    account_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Base query with user filter
    query = db.query(Trade).join(Account).filter(Account.user_id == current_user.id)
    
    # Apply additional filters if provided
    if account_id:
        query = query.filter(Trade.account_id == account_id)
    
    if start_date:
        query = query.filter(Trade.date_open >= start_date)
    
    if end_date:
        query = query.filter(Trade.date_open <= end_date)
    
    # Execute query
    trades = query.all()
    
    # Basic stats
    total_trades = len(trades)
    win_count = sum(1 for trade in trades if trade.win_loss == "WIN")
    loss_count = sum(1 for trade in trades if trade.win_loss == "LOSS")
    open_count = sum(1 for trade in trades if trade.win_loss == "OPEN")
    
    # Calculate metrics
    win_rate = win_count / (win_count + loss_count) if (win_count + loss_count) > 0 else 0
    
    # Profit/loss calculations
    profit_trades = [trade for trade in trades if trade.profit_amount is not None]
    loss_trades = [trade for trade in trades if trade.loss_amount is not None]
    
    avg_profit = sum(trade.profit_amount for trade in profit_trades) / len(profit_trades) if profit_trades else 0
    avg_loss = sum(trade.loss_amount for trade in loss_trades) / len(loss_trades) if loss_trades else 0
    
    # Risk/reward calculations
    trades_with_rr = [trade for trade in trades if trade.risk_reward is not None]
    avg_risk_reward = sum(trade.risk_reward for trade in trades_with_rr) / len(trades_with_rr) if trades_with_rr else 0
    
    # Largest profit and loss
    largest_profit = max((trade.profit_amount for trade in profit_trades), default=0)
    largest_loss = max((trade.loss_amount for trade in loss_trades), default=0)
    
    # Trading period
    trading_period = {
        "start": min((trade.date_open for trade in trades), default=None),
        "end": max((trade.date_closed for trade in trades if trade.date_closed), default=None),
    }
    
    # Save analysis to database
    analysis_data = {
        "total_trades": total_trades,
        "win_count": win_count,
        "loss_count": loss_count,
        "open_count": open_count,
        "win_rate": win_rate,
        "avg_profit": float(avg_profit),
        "avg_loss": float(avg_loss),
        "avg_risk_reward": float(avg_risk_reward),
        "largest_profit": float(largest_profit),
        "largest_loss": float(largest_loss),
        "trading_period": {
            "start": trading_period["start"].isoformat() if trading_period["start"] else None,
            "end": trading_period["end"].isoformat() if trading_period["end"] else None,
        }
    }
    
    db_analysis = AnalysisResult(
        user_id=current_user.id,
        analysis_type="performance_overview",
        result_data=analysis_data
    )
    
    db.add(db_analysis)
    db.commit()
    
    return PerformanceOverview(
        total_trades=total_trades,
        win_count=win_count,
        loss_count=loss_count,
        open_count=open_count,
        win_rate=win_rate,
        avg_profit=float(avg_profit),
        avg_loss=float(avg_loss),
        avg_risk_reward=float(avg_risk_reward),
        largest_profit=float(largest_profit),
        largest_loss=float(largest_loss),
        trading_period=trading_period
    )

@router.get("/patterns", response_model=PatternAnalysis)
async def get_pattern_analysis(
    account_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Base query with user filter
    query = db.query(Trade).join(Account).filter(Account.user_id == current_user.id)
    
    # Apply additional filters if provided
    if account_id:
        query = query.filter(Trade.account_id == account_id)
    
    if start_date:
        query = query.filter(Trade.date_open >= start_date)
    
    if end_date:
        query = query.filter(Trade.date_open <= end_date)
    
    # Execute query
    trades = query.all()
    
    # Currency pair analysis
    currency_pairs = {}
    for trade in trades:
        if trade.currency_pair not in currency_pairs:
            currency_pairs[trade.currency_pair] = {
                "total": 0,
                "wins": 0,
                "losses": 0,
                "win_rate": 0,
                "avg_profit": 0,
                "avg_loss": 0,
            }
        
        pair_data = currency_pairs[trade.currency_pair]
        pair_data["total"] += 1
        
        if trade.win_loss == "WIN":
            pair_data["wins"] += 1
            if trade.profit_amount:
                pair_data["avg_profit"] = (pair_data["avg_profit"] * (pair_data["wins"] - 1) + trade.profit_amount) / pair_data["wins"]
        elif trade.win_loss == "LOSS":
            pair_data["losses"] += 1
            if trade.loss_amount:
                pair_data["avg_loss"] = (pair_data["avg_loss"] * (pair_data["losses"] - 1) + trade.loss_amount) / pair_data["losses"]
        
        if pair_data["wins"] + pair_data["losses"] > 0:
            pair_data["win_rate"] = pair_data["wins"] / (pair_data["wins"] + pair_data["losses"])
    
    # Direction analysis
    direction_stats = {
        "LONG": {"total": 0, "wins": 0, "losses": 0, "win_rate": 0},
        "SHORT": {"total": 0, "wins": 0, "losses": 0, "win_rate": 0},
    }
    
    for trade in trades:
        direction = trade.direction
        direction_stats[direction]["total"] += 1
        
        if trade.win_loss == "WIN":
            direction_stats[direction]["wins"] += 1
        elif trade.win_loss == "LOSS":
            direction_stats[direction]["losses"] += 1
        
        wins = direction_stats[direction]["wins"]
        losses = direction_stats[direction]["losses"]
        direction_stats[direction]["win_rate"] = wins / (wins + losses) if (wins + losses) > 0 else 0
    
    # Time-based analysis
    time_analysis = {
        "by_hour": {},
        "by_day": {},
        "by_month": {},
    }
    
    for trade in trades:
        # By hour
        hour = trade.date_open.hour
        if hour not in time_analysis["by_hour"]:
            time_analysis["by_hour"][hour] = {"total": 0, "wins": 0, "losses": 0, "win_rate": 0}
        
        time_analysis["by_hour"][hour]["total"] += 1
        if trade.win_loss == "WIN":
            time_analysis["by_hour"][hour]["wins"] += 1
        elif trade.win_loss == "LOSS":
            time_analysis["by_hour"][hour]["losses"] += 1
        
        wins = time_analysis["by_hour"][hour]["wins"]
        losses = time_analysis["by_hour"][hour]["losses"]
        time_analysis["by_hour"][hour]["win_rate"] = wins / (wins + losses) if (wins + losses) > 0 else 0
        
        # By day
        day = trade.date_open.strftime("%A")
        if day not in time_analysis["by_day"]:
            time_analysis["by_day"][day] = {"total": 0, "wins": 0, "losses": 0, "win_rate": 0}
        
        time_analysis["by_day"][day]["total"] += 1
        if trade.win_loss == "WIN":
            time_analysis["by_day"][day]["wins"] += 1
        elif trade.win_loss == "LOSS":
            time_analysis["by_day"][day]["losses"] += 1
        
        wins = time_analysis["by_day"][day]["wins"]
        losses = time_analysis["by_day"][day]["losses"]
        time_analysis["by_day"][day]["win_rate"] = wins / (wins + losses) if (wins + losses) > 0 else 0
        
        # By month
        month = trade.date_open.strftime("%B")
        if month not in time_analysis["by_month"]:
            time_analysis["by_month"][month] = {"total": 0, "wins": 0, "losses": 0, "win_rate": 0}
        
        time_analysis["by_month"][month]["total"] += 1
        if trade.win_loss == "WIN":
            time_analysis["by_month"][month]["wins"] += 1
        elif trade.win_loss == "LOSS":
            time_analysis["by_month"][month]["losses"] += 1
        
        wins = time_analysis["by_month"][month]["wins"]
        losses = time_analysis["by_month"][month]["losses"]
        time_analysis["by_month"][month]["win_rate"] = wins / (wins + losses) if (wins + losses) > 0 else 0
    
    # Prepare response
    patterns = [
        {"name": "Currency Pair", "data": [{"pair": pair, **stats} for pair, stats in currency_pairs.items()]},
        {"name": "Direction", "data": [{"direction": direction, **stats} for direction, stats in direction_stats.items()]},
    ]
    
    correlations = []
    
    # Save analysis to database
    analysis_data = {
        "patterns": patterns,
        "correlations": correlations,
        "time_analysis": time_analysis
    }
    
    db_analysis = AnalysisResult(
        user_id=current_user.id,
        analysis_type="pattern_analysis",
        result_data=analysis_data
    )
    
    db.add(db_analysis)
    db.commit()
    
    return PatternAnalysis(
        patterns=patterns,
        correlations=correlations,
        time_analysis=time_analysis
    )

@router.get("/recommendations", response_model=AnalysisRecommendations)
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all trades for the user
    trades = db.query(Trade).join(Account).filter(Account.user_id == current_user.id).all()
    
    # If no trades, return empty recommendations
    if not trades:
        return AnalysisRecommendations(recommendations=[])
    
    recommendations = []
    
    # Check win rate
    win_count = sum(1 for trade in trades if trade.win_loss == "WIN")
    loss_count = sum(1 for trade in trades if trade.win_loss == "LOSS")
    
    if win_count + loss_count > 0:
        win_rate = win_count / (win_count + loss_count)
        
        if win_rate < 0.3:
            recommendations.append({
                "title": "Low Win Rate",
                "description": "Your win rate is below 30%. Consider reviewing your trading strategy or focusing on the currency pairs with higher win rates.",
                "confidence": 0.9,
                "category": "Performance"
            })
        elif win_rate > 0.7:
            recommendations.append({
                "title": "Excellent Win Rate",
                "description": "Your win rate is above 70%. Consider increasing your position sizes to maximize profits.",
                "confidence": 0.9,
                "category": "Performance"
            })
    
    # Check risk/reward ratio
    trades_with_rr = [trade for trade in trades if trade.risk_reward is not None]
    if trades_with_rr:
        avg_rr = sum(trade.risk_reward for trade in trades_with_rr) / len(trades_with_rr)
        
        if avg_rr < 1.0:
            recommendations.append({
                "title": "Low Risk/Reward Ratio",
                "description": "Your average risk/reward ratio is below 1:1. Consider adjusting your take profit and stop loss levels to aim for at least 1:2.",
                "confidence": 0.8,
                "category": "Risk Management"
            })
    
    # Check if they're trading too many pairs
    currency_pairs = {trade.currency_pair for trade in trades}
    if len(currency_pairs) > 10 and len(trades) < 50:
        recommendations.append({
            "title": "Too Many Currency Pairs",
            "description": "You're trading too many different currency pairs relative to your total trade count. Consider focusing on fewer pairs to develop expertise.",
            "confidence": 0.7,
            "category": "Strategy"
        })
    
    # Check for overtrading
    if len(trades) > 50:
        trade_days = {trade.date_open.date() for trade in trades}
        if len(trades) / len(trade_days) > 5:
            recommendations.append({
                "title": "Potential Overtrading",
                "description": "You're averaging more than 5 trades per trading day. Consider quality over quantity and being more selective.",
                "confidence": 0.6,
                "category": "Behavior"
            })
    
    # Save analysis to database
    analysis_data = {
        "recommendations": recommendations
    }
    
    db_analysis = AnalysisResult(
        user_id=current_user.id,
        analysis_type="recommendations",
        result_data=analysis_data
    )
    
    db.add(db_analysis)
    db.commit()
    
    return AnalysisRecommendations(recommendations=recommendations)

@router.get("/history", response_model=List[AnalysisResponse])
async def get_analysis_history(
    analysis_type: Optional[str] = None,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AnalysisResult).filter(AnalysisResult.user_id == current_user.id)
    
    if analysis_type:
        query = query.filter(AnalysisResult.analysis_type == analysis_type)
    
    query = query.order_by(desc(AnalysisResult.created_at)).limit(limit)
    
    return query.all() 