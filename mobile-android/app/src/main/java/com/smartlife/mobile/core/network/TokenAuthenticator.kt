package com.smartlife.mobile.core.network

import com.smartlife.mobile.BuildConfig
import com.smartlife.mobile.core.datastore.TokenDataStore
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

private const val RETRY_HEADER = "X-Retry-After-Refresh"

@Singleton
class TokenAuthenticator @Inject constructor(
    private val tokenDataStore: TokenDataStore,
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        // Déjà retryé après refresh → stopper pour éviter boucle infinie
        if (response.request.header(RETRY_HEADER) != null) return null

        val refreshToken = runBlocking { tokenDataStore.refreshToken.firstOrNull() }
            ?: return null  // Pas de refresh token → re-login requis

        val newAccessToken = tryRefresh(refreshToken) ?: run {
            runBlocking { tokenDataStore.clearTokens() }
            return null  // Refresh échoué → tokens effacés, re-login
        }

        runBlocking {
            tokenDataStore.saveTokens(
                accessToken  = newAccessToken,
                refreshToken = refreshToken,
                email        = tokenDataStore.userEmail.firstOrNull() ?: "",
                firstName    = tokenDataStore.userFirstName.firstOrNull() ?: "",
                lastName     = tokenDataStore.userLastName.firstOrNull() ?: "",
            )
        }

        return response.request.newBuilder()
            .header("Authorization", "Bearer $newAccessToken")
            .header(RETRY_HEADER, "true")
            .build()
    }

    // Client OkHttp sans interceptors pour éviter dépendance circulaire
    private fun tryRefresh(refreshToken: String): String? = try {
        val body = """{"refreshToken":"$refreshToken"}"""
            .toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url("${BuildConfig.API_BASE_URL}/api/auth/refresh")
            .post(body)
            .build()

        OkHttpClient().newCall(request).execute().use { resp ->
            if (!resp.isSuccessful) return null
            val json = JSONObject(resp.body?.string() ?: return null)
            json.optString("accessToken").takeIf { it.isNotBlank() }
        }
    } catch (e: Exception) {
        null
    }
}
