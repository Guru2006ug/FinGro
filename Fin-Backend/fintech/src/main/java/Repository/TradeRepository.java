package Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Model.Trade;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {

    /** All trades for a user, newest first. */
    List<Trade> findByUserIdOrderByExecutedAtDesc(Long userId);

    /** All trades for a user filtered by symbol, newest first. */
    List<Trade> findByUserIdAndSymbolOrderByExecutedAtDesc(Long userId, String symbol);

    /** All trades linked to a specific order. */
    List<Trade> findByOrderId(Long orderId);

    /** Recent trades for a symbol across all users (public trade feed). */
    List<Trade> findTop50BySymbolOrderByExecutedAtDesc(String symbol);
}
