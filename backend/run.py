import uvicorn
from app.db.init_db import create_tables
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    # Create tables if they don't exist
    create_tables()
    
    # Run the application
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=True
    ) 