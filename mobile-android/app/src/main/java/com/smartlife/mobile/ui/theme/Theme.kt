package com.smartlife.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColors = darkColorScheme(
    primary          = Primary,
    onPrimary        = OnPrimary,
    secondary        = Secondary,
    onSecondary      = OnSecondary,
    tertiary         = Tertiary,
    onTertiary       = OnTertiary,
    background       = Background,
    onBackground     = OnBackground,
    surface          = Surface,
    onSurface        = OnSurface,
    surfaceVariant   = SurfaceVariant,
    onSurfaceVariant = OnSurface,
    outline          = Outline,
    outlineVariant   = OutlineVariant,
    error            = Error,
    onError          = OnError,
)

@Composable
fun SmartLifeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColors,
        typography = Typography,
        content = content,
    )
}
