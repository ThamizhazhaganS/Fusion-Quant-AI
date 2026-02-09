import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
import warnings

warnings.filterwarnings('ignore')

def calculate_indicators(df_input):
    """
    Manually calculates RSI, EMA, and MACD to avoid Python 3.14 dependency issues.
    Ensures columns are flat.
    """
    df = df_input.copy()
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
        
    # 1. EMA
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
    df['EMA_50'] = df['Close'].ewm(span=50, adjust=False).mean()

    # 2. RSI (14 days)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # 3. MACD
    exp1 = df['Close'].ewm(span=12, adjust=False).mean()
    exp2 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = exp1 - exp2
    df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()

    return df.dropna()

def prepare_data(data, prediction_days=60):
    df = calculate_indicators(data.copy())
    df['Prediction'] = df['Close'].shift(-1)
    
    # Flatten columns for processing
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
        
    lag_cols = []
    for i in range(1, 11):
        col = f'Close_Lag_{i}'
        df[col] = df['Close'].shift(i)
        lag_cols.append(col)
        
    feature_cols = lag_cols + ['RSI', 'EMA_20', 'EMA_50', 'MACD', 'Signal_Line']
    df = df.dropna()
    
    X = df[feature_cols].values
    y = df['Prediction'].values
    
    return X, y, df, feature_cols

def run_prediction_pipeline(df):
    """
    Predicts the next day's price using Price Lags + Technical Indicators.
    """
    X, y, df_processed, feature_cols = prepare_data(df.copy())
    
    # Train Model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Prepare latest features for prediction
    latest_data = df_processed.iloc[-1]
    
    # Re-fetch the last 10 closes for lags
    # Flatten closes to handles potential multi-column df
    closes = df_processed['Close'].iloc[-10:].values[::-1]
    
    input_row = list(closes) + [
        float(latest_data['RSI']), 
        float(latest_data['EMA_20']), 
        float(latest_data['EMA_50']), 
        float(latest_data['MACD']), 
        float(latest_data['Signal_Line'])
    ]
    
    input_features = np.array(input_row).reshape(1, -1)
    predicted_next_price = model.predict(input_features)[0]
    
    # Calculate Volatility
    df_processed['Log_Ret'] = np.log(df_processed['Close'] / df_processed['Close'].shift(1))
    volatility = df_processed['Log_Ret'].std()
    
    last_close = df_processed['Close'].iloc[-1]
    if not isinstance(last_close, (float, int, np.float64, np.int64)):
        last_close = float(last_close.iloc[0] if hasattr(last_close, 'iloc') else last_close)

    return {
        "prediction": float(predicted_next_price),
        "volatility": float(volatility),
        "last_close": float(last_close),
        "rsi": float(latest_data['RSI']),
        "macd": float(latest_data['MACD'])
    }

def monte_carlo_simulation(last_price, volatility, days=30, simulations=100, vol_multiplier=1.0):
    """
    Runs Monte Carlo simulation with volatility scaling.
    Reduced simulations slightly for speed.
    """
    adj_vol = volatility * vol_multiplier
    simulation_df = pd.DataFrame()
    
    for x in range(simulations):
        price_series = [last_price]
        for _ in range(days):
            price = price_series[-1] * (1 + np.random.normal(0, adj_vol))
            price_series.append(price)
            
        simulation_df[x] = price_series[1:]
        
    return simulation_df


