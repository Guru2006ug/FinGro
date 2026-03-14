package DTO;

import java.util.List;
import java.util.Map;

/**
 * Complete portfolio summary returned by GET /api/portfolio/summary.
 * Provides everything the frontend needs in a single request.
 */
public class PortfolioSummary {

    // --- Account overview ---
    private Double balance;
    private Double holdingsValue;
    private Double totalEquity;
    private Double totalInvested;     // total cost basis across all holdings
    private Double totalPnl;
    private Double totalPnlPercent;
    private Double todayPnl;          // change since previous close
    private Double todayPnlPercent;
    private Integer positions;

    // --- Holdings detail ---
    private List<HoldingResponse> holdings;

    // --- Sector breakdown: sectorName → value ---
    private List<SectorAllocation> sectorBreakdown;

    // --- Top performers ---
    private HoldingResponse topGainer;
    private HoldingResponse topLoser;

    public PortfolioSummary() {}

    // --- Getters & Setters ---

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public Double getHoldingsValue() { return holdingsValue; }
    public void setHoldingsValue(Double holdingsValue) { this.holdingsValue = holdingsValue; }

    public Double getTotalEquity() { return totalEquity; }
    public void setTotalEquity(Double totalEquity) { this.totalEquity = totalEquity; }

    public Double getTotalInvested() { return totalInvested; }
    public void setTotalInvested(Double totalInvested) { this.totalInvested = totalInvested; }

    public Double getTotalPnl() { return totalPnl; }
    public void setTotalPnl(Double totalPnl) { this.totalPnl = totalPnl; }

    public Double getTotalPnlPercent() { return totalPnlPercent; }
    public void setTotalPnlPercent(Double totalPnlPercent) { this.totalPnlPercent = totalPnlPercent; }

    public Double getTodayPnl() { return todayPnl; }
    public void setTodayPnl(Double todayPnl) { this.todayPnl = todayPnl; }

    public Double getTodayPnlPercent() { return todayPnlPercent; }
    public void setTodayPnlPercent(Double todayPnlPercent) { this.todayPnlPercent = todayPnlPercent; }

    public Integer getPositions() { return positions; }
    public void setPositions(Integer positions) { this.positions = positions; }

    public List<HoldingResponse> getHoldings() { return holdings; }
    public void setHoldings(List<HoldingResponse> holdings) { this.holdings = holdings; }

    public List<SectorAllocation> getSectorBreakdown() { return sectorBreakdown; }
    public void setSectorBreakdown(List<SectorAllocation> sectorBreakdown) { this.sectorBreakdown = sectorBreakdown; }

    public HoldingResponse getTopGainer() { return topGainer; }
    public void setTopGainer(HoldingResponse topGainer) { this.topGainer = topGainer; }

    public HoldingResponse getTopLoser() { return topLoser; }
    public void setTopLoser(HoldingResponse topLoser) { this.topLoser = topLoser; }

    // --- Nested sector DTO ---
    public static class SectorAllocation {
        private String sector;
        private Double value;
        private Double percent;

        public SectorAllocation() {}
        public SectorAllocation(String sector, Double value, Double percent) {
            this.sector = sector;
            this.value = value;
            this.percent = percent;
        }

        public String getSector() { return sector; }
        public void setSector(String sector) { this.sector = sector; }

        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }

        public Double getPercent() { return percent; }
        public void setPercent(Double percent) { this.percent = percent; }
    }
}
