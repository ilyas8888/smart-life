package com.smartlife.mobile.core.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.smartlife.mobile.ui.theme.*

data class BottomNavItem(
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val route: String,
)

@Composable
fun BottomNavBar(
    navController: NavController,
    onAddClick: () -> Unit,
) {
    val items = listOf(
        BottomNavItem("Accueil", Icons.Default.Home,    Screen.Home.route),
        BottomNavItem("Agenda",  Icons.Default.DateRange, Screen.Agenda.route),
        BottomNavItem("Social",  Icons.Default.Group,  Screen.Social.route),
        BottomNavItem("Profil",  Icons.Default.Person, Screen.Profile.route),
    )

    val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route

    NavigationBar(
        containerColor = Surface,
        tonalElevation  = 0.dp,
        modifier = Modifier.height(80.dp),
    ) {
        // First 2 items
        items.take(2).forEach { item ->
            NavigationBarItem(
                selected = currentRoute == item.route,
                onClick  = {
                    navController.navigate(item.route) {
                        popUpTo(Screen.Home.route) { saveState = true }
                        launchSingleTop = true
                        restoreState    = true
                    }
                },
                icon  = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label, style = MaterialTheme.typography.labelSmall) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor   = Primary,
                    selectedTextColor   = Primary,
                    unselectedIconColor = OnSurface.copy(alpha = 0.5f),
                    unselectedTextColor = OnSurface.copy(alpha = 0.5f),
                    indicatorColor      = Primary.copy(alpha = 0.15f),
                ),
            )
        }

        // Central + button
        NavigationBarItem(
            selected = false,
            onClick  = onAddClick,
            icon = {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Primary),
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Ajouter", tint = OnPrimary)
                }
            },
            label = {},
            colors = NavigationBarItemDefaults.colors(indicatorColor = androidx.compose.ui.graphics.Color.Transparent),
        )

        // Last 2 items
        items.takeLast(2).forEach { item ->
            NavigationBarItem(
                selected = currentRoute == item.route,
                onClick  = {
                    navController.navigate(item.route) {
                        popUpTo(Screen.Home.route) { saveState = true }
                        launchSingleTop = true
                        restoreState    = true
                    }
                },
                icon  = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label, style = MaterialTheme.typography.labelSmall) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor   = Primary,
                    selectedTextColor   = Primary,
                    unselectedIconColor = OnSurface.copy(alpha = 0.5f),
                    unselectedTextColor = OnSurface.copy(alpha = 0.5f),
                    indicatorColor      = Primary.copy(alpha = 0.15f),
                ),
            )
        }
    }
}
