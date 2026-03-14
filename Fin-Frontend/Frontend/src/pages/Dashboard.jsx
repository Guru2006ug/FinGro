import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart3, ShoppingCart, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/layout/TopBar';
import StatCard from '../components/dashboard/StatCard';
import MarketCard from '../components/dashboard/MarketCard';
import { useMarketData } from '../hooks/useMarketData';
import { getAccount, getOrders } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { marketData, loading: marketLoading } = useMarketData(5000);
    const [account, setAccount] = useState(null);
    const [orderStats, setOrderStats] = useState({ filled: 0, total: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [acct, orders] = await Promise.all([
                    getAccount(),
                    getOrders(),
                ]);
                setAccount(acct);
                const filledCount = orders.filter(o => o.status === 'FILLED').length;
                setOrderStats({ filled: filledCount, total: orders.length });
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fmt = (val) => `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleSymbolClick = (symbol) => {
        navigate('/chart', { state: { symbol } });
    };

    const pnl = account?.totalPnl ?? 0;
    const pnlPercent = account?.totalPnlPercent ?? 0;
    const pnlSign = pnl >= 0 ? '+' : '';

    return (
        <div className="dashboard animate-fade-in">
            <TopBar
                title={`Welcome, ${user?.name?.split(' ')[0] || 'Trader'}`}
                subtitle="Market overview & live data"
            />

            <div className="dashboard-content">
                {/* Stats Row */}
                <div className="stats-grid">
                    <StatCard
                        icon={DollarSign}
                        label="Total Equity"
                        value={account ? fmt(account.totalEquity) : '—'}
                        color="green"
                    />
                    <StatCard
                        icon={Briefcase}
                        label="Cash Balance"
                        value={account ? fmt(account.balance) : '—'}
                        color="default"
                    />
                    <StatCard
                        icon={pnl >= 0 ? TrendingUp : Activity}
                        label="Total P&L"
                        value={account ? `${pnlSign}${fmt(pnl)}` : '—'}
                        trend={pnl >= 0 ? 'up' : 'down'}
                        trendValue={`${pnlSign}${Number(pnlPercent).toFixed(2)}%`}
                        color={pnl >= 0 ? 'green' : 'red'}
                    />
                    <StatCard
                        icon={ShoppingCart}
                        label="Total Trades"
                        value={orderStats.filled}
                        color="yellow"
                    />
                </div>

                {/* Market Overview */}
                <section>
                    <h2 className="section-title">
                        <BarChart3 size={18} className="icon" />
                        Markets Overview
                    </h2>
                    {marketLoading ? (
                        <div className="market-loading">Loading market data...</div>
                    ) : (
                        <div className="market-cards-grid">
                            {marketData.map(stock => (
                                <MarketCard key={stock.symbol} data={stock} onClick={handleSymbolClick} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
