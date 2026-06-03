package com.smartlife.mobile.core.notifications

// ═══════════════════════════════════════════════════════════════
// Phase 5 — Firebase Cloud Messaging
// ───────────────────────────────────────────────────────────────
// Pour activer :
//   1. Aller sur console.firebase.google.com
//   2. Projet → Add app → Android → package: com.smartlife.mobile
//   3. Télécharger google-services.json → mobile-android/app/
//   4. Dans app/build.gradle.kts : décommenter alias(libs.plugins.google.services)
//   5. Dans app/build.gradle.kts : décommenter firebase-bom + firebase-messaging
//   6. Dans AndroidManifest.xml : décommenter le bloc <service>
//   7. Décommenter tout le code ci-dessous
// ═══════════════════════════════════════════════════════════════

// import android.app.NotificationChannel
// import android.app.NotificationManager
// import android.app.PendingIntent
// import android.content.Context
// import android.content.Intent
// import android.os.Build
// import androidx.core.app.NotificationCompat
// import com.google.firebase.messaging.FirebaseMessagingService
// import com.google.firebase.messaging.RemoteMessage
// import com.smartlife.mobile.MainActivity
// import dagger.hilt.android.AndroidEntryPoint
// import kotlinx.coroutines.CoroutineScope
// import kotlinx.coroutines.Dispatchers
// import kotlinx.coroutines.launch
// import okhttp3.MediaType.Companion.toMediaType
// import okhttp3.OkHttpClient
// import okhttp3.Request
// import okhttp3.RequestBody.Companion.toRequestBody
// import javax.inject.Inject
//
// @AndroidEntryPoint
// class FcmService : FirebaseMessagingService() {
//
//     @Inject
//     lateinit var tokenDataStore: com.smartlife.mobile.core.datastore.TokenDataStore
//
//     companion object {
//         const val CHANNEL_ID = "smartlife_notifications"
//         const val CHANNEL_NAME = "SmartLife Notifications"
//     }
//
//     override fun onNewToken(token: String) {
//         super.onNewToken(token)
//         CoroutineScope(Dispatchers.IO).launch {
//             registerTokenWithBackend(token)
//         }
//     }
//
//     private suspend fun registerTokenWithBackend(fcmToken: String) {
//         val accessToken = tokenDataStore.accessToken.value ?: return
//         val client = OkHttpClient()
//         val json = """{"token":"$fcmToken","platform":"ANDROID"}"""
//         val body = json.toRequestBody("application/json".toMediaType())
//         val request = Request.Builder()
//             .url("https://ilyas8888-smartlife-backend.hf.space/api/mobile/push-token")
//             .addHeader("Authorization", "Bearer $accessToken")
//             .post(body)
//             .build()
//         runCatching { client.newCall(request).execute() }
//     }
//
//     override fun onMessageReceived(message: RemoteMessage) {
//         super.onMessageReceived(message)
//         val title = message.notification?.title ?: message.data["title"] ?: "SmartLife"
//         val body  = message.notification?.body  ?: message.data["body"]  ?: ""
//         showNotification(title, body)
//     }
//
//     private fun showNotification(title: String, body: String) {
//         val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//
//         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//             val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT)
//             manager.createNotificationChannel(channel)
//         }
//
//         val intent = Intent(this, MainActivity::class.java).apply {
//             flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
//         }
//         val pendingIntent = PendingIntent.getActivity(
//             this, 0, intent, PendingIntent.FLAG_IMMUTABLE
//         )
//
//         val notification = NotificationCompat.Builder(this, CHANNEL_ID)
//             .setContentTitle(title)
//             .setContentText(body)
//             .setSmallIcon(android.R.drawable.ic_notification_overlay)
//             .setAutoCancel(true)
//             .setContentIntent(pendingIntent)
//             .build()
//
//         manager.notify(System.currentTimeMillis().toInt(), notification)
//     }
// }
