import { useEffect, useRef, memo } from 'react';
import './TradingViewChart.css';

// Map our internal symbols to TradingView format (NSE exchange)
const SYMBOL_MAP = {
    'RELIANCE.BO': 'BSE:RELIANCE',
    'TCS.BO': 'BSE:TCS',
    'INFY.BO': 'BSE:INFY',
    'HDFCBANK.BO': 'BSE:HDFCBANK',
    'ICICIBANK.BO': 'BSE:ICICIBANK',
    'HINDUNILVR.BO': 'BSE:HINDUNILVR',
    'ITC.BO': 'BSE:ITC',
    'SBIN.BO': 'BSE:SBIN',
};

function getTradingViewSymbol(symbol) {
    return SYMBOL_MAP[symbol] || `BSE:${symbol.replace('.BO', '').replace('.NS', '')}`;
}

/**
 * Full-size TradingView Advanced Chart — live data from TradingView.
 * Uses the embed-widget-advanced-chart (no tv.js, no popup).
 */
function TradingViewChart({ symbol = 'RELIANCE.BO', height = 400, interval = 'D', theme = 'dark' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous widget
        containerRef.current.innerHTML = '';

        const tvSymbol = getTradingViewSymbol(symbol);

        // Create the TradingView embed widget container
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.style.height = '100%';
        widgetDiv.style.width = '100%';
        containerRef.current.appendChild(widgetDiv);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: tvSymbol,
            interval: interval,
            timezone: 'Asia/Kolkata',
            theme: theme,
            style: '1',
            locale: 'en',
            allow_symbol_change: false,
            save_image: false,
            calendar: false,
            hide_volume: false,
            support_host: 'https://www.tradingview.com',
        });

        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol, interval, theme, height]);

    return (
        <div className="tradingview-chart-wrapper" style={{ height }}>
            <div
                className="tradingview-widget-container"
                ref={containerRef}
                style={{ height: '100%', width: '100%' }}
            />
        </div>
    );
}

export default memo(TradingViewChart);
