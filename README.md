# MarketProb AI: Stock & Crypto Prediction Engine

## Overview
MarketProb AI is a sophisticated financial analysis tool that uses:
1.  **Machine Learning (Random Forest / LSTM)** to predict short-term price trends.
2.  **Monte Carlo Simulations** to generate thousands of possible future scenarios.
3.  **Probability Engine** to calculate specific risk/reward probabilities (e.g., "65% chance of >5% gain").

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts (Glassmorphism UI).
- **Backend**: Python, FastAPI, NumPy, Scikit-Learn (or PyTorch).
- **Data**: yfinance (Yahoo Finance API).

## How to Run

### 1. Backend (Python API)
Navigate to the `backend` folder and run:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
*Server starts at: http://localhost:8000*

### 2. Frontend (React App)
Navigate to the `frontend` folder and run:
```bash
npm install
npm run dev
```
*App starts at: http://localhost:5173*

## Usage
1.  Open **http://localhost:5173**.
2.  Enter a ticker (e.g., `BTC-USD`, `ETH-USD`, `AAPL`).
3.  Click **Run Simulation**.
4.  View the **Price Prediction**, **Volatility**, and **Monte Carlo Confidence Clouds**.
