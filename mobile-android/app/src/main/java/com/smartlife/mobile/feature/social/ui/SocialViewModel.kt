package com.smartlife.mobile.feature.social.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartlife.mobile.feature.notes.data.model.Note
import com.smartlife.mobile.feature.social.data.SocialRepository
import com.smartlife.mobile.feature.social.data.model.SocialComment
import com.smartlife.mobile.feature.social.data.model.SocialPost
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val PAGE_SIZE = 20

@HiltViewModel
class SocialViewModel @Inject constructor(
    private val repo: SocialRepository,
) : ViewModel() {

    private val _posts = MutableStateFlow<List<SocialPost>>(emptyList())
    val posts: StateFlow<List<SocialPost>> = _posts.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isLoadingMore = MutableStateFlow(false)
    val isLoadingMore: StateFlow<Boolean> = _isLoadingMore.asStateFlow()

    private val _hasMore = MutableStateFlow(true)
    val hasMore: StateFlow<Boolean> = _hasMore.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _comments = MutableStateFlow<List<SocialComment>>(emptyList())
    val comments: StateFlow<List<SocialComment>> = _comments.asStateFlow()

    private val _commentsLoading = MutableStateFlow(false)
    val commentsLoading: StateFlow<Boolean> = _commentsLoading.asStateFlow()

    private val _shareableNotes = MutableStateFlow<List<Note>>(emptyList())
    val shareableNotes: StateFlow<List<Note>> = _shareableNotes.asStateFlow()

    private var currentPage = 0

    init { loadPosts() }

    fun loadPosts() {
        currentPage = 0
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { repo.getPosts(0) }
                .onSuccess { list ->
                    _posts.value = list
                    _hasMore.value = list.size >= PAGE_SIZE
                    currentPage = 0
                }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }

    fun loadMore() {
        if (_isLoadingMore.value || !_hasMore.value) return
        viewModelScope.launch {
            _isLoadingMore.value = true
            runCatching { repo.getPosts(currentPage + 1) }
                .onSuccess { list ->
                    _posts.value = _posts.value + list
                    _hasMore.value = list.size >= PAGE_SIZE
                    currentPage++
                }
                .onFailure { _error.value = it.message }
            _isLoadingMore.value = false
        }
    }

    fun loadShareableNotes() {
        viewModelScope.launch {
            runCatching { repo.getShareableNotes() }
                .onSuccess { _shareableNotes.value = it }
                .onFailure { _error.value = it.message }
        }
    }

    fun createPostFromNote(noteId: Long, title: String, caption: String?) {
        viewModelScope.launch {
            runCatching { repo.createPost("NOTE", noteId, title, caption) }
                .onSuccess { post -> _posts.value = listOf(post) + _posts.value }
                .onFailure { _error.value = it.message }
        }
    }

    fun deletePost(id: Long) {
        viewModelScope.launch {
            runCatching { repo.deletePost(id) }
                .onSuccess { _posts.value = _posts.value.filter { it.id != id } }
                .onFailure { _error.value = it.message }
        }
    }

    fun react(postId: Long, type: String) {
        // Mise à jour optimiste alignée sur la logique backend (toggle / switch / add).
        _posts.value = _posts.value.map { post ->
            if (post.id != postId) return@map post
            val prev = post.myReaction
            val (newReaction, delta) = when {
                prev == type -> null to -1   // même réaction → retrait
                prev == null -> type to 1    // aucune → ajout
                else         -> type to 0    // changement de type
            }
            post.copy(myReaction = newReaction, reactionsCount = (post.reactionsCount + delta).coerceAtLeast(0))
        }
        viewModelScope.launch {
            runCatching { repo.react(postId, type) }
                .onFailure { _error.value = it.message; loadPosts() }
        }
    }

    fun savePost(postId: Long) {
        _posts.value = _posts.value.map { post ->
            if (post.id == postId) {
                val nowSaved = !post.isSaved
                post.copy(isSaved = nowSaved, savesCount = (post.savesCount + if (nowSaved) 1 else -1).coerceAtLeast(0))
            } else post
        }
        viewModelScope.launch {
            runCatching { repo.savePost(postId) }
                .onFailure { _error.value = it.message; loadPosts() }
        }
    }

    fun loadComments(postId: Long) {
        viewModelScope.launch {
            _commentsLoading.value = true
            runCatching { repo.getComments(postId) }
                .onSuccess { _comments.value = it }
                .onFailure { _error.value = it.message }
            _commentsLoading.value = false
        }
    }

    fun createComment(postId: Long, content: String) {
        viewModelScope.launch {
            runCatching { repo.createComment(postId, content) }
                .onSuccess { comment ->
                    _comments.value = _comments.value + comment
                    _posts.value = _posts.value.map { post ->
                        if (post.id == postId) post.copy(commentsCount = post.commentsCount + 1) else post
                    }
                }
                .onFailure { _error.value = it.message }
        }
    }

    fun clearComments() { _comments.value = emptyList() }
    fun clearError() { _error.value = null }
}
