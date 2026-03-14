package DTO;

/**
 * Response DTO for a Stock entity.
 */
public class StockResponse {

    private Long id;
    private String symbol;
    private String name;
    private String sector;
    private Boolean active;

    public StockResponse() {}

    public StockResponse(Long id, String symbol, String name, String sector, Boolean active) {
        this.id = id;
        this.symbol = symbol;
        this.name = name;
        this.sector = sector;
        this.active = active;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
