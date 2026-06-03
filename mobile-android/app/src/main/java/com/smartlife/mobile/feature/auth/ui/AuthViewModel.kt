package com.smartlife.mobile.feature.auth.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.auth.data.AuthRepository
import com.smartlife.mobile.feature.auth.data.model.RegisterResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    object Success : AuthUiState()
    data class OtpRequired(val userId: Long) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            authRepository.login(email.trim(), password).fold(
                onSuccess = { _uiState.value = AuthUiState.Success },
                onFailure = { _uiState.value = AuthUiState.Error(it.message ?: "Erreur de connexion") },
            )
        }
    }

    fun register(email: String, password: String, firstName: String, lastName: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            authRepository.register(email.trim(), password, firstName.trim(), lastName.trim()).fold(
                onSuccess = { result ->
                    _uiState.value = when (result) {
                        is RegisterResult.Success     -> AuthUiState.Success
                        is RegisterResult.OtpRequired -> AuthUiState.OtpRequired(result.userId)
                    }
                },
                onFailure = { _uiState.value = AuthUiState.Error(it.message ?: "Erreur d'inscription") },
            )
        }
    }

    fun verifyOtp(userId: Long, code: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            authRepository.verifyOtp(userId, code).fold(
                onSuccess = { _uiState.value = AuthUiState.Success },
                onFailure = { _uiState.value = AuthUiState.Error(it.message ?: "Code OTP invalide") },
            )
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}
