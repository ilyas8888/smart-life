# SmartLife ProGuard Rules

-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Retrofit + OkHttp
-keepattributes Signature
-keepattributes Exceptions
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}
-dontwarn retrofit2.**
-dontwarn okhttp3.**
-dontwarn okio.**

# Gson — keep data classes used in API
-keep class com.smartlife.mobile.feature.**.data.model.** { *; }
-keep class com.smartlife.mobile.core.sync.OfflineAction { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Hilt
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-dontwarn dagger.**

# WorkManager
-keep class androidx.work.** { *; }
-keep class com.smartlife.mobile.core.sync.SyncWorker { *; }

# Kotlin coroutines
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}
-dontwarn kotlinx.coroutines.**

# Compose — keep lambda classes
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# DataStore
-keep class androidx.datastore.** { *; }
