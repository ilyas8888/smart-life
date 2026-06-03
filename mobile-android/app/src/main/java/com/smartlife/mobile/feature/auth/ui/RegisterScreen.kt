package com.smartlife.mobile.feature.auth.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartlife.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    var firstName by remember { mutableStateOf("") }
    var lastName  by remember { mutableStateOf("") }
    var email     by remember { mutableStateOf("") }
    var password  by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    // Quand le backend exige un code (OTP_REQUIRED), on bascule sur l'étape de vérification.
    var otpUserId by remember { mutableStateOf<Long?>(null) }

    LaunchedEffect(uiState) {
        when (val state = uiState) {
            is AuthUiState.Success -> {
                viewModel.resetState()
                onRegisterSuccess()
            }
            is AuthUiState.OtpRequired -> otpUserId = state.userId
            else -> Unit
        }
    }

    if (otpUserId != null) {
        OtpStep(
            userId = otpUserId!!,
            email = email,
            uiState = uiState,
            onVerify = { code -> viewModel.verifyOtp(otpUserId!!, code) },
            onBack = {
                otpUserId = null
                viewModel.resetState()
                onNavigateToLogin()
            },
        )
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState()),
    ) {
        TopAppBar(
            title = { Text("Créer un compte") },
            navigationIcon = {
                IconButton(onClick = onNavigateToLogin) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour", tint = OnBackground)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Background, titleContentColor = OnBackground),
        )

        Column(
            modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            val fieldModifier = Modifier.fillMaxWidth()
            val fieldColors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor   = Primary,
                unfocusedBorderColor = Outline,
                focusedLabelColor    = Primary,
                cursorColor          = Primary,
            )

            OutlinedTextField(value = firstName, onValueChange = { firstName = it },
                label = { Text("Prénom") }, singleLine = true, modifier = fieldModifier, colors = fieldColors)
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(value = lastName, onValueChange = { lastName = it },
                label = { Text("Nom") }, singleLine = true, modifier = fieldModifier, colors = fieldColors)
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(value = email, onValueChange = { email = it },
                label = { Text("Email") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = fieldModifier, colors = fieldColors)
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text("Mot de passe") }, singleLine = true,
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null, tint = OnSurface,
                        )
                    }
                },
                modifier = fieldModifier, colors = fieldColors,
            )

            if (uiState is AuthUiState.Error) {
                Text(
                    text  = (uiState as AuthUiState.Error).message,
                    color = Error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }

            Spacer(Modifier.height(24.dp))

            Button(
                onClick  = { viewModel.register(email, password, firstName, lastName) },
                enabled  = email.isNotBlank() && password.isNotBlank() &&
                           firstName.isNotBlank() && lastName.isNotBlank() &&
                           uiState !is AuthUiState.Loading,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = Primary),
                shape    = MaterialTheme.shapes.medium,
            ) {
                if (uiState is AuthUiState.Loading) {
                    CircularProgressIndicator(color = OnPrimary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text("S'inscrire", color = OnPrimary)
                }
            }

            Spacer(Modifier.height(16.dp))

            TextButton(onClick = onNavigateToLogin) {
                Text("Déjà un compte ? Se connecter", color = Primary)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun OtpStep(
    userId: Long,
    email: String,
    uiState: AuthUiState,
    onVerify: (String) -> Unit,
    onBack: () -> Unit,
) {
    var code by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState()),
    ) {
        TopAppBar(
            title = { Text("Vérification") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour", tint = OnBackground)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Background, titleContentColor = OnBackground),
        )

        Column(
            modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                "Nous avons envoyé un code de vérification à",
                style = MaterialTheme.typography.bodyMedium,
                color = OnSurface,
            )
            Text(
                email,
                style = MaterialTheme.typography.bodyMedium,
                color = Primary,
            )
            Spacer(Modifier.height(24.dp))

            OutlinedTextField(
                value = code,
                onValueChange = { input -> code = input.filter { it.isDigit() }.take(6) },
                label = { Text("Code de vérification") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor   = Primary,
                    unfocusedBorderColor = Outline,
                    focusedLabelColor    = Primary,
                    cursorColor          = Primary,
                ),
            )

            if (uiState is AuthUiState.Error) {
                Text(
                    text  = uiState.message,
                    color = Error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }

            Spacer(Modifier.height(24.dp))

            Button(
                onClick  = { onVerify(code) },
                enabled  = code.length >= 4 && uiState !is AuthUiState.Loading,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = Primary),
                shape    = MaterialTheme.shapes.medium,
            ) {
                if (uiState is AuthUiState.Loading) {
                    CircularProgressIndicator(color = OnPrimary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text("Vérifier", color = OnPrimary)
                }
            }
        }
    }
}
