package Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents a single executed trade.
 * Every filled order produces one Trade record.
 * This separation from Order allows future partial-fill and order-book matching.
 */
@Entity
@Table(name = "trades")
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The order that triggered this trade. */
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** The user who owns this trade (denormalised for fast queries). */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private FinUser user;

    @Column(nullable = false, length = 30)
    private String symbol;

    @Column(nullable = false, length = 4)
    private String side; // "BUY" or "SELL"

    /** Execution price (may differ from order price in future limit-order matching). */
    @Column(nullable = false)
    private Double executionPrice;

    /** Number of shares filled in this trade. */
    @Column(nullable = false)
    private Integer quantity;

    /** Total value of this trade: executionPrice × quantity. */
    @Column(nullable = false)
    private Double totalValue;

    @Column(nullable = false)
    private LocalDateTime executedAt = LocalDateTime.now();

    public Trade() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public FinUser getUser() { return user; }
    public void setUser(FinUser user) { this.user = user; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }

    public Double getExecutionPrice() { return executionPrice; }
    public void setExecutionPrice(Double executionPrice) { this.executionPrice = executionPrice; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getTotalValue() { return totalValue; }
    public void setTotalValue(Double totalValue) { this.totalValue = totalValue; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
