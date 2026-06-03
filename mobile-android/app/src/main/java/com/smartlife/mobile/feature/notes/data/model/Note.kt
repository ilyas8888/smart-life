package com.smartlife.mobile.feature.notes.data.model

data class Note(
    val id: Long = 0,
    val title: String = "",
    val content: String = "",
    val color: String? = null,
    val tags: List<String> = emptyList(),
    val pinned: Boolean = false,
    val createdAt: String = "",
)

data class CreateNoteRequest(
    val title: String,
    val content: String,
    val color: String? = null,
    val tags: List<String> = emptyList(),
)
