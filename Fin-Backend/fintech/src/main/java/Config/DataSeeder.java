package Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import Model.Stock;
import Repository.StockRepository;

/**
 * Seeds the stocks table on startup if it is empty.
 * Run once — subsequent starts will skip because existsBySymbol returns true.
 */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedStocks(StockRepository stockRepository) {
        return args -> {
            seed(stockRepository, "RELIANCE.BO",   "Reliance Industries",        "Energy");
            seed(stockRepository, "TCS.BO",        "Tata Consultancy Services",  "IT");
            seed(stockRepository, "INFY.BO",       "Infosys Ltd.",               "IT");
            seed(stockRepository, "HDFCBANK.BO",   "HDFC Bank Ltd.",             "Banking");
            seed(stockRepository, "ICICIBANK.BO",  "ICICI Bank Ltd.",            "Banking");
            seed(stockRepository, "HINDUNILVR.BO", "Hindustan Unilever",         "FMCG");
            seed(stockRepository, "ITC.BO",        "ITC Limited",                "FMCG");
            seed(stockRepository, "SBIN.BO",       "State Bank of India",        "Banking");
        };
    }

    private void seed(StockRepository repo, String symbol, String name, String sector) {
        if (!repo.existsBySymbol(symbol)) {
            repo.save(new Stock(symbol, name, sector));
        }
    }
}
