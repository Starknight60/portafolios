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
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Rendimiento, 1: Carrocería & Luces, 2: Llantas, Alerón & FX
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
        ?: UserCarState(
            carId = carDef.id,
            isUnlocked = carDef.price == 0,
            bodyColor = carDef.defaultBodyColor,
            underglowColor = carDef.defaultUnderglowColor,
            rimColor = carDef.defaultRimColor
        )

    val isCurrentActive = (carDef.id == activeSelectedCarId)

    fun saveCustomization(
        newBody: Long = carState.bodyColor,
        newUnderglow: Long = carState.underglowColor,
        newRim: Long = carState.rimColor,
        newSpoiler: Int = carState.spoilerStyle,
        newTrail: Long = carState.trailFxColor
    ) {
        scope.launch {
            repository.updateCustomization(
                userId = user.id,
                carId = carDef.id,
                bodyColor = newBody,
                underglowColor = newUnderglow,
                rimColor = newRim,
                spoilerStyle = newSpoiler,
                trailFxColor = newTrail
            )
            refreshCars()
            onUserDataChanged()
        }
    }

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
                        text = "CIBER TALLER & TUNING",
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
                horizontalArrangement = Arrangement.spacedBy(8.dp)
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
                            if (isSelected) Color(def.archetypeBadgeColor) else Color(0xFF334155)
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
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
                                    color = if (isSelected) Color(def.archetypeBadgeColor) else Color.White,
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = if (unlocked) def.archetype else "${def.price} 🪙",
                                    color = if (unlocked) Color(0xFF00FF66) else Color(0xFFFFD700),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // PANEL CENTRAL: PREVIEW CON ARQUETIPO A LA IZQUIERDA Y PANEL DE MEJORAS A LA DERECHA
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Lado Izquierdo: Vista 2D del Coche, Arquetipo con Pros/Cons y Selección
                Card(
                    modifier = Modifier
                        .weight(1.05f)
                        .fillMaxHeight()
                        .border(1.2.dp, Color(carDef.archetypeBadgeColor).copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = carDef.name.uppercase(),
                                    color = Color.White,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace
                                )
                                Surface(
                                    color = Color(carDef.archetypeBadgeColor).copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(6.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(carDef.archetypeBadgeColor))
                                ) {
                                    Text(
                                        text = carDef.archetype,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                        color = Color(carDef.archetypeBadgeColor),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                            }
                            Text(
                                text = carDef.tagline,
                                color = Color(0xFF94A3B8),
                                fontSize = 10.sp
                            )
                        }

                        // Preview gráfico en tiempo real
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(95.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CarPreviewCanvas(carDef = carDef, carState = carState)
                        }

                        // Cuadro de Comportamiento Asimétrico (Pros & Cons)
                        Surface(
                            color = Color(0xFF111827),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B))
                        ) {
                            Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(text = "🟢 PRO:", color = Color(0xFF00FF66), fontSize = 9.5.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = carDef.prosText, color = Color.White, fontSize = 9.sp, maxLines = 1)
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(text = "🔴 CONTRA:", color = Color(0xFFFF5252), fontSize = 9.5.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = carDef.consText, color = Color(0xFFFF8A80), fontSize = 9.sp, maxLines = 1)
                                }
                            }
                        }

                        // Barras de Estadísticas Asimétricas Comparativas
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            CarStatBar(label = "VEL.", value = "${carDef.baseSpeedKmh.toInt()} km/h", ratio = carDef.baseSpeedKmh / 270f, color = Color(0xFF00F0FF))
                            CarStatBar(label = "ACEL.", value = "${carDef.baseAccel}x", ratio = carDef.baseAccel / 1.7f, color = Color(0xFFFF007F))
                            CarStatBar(
                                label = "MANEJO",
                                value = "${carDef.baseHandling}x",
                                ratio = carDef.baseHandling / 1.8f,
                                color = if (carDef.baseHandling < 0.9f) Color(0xFFFF5252) else Color(0xFF00FF66)
                            )
                            CarStatBar(label = "NITRO", value = "${carDef.baseNitro}x", ratio = carDef.baseNitro / 2.3f, color = Color(0xFFFFD700))
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
                                    .height(38.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD700))
                            ) {
                                Text(
                                    text = "DESBLOQUEAR POR ${carDef.price} 🪙",
                                    color = Color(0xFF03030C),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 11.5.sp
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
                                    .height(38.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF))
                            ) {
                                Text(
                                    text = "CONDUCIR ESTE COCHE",
                                    color = Color(0xFF03030C),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 11.5.sp
                                )
                            }
                        } else {
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(38.dp),
                                shape = RoundedCornerShape(10.dp),
                                color = Color(0xFF00FF66).copy(alpha = 0.2f),
                                border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFF00FF66))
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = "COCHE SELECCIONADO PARA LA CARRERA ✅",
                                        color = Color(0xFF00FF66),
                                        fontWeight = FontWeight.Black,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }
                    }
                }

                // Lado Derecho: Pestañas de Rendimiento vs Pintura/Luces vs Llantas/Alerón
                Card(
                    modifier = Modifier
                        .weight(1.25f)
                        .fillMaxHeight()
                        .border(1.2.dp, Color(0xFFFF007F).copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp)
                    ) {
                        // Selector de 3 Pestañas
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF131B2E), RoundedCornerShape(10.dp))
                                .padding(3.dp),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            TabButton(
                                title = "TUNING",
                                isSelected = selectedTab == 0,
                                selectedColor = Color(0xFF00F0FF),
                                modifier = Modifier.weight(1f),
                                onClick = { selectedTab = 0 }
                            )
                            TabButton(
                                title = "PINTURA",
                                isSelected = selectedTab == 1,
                                selectedColor = Color(0xFFFF007F),
                                modifier = Modifier.weight(1f),
                                onClick = { selectedTab = 1 }
                            )
                            TabButton(
                                title = "LLANTAS/ALERÓN",
                                isSelected = selectedTab == 2,
                                selectedColor = Color(0xFFFFD700),
                                modifier = Modifier.weight(1.2f),
                                onClick = { selectedTab = 2 }
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // CONTENIDO SEGÚN PESTAÑA
                        when (selectedTab) {
                            0 -> {
                                // Pestaña 0: Mejoras de Rendimiento (Nivel 1 al 5)
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .verticalScroll(rememberScrollState()),
                                    verticalArrangement = Arrangement.spacedBy(7.dp)
                                ) {
                                    UpgradeRow(
                                        title = "VELOCIDAD MÁXIMA (+14 KM/H)",
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
                            }

                            1 -> {
                                // Pestaña 1: Carrocería & Luces Underglow
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .verticalScroll(rememberScrollState()),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Text(
                                        text = "COLOR DE CARROCERÍA NEÓN (10 TONOS)",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        for (colorVal in CatalogData.BODY_COLORS) {
                                            val isCurrent = (carState.bodyColor == colorVal)
                                            Box(
                                                modifier = Modifier
                                                    .size(28.dp)
                                                    .background(Color(colorVal), CircleShape)
                                                    .border(
                                                        if (isCurrent) 2.5.dp else 1.dp,
                                                        if (isCurrent) Color.White else Color.Transparent,
                                                        CircleShape
                                                    )
                                                    .clickable {
                                                        saveCustomization(newBody = colorVal)
                                                    }
                                            )
                                        }
                                    }

                                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                                    Text(
                                        text = "LUCES LED UNDERGLOW (CHASIS INFERIOR)",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        for (colorVal in CatalogData.UNDERGLOW_COLORS) {
                                            val isCurrent = (carState.underglowColor == colorVal)
                                            Box(
                                                modifier = Modifier
                                                    .size(28.dp)
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
                                                        saveCustomization(newUnderglow = colorVal)
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

                            2 -> {
                                // Pestaña 2: Llantas Rims, Alerón Aerodinámico y Estela FX
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .verticalScroll(rememberScrollState()),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    // 1. Color de Llantas Neón
                                    Text(
                                        text = "COLOR DE LLANTAS (RIMS & WHEELS)",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        for (rimColorVal in CatalogData.RIM_COLORS) {
                                            val isCurrent = (carState.rimColor == rimColorVal)
                                            Box(
                                                modifier = Modifier
                                                    .size(28.dp)
                                                    .background(Color(rimColorVal), CircleShape)
                                                    .border(
                                                        if (isCurrent) 2.5.dp else 1.dp,
                                                        if (isCurrent) Color.White else Color.Transparent,
                                                        CircleShape
                                                    )
                                                    .clickable {
                                                        saveCustomization(newRim = rimColorVal)
                                                    }
                                            )
                                        }
                                    }

                                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                                    // 2. Estilo de Alerón
                                    Text(
                                        text = "DISEÑO DE ALERÓN TRASERO AERODINÁMICO",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CatalogData.SPOILERS.forEach { spOption ->
                                            val isCurrent = (carState.spoilerStyle == spOption.id)
                                            Surface(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clickable { saveCustomization(newSpoiler = spOption.id) },
                                                shape = RoundedCornerShape(8.dp),
                                                color = if (isCurrent) Color(0xFF1E293B) else Color(0xFF0F172A),
                                                border = androidx.compose.foundation.BorderStroke(
                                                    if (isCurrent) 1.5.dp else 1.dp,
                                                    if (isCurrent) Color(0xFFFFD700) else Color(0xFF334155)
                                                )
                                            ) {
                                                Column(modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)) {
                                                    Text(
                                                        text = spOption.name,
                                                        color = if (isCurrent) Color(0xFFFFD700) else Color.White,
                                                        fontSize = 10.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        maxLines = 1
                                                    )
                                                    Text(
                                                        text = spOption.description,
                                                        color = Color(0xFF94A3B8),
                                                        fontSize = 8.5.sp,
                                                        maxLines = 2
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                                    // 3. Estela FX de Humo y Nitro
                                    Text(
                                        text = "ESTELA NEÓN (HUMO DE DERRAPE & LLAMA NITRO)",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        for (trailVal in CatalogData.TRAIL_FX_COLORS) {
                                            val isCurrent = (carState.trailFxColor == trailVal)
                                            Box(
                                                modifier = Modifier
                                                    .size(28.dp)
                                                    .background(Color(trailVal), CircleShape)
                                                    .border(
                                                        if (isCurrent) 2.5.dp else 1.dp,
                                                        if (isCurrent) Color.White else Color.Transparent,
                                                        CircleShape
                                                    )
                                                    .clickable {
                                                        saveCustomization(newTrail = trailVal)
                                                    }
                                            )
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
fun TabButton(
    title: String,
    isSelected: Boolean,
    selectedColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .background(
                if (isSelected) selectedColor else Color.Transparent,
                RoundedCornerShape(8.dp)
            )
            .clickable { onClick() }
            .padding(vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            color = if (isSelected) Color(0xFF03030C) else Color(0xFF94A3B8)
        )
    }
}

@Composable
fun CarStatBar(label: String, value: String, ratio: Float, color: Color) {
    Column(modifier = Modifier.width(58.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = label, color = Color(0xFF94A3B8), fontSize = 8.5.sp, fontWeight = FontWeight.Bold)
            Text(text = value, color = color, fontSize = 8.5.sp, fontWeight = FontWeight.Black)
        }
        Spacer(modifier = Modifier.height(3.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .background(Color(0xFF1E293B), RoundedCornerShape(2.dp))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(ratio.coerceIn(0.1f, 1f))
                    .background(color, RoundedCornerShape(2.dp))
            )
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
    val canAfford = coins >= cost && !isMax

    Surface(
        color = Color(0xFF0F172A),
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = title,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                )
                Row(
                    modifier = Modifier.padding(top = 3.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    for (i in 1..5) {
                        Box(
                            modifier = Modifier
                                .size(width = 14.dp, height = 5.dp)
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
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            } else {
                Button(
                    onClick = onUpgrade,
                    enabled = canAfford,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = color),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "MEJORAR ($cost 🪙)",
                        color = Color(0xFF03030C),
                        fontSize = 9.5.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }
    }
}
