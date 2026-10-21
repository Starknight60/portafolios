@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angeldavid.neondrift.data.NeonDriftRepository
import com.angeldavid.neondrift.model.UserAccount
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    repository: NeonDriftRepository,
    onUserLoggedIn: (UserAccount) -> Unit
) {
    val scope = rememberCoroutineScope()
    var isRegisterMode by remember { mutableStateOf(false) }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var existingUsers by remember { mutableStateOf<List<String>>(emptyList()) }
    var isPostgresOnline by remember { mutableStateOf(false) }
    var showHostDialog by remember { mutableStateOf(false) }
    var postgresHostInput by remember { mutableStateOf(repository.postgresHelper.host) }

    fun refreshUsers() {
        scope.launch {
            isPostgresOnline = repository.checkPostgresConnection()
            existingUsers = repository.getAvailableUsernames()
        }
    }

    LaunchedEffect(Unit) {
        refreshUsers()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF03030C),
                        Color(0xFF0C0721),
                        Color(0xFF19062E)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .width(580.dp)
                .padding(14.dp)
                .border(1.5.dp, Color(0xFF00F0FF).copy(alpha = 0.6f), RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D).copy(alpha = 0.95f)),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Título Cyberpunk
                Text(
                    text = "NEON DRIFT",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Black,
                    fontSize = 26.sp,
                    color = Color(0xFF00F0FF),
                    letterSpacing = 2.sp
                )
                Text(
                    text = "CYBER CIRCUIT • POSTGRESQL & CLOUD RACING",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = Color(0xFFFF007F)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Estado de conexión a PostgreSQL
                Surface(
                    modifier = Modifier.clickable { showHostDialog = true },
                    color = if (isPostgresOnline) Color(0xFF00FF66).copy(alpha = 0.15f) else Color(0xFFFFD700).copy(alpha = 0.15f),
                    shape = RoundedCornerShape(20.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isPostgresOnline) Color(0xFF00FF66) else Color(0xFFFFD700)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = if (isPostgresOnline) "🟢" else "🟡", fontSize = 10.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isPostgresOnline) "POSTGRESQL 17 CONECTADO (neon_drift_db)" else "POSTGRESQL LOCAL/OFFLINE • TOCAR PARA IP",
                            color = if (isPostgresOnline) Color(0xFF00FF66) else Color(0xFFFFD700),
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Selector de pestañas: Iniciar Sesión / Registrar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF131B2E), RoundedCornerShape(12.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .background(
                                if (!isRegisterMode) Color(0xFF00F0FF) else Color.Transparent,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable {
                                isRegisterMode = false
                                errorMessage = null
                            }
                            .padding(vertical = 7.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "INICIAR SESIÓN",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = if (!isRegisterMode) Color(0xFF03030C) else Color(0xFF94A3B8)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .background(
                                if (isRegisterMode) Color(0xFFFF007F) else Color.Transparent,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable {
                                isRegisterMode = true
                                errorMessage = null
                            }
                            .padding(vertical = 7.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "NUEVO PILOTO",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = if (isRegisterMode) Color.White else Color(0xFF94A3B8)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Pilotos guardados en PostgreSQL / Local
                if (existingUsers.isNotEmpty()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "PILOTOS EN BD:",
                            fontSize = 10.5.sp,
                            color = Color(0xFF64748B),
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            items(existingUsers) { name ->
                                Surface(
                                    modifier = Modifier.clickable {
                                        username = name
                                        password = if (name == "David") "1234" else ""
                                    },
                                    color = if (username == name) Color(0xFF00F0FF).copy(alpha = 0.25f) else Color(0xFF1E293B),
                                    shape = CircleShape,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, if (username == name) Color(0xFF00F0FF) else Color(0xFF334155))
                                ) {
                                    Text(
                                        text = name,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp),
                                        fontSize = 11.sp,
                                        color = if (username == name) Color(0xFF00F0FF) else Color(0xFFCBD5E1),
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                }

                // Campos de entrada
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Nombre de Piloto / Usuario", color = Color(0xFF94A3B8), fontSize = 12.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF00F0FF),
                        unfocusedBorderColor = Color(0xFF334155)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Contraseña / PIN", color = Color(0xFF94A3B8), fontSize = 12.sp) },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFFFF007F),
                        unfocusedBorderColor = Color(0xFF334155)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = errorMessage ?: "",
                        color = Color(0xFFFF1744),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Botón Principal de Acción
                Button(
                    onClick = {
                        if (username.isBlank() || password.isBlank()) {
                            errorMessage = "Ingresa usuario y contraseña"
                            return@Button
                        }
                        scope.launch {
                            if (isRegisterMode) {
                                val user = repository.register(username, password)
                                if (user != null) {
                                    onUserLoggedIn(user)
                                } else {
                                    errorMessage = "Ese piloto ya existe en la base de datos"
                                }
                            } else {
                                val user = repository.login(username, password)
                                if (user != null) {
                                    onUserLoggedIn(user)
                                } else {
                                    errorMessage = "Credenciales incorrectas"
                                }
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isRegisterMode) Color(0xFFFF007F) else Color(0xFF00F0FF)
                    )
                ) {
                    Text(
                        text = if (isRegisterMode) "CREAR CUENTA EN POSTGRESQL" else "ENTRAR AL CIRCUITO",
                        fontWeight = FontWeight.Black,
                        fontSize = 12.sp,
                        color = if (isRegisterMode) Color.White else Color(0xFF03030C),
                        letterSpacing = 1.sp
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Botón de Acceso Rápido como David
                OutlinedButton(
                    onClick = {
                        scope.launch {
                            val user = repository.login("David", "1234")
                            if (user != null) {
                                onUserLoggedIn(user)
                            } else {
                                val newUser = repository.register("David", "1234")
                                if (newUser != null) onUserLoggedIn(newUser)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(36.dp),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00FF66).copy(alpha = 0.8f))
                ) {
                    Text(
                        text = "⚡ ENTRADA RÁPIDA: PILOTO DAVID (POSTGRESQL)",
                        color = Color(0xFF00FF66),
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }

    // Modal para Configurar IP del Servidor PostgreSQL
    if (showHostDialog) {
        AlertDialog(
            onDismissRequest = { showHostDialog = false },
            title = {
                Text(
                    text = "Configuración PostgreSQL",
                    color = Color(0xFF00F0FF),
                    fontWeight = FontWeight.Black
                )
            },
            text = {
                Column {
                    Text(
                        text = "Host / IP del servidor PostgreSQL (Puerto 5432 / DB: neon_drift_db):",
                        fontSize = 12.sp,
                        color = Color(0xFFCBD5E1)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = postgresHostInput,
                        onValueChange = { postgresHostInput = it },
                        label = { Text("IP Host (10.0.2.2 = Emulador PC)") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            repository.setPostgresHost(postgresHostInput)
                            refreshUsers()
                            showHostDialog = false
                        }
                    }
                ) {
                    Text("PROBAR & GUARDAR")
                }
            },
            dismissButton = {
                TextButton(onClick = { showHostDialog = false }) {
                    Text("CANCELAR")
                }
            }
        )
    }
}
