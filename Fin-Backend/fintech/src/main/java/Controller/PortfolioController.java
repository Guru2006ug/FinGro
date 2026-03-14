package Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import DTO.PortfolioSummary;
import Service.PortfolioService;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    /**
     * GET /api/portfolio/summary — full portfolio summary with holdings, sector breakdown, top performers
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getPortfolioSummary(Authentication authentication) {
        try {
            String email = authentication.getName();
            PortfolioSummary summary = portfolioService.getPortfolioSummary(email);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/portfolio — returns user's holdings with live P&L
     */
    @GetMapping
    public ResponseEntity<?> getPortfolio(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Map<String, Object>> holdings = portfolioService.getPortfolio(email);
            return ResponseEntity.ok(holdings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/portfolio/account — returns account summary (balance, equity, P&L)
     */
    @GetMapping("/account")
    public ResponseEntity<?> getAccountInfo(Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> account = portfolioService.getAccountInfo(email);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
