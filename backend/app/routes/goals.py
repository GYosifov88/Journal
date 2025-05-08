from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.database import get_db
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, PeriodType
from app.models.goal import Goal
from app.models.user import User
from app.auth.jwt import get_current_user

router = APIRouter()

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create goal
    db_goal = Goal(
        user_id=current_user.id,
        period_type=goal.period_type.value,
        start_date=goal.start_date,
        end_date=goal.end_date,
        profit_target=goal.profit_target,
        trades_target=goal.trades_target,
        win_rate_target=goal.win_rate_target,
        other_targets=goal.other_targets,
        notes=goal.notes
    )
    
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return db_goal

@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    period_type: Optional[PeriodType] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    
    # Apply filters if provided
    if period_type:
        query = query.filter(Goal.period_type == period_type.value)
    
    if start_date:
        query = query.filter(Goal.start_date >= start_date)
    
    if end_date:
        query = query.filter(Goal.end_date <= end_date)
    
    # Order by start date (newest first)
    query = query.order_by(Goal.start_date.desc())
    
    return query.all()

@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal

@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Update goal fields if provided
    if goal_update.period_type is not None:
        goal.period_type = goal_update.period_type.value
    
    if goal_update.start_date is not None:
        goal.start_date = goal_update.start_date
    
    if goal_update.end_date is not None:
        goal.end_date = goal_update.end_date
    
    if goal_update.profit_target is not None:
        goal.profit_target = goal_update.profit_target
    
    if goal_update.trades_target is not None:
        goal.trades_target = goal_update.trades_target
    
    if goal_update.win_rate_target is not None:
        goal.win_rate_target = goal_update.win_rate_target
    
    if goal_update.other_targets is not None:
        goal.other_targets = goal_update.other_targets
    
    if goal_update.notes is not None:
        goal.notes = goal_update.notes
    
    db.commit()
    db.refresh(goal)
    
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(goal)
    db.commit()
    
    return None 