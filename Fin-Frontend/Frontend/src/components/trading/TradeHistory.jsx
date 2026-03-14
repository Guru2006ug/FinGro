import './TradeHistory.css';

export default function TradeHistory({ trades, compact = false }) {
    const displayTrades = compact ? trades.slice(0, 12) : trades;

    /** Parse timestamp from either epoch ms, ISO string, or Date-like array. */
    function formatTime(ts) {
        try {
            const d = new Date(ts);
            if (isNaN(d.getTime())) return '--:--';
            return d.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return '--:--';
        }
    }

    return (
        <div className="trade-history">
            <div className="trade-history-header">
                <span>Price</span>
                <span>Qty</span>
                <span>Time</span>
            </div>
            <div className="trade-history-body">
                {displayTrades.map(trade => (
                    <div
                        key={trade.id}
                        className={`trade-row ${trade.side === 'BUY' ? 'trade-buy' : 'trade-sell'}`}
                    >
                        <span className={`mono ${trade.side === 'BUY' ? 'price-up' : 'price-down'}`}>
                            {Number(trade.price).toFixed(2)}
                        </span>
                        <span className="mono trade-qty">{Number(trade.quantity).toLocaleString()}</span>
                        <span className="trade-time">
                            {formatTime(trade.timestamp)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
