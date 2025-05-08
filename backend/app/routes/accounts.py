from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from app.models.account import Account
from app.models.user import User
from app.auth.jwt import get_current_user

router = APIRouter()

@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_account = Account(
        user_id=current_user.id,
        name=account.name,
        currency=account.currency,
        initial_balance=account.initial_balance,
        current_balance=account.initial_balance
    )
    
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    return db_account

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Account).filter(Account.user_id == current_user.id).all()

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not db_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    return db_account

@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    account: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not db_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Update account fields if provided
    if account.name is not None:
        db_account.name = account.name
    
    if account.currency is not None:
        db_account.currency = account.currency
    
    db.commit()
    db.refresh(db_account)
    
    return db_account

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()
    
    if not db_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Check if there are trades or deposits linked to this account
    if db_account.trades or db_account.deposits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete account with existing trades or deposits"
        )
    
    db.delete(db_account)
    db.commit()
    
    return None 