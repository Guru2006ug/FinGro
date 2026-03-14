import { ArrowDownUp } from 'lucide-react';
import './OrderBook.css';

export default function OrderBook({ orderBook, compact = false }) {
    if (!orderBook) {
        return (
            <div className="orderbook-skeleton">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
            </div>
        );
    }

    const { bids, asks, spread, midPrice } = orderBook;
    const displayAsks = compact ? asks.slice(0, 8) : asks;
    const displayBids = compact ? bids.slice(0, 8) : bids;

    return (
        <div className={`orderbook ${compact ? 'orderbook-compact' : ''}`}>
            {/* Header */}
            <div className="orderbook-header">
                <span>Price</span>
                <span>Qty</span>
                <span>Total</span>
            </div>

            {/* Asks (sell side) — reversed so lowest ask is at bottom */}
            <div className="orderbook-asks">
                {[...displayAsks].reverse().map((ask, i) => (
                    <div key={`ask-${i}`} className="orderbook-row ask-row">
                        <div
                            className="depth-bar ask-depth"
                            style={{ width: `${ask.depth}%` }}
                        />
                        <span className="price mono price-down">{ask.price.toFixed(2)}</span>
                        <span className="qty mono">{ask.quantity.toLocaleString()}</span>
                        <span className="total mono">{ask.total.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            {/* Spread */}
            <div className="orderbook-spread">
                <ArrowDownUp size={14} />
                <span className="mono">{midPrice.toFixed(2)}</span>
                <span className="spread-label">Spread: {spread.toFixed(2)}</span>
            </div>

            {/* Bids (buy side) */}
            <div className="orderbook-bids">
                {displayBids.map((bid, i) => (
                    <div key={`bid-${i}`} className="orderbook-row bid-row">
                        <div
                            className="depth-bar bid-depth"
                            style={{ width: `${bid.depth}%` }}
                        />
                        <span className="price mono price-up">{bid.price.toFixed(2)}</span>
                        <span className="qty mono">{bid.quantity.toLocaleString()}</span>
                        <span className="total mono">{bid.total.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
