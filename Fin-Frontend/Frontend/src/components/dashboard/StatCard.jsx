import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, trend, trendValue, color = 'default' }) {
    return (
        <div className={`stat-card glass-card stat-${color}`}>
            <div className="stat-icon-wrap">
                {Icon && <Icon size={20} />}
            </div>
            <div className="stat-content">
                <span className="stat-label">{label}</span>
                <span className="stat-value mono">{value}</span>
                {trendValue && (
                    <span className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </span>
                )}
            </div>
        </div>
    );
}
