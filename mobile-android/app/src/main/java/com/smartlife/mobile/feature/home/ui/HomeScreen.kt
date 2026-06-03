package com.smartlife.mobile.feature.home.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.feature.home.data.model.DayScore
import com.smartlife.mobile.feature.home.data.model.ScoreModule
import com.smartlife.mobile.ui.theme.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun HomeScreen(viewModel: HomeViewModel = hiltViewModel()) {
    val dayScore  by viewModel.dayScore.collectAsState()
    val firstName by viewModel.firstName.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    val today = LocalDate.now().format(
        DateTimeFormatter.ofPattern("EEEE d MMMM", Locale.FRENCH)
    ).replaceFirstChar { it.uppercaseChar() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text(
                    text  = "Bonjour, $firstName",
                    style = MaterialTheme.typography.headlineSmall,
                    color = OnBackground,
                    fontWeight = FontWeight.Bold,
                )
                Text(text = today, style = MaterialTheme.typography.bodyMedium, color = OnSurface)
            }
            IconButton(onClick = { viewModel.loadData() }) {
                Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
            }
        }

        Spacer(Modifier.height(20.dp))

        // Smart Day Score card
        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth().height(180.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Primary)
            }
        } else {
            SmartDayScoreCard(dayScore = dayScore ?: DayScore())
        }

        Spacer(Modifier.height(16.dp))

        // Module breakdown cards
        dayScore?.let { score ->
            Text("Détail du jour", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))
            val mods = moduleDisplayOrder.mapNotNull { meta ->
                score.modules[meta.key]?.let { meta to it }
            }
            mods.chunked(2).forEach { rowMods ->
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    rowMods.forEach { (meta, module) ->
                        ModuleCard(
                            modifier = Modifier.weight(1f),
                            label = meta.label,
                            module = module,
                            icon = meta.icon,
                            color = meta.color,
                        )
                    }
                    if (rowMods.size == 1) Spacer(Modifier.weight(1f))
                }
                Spacer(Modifier.height(10.dp))
            }

            if (score.synergies.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                score.synergies.forEach { syn ->
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Tertiary.copy(alpha = 0.12f),
                        shape = MaterialTheme.shapes.medium,
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Tertiary, modifier = Modifier.size(18.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(syn.name, style = MaterialTheme.typography.labelLarge, color = OnBackground, fontWeight = FontWeight.SemiBold)
                                Text(syn.description, style = MaterialTheme.typography.labelSmall, color = OnSurface)
                            }
                            Text("+${syn.bonus}", style = MaterialTheme.typography.titleSmall, color = Tertiary, fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // Quick actions
        Text("Actions rapides", style = MaterialTheme.typography.titleMedium,
            color = OnBackground, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickActionButton(Modifier.weight(1f), "Repas",  Icons.Default.Restaurant, Green)
            QuickActionButton(Modifier.weight(1f), "Tâche",  Icons.Default.CheckCircle, Primary)
            QuickActionButton(Modifier.weight(1f), "Sport",  Icons.Default.FitnessCenter, Rose)
            QuickActionButton(Modifier.weight(1f), "Note",   Icons.Default.Note, Amber)
        }

        Spacer(Modifier.height(80.dp))
    }
}

private data class ModuleMeta(val key: String, val label: String, val icon: ImageVector, val color: Color)

private val moduleDisplayOrder = listOf(
    ModuleMeta("sleep",        "Sommeil",      Icons.Default.Bedtime,        Secondary),
    ModuleMeta("nutrition",    "Nutrition",    Icons.Default.Restaurant,     Green),
    ModuleMeta("productivity", "Productivité", Icons.Default.CheckCircle,    Primary),
    ModuleMeta("workout",      "Sport",        Icons.Default.FitnessCenter,  Rose),
    ModuleMeta("study",        "Étude",        Icons.Default.School,         Tertiary),
    ModuleMeta("mood",         "Humeur",       Icons.Default.Mood,           Amber),
)

@Composable
private fun SmartDayScoreCard(dayScore: DayScore) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color    = Surface,
        shape    = MaterialTheme.shapes.large,
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Score circle
                Box(contentAlignment = Alignment.Center, modifier = Modifier.size(96.dp)) {
                    androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
                        val stroke = Stroke(width = 9.dp.toPx(), cap = StrokeCap.Round)
                        drawArc(color = Outline, startAngle = -90f, sweepAngle = 360f, useCenter = false, style = stroke)
                        drawArc(
                            color = Primary, startAngle = -90f,
                            sweepAngle = 360f * (dayScore.total / 100f),
                            useCenter = false, style = stroke,
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("${dayScore.total}", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = OnBackground)
                        Text("/100", fontSize = 11.sp, color = OnSurface)
                    }
                }

                Spacer(Modifier.width(20.dp))

                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        dayScore.bandLabel.ifBlank { "Smart Day Score" },
                        style = MaterialTheme.typography.titleMedium,
                        color = OnBackground, fontWeight = FontWeight.Bold,
                    )
                    if (dayScore.delta != 0) {
                        val up = dayScore.delta > 0
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                            Icon(
                                if (up) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                                contentDescription = null,
                                tint = if (up) Green else Rose,
                                modifier = Modifier.size(16.dp),
                            )
                            Text(
                                "${if (up) "+" else ""}${dayScore.delta} vs hier",
                                style = MaterialTheme.typography.labelMedium,
                                color = if (up) Green else Rose,
                            )
                        }
                    }
                }
            }

            if (dayScore.insight.isNotBlank()) {
                Spacer(Modifier.height(14.dp))
                Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.Lightbulb, contentDescription = null, tint = Amber, modifier = Modifier.size(16.dp))
                    Text(dayScore.insight, style = MaterialTheme.typography.bodySmall, color = OnSurface)
                }
            }
        }
    }
}

@Composable
private fun ModuleCard(
    modifier: Modifier,
    label: String,
    module: ScoreModule,
    icon: ImageVector,
    color: Color,
) {
    val tint = if (module.present) color else OnSurface.copy(alpha = 0.35f)
    Surface(modifier = modifier, color = Surface, shape = MaterialTheme.shapes.large) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(label, style = MaterialTheme.typography.bodySmall, color = OnSurface)
                Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(16.dp))
            }
            Spacer(Modifier.height(6.dp))
            Text(
                if (module.present) "${module.score}" else "—",
                style = MaterialTheme.typography.titleMedium, color = OnBackground, fontWeight = FontWeight.Bold,
            )
            Text(module.label, style = MaterialTheme.typography.labelSmall, color = OnSurface.copy(alpha = 0.7f), maxLines = 1)
            Spacer(Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { (module.score / 100f).coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth().height(4.dp).clip(MaterialTheme.shapes.small),
                color    = tint,
                trackColor = Outline,
            )
        }
    }
}

@Composable
private fun QuickActionButton(modifier: Modifier, label: String, icon: ImageVector, color: Color) {
    Surface(modifier = modifier, color = color.copy(alpha = 0.12f), shape = MaterialTheme.shapes.large) {
        Column(
            modifier = Modifier.padding(vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(22.dp))
            Spacer(Modifier.height(4.dp))
            Text(label, style = MaterialTheme.typography.labelSmall, color = color)
        }
    }
}
