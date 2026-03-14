package Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import Model.FinUser;

@Repository
public interface FinUserRepository extends JpaRepository<FinUser, Long> {
    
    Optional<FinUser> findByEmail(String email);
    
    boolean existsByEmail(String email);

    /**
     * Acquire a pessimistic write lock on the user row.
     * Used during order placement to serialise balance updates
     * and prevent double-spend when many orders arrive concurrently.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM FinUser u WHERE u.email = :email")
    Optional<FinUser> findByEmailForUpdate(@Param("email") String email);
}
