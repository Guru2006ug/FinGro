import { useState, useEffect, useRef } from 'react';
import { Send, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import './PlaceOrderForm.css';

export default function PlaceOrderForm({ symbol = 'AAPL', currentPrice = 0, onSubmit }) {
    const [side, setSide] = useState('BUY');
    const [price, setPrice] = useState(currentPrice > 0 ? currentPrice.toFixed(2) : '');
    const [quantity, setQuantity] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }
    const userEditedPrice = useRef(false);

    // Sync price when currentPrice loads or symbol changes
    useEffect(() => {
        if (currentPrice > 0 && !userEditedPrice.current) {
            setPrice(currentPrice.toFixed(2));
        }
    }, [currentPrice]);

    // Reset price when symbol changes
    useEffect(() => {
        userEditedPrice.current = false;
        setPrice(currentPrice > 0 ? currentPrice.toFixed(2) : '');
        setQuantity('');
    }, [symbol]);

    const total = price && quantity ? (parseFloat(price) * parseInt(quantity || 0)).toFixed(2) : '0.00';

    async function handleSubmit(e) {
        e.preventDefault();
        if (!price || !quantity) return;

        setSubmitting(true);
        setFeedback(null);
        try {
            await onSubmit?.({
                symbol,
                side,
                price: parseFloat(price),
                quantity: parseInt(quantity),
            });
            const totalVal = (parseFloat(price) * parseInt(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            setFeedback({
                type: 'success',
                message: `${side} order filled — ${parseInt(quantity)} × ₹${parseFloat(price).toFixed(2)} = ₹${totalVal}`,
            });
            setQuantity('');
            // Auto-clear success message after 5 seconds
            setTimeout(() => setFeedback(null), 5000);
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Order failed' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="place-order-form" onSubmit={handleSubmit}>
            {/* Side Toggle */}
            <div className="side-toggle">
                <button
                    type="button"
                    className={`side-btn side-buy ${side === 'BUY' ? 'active' : ''}`}
                    onClick={() => setSide('BUY')}
                >
                    <TrendingUp size={16} />
                    Buy
                </button>
                <button
                    type="button"
                    className={`side-btn side-sell ${side === 'SELL' ? 'active' : ''}`}
                    onClick={() => setSide('SELL')}
                >
                    <TrendingDown size={16} />
                    Sell
                </button>
            </div>

            {/* Symbol Display */}
            <div className="form-symbol">
                <span className="form-label">Symbol</span>
                <span className="mono form-symbol-value">{symbol}</span>
            </div>

            {/* Price */}
            <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    onChange={e => { userEditedPrice.current = true; setPrice(e.target.value); }}
                    className="input input-mono"
                    placeholder="0.00"
                    required
                />
            </div>

            {/* Quantity */}
            <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                    type="number"
                    step="1"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="input input-mono"
                    placeholder="0"
                    required
                />
                <div className="qty-presets">
                    {[10, 50, 100, 500].map(q => (
                        <button
                            key={q}
                            type="button"
                            className="qty-preset-btn"
                            onClick={() => setQuantity(String(q))}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
                <div className="summary-row">
                    <span>Order Type</span>
                    <span className="mono">Limit</span>
                </div>
                <div className="summary-row">
                    <span>Est. Total</span>
                    <span className="mono">₹{parseFloat(total).toLocaleString()}</span>
                </div>
            </div>

            {/* Order Feedback */}
            {feedback && (
                <div className={`order-feedback ${feedback.type === 'success' ? 'feedback-success' : 'feedback-error'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                className={`btn btn-lg ${side === 'BUY' ? 'btn-buy' : 'btn-sell'} submit-btn`}
                disabled={submitting || !price || !quantity}
            >
                <Send size={16} />
                {submitting
                    ? 'Placing...'
                    : `${side === 'BUY' ? 'Buy' : 'Sell'} ${symbol}`}
            </button>
        </form>
    );
}
