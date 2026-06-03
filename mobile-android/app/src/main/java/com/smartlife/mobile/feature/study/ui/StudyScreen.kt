package com.smartlife.mobile.feature.study.ui

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
import com.smartlife.mobile.feature.study.data.model.StudySession
import com.smartlife.mobile.feature.study.data.model.StudyTopic
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyScreen(viewModel: StudyViewModel = hiltViewModel()) {
    val topics by viewModel.topics.collectAsState()
    val sessions by viewModel.sessions.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var showAddTopic by remember { mutableStateOf(false) }
    var showLogSession by remember { mutableStateOf(false) }
    var selectedTopic by remember { mutableStateOf<StudyTopic?>(null) }

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 88.dp)) {
            item {
                Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Étude", style = MaterialTheme.typography.headlineSmall,
                        color = OnBackground, fontWeight = FontWeight.Bold)
                    Row {
                        if (isLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Tertiary, strokeWidth = 2.dp)
                        } else {
                            IconButton(onClick = { viewModel.loadAll() }) {
                                Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
                            }
                        }
                        IconButton(onClick = { showAddTopic = true }) {
                            Icon(Icons.Default.Add, contentDescription = "Nouveau sujet", tint = Tertiary)
                        }
                    }
                }
            }

            val totalMin = topics.sumOf { it.totalMinutes }
            item {
                Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(Modifier.weight(1f), "Sujets", "${topics.size}", Tertiary)
                    StatCard(Modifier.weight(1f), "Total", "${totalMin}min", Primary)
                }
            }

            if (topics.isNotEmpty()) {
                item {
                    Text("Sujets", style = MaterialTheme.typography.titleSmall,
                        color = OnBackground, fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                }
                items(topics, key = { it.id }) { topic ->
                    TopicCard(
                        topic = topic,
                        onClick = { selectedTopic = topic; showLogSession = true },
                    )
                    Spacer(Modifier.height(8.dp))
                }
            }

            if (sessions.isNotEmpty()) {
                item {
                    Text("Sessions récentes", style = MaterialTheme.typography.titleSmall,
                        color = OnBackground, fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                }
                items(sessions.take(10), key = { it.id }) { session ->
                    SessionCard(session = session)
                    Spacer(Modifier.height(8.dp))
                }
            }

            if (topics.isEmpty() && sessions.isEmpty() && !isLoading) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.School, contentDescription = null,
                                tint = OnSurface.copy(alpha = 0.3f), modifier = Modifier.size(48.dp))
                            Spacer(Modifier.height(8.dp))
                            Text("Créez un sujet pour commencer", style = MaterialTheme.typography.bodyMedium,
                                color = OnSurface.copy(alpha = 0.5f))
                        }
                    }
                }
            }
        }
    }

    if (showAddTopic) {
        AddTopicSheet(onDismiss = { showAddTopic = false }, onCreate = { name ->
            viewModel.createTopic(name); showAddTopic = false
        })
    }

    if (showLogSession && selectedTopic != null) {
        LogSessionSheet(
            topic = selectedTopic!!,
            onDismiss = { showLogSession = false; selectedTopic = null },
            onLog = { duration ->
                viewModel.logSession(selectedTopic!!.id, selectedTopic!!.name, duration)
                showLogSession = false; selectedTopic = null
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
private fun TopicCard(topic: StudyTopic, onClick: () -> Unit) {
    Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        color = Surface, shape = MaterialTheme.shapes.large, onClick = onClick) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(shape = MaterialTheme.shapes.medium, color = Tertiary.copy(alpha = 0.15f), modifier = Modifier.size(40.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.School, contentDescription = null, tint = Tertiary, modifier = Modifier.size(20.dp))
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(topic.name, style = MaterialTheme.typography.bodyMedium, color = OnBackground, fontWeight = FontWeight.Medium)
                Text("${topic.totalSessions} sessions · ${topic.totalMinutes}min",
                    style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.7f))
            }
            Icon(Icons.Default.PlayArrow, contentDescription = "Logger session", tint = Tertiary)
        }
    }
}

@Composable
private fun SessionCard(session: StudySession) {
    Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), color = Surface, shape = MaterialTheme.shapes.medium) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(session.topicName, style = MaterialTheme.typography.bodyMedium,
                color = OnBackground, modifier = Modifier.weight(1f))
            Text("${session.duration}min", style = MaterialTheme.typography.bodySmall, color = Tertiary)
            Spacer(Modifier.width(8.dp))
            Text(session.date.take(10), style = MaterialTheme.typography.labelSmall, color = OnSurface.copy(alpha = 0.5f))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddTopicSheet(onDismiss: () -> Unit, onCreate: (String) -> Unit) {
    var name by remember { mutableStateOf("") }
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text("Nouveau sujet", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nom du sujet") },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Tertiary, unfocusedBorderColor = Outline,
                    focusedLabelColor = Tertiary, cursorColor = Tertiary))
            Spacer(Modifier.height(20.dp))
            Button(onClick = { if (name.isNotBlank()) onCreate(name) }, enabled = name.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Tertiary), shape = MaterialTheme.shapes.medium) {
                Text("Créer", color = OnPrimary)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LogSessionSheet(topic: StudyTopic, onDismiss: () -> Unit, onLog: (Int) -> Unit) {
    var duration by remember { mutableStateOf("30") }
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text("Logger une session — ${topic.name}", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(value = duration, onValueChange = { duration = it }, label = { Text("Durée (minutes)") },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Tertiary, unfocusedBorderColor = Outline,
                    focusedLabelColor = Tertiary, cursorColor = Tertiary))
            Spacer(Modifier.height(20.dp))
            Button(onClick = { onLog(duration.toIntOrNull() ?: 30) },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Tertiary), shape = MaterialTheme.shapes.medium) {
                Text("Enregistrer", color = OnPrimary)
            }
        }
    }
}
