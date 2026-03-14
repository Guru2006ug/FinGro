package Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import Model.Holding;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {

    List<Holding> findByUserIdAndQuantityGreaterThan(Long userId, Integer minQty);

    Optional<Holding> findByUserIdAndSymbol(Long userId, String symbol);

    /**
     * Acquire a pessimistic write lock on the holding row.
     * Prevents two concurrent SELL orders from over-selling shares.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM Holding h WHERE h.user.id = :userId AND h.symbol = :symbol")
    Optional<Holding> findByUserIdAndSymbolForUpdate(@Param("userId") Long userId, @Param("symbol") String symbol);
}
