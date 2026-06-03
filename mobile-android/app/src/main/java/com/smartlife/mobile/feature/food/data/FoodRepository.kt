package com.smartlife.mobile.feature.food.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.food.data.model.CreateFoodLogRequest
import com.smartlife.mobile.feature.food.data.model.FoodLog
import com.smartlife.mobile.feature.food.data.model.NutritionSummary
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FoodRepository @Inject constructor(private val api: ApiService) {
    suspend fun getFoodLogs(): List<FoodLog> = api.getFoodLogs()
    suspend fun createFoodLog(request: CreateFoodLogRequest): FoodLog = api.createFoodLog(request)
    suspend fun deleteFoodLog(id: Long) = api.deleteFoodLog(id)
    suspend fun getNutritionSummary(): NutritionSummary = api.getNutritionSummary()
}
