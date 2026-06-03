package com.smartlife.mobile.feature.profile.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.profile.data.model.UpdateProfileRequest
import com.smartlife.mobile.feature.profile.data.model.UserProfile
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileRepository @Inject constructor(private val api: ApiService) {
    suspend fun getProfile(): UserProfile = api.getProfile()
    suspend fun updateProfile(request: UpdateProfileRequest): UserProfile = api.updateProfile(request)
}
