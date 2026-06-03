package com.smartlife.mobile.feature.reminders.data.model

import com.google.gson.annotations.SerializedName

/**
 * Backend (entité Reminder) : remindAt, recurrenceRule, isDone→`done`, priority.
 * On garde les noms mobiles via @SerializedName.
 */
data class Reminder(
    val id: Long = 0,
    val title: String = "",
    val description: String? = null,
    @SerializedName("remindAt") val dateTime: String = "",
    @SerializedName("recurrenceRule") val recurrence: String? = null,
    val priority: String = "MEDIUM",
    @SerializedName("done") val completed: Boolean = false,
)

data class CreateReminderRequest(
    val title: String,
    @SerializedName("remindAt") val dateTime: String,
    val priority: String = "MEDIUM",
)
