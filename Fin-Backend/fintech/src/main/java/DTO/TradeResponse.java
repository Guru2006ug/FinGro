package DTO;

import java.time.LocalDateTime;

/**
 * Response DTO for an executed trade.
 */
public class TradeResponse {

    private Long id;
    private Long orderId;
    private String symbol;
    private String side;
    private Double executionPrice;
    private Integer quantity;
    private Double totalValue;
    private LocalDateTime executedAt;

    public TradeResponse() {}

    public TradeResponse(Long id, Long orderId, String symbol, String side,
                         Double executionPrice, Integer quantity, Double totalValue,
                         LocalDateTime executedAt) {
        this.id = id;
        this.orderId = orderId;
        this.symbol = symbol;
        this.side = side;
        this.executionPrice = executionPrice;
        this.quantity = quantity;
        this.totalValue = totalValue;
        this.executedAt = executedAt;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

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
