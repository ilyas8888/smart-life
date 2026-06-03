package com.smartlife.mobile.feature.sleep.ui

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
import com.smartlife.mobile.feature.sleep.data.model.SleepLog
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SleepScreen(viewModel: SleepViewModel = hiltViewModel()) {
    val logs by viewModel.logs.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var showAddSheet by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 88.dp)) {
            item {
                Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Sommeil", style = MaterialTheme.typography.headlineSmall,
                        color = OnBackground, fontWeight = FontWeight.Bold)
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Secondary, strokeWidth = 2.dp)
                    } else {
                        IconButton(onClick = { viewModel.loadLogs() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
                        }
                    }
                }
            }

            item {
                val avgDur = viewModel.avgDuration
                val avgQual = viewModel.avgQuality
                Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    color = Surface, shape = MaterialTheme.shapes.large) {
                    Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
                        SleepStat("Durée moy.", if (avgDur > 0) "%.1fh".format(avgDur) else "—", Secondary)
                        SleepStat("Qualité moy.", if (avgQual > 0) "%.1f/5".format(avgQual) else "—", Primary)
                        SleepStat("Entrées", "${logs.size}", Tertiary)
                    }
                }
            }

            if (logs.isEmpty() && !isLoading) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Bedtime, contentDescription = null,
                                tint = OnSurface.copy(alpha = 0.3f), modifier = Modifier.size(48.dp))
                            Spacer(Modifier.height(8.dp))
                            Text("Aucune entrée de sommeil", style = MaterialTheme.typography.bodyMedium,
                                color = OnSurface.copy(alpha = 0.5f))
                        }
                    }
                }
            } else {
                item {
                    Text("Historique", style = MaterialTheme.typography.titleSmall,
                        color = OnBackground, fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                }
                items(logs, key = { it.id }) { log ->
                    SleepCard(log = log, onDelete = { viewModel.deleteLog(log.id) })
                    Spacer(Modifier.height(8.dp))
                }
            }
        }

        FloatingActionButton(
            onClick = { showAddSheet = true },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            containerColor = Secondary,
            contentColor = OnPrimary,
        ) {
            Icon(Icons.Default.Add, contentDescription = "Ajouter nuit")
        }
    }

    if (showAddSheet) {
        AddSleepSheet(
            onDismiss = { showAddSheet = false },
            onCreate = { bed, wake, quality ->
                viewModel.createLog(bed, wake, quality)
                showAddSheet = false
            },
        )
    }
}

// Extrait "HH:mm" d'un datetime ISO (ex: 2026-05-31T22:30:00 → 22:30) ou d'une heure brute.
private fun hhmm(value: String): String =
    (if (value.contains('T')) value.substringAfter('T') else value).take(5)

@Composable
private fun SleepStat(label: String, value: String, color: androidx.compose.ui.graphics.Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleMedium, color = color, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = OnSurface.copy(alpha = 0.7f))
    }
}

@Composable
private fun SleepCard(log: SleepLog, onDelete: () -> Unit) {
    val qualityColor = when {
        log.quality >= 4 -> Green; log.quality == 3 -> Amber; else -> Rose
    }
    Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), color = Surface, shape = MaterialTheme.shapes.large) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(shape = MaterialTheme.shapes.medium, color = Secondary.copy(alpha = 0.15f), modifier = Modifier.size(40.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Bedtime, contentDescription = null, tint = Secondary, modifier = Modifier.size(20.dp))
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(log.date.take(10), style = MaterialTheme.typography.bodyMedium, color = OnBackground, fontWeight = FontWeight.Medium)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("${hhmm(log.bedTime)} → ${hhmm(log.wakeTime)}", style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.7f))
                    Text("%.1fh".format(log.duration), style = MaterialTheme.typography.bodySmall, color = Secondary)
                }
            }
            Surface(color = qualityColor.copy(alpha = 0.15f), shape = MaterialTheme.shapes.small) {
                Text("★ ${log.quality}/5", style = MaterialTheme.typography.labelSmall, color = qualityColor,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp))
            }
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
private fun AddSleepSheet(onDismiss: () -> Unit, onCreate: (String, String, Int) -> Unit) {
    var bedTime by remember { mutableStateOf("22:30") }
    var wakeTime by remember { mutableStateOf("07:00") }
    var quality by remember { mutableStateOf(3) }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text("Enregistrer une nuit", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = bedTime, onValueChange = { bedTime = it }, label = { Text("Coucher (HH:mm)") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Secondary, unfocusedBorderColor = Outline,
                        focusedLabelColor = Secondary, cursorColor = Secondary))
                OutlinedTextField(value = wakeTime, onValueChange = { wakeTime = it }, label = { Text("Réveil (HH:mm)") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Secondary, unfocusedBorderColor = Outline,
                        focusedLabelColor = Secondary, cursorColor = Secondary))
            }
            Spacer(Modifier.height(12.dp))

            Text("Qualité : $quality/5", style = MaterialTheme.typography.labelMedium, color = OnSurface)
            Slider(
                value = quality.toFloat(),
                onValueChange = { quality = it.toInt() },
                valueRange = 1f..5f,
                steps = 3,
                colors = SliderDefaults.colors(thumbColor = Secondary, activeTrackColor = Secondary),
            )
            Spacer(Modifier.height(16.dp))

            Button(
                onClick = {
                    // Le réveil est aujourd'hui ; si on se couche plus tard qu'on se lève,
                    // le coucher est la veille (sinon le backend rejette wake<bed → 400).
                    val wakeDate = java.time.LocalDate.now()
                    val bedHour = bedTime.substringBefore(':').toIntOrNull() ?: 0
                    val wakeHour = wakeTime.substringBefore(':').toIntOrNull() ?: 0
                    val bedDate = if (bedHour >= wakeHour) wakeDate.minusDays(1) else wakeDate
                    onCreate("${bedDate}T${bedTime}:00", "${wakeDate}T${wakeTime}:00", quality)
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Secondary),
                shape = MaterialTheme.shapes.medium,
            ) { Text("Enregistrer", color = OnPrimary) }
        }
    }
}
