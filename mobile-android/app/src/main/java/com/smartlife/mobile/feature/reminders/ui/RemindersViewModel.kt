package com.smartlife.mobile.feature.reminders.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.reminders.data.RemindersRepository
import com.smartlife.mobile.feature.reminders.data.model.CreateReminderRequest
import com.smartlife.mobile.feature.reminders.data.model.Reminder
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RemindersViewModel @Inject constructor(
    private val repo: RemindersRepository,
) : ViewModel() {

    private val _reminders = MutableStateFlow<List<Reminder>>(emptyList())
    val reminders: StateFlow<List<Reminder>> = _reminders.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadReminders() }

    fun loadReminders() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getReminders() }
                .onSuccess { _reminders.value = it }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun createReminder(title: String, dateTime: String, priority: String = "MEDIUM") {
        viewModelScope.launch {
            runCatching { repo.createReminder(CreateReminderRequest(title, dateTime, priority = priority)) }
                .onSuccess { _reminders.value = listOf(it) + _reminders.value }
                .onFailure { _error.value = it.message }
        }
    }

    fun deleteReminder(id: Long) {
        viewModelScope.launch {
            runCatching { repo.deleteReminder(id) }
                .onSuccess { _reminders.value = _reminders.value.filter { it.id != id } }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearError() { _error.value = null }
}
