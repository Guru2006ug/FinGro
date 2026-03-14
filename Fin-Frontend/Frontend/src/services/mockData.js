// ============================================
// FinGrow Mock Data — Realistic Trading Data
// ============================================

const SYMBOLS = [
    { symbol: 'RELIANCE.BO', name: 'Reliance Industries', basePrice: 2450.00 },
    { symbol: 'TCS.BO', name: 'Tata Consultancy Services', basePrice: 3850.00 },
    { symbol: 'INFY.BO', name: 'Infosys Ltd.', basePrice: 1520.00 },
    { symbol: 'HDFCBANK.BO', name: 'HDFC Bank Ltd.', basePrice: 1680.00 },
    { symbol: 'ICICIBANK.BO', name: 'ICICI Bank Ltd.', basePrice: 1125.00 },
    { symbol: 'HINDUNILVR.BO', name: 'Hindustan Unilever', basePrice: 2350.00 },
    { symbol: 'ITC.BO', name: 'ITC Limited', basePrice: 435.00 },
    { symbol: 'SBIN.BO', name: 'State Bank of India', basePrice: 780.00 },
];

let orderIdCounter = 1000;
let tradeIdCounter = 5000;

// --- Helpers ---
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(randomBetween(min, max));
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTimestamp(minutesAgo) {
    return new Date(Date.now() - minutesAgo * 60000).toISOString();
}

// --- Order Book Generator ---
export function generateOrderBook(symbol = 'AAPL', levels = 12) {
    const base = SYMBOLS.find(s => s.symbol === symbol)?.basePrice || 150;
    const spread = base * 0.001; // 0.1% spread

    const bids = [];
    const asks = [];

    for (let i = 0; i < levels; i++) {
        const bidPrice = base - spread / 2 - i * randomBetween(0.05, 0.15);
        const askPrice = base + spread / 2 + i * randomBetween(0.05, 0.15);

        bids.push({
            price: parseFloat(bidPrice.toFixed(2)),
            quantity: randomInt(10, 500) * 10,
            total: 0,
            orders: randomInt(1, 8),
        });

        asks.push({
            price: parseFloat(askPrice.toFixed(2)),
            quantity: randomInt(10, 500) * 10,
            total: 0,
            orders: randomInt(1, 8),
        });
    }

    // Calculate cumulative totals
    let bidTotal = 0;
    bids.forEach(b => { bidTotal += b.quantity; b.total = bidTotal; });
    let askTotal = 0;
    asks.forEach(a => { askTotal += a.quantity; a.total = askTotal; });

    const maxTotal = Math.max(bidTotal, askTotal);
    bids.forEach(b => { b.depth = (b.total / maxTotal) * 100; });
    asks.forEach(a => { a.depth = (a.total / maxTotal) * 100; });

    return {
        symbol,
        bids,
        asks,
        spread: parseFloat((asks[0].price - bids[0].price).toFixed(2)),
        midPrice: parseFloat(((asks[0].price + bids[0].price) / 2).toFixed(2)),
        lastUpdate: new Date().toISOString(),
    };
}

// --- Trade History Generator ---
export function generateTrades(symbol = 'AAPL', count = 30) {
    const base = SYMBOLS.find(s => s.symbol === symbol)?.basePrice || 150;
    const trades = [];

    for (let i = 0; i < count; i++) {
        const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const price = base + randomBetween(-2, 2);

        trades.push({
            id: tradeIdCounter++,
            symbol,
            side,
            price: parseFloat(price.toFixed(2)),
            quantity: randomInt(1, 200) * 10,
            timestamp: generateTimestamp(i * randomBetween(0.5, 3)),
            buyOrderId: randomInt(1000, 9999),
            sellOrderId: randomInt(1000, 9999),
        });
    }

    return trades;
}

// --- Orders Generator ---
export function generateOrders(count = 20) {
    const statuses = ['OPEN', 'OPEN', 'OPEN', 'PARTIAL', 'FILLED', 'FILLED', 'CANCELLED'];
    const orders = [];

    for (let i = 0; i < count; i++) {
        const sym = randomChoice(SYMBOLS);
        const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const status = randomChoice(statuses);
        const quantity = randomInt(10, 500) * 10;
        const filledQty = status === 'FILLED' ? quantity :
            status === 'PARTIAL' ? randomInt(1, quantity / 10) * 10 :
                0;

        orders.push({
            id: orderIdCounter++,
            userId: randomInt(1, 5),
            symbol: sym.symbol,
            side,
            price: parseFloat((sym.basePrice + randomBetween(-5, 5)).toFixed(2)),
            quantity,
            filledQuantity: filledQty,
            status,
            createdAt: generateTimestamp(i * randomBetween(2, 15)),
        });
    }

    return orders;
}

// --- Market Data Generator ---
export function generateMarketData() {
    return SYMBOLS.map(s => {
        const change = randomBetween(-3, 3);
        const price = s.basePrice + change;
        const changePercent = (change / s.basePrice) * 100;
        return {
            symbol: s.symbol,
            name: s.name,
            price: parseFloat(price.toFixed(2)),
            previousClose: s.basePrice,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: randomInt(500000, 50000000),
            high: parseFloat((s.basePrice + Math.abs(change) + randomBetween(1, 3)).toFixed(2)),
            low: parseFloat((s.basePrice - Math.abs(change) - randomBetween(1, 3)).toFixed(2)),
            open: parseFloat((s.basePrice + randomBetween(-1, 1)).toFixed(2)),
        };
    });
}

// --- Price History Generator (for charts) ---
export function generatePriceHistory(symbol = 'AAPL', points = 60) {
    const base = SYMBOLS.find(s => s.symbol === symbol)?.basePrice || 150;
    const history = [];
    let price = base - randomBetween(5, 10);

    for (let i = points; i >= 0; i--) {
        price += randomBetween(-0.8, 0.85);
        price = Math.max(price, base * 0.95);
        price = Math.min(price, base * 1.05);

        history.push({
            time: new Date(Date.now() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: parseFloat(price.toFixed(2)),
            volume: randomInt(10000, 200000),
        });
    }

    return history;
}

// --- Candlestick Data Generator (for lightweight-charts) ---
export function generateCandlestickData(symbol = 'RELIANCE.BO', days = 90) {
    const base = SYMBOLS.find(s => s.symbol === symbol)?.basePrice || 150;
    const candles = [];
    let currentPrice = base * (1 - randomBetween(0.02, 0.08));

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const volatility = base * 0.015;
        const drift = randomBetween(-0.3, 0.35);
        const open = currentPrice;
        const close = open + drift + randomBetween(-volatility, volatility);
        const high = Math.max(open, close) + randomBetween(0, volatility * 0.8);
        const low = Math.min(open, close) - randomBetween(0, volatility * 0.8);

        candles.push({
            time: date.toISOString().split('T')[0], // 'YYYY-MM-DD'
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: randomInt(500000, 15000000),
        });

        currentPrice = close;
        // Mean reversion toward base price
        currentPrice += (base - currentPrice) * 0.02;
    }

    return candles;
}

// --- Portfolio Generator ---
export function generatePortfolio() {
    const selectedSymbols = SYMBOLS.slice(0, 5);
    return selectedSymbols.map(s => {
        const qty = randomInt(10, 200) * 10;
        const avgCost = parseFloat((s.basePrice + randomBetween(-10, -2)).toFixed(2));
        const currentPrice = parseFloat((s.basePrice + randomBetween(-3, 5)).toFixed(2));
        const marketValue = parseFloat((qty * currentPrice).toFixed(2));
        const costBasis = parseFloat((qty * avgCost).toFixed(2));
        const pnl = parseFloat((marketValue - costBasis).toFixed(2));
        const pnlPercent = parseFloat(((pnl / costBasis) * 100).toFixed(2));

        return {
            symbol: s.symbol,
            name: s.name,
            quantity: qty,
            avgCost,
            currentPrice,
            marketValue,
            costBasis,
            pnl,
            pnlPercent,
        };
    });
}

// --- Symbol List ---
export function getSymbols() {
    return SYMBOLS;
}

// --- Account Info ---
export function getAccountInfo() {
    return {
        id: 1,
        name: 'Alex Trader',
        balance: 125430.50,
        equity: 287650.75,
        buyingPower: 250000.00,
        todayPnl: 1287.35,
        todayPnlPercent: 0.45,
        totalTrades: 156,
        openOrders: 8,
    };
}
