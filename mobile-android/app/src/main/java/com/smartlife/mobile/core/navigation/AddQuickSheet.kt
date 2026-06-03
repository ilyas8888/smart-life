package com.smartlife.mobile.core.navigation

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.smartlife.mobile.ui.theme.*

private data class QuickAction(
    val label: String,
    val icon: ImageVector,
    val color: androidx.compose.ui.graphics.Color,
    val route: String,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddQuickSheet(onDismiss: () -> Unit, onNavigate: (String) -> Unit) {
    val actions = listOf(
        QuickAction("Tâche",     Icons.Default.CheckCircle,   Primary,   Screen.Tasks.route),
        QuickAction("Rappel",    Icons.Default.Alarm,         Amber,     Screen.Reminders.route),
        QuickAction("Repas",     Icons.Default.Restaurant,    Green,     Screen.Food.route),
        QuickAction("Sport",     Icons.Default.FitnessCenter, Rose,      Screen.Workout.route),
        QuickAction("Note",      Icons.Default.Note,          Tertiary,  Screen.Notes.route),
        QuickAction("Sommeil",   Icons.Default.Bedtime,       Secondary, Screen.Sleep.route),
        QuickAction("Étude",     Icons.Default.School,        Primary,   Screen.Study.route),
        QuickAction("Prompt IA", Icons.Default.AutoAwesome,   Amber,     Screen.AiPrompt.route),
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Surface,
    ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            Text(
                text = "Ajouter",
                style = MaterialTheme.typography.titleMedium,
                color = OnBackground,
                modifier = Modifier.padding(bottom = 16.dp),
            )
            actions.chunked(4).forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    row.forEach { action ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .weight(1f)
                                .clickable { onNavigate(action.route) }
                                .padding(vertical = 12.dp),
                        ) {
                            Surface(
                                shape = MaterialTheme.shapes.medium,
                                color = action.color.copy(alpha = 0.15f),
                                modifier = Modifier.size(48.dp),
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(action.icon, contentDescription = action.label, tint = action.color)
                                }
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(action.label, style = MaterialTheme.typography.labelSmall, color = OnSurface)
                        }
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
