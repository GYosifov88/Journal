from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.db.database import get_db
from app.schemas.deposit import DepositCreate, DepositUpdate, DepositResponse
from app.models.deposit import Deposit
from app.models.account import Account
from app.models.user import User
from app.auth.jwt import get_current_user

router = APIRouter()

@router.post("/accounts/{account_id}/deposits", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    account_id: int,
    deposit: DepositCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if account exists and belongs to user
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Create deposit
    db_deposit = Deposit(
        account_id=account_id,
        amount=deposit.amount,
        date=deposit.date,
        notes=deposit.notes
    )
    
    # Update account balance
    account.current_balance += Decimal(deposit.amount)
    
    db.add(db_deposit)
    db.commit()
    db.refresh(db_deposit)
    
    return db_deposit

@router.get("/accounts/{account_id}/deposits", response_model=List[DepositResponse])
async def get_account_deposits(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if account exists and belongs to user
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    return db.query(Deposit).filter(Deposit.account_id == account_id).all()

@router.get("/deposits/{deposit_id}", response_model=DepositResponse)
async def get_deposit(
    deposit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get deposit with account check
    deposit = db.query(Deposit).join(Account).filter(
        Deposit.id == deposit_id,
        Account.user_id == current_user.id
    ).first()
    
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )
    
    return deposit

@router.put("/deposits/{deposit_id}", response_model=DepositResponse)
async def update_deposit(
    deposit_id: int,
    deposit_update: DepositUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get deposit with account check
    deposit = db.query(Deposit).join(Account).filter(
        Deposit.id == deposit_id,
        Account.user_id == current_user.id
    ).first()
    
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )
    
    # Store original amount for balance adjustment
    original_amount = deposit.amount
    
    # Update deposit fields if provided
    if deposit_update.amount is not None:
        deposit.amount = deposit_update.amount
    
    if deposit_update.date is not None:
        deposit.date = deposit_update.date
    
    if deposit_update.notes is not None:
        deposit.notes = deposit_update.notes
    
    # Adjust account balance if amount changed
    if deposit_update.amount is not None and deposit_update.amount != original_amount:
        account = db.query(Account).filter(Account.id == deposit.account_id).first()
        account.current_balance = account.current_balance - original_amount + deposit_update.amount
    
    db.commit()
    db.refresh(deposit)
    
    return deposit

@router.delete("/deposits/{deposit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deposit(
    deposit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get deposit with account check
    deposit = db.query(Deposit).join(Account).filter(
        Deposit.id == deposit_id,
        Account.user_id == current_user.id
    ).first()
    
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )
    
    # Adjust account balance
    account = db.query(Account).filter(Account.id == deposit.account_id).first()
    account.current_balance -= deposit.amount
    
    db.delete(deposit)
    db.commit()
    
    return None 