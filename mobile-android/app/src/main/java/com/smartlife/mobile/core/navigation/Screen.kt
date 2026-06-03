package com.smartlife.mobile.core.navigation

sealed class Screen(val route: String) {
    // Auth flow
    object Login    : Screen("login")
    object Register : Screen("register")
    object Otp      : Screen("otp/{email}") {
        fun createRoute(email: String) = "otp/$email"
    }

    // Main flow (bottom nav)
    object Home    : Screen("home")
    object Agenda  : Screen("agenda")
    object Social  : Screen("social")
    object Profile : Screen("profile")

    // Feature screens
    object Tasks     : Screen("tasks")
    object Reminders : Screen("reminders")
    object Notes     : Screen("notes")
    object Food      : Screen("food")
    object Workout   : Screen("workout")
    object Sleep     : Screen("sleep")
    object Study     : Screen("study")
    object AiPrompt  : Screen("ai_prompt")
}
