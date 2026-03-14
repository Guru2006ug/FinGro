package Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import DTO.OrderRequest;
import DTO.OrderResponse;
import DTO.TradeResponse;
import Model.FinUser;
import Model.Holding;
import Model.Order;
import Model.Stock;
import Model.Trade;
import Repository.FinUserRepository;
import Repository.HoldingRepository;
import Repository.OrderRepository;
import Repository.StockRepository;
import Repository.TradeRepository;

/**
 * Core trading engine.
 *
 * <h3>Concurrency strategy</h3>
 * <ol>
 *   <li>The user row is loaded with a <b>pessimistic write lock</b>
 *       ({@code findByEmailForUpdate}) so two concurrent orders from the same user
 *       are serialised at the DB level — no double-spend.</li>
 *   <li>The holding row is also locked with {@code findByUserIdAndSymbolForUpdate}
 *       to prevent two SELL orders from over-selling.</li>
 *   <li>Both {@link FinUser} and {@link Holding} carry an {@code @Version} column
 *       providing a second safety net (optimistic locking). If a rare race still
 *       slips through, Spring will throw {@link ObjectOptimisticLockingFailureException}
 *       which the {@code @Retryable} annotation catches and retries up to 3 times.</li>
 * </ol>
 *
 * <h3>Order → Trade separation</h3>
 * An {@link Order} is created first (status = OPEN), then immediately executed
 * into one {@link Trade} (status → FILLED). This two-step pattern prepares for
 * Stage 5's order-book matching, where an order may sit as OPEN before being
 * matched against a counterparty.
 */
@Service
public class OrderService {

    // Symbol display names (mirrors MarketDataService)
    private static final Map<String, String> SYMBOL_NAMES = new LinkedHashMap<>();
    static {
        SYMBOL_NAMES.put("RELIANCE.BO", "Reliance Industries");
        SYMBOL_NAMES.put("TCS.BO", "Tata Consultancy Services");
        SYMBOL_NAMES.put("INFY.BO", "Infosys Ltd.");
        SYMBOL_NAMES.put("HDFCBANK.BO", "HDFC Bank Ltd.");
        SYMBOL_NAMES.put("ICICIBANK.BO", "ICICI Bank Ltd.");
        SYMBOL_NAMES.put("HINDUNILVR.BO", "Hindustan Unilever");
        SYMBOL_NAMES.put("ITC.BO", "ITC Limited");
        SYMBOL_NAMES.put("SBIN.BO", "State Bank of India");
    }

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FinUserRepository finUserRepository;

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private TradeRepository tradeRepository;

    // ---------------------------------------------------------------
    //  PLACE ORDER  — Phase 1: create order  |  Phase 2: execute trade
    // ---------------------------------------------------------------

    /**
     * Place and instantly execute a paper-trade order.
     * <p>
     * Runs inside a single DB transaction with READ_COMMITTED isolation.
     * The pessimistic lock on the user row serialises concurrent orders for the
     * same user so the balance/holdings are never corrupted.
     * <p>
     * If an optimistic-lock clash occurs (extremely unlikely given the pessimistic
     * lock, but possible under high load), Spring Retry will re-invoke the method
     * up to 3 times with exponential backoff.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    @Retryable(
        retryFor = ObjectOptimisticLockingFailureException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 50, multiplier = 2)
    )
    public OrderResponse placeOrder(String email, OrderRequest request) {

        // 0. Validate the symbol exists in our stocks table
        Stock stock = stockRepository.findBySymbol(request.getSymbol())
                .orElseThrow(() -> new RuntimeException(
                        "Unknown symbol: " + request.getSymbol() + ". Only listed stocks may be traded."));
        if (!stock.getActive()) {
            throw new RuntimeException("Trading is currently halted for " + request.getSymbol());
        }

        // 1. Lock the user row — serialises concurrent orders for this user
        FinUser user = finUserRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order.Side side = Order.Side.valueOf(request.getSide().toUpperCase());
        double totalCost = request.getPrice() * request.getQuantity();

        // ---- Phase 1: Create the Order (status = OPEN) ----
        Order order = new Order();
        order.setUser(user);
        order.setSymbol(request.getSymbol());
        order.setSide(side);
        order.setPrice(request.getPrice());
        order.setQuantity(request.getQuantity());
        order.setFilledQuantity(0);
        order.setStatus(Order.Status.OPEN);
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        // ---- Phase 2: Execute the trade immediately ----
        if (side == Order.Side.BUY) {
            executeBuy(user, order, request, totalCost, stock);
        } else {
            executeSell(user, order, request, totalCost);
        }

        // Mark order as FILLED
        order.setFilledQuantity(request.getQuantity());
        order.setStatus(Order.Status.FILLED);
        order = orderRepository.save(order);

        // Create trade record
        Trade trade = new Trade();
        trade.setOrder(order);
        trade.setUser(user);
        trade.setSymbol(request.getSymbol());
        trade.setSide(side.name());
        trade.setExecutionPrice(request.getPrice());
        trade.setQuantity(request.getQuantity());
        trade.setTotalValue(totalCost);
        trade.setExecutedAt(LocalDateTime.now());
        tradeRepository.save(trade);

        return toResponse(order);
    }

    // ---------------------------------------------------------------
    //  BUY execution
    // ---------------------------------------------------------------
    private void executeBuy(FinUser user, Order order, OrderRequest request,
                            double totalCost, Stock stock) {
        if (user.getBalance() < totalCost) {
            // Roll back the OPEN order
            order.setStatus(Order.Status.CANCELLED);
            orderRepository.save(order);
            throw new RuntimeException("Insufficient balance. Required: ₹" +
                    String.format("%.2f", totalCost) + ", Available: ₹" +
                    String.format("%.2f", user.getBalance()));
        }

        // Deduct balance
        user.setBalance(user.getBalance() - totalCost);
        finUserRepository.save(user);

        // Update holdings (weighted average cost) — lock the holding row too
        Holding holding = holdingRepository
                .findByUserIdAndSymbolForUpdate(user.getId(), request.getSymbol())
                .orElse(null);

        if (holding == null) {
            holding = new Holding();
            holding.setUser(user);
            holding.setSymbol(request.getSymbol());
            holding.setName(stock.getName());
            holding.setQuantity(request.getQuantity());
            holding.setAvgCost(request.getPrice());
        } else {
            double oldCost = holding.getQuantity() * holding.getAvgCost();
            double newCost = request.getQuantity() * request.getPrice();
            int newTotalQty = holding.getQuantity() + request.getQuantity();
            holding.setAvgCost((oldCost + newCost) / newTotalQty);
            holding.setQuantity(newTotalQty);
        }
        holdingRepository.save(holding);
    }

    // ---------------------------------------------------------------
    //  SELL execution
    // ---------------------------------------------------------------
    private void executeSell(FinUser user, Order order, OrderRequest request,
                             double totalCost) {
        // Lock the holding row to prevent concurrent over-sell
        Holding holding = holdingRepository
                .findByUserIdAndSymbolForUpdate(user.getId(), request.getSymbol())
                .orElse(null);

        if (holding == null || holding.getQuantity() < request.getQuantity()) {
            order.setStatus(Order.Status.CANCELLED);
            orderRepository.save(order);
            int held = holding == null ? 0 : holding.getQuantity();
            throw new RuntimeException("Insufficient shares. You hold " +
                    held + " shares of " + request.getSymbol());
        }

        // Add proceeds to balance
        user.setBalance(user.getBalance() + totalCost);
        finUserRepository.save(user);

        // Reduce holdings
        int remainingQty = holding.getQuantity() - request.getQuantity();
        holding.setQuantity(remainingQty);
        holdingRepository.save(holding);
    }

    // ---------------------------------------------------------------
    //  QUERY methods (no locks needed — read-only)
    // ---------------------------------------------------------------

    public List<OrderResponse> getUserOrders(String email) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getUserOrdersByStatus(String email, String status) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Order.Status orderStatus = Order.Status.valueOf(status.toUpperCase());
        return orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), orderStatus)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Cancel an OPEN or PARTIAL order.
     * If the order was a BUY that hadn't filled, no balance was deducted
     * (in future limit-order mode this will refund the reserved amount).
     */
    @Transactional
    public OrderResponse cancelOrder(String email, Long orderId) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: order does not belong to you");
        }

        if (order.getStatus() != Order.Status.OPEN && order.getStatus() != Order.Status.PARTIAL) {
            throw new RuntimeException("Only OPEN or PARTIAL orders can be cancelled");
        }

        order.setStatus(Order.Status.CANCELLED);
        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    // ---------------------------------------------------------------
    //  TRADE queries
    // ---------------------------------------------------------------

    /** All trades for the authenticated user. */
    public List<TradeResponse> getUserTrades(String email) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return tradeRepository.findByUserIdOrderByExecutedAtDesc(user.getId())
                .stream().map(this::toTradeResponse).collect(Collectors.toList());
    }

    /** Trades for a specific symbol for the authenticated user. */
    public List<TradeResponse> getUserTradesBySymbol(String email, String symbol) {
        FinUser user = finUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return tradeRepository.findByUserIdAndSymbolOrderByExecutedAtDesc(user.getId(), symbol)
                .stream().map(this::toTradeResponse).collect(Collectors.toList());
    }

    /** Public trade feed for a symbol (last 50 trades across all users). */
    public List<TradeResponse> getPublicTradeFeed(String symbol) {
        return tradeRepository.findTop50BySymbolOrderByExecutedAtDesc(symbol)
                .stream().map(this::toTradeResponse).collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    //  DTO mappers
    // ---------------------------------------------------------------

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getSymbol(),
                order.getSide().name(),
                order.getPrice(),
                order.getQuantity(),
                order.getFilledQuantity(),
                order.getStatus().name(),
                order.getCreatedAt()
        );
    }

    private TradeResponse toTradeResponse(Trade trade) {
        return new TradeResponse(
                trade.getId(),
                trade.getOrder().getId(),
                trade.getSymbol(),
                trade.getSide(),
                trade.getExecutionPrice(),
                trade.getQuantity(),
                trade.getTotalValue(),
                trade.getExecutedAt()
        );
    }
}
