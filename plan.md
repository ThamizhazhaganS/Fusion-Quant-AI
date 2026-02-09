# Implementation Plan: Stock/Crypto Probability Predictor

## Workflow Analysis
Based on the provided diagram, the application will follow this pipeline:

1.  **Data Ingestion**: Fetch historical stock/crypto data using `yfinance`.
2.  **LSTM Processing**: 
    - Preprocess and scale the data.
    - Feed data into an LSTM (Long Short-Term Memory) model.
    - The LSTM model will be used to understand the underlying trends and time-series patterns.
3.  **Simulation Input**: The output from the LSTM (predicted trends or feature vectors) will serve as the baseline or input for the simulation.
4.  **Monte Carlo Simulation**: Perform random sampling simulations based on the LSTM outputs to generate a massive number of possible future price paths.
5.  **Probability Calculation**: Analyze the distribution of the simulated paths to calculate the probability of specific outcomes (e.g., "Probability of Price > X").

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS (for the "Wow" aesthetic).
- **Backend**: Python (FastAPI).
- **AI/ML**: TensorFlow/Keras (LSTM), NumPy (Monte Carlo).
- **Data**: yfinance.

## Step-by-Step Implementation

### Phase 1: Backend Core (Python)
1.  **Setup**: Initialize Python environment and install dependencies (`fastapi`, `uvicorn`, `yfinance`, `tensorflow`, `numpy`, `pandas`, `scikit-learn`).
2.  **Data Module**: Create functions to download data from `yfinance`.
3.  **LSTM Module**: 
    - Build a `Sequential` LSTM model.
    - Implement training logic (train on historical, predict future).
4.  **Monte Carlo Module**:
    - Implement the simulation logic taking the LSTM prediction (or trend) and historical volatility.
    - Generate N future paths.
5.  **API**: Expose an endpoint `/predict` that accepts a ticker symbol (e.g., `BTC-USD`, `AAPL`) and returns the probability data and simulation paths.

### Phase 2: Frontend (React)
1.  **Setup**: `npm create vite@latest` with React/JavaScript.
2.  **UI Design**: 
    - Dark mode, glassmorphism dashboard.
    - Input field for Ticker.
    - Interactive Charts (Recharts/Chart.js) to show:
        - Historical Data (Line).
        - LSTM Prediction (Dotted Line).
        - Monte Carlo Cloud (Shaded Area).
3.  **Integration**: Fetch data from the Python backend and display it.

### Phase 3: Refining
1.  Optimize the Monte Carlo speed.
2.  Add specific probability metrics (e.g., "60% chance to hit $100k").
