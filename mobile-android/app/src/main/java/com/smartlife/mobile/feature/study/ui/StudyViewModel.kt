package com.smartlife.mobile.feature.study.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.study.data.StudyRepository
import com.smartlife.mobile.feature.study.data.model.CreateTopicRequest
import com.smartlife.mobile.feature.study.data.model.StudySession
import com.smartlife.mobile.feature.study.data.model.StudyTopic
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StudyViewModel @Inject constructor(
    private val repo: StudyRepository,
) : ViewModel() {

    private val _topics = MutableStateFlow<List<StudyTopic>>(emptyList())
    val topics: StateFlow<List<StudyTopic>> = _topics.asStateFlow()

    private val _sessions = MutableStateFlow<List<StudySession>>(emptyList())
    val sessions: StateFlow<List<StudySession>> = _sessions.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadAll() }

    fun loadAll() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getTopics() }.onSuccess { _topics.value = it }.onFailure { _error.value = it.message }
            runCatching { repo.getSessions() }.onSuccess { _sessions.value = it }.onFailure { }
            recomputeTopicTotals()
            _isLoading.value = false
        }
    }

    // Les totaux par sujet ne viennent pas du backend → on les dérive des sessions.
    private fun recomputeTopicTotals() {
        val byTopic = _sessions.value.groupBy { it.topic?.id }
        _topics.value = _topics.value.map { t ->
            val s = byTopic[t.id] ?: emptyList()
            t.copy(totalSessions = s.size, totalMinutes = s.sumOf { it.duration })
        }
    }

    fun createTopic(name: String) {
        viewModelScope.launch {
            runCatching { repo.createTopic(CreateTopicRequest(name)) }
                .onSuccess { _topics.value = _topics.value + it }
                .onFailure { _error.value = it.message }
        }
    }

    fun logSession(topicId: Long, topicName: String, duration: Int) {
        viewModelScope.launch {
            runCatching { repo.logSession(topicId, topicName, duration) }
                .onSuccess { session ->
                    _sessions.value = listOf(session) + _sessions.value
                    recomputeTopicTotals()
                }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearError() { _error.value = null }
}
