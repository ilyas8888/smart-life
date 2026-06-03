package com.smartlife.mobile.feature.workout.data.model

import com.google.gson.annotations.SerializedName

/**
 * Backend entité WorkoutSession : title, durationMinutes, caloriesBurned, notes, sessionDate.
 */
data class WorkoutSession(
    val id: Long = 0,
    @SerializedName("title") val type: String = "",
    @SerializedName("durationMinutes") val duration: Int = 0,
    @SerializedName("caloriesBurned") val calories: Int? = null,
    val notes: String? = null,
    @SerializedName("sessionDate") val date: String = "",
)

data class CreateWorkoutRequest(
    @SerializedName("title") val type: String,
    @SerializedName("durationMinutes") val duration: Int,
    @SerializedName("caloriesBurned") val calories: Int? = null,
    val notes: String? = null,
)

data class WorkoutPlan(
    val id: Long = 0,
    val name: String = "",
    val goal: String = "",
    val weeks: Int = 0,
    val daysPerWeek: Int = 0,
    val createdAt: String = "",
)
