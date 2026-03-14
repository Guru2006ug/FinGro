import { useState, useEffect, useCallback, useRef } from 'react';
import { getMarketData, getPriceHistory as fetchPriceHistory, getOrderBook as fetchOrderBook } from '../services/api';
import { generateOrderBook } from '../services/mockData';

// ============================================
// useMarketData — fetches real-time prices from Finnhub via backend
// Polls /api/market/quotes at the given interval
// ============================================

export function useMarketData(intervalMs = 5000) {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const data = await getMarketData();
            if (data && data.length > 0) {
                setMarketData(data);
                setError(null);
            }
        } catch (err) {
            console.error('Failed to fetch market data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        const timer = setInterval(fetchData, intervalMs);

        // Simulate small price ticks between API polls for smooth UX
        const tickTimer = setInterval(() => {
            setMarketData(prev =>
                prev.map(stock => {
                    const tick = (Math.random() - 0.48) * (stock.price * 0.001);
                    const newPrice = parseFloat((stock.price + tick).toFixed(2));
                    const change = parseFloat((newPrice - stock.previousClose).toFixed(2));
                    const changePercent = parseFloat(((change / stock.previousClose) * 100).toFixed(2));
                    return { ...stock, price: newPrice, change, changePercent };
                })
            );
        }, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(tickTimer);
        };
    }, [fetchData, intervalMs]);

    return { marketData, loading, error };
}

// ============================================
// useOrderBook — simulates live order book
// (Finnhub free tier doesn't provide L2 order book data)
// ============================================

export function useOrderBook(symbol, intervalMs = 3000) {
    const [orderBook, setOrderBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setOrderBook(generateOrderBook(symbol));
        setLoading(false);

        const timer = setInterval(() => {
            setOrderBook(generateOrderBook(symbol));
        }, intervalMs);

        return () => clearInterval(timer);
    }, [symbol, intervalMs]);

    return { orderBook, loading };
}

// ============================================
// usePriceHistory — fetches real intraday chart data from Finnhub
// Falls back to simulated tick updates between API polls
// ============================================

export function usePriceHistory(symbol, intervalMs = 15000) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            const data = await fetchPriceHistory(symbol);
            if (data && data.length > 0) {
                setHistory(data);
                setError(null);
            } else {
                // If API returned empty, generate mock data as fallback
                const { generatePriceHistory } = await import('../services/mockData.js');
                setHistory(generatePriceHistory(symbol, 60));
            }
        } catch (err) {
            console.error(`Failed to fetch price history for ${symbol}:`, err);
            setError(err.message);
            // Fallback to mock data on error
            const { generatePriceHistory } = await import('../services/mockData.js');
            setHistory(generatePriceHistory(symbol, 60));
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        setLoading(true);
        fetchHistory();

        // Re-fetch from Finnhub at the given interval
        const fetchTimer = setInterval(fetchHistory, intervalMs);

        // Simulate small tick updates between fetches for smooth UX
        const tickTimer = setInterval(() => {
            setHistory(prev => {
                if (prev.length === 0) return prev;
                const last = prev[prev.length - 1];
                const tick = (Math.random() - 0.48) * 0.3;
                const newPrice = parseFloat((last.price + tick).toFixed(2));
                const newPoint = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: newPrice,
                    volume: Math.floor(Math.random() * 200000) + 10000,
                };
                return [...prev.slice(1), newPoint];
            });
        }, 3000);

        return () => {
            clearInterval(fetchTimer);
            clearInterval(tickTimer);
        };
    }, [symbol, fetchHistory, intervalMs]);

    return { history, loading, error };
}

// ============================================
// useQuote — fetches real-time quote for a single symbol
// ============================================

export function useQuote(symbol, intervalMs = 5000) {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchQuote() {
            try {
                const res = await fetch(`/api/market/quote/${symbol}`);
                if (res.ok) {
                    const data = await res.json();
                    if (!cancelled) setQuote(data);
                }
            } catch (err) {
                console.error(`Failed to fetch quote for ${symbol}:`, err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchQuote();
        const timer = setInterval(fetchQuote, intervalMs);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [symbol, intervalMs]);

    return { quote, loading };
}
