package com.smartlife.mobile.feature.food.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.smartlife.mobile.feature.food.data.model.FoodLog
import com.smartlife.mobile.feature.food.data.model.NutritionSummary
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FoodScreen(viewModel: FoodViewModel = hiltViewModel()) {
    val logs by viewModel.logs.collectAsState()
    val nutrition by viewModel.nutrition.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var showAddSheet by remember { mutableStateOf(false) }

    val mealOrder = listOf("BREAKFAST", "LUNCH", "DINNER", "SNACK")
    val grouped = logs.groupBy { it.mealType }

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 88.dp),
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("Alimentation", style = MaterialTheme.typography.headlineSmall,
                        color = OnBackground, fontWeight = FontWeight.Bold)
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Green, strokeWidth = 2.dp)
                    } else {
                        IconButton(onClick = { viewModel.loadToday() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
                        }
                    }
                }
            }

            item { NutritionCard(nutrition = nutrition) }

            mealOrder.forEach { mealType ->
                val mealLogs = grouped[mealType] ?: emptyList()
                item {
                    MealSection(
                        mealType = mealType,
                        logs = mealLogs,
                        onDelete = { viewModel.deleteLog(it) },
                    )
                }
            }
        }

        FloatingActionButton(
            onClick = { showAddSheet = true },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            containerColor = Green,
            contentColor = OnPrimary,
        ) {
            Icon(Icons.Default.Add, contentDescription = "Ajouter repas")
        }
    }

    if (showAddSheet) {
        AddFoodSheet(
            onDismiss = { showAddSheet = false },
            onCreate = { name, qty, meal, calories ->
                viewModel.addFoodLog(name, qty, meal, calories)
                showAddSheet = false
            },
        )
    }
}

@Composable
private fun NutritionCard(nutrition: NutritionSummary) {
    val progress = if (nutrition.caloriesGoal > 0) nutrition.totalCalories.toFloat() / nutrition.caloriesGoal else 0f

    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
        color = Surface,
        shape = MaterialTheme.shapes.large,
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Calories aujourd'hui", style = MaterialTheme.typography.titleSmall,
                    color = OnBackground, fontWeight = FontWeight.SemiBold)
                Text("${nutrition.totalCalories.toInt()} / ${nutrition.caloriesGoal} kcal",
                    style = MaterialTheme.typography.bodySmall, color = Green)
            }
            Spacer(Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { progress.coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                color = if (progress > 1f) Rose else Green,
                trackColor = Outline,
            )
            Spacer(Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                MacroChip("Protéines", "${nutrition.totalProtein.toInt()}g", Primary)
                MacroChip("Glucides", "${nutrition.totalCarbs.toInt()}g", Amber)
                MacroChip("Lipides", "${nutrition.totalFat.toInt()}g", Rose)
            }
        }
    }
}

@Composable
private fun MacroChip(label: String, value: String, color: androidx.compose.ui.graphics.Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleSmall, color = color, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = OnSurface.copy(alpha = 0.7f))
    }
}

@Composable
private fun MealSection(mealType: String, logs: List<FoodLog>, onDelete: (Long) -> Unit) {
    val label = when (mealType) {
        "BREAKFAST" -> "Petit-déjeuner"; "LUNCH" -> "Déjeuner"
        "DINNER" -> "Dîner"; else -> "Collation"
    }
    val totalCal = logs.sumOf { it.calories ?: 0 }

    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(label, style = MaterialTheme.typography.titleSmall, color = OnBackground, fontWeight = FontWeight.SemiBold)
            if (totalCal > 0) Text("$totalCal kcal", style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.6f))
        }
        Spacer(Modifier.height(6.dp))
        if (logs.isEmpty()) {
            Surface(modifier = Modifier.fillMaxWidth(), color = Surface, shape = MaterialTheme.shapes.medium) {
                Text(
                    "Aucun aliment", style = MaterialTheme.typography.bodySmall,
                    color = OnSurface.copy(alpha = 0.4f),
                    modifier = Modifier.padding(12.dp),
                )
            }
        } else {
            logs.forEach { log ->
                FoodLogItem(log = log, onDelete = { onDelete(log.id) })
                Spacer(Modifier.height(4.dp))
            }
        }
    }
}

@Composable
private fun FoodLogItem(log: FoodLog, onDelete: () -> Unit) {
    Surface(modifier = Modifier.fillMaxWidth(), color = Surface, shape = MaterialTheme.shapes.medium) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(shape = MaterialTheme.shapes.small, color = Green.copy(alpha = 0.15f), modifier = Modifier.size(32.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Restaurant, contentDescription = null, tint = Green, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(log.foodName, style = MaterialTheme.typography.bodyMedium, color = OnBackground, fontWeight = FontWeight.Medium)
                val qtyLabel = "${log.quantity.orEmpty()}${log.unit}"
                if (qtyLabel.isNotBlank()) {
                    Text(qtyLabel, style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.6f))
                }
            }
            if (log.calories != null) {
                Text("${log.calories} kcal", style = MaterialTheme.typography.bodySmall, color = Green)
                Spacer(Modifier.width(4.dp))
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(28.dp)) {
                Icon(Icons.Default.DeleteOutline, contentDescription = "Supprimer",
                    tint = OnSurface.copy(alpha = 0.4f), modifier = Modifier.size(16.dp))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddFoodSheet(
    onDismiss: () -> Unit,
    onCreate: (String, String, String, Int?) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var quantity by remember { mutableStateOf("100g") }
    var calories by remember { mutableStateOf("") }
    var mealType by remember { mutableStateOf("LUNCH") }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text("Ajouter un aliment", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(16.dp))

            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Aliment") },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Green, unfocusedBorderColor = Outline,
                    focusedLabelColor = Green, cursorColor = Green))
            Spacer(Modifier.height(12.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = quantity, onValueChange = { quantity = it }, label = { Text("Quantité (ex: 100g)") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Green, unfocusedBorderColor = Outline,
                        focusedLabelColor = Green, cursorColor = Green))
                OutlinedTextField(value = calories, onValueChange = { calories = it.filter { c -> c.isDigit() } },
                    label = { Text("Calories") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Green, unfocusedBorderColor = Outline,
                        focusedLabelColor = Green, cursorColor = Green))
            }
            Spacer(Modifier.height(12.dp))

            Text("Repas", style = MaterialTheme.typography.labelMedium, color = OnSurface)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                listOf("BREAKFAST" to "Matin", "LUNCH" to "Midi", "DINNER" to "Soir", "SNACK" to "Collation")
                    .forEach { (type, label) ->
                        FilterChip(
                            selected = mealType == type, onClick = { mealType = type },
                            label = { Text(label, style = MaterialTheme.typography.labelSmall) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Green.copy(alpha = 0.2f), selectedLabelColor = Green,
                                containerColor = Background, labelColor = OnSurface),
                            border = FilterChipDefaults.filterChipBorder(enabled = true, selected = mealType == type,
                                selectedBorderColor = Green, borderColor = Outline))
                    }
            }
            Spacer(Modifier.height(20.dp))

            Button(
                onClick = { if (name.isNotBlank()) onCreate(name, quantity, mealType, calories.toIntOrNull()) },
                enabled = name.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Green),
                shape = MaterialTheme.shapes.medium,
            ) { Text("Ajouter", color = OnPrimary) }
        }
    }
}
