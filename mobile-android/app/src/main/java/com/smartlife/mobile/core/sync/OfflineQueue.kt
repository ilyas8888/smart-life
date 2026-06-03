package com.smartlife.mobile.core.sync

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.offlineDataStore by preferencesDataStore("smartlife_offline_queue")

@Singleton
class OfflineQueue @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val KEY = stringPreferencesKey("pending_actions")
    private val gson = Gson()

    suspend fun enqueue(action: OfflineAction) {
        context.offlineDataStore.edit { prefs ->
            val current = prefs[KEY]?.let {
                gson.fromJson(it, Array<OfflineAction>::class.java).toMutableList()
            } ?: mutableListOf()
            current.add(action)
            prefs[KEY] = gson.toJson(current)
        }
    }

    suspend fun dequeueAll(): List<OfflineAction> {
        return context.offlineDataStore.data.map { prefs ->
            prefs[KEY]?.let {
                gson.fromJson(it, Array<OfflineAction>::class.java).toList()
            } ?: emptyList()
        }.first()
    }

    suspend fun clear() {
        context.offlineDataStore.edit { it.remove(KEY) }
    }

    suspend fun remove(id: String) {
        context.offlineDataStore.edit { prefs ->
            val current = prefs[KEY]?.let {
                gson.fromJson(it, Array<OfflineAction>::class.java).toMutableList()
            } ?: mutableListOf()
            current.removeAll { it.id == id }
            prefs[KEY] = gson.toJson(current)
        }
    }

    suspend fun size(): Int = dequeueAll().size
}
