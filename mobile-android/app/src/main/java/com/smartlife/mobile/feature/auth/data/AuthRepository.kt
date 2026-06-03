package com.smartlife.mobile.feature.auth.data

import com.smartlife.mobile.core.datastore.TokenDataStore
import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.auth.data.model.AuthRequest
import com.smartlife.mobile.feature.auth.data.model.AuthResponse
import com.smartlife.mobile.feature.auth.data.model.OtpRequest
import com.smartlife.mobile.feature.auth.data.model.RefreshRequest
import com.smartlife.mobile.feature.auth.data.model.RegisterResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: ApiService,
    private val tokenDataStore: TokenDataStore,
) {
    suspend fun login(email: String, password: String): Result<AuthResponse> = runCatching {
        val response = api.login(AuthRequest(email = email, password = password))
        tokenDataStore.saveTokens(
            accessToken  = response.token,
            refreshToken = response.refreshToken,
            email        = response.email,
            firstName    = response.firstName,
            lastName     = response.lastName,
        )
        response
    }

    suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
    ): Result<RegisterResult> = runCatching {
        val map = api.register(AuthRequest(email, password, firstName, lastName))
        if (map.containsKey("step")) {
            // OTP requis — userId est un Double avec Gson par défaut
            val userId = (map["userId"] as? Double)?.toLong()
                ?: error("userId manquant dans la réponse OTP")
            RegisterResult.OtpRequired(userId)
        } else {
            val auth = AuthResponse(
                token        = map["token"] as? String ?: error("token manquant"),
                refreshToken = map["refreshToken"] as? String ?: "",
                email        = map["email"] as? String ?: "",
                firstName    = map["firstName"] as? String ?: "",
                lastName     = map["lastName"] as? String ?: "",
            )
            tokenDataStore.saveTokens(
                accessToken  = auth.token,
                refreshToken = auth.refreshToken,
                email        = auth.email,
                firstName    = auth.firstName,
                lastName     = auth.lastName,
            )
            RegisterResult.Success(auth)
        }
    }

    suspend fun verifyOtp(userId: Long, code: String): Result<AuthResponse> = runCatching {
        val response = api.verifyOtp(OtpRequest(userId = userId, code = code))
        tokenDataStore.saveTokens(
            accessToken  = response.token,
            refreshToken = response.refreshToken,
            email        = response.email,
            firstName    = response.firstName,
            lastName     = response.lastName,
        )
        response
    }

    suspend fun logout() {
        runCatching { api.logout() }
        tokenDataStore.clearTokens()
    }
}
