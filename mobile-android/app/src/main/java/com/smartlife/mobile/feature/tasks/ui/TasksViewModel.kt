package com.smartlife.mobile.feature.tasks.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.tasks.data.TasksRepository
import com.smartlife.mobile.feature.tasks.data.model.CreateTaskRequest
import com.smartlife.mobile.feature.tasks.data.model.Task
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TasksViewModel @Inject constructor(
    private val repo: TasksRepository,
) : ViewModel() {

    private val _tasks = MutableStateFlow<List<Task>>(emptyList())
    val tasks: StateFlow<List<Task>> = _tasks.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadTasks() }

    fun loadTasks() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getTasks() }
                .onSuccess { _tasks.value = it }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun createTask(title: String, category: String = "PERSONAL", priority: String = "MEDIUM") {
        viewModelScope.launch {
            runCatching { repo.createTask(CreateTaskRequest(title, category, priority)) }
                .onSuccess { _tasks.value = _tasks.value + it }
                .onFailure { _error.value = it.message }
        }
    }

    fun toggleComplete(task: Task) {
        viewModelScope.launch {
            runCatching {
                if (task.completed) repo.reopenTask(task.id)
                else repo.completeTask(task.id)
            }.onSuccess { updated ->
                _tasks.value = _tasks.value.map { if (it.id == updated.id) updated else it }
            }.onFailure { _error.value = it.message }
        }
    }

    fun deleteTask(id: Long) {
        viewModelScope.launch {
            runCatching { repo.deleteTask(id) }
                .onSuccess { _tasks.value = _tasks.value.filter { it.id != id } }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearError() { _error.value = null }
}
