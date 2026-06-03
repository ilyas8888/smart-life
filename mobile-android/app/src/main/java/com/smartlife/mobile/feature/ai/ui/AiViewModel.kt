package com.smartlife.mobile.feature.ai.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.ai.data.AiRepository
import com.smartlife.mobile.feature.ai.data.model.AiAccessStatus
import com.smartlife.mobile.feature.ai.data.model.PromptResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AiViewModel @Inject constructor(
    private val repo: AiRepository,
) : ViewModel() {

    private val _status = MutableStateFlow(AiAccessStatus())
    val status: StateFlow<AiAccessStatus> = _status.asStateFlow()

    private val _response = MutableStateFlow<PromptResponse?>(null)
    val response: StateFlow<PromptResponse?> = _response.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadStatus() }

    fun loadStatus() {
        viewModelScope.launch {
            runCatching { repo.getStatus() }
                .onSuccess { _status.value = it }
                .onFailure { _error.value = it.message }
        }
    }

    fun processPrompt(prompt: String) {
        if (!_status.value.canUseAi) {
            _error.value = "Crédits IA insuffisants ou accès non autorisé"
            return
        }
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _response.value = null
            runCatching { repo.processPrompt(prompt) }
                .onSuccess {
                    _response.value = it
                    loadStatus()
                }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun clearResponse() { _response.value = null }
    fun clearError() { _error.value = null }
}
