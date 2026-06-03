package com.smartlife.mobile.feature.profile.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.profile.data.ProfileRepository
import com.smartlife.mobile.feature.profile.data.model.UpdateProfileRequest
import com.smartlife.mobile.feature.profile.data.model.UserProfile
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val repo: ProfileRepository,
) : ViewModel() {

    private val _profile = MutableStateFlow(UserProfile())
    val profile: StateFlow<UserProfile> = _profile.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _saveSuccess = MutableStateFlow(false)
    val saveSuccess: StateFlow<Boolean> = _saveSuccess.asStateFlow()

    init { loadProfile() }

    fun loadProfile() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getProfile() }
                .onSuccess { _profile.value = it }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun updateProfile(firstName: String, lastName: String, bio: String?) {
        viewModelScope.launch {
            _isLoading.value = true
            runCatching { repo.updateProfile(UpdateProfileRequest(firstName, lastName, bio)) }
                .onSuccess { _profile.value = it; _saveSuccess.value = true }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun clearSuccess() { _saveSuccess.value = false }
    fun clearError() { _error.value = null }
}
