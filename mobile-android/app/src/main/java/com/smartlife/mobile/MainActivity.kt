package com.smartlife.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.smartlife.mobile.core.datastore.TokenDataStore
import com.smartlife.mobile.core.navigation.AppNavHost
import com.smartlife.mobile.ui.theme.SmartLifeTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var tokenDataStore: TokenDataStore

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val isLoggedIn = runBlocking {
            tokenDataStore.accessToken.firstOrNull()?.isNotBlank() == true
        }

        setContent {
            SmartLifeTheme {
                AppNavHost(isLoggedIn = isLoggedIn)
            }
        }
    }
}
