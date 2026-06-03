package com.smartlife.mobile.feature.profile.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.feature.profile.data.model.Badge
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val profile by viewModel.profile.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val saveSuccess by viewModel.saveSuccess.collectAsState()
    var showEditSheet by remember { mutableStateOf(false) }

    LaunchedEffect(saveSuccess) {
        if (saveSuccess) viewModel.clearSuccess()
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Background),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text("Profil", style = MaterialTheme.typography.headlineSmall,
                    color = OnBackground, fontWeight = FontWeight.Bold)
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Primary, strokeWidth = 2.dp)
                }
            }
        }

        item {
            Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                color = Surface, shape = MaterialTheme.shapes.large) {
                Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    // Avatar
                    Surface(
                        modifier = Modifier.size(80.dp).clip(CircleShape),
                        color = Primary.copy(alpha = 0.2f),
                        shape = CircleShape,
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            if (profile.hasAvatar) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Primary, modifier = Modifier.size(40.dp))
                            } else {
                                Text(
                                    text = profile.initials.ifEmpty { "?" },
                                    style = MaterialTheme.typography.headlineMedium,
                                    color = Primary,
                                    fontWeight = FontWeight.Bold,
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(profile.displayName.ifEmpty { "—" },
                        style = MaterialTheme.typography.titleLarge, color = OnBackground, fontWeight = FontWeight.Bold)
                    Text(profile.email, style = MaterialTheme.typography.bodyMedium, color = OnSurface.copy(alpha = 0.7f))
                    profile.bio?.let { bio ->
                        Spacer(Modifier.height(8.dp))
                        Text(bio, style = MaterialTheme.typography.bodySmall,
                            color = OnSurface.copy(alpha = 0.6f))
                    }
                    Spacer(Modifier.height(16.dp))
                    OutlinedButton(
                        onClick = { showEditSheet = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Primary),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Primary),
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Modifier le profil")
                    }
                }
            }
        }

        val earnedBadges = profile.badges.filter { it.earned }
        if (earnedBadges.isNotEmpty()) {
            item {
                Text("Badges", style = MaterialTheme.typography.titleSmall,
                    color = OnBackground, fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp))
            }
            items(earnedBadges.chunked(2)) { row ->
                Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    row.forEach { badge ->
                        BadgeCard(badge = badge, modifier = Modifier.weight(1f))
                    }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
                Spacer(Modifier.height(8.dp))
            }
        }

        item {
            Spacer(Modifier.height(16.dp))
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(50.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Error),
                border = androidx.compose.foundation.BorderStroke(1.dp, Error),
                shape = MaterialTheme.shapes.medium,
            ) {
                Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Se déconnecter")
            }
        }
    }

    if (showEditSheet) {
        EditProfileSheet(
            firstName = profile.firstName ?: "",
            lastName = profile.lastName ?: "",
            bio = profile.bio ?: "",
            onDismiss = { showEditSheet = false },
            onSave = { f, l, b ->
                viewModel.updateProfile(f, l, b.ifBlank { null })
                showEditSheet = false
            },
        )
    }
}

@Composable
private fun BadgeCard(badge: Badge, modifier: Modifier) {
    Surface(modifier = modifier, color = Surface, shape = MaterialTheme.shapes.large) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(shape = MaterialTheme.shapes.small, color = Amber.copy(alpha = 0.2f), modifier = Modifier.size(32.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Text(badge.emoji ?: "⭐", style = MaterialTheme.typography.bodyMedium)
                }
            }
            Spacer(Modifier.width(8.dp))
            Column {
                Text(badge.name, style = MaterialTheme.typography.bodySmall, color = OnBackground, fontWeight = FontWeight.Medium)
                Text(badge.earnedAt?.take(10) ?: "", style = MaterialTheme.typography.labelSmall, color = OnSurface.copy(alpha = 0.5f))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EditProfileSheet(
    firstName: String, lastName: String, bio: String,
    onDismiss: () -> Unit, onSave: (String, String, String) -> Unit,
) {
    var fName by remember { mutableStateOf(firstName) }
    var lName by remember { mutableStateOf(lastName) }
    var bioText by remember { mutableStateOf(bio) }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text("Modifier le profil", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = fName, onValueChange = { fName = it }, label = { Text("Prénom") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = Outline,
                        focusedLabelColor = Primary, cursorColor = Primary))
                OutlinedTextField(value = lName, onValueChange = { lName = it }, label = { Text("Nom") },
                    singleLine = true, modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = Outline,
                        focusedLabelColor = Primary, cursorColor = Primary))
            }
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(value = bioText, onValueChange = { bioText = it }, label = { Text("Bio (optionnel)") },
                modifier = Modifier.fillMaxWidth().heightIn(min = 80.dp), maxLines = 4,
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary, unfocusedBorderColor = Outline,
                    focusedLabelColor = Primary, cursorColor = Primary))
            Spacer(Modifier.height(20.dp))
            Button(onClick = { if (fName.isNotBlank()) onSave(fName, lName, bioText) },
                enabled = fName.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary), shape = MaterialTheme.shapes.medium) {
                Text("Sauvegarder", color = OnPrimary)
            }
        }
    }
}
