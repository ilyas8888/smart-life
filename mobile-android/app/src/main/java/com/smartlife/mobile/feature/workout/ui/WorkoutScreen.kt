package com.smartlife.mobile.feature.workout.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.feature.workout.data.model.WorkoutSession
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkoutScreen(viewModel: WorkoutViewModel = hiltViewModel()) {
    val sessions by viewModel.sessions.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var showAddSheet by remember { mutableStateOf(false) }

    val totalMinutesToday = sessions.filter { it.date.startsWith(java.time.LocalDate.now().toString()) }
        .sumOf { it.duration }
    val totalCaloriesToday = sessions.filter { it.date.startsWith(java.time.LocalDate.now().toString()) }
        .sumOf { it.calories ?: 0 }

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 88.dp)) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("Sport", style = MaterialTheme.typography.headlineSmall,
                        color = OnBackground, fontWeight = FontWeight.Bold)
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Rose, strokeWidth = 2.dp)
                    } else {
                        IconButton(onClick = { viewModel.loadSessions() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
                        }
                    }
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    StatCard(modifier = Modifier.weight(1f), label = "Aujourd'hui", value = "${totalMinutesToday}min", color = Rose)
                    StatCard(modifier = Modifier.weight(1f), label = "Calories brûlées", value = "${totalCaloriesToday}kcal", color = Amber)
                }
            }

            if (sessions.isEmpty() && !isLoading) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.FitnessCenter, contentDescription = null,
                                tint = OnSurface.copy(alpha = 0.3f), modifier = Modifier.size(48.dp))
                            Spacer(Modifier.height(8.dp))
                            Text("Aucune séance", style = MaterialTheme.typography.bodyMedium,
                                color = OnSurface.copy(alpha = 0.5f))
                        }
                    }
                }
            } else {
                item {
                    Text("Séances récentes", style = MaterialTheme.typography.titleSmall,
                        color = OnBackground, fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                }
                items(sessions, key = { it.id }) { session ->
                    WorkoutCard(session = session, onDelete = { viewModel.deleteSession(session.id) })
                    Spacer(Modifier.height(8.dp))
                }
            }
        }

        FloatingActionButton(
            onClick = { showAddSheet = true },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            containerColor = Rose,
            contentColor = OnPrimary,
        ) {
            Icon(Icons.Default.Add, contentDescription = "Nouvelle séance")
        }
    }

    if (showAddSheet) {
        AddWorkoutSheet(
            onDismiss = { showAddSheet = false },
            onCreate = { type, duration, cal ->
                viewModel.createSession(type, duration, cal)
                showAddSheet = false
            },
        )
    }
}

@Composable
private fun StatCard(modifier: Modifier, label: String, value: String, color: androidx.compose.ui.graphics.Color) {
    Surface(modifier = modifier, color = Surface, shape = MaterialTheme.shapes.large) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(label, style = MaterialTheme.typography.bodySmall, color = OnSurface)
            Spacer(Modifier.height(4.dp))
            Text(value, style = MaterialTheme.typography.titleMedium, color = color, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun WorkoutCard(session: WorkoutSession, onDelete: () -> Unit) {
    Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), color = Surface, shape = MaterialTheme.shapes.large) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(shape = MaterialTheme.shapes.medium, color = Rose.copy(alpha = 0.15f), modifier = Modifier.size(40.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.FitnessCenter, contentDescription = null, tint = Rose, modifier = Modifier.size(20.dp))
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(session.type, style = MaterialTheme.typography.bodyMedium, color = OnBackground, fontWeight = FontWeight.Medium)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("${session.duration}min", style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.7f))
                    if (session.calories != null) Text("${session.calories}kcal", style = MaterialTheme.typography.bodySmall, color = Rose)
                }
            }
            Text(session.date.take(10), style = MaterialTheme.typography.labelSmall, color = OnSurface.copy(alpha = 0.5f))
            Spacer(Modifier.width(4.dp))
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.DeleteOutline, contentDescription = "Supprimer",
                    tint = OnSurface.copy(alpha = 0.4f), modifier = Modifier.size(16.dp))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddWorkoutSheet(onDismiss: () -> Unit, onCreate: (String, Int, Int?) -> Unit) {
    var type by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("30") }
    var calories by remember { mutableStateOf("") }

    val workoutTypes = listOf("Course", "Musculation", "Vélo", "Natation", "Yoga", "HIIT", "Marche", "Autre")

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text("Nouvelle séance", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))

            Text("Type d'activité", style = MaterialTheme.typography.labelMedium, color = OnSurface)
            Spacer(Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                workoutTypes.take(4).forEach { t ->
                    FilterChip(selected = type == t, onClick = { type = t },
                        label = { Text(t, style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Rose.copy(alpha = 0.2f),
                            selectedLabelColor = Rose, containerColor = Background, labelColor = OnSurface),
                        border = FilterChipDefaults.filterChipBorder(enabled = true, selected = type == t,
                            selectedBorderColor = Rose, borderColor = Outline))
                }
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                workoutTypes.drop(4).forEach { t ->
                    FilterChip(selected = type == t, onClick = { type = t },
                        label = { Text(t, style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Rose.copy(alpha = 0.2f),
                            selectedLabelColor = Rose, containerColor = Background, labelColor = OnSurface),
                        border = FilterChipDefaults.filterChipBorder(enabled = true, selected = type == t,
                            selectedBorderColor = Rose, borderColor = Outline))
                }
            }
            Spacer(Modifier.height(12.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = duration, onValueChange = { duration = it }, label = { Text("Durée (min)") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Rose, unfocusedBorderColor = Outline,
                        focusedLabelColor = Rose, cursorColor = Rose))
                OutlinedTextField(value = calories, onValueChange = { calories = it }, label = { Text("Calories (opt)") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Rose, unfocusedBorderColor = Outline,
                        focusedLabelColor = Rose, cursorColor = Rose))
            }
            Spacer(Modifier.height(20.dp))

            Button(
                onClick = { if (type.isNotBlank()) onCreate(type, duration.toIntOrNull() ?: 30, calories.toIntOrNull()) },
                enabled = type.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Rose),
                shape = MaterialTheme.shapes.medium,
            ) { Text("Enregistrer", color = OnPrimary) }
        }
    }
}
