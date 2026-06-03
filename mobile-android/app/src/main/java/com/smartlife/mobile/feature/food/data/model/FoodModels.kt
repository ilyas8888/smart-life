package com.smartlife.mobile.feature.food.data.model

import com.google.gson.annotations.SerializedName

/**
 * Backend entité FoodLog : foodItem, quantity(String), mealType, calories,
 * proteinG/carbsG/fatG/fiberG, logDate, loggedAt.
 */
data class FoodLog(
    val id: Long = 0,
    @SerializedName("foodItem") val foodName: String = "",
    val quantity: String? = null,
    val unit: String = "",
    val mealType: String = "SNACK",
    val calories: Int? = null,
    @SerializedName("proteinG") val protein: Double? = null,
    @SerializedName("carbsG") val carbs: Double? = null,
    @SerializedName("fatG") val fat: Double? = null,
    @SerializedName("logDate") val date: String = "",
)

data class CreateFoodLogRequest(
    @SerializedName("foodItem") val foodName: String,
    val quantity: String,
    val mealType: String,
    val calories: Int? = null,
)

/**
 * Backend `GET /food-logs/summary/today` → NutritionSummaryDto.
 * Pas de caloriesGoal côté backend → valeur locale par défaut.
 */
data class NutritionSummary(
    val totalCalories: Double = 0.0,
    @SerializedName("totalProteinG") val totalProtein: Double = 0.0,
    @SerializedName("totalCarbsG") val totalCarbs: Double = 0.0,
    @SerializedName("totalFatG") val totalFat: Double = 0.0,
    val caloriesGoal: Int = 2000,
)
