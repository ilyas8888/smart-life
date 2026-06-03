package com.smartlife.mobile.feature.home.data.model

import com.google.gson.annotations.SerializedName

/**
 * Forme réelle renvoyée par `GET /api/score/today` (DayScoreService + DayScoreController).
 * total/band/bandLabel/modules/synergies/insight + delta/history ajoutés par le controller.
 */
data class DayScore(
    val total: Int = 0,
    val band: String = "",
    val bandLabel: String = "",
    val delta: Int = 0,
    val insight: String = "",
    val modules: Map<String, ScoreModule> = emptyMap(),
    val synergies: List<Synergy> = emptyList(),
    val history: List<ScoreHistory> = emptyList(),
)

data class ScoreModule(
    val score: Int = 0,
    val weight: Int = 0,
    val label: String = "",
    val present: Boolean = false,
)

data class Synergy(
    val name: String = "",
    val bonus: Int = 0,
    val description: String = "",
)

data class ScoreHistory(
    val date: String = "",
    val total: Int = 0,
    val band: String = "",
)

/**
 * `GET /api/timeline` → Map<String, List<TimelineItem>> (groupé par date).
 * DTO backend : id, type, title, description, date, time, metadata.
 */
data class TimelineItem(
    val id: Long = 0,
    val type: String = "",
    val title: String = "",
    val description: String? = null,
    val time: String? = null,
    val date: String = "",
    val metadata: Map<String, @JvmSuppressWildcards Any>? = null,
) {
    val category: String? get() = metadata?.get("category") as? String
    val completed: Boolean get() = metadata?.get("completed") == true
}
