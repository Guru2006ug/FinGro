import { X } from 'lucide-react';
import './OrdersTable.css';

const statusClass = {
    OPEN: 'badge-open',
    PARTIAL: 'badge-partial',
    FILLED: 'badge-filled',
    CANCELLED: 'badge-cancelled',
};

export default function OrdersTable({ orders, onCancel, showSymbol = true, compact = false }) {
    const displayOrders = compact ? orders.slice(0, 10) : orders;

    return (
        <div className="table-container glass-card">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        {showSymbol && <th>Symbol</th>}
                        <th>Side</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Filled</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {displayOrders.map(order => (
                        <tr key={order.id} className="animate-fade-in">
                            <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                #{order.id}
                            </td>
                            {showSymbol && (
                                <td>
                                    <span className="order-symbol">{order.symbol}</span>
                                </td>
                            )}
                            <td>
                                <span className={`badge ${order.side === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                                    {order.side}
                                </span>
                            </td>
                            <td className="mono">${order.price.toFixed(2)}</td>
                            <td className="mono">{order.quantity.toLocaleString()}</td>
                            <td className="mono">
                                {order.filledQuantity.toLocaleString()}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                    {' '}/ {order.quantity.toLocaleString()}
                                </span>
                            </td>
                            <td>
                                <span className={`badge ${statusClass[order.status]}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="order-time">
                                {new Date(order.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td>
                                {(order.status === 'OPEN' || order.status === 'PARTIAL') && (
                                    <button
                                        className="cancel-btn"
                                        onClick={() => onCancel?.(order.id)}
                                        title="Cancel order"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {displayOrders.length === 0 && (
                <div className="empty-table">No orders found</div>
            )}
        </div>
    );
}
