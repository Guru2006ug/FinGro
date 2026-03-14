import { useEffect, useRef, memo } from 'react';

// Map our internal symbols to TradingView format (BSE exchange)
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
 * Mini TradingView chart widget — a small sparkline-style chart for dashboard cards.
 * Uses the TradingView Mini Symbol Overview embed widget for live data.
 */
function TradingViewMiniChart({ symbol = 'RELIANCE.BO', width = '100%', height = 120, theme = 'dark' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = '';

        const tvSymbol = getTradingViewSymbol(symbol);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            symbol: tvSymbol,
            width: '100%',
            height: height,
            locale: 'en',
            dateRange: '1M',
            colorTheme: theme,
            isTransparent: true,
            autosize: false,
            largeChartUrl: '',
            noTimeScale: true,
            chartOnly: false,
        });

        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol, width, height, theme]);

    return (
        <div
            ref={containerRef}
            className="tradingview-mini-chart"
            style={{ width, height, overflow: 'hidden', borderRadius: '8px' }}
        />
    );
}

export default memo(TradingViewMiniChart);
