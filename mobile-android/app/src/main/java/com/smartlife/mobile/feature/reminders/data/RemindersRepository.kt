package com.smartlife.mobile.feature.reminders.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.reminders.data.model.CreateReminderRequest
import com.smartlife.mobile.feature.reminders.data.model.Reminder
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RemindersRepository @Inject constructor(private val api: ApiService) {
    suspend fun getReminders(): List<Reminder> = api.getReminders()
    suspend fun createReminder(request: CreateReminderRequest): Reminder = api.createReminder(request)
    suspend fun deleteReminder(id: Long) = api.deleteReminder(id)
}
