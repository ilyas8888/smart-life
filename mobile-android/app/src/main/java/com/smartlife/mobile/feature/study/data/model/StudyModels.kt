package com.smartlife.mobile.feature.study.data.model

import com.google.gson.annotations.SerializedName

/**
 * Backend StudyController.topicResponse : id, name, color, goal, targetHours, deadline, createdAt.
 * totalSessions / totalMinutes ne sont PAS renvoyés → calculés côté client depuis les sessions.
 */
data class StudyTopic(
    val id: Long = 0,
    val name: String = "",
    val color: String? = null,
    val totalSessions: Int = 0,
    val totalMinutes: Int = 0,
)

data class StudyTopicRef(
    val id: Long = 0,
    val name: String = "",
)

/**
 * Backend sessionResponse : id, topic{...}, title, startedAt, endedAt, durationMinutes, ...
 */
data class StudySession(
    val id: Long = 0,
    val topic: StudyTopicRef? = null,
    val title: String = "",
    @SerializedName("startedAt") val date: String = "",
    @SerializedName("durationMinutes") val durationMinutes: Int? = null,
) {
    val topicName: String get() = topic?.name ?: title
    val duration: Int get() = durationMinutes ?: 0
}

data class CreateTopicRequest(
    val name: String,
)

// Le backend utilise un flux start → finish (pas de création en une fois).
data class StartStudySessionRequest(
    val title: String,
    val topicId: Long,
    val startedAt: String,
)

data class FinishStudySessionRequest(
    val endedAt: String,
)
