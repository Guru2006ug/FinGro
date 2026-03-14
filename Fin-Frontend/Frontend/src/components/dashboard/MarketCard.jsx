import { TrendingUp, TrendingDown } from 'lucide-react';
import TradingViewMiniChart from '../charts/TradingViewMiniChart';
import './MarketCard.css';

export default function MarketCard({ data, onClick }) {
    const isUp = data.change >= 0;
    const displaySymbol = data.symbol.replace('.BO', '').replace('.NS', '');

    return (
        <div className="market-card glass-card" onClick={() => onClick?.(data.symbol)}>
            <div className="mc-header">
                <div className="mc-symbol-group">
                    <span className="mc-symbol">{displaySymbol}</span>
                    <span className="mc-name">{data.name}</span>
                </div>
                <div className={`mc-change ${isUp ? 'mc-up' : 'mc-down'}`}>
                    {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{isUp ? '+' : ''}{data.changePercent.toFixed(2)}%</span>
                </div>
            </div>
            <div className="mc-price-row">
                <span className="mc-price mono">₹{data.price.toFixed(2)}</span>
                <span className={`mc-change-value mono ${isUp ? 'price-up' : 'price-down'}`}>
                    {isUp ? '+' : ''}{data.change.toFixed(2)}
                </span>
            </div>
            {/* Mini TradingView Chart */}
            <div className="mc-chart">
                <TradingViewMiniChart symbol={data.symbol} height={160} />
            </div>
            <div className="mc-footer">
                <div className="mc-stat">
                    <span className="mc-stat-label">Vol</span>
                    <span className="mc-stat-value mono">
                        {(data.volume / 1000000).toFixed(1)}M
                    </span>
                </div>
                <div className="mc-stat">
                    <span className="mc-stat-label">High</span>
                    <span className="mc-stat-value mono">₹{data.high.toFixed(2)}</span>
                </div>
                <div className="mc-stat">
                    <span className="mc-stat-label">Low</span>
                    <span className="mc-stat-value mono">₹{data.low.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
