package com.smartlife.mobile.core.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.*
import com.smartlife.mobile.BuildConfig
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val offlineQueue: OfflineQueue,
    private val httpClient: OkHttpClient,
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val WORK_NAME = "smartlife_sync"

        fun schedule(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request,
            )
        }

        fun runNow(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueue(request)
        }
    }

    override suspend fun doWork(): Result {
        val actions = offlineQueue.dequeueAll()
        if (actions.isEmpty()) return Result.success()

        var allSucceeded = true
        actions.forEach { action ->
            runCatching {
                val body = action.body.toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url("${BuildConfig.API_BASE_URL}/api${action.endpoint}")
                    .addHeader("X-Idempotency-Key", action.id)
                    .method(action.method, body)
                    .build()
                val response = httpClient.newCall(request).execute()
                if (response.isSuccessful) {
                    offlineQueue.remove(action.id)
                } else {
                    allSucceeded = false
                }
            }.onFailure { allSucceeded = false }
        }

        return if (allSucceeded) Result.success() else Result.retry()
    }
}
