package com.smartlife.mobile.feature.sleep.data.model

import com.google.gson.annotations.SerializedName

/**
 * Backend SleepLogController.toResponse : sleepDate, bedtime, wakeTime,
 * durationMinutes, quality, energy, wakeUps, factors, notes, createdAt.
 */
data class SleepLog(
    val id: Long = 0,
    @SerializedName("bedtime") val bedTime: String = "",
    val wakeTime: String = "",
    @SerializedName("durationMinutes") val durationMinutes: Int = 0,
    val quality: Int = 3,
    val notes: String? = null,
    @SerializedName("sleepDate") val date: String = "",
) {
    val duration: Double get() = durationMinutes / 60.0
}

data class CreateSleepLogRequest(
    @SerializedName("bedtime") val bedTime: String,
    val wakeTime: String,
    val quality: Int,
    val notes: String? = null,
)
