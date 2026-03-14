import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import './PriceChart.css';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <span className="tooltip-time">{label}</span>
            <span className="tooltip-price mono">${payload[0].value.toFixed(2)}</span>
            {payload[1] && (
                <span className="tooltip-vol mono">Vol: {payload[1].value.toLocaleString()}</span>
            )}
        </div>
    );
}

export default function PriceChart({ data, height = 300, showVolume = false }) {
    if (!data || data.length === 0) {
        return <div className="chart-skeleton" style={{ height }} />;
    }

    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    const isUp = data[data.length - 1].price >= data[0].price;
    const color = isUp ? '#10b981' : '#ef4444';

    return (
        <div className="price-chart">
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148,163,184,0.06)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        domain={[min - padding, max + padding]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        tickFormatter={v => `$${v.toFixed(0)}`}
                        width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={2}
                        fill="url(#priceGradient)"
                        animationDuration={800}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
