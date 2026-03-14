import { useState, useEffect, useCallback } from 'react';
import { Filter } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import OrdersTable from '../components/trading/OrdersTable';
import { getOrders, cancelOrder } from '../services/api';
import './Orders.css';

const FILTER_OPTIONS = ['ALL', 'OPEN', 'PARTIAL', 'FILLED', 'CANCELLED'];

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getOrders();
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    async function handleCancel(orderId) {
        try {
            const updated = await cancelOrder(orderId);
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o)
            );
        } catch (err) {
            console.error('Failed to cancel order:', err);
        }
    }

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    const counts = {
        ALL: orders.length,
        OPEN: orders.filter(o => o.status === 'OPEN').length,
        PARTIAL: orders.filter(o => o.status === 'PARTIAL').length,
        FILLED: orders.filter(o => o.status === 'FILLED').length,
        CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
    };

    return (
        <div className="orders-page animate-fade-in">
            <TopBar title="Orders" subtitle="Order history & management" />

            <div className="orders-content">
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-label">
                        <Filter size={16} />
                        <span>Filter</span>
                    </div>
                    <div className="filter-pills">
                        {FILTER_OPTIONS.map(f => (
                            <button
                                key={f}
                                className={`filter-pill ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                                <span className="filter-count">{counts[f]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <OrdersTable
                    orders={filteredOrders}
                    onCancel={handleCancel}
                />

                {/* Summary */}
                <div className="orders-summary">
                    <span>Showing {filteredOrders.length} of {orders.length} orders</span>
                </div>
            </div>
        </div>
    );
}
