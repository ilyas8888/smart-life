package com.smartlife.mobile.core.network

import com.smartlife.mobile.feature.auth.data.model.AuthRequest
import com.smartlife.mobile.feature.auth.data.model.AuthResponse
import com.smartlife.mobile.feature.auth.data.model.OtpRequest
import com.smartlife.mobile.feature.auth.data.model.RefreshRequest
import com.smartlife.mobile.feature.auth.data.model.RefreshResponse
import com.smartlife.mobile.feature.home.data.model.DayScore
import com.smartlife.mobile.feature.home.data.model.TimelineItem
import com.smartlife.mobile.feature.tasks.data.model.Task
import com.smartlife.mobile.feature.tasks.data.model.CreateTaskRequest
import com.smartlife.mobile.feature.notes.data.model.Note
import com.smartlife.mobile.feature.notes.data.model.CreateNoteRequest
import com.smartlife.mobile.feature.reminders.data.model.Reminder
import com.smartlife.mobile.feature.reminders.data.model.CreateReminderRequest
import com.smartlife.mobile.feature.food.data.model.FoodLog
import com.smartlife.mobile.feature.food.data.model.CreateFoodLogRequest
import com.smartlife.mobile.feature.food.data.model.NutritionSummary
import com.smartlife.mobile.feature.workout.data.model.WorkoutSession
import com.smartlife.mobile.feature.workout.data.model.CreateWorkoutRequest
import com.smartlife.mobile.feature.workout.data.model.WorkoutPlan
import com.smartlife.mobile.feature.sleep.data.model.SleepLog
import com.smartlife.mobile.feature.sleep.data.model.CreateSleepLogRequest
import com.smartlife.mobile.feature.study.data.model.StudyTopic
import com.smartlife.mobile.feature.study.data.model.StudySession
import com.smartlife.mobile.feature.study.data.model.StartStudySessionRequest
import com.smartlife.mobile.feature.study.data.model.FinishStudySessionRequest
import com.smartlife.mobile.feature.study.data.model.CreateTopicRequest
import com.smartlife.mobile.feature.profile.data.model.UserProfile
import com.smartlife.mobile.feature.profile.data.model.UpdateProfileRequest
import com.smartlife.mobile.feature.social.data.model.SocialPost
import com.smartlife.mobile.feature.social.data.model.SocialComment
import com.smartlife.mobile.feature.social.data.model.CreatePostRequest
import com.smartlife.mobile.feature.social.data.model.ReactionRequest
import com.smartlife.mobile.feature.social.data.model.CommentRequest
import com.smartlife.mobile.feature.ai.data.model.AiPromptRequest
import com.smartlife.mobile.feature.ai.data.model.AiAccessStatus
import com.smartlife.mobile.feature.ai.data.model.PromptResponse
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // AUTH
    @POST("auth/login")
    suspend fun login(@Body request: AuthRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body request: AuthRequest): Map<String, @JvmSuppressWildcards Any>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: OtpRequest): AuthResponse

    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshRequest): RefreshResponse

    @POST("auth/logout")
    suspend fun logout(): Response<Unit>

    // HOME
    @GET("score/today")
    suspend fun getDayScore(): DayScore

    @GET("timeline")
    suspend fun getTimeline(): Map<String, @JvmSuppressWildcards List<TimelineItem>>

    @GET("timeline/month")
    suspend fun getTimelineMonth(
        @Query("year") year: Int,
        @Query("month") month: Int
    ): Map<String, @JvmSuppressWildcards List<TimelineItem>>

    // TASKS
    @GET("tasks")
    suspend fun getTasks(): List<Task>

    @POST("tasks")
    suspend fun createTask(@Body request: CreateTaskRequest): Task

    @PUT("tasks/{id}")
    suspend fun updateTask(@Path("id") id: Long, @Body task: Task): Task

    @DELETE("tasks/{id}")
    suspend fun deleteTask(@Path("id") id: Long): Response<Unit>

    @PATCH("tasks/{id}/status")
    suspend fun updateTaskStatus(
        @Path("id") id: Long,
        @Query("status") status: String
    ): Task

    // NOTES
    @GET("notes")
    suspend fun getNotes(): List<Note>

    @POST("notes")
    suspend fun createNote(@Body request: CreateNoteRequest): Note

    @PUT("notes/{id}")
    suspend fun updateNote(@Path("id") id: Long, @Body note: Note): Note

    @DELETE("notes/{id}")
    suspend fun deleteNote(@Path("id") id: Long): Response<Unit>

    @PATCH("notes/{id}/pin")
    suspend fun pinNote(@Path("id") id: Long): Note

    // REMINDERS
    @GET("reminders")
    suspend fun getReminders(): List<Reminder>

    @POST("reminders")
    suspend fun createReminder(@Body request: CreateReminderRequest): Reminder

    @PUT("reminders/{id}")
    suspend fun updateReminder(@Path("id") id: Long, @Body reminder: Reminder): Reminder

    @DELETE("reminders/{id}")
    suspend fun deleteReminder(@Path("id") id: Long): Response<Unit>

    // FOOD LOGS
    @GET("food-logs/today")
    suspend fun getFoodLogs(): List<FoodLog>

    @POST("food-logs")
    suspend fun createFoodLog(@Body request: CreateFoodLogRequest): FoodLog

    @DELETE("food-logs/{id}")
    suspend fun deleteFoodLog(@Path("id") id: Long): Response<Unit>

    @GET("food-logs/summary/today")
    suspend fun getNutritionSummary(): NutritionSummary

    // WORKOUTS
    @GET("workouts")
    suspend fun getWorkouts(): List<WorkoutSession>

    @POST("workouts")
    suspend fun createWorkout(@Body request: CreateWorkoutRequest): WorkoutSession

    @DELETE("workouts/{id}")
    suspend fun deleteWorkout(@Path("id") id: Long): Response<Unit>

    @GET("workout-plans")
    suspend fun getWorkoutPlans(): List<WorkoutPlan>

    // SLEEP
    @GET("sleep-logs")
    suspend fun getSleepLogs(): List<SleepLog>

    @POST("sleep-logs")
    suspend fun createSleepLog(@Body request: CreateSleepLogRequest): SleepLog

    @DELETE("sleep-logs/{id}")
    suspend fun deleteSleepLog(@Path("id") id: Long): Response<Unit>

    // STUDY
    @GET("study/topics")
    suspend fun getStudyTopics(): List<StudyTopic>

    @POST("study/topics")
    suspend fun createStudyTopic(@Body request: CreateTopicRequest): StudyTopic

    @GET("study/sessions")
    suspend fun getStudySessions(): List<StudySession>

    @POST("study/sessions/start")
    suspend fun startStudySession(@Body request: StartStudySessionRequest): StudySession

    @PUT("study/sessions/{id}/finish")
    suspend fun finishStudySession(
        @Path("id") id: Long,
        @Body request: FinishStudySessionRequest,
    ): StudySession

    // PROFILE
    @GET("profile/me")
    suspend fun getProfile(): UserProfile

    @PUT("profile/me")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): UserProfile

    // SOCIAL — le feed renvoie une List brute (pas une Page Spring)
    @GET("social/posts")
    suspend fun getSocialPosts(@Query("page") page: Int = 0): List<SocialPost>

    @POST("social/posts")
    suspend fun createPost(@Body request: CreatePostRequest): SocialPost

    @DELETE("social/posts/{id}")
    suspend fun deletePost(@Path("id") id: Long): Response<Unit>

    @POST("social/posts/{id}/react")
    suspend fun reactToPost(@Path("id") id: Long, @Body request: ReactionRequest): Response<Unit>

    @GET("social/posts/{id}/comments")
    suspend fun getComments(@Path("id") id: Long): List<SocialComment>

    @POST("social/posts/{id}/comments")
    suspend fun createComment(@Path("id") id: Long, @Body request: CommentRequest): SocialComment

    @POST("social/posts/{id}/save")
    suspend fun savePost(@Path("id") id: Long): Response<Unit>

    // AI
    @POST("prompt")
    suspend fun processPrompt(@Body request: AiPromptRequest): PromptResponse

    @GET("ai-access/status")
    suspend fun getAiStatus(): AiAccessStatus
}
