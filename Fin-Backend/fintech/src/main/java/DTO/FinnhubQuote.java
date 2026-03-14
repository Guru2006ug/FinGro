package DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Maps the Finnhub /quote endpoint response.
 * Fields: c=current, d=change, dp=percentChange, h=high, l=low, o=open, pc=previousClose, t=timestamp
 */
public class FinnhubQuote {

    @JsonProperty("c")
    private double currentPrice;

    @JsonProperty("d")
    private double change;

    @JsonProperty("dp")
    private double percentChange;

    @JsonProperty("h")
    private double high;

    @JsonProperty("l")
    private double low;

    @JsonProperty("o")
    private double open;

    @JsonProperty("pc")
    private double previousClose;

    @JsonProperty("t")
    private long timestamp;

    public FinnhubQuote() {}

    public double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

    public double getChange() { return change; }
    public void setChange(double change) { this.change = change; }

    public double getPercentChange() { return percentChange; }
    public void setPercentChange(double percentChange) { this.percentChange = percentChange; }

    public double getHigh() { return high; }
    public void setHigh(double high) { this.high = high; }

    public double getLow() { return low; }
    public void setLow(double low) { this.low = low; }

    public double getOpen() { return open; }
    public void setOpen(double open) { this.open = open; }

    public double getPreviousClose() { return previousClose; }
    public void setPreviousClose(double previousClose) { this.previousClose = previousClose; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
