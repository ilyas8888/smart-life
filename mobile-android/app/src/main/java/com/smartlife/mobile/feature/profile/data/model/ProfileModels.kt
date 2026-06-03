package com.smartlife.mobile.feature.profile.data.model

/**
 * Backend ProfileController.buildProfile (GET /profile/me) :
 * id, username, displayName, initials, firstName, lastName, bio, avatarColor,
 * hasAvatar, createdAt, email, badges[].
 */
data class UserProfile(
    val email: String = "",
    val displayName: String = "",
    val initials: String = "",
    val firstName: String? = null,
    val lastName: String? = null,
    val bio: String? = null,
    val avatarColor: String? = null,
    val hasAvatar: Boolean = false,
    val badges: List<Badge> = emptyList(),
)

/**
 * Backend BadgeService : name, description, emoji, color, type, earned, earnedAt(nullable).
 */
data class Badge(
    val type: String = "",
    val name: String = "",
    val description: String = "",
    val emoji: String? = null,
    val earned: Boolean = false,
    val earnedAt: String? = null,
)

data class UpdateProfileRequest(
    val firstName: String,
    val lastName: String,
    val bio: String? = null,
)
