from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, users, accounts, trades, deposits, trade_details, screenshots, goals, analysis
from app.db.database import SessionLocal
from app.db.test_data import create_test_user
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="Forex & Crypto Trading Journal API",
    description="API for tracking and analyzing trading performance",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create test user on startup
@app.on_event("startup")
async def startup_db_client():
    logging.info("Application startup: Creating test user if needed")
    db = SessionLocal()
    try:
        create_test_user(db)
    finally:
        db.close()
    logging.info("Startup complete")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(trades.router, prefix="/api/trades", tags=["Trades"])
app.include_router(deposits.router, prefix="/api/deposits", tags=["Deposits"])
app.include_router(trade_details.router, prefix="/api/trade-details", tags=["Trade Details"])
app.include_router(screenshots.router, prefix="/api/screenshots", tags=["Screenshots"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Forex & Crypto Trading Journal API"} 

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "message": "API is running and healthy",
        "version": "1.0.0"
    } 