from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, users, accounts, trades, deposits, trade_details, screenshots, goals, analysis

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