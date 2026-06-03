package com.smartlife.mobile.feature.home.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.home.data.model.DayScore
import com.smartlife.mobile.feature.home.data.model.TimelineItem
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HomeRepository @Inject constructor(
    private val api: ApiService,
) {
    suspend fun getDayScore(date: String): Result<DayScore> = runCatching {
        api.getDayScore()
    }

    suspend fun getTimelineItems(date: String): Result<List<TimelineItem>> = runCatching {
        api.getTimeline().values.flatten()
    }

    suspend fun getTimelineMonth(year: Int, month: Int): Map<String, List<TimelineItem>> =
        api.getTimelineMonth(year, month)
}
