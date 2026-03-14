package DTO;

/**
 * Unified market data response for the frontend MarketCard component.
 */
public class MarketDataResponse {

    private String symbol;
    private String name;
    private double price;
    private double previousClose;
    private double change;
    private double changePercent;
    private long volume;
    private double high;
    private double low;
    private double open;

    public MarketDataResponse() {}

    public MarketDataResponse(String symbol, String name, double price, double previousClose,
                              double change, double changePercent, long volume,
                              double high, double low, double open) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.previousClose = previousClose;
        this.change = change;
        this.changePercent = changePercent;
        this.volume = volume;
        this.high = high;
        this.low = low;
        this.open = open;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getPreviousClose() { return previousClose; }
    public void setPreviousClose(double previousClose) { this.previousClose = previousClose; }

    public double getChange() { return change; }
    public void setChange(double change) { this.change = change; }

    public double getChangePercent() { return changePercent; }
    public void setChangePercent(double changePercent) { this.changePercent = changePercent; }

    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }

    public double getHigh() { return high; }
    public void setHigh(double high) { this.high = high; }

    public double getLow() { return low; }
    public void setLow(double low) { this.low = low; }

    public double getOpen() { return open; }
    public void setOpen(double open) { this.open = open; }
}
