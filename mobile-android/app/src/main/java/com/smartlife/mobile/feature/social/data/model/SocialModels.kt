package com.smartlife.mobile.feature.social.data.model

/**
 * Forme réelle du backend SocialController.toFeedItem.
 * Le feed est partagé autour d'une RESSOURCE existante (note, séance, repas...),
 * pas un texte libre.
 */
data class SocialAuthor(
    val userId: Long = 0,
    val name: String = "",
    val initials: String = "",
    val username: String = "",
    val avatarColor: String = "#6366F1",
    val hasAvatar: Boolean = false,
)

data class SocialPost(
    val id: Long = 0,
    val author: SocialAuthor = SocialAuthor(),
    val resourceType: String = "",
    val resourceId: Long = 0,
    val title: String? = null,
    val caption: String? = null,
    val reactions: Map<String, Int> = emptyMap(),
    val myReaction: String? = null,
    val commentsCount: Int = 0,
    val savesCount: Int = 0,
    val reactionsCount: Int = 0,
    val isSaved: Boolean = false,
    val createdAt: String = "",
    val timeAgo: String = "",
)

data class SocialComment(
    val id: Long = 0,
    val author: SocialAuthor = SocialAuthor(),
    val content: String = "",
    val createdAt: String = "",
    val timeAgo: String = "",
) {
    val authorName: String get() = author.name
}

data class CreatePostRequest(
    val resourceType: String,
    val resourceId: Long,
    val title: String? = null,
    val caption: String? = null,
)

data class ReactionRequest(val type: String)
data class CommentRequest(val content: String)

/** Les 4 réactions supportées par le backend, avec emoji + libellé FR. */
enum class SocialReactionType(val key: String, val emoji: String, val label: String) {
    INSPIRED("INSPIRED", "✨", "Inspiré"),
    TRYING("TRYING", "🔥", "J'essaie"),
    BRAVO("BRAVO", "👏", "Bravo"),
    HOW("HOW", "🤔", "Comment ?");

    companion object {
        val ALL = listOf(INSPIRED, TRYING, BRAVO, HOW)
    }
}
