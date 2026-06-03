package com.smartlife.mobile.feature.notes.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.notes.data.NotesRepository
import com.smartlife.mobile.feature.notes.data.model.CreateNoteRequest
import com.smartlife.mobile.feature.notes.data.model.Note
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotesViewModel @Inject constructor(
    private val repo: NotesRepository,
) : ViewModel() {

    private val _notes = MutableStateFlow<List<Note>>(emptyList())
    val notes: StateFlow<List<Note>> = _notes.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { loadNotes() }

    fun loadNotes() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getNotes() }
                .onSuccess { _notes.value = it.sortedByDescending { n -> n.pinned } }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun createNote(title: String, content: String) {
        viewModelScope.launch {
            runCatching { repo.createNote(CreateNoteRequest(title, content)) }
                .onSuccess { _notes.value = listOf(it) + _notes.value }
                .onFailure { _error.value = it.message }
        }
    }

    fun deleteNote(id: Long) {
        viewModelScope.launch {
            runCatching { repo.deleteNote(id) }
                .onSuccess { _notes.value = _notes.value.filter { it.id != id } }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearError() { _error.value = null }
}
