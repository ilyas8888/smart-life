package com.smartlife.mobile.feature.tasks.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.feature.tasks.data.model.Task
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(viewModel: TasksViewModel = hiltViewModel()) {
    val tasks by viewModel.tasks.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    var showAddSheet by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf(0) } // 0=Toutes 1=À faire 2=Terminées

    val filtered = when (selectedFilter) {
        1 -> tasks.filter { !it.completed }
        2 -> tasks.filter { it.completed }
        else -> tasks
    }

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    "Tâches",
                    style = MaterialTheme.typography.headlineSmall,
                    color = OnBackground,
                    fontWeight = FontWeight.Bold,
                )
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Primary,
                        strokeWidth = 2.dp,
                    )
                } else {
                    IconButton(onClick = { viewModel.loadTasks() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
                    }
                }
            }

            // Filter chips
            Row(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf("Toutes", "À faire", "Terminées").forEachIndexed { i, label ->
                    FilterChip(
                        selected = selectedFilter == i,
                        onClick = { selectedFilter = i },
                        label = { Text(label, style = MaterialTheme.typography.labelMedium) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Primary.copy(alpha = 0.2f),
                            selectedLabelColor = Primary,
                            containerColor = Surface,
                            labelColor = OnSurface,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = selectedFilter == i,
                            selectedBorderColor = Primary,
                            borderColor = Outline,
                        ),
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            if (error != null) {
                Text(
                    text = error ?: "",
                    color = Error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(horizontal = 16.dp),
                )
            }

            if (filtered.isEmpty() && !isLoading) {
                Box(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = OnSurface.copy(alpha = 0.3f),
                            modifier = Modifier.size(48.dp),
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Aucune tâche",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurface.copy(alpha = 0.5f),
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(filtered, key = { it.id }) { task ->
                        TaskCard(
                            task = task,
                            onToggle = { viewModel.toggleComplete(task) },
                            onDelete = { viewModel.deleteTask(task.id) },
                        )
                    }
                    item { Spacer(Modifier.height(80.dp)) }
                }
            }
        }

        // FAB
        FloatingActionButton(
            onClick = { showAddSheet = true },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            containerColor = Primary,
            contentColor = OnPrimary,
        ) {
            Icon(Icons.Default.Add, contentDescription = "Ajouter tâche")
        }
    }

    if (showAddSheet) {
        AddTaskSheet(
            onDismiss = { showAddSheet = false },
            onCreate = { title, category, priority ->
                viewModel.createTask(title, category, priority)
                showAddSheet = false
            },
        )
    }
}

@Composable
private fun TaskCard(task: Task, onToggle: () -> Unit, onDelete: () -> Unit) {
    val priorityColor = when (task.priority) {
        "HIGH" -> Rose
        "LOW" -> Green
        else -> Amber
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Surface,
        shape = MaterialTheme.shapes.large,
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Priority bar
            Box(
                modifier = Modifier
                    .width(3.dp)
                    .height(40.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(priorityColor),
            )
            Spacer(Modifier.width(12.dp))

            // Checkbox
            Checkbox(
                checked = task.completed,
                onCheckedChange = { onToggle() },
                colors = CheckboxDefaults.colors(
                    checkedColor = Primary,
                    uncheckedColor = Outline,
                    checkmarkColor = OnPrimary,
                ),
            )
            Spacer(Modifier.width(8.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (task.completed) OnSurface.copy(alpha = 0.5f) else OnBackground,
                    fontWeight = FontWeight.Medium,
                    textDecoration = if (task.completed) TextDecoration.LineThrough else TextDecoration.None,
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(top = 4.dp),
                ) {
                    CategoryChip(task.category)
                    if (task.dueDate != null) {
                        Text(
                            text = task.dueDate.take(10),
                            style = MaterialTheme.typography.labelSmall,
                            color = OnSurface.copy(alpha = 0.6f),
                        )
                    }
                }
            }

            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(
                    Icons.Default.DeleteOutline,
                    contentDescription = "Supprimer",
                    tint = OnSurface.copy(alpha = 0.4f),
                    modifier = Modifier.size(18.dp),
                )
            }
        }
    }
}

@Composable
private fun CategoryChip(category: String) {
    val (label, color) = when (category) {
        "WORK" -> "Travail" to Primary
        "HEALTH" -> "Santé" to Green
        "HOME" -> "Maison" to Amber
        else -> "Personnel" to Secondary
    }
    Surface(
        color = color.copy(alpha = 0.15f),
        shape = RoundedCornerShape(4.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = color,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddTaskSheet(
    onDismiss: () -> Unit,
    onCreate: (String, String, String) -> Unit,
) {
    var title by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("PERSONAL") }
    var priority by remember { mutableStateOf("MEDIUM") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Surface,
    ) {
        Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text(
                "Nouvelle tâche",
                style = MaterialTheme.typography.titleMedium,
                color = OnBackground,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height(16.dp))

            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Titre de la tâche") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Primary,
                    unfocusedBorderColor = Outline,
                    focusedLabelColor = Primary,
                    cursorColor = Primary,
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(
                    onDone = { if (title.isNotBlank()) onCreate(title, category, priority) }
                ),
            )

            Spacer(Modifier.height(12.dp))

            Text("Catégorie", style = MaterialTheme.typography.labelMedium, color = OnSurface)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("PERSONAL", "WORK", "HEALTH", "HOME").forEach { cat ->
                    val label = when (cat) {
                        "WORK" -> "Travail"; "HEALTH" -> "Santé"; "HOME" -> "Maison"; else -> "Personnel"
                    }
                    FilterChip(
                        selected = category == cat,
                        onClick = { category = cat },
                        label = { Text(label, style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Primary.copy(alpha = 0.2f),
                            selectedLabelColor = Primary,
                            containerColor = Background,
                            labelColor = OnSurface,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = category == cat,
                            selectedBorderColor = Primary,
                            borderColor = Outline,
                        ),
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            Text("Priorité", style = MaterialTheme.typography.labelMedium, color = OnSurface)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("LOW" to Green, "MEDIUM" to Amber, "HIGH" to Rose).forEach { (p, color) ->
                    val label = when (p) { "LOW" -> "Faible"; "HIGH" -> "Haute"; else -> "Moyenne" }
                    FilterChip(
                        selected = priority == p,
                        onClick = { priority = p },
                        label = { Text(label, style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = color.copy(alpha = 0.2f),
                            selectedLabelColor = color,
                            containerColor = Background,
                            labelColor = OnSurface,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = priority == p,
                            selectedBorderColor = color,
                            borderColor = Outline,
                        ),
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            Button(
                onClick = { if (title.isNotBlank()) onCreate(title, category, priority) },
                enabled = title.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary),
                shape = MaterialTheme.shapes.medium,
            ) {
                Text("Créer la tâche", color = OnPrimary)
            }
        }
    }
}
