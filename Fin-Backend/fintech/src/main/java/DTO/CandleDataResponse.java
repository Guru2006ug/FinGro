package DTO;

import java.util.List;

/**
 * Chart data point for the frontend PriceChart component.
 */
public class CandleDataResponse {

    private String status;
    private List<CandlePoint> data;

    public CandleDataResponse() {}

    public CandleDataResponse(String status, List<CandlePoint> data) {
        this.status = status;
        this.data = data;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<CandlePoint> getData() { return data; }
    public void setData(List<CandlePoint> data) { this.data = data; }

    public static class CandlePoint {
        private String time;
        private double price;   // close price
        private double open;
        private double high;
        private double low;
        private long volume;

        public CandlePoint() {}

        public CandlePoint(String time, double price, double open, double high, double low, long volume) {
            this.time = time;
            this.price = price;
            this.open = open;
            this.high = high;
            this.low = low;
            this.volume = volume;
        }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public double getOpen() { return open; }
        public void setOpen(double open) { this.open = open; }

        public double getHigh() { return high; }
        public void setHigh(double high) { this.high = high; }

        public double getLow() { return low; }
        public void setLow(double low) { this.low = low; }

        public long getVolume() { return volume; }
        public void setVolume(long volume) { this.volume = volume; }
    }
}
