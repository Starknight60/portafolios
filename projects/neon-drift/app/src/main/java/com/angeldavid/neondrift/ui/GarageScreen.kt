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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angeldavid.neondrift.data.CatalogData
import com.angeldavid.neondrift.data.NeonDriftRepository
import com.angeldavid.neondrift.model.UserAccount
import com.angeldavid.neondrift.model.UserCarState
import kotlinx.coroutines.launch

@Composable
fun GarageScreen(
    user: UserAccount,
    repository: NeonDriftRepository,
    onBackToHub: () -> Unit,
    onUserDataChanged: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var selectedCarIndex by remember { mutableIntStateOf(0) }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Mejoras, 1: Pintura/Underglow
    var userCars by remember { mutableStateOf<List<UserCarState>>(emptyList()) }
    var userCoins by remember { mutableIntStateOf(user.coins) }
    var activeSelectedCarId by remember { mutableStateOf(user.selectedCarId) }

    fun refreshCars() {
        scope.launch {
            userCars = repository.getUserCars(user.id)
            val updatedUser = repository.getUser(user.id)
            if (updatedUser != null) {
                userCoins = updatedUser.coins
                activeSelectedCarId = updatedUser.selectedCarId
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshCars()
        val initialIdx = CatalogData.CAR_CATALOG.indexOfFirst { it.id == user.selectedCarId }
        if (initialIdx >= 0) selectedCarIndex = initialIdx
    }

    val carDef = CatalogData.CAR_CATALOG[selectedCarIndex]
    val carState = userCars.firstOrNull { it.carId == carDef.id }
        ?: UserCarState(carId = carDef.id, isUnlocked = carDef.price == 0)

    val isCurrentActive = (carDef.id == activeSelectedCarId)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF03030C),
                        Color(0xFF0C0721),
                        Color(0xFF140828)
                    )
                )
            )
            .padding(horizontal = 20.dp, vertical = 10.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // CABECERA: TÍTULO, MONEDAS Y VOLVER
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedButton(
                        onClick = onBackToHub,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFF00F0FF)),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(text = "◄ MENÚ", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "CIBER GARAJE",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 20.sp,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.sp
                    )
                }

                Surface(
                    color = Color(0xFF1E1B4B),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFFFFD700))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "🪙", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "$userCoins",
                            color = Color(0xFFFFD700),
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "CRÉDITOS", color = Color(0xFFFFD700).copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // SELECTOR HORIZONTAL DE COCHES DEL CATÁLOGO
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(CatalogData.CAR_CATALOG.indices.toList()) { idx ->
                    val def = CatalogData.CAR_CATALOG[idx]
                    val st = userCars.firstOrNull { it.carId == def.id }
                    val unlocked = st?.isUnlocked ?: (def.price == 0)
                    val isSelected = (idx == selectedCarIndex)

                    Surface(
                        modifier = Modifier
                            .clickable { selectedCarIndex = idx },
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) Color(0xFF1E293B) else Color(0xFF0F172A),
                        border = androidx.compose.foundation.BorderStroke(
                            if (isSelected) 1.5.dp else 0.8.dp,
                            if (isSelected) Color(0xFF00F0FF) else Color(0xFF334155)
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (unlocked) "🏎️" else "🔒",
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Column {
                                Text(
                                    text = def.name,
                                    color = if (isSelected) Color(0xFF00F0FF) else Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = if (unlocked) "DESBLOQUEADO" else "${def.price} 🪙",
                                    color = if (unlocked) Color(0xFF00FF66) else Color(0xFFFFD700),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // PANEL CENTRAL: PREVIEW A LA IZQUIERDA Y PANEL DE MEJORAS A LA DERECHA
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Lado Izquierdo: Vista 2D del Coche y Botón de Desbloqueo / Selección
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .border(1.2.dp, Color(0xFF00F0FF).copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = carDef.name.uppercase(),
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = carDef.tagline,
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp
                            )
                        }

                        // Preview gráfico
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(110.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CarPreviewCanvas(carDef = carDef, carState = carState)
                        }

                        // Botón de Estado / Acción
                        if (!carState.isUnlocked) {
                            Button(
                                onClick = {
                                    scope.launch {
                                        val ok = repository.unlockCar(user.id, carDef)
                                        if (ok) {
                                            refreshCars()
                                            onUserDataChanged()
                                        }
                                    }
                                },
                                enabled = (userCoins >= carDef.price),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(42.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD700))
                            ) {
                                Text(
                                    text = "DESBLOQUEAR POR ${carDef.price} 🪙",
                                    color = Color(0xFF03030C),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 12.sp
                                )
                            }
                        } else if (!isCurrentActive) {
                            Button(
                                onClick = {
                                    scope.launch {
                                        repository.selectCar(user.id, carDef.id)
                                        refreshCars()
                                        onUserDataChanged()
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(42.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF))
                            ) {
                                Text(
                                    text = "SELECCIONAR ESTE COCHE",
                                    color = Color(0xFF03030C),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 12.sp
                                )
                            }
                        } else {
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(42.dp),
                                shape = RoundedCornerShape(10.dp),
                                color = Color(0xFF00FF66).copy(alpha = 0.2f),
                                border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFF00FF66))
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = "COCHE ACTIVO EN PISTA ✅",
                                        color = Color(0xFF00FF66),
                                        fontWeight = FontWeight.Black,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }

                // Lado Derecho: Pestañas de Mejoras / Personalización
                Card(
                    modifier = Modifier
                        .weight(1.3f)
                        .fillMaxHeight()
                        .border(1.2.dp, Color(0xFFFF007F).copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(14.dp)
                    ) {
                        // Selector de Pestaña: Mejoras vs Colores
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF131B2E), RoundedCornerShape(10.dp))
                                .padding(3.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(
                                        if (selectedTab == 0) Color(0xFF00F0FF) else Color.Transparent,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable { selectedTab = 0 }
                                    .padding(vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "MEJORAS DE RENDIMIENTO",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    color = if (selectedTab == 0) Color(0xFF03030C) else Color(0xFF94A3B8)
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(
                                        if (selectedTab == 1) Color(0xFFFF007F) else Color.Transparent,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable { selectedTab = 1 }
                                    .padding(vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "PERSONALIZACIÓN / ESTILO",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    color = if (selectedTab == 1) Color.White else Color(0xFF94A3B8)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        if (selectedTab == 0) {
                            // Panel de Mejoras (Tuning)
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                UpgradeRow(
                                    title = "VELOCIDAD MÁXIMA",
                                    level = carState.speedLevel,
                                    coins = userCoins,
                                    color = Color(0xFF00F0FF),
                                    onUpgrade = {
                                        scope.launch {
                                            val ok = repository.upgradeStat(user.id, carDef.id, "speed", carState.speedLevel)
                                            if (ok) {
                                                refreshCars()
                                                onUserDataChanged()
                                            }
                                        }
                                    }
                                )
                                UpgradeRow(
                                    title = "ACELERACIÓN Y TURBO",
                                    level = carState.accelLevel,
                                    coins = userCoins,
                                    color = Color(0xFFFF007F),
                                    onUpgrade = {
                                        scope.launch {
                                            val ok = repository.upgradeStat(user.id, carDef.id, "accel", carState.accelLevel)
                                            if (ok) {
                                                refreshCars()
                                                onUserDataChanged()
                                            }
                                        }
                                    }
                                )
                                UpgradeRow(
                                    title = "MANEJO Y DERRAPE",
                                    level = carState.handlingLevel,
                                    coins = userCoins,
                                    color = Color(0xFF00FF66),
                                    onUpgrade = {
                                        scope.launch {
                                            val ok = repository.upgradeStat(user.id, carDef.id, "handling", carState.handlingLevel)
                                            if (ok) {
                                                refreshCars()
                                                onUserDataChanged()
                                            }
                                        }
                                    }
                                )
                                UpgradeRow(
                                    title = "SOBRECARGA DE NITRO",
                                    level = carState.nitroLevel,
                                    coins = userCoins,
                                    color = Color(0xFFFFD700),
                                    onUpgrade = {
                                        scope.launch {
                                            val ok = repository.upgradeStat(user.id, carDef.id, "nitro", carState.nitroLevel)
                                            if (ok) {
                                                refreshCars()
                                                onUserDataChanged()
                                            }
                                        }
                                    }
                                )
                            }
                        } else {
                            // Panel de Personalización Visual (Pintura & Underglow)
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Text(
                                    text = "COLOR DE CARROCERÍA NEÓN",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    for (colorVal in CatalogData.BODY_COLORS) {
                                        val isCurrent = (carState.bodyColor == colorVal)
                                        Box(
                                            modifier = Modifier
                                                .size(32.dp)
                                                .background(Color(colorVal), CircleShape)
                                                .border(
                                                    if (isCurrent) 2.5.dp else 1.dp,
                                                    if (isCurrent) Color.White else Color.Transparent,
                                                    CircleShape
                                                )
                                                .clickable {
                                                    scope.launch {
                                                        repository.updateColors(
                                                            user.id,
                                                            carDef.id,
                                                            colorVal,
                                                            carState.underglowColor
                                                        )
                                                        refreshCars()
                                                        onUserDataChanged()
                                                    }
                                                }
                                        )
                                    }
                                }

                                HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                                Text(
                                    text = "LUCES LED UNDERGLOW (INFERIOR)",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    for (colorVal in CatalogData.UNDERGLOW_COLORS) {
                                        val isCurrent = (carState.underglowColor == colorVal)
                                        Box(
                                            modifier = Modifier
                                                .size(32.dp)
                                                .background(
                                                    if (colorVal == 0L) Color(0xFF1E293B) else Color(colorVal),
                                                    CircleShape
                                                )
                                                .border(
                                                    if (isCurrent) 2.5.dp else 1.dp,
                                                    if (isCurrent) Color.White else Color.Transparent,
                                                    CircleShape
                                                )
                                                .clickable {
                                                    scope.launch {
                                                        repository.updateColors(
                                                            user.id,
                                                            carDef.id,
                                                            carState.bodyColor,
                                                            colorVal
                                                        )
                                                        refreshCars()
                                                        onUserDataChanged()
                                                    }
                                                },
                                            contentAlignment = Alignment.Center
                                        ) {
                                            if (colorVal == 0L) {
                                                Text(text = "❌", fontSize = 10.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun UpgradeRow(
    title: String,
    level: Int,
    coins: Int,
    color: Color,
    onUpgrade: () -> Unit
) {
    val isMax = level >= 5
    val nextLevel = level + 1
    val cost = CatalogData.getUpgradeCost(nextLevel)
    val canAfford = coins >= cost

    Surface(
        color = Color(0xFF131B2E),
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = title, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(3.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                    for (i in 1..5) {
                        Box(
                            modifier = Modifier
                                .size(width = 16.dp, height = 7.dp)
                                .background(
                                    if (i <= level) color else Color(0xFF1E293B),
                                    RoundedCornerShape(2.dp)
                                )
                        )
                    }
                }
            }

            if (isMax) {
                Surface(
                    color = Color(0xFF00FF66).copy(alpha = 0.2f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = "MAX ★",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        color = Color(0xFF00FF66),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            } else {
                Button(
                    onClick = onUpgrade,
                    enabled = canAfford,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = color),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "MEJORAR ($cost 🪙)",
                        color = Color(0xFF03030C),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }
    }
}
