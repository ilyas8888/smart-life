package com.smartlife.mobile.feature.workout.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.workout.data.WorkoutRepository
import com.smartlife.mobile.feature.workout.data.model.CreateWorkoutRequest
import com.smartlife.mobile.feature.workout.data.model.WorkoutSession
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WorkoutViewModel @Inject constructor(
    private val repo: WorkoutRepository,
) : ViewModel() {

    private val _sessions = MutableStateFlow<List<WorkoutSession>>(emptyList())
    val sessions: StateFlow<List<WorkoutSession>> = _sessions.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadSessions() }

    fun loadSessions() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getWorkouts() }
                .onSuccess { _sessions.value = it }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun createSession(type: String, duration: Int, calories: Int?) {
        viewModelScope.launch {
            runCatching { repo.createWorkout(CreateWorkoutRequest(type, duration, calories)) }
                .onSuccess { _sessions.value = listOf(it) + _sessions.value }
                .onFailure { _error.value = it.message }
        }
    }

    fun deleteSession(id: Long) {
        viewModelScope.launch {
            runCatching { repo.deleteWorkout(id) }
                .onSuccess { _sessions.value = _sessions.value.filter { it.id != id } }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearError() { _error.value = null }
}
