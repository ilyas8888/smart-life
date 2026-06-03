package com.smartlife.mobile.core.sync

import com.google.gson.Gson

data class OfflineAction(
    val id: String = java.util.UUID.randomUUID().toString(),
    val type: String,
    val endpoint: String,
    val method: String,
    val body: String,
    val createdAt: Long = System.currentTimeMillis(),
) {
    companion object {
        private val gson = Gson()

        fun createTask(title: String, category: String, priority: String) = OfflineAction(
            type = "CREATE_TASK",
            endpoint = "/tasks",
            method = "POST",
            body = gson.toJson(mapOf("title" to title, "category" to category, "priority" to priority)),
        )

        fun createNote(title: String, content: String) = OfflineAction(
            type = "CREATE_NOTE",
            endpoint = "/notes",
            method = "POST",
            body = gson.toJson(mapOf("title" to title, "content" to content)),
        )

        fun createReminder(title: String, dateTime: String) = OfflineAction(
            type = "CREATE_REMINDER",
            endpoint = "/reminders",
            method = "POST",
            body = gson.toJson(mapOf("title" to title, "dateTime" to dateTime)),
        )

        fun fromJson(json: String): OfflineAction = gson.fromJson(json, OfflineAction::class.java)
    }

    fun toJson(): String = Gson().toJson(this)
}
