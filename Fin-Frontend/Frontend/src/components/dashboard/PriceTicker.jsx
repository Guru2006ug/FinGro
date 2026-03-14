import { useMarketData } from '../../hooks/useMarketData';
import './PriceTicker.css';

export default function PriceTicker() {
    const { marketData } = useMarketData(3000);

    if (!marketData.length) return null;

    // Double the data for seamless scrolling loop
    const tickerData = [...marketData, ...marketData];

    return (
        <div className="ticker-bar">
            <div className="ticker-track">
                {tickerData.map((stock, i) => {
                    const isUp = stock.change >= 0;
                    return (
                        <div key={`${stock.symbol}-${i}`} className="ticker-item">
                            <span className="ticker-symbol">{stock.symbol}</span>
                            <span className="ticker-price mono">${stock.price.toFixed(2)}</span>
                            <span className={`ticker-change mono ${isUp ? 'price-up' : 'price-down'}`}>
                                {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
