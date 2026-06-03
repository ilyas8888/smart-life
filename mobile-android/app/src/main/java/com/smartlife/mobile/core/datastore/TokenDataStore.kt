package com.smartlife.mobile.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "smartlife_tokens")

@Singleton
class TokenDataStore @Inject constructor(
    @ApplicationContext private val context: Context,
    private val secureTokenStorage: SecureTokenStorage,
) {
    private val USER_EMAIL      = stringPreferencesKey("user_email")
    private val USER_FIRST_NAME = stringPreferencesKey("user_first_name")
    private val USER_LAST_NAME  = stringPreferencesKey("user_last_name")

    // Access token: in-memory only — short-lived, never written to disk
    private val _accessToken = MutableStateFlow<String?>(null)
    val accessToken: Flow<String?> = _accessToken.asStateFlow()

    // Refresh token: AES256-GCM encrypted via Android Keystore
    val refreshToken: Flow<String?> = flow { emit(secureTokenStorage.getRefreshToken()) }

    val userEmail: Flow<String?>     = context.dataStore.data.map { it[USER_EMAIL] }
    val userFirstName: Flow<String?> = context.dataStore.data.map { it[USER_FIRST_NAME] }
    val userLastName: Flow<String?>  = context.dataStore.data.map { it[USER_LAST_NAME] }

    suspend fun saveTokens(
        accessToken: String,
        refreshToken: String,
        email: String,
        firstName: String,
        lastName: String,
    ) {
        _accessToken.value = accessToken
        secureTokenStorage.saveRefreshToken(refreshToken)
        context.dataStore.edit { prefs ->
            prefs[USER_EMAIL]      = email
            prefs[USER_FIRST_NAME] = firstName
            prefs[USER_LAST_NAME]  = lastName
        }
    }

    suspend fun clearTokens() {
        _accessToken.value = null
        secureTokenStorage.clear()
        context.dataStore.edit { it.clear() }
    }

    suspend fun getAccessTokenOnce(): String? = _accessToken.value
}
