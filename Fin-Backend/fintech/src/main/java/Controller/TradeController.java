package Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import DTO.TradeResponse;
import Service.OrderService;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    @Autowired
    private OrderService orderService;

    /**
     * GET /api/trades — all trades for the authenticated user.
     * Optional query param: ?symbol=RELIANCE.BO
     */
    @GetMapping
    public ResponseEntity<List<TradeResponse>> getMyTrades(
            @RequestParam(required = false) String symbol,
            Authentication auth) {
        String email = auth.getName();
        List<TradeResponse> trades;
        if (symbol != null && !symbol.isBlank()) {
            trades = orderService.getUserTradesBySymbol(email, symbol);
        } else {
            trades = orderService.getUserTrades(email);
        }
        return ResponseEntity.ok(trades);
    }

    /**
     * GET /api/trades/feed/{symbol} — public trade feed (last 50 trades for a symbol).
     * This endpoint is publicly accessible (permitAll in SecurityConfig).
     */
    @GetMapping("/feed/{symbol}")
    public ResponseEntity<List<TradeResponse>> getPublicTradeFeed(@PathVariable String symbol) {
        List<TradeResponse> trades = orderService.getPublicTradeFeed(symbol.toUpperCase());
        return ResponseEntity.ok(trades);
    }
}
