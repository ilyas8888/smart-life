package com.smartlife.mobile.feature.social.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.notes.data.model.Note
import com.smartlife.mobile.feature.social.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SocialRepository @Inject constructor(private val api: ApiService) {
    suspend fun getPosts(page: Int = 0): List<SocialPost> = api.getSocialPosts(page)

    suspend fun createPost(resourceType: String, resourceId: Long, title: String?, caption: String?): SocialPost =
        api.createPost(CreatePostRequest(resourceType, resourceId, title, caption))

    suspend fun deletePost(id: Long) = api.deletePost(id)
    suspend fun react(id: Long, type: String) = api.reactToPost(id, ReactionRequest(type))
    suspend fun getComments(id: Long) = api.getComments(id)
    suspend fun createComment(id: Long, content: String): SocialComment =
        api.createComment(id, CommentRequest(content))
    suspend fun savePost(id: Long) = api.savePost(id)

    /** Ressources partageables : on propose les notes de l'utilisateur (le backend valide la propriété). */
    suspend fun getShareableNotes(): List<Note> = api.getNotes()
}
