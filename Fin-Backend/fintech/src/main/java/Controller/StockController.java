package Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import DTO.StockResponse;
import Model.Stock;
import Repository.StockRepository;

/**
 * Exposes the catalogue of tradeable stocks.
 * Publicly accessible (permitAll via /api/market/** or we add /api/stocks/** to SecurityConfig).
 */
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private StockRepository stockRepository;

    /** GET /api/stocks — all active stocks. */
    @GetMapping
    public ResponseEntity<List<StockResponse>> getAllStocks() {
        List<StockResponse> stocks = stockRepository.findByActiveTrue()
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    /** GET /api/stocks/{symbol} — single stock info. */
    @GetMapping("/{symbol}")
    public ResponseEntity<StockResponse> getStock(@PathVariable String symbol) {
        Stock stock = stockRepository.findBySymbol(symbol.toUpperCase()).orElse(null);
        if (stock == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDto(stock));
    }

    /** GET /api/stocks/sector/{sector} — stocks in a sector. */
    @GetMapping("/sector/{sector}")
    public ResponseEntity<List<StockResponse>> getBySector(@PathVariable String sector) {
        List<StockResponse> stocks = stockRepository.findBySectorIgnoreCase(sector)
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    private StockResponse toDto(Stock s) {
        return new StockResponse(s.getId(), s.getSymbol(), s.getName(), s.getSector(), s.getActive());
    }
}
