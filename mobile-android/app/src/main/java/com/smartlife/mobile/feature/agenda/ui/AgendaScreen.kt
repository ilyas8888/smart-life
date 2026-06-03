package com.smartlife.mobile.feature.agenda.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.feature.home.data.model.TimelineItem
import com.smartlife.mobile.ui.theme.*
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun AgendaScreen(viewModel: AgendaViewModel = hiltViewModel()) {
    val selectedDate by viewModel.selectedDate.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    val items = viewModel.itemsForDate(selectedDate)

    val today = LocalDate.now()
    val weekDays = (-2..4).map { today.plusDays(it.toLong()) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                "Agenda",
                style = MaterialTheme.typography.headlineSmall,
                color = OnBackground,
                fontWeight = FontWeight.Bold,
            )
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Primary, strokeWidth = 2.dp)
            } else {
                IconButton(onClick = { viewModel.loadMonth() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
                }
            }
        }

        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            items(weekDays) { date ->
                DateChip(
                    date = date,
                    isSelected = date == selectedDate,
                    isToday = date == today,
                    onClick = { viewModel.selectDate(date) },
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        Text(
            text = selectedDate.format(
                DateTimeFormatter.ofPattern("EEEE d MMMM", Locale.FRENCH)
            ).replaceFirstChar { it.uppercaseChar() },
            style = MaterialTheme.typography.titleSmall,
            color = OnSurface,
            modifier = Modifier.padding(horizontal = 16.dp),
        )

        Spacer(Modifier.height(8.dp))

        if (error != null) {
            Text(
                text = error ?: "",
                color = Error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }

        if (items.isEmpty() && !isLoading) {
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.CalendarToday,
                        contentDescription = null,
                        tint = OnSurface.copy(alpha = 0.3f),
                        modifier = Modifier.size(48.dp),
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Aucun événement ce jour",
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
                items(items, key = { it.id }) { item ->
                    TimelineItemCard(item = item)
                }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}

@Composable
private fun DateChip(
    date: LocalDate,
    isSelected: Boolean,
    isToday: Boolean,
    onClick: () -> Unit,
) {
    val dayLabel = date.format(DateTimeFormatter.ofPattern("EEE", Locale.FRENCH))
        .replaceFirstChar { it.uppercaseChar() }
    val dayNum = date.dayOfMonth.toString()

    Surface(
        modifier = Modifier
            .clip(MaterialTheme.shapes.large)
            .clickable { onClick() },
        color = when {
            isSelected -> Primary
            isToday -> Primary.copy(alpha = 0.15f)
            else -> Surface
        },
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = dayLabel,
                style = MaterialTheme.typography.labelSmall,
                color = when {
                    isSelected -> OnPrimary
                    isToday -> Primary
                    else -> OnSurface
                },
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = dayNum,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = if (isSelected || isToday) FontWeight.Bold else FontWeight.Normal,
                color = when {
                    isSelected -> OnPrimary
                    isToday -> Primary
                    else -> OnBackground
                },
            )
        }
    }
}

@Composable
private fun TimelineItemCard(item: TimelineItem) {
    val (icon, color) = typeIconAndColor(item.type)

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Surface,
        shape = MaterialTheme.shapes.large,
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (item.time != null) {
                Text(
                    text = item.time.take(5),
                    style = MaterialTheme.typography.labelSmall,
                    color = OnSurface.copy(alpha = 0.6f),
                    modifier = Modifier.width(36.dp),
                )
                Spacer(Modifier.width(4.dp))
            }

            Box(
                modifier = Modifier
                    .width(2.dp)
                    .height(36.dp)
                    .clip(RoundedCornerShape(1.dp))
                    .background(color),
            )
            Spacer(Modifier.width(12.dp))

            Surface(
                shape = MaterialTheme.shapes.small,
                color = color.copy(alpha = 0.15f),
                modifier = Modifier.size(32.dp),
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnBackground,
                    fontWeight = FontWeight.Medium,
                )
                if (item.description != null) {
                    Text(
                        text = item.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = OnSurface.copy(alpha = 0.7f),
                    )
                }
            }

            if (item.completed == true) {
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = Green,
                    modifier = Modifier.size(18.dp),
                )
            }
        }
    }
}

private fun typeIconAndColor(type: String): Pair<ImageVector, Color> = when (type) {
    "TASK"    -> Icons.Default.CheckCircle to Primary
    "REMINDER"-> Icons.Default.Alarm to Amber
    "FOOD"    -> Icons.Default.Restaurant to Green
    "WORKOUT" -> Icons.Default.FitnessCenter to Rose
    "NOTE"    -> Icons.Default.Note to Tertiary
    "DIARY"   -> Icons.Default.Book to Secondary
    else      -> Icons.Default.Event to OnSurface
}
