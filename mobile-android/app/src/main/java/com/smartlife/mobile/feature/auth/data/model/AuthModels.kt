package com.smartlife.mobile.feature.auth.data.model

data class AuthRequest(
    val email: String,
    val password: String,
    val firstName: String? = null,
    val lastName: String? = null,
)

data class OtpRequest(
    val userId: Long,
    val code: String,
)

data class RefreshRequest(
    val refreshToken: String,
)

// Champs exacts de Spring AuthResponse.java : token (pas accessToken), sans role
data class AuthResponse(
    val token: String,
    val refreshToken: String,
    val email: String,
    val firstName: String,
    val lastName: String,
)

// Spring refresh retourne {"accessToken": "..."}
data class RefreshResponse(
    val accessToken: String,
)

// Spring register retourne soit AuthResponse soit {step, userId} si OTP activé
sealed class RegisterResult {
    data class Success(val auth: AuthResponse) : RegisterResult()
    data class OtpRequired(val userId: Long) : RegisterResult()
}
