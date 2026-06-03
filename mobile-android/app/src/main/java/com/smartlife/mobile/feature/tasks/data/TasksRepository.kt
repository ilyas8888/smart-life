package com.smartlife.mobile.feature.tasks.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.tasks.data.model.CreateTaskRequest
import com.smartlife.mobile.feature.tasks.data.model.Task
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TasksRepository @Inject constructor(private val api: ApiService) {
    suspend fun getTasks(): List<Task> = api.getTasks()
    suspend fun createTask(request: CreateTaskRequest): Task = api.createTask(request)
    suspend fun completeTask(id: Long): Task = api.updateTaskStatus(id, "DONE")
    suspend fun reopenTask(id: Long): Task = api.updateTaskStatus(id, "TODO")
    suspend fun deleteTask(id: Long) = api.deleteTask(id)
}
