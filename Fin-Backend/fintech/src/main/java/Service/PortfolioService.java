package Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import DTO.HoldingResponse;
import DTO.MarketDataResponse;
import DTO.PortfolioSummary;
import DTO.PortfolioSummary.SectorAllocation;
import Model.FinUser;
import Model.Holding;
import Model.Stock;
import Repository.FinUserRepository;
import Repository.HoldingRepository;
import Repository.StockRepository;

@Service
public class PortfolioService {

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private FinUserRepository finUserRepository;

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private StockRepository stockRepository;

    /**
     * Build the rich portfolio summary in one call.
     * Includes: account overview, detailed holdings with day-change,
     * sector breakdown, top gainer, top loser.
     */
    public PortfolioSummary getPortfolioSummary(String email) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Holding> holdings = holdingRepository.findByUserIdAndQuantityGreaterThan(user.getId(), 0);

        // Pre-fetch stock metadata (sector info)
        Map<String, Stock> stockMap = new HashMap<>();
        for (Stock s : stockRepository.findByActiveTrue()) {
            stockMap.put(s.getSymbol(), s);
        }

        double totalHoldingsValue = 0;
        double totalCost = 0;
        double todayPnl = 0;

        List<HoldingResponse> holdingResponses = new ArrayList<>();

        for (Holding h : holdings) {
            HoldingResponse hr = new HoldingResponse();
            hr.setSymbol(h.getSymbol());
            hr.setName(h.getName());
            hr.setQuantity(h.getQuantity());
            hr.setAvgCost(round(h.getAvgCost()));

            // Sector from stocks table
            Stock stock = stockMap.get(h.getSymbol());
            hr.setSector(stock != null ? stock.getSector() : "Other");

            // Fetch live quote
            double currentPrice = h.getAvgCost();
            double dayChange = 0;
            double dayChangePercent = 0;
            double previousClose = currentPrice;

            try {
                MarketDataResponse quote = marketDataService.getQuote(h.getSymbol());
                if (quote != null && quote.getPrice() > 0) {
                    currentPrice = quote.getPrice();
                    dayChange = quote.getChange();
                    dayChangePercent = quote.getChangePercent();
                    previousClose = quote.getPreviousClose() > 0 ? quote.getPreviousClose() : currentPrice;
                }
            } catch (Exception e) {
                // fallback to avgCost
            }

            double marketValue = h.getQuantity() * currentPrice;
            double costBasis = h.getQuantity() * h.getAvgCost();
            double pnl = marketValue - costBasis;
            double pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

            // Today's P&L for this holding = qty × (currentPrice - previousClose)
            double holdingTodayPnl = h.getQuantity() * dayChange;

            hr.setCurrentPrice(round(currentPrice));
            hr.setMarketValue(round(marketValue));
            hr.setCostBasis(round(costBasis));
            hr.setPnl(round(pnl));
            hr.setPnlPercent(round(pnlPercent));
            hr.setDayChange(round(dayChange));
            hr.setDayChangePercent(round(dayChangePercent));

            totalHoldingsValue += marketValue;
            totalCost += costBasis;
            todayPnl += holdingTodayPnl;

            holdingResponses.add(hr);
        }

        // Capture final values for use in lambdas
        final double finalTotalHoldingsValue = totalHoldingsValue;
        final double finalTotalCost = totalCost;
        final double finalTodayPnl = todayPnl;

        // Compute allocation percentages
        for (HoldingResponse hr : holdingResponses) {
            hr.setAllocationPercent(finalTotalHoldingsValue > 0
                    ? round((hr.getMarketValue() / finalTotalHoldingsValue) * 100) : 0);
        }

        // ---- Sector breakdown ----
        Map<String, Double> sectorValues = new HashMap<>();
        for (HoldingResponse hr : holdingResponses) {
            sectorValues.merge(hr.getSector(), hr.getMarketValue(), Double::sum);
        }
        List<SectorAllocation> sectorBreakdown = sectorValues.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> new SectorAllocation(
                        e.getKey(),
                        round(e.getValue()),
                        finalTotalHoldingsValue > 0 ? round((e.getValue() / finalTotalHoldingsValue) * 100) : 0))
                .collect(Collectors.toList());

        // ---- Top gainer / loser ----
        HoldingResponse topGainer = holdingResponses.stream()
                .max(Comparator.comparingDouble(HoldingResponse::getPnlPercent))
                .orElse(null);
        HoldingResponse topLoser = holdingResponses.stream()
                .min(Comparator.comparingDouble(HoldingResponse::getPnlPercent))
                .orElse(null);

        // ---- Build summary ----
        double totalPnl = finalTotalHoldingsValue - finalTotalCost;
        double totalPnlPercent = finalTotalCost > 0 ? (totalPnl / finalTotalCost) * 100 : 0;
        double todayPnlPercent = (finalTotalHoldingsValue - finalTodayPnl) > 0
                ? (finalTodayPnl / (finalTotalHoldingsValue - finalTodayPnl)) * 100 : 0;

        PortfolioSummary summary = new PortfolioSummary();
        summary.setBalance(round(user.getBalance()));
        summary.setHoldingsValue(round(finalTotalHoldingsValue));
        summary.setTotalEquity(round(user.getBalance() + finalTotalHoldingsValue));
        summary.setTotalInvested(round(finalTotalCost));
        summary.setTotalPnl(round(totalPnl));
        summary.setTotalPnlPercent(round(totalPnlPercent));
        summary.setTodayPnl(round(finalTodayPnl));
        summary.setTodayPnlPercent(round(todayPnlPercent));
        summary.setPositions(holdings.size());
        summary.setHoldings(holdingResponses);
        summary.setSectorBreakdown(sectorBreakdown);
        summary.setTopGainer(topGainer);
        summary.setTopLoser(topLoser);

        return summary;
    }

    // ----- Legacy endpoints (still used by existing frontend) -----

    /**
     * Get user's holdings with live market prices and P&L.
     */
    public List<Map<String, Object>> getPortfolio(String email) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Holding> holdings = holdingRepository.findByUserIdAndQuantityGreaterThan(user.getId(), 0);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Holding h : holdings) {
            Map<String, Object> item = new HashMap<>();
            item.put("symbol", h.getSymbol());
            item.put("name", h.getName());
            item.put("quantity", h.getQuantity());
            item.put("avgCost", round(h.getAvgCost()));

            double currentPrice = h.getAvgCost();
            try {
                MarketDataResponse quote = marketDataService.getQuote(h.getSymbol());
                if (quote != null && quote.getPrice() > 0) {
                    currentPrice = quote.getPrice();
                }
            } catch (Exception e) {
                // fallback
            }

            double marketValue = h.getQuantity() * currentPrice;
            double costBasis = h.getQuantity() * h.getAvgCost();
            double pnl = marketValue - costBasis;
            double pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

            item.put("currentPrice", round(currentPrice));
            item.put("marketValue", round(marketValue));
            item.put("costBasis", round(costBasis));
            item.put("pnl", round(pnl));
            item.put("pnlPercent", round(pnlPercent));

            result.add(item);
        }

        return result;
    }

    /**
     * Get account summary: balance, total equity, positions count.
     */
    public Map<String, Object> getAccountInfo(String email) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Holding> holdings = holdingRepository.findByUserIdAndQuantityGreaterThan(user.getId(), 0);

        double totalHoldingsValue = 0;
        double totalCost = 0;

        for (Holding h : holdings) {
            double currentPrice = h.getAvgCost();
            try {
                MarketDataResponse quote = marketDataService.getQuote(h.getSymbol());
                if (quote != null && quote.getPrice() > 0) {
                    currentPrice = quote.getPrice();
                }
            } catch (Exception e) {
                // fallback
            }
            totalHoldingsValue += h.getQuantity() * currentPrice;
            totalCost += h.getQuantity() * h.getAvgCost();
        }

        double totalPnl = totalHoldingsValue - totalCost;
        double totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

        Map<String, Object> account = new HashMap<>();
        account.put("balance", round(user.getBalance()));
        account.put("holdingsValue", round(totalHoldingsValue));
        account.put("totalEquity", round(user.getBalance() + totalHoldingsValue));
        account.put("totalPnl", round(totalPnl));
        account.put("totalPnlPercent", round(totalPnlPercent));
        account.put("positions", holdings.size());

        return account;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
