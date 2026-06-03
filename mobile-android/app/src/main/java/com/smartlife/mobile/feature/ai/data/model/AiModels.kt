package com.smartlife.mobile.feature.ai.data.model

import com.google.gson.annotations.SerializedName

data class AiPromptRequest(val prompt: String)

/**
 * Backend AiEntitlementService.getStatus : status, planName, trialUsed, trialQuota,
 * monthlyUsed, monthlyQuota(-1 = illimité), resetAt, expiresAt, lastRequestStatus.
 * canUseAi / creditsUsed / creditsLimit sont dérivés côté client.
 */
data class AiAccessStatus(
    val status: String = "FREE",
    val planName: String = "Free",
    val trialUsed: Int = 0,
    val trialQuota: Int = 5,
    val monthlyUsed: Int = 0,
    val monthlyQuota: Int = -1,
    val lastRequestStatus: String = "NONE",
) {
    private val isFree get() = status.equals("FREE", true)

    val canUseAi: Boolean
        get() = when (status.uppercase()) {
            "BLOCKED" -> false
            "ADMIN" -> true
            "FREE" -> trialUsed < trialQuota
            else -> monthlyQuota < 0 || monthlyUsed < monthlyQuota
        }

    val creditsUsed: Int get() = if (isFree) trialUsed else monthlyUsed
    val creditsLimit: Int get() = if (isFree) trialQuota else monthlyQuota
}

/**
 * Backend PromptResponse : summary, tasksCreated, remindersCreated, notesCreated,
 * foodLogsCreated, workoutsCreated, etc.
 */
data class PromptResponse(
    @SerializedName("tasksCreated") val tasks: List<Map<String, @JvmSuppressWildcards Any>>? = null,
    @SerializedName("remindersCreated") val reminders: List<Map<String, @JvmSuppressWildcards Any>>? = null,
    @SerializedName("notesCreated") val notes: List<Map<String, @JvmSuppressWildcards Any>>? = null,
    @SerializedName("foodLogsCreated") val foodLogs: List<Map<String, @JvmSuppressWildcards Any>>? = null,
    @SerializedName("summary") val message: String? = null,
)
