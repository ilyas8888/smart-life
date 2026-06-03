package com.smartlife.mobile.feature.sleep.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.sleep.data.SleepRepository
import com.smartlife.mobile.feature.sleep.data.model.CreateSleepLogRequest
import com.smartlife.mobile.feature.sleep.data.model.SleepLog
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SleepViewModel @Inject constructor(
    private val repo: SleepRepository,
) : ViewModel() {

    private val _logs = MutableStateFlow<List<SleepLog>>(emptyList())
    val logs: StateFlow<List<SleepLog>> = _logs.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    val avgDuration: Double get() = if (_logs.value.isEmpty()) 0.0 else _logs.value.take(7).map { it.duration }.average()
    val avgQuality: Double get() = if (_logs.value.isEmpty()) 0.0 else _logs.value.take(7).map { it.quality }.average()

    init { loadLogs() }

    fun loadLogs() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getSleepLogs() }
                .onSuccess { _logs.value = it }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun createLog(bedTime: String, wakeTime: String, quality: Int) {
        viewModelScope.launch {
            runCatching { repo.createSleepLog(CreateSleepLogRequest(bedTime, wakeTime, quality)) }
                .onSuccess { _logs.value = listOf(it) + _logs.value }
                .onFailure { _error.value = it.message }
        }
    }

    fun deleteLog(id: Long) {
        viewModelScope.launch {
            runCatching { repo.deleteSleepLog(id) }
                .onSuccess { _logs.value = _logs.value.filter { it.id != id } }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearError() { _error.value = null }
}
