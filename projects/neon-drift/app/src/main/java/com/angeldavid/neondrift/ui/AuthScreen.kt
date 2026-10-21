@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
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
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var infoMessage by remember { mutableStateOf<String?>(null) }
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
                .fillMaxWidth(0.92f)
                .fillMaxHeight(0.92f)
                .border(1.5.dp, Color(0xFF00F0FF).copy(alpha = 0.6f), RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D).copy(alpha = 0.96f)),
            shape = RoundedCornerShape(20.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp),
                horizontalArrangement = Arrangement.spacedBy(18.dp)
            ) {

                // COLUMNA IZQUIERDA: LOGO, BASE DE DATOS Y PILOTOS GUARDADOS
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight(),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "NEON DRIFT",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Black,
                            fontSize = 28.sp,
                            color = Color(0xFF00F0FF),
                            letterSpacing = 2.sp
                        )
                        Text(
                            text = "CYBER CIRCUIT • POSTGRESQL RACING",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = Color(0xFFFF007F)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Estado de conexión PostgreSQL
                        Surface(
                            modifier = Modifier.clickable { showHostDialog = true },
                            color = if (isPostgresOnline) Color(0xFF00FF66).copy(alpha = 0.15f) else Color(0xFFFFD700).copy(alpha = 0.15f),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (isPostgresOnline) Color(0xFF00FF66) else Color(0xFFFFD700)
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = if (isPostgresOnline) "🟢" else "🟡", fontSize = 11.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text(
                                        text = if (isPostgresOnline) "POSTGRESQL CONECTADO" else "MODO LOCAL OFFLINE",
                                        color = if (isPostgresOnline) Color(0xFF00FF66) else Color(0xFFFFD700),
                                        fontSize = 10.5.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                    Text(
                                        text = if (isPostgresOnline) "neon_drift_db @ ${repository.postgresHelper.host}:5000" else "Tocar para configurar IP",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 9.sp
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Lista de Pilotos Registrados
                        Text(
                            text = "PILOTOS EN BASE DE DATOS:",
                            fontSize = 10.5.sp,
                            color = Color(0xFF64748B),
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            items(existingUsers) { name ->
                                val isSelected = (username == name)
                                Surface(
                                    modifier = Modifier.clickable {
                                        username = name
                                        password = if (name == "David") "1234" else ""
                                        errorMessage = null
                                    },
                                    color = if (isSelected) Color(0xFF00F0FF).copy(alpha = 0.25f) else Color(0xFF1E293B),
                                    shape = CircleShape,
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (isSelected) Color(0xFF00F0FF) else Color(0xFF334155)
                                    )
                                ) {
                                    Text(
                                        text = name,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                        fontSize = 11.sp,
                                        color = if (isSelected) Color(0xFF00F0FF) else Color(0xFFCBD5E1),
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }

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
                            .height(40.dp),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFF00FF66))
                    ) {
                        Text(
                            text = "⚡ ACCESO RÁPIDO: PILOTO DAVID",
                            color = Color(0xFF00FF66),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }

                // COLUMNA DERECHA: FORMULARIO Y BOTONES SEPARADOS
                Column(
                    modifier = Modifier
                        .weight(1.2f)
                        .fillMaxHeight()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "ACCESO & REGISTRO DE CUENTA",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Campo Nombre de Piloto
                        OutlinedTextField(
                            value = username,
                            onValueChange = {
                                username = it
                                errorMessage = null
                            },
                            label = { Text("Nombre de Piloto / Usuario", color = Color(0xFF94A3B8), fontSize = 11.sp) },
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

                        // Campo Contraseña
                        OutlinedTextField(
                            value = password,
                            onValueChange = {
                                password = it
                                errorMessage = null
                            },
                            label = { Text("Contraseña / PIN", color = Color(0xFF94A3B8), fontSize = 11.sp) },
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
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = errorMessage ?: "",
                                color = Color(0xFFFF1744),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        if (infoMessage != null) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = infoMessage ?: "",
                                color = Color(0xFF00FF66),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // LOS DOS BOTONES CLAROS Y VISIBLES
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // BOTÓN 1: INICIAR SESIÓN
                        Button(
                            onClick = {
                                if (username.isBlank() || password.isBlank()) {
                                    errorMessage = "Ingresa usuario y contraseña"
                                    return@Button
                                }
                                scope.launch {
                                    val user = repository.login(username, password)
                                    if (user != null) {
                                        onUserLoggedIn(user)
                                    } else {
                                        errorMessage = "Piloto o clave incorrecta"
                                    }
                                }
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF))
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "🔑 INICIAR SESIÓN",
                                    color = Color(0xFF03030C),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 11.5.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        // BOTÓN 2: CREAR NUEVO PILOTO
                        Button(
                            onClick = {
                                if (username.isBlank() || password.isBlank()) {
                                    errorMessage = "Ingresa usuario y clave para registrar"
                                    return@Button
                                }
                                scope.launch {
                                    val user = repository.register(username, password)
                                    if (user != null) {
                                        infoMessage = "¡Piloto creado con éxito!"
                                        refreshUsers()
                                        onUserLoggedIn(user)
                                    } else {
                                        errorMessage = "Ese piloto ya existe en la base de datos"
                                    }
                                }
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF007F))
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "➕ NUEVO PILOTO",
                                    color = Color.White,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 11.5.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
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
                    text = "Configuración Servidor PostgreSQL",
                    color = Color(0xFF00F0FF),
                    fontWeight = FontWeight.Black
                )
            },
            text = {
                Column {
                    Text(
                        text = "IP del Servidor (neon_drift_db en PostgreSQL 17 / Puerto 5000):",
                        fontSize = 12.sp,
                        color = Color(0xFFCBD5E1)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = postgresHostInput,
                        onValueChange = { postgresHostInput = it },
                        label = { Text("IP Host (10.0.2.2 para Emulador)") },
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
                    Text("PROBAR & CONECTAR")
                }
            },
            dismissButton = {
                TextButton(onClick = { showHostDialog = false }) {
                    Text("CERRAR")
                }
            }
        )
    }
}
