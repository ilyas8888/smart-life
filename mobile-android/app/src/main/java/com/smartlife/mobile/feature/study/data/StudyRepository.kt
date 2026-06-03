package com.smartlife.mobile.feature.study.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.study.data.model.CreateTopicRequest
import com.smartlife.mobile.feature.study.data.model.FinishStudySessionRequest
import com.smartlife.mobile.feature.study.data.model.StartStudySessionRequest
import com.smartlife.mobile.feature.study.data.model.StudySession
import com.smartlife.mobile.feature.study.data.model.StudyTopic
import java.time.LocalDateTime
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StudyRepository @Inject constructor(private val api: ApiService) {
    suspend fun getTopics(): List<StudyTopic> = api.getStudyTopics()
    suspend fun createTopic(request: CreateTopicRequest): StudyTopic = api.createStudyTopic(request)
    suspend fun getSessions(): List<StudySession> = api.getStudySessions()

    /**
     * Le backend ne crée pas une session finie en une fois : on démarre puis on termine.
     * startedAt = maintenant - durée, endedAt = maintenant → durée exacte.
     */
    suspend fun logSession(topicId: Long, title: String, durationMinutes: Int): StudySession {
        val now = LocalDateTime.now()
        val started = now.minusMinutes(durationMinutes.toLong())
        val session = api.startStudySession(
            StartStudySessionRequest(title = title, topicId = topicId, startedAt = started.toString())
        )
        return api.finishStudySession(session.id, FinishStudySessionRequest(endedAt = now.toString()))
    }
}
