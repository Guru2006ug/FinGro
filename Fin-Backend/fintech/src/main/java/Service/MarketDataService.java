package Service;

import DTO.CandleDataResponse;
import DTO.CandleDataResponse.CandlePoint;
import DTO.FinnhubCandle;
import DTO.FinnhubQuote;
import DTO.MarketDataResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;

@Service
public class MarketDataService {

    private static final String FINNHUB_BASE = "https://finnhub.io/api/v1";

    @Value("${finnhub.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    // Supported symbols with display names
    private static final Map<String, String> SYMBOLS = new LinkedHashMap<>();
    static {
        SYMBOLS.put("RELIANCE.BO", "Reliance Industries");
        SYMBOLS.put("TCS.BO", "Tata Consultancy Services");
        SYMBOLS.put("INFY.BO", "Infosys Ltd.");
        SYMBOLS.put("HDFCBANK.BO", "HDFC Bank Ltd.");
        SYMBOLS.put("ICICIBANK.BO", "ICICI Bank Ltd.");
        SYMBOLS.put("HINDUNILVR.BO", "Hindustan Unilever");
        SYMBOLS.put("ITC.BO", "ITC Limited");
        SYMBOLS.put("SBIN.BO", "State Bank of India");
    }

    // In-memory cache to avoid hitting Finnhub rate limits (60 calls/min on free tier)
    private final ConcurrentHashMap<String, CachedQuote> quoteCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5_000; // 5 second cache

    public MarketDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get real-time quote for a single symbol via Finnhub.
     */
    public MarketDataResponse getQuote(String symbol) {
        CachedQuote cached = quoteCache.get(symbol);
        if (cached != null && !cached.isExpired()) {
            return cached.data;
        }

        try {
            String url = FINNHUB_BASE + "/quote?symbol=" + symbol + "&token=" + apiKey;
            FinnhubQuote quote = restTemplate.getForObject(url, FinnhubQuote.class);

            if (quote == null || quote.getCurrentPrice() == 0) {
                return null;
            }

            String name = SYMBOLS.getOrDefault(symbol, symbol);
            MarketDataResponse response = new MarketDataResponse(
                    symbol,
                    name,
                    round(quote.getCurrentPrice()),
                    round(quote.getPreviousClose()),
                    round(quote.getChange()),
                    round(quote.getPercentChange()),
                    0, // Finnhub free tier doesn't provide volume in /quote; we use candle data for that
                    round(quote.getHigh()),
                    round(quote.getLow()),
                    round(quote.getOpen())
            );

            quoteCache.put(symbol, new CachedQuote(response));
            return response;
        } catch (Exception e) {
            System.err.println("Failed to fetch quote for " + symbol + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Get real-time quotes for all tracked symbols (parallel requests).
     */
    public List<MarketDataResponse> getAllQuotes() {
        List<MarketDataResponse> results = Collections.synchronizedList(new ArrayList<>());
        ExecutorService executor = Executors.newFixedThreadPool(SYMBOLS.size());
        List<Future<?>> futures = new ArrayList<>();

        for (String symbol : SYMBOLS.keySet()) {
            futures.add(executor.submit(() -> {
                try {
                    MarketDataResponse data = getQuote(symbol);
                    if (data != null) {
                        results.add(data);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to fetch quote for " + symbol + ": " + e.getMessage());
                }
            }));
        }

        // Wait for all
        for (Future<?> f : futures) {
            try {
                f.get(10, TimeUnit.SECONDS);
            } catch (Exception e) {
                // skip
            }
        }
        executor.shutdown();

        // Sort to maintain consistent order
        results.sort(Comparator.comparingInt(r -> new ArrayList<>(SYMBOLS.keySet()).indexOf(r.getSymbol())));
        return results;
    }

    /**
     * Get candle data for a symbol.
     * Resolution: 1 = 1 minute, 5 = 5 minutes, D = daily, W = weekly, M = monthly.
     * Note: Finnhub free tier only supports D/W/M resolutions.
     */
    public CandleDataResponse getCandles(String symbol, String resolution, long fromEpoch, long toEpoch) {
        String url = FINNHUB_BASE + "/stock/candle?symbol=" + symbol
                + "&resolution=" + resolution
                + "&from=" + fromEpoch
                + "&to=" + toEpoch
                + "&token=" + apiKey;

        try {
            FinnhubCandle candle = restTemplate.getForObject(url, FinnhubCandle.class);

            if (candle == null || !"ok".equals(candle.getStatus()) || candle.getClose() == null || candle.getClose().isEmpty()) {
                return new CandleDataResponse("no_data", Collections.emptyList());
            }

            List<CandlePoint> points = new ArrayList<>();
            // Use date format for daily resolution, time format for intraday
            boolean isDaily = "D".equalsIgnoreCase(resolution) || "W".equalsIgnoreCase(resolution) || "M".equalsIgnoreCase(resolution);
            DateTimeFormatter fmt = isDaily
                    ? DateTimeFormatter.ofPattern("MMM dd").withZone(ZoneId.systemDefault())
                    : DateTimeFormatter.ofPattern("hh:mm a").withZone(ZoneId.systemDefault());

            for (int i = 0; i < candle.getClose().size(); i++) {
                String time = fmt.format(Instant.ofEpochSecond(candle.getTimestamp().get(i)));
                points.add(new CandlePoint(
                        time,
                        round(candle.getClose().get(i)),
                        round(candle.getOpen().get(i)),
                        round(candle.getHigh().get(i)),
                        round(candle.getLow().get(i)),
                        candle.getVolume().get(i)
                ));
            }

            return new CandleDataResponse("ok", points);
        } catch (Exception e) {
            System.err.println("Failed to fetch candles for " + symbol + ": " + e.getMessage());
            return new CandleDataResponse("no_data", Collections.emptyList());
        }
    }

    /**
     * Get chart data for a symbol — tries daily candles (last 60 days).
     * Finnhub free tier only supports D/W/M resolutions.
     */
    public CandleDataResponse getIntradayCandles(String symbol) {
        long now = Instant.now().getEpochSecond();
        // Use daily resolution (last 60 trading days) — free tier doesn't support intraday
        long from = now - (60L * 86400);
        return getCandles(symbol, "D", from, now);
    }

    /**
     * Get daily candles for a symbol (last 90 days).
     */
    public CandleDataResponse getDailyCandles(String symbol) {
        long now = Instant.now().getEpochSecond();
        long from = now - (90L * 86400);
        return getCandles(symbol, "D", from, now);
    }

    /**
     * Get the list of supported symbols.
     */
    public List<Map<String, String>> getSymbols() {
        List<Map<String, String>> list = new ArrayList<>();
        for (Map.Entry<String, String> entry : SYMBOLS.entrySet()) {
            Map<String, String> m = new LinkedHashMap<>();
            m.put("symbol", entry.getKey());
            m.put("name", entry.getValue());
            list.add(m);
        }
        return list;
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // Simple cache wrapper
    private static class CachedQuote {
        final MarketDataResponse data;
        final long createdAt;

        CachedQuote(MarketDataResponse data) {
            this.data = data;
            this.createdAt = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > CACHE_TTL_MS;
        }
    }
}
