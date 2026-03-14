package Controller;

import DTO.CandleDataResponse;
import DTO.MarketDataResponse;
import Service.MarketDataService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketDataController {

    @Autowired
    private MarketDataService marketDataService;

    /**
     * GET /api/market/quotes
     * Returns real-time quotes for all tracked symbols.
     */
    @GetMapping("/quotes")
    public ResponseEntity<List<MarketDataResponse>> getAllQuotes() {
        List<MarketDataResponse> data = marketDataService.getAllQuotes();
        return ResponseEntity.ok(data);
    }

    /**
     * GET /api/market/quote/{symbol}
     * Returns real-time quote for a single symbol.
     */
    @GetMapping("/quote/{symbol}")
    public ResponseEntity<MarketDataResponse> getQuote(@PathVariable String symbol) {
        MarketDataResponse data = marketDataService.getQuote(symbol.toUpperCase());
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(data);
    }

    /**
     * GET /api/market/candles/{symbol}?resolution=1&from=EPOCH&to=EPOCH
     * Returns candle/chart data for a symbol.
     */
    @GetMapping("/candles/{symbol}")
    public ResponseEntity<CandleDataResponse> getCandles(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1") String resolution,
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {

        CandleDataResponse data;
        if (from != null && to != null) {
            data = marketDataService.getCandles(symbol.toUpperCase(), resolution, from, to);
        } else {
            data = marketDataService.getIntradayCandles(symbol.toUpperCase());
        }
        return ResponseEntity.ok(data);
    }

    /**
     * GET /api/market/candles/{symbol}/daily
     * Returns daily candle data for the last 30 days.
     */
    @GetMapping("/candles/{symbol}/daily")
    public ResponseEntity<CandleDataResponse> getDailyCandles(@PathVariable String symbol) {
        CandleDataResponse data = marketDataService.getDailyCandles(symbol.toUpperCase());
        return ResponseEntity.ok(data);
    }

    /**
     * GET /api/market/symbols
     * Returns the list of tracked symbols.
     */
    @GetMapping("/symbols")
    public ResponseEntity<List<Map<String, String>>> getSymbols() {
        return ResponseEntity.ok(marketDataService.getSymbols());
    }
}
