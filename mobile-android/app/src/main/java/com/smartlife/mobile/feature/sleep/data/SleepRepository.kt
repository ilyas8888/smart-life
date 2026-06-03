package com.smartlife.mobile.feature.sleep.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.sleep.data.model.CreateSleepLogRequest
import com.smartlife.mobile.feature.sleep.data.model.SleepLog
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SleepRepository @Inject constructor(private val api: ApiService) {
    suspend fun getSleepLogs(): List<SleepLog> = api.getSleepLogs()
    suspend fun createSleepLog(request: CreateSleepLogRequest): SleepLog = api.createSleepLog(request)
    suspend fun deleteSleepLog(id: Long) = api.deleteSleepLog(id)
}
