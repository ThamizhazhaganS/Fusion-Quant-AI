import yfinance as yf
import pandas as pd
from tradingview_ta import TA_Handler, Interval, Exchange
import datetime

def get_tv_symbol_info(ticker: str):
    """
    Maps yfinance tickers to TradingView symbols/exchanges.
    Supports Crypto, US Stocks, and Indian Markets (NSE/BSE).
    """
    ticker = ticker.upper()
    
    # 1. Crypto (e.g., BTC-USD)
    if ticker.endswith("-USD"):
        base = ticker.replace("-USD", "")
        return {"symbol": f"{base}USDT", "exchange": "BINANCE", "screener": "crypto"}
    
    # 2. NSE (Indian Exchange - e.g., RELIANCE.NS)
    elif ticker.endswith(".NS"):
        symbol = ticker.replace(".NS", "")
        return {"symbol": symbol, "exchange": "NSE", "screener": "india"}
    
    # 3. BSE (Indian Exchange - e.g., SBIN.BO)
    elif ticker.endswith(".BO"):
        symbol = ticker.replace(".BO", "")
        return {"symbol": symbol, "exchange": "BSE", "screener": "india"}
    
    # 4. Default to US Stocks (NASDAQ/NYSE)
    else:
        return {"symbol": ticker, "exchange": "NASDAQ", "screener": "america"}

def fetch_realtime_price_tv(ticker: str):
    """
    Fetches the latest price from TradingView.
    """
    try:
        info = get_tv_symbol_info(ticker)
        handler = TA_Handler(
            symbol=info["symbol"],
            exchange=info["exchange"],
            screener=info["screener"],
            interval=Interval.INTERVAL_1_MINUTE,
            timeout=10
        )
        analysis = handler.get_analysis()
        return float(analysis.indicators["close"])
    except Exception as e:
        print(f"TradingView fetch failed for {ticker}: {e}")
        return None

def fetch_data(ticker: str, period: str = "2y", interval: str = "1d"):
    """
    Fetches historical data from yfinance and updates with real-time price from TradingView.
    """
    try:
        # 1. Get History
        df = yf.download(ticker, period=period, interval=interval)
        if df.empty:
            return None
        
        # Flatten MultiIndex columns if present (new yfinance behavior)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
            
        # 2. Try to get Realtime Price from TradingView
        tv_price = fetch_realtime_price_tv(ticker)
        
        if tv_price is not None:
            # Update the last row with the live price if today's data is already there, 
            # or append if it's a new day/time.
            # For simplicity, we just update the last close to be "live".
            df.loc[df.index[-1], 'Close'] = tv_price
            print(f"Updated {ticker} with Real-Time TV Price: {tv_price}")
            
        return df
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

