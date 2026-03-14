import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TradingViewChart from '../components/charts/TradingViewChart';
import './FullChart.css';

export default function FullChart() {
    const location = useLocation();
    const navigate = useNavigate();
    const symbol = location.state?.symbol || 'RELIANCE.BO';
    const displaySymbol = symbol.replace('.BO', '').replace('.NS', '');

    return (
        <div className="fullchart-page animate-fade-in">
            <div className="fullchart-header">
                <button className="fullchart-back-btn" onClick={() => navigate('/trading', { state: { symbol } })}>
                    <ArrowLeft size={18} />
                    <span>Back to Trading</span>
                </button>
                <div className="fullchart-title-group">
                    <h2 className="fullchart-title">{displaySymbol} — Live Chart</h2>
                    <span className="fullchart-live-badge">
                        <span className="live-dot" /> LIVE
                    </span>
                </div>
            </div>
            <div className="fullchart-container">
                <TradingViewChart symbol={symbol} height={window.innerHeight - 100} />
            </div>
        </div>
    );
}
