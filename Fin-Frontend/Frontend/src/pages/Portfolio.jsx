import { useState, useEffect, useCallback } from 'react';
import {
    Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon,
    Loader2, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3, Activity,
} from 'lucide-react';
import {
    PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import TopBar from '../components/layout/TopBar';
import StatCard from '../components/dashboard/StatCard';
import { getPortfolioSummary, getMyTrades } from '../services/api';
import './Portfolio.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const SECTOR_COLORS = { Energy: '#ef4444', IT: '#6366f1', Banking: '#10b981', FMCG: '#f59e0b', Other: '#8b5cf6' };

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pctFmt = (v) => `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;

export default function Portfolio() {
    const [summary, setSummary] = useState(null);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('holdings'); // holdings | sectors | trades

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [sum, tradeList] = await Promise.all([
                getPortfolioSummary(),
                getMyTrades().catch(() => []),
            ]);
            setSummary(sum);
            setTrades(tradeList.slice(0, 20));
        } catch (err) {
            console.error('Failed to load portfolio:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const holdings = summary?.holdings ?? [];
    const sectors = summary?.sectorBreakdown ?? [];
    const totalPnl = summary?.totalPnl ?? 0;
    const todayPnl = summary?.todayPnl ?? 0;

    const pieData = holdings
        .filter(h => h.marketValue > 0)
        .map(h => ({ name: h.symbol, value: h.marketValue }));

    const sectorPieData = sectors.map(s => ({
        name: s.sector,
        value: s.totalValue,
        percent: s.allocationPercent,
    }));

    return (
        <div className="portfolio-page animate-fade-in">
            <TopBar title="Portfolio" subtitle="Holdings & performance" />

            <div className="portfolio-content">
                {/* ─── Stat Cards ─── */}
                <div className="portfolio-stats">
                    <StatCard
                        icon={Briefcase}
                        label="Total Equity"
                        value={summary ? fmt(summary.totalEquity) : '—'}
                        color="default"
                    />
                    <StatCard
                        icon={DollarSign}
                        label="Cash Balance"
                        value={summary ? fmt(summary.balance) : '—'}
                        color="green"
                    />
                    <StatCard
                        icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
                        label="Total P&L"
                        value={`${totalPnl >= 0 ? '+' : ''}${fmt(totalPnl)}`}
                        trend={totalPnl >= 0 ? 'up' : 'down'}
                        trendValue={pctFmt(summary?.totalPnlPercent ?? 0)}
                        color={totalPnl >= 0 ? 'green' : 'red'}
                    />
                    <StatCard
                        icon={Activity}
                        label="Today's P&L"
                        value={`${todayPnl >= 0 ? '+' : ''}${fmt(todayPnl)}`}
                        trend={todayPnl >= 0 ? 'up' : 'down'}
                        trendValue={pctFmt(summary?.todayPnlPercent ?? 0)}
                        color={todayPnl >= 0 ? 'green' : 'red'}
                    />
                </div>

                {/* ─── Top Performers ─── */}
                {summary && (summary.topGainer || summary.topLoser) && holdings.length > 1 && (
                    <div className="top-performers">
                        {summary.topGainer && (
                            <div className="performer-card glass-card gainer">
                                <div className="perf-icon"><ArrowUpRight size={20} /></div>
                                <div className="perf-info">
                                    <span className="perf-label">Top Gainer</span>
                                    <span className="perf-symbol">{summary.topGainer.symbol}</span>
                                </div>
                                <div className="perf-value price-up">
                                    {pctFmt(summary.topGainer.pnlPercent)}
                                </div>
                            </div>
                        )}
                        {summary.topLoser && (
                            <div className="performer-card glass-card loser">
                                <div className="perf-icon down"><ArrowDownRight size={20} /></div>
                                <div className="perf-info">
                                    <span className="perf-label">Top Loser</span>
                                    <span className="perf-symbol">{summary.topLoser.symbol}</span>
                                </div>
                                <div className="perf-value price-down">
                                    {pctFmt(summary.topLoser.pnlPercent)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="portfolio-loading">
                        <Loader2 className="spinner" size={32} />
                        <p>Loading portfolio...</p>
                    </div>
                ) : error ? (
                    <div className="portfolio-error glass-card">
                        <p>Failed to load portfolio: {error}</p>
                        <button className="btn" onClick={fetchData}>Retry</button>
                    </div>
                ) : holdings.length === 0 ? (
                    <div className="portfolio-empty glass-card">
                        <Briefcase size={48} strokeWidth={1} />
                        <h3>No holdings yet</h3>
                        <p>Start trading to build your portfolio. You have {summary ? fmt(summary.balance) : '₹10,00,000'} in paper money to invest.</p>
                    </div>
                ) : (
                    <>
                        {/* ─── Tab Switcher ─── */}
                        <div className="portfolio-tabs">
                            <button className={`tab-btn ${tab === 'holdings' ? 'active' : ''}`} onClick={() => setTab('holdings')}>
                                <Briefcase size={16} /> Holdings
                            </button>
                            <button className={`tab-btn ${tab === 'sectors' ? 'active' : ''}`} onClick={() => setTab('sectors')}>
                                <BarChart3 size={16} /> Sectors
                            </button>
                            <button className={`tab-btn ${tab === 'trades' ? 'active' : ''}`} onClick={() => setTab('trades')}>
                                <Activity size={16} /> Recent Trades
                            </button>
                            <button className="tab-btn refresh-btn" onClick={fetchData} title="Refresh">
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        {/* ─── Holdings Tab ─── */}
                        {tab === 'holdings' && (
                            <div className="portfolio-main">
                                <section className="glass-card portfolio-table-section">
                                    <h2 className="section-title" style={{ padding: 'var(--space-lg) var(--space-lg) 0' }}>
                                        Holdings ({holdings.length})
                                    </h2>
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Symbol</th>
                                                    <th>Sector</th>
                                                    <th>Qty</th>
                                                    <th>Avg Cost</th>
                                                    <th>Current</th>
                                                    <th>Day Chg</th>
                                                    <th>Mkt Value</th>
                                                    <th>P&L</th>
                                                    <th>P&L %</th>
                                                    <th>Alloc %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {holdings.map((pos, i) => (
                                                    <tr key={pos.symbol} className="animate-fade-in">
                                                        <td>
                                                            <div className="holding-symbol">
                                                                <div className="holding-dot" style={{ background: COLORS[i % COLORS.length] }} />
                                                                <div>
                                                                    <div className="holding-ticker">{pos.symbol}</div>
                                                                    <div className="holding-name">{pos.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><span className="sector-badge">{pos.sector}</span></td>
                                                        <td className="mono">{pos.quantity.toLocaleString()}</td>
                                                        <td className="mono">₹{Number(pos.avgCost).toFixed(2)}</td>
                                                        <td className="mono">₹{Number(pos.currentPrice).toFixed(2)}</td>
                                                        <td className={`mono ${pos.dayChange >= 0 ? 'price-up' : 'price-down'}`}>
                                                            {pos.dayChange >= 0 ? '+' : ''}{Number(pos.dayChange).toFixed(2)}
                                                            <span className="day-pct">({pctFmt(pos.dayChangePercent)})</span>
                                                        </td>
                                                        <td className="mono">{fmt(pos.marketValue)}</td>
                                                        <td className={`mono ${pos.pnl >= 0 ? 'price-up' : 'price-down'}`}>
                                                            {pos.pnl >= 0 ? '+' : ''}{fmt(pos.pnl)}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${pos.pnlPercent >= 0 ? 'badge-buy' : 'badge-sell'}`}>
                                                                {pctFmt(pos.pnlPercent)}
                                                            </span>
                                                        </td>
                                                        <td className="mono">{Number(pos.allocationPercent).toFixed(1)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* Allocation Pie */}
                                {pieData.length > 0 && (
                                    <section className="glass-card allocation-section">
                                        <h2 className="section-title" style={{ padding: 'var(--space-lg)' }}>Allocation</h2>
                                        <div className="allocation-chart">
                                            <ResponsiveContainer width="100%" height={240}>
                                                <RechartsPie>
                                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" animationDuration={800}>
                                                        {pieData.map((e, i) => (<Cell key={e.name} fill={COLORS[i % COLORS.length]} />))}
                                                    </Pie>
                                                    <Tooltip formatter={(v) => [fmt(v), 'Value']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                                                </RechartsPie>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="allocation-legend">
                                            {holdings.map((pos, i) => (
                                                <div key={pos.symbol} className="legend-item">
                                                    <div className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                                                    <span className="legend-symbol">{pos.symbol}</span>
                                                    <span className="legend-pct mono">{Number(pos.allocationPercent).toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* ─── Sectors Tab ─── */}
                        {tab === 'sectors' && (
                            <div className="portfolio-sectors">
                                {/* Sector Pie */}
                                <section className="glass-card sector-pie-section">
                                    <h2 className="section-title" style={{ padding: 'var(--space-lg)' }}>Sector Breakdown</h2>
                                    <div className="allocation-chart">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <RechartsPie>
                                                <Pie data={sectorPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" animationDuration={800}>
                                                    {sectorPieData.map((e) => (
                                                        <Cell key={e.name} fill={SECTOR_COLORS[e.name] || '#6366f1'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => [fmt(v), 'Value']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                                            </RechartsPie>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="allocation-legend">
                                        {sectors.map(s => (
                                            <div key={s.sector} className="legend-item">
                                                <div className="legend-dot" style={{ background: SECTOR_COLORS[s.sector] || '#6366f1' }} />
                                                <span className="legend-symbol">{s.sector}</span>
                                                <span className="legend-pct mono">{Number(s.allocationPercent).toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Sector Bar Chart */}
                                <section className="glass-card sector-bar-section">
                                    <h2 className="section-title" style={{ padding: 'var(--space-lg)' }}>Sector Values</h2>
                                    <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={sectors} layout="vertical" margin={{ left: 10, right: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                                <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} stroke="var(--text-muted)" fontSize={11} />
                                                <YAxis type="category" dataKey="sector" stroke="var(--text-muted)" fontSize={12} width={70} />
                                                <Tooltip formatter={(v) => [fmt(v), 'Value']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                                                <Bar dataKey="totalValue" radius={[0, 6, 6, 0]} animationDuration={800}>
                                                    {sectors.map(s => (
                                                        <Cell key={s.sector} fill={SECTOR_COLORS[s.sector] || '#6366f1'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* ─── Recent Trades Tab ─── */}
                        {tab === 'trades' && (
                            <section className="glass-card portfolio-table-section">
                                <h2 className="section-title" style={{ padding: 'var(--space-lg) var(--space-lg) 0' }}>
                                    Recent Trades ({trades.length})
                                </h2>
                                {trades.length === 0 ? (
                                    <div className="portfolio-empty" style={{ padding: 'var(--space-xl)' }}>
                                        <Activity size={36} strokeWidth={1} />
                                        <p>No trades yet.</p>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Symbol</th>
                                                    <th>Side</th>
                                                    <th>Price</th>
                                                    <th>Qty</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trades.map(t => (
                                                    <tr key={t.id} className="animate-fade-in">
                                                        <td className="mono" style={{ fontSize: '0.75rem' }}>
                                                            {new Date(t.executedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td className="holding-ticker">{t.symbol}</td>
                                                        <td>
                                                            <span className={`badge ${t.side === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                                                                {t.side}
                                                            </span>
                                                        </td>
                                                        <td className="mono">₹{Number(t.executionPrice).toFixed(2)}</td>
                                                        <td className="mono">{t.quantity}</td>
                                                        <td className="mono">{fmt(t.totalValue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
