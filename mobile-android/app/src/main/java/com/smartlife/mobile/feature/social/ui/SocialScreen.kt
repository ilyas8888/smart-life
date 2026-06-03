package com.smartlife.mobile.feature.social.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.feature.notes.data.model.Note
import com.smartlife.mobile.feature.social.data.model.SocialComment
import com.smartlife.mobile.feature.social.data.model.SocialPost
import com.smartlife.mobile.feature.social.data.model.SocialReactionType
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SocialScreen(viewModel: SocialViewModel = hiltViewModel()) {
    val posts by viewModel.posts.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isLoadingMore by viewModel.isLoadingMore.collectAsState()
    val hasMore by viewModel.hasMore.collectAsState()
    val error by viewModel.error.collectAsState()
    val comments by viewModel.comments.collectAsState()
    val commentsLoading by viewModel.commentsLoading.collectAsState()
    val shareableNotes by viewModel.shareableNotes.collectAsState()

    var showCreateSheet by remember { mutableStateOf(false) }
    var commentsPostId by remember { mutableStateOf<Long?>(null) }

    val listState = rememberLazyListState()

    val shouldLoadMore by remember {
        derivedStateOf {
            val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            lastVisible >= posts.size - 3 && hasMore && !isLoadingMore
        }
    }
    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) viewModel.loadMore()
    }

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 88.dp),
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("Communauté", style = MaterialTheme.typography.headlineSmall,
                        color = OnBackground, fontWeight = FontWeight.Bold)
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp).padding(4.dp),
                            color = Primary, strokeWidth = 2.dp)
                    } else {
                        IconButton(onClick = { viewModel.loadPosts() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Actualiser", tint = OnSurface)
                        }
                    }
                }
            }

            if (error != null) {
                item {
                    Text(error ?: "", color = Error, style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(horizontal = 16.dp))
                }
            }

            if (posts.isEmpty() && !isLoading) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().height(250.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Group, contentDescription = null,
                                tint = OnSurface.copy(alpha = 0.3f), modifier = Modifier.size(48.dp))
                            Spacer(Modifier.height(8.dp))
                            Text("Aucune publication", style = MaterialTheme.typography.bodyMedium,
                                color = OnSurface.copy(alpha = 0.5f))
                            Spacer(Modifier.height(4.dp))
                            Text("Partagez une de vos notes !", style = MaterialTheme.typography.bodySmall,
                                color = OnSurface.copy(alpha = 0.4f))
                        }
                    }
                }
            }

            items(posts, key = { it.id }) { post ->
                PostCard(
                    post = post,
                    onReact = { type -> viewModel.react(post.id, type) },
                    onSave = { viewModel.savePost(post.id) },
                    onDelete = { viewModel.deletePost(post.id) },
                    onComments = {
                        commentsPostId = post.id
                        viewModel.loadComments(post.id)
                    },
                )
                HorizontalDivider(color = Outline.copy(alpha = 0.3f), thickness = 0.5.dp)
            }

            if (isLoadingMore) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Primary, strokeWidth = 2.dp)
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = { showCreateSheet = true; viewModel.loadShareableNotes() },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            containerColor = Primary,
            contentColor = OnPrimary,
        ) {
            Icon(Icons.Default.Share, contentDescription = "Partager")
        }
    }

    if (showCreateSheet) {
        SharePostSheet(
            notes = shareableNotes,
            onDismiss = { showCreateSheet = false },
            onShare = { note, caption ->
                viewModel.createPostFromNote(note.id, note.title, caption)
                showCreateSheet = false
            },
        )
    }

    if (commentsPostId != null) {
        CommentsSheet(
            comments = comments,
            isLoading = commentsLoading,
            onDismiss = {
                commentsPostId = null
                viewModel.clearComments()
            },
            onSend = { content -> viewModel.createComment(commentsPostId!!, content) },
        )
    }
}

private fun resourceLabel(type: String): String = when (type) {
    "NOTE" -> "Note"
    "FOOD_LOG" -> "Repas"
    "WORKOUT_PLAN" -> "Programme"
    "SLEEP_LOG" -> "Sommeil"
    "STUDY_SESSION" -> "Étude"
    "JOURNAL" -> "Journal"
    else -> type
}

private fun parseColor(hex: String): Color = runCatching {
    Color(android.graphics.Color.parseColor(hex))
}.getOrDefault(Primary)

@Composable
private fun PostCard(
    post: SocialPost,
    onReact: (String) -> Unit,
    onSave: () -> Unit,
    onDelete: () -> Unit,
    onComments: () -> Unit,
) {
    val avatarColor = parseColor(post.author.avatarColor)

    Column(modifier = Modifier.fillMaxWidth().background(Background).padding(horizontal = 16.dp, vertical = 12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
                modifier = Modifier.size(40.dp).clip(CircleShape),
                color = avatarColor.copy(alpha = 0.2f),
                shape = CircleShape,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(post.author.initials.ifEmpty { "?" }, style = MaterialTheme.typography.labelLarge,
                        color = avatarColor, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(post.author.name.ifEmpty { "Anonyme" }, style = MaterialTheme.typography.bodyMedium,
                    color = OnBackground, fontWeight = FontWeight.SemiBold)
                Text(post.timeAgo.ifEmpty { post.createdAt.take(10) }, style = MaterialTheme.typography.labelSmall,
                    color = OnSurface.copy(alpha = 0.5f))
            }
            Surface(color = Secondary.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                Text(resourceLabel(post.resourceType), style = MaterialTheme.typography.labelSmall,
                    color = Secondary, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.MoreVert, contentDescription = "Options",
                    tint = OnSurface.copy(alpha = 0.4f), modifier = Modifier.size(18.dp))
            }
        }

        Spacer(Modifier.height(10.dp))
        if (!post.title.isNullOrBlank()) {
            Text(post.title, style = MaterialTheme.typography.titleSmall, color = OnBackground, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(4.dp))
        }
        if (!post.caption.isNullOrBlank()) {
            Text(post.caption, style = MaterialTheme.typography.bodyMedium, color = OnSurface)
        }
        Spacer(Modifier.height(10.dp))

        // Reaction bar
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            SocialReactionType.ALL.forEach { reaction ->
                val isActive = post.myReaction == reaction.key
                Surface(
                    color = if (isActive) Primary.copy(alpha = 0.18f) else Color.Transparent,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.padding(end = 2.dp),
                    onClick = { onReact(reaction.key) },
                ) {
                    Text(reaction.emoji, style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp))
                }
            }

            if (post.reactionsCount > 0) {
                Text("${post.reactionsCount}", style = MaterialTheme.typography.labelSmall,
                    color = OnSurface.copy(alpha = 0.6f), modifier = Modifier.padding(start = 4.dp))
            }

            Spacer(Modifier.weight(1f))

            TextButton(onClick = onComments, contentPadding = PaddingValues(horizontal = 8.dp)) {
                Icon(Icons.Default.Comment, contentDescription = "Commentaires",
                    tint = OnSurface.copy(alpha = 0.6f), modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(4.dp))
                Text("${post.commentsCount}", style = MaterialTheme.typography.labelSmall,
                    color = OnSurface.copy(alpha = 0.6f))
            }

            IconButton(onClick = onSave, modifier = Modifier.size(32.dp)) {
                Icon(
                    if (post.isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                    contentDescription = "Sauvegarder",
                    tint = if (post.isSaved) Primary else OnSurface.copy(alpha = 0.5f),
                    modifier = Modifier.size(18.dp),
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SharePostSheet(notes: List<Note>, onDismiss: () -> Unit, onShare: (Note, String?) -> Unit) {
    var selectedNote by remember { mutableStateOf<Note?>(null) }
    var caption by remember { mutableStateOf("") }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.fillMaxHeight(0.7f).padding(horizontal = 20.dp).padding(bottom = 24.dp)) {
            Text("Partager une note", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold)
            Text("Choisissez une note à partager dans la communauté",
                style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.6f))
            Spacer(Modifier.height(12.dp))

            if (notes.isEmpty()) {
                Box(modifier = Modifier.fillMaxWidth().height(120.dp), contentAlignment = Alignment.Center) {
                    Text("Créez d'abord une note pour la partager",
                        style = MaterialTheme.typography.bodySmall, color = OnSurface.copy(alpha = 0.5f))
                }
            } else {
                LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(notes, key = { it.id }) { note ->
                        val selected = selectedNote?.id == note.id
                        Surface(
                            color = if (selected) Primary.copy(alpha = 0.15f) else Background,
                            shape = MaterialTheme.shapes.medium,
                            onClick = { selectedNote = note },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    if (selected) Icons.Default.CheckCircle else Icons.Default.Description,
                                    contentDescription = null,
                                    tint = if (selected) Primary else OnSurface.copy(alpha = 0.5f),
                                    modifier = Modifier.size(20.dp),
                                )
                                Spacer(Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(note.title.ifEmpty { "(sans titre)" }, style = MaterialTheme.typography.bodyMedium,
                                        color = OnBackground, fontWeight = FontWeight.Medium, maxLines = 1)
                                    if (note.content.isNotBlank()) {
                                        Text(note.content, style = MaterialTheme.typography.bodySmall,
                                            color = OnSurface.copy(alpha = 0.6f), maxLines = 1)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = caption, onValueChange = { caption = it },
                label = { Text("Légende (optionnel)") },
                modifier = Modifier.fillMaxWidth(), maxLines = 3,
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary,
                    unfocusedBorderColor = Outline, focusedLabelColor = Primary, cursorColor = Primary),
            )
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = { selectedNote?.let { onShare(it, caption.ifBlank { null }) } },
                enabled = selectedNote != null,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary),
                shape = MaterialTheme.shapes.medium,
            ) {
                Text("Partager", color = OnPrimary)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CommentsSheet(
    comments: List<SocialComment>,
    isLoading: Boolean,
    onDismiss: () -> Unit,
    onSend: (String) -> Unit,
) {
    var commentText by remember { mutableStateOf("") }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Surface) {
        Column(modifier = Modifier.fillMaxHeight(0.7f).padding(horizontal = 16.dp)) {
            Text("Commentaires", style = MaterialTheme.typography.titleMedium,
                color = OnBackground, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 12.dp))

            if (isLoading) {
                Box(modifier = Modifier.fillMaxWidth().height(80.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Primary, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                }
            } else if (comments.isEmpty()) {
                Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                    Text("Aucun commentaire", style = MaterialTheme.typography.bodySmall,
                        color = OnSurface.copy(alpha = 0.5f))
                }
            } else {
                LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(comments, key = { it.id }) { comment ->
                        Surface(color = Background, shape = MaterialTheme.shapes.medium) {
                            Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text(comment.authorName.ifEmpty { "Anonyme" }, style = MaterialTheme.typography.labelMedium,
                                        color = Primary, fontWeight = FontWeight.SemiBold)
                                    Text(comment.timeAgo.ifEmpty { comment.createdAt.take(10) },
                                        style = MaterialTheme.typography.labelSmall, color = OnSurface.copy(alpha = 0.5f))
                                }
                                Spacer(Modifier.height(4.dp))
                                Text(comment.content, style = MaterialTheme.typography.bodySmall, color = OnBackground)
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = commentText, onValueChange = { commentText = it },
                    label = { Text("Ajouter un commentaire") },
                    modifier = Modifier.weight(1f), singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Primary,
                        unfocusedBorderColor = Outline, focusedLabelColor = Primary, cursorColor = Primary),
                )
                IconButton(
                    onClick = { if (commentText.isNotBlank()) { onSend(commentText); commentText = "" } },
                    enabled = commentText.isNotBlank(),
                ) {
                    Icon(Icons.Default.Send, contentDescription = "Envoyer",
                        tint = if (commentText.isNotBlank()) Primary else OnSurface.copy(alpha = 0.3f))
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
