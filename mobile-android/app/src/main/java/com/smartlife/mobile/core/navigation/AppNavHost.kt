package com.smartlife.mobile.core.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.smartlife.mobile.feature.agenda.ui.AgendaScreen
import com.smartlife.mobile.feature.auth.ui.LoginScreen
import com.smartlife.mobile.feature.auth.ui.RegisterScreen
import com.smartlife.mobile.feature.food.ui.FoodScreen
import com.smartlife.mobile.feature.home.ui.HomeScreen
import com.smartlife.mobile.feature.notes.ui.NotesScreen
import com.smartlife.mobile.feature.profile.ui.ProfileScreen
import com.smartlife.mobile.feature.reminders.ui.RemindersScreen
import com.smartlife.mobile.feature.sleep.ui.SleepScreen
import com.smartlife.mobile.feature.social.ui.SocialScreen
import com.smartlife.mobile.feature.study.ui.StudyScreen
import com.smartlife.mobile.feature.tasks.ui.TasksScreen
import com.smartlife.mobile.feature.workout.ui.WorkoutScreen
import com.smartlife.mobile.feature.ai.ui.AiPromptScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavHost(
    isLoggedIn: Boolean,
    navController: NavHostController = rememberNavController(),
) {
    var showAddSheet by remember { mutableStateOf(false) }

    val startDestination = if (isLoggedIn) Screen.Home.route else Screen.Login.route

    val bottomNavRoutes = setOf(
        Screen.Home.route, Screen.Agenda.route, Screen.Social.route, Screen.Profile.route,
    )
    val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route
    val showBottomBar = currentRoute in bottomNavRoutes

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(
                    navController = navController,
                    onAddClick = { showAddSheet = true },
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding),
        ) {
            // Auth
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                )
            }
            composable(Screen.Register.route) {
                RegisterScreen(
                    onRegisterSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateToLogin = { navController.popBackStack() },
                )
            }

            // Bottom nav
            composable(Screen.Home.route) { HomeScreen() }
            composable(Screen.Agenda.route) { AgendaScreen() }
            composable(Screen.Social.route) { SocialScreen() }
            composable(Screen.Profile.route) {
                ProfileScreen(onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                })
            }

            // Phase 2
            composable(Screen.Tasks.route) { TasksScreen() }
            composable(Screen.Notes.route) { NotesScreen() }
            composable(Screen.Reminders.route) { RemindersScreen() }

            // Phase 3
            composable(Screen.Food.route) { FoodScreen() }
            composable(Screen.Workout.route) { WorkoutScreen() }
            composable(Screen.Sleep.route) { SleepScreen() }
            composable(Screen.Study.route) { StudyScreen() }
            composable(Screen.AiPrompt.route) { AiPromptScreen() }
        }
    }

    if (showAddSheet) {
        AddQuickSheet(
            onDismiss = { showAddSheet = false },
            onNavigate = { route ->
                showAddSheet = false
                navController.navigate(route)
            },
        )
    }
}
