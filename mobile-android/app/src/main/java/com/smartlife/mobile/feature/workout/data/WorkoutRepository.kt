package com.smartlife.mobile.feature.workout.data

import com.smartlife.mobile.core.network.ApiService
import com.smartlife.mobile.feature.workout.data.model.CreateWorkoutRequest
import com.smartlife.mobile.feature.workout.data.model.WorkoutPlan
import com.smartlife.mobile.feature.workout.data.model.WorkoutSession
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WorkoutRepository @Inject constructor(private val api: ApiService) {
    suspend fun getWorkouts(): List<WorkoutSession> = api.getWorkouts()
    suspend fun createWorkout(request: CreateWorkoutRequest): WorkoutSession = api.createWorkout(request)
    suspend fun deleteWorkout(id: Long) = api.deleteWorkout(id)
    suspend fun getWorkoutPlans(): List<WorkoutPlan> = api.getWorkoutPlans()
}
