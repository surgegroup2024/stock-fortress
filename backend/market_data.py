from fastapi import APIRouter, HTTPException, Query
import yfinance as yf
from typing import List, Dict
import asyncio

router = APIRouter(prefix="/api/market-data", tags=["market-data"])

@router.get("/bulk")
async def get_bulk_market_data(tickers: str = Query(..., description="Comma-separated list of tickers")):
    """
    Fetch real-time price data for multiple tickers using yfinance.
    Example: /api/market-data/bulk?tickers=AAPL,MSFT,TSLA
    """
    if not tickers:
        return {}

    symbol_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not symbol_list:
        return {}
    
    # yfinance can fetch multiple tickers in one go
    # We use 'tickers' string space-separated
    try:
        data = yf.Tickers(" ".join(symbol_list))
        
        results = {}
        for symbol in symbol_list:
            try:
                # fast_info is faster than .info
                ticker = data.tickers[symbol]
                price = ticker.fast_info.last_price
                prev_close = ticker.fast_info.previous_close
                
                if price and prev_close:
                    change = price - prev_close
                    percent = (change / prev_close) * 100
                    results[symbol] = {
                        "price": round(price, 2),
                        "change": round(change, 2),
                        "percent": round(percent, 2)
                    }
                else:
                    # Fallback or error in data
                    results[symbol] = { "price": 0, "change": 0, "percent": 0 }
            except Exception as e:
                print(f"Error fetching data for {symbol}: {e}")
                results[symbol] = { "price": 0, "change": 0, "percent": 0 }

        return results
    except Exception as e:
        print(f"Global error in bulk fetch: {e}")
        raise HTTPException(status_code=500, detail=str(e))
