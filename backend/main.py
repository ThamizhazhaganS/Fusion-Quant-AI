from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from data_loader import fetch_data
from model_engine import run_prediction_pipeline, monte_carlo_simulation
import pandas as pd
import numpy as np
import yfinance as yf
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.isdir(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

def get_simple_sentiment(ticker: str):
    """
    Very basic keyword-based sentiment analysis from yfinance headlines.
    Updated for new yfinance structure.
    """
    try:
        t = yf.Ticker(ticker)
        news = t.news
        if not news:
            return 50 # Neutral
        
        bull_words = ['up', 'rise', 'growth', 'gain', 'high', 'bull', 'buy', 'positive', 'surge', 'jump', 'profit', 'outperform', 'upgrade', 'beat']
        bear_words = ['down', 'drop', 'fall', 'loss', 'low', 'bear', 'sell', 'negative', 'crash', 'plunge', 'risk', 'underperform', 'downgrade', 'miss']
        
        score = 0
        for n in news:
            try:
                # yfinance structure: title is inside 'content'
                title = n.get('content', {}).get('title', '').lower()
                if not title: continue
                
                for w in bull_words:
                    if w in title: score += 1
                for w in bear_words:
                    if w in title: score -= 1
            except:
                continue
        
        # Normalize to 0-100 with more granularity (multiplier 5 instead of 10)
        sentiment = 50 + (score * 5)
        return max(0, min(100, sentiment))
    except:
        return 50

@app.get("/predict/{ticker}")
def predict(ticker: str, vol_multiplier: float = Query(1.0, gt=0, lt=5)):
    try:
        # 1. Fetch Data (Updated with real-time TV data)
        df = fetch_data(ticker)
        if df is None:
            raise HTTPException(status_code=404, detail="Ticker not found or data unavailable")
        
        # 2. Run Advanced ML Pipeline
        metrics = run_prediction_pipeline(df)
        
        # 3. Get Sentiment
        sentiment = get_simple_sentiment(ticker)
        
        # 4. Run Monte Carlo Simulation with Multiplier
        sim_days = 30
        sim_df = monte_carlo_simulation(
            metrics["last_close"], 
            metrics["volatility"], 
            days=sim_days, 
            simulations=100,
            vol_multiplier=vol_multiplier
        )

        # 5. AI Fusion Signal Aggregator
        def get_fusion_signal(m, s):
            score = 0
            if m['prediction'] > m['last_close']: score += 1
            if m['prediction'] > m['last_close'] * 1.02: score += 1
            if m['rsi'] < 35: score += 2
            elif m['rsi'] > 65: score -= 2
            if s > 65: score += 1
            if s < 35: score -= 1
            
            if score >= 3: return "Strong Buy"
            if score >= 1: return "Buy"
            if score <= -3: return "Strong Sell"
            if score <= -1: return "Sell"
            return "Neutral"

        fusion_signal = get_fusion_signal(metrics, sentiment)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    # Process format for Frontend
    sim_data = []
    # Ensure sim_df is a plain DataFrame and flatten it if needed
    for i in range(len(sim_df)):
        row = sim_df.iloc[i]
        sim_data.append({
            "day": int(i),
            "mean": float(row.mean()),
            "p90": float(row.quantile(0.9)),
            "p10": float(row.quantile(0.1))
        })
        
    # Robustly extract historical data
    temp_df = df.copy()
    if isinstance(temp_df.columns, pd.MultiIndex):
        temp_df.columns = temp_df.columns.get_level_values(0)
    
    hist_subset = temp_df[['Close']].copy()
    hist_subset.reset_index(inplace=True)
    hist_subset.columns = ['Date', 'Close']
    
    # Convert Date to string for JSON safety
    hist_subset['Date'] = hist_subset['Date'].astype(str)
    
    # Ensure Close is float
    hist_subset['Close'] = hist_subset['Close'].astype(float)
    
    formatted_hist = hist_subset.to_dict(orient='records')[-365:]

    # Probability Calculation
    final_prices = sim_df.iloc[-1]
    target_price = float(metrics["last_close"]) * 1.05
    # Use float() to ensure native type
    prob_increase = float((final_prices > target_price).mean() * 100)

    return {
        "ticker": str(ticker),
        "last_close": float(metrics["last_close"]),
        "predicted_next_day_lstm": float(metrics["prediction"]), 
        "volatility": float(metrics["volatility"]),
        "rsi": float(metrics["rsi"]),
        "macd": float(metrics["macd"]),
        "sentiment": int(sentiment),
        "fusion_signal": fusion_signal,
        "simulation_data": sim_data,
        "historical_data": formatted_hist,
        "probability_increase_5_percent": prob_increase
    }

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = os.path.join(frontend_dist_path, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"status": "Frontend build not found. Please run 'npm run build' in frontend directory."}

