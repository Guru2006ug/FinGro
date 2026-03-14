// ============================================
// FinGrow API Service Layer
// Auth endpoints + market data via Spring Boot;
// order book, trades, and portfolio still use mock data.
// ============================================

import {
    generateOrderBook,
    generateTrades,
} from './mockData';

const API_BASE = '/api';

// --- Simulated latency (for mock endpoints only) ---
function delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================
// Helper: authenticated fetch with credentials (cookies)
// Automatically handles 401 by clearing session
// =============================================
async function authFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, { ...options, headers, credentials: 'include' });

    if (res.status === 401) {
        // Token expired or invalid — clear session and redirect to login
        localStorage.removeItem('fingrow_user');
        // Also tell backend to clear the cookie
        try {
            await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch { /* ignore */ }
        window.location.href = '/login';
        throw new Error('Session expired. Redirecting to login.');
    }

    return res;
}

// =============================================
// AUTH ENDPOINTS (real backend)
// =============================================

export async function authLogin(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // receive the Set-Cookie from backend
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.email) {
        throw new Error(data.message || 'Login failed');
    }

    return data; // JWT is in HttpOnly cookie; body has email/fullname/message
}

export async function authRegister(fullname, email, password, confirmPassword) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullname, email, password, confirmPassword }),
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(text || 'Registration failed');
    }

    return text;
}

export async function authLogout() {
    await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
}

// === ORDER ENDPOINTS (real backend) ===

export async function placeOrder(orderData) {
    const res = await authFetch(`${API_BASE}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to place order');
    }

    return res.json();
}

export async function cancelOrder(orderId) {
    const res = await authFetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'PUT',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to cancel order');
    }

    return res.json();
}

export async function getOrders(status) {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await authFetch(`${API_BASE}/orders${query}`);

    if (!res.ok) {
        throw new Error('Failed to fetch orders');
    }

    return res.json();
}

// =============================================
// MARKET DATA ENDPOINTS (real Finnhub via backend)
// =============================================

/**
 * Fetch real-time quotes for all tracked symbols.
 * Falls back to mock data if API returns empty (e.g. Finnhub free tier doesn't support Indian exchanges).
 */
export async function getMarketData() {
    try {
        const res = await fetch(`${API_BASE}/market/quotes`);
        if (!res.ok) throw new Error('Failed to fetch market data');
        const data = await res.json();
        if (data && data.length > 0) return data;
    } catch {
        // Backend not available — silently fall back to mock data
    }
    // Fallback to mock data
    const { generateMarketData } = await import('./mockData.js');
    return generateMarketData();
}

/**
 * Fetch real-time quote for a single symbol.
 * Falls back to mock data if API returns empty.
 */
export async function getQuote(symbol) {
    try {
        const res = await fetch(`${API_BASE}/market/quote/${symbol}`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.price > 0) return data;
        }
    } catch (err) {
        console.warn(`Quote API failed for ${symbol}, using mock:`, err);
    }
    // Fallback: generate mock quote
    const { generateMarketData } = await import('./mockData.js');
    const all = generateMarketData();
    return all.find(s => s.symbol === symbol) || all[0];
}

/**
 * Fetch candle data for charts (daily resolution from Finnhub).
 * Falls back to mock data if API returns empty.
 */
export async function getPriceHistory(symbol) {
    try {
        const res = await fetch(`${API_BASE}/market/candles/${symbol}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (result.data && result.data.length > 0) {
            return result.data;
        }
        // Fallback: try daily endpoint
        const dailyRes = await fetch(`${API_BASE}/market/candles/${symbol}/daily`);
        if (dailyRes.ok) {
            const dailyResult = await dailyRes.json();
            if (dailyResult.data && dailyResult.data.length > 0) {
                return dailyResult.data;
            }
        }
    } catch (err) {
        console.warn(`Finnhub candle fetch failed for ${symbol}, using mock data:`, err);
    }
    // Final fallback: generate mock price history
    const { generatePriceHistory } = await import('./mockData.js');
    return generatePriceHistory(symbol, 60);
}

/**
 * Fetch daily candle data (last 30 days) for charts.
 */
export async function getDailyHistory(symbol) {
    const res = await fetch(`${API_BASE}/market/candles/${symbol}/daily`);
    if (!res.ok) throw new Error(`Failed to fetch daily candles for ${symbol}`);
    const result = await res.json();
    return result.data || [];
}

/**
 * Fetch the list of tracked symbols.
 */
export async function fetchSymbols() {
    const res = await fetch(`${API_BASE}/market/symbols`);
    if (!res.ok) throw new Error('Failed to fetch symbols');
    return res.json();
}

// === ORDER BOOK (mock — Finnhub free tier doesn't provide L2 data) ===

export async function getOrderBook(symbol) {
    await delay(50);
    return generateOrderBook(symbol);
}

export async function getTrades(symbol) {
    await delay(60);
    return generateTrades(symbol, 30);
}

// === TRADE ENDPOINTS (real backend) ===

/** Fetch all trades for the authenticated user. Optional symbol filter. */
export async function getMyTrades(symbol) {
    const query = symbol ? `?symbol=${encodeURIComponent(symbol)}` : '';
    const res = await authFetch(`${API_BASE}/trades${query}`);
    if (!res.ok) throw new Error('Failed to fetch trades');
    return res.json();
}

/** Fetch public trade feed for a symbol (last 50 trades across all users). */
export async function getPublicTradeFeed(symbol) {
    const res = await fetch(`${API_BASE}/trades/feed/${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error('Failed to fetch trade feed');
    return res.json();
}

// === STOCK CATALOGUE ENDPOINTS (real backend) ===

/** Fetch all active stocks. */
export async function getStocks() {
    const res = await fetch(`${API_BASE}/stocks`);
    if (!res.ok) throw new Error('Failed to fetch stocks');
    return res.json();
}

/** Fetch stocks by sector. */
export async function getStocksBySector(sector) {
    const res = await fetch(`${API_BASE}/stocks/sector/${encodeURIComponent(sector)}`);
    if (!res.ok) throw new Error('Failed to fetch stocks');
    return res.json();
}

// === PORTFOLIO ENDPOINTS (real backend) ===

export async function getPortfolioSummary() {
    const res = await authFetch(`${API_BASE}/portfolio/summary`);
    if (!res.ok) {
        throw new Error('Failed to fetch portfolio summary');
    }
    return res.json();
}

export async function getPortfolio() {
    const res = await authFetch(`${API_BASE}/portfolio`);
    if (!res.ok) {
        throw new Error('Failed to fetch portfolio');
    }
    return res.json();
}

export async function getAccount() {
    const res = await authFetch(`${API_BASE}/portfolio/account`);
    if (!res.ok) {
        throw new Error('Failed to fetch account info');
    }
    return res.json();
}
