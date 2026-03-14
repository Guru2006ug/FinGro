import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ChevronDown, Maximize2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import OrderBook from '../components/trading/OrderBook';
import PlaceOrderForm from '../components/trading/PlaceOrderForm';
import TradeHistory from '../components/trading/TradeHistory';
import OrdersTable from '../components/trading/OrdersTable';
import TradingViewChart from '../components/charts/TradingViewChart';
import { useOrderBook, useQuote } from '../hooks/useMarketData';
import { generateTrades } from '../services/mockData';
import { placeOrder, cancelOrder, getOrders, fetchSymbols, getPublicTradeFeed } from '../services/api';
import './Trading.css';

export default function Trading() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedSymbol, setSelectedSymbol] = useState(location.state?.symbol || 'RELIANCE.BO');
    const [showSymbolPicker, setShowSymbolPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { orderBook } = useOrderBook(selectedSymbol, 2000);
    const { quote } = useQuote(selectedSymbol, 5000);
    const [trades, setTrades] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [symbols, setSymbols] = useState([]);

    useEffect(() => {
        fetchSymbols().then(setSymbols).catch(() => {});
    }, []);

    // Fetch the user's real orders from the backend
    const fetchMyOrders = useCallback(async () => {
        try {
            const data = await getOrders();
            setMyOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    }, []);

    // Fetch real trade feed from backend; fall back to mock if empty
    const fetchTradeFeed = useCallback(async () => {
        try {
            const data = await getPublicTradeFeed(selectedSymbol);
            if (data && data.length > 0) {
                // Map backend TradeResponse to the shape TradeHistory expects
                const mapped = data.map(t => ({
                    id: t.id,
                    side: t.side,
                    price: t.executionPrice,
                    quantity: t.quantity,
                    timestamp: t.executedAt,
                }));
                setTrades(mapped);
                return;
            }
        } catch {
            // fall through to mock
        }
        setTrades(generateTrades(selectedSymbol, 25));
    }, [selectedSymbol]);

    useEffect(() => {
        fetchTradeFeed();
        fetchMyOrders();
    }, [selectedSymbol, fetchTradeFeed, fetchMyOrders]);

    async function handlePlaceOrder(orderData) {
        const order = await placeOrder(orderData);
        // Add the newly created order to the list
        setMyOrders(prev => [order, ...prev]);
        // Refresh trade feed (the new trade should appear)
        fetchTradeFeed();
    }

    async function handleCancelOrder(orderId) {
        try {
            const updated = await cancelOrder(orderId);
            setMyOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o)
            );
        } catch (err) {
            console.error('Failed to cancel order:', err);
        }
    }

    const currentPrice = quote?.price || orderBook?.midPrice || 0;
    const priceChange = quote?.change || 0;
    const priceChangePercent = quote?.changePercent || 0;

    const filteredSymbols = symbols.filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="trading-page animate-fade-in">
            <TopBar title="Trading" subtitle="Place orders & monitor execution" />

            <div className="trading-content">
                {/* Symbol Selector */}
                <div className="symbol-selector-bar">
                    <button
                        className="symbol-selector-btn"
                        onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                    >
                        <span className="selected-symbol">{selectedSymbol.replace('.BO', '').replace('.NS', '')}</span>
                        <span className="selected-price mono">
                            ₹{currentPrice.toFixed(2)}
                            {priceChange !== 0 && (
                                <span className={`price-change ${priceChange >= 0 ? 'price-up' : 'price-down'}`}>
                                    {' '}{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                                </span>
                            )}
                        </span>
                        <ChevronDown size={16} />
                    </button>
                    {showSymbolPicker && (
                        <div className="symbol-dropdown glass-card animate-slide-down">
                            {filteredSymbols.map(s => (
                                <button
                                    key={s.symbol}
                                    className={`symbol-option ${s.symbol === selectedSymbol ? 'active' : ''}`}
                                    onClick={() => { setSelectedSymbol(s.symbol); setShowSymbolPicker(false); setSearchQuery(''); }}
                                >
                                    <span className="so-symbol">{s.symbol}</span>
                                    <span className="so-name">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Trading Grid */}
                <div className="trading-grid">
                    {/* Left: Order Book */}
                    <section className="glass-card trading-panel">
                        <h3 className="section-title" style={{ padding: '16px 16px 0' }}>
                            <ArrowLeftRight size={16} className="icon" />
                            Order Book
                        </h3>
                        <OrderBook orderBook={orderBook} />
                    </section>

                    {/* Center: Chart + My Orders */}
                    <div className="trading-center">
                        <section className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <div className="chart-header">
                                <h3 className="section-title" style={{ marginBottom: 0 }}>
                                    {selectedSymbol.replace('.BO', '').replace('.NS', '')} — Live Chart
                                </h3>
                                <div className="chart-header-actions">
                                    <span className="chart-live-badge">
                                        <span className="live-dot" /> LIVE
                                    </span>
                                    <button
                                        className="chart-expand-btn"
                                        title="Open full chart"
                                        onClick={() => navigate('/chart', { state: { symbol: selectedSymbol } })}
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <TradingViewChart symbol={selectedSymbol} height={400} />
                        </section>

                        <section className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <h3 className="section-title">My Open Orders — {selectedSymbol}</h3>
                            <OrdersTable
                                orders={myOrders.filter(o =>
                                    o.symbol === selectedSymbol &&
                                    (o.status === 'OPEN' || o.status === 'PARTIAL')
                                )}
                                onCancel={handleCancelOrder}
                                showSymbol={false}
                                compact
                            />
                        </section>
                    </div>

                    {/* Right: Place Order + Trade Feed */}
                    <div className="trading-right">
                        <section className="glass-card">
                            <PlaceOrderForm
                                symbol={selectedSymbol}
                                currentPrice={currentPrice}
                                onSubmit={handlePlaceOrder}
                            />
                        </section>

                        <section className="glass-card">
                            <h3 className="section-title" style={{ padding: '16px 16px 0' }}>
                                Trade Feed
                            </h3>
                            <TradeHistory trades={trades} compact />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
