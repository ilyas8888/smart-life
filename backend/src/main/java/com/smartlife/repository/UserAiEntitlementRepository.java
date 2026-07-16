package com.smartlife.repository;

import com.smartlife.model.UserAiEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAiEntitlementRepository extends JpaRepository<UserAiEntitlement, Long> {
    Optional<UserAiEntitlement> findByUserId(Long userId);
    List<UserAiEntitlement> findAllByOrderByUserEmailAsc();

    /**
     * Consomme atomiquement une unité de quota mensuel si le quota n'est pas
     * atteint. Retourne le nombre de lignes modifiées : 1 = réservé, 0 = épuisé.
     */
    @Modifying
    @Query("UPDATE UserAiEntitlement e SET e.monthlyUsed = COALESCE(e.monthlyUsed, 0) + 1 " +
           "WHERE e.id = :id AND (e.monthlyQuota IS NULL OR COALESCE(e.monthlyUsed, 0) < e.monthlyQuota)")
    int tryConsumeMonthly(@Param("id") Long id);

    @Modifying
    @Query("UPDATE UserAiEntitlement e SET e.monthlyUsed = e.monthlyUsed - 1 " +
           "WHERE e.id = :id AND COALESCE(e.monthlyUsed, 0) > 0")
    int refundMonthly(@Param("id") Long id);

    /**
     * Consomme atomiquement une unité d'essai (statut FREE) si le quota d'essai
     * n'est pas atteint. Retourne 1 = réservé, 0 = épuisé.
     */
    @Modifying
    @Query("UPDATE UserAiEntitlement e SET e.trialUsed = COALESCE(e.trialUsed, 0) + 1 " +
           "WHERE e.id = :id AND COALESCE(e.trialUsed, 0) < COALESCE(e.trialQuota, 5)")
    int tryConsumeTrial(@Param("id") Long id);

    @Modifying
    @Query("UPDATE UserAiEntitlement e SET e.trialUsed = e.trialUsed - 1 " +
           "WHERE e.id = :id AND COALESCE(e.trialUsed, 0) > 0")
    int refundTrial(@Param("id") Long id);
}
