# Forex & Crypto Trading Journal

A comprehensive platform designed to help traders track, analyze, and improve their trading performance.

## Features

- **Trade Entry & Management**: Complete trade logging with extensive metadata
- **Portfolio Management**: Track invested capital and account balance over time
- **Goal Setting & Tracking**: Set and monitor trading goals across different timeframes
- **Performance Analytics**: Comprehensive statistics and performance metrics
- **AI-Powered Analysis**: Identify patterns in trading behavior and provide actionable insights
- **Visual Documentation**: Upload and store screenshots of trades at different stages

## Tech Stack

### Backend

- Framework: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy
- Authentication: JWT

### Frontend

- Framework: React
- State Management: Redux Toolkit
- UI: Material-UI
- Form Handling: Formik + Yup

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: 
     ```
     venv\Scripts\activate
     ```
   - Linux/Mac: 
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file based on the `env.example` file:
   ```
   cp env.example .env
   ```

6. Run the application:
   ```
   python run.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Project Structure

```
project/
├── backend/               # FastAPI backend
│   ├── app/               # Main application directory
│   │   ├── auth/          # Authentication related code
│   │   ├── db/            # Database configuration
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── requirements.txt   # Python dependencies
│   └── run.py             # Application entry point
└── frontend/              # React frontend
    ├── public/            # Static files
    └── src/               # Source code
        ├── assets/        # Static assets
        ├── components/    # React components
        ├── pages/         # Page components
        ├── services/      # API services
        ├── store/         # Redux store
        └── utils/         # Utility functions
```

## License

This project is licensed under the MIT License. 