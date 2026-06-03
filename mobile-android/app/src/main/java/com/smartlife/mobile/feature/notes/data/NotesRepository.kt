package com.smartlife.mobile.feature.notes.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.notes.data.model.CreateNoteRequest
import com.smartlife.mobile.feature.notes.data.model.Note
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotesRepository @Inject constructor(private val api: ApiService) {
    suspend fun getNotes(): List<Note> = api.getNotes()
    suspend fun createNote(request: CreateNoteRequest): Note = api.createNote(request)
    suspend fun deleteNote(id: Long) = api.deleteNote(id)
    suspend fun pinNote(id: Long): Note = api.pinNote(id)
}
