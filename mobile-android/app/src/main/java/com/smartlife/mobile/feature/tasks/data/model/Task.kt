package com.smartlife.mobile.feature.tasks.data.model

data class Task(
    val id: Long = 0,
    val title: String = "",
    val description: String? = null,
    val category: String = "PERSONAL",
    val priority: String = "MEDIUM",
    // Backend renvoie `status` (TODO/IN_PROGRESS/DONE), pas un booléen `completed`.
    val status: String = "TODO",
    val startDate: String? = null,
    val dueDate: String? = null,
    val createdAt: String = "",
) {
    val completed: Boolean get() = status == "DONE"
}

data class CreateTaskRequest(
    val title: String,
    val category: String = "PERSONAL",
    val priority: String = "MEDIUM",
    val status: String = "TODO",
    val description: String? = null,
    val dueDate: String? = null,
)
