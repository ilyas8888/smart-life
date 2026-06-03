package com.smartlife.mobile.feature.home.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.core.datastore.TokenDataStore
import com.smartlife.mobile.feature.home.data.HomeRepository
import com.smartlife.mobile.feature.home.data.model.DayScore
import com.smartlife.mobile.feature.home.data.model.TimelineItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeRepository: HomeRepository,
    private val tokenDataStore: TokenDataStore,
) : ViewModel() {

    private val _dayScore   = MutableStateFlow<DayScore?>(null)
    val dayScore: StateFlow<DayScore?> = _dayScore

    private val _timeline   = MutableStateFlow<List<TimelineItem>>(emptyList())
    val timeline: StateFlow<List<TimelineItem>> = _timeline

    private val _firstName  = MutableStateFlow("")
    val firstName: StateFlow<String> = _firstName

    private val _isLoading  = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        loadData()
    }

    fun loadData() {
        val today = LocalDate.now().toString()
        viewModelScope.launch {
            _firstName.value = tokenDataStore.userFirstName.firstOrNull() ?: ""
            _isLoading.value = true
            homeRepository.getDayScore(today).onSuccess { _dayScore.value = it }
            homeRepository.getTimelineItems(today).onSuccess { _timeline.value = it }
            _isLoading.value = false
        }
    }
}
