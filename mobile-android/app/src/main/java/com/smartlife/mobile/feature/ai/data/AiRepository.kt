package com.smartlife.mobile.feature.ai.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.ai.data.model.AiPromptRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AiRepository @Inject constructor(private val api: ApiService) {
    suspend fun getStatus() = api.getAiStatus()
    suspend fun processPrompt(prompt: String) = api.processPrompt(AiPromptRequest(prompt))
}
