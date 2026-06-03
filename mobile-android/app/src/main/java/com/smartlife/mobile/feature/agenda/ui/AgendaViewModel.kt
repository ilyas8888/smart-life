package com.smartlife.mobile.feature.agenda.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.home.data.HomeRepository
import com.smartlife.mobile.feature.home.data.model.TimelineItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class AgendaViewModel @Inject constructor(
    private val repo: HomeRepository,
) : ViewModel() {

    private val _selectedDate = MutableStateFlow(LocalDate.now())
    val selectedDate: StateFlow<LocalDate> = _selectedDate.asStateFlow()

    private val _timelineMap = MutableStateFlow<Map<String, List<TimelineItem>>>(emptyMap())
    val timelineMap: StateFlow<Map<String, List<TimelineItem>>> = _timelineMap.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadMonth() }

    fun selectDate(date: LocalDate) {
        _selectedDate.value = date
    }

    fun loadMonth() {
        val now = LocalDate.now()
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getTimelineMonth(now.year, now.monthValue) }
                .onSuccess { _timelineMap.value = it }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun itemsForDate(date: LocalDate): List<TimelineItem> {
        return _timelineMap.value[date.toString()] ?: emptyList()
    }
}
