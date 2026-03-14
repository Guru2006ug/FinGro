package DTO;

/**
 * Detailed holding information returned by the portfolio endpoint.
 * Uses a typed DTO instead of raw Map for type-safety and documentation.
 */
public class HoldingResponse {

    private String symbol;
    private String name;
    private String sector;
    private Integer quantity;
    private Double avgCost;
    private Double currentPrice;
    private Double marketValue;
    private Double costBasis;
    private Double pnl;
    private Double pnlPercent;
    private Double dayChange;
    private Double dayChangePercent;
    private Double allocationPercent; // % of total portfolio value

    public HoldingResponse() {}

    // --- Getters & Setters ---

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getAvgCost() { return avgCost; }
    public void setAvgCost(Double avgCost) { this.avgCost = avgCost; }

    public Double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(Double currentPrice) { this.currentPrice = currentPrice; }

    public Double getMarketValue() { return marketValue; }
    public void setMarketValue(Double marketValue) { this.marketValue = marketValue; }

    public Double getCostBasis() { return costBasis; }
    public void setCostBasis(Double costBasis) { this.costBasis = costBasis; }

    public Double getPnl() { return pnl; }
    public void setPnl(Double pnl) { this.pnl = pnl; }

    public Double getPnlPercent() { return pnlPercent; }
    public void setPnlPercent(Double pnlPercent) { this.pnlPercent = pnlPercent; }

    public Double getDayChange() { return dayChange; }
    public void setDayChange(Double dayChange) { this.dayChange = dayChange; }

    public Double getDayChangePercent() { return dayChangePercent; }
    public void setDayChangePercent(Double dayChangePercent) { this.dayChangePercent = dayChangePercent; }

    public Double getAllocationPercent() { return allocationPercent; }
    public void setAllocationPercent(Double allocationPercent) { this.allocationPercent = allocationPercent; }
}
