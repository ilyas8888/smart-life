package com.smartlife.mobile.feature.ai.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.feature.ai.data.model.AiAccessStatus
import com.smartlife.mobile.feature.ai.data.model.PromptResponse
import com.smartlife.mobile.ui.theme.*

@Composable
fun AiPromptScreen(viewModel: AiViewModel = hiltViewModel()) {
    val status by viewModel.status.collectAsState()
    val response by viewModel.response.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    var prompt by remember { mutableStateOf("") }

    val examples = listOf(
        "Crée une tâche : préparer l'examen de lundi matin",
        "Rappel : réunion d'équipe demain à 14h",
        "Note : idées pour le projet final de génie logiciel",
        "Ajoute 200g de poulet grillé au déjeuner",
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState()),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text("IA Assistant", style = MaterialTheme.typography.headlineSmall,
                    color = OnBackground, fontWeight = FontWeight.Bold)
                Text("Créez tâches, rappels, notes par la voix", style = MaterialTheme.typography.bodySmall,
                    color = OnSurface.copy(alpha = 0.6f))
            }
            IconButton(onClick = { viewModel.loadStatus() }) {
                Icon(Icons.Default.Refresh, contentDescription = "Rafraîchir", tint = OnSurface)
            }
        }

        // Status banner
        AiStatusBanner(status = status)

        Spacer(Modifier.height(16.dp))

        // Prompt input
        Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            color = Surface, shape = MaterialTheme.shapes.large) {
            Column(modifier = Modifier.padding(16.dp)) {
                OutlinedTextField(
                    value = prompt, onValueChange = { prompt = it },
                    label = { Text("Votre instruction en langage naturel") },
                    modifier = Modifier.fillMaxWidth().heightIn(min = 100.dp),
                    maxLines = 5,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Amber, unfocusedBorderColor = Outline,
                        focusedLabelColor = Amber, cursorColor = Amber),
                    leadingIcon = {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Amber)
                    },
                )
                Spacer(Modifier.height(12.dp))
                Button(
                    onClick = { if (prompt.isNotBlank()) viewModel.processPrompt(prompt) },
                    enabled = prompt.isNotBlank() && !isLoading && status.canUseAi,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Amber),
                    shape = MaterialTheme.shapes.medium,
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = OnPrimary, strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Envoyer", color = OnPrimary, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        // Error
        if (error != null) {
            Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                color = Error.copy(alpha = 0.1f), shape = MaterialTheme.shapes.medium) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = Error, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(error ?: "", style = MaterialTheme.typography.bodySmall, color = Error)
                }
            }
        }

        // Response
        response?.let { resp ->
            Spacer(Modifier.height(16.dp))
            AiResponseCard(response = resp, onClear = { viewModel.clearResponse(); prompt = "" })
        }

        // Examples (only when no response)
        if (response == null && !isLoading) {
            Spacer(Modifier.height(16.dp))
            Text("Exemples", style = MaterialTheme.typography.titleSmall,
                color = OnBackground, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(horizontal = 16.dp))
            Spacer(Modifier.height(8.dp))
            examples.forEach { example ->
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 3.dp),
                    color = Surface, shape = MaterialTheme.shapes.medium,
                    onClick = { prompt = example },
                ) {
                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Lightbulb, contentDescription = null,
                            tint = Amber.copy(alpha = 0.7f), modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(example, style = MaterialTheme.typography.bodySmall, color = OnSurface)
                    }
                }
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun AiStatusBanner(status: AiAccessStatus) {
    val (bgColor, textColor, icon) = when {
        !status.canUseAi -> Triple(Error.copy(alpha = 0.1f), Error, Icons.Default.Block)
        status.creditsUsed >= status.creditsLimit * 0.8f -> Triple(Amber.copy(alpha = 0.1f), Amber, Icons.Default.Warning)
        else -> Triple(Primary.copy(alpha = 0.1f), Primary, Icons.Default.AutoAwesome)
    }

    Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        color = bgColor, shape = MaterialTheme.shapes.medium) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = textColor, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                val statusLabel = when (status.status) {
                    "APPROVED" -> "Accès IA activé"
                    "PENDING" -> "Accès en attente d'approbation"
                    "REJECTED" -> "Accès IA refusé"
                    "SUSPENDED" -> "Accès IA suspendu"
                    else -> status.status.ifEmpty { "Chargement..." }
                }
                Text(statusLabel, style = MaterialTheme.typography.bodySmall,
                    color = textColor, fontWeight = FontWeight.Medium)
            }
            if (status.creditsLimit > 0) {
                Text("${status.creditsUsed}/${status.creditsLimit}",
                    style = MaterialTheme.typography.labelSmall, color = textColor.copy(alpha = 0.8f))
            }
        }
    }
}

@Composable
private fun AiResponseCard(response: PromptResponse, onClear: () -> Unit) {
    val totalCreated = listOfNotNull(
        response.tasks?.size, response.reminders?.size,
        response.notes?.size, response.foodLogs?.size,
    ).sum()

    Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        color = Primary.copy(alpha = 0.08f), shape = MaterialTheme.shapes.large) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("$totalCreated élément(s) créé(s)", style = MaterialTheme.typography.titleSmall,
                        color = OnBackground, fontWeight = FontWeight.SemiBold)
                }
                IconButton(onClick = onClear, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.Close, contentDescription = "Fermer",
                        tint = OnSurface.copy(alpha = 0.5f), modifier = Modifier.size(16.dp))
                }
            }

            Spacer(Modifier.height(12.dp))

            listOf(
                "Tâches" to response.tasks?.size,
                "Rappels" to response.reminders?.size,
                "Notes" to response.notes?.size,
                "Repas" to response.foodLogs?.size,
            ).filter { it.second != null && it.second!! > 0 }.forEach { (label, count) ->
                Row(modifier = Modifier.padding(vertical = 3.dp)) {
                    Text("• $label : $count créé(s)", style = MaterialTheme.typography.bodySmall, color = OnBackground)
                }
            }

            if (response.message != null) {
                Spacer(Modifier.height(8.dp))
                Text(response.message, style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.7f))
            }
        }
    }
}
