package com.smartlife.mobile.feature.food.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.food.data.FoodRepository
import com.smartlife.mobile.feature.food.data.model.CreateFoodLogRequest
import com.smartlife.mobile.feature.food.data.model.FoodLog
import com.smartlife.mobile.feature.food.data.model.NutritionSummary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FoodViewModel @Inject constructor(
    private val repo: FoodRepository,
) : ViewModel() {

    private val _logs = MutableStateFlow<List<FoodLog>>(emptyList())
    val logs: StateFlow<List<FoodLog>> = _logs.asStateFlow()

    private val _nutrition = MutableStateFlow(NutritionSummary())
    val nutrition: StateFlow<NutritionSummary> = _nutrition.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadToday() }

    fun loadToday() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getFoodLogs() }.onSuccess { _logs.value = it }.onFailure { _error.value = it.message }
            runCatching { repo.getNutritionSummary() }.onSuccess { _nutrition.value = it }.onFailure { }
            _isLoading.value = false
        }
    }

    fun addFoodLog(foodName: String, quantity: String, mealType: String, calories: Int?) {
        viewModelScope.launch {
            runCatching {
                repo.createFoodLog(CreateFoodLogRequest(foodName, quantity, mealType, calories))
            }.onSuccess { log ->
                _logs.value = _logs.value + log
                runCatching { repo.getNutritionSummary() }.onSuccess { _nutrition.value = it }
            }.onFailure { _error.value = it.message }
        }
    }

    fun deleteLog(id: Long) {
        viewModelScope.launch {
            runCatching { repo.deleteFoodLog(id) }
                .onSuccess {
                    _logs.value = _logs.value.filter { it.id != id }
                    runCatching { repo.getNutritionSummary() }.onSuccess { _nutrition.value = it }
                }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearError() { _error.value = null }
}
