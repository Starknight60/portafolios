@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angeldavid.neondrift.data.CatalogData
import com.angeldavid.neondrift.model.UserAccount
import com.angeldavid.neondrift.model.UserCarState

@Composable
fun MainHubScreen(
    user: UserAccount,
    userCars: List<UserCarState>,
    onNavigateToRaceSelect: () -> Unit,
    onNavigateToGarage: () -> Unit,
    onLogout: () -> Unit
) {
    val activeCarState = userCars.firstOrNull { it.carId == user.selectedCarId }
        ?: userCars.firstOrNull { it.isUnlocked }
        ?: UserCarState(carId = "cyber_phantom", isUnlocked = true)
    val carDef = CatalogData.getCarDef(activeCarState.carId)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF03030C),
                        Color(0xFF0A081D),
                        Color(0xFF140828)
                    )
                )
            )
            .padding(horizontal = 24.dp, vertical = 14.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // BARRA SUPERIOR: PERFIL, MONEDAS Y LOGOUT
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Perfil
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .background(Color(0xFF00F0FF).copy(alpha = 0.2f), CircleShape)
                            .border(1.5.dp, Color(0xFF00F0FF), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = user.username.take(1).uppercase(),
                            color = Color(0xFF00F0FF),
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "PILOTO: ${user.username.uppercase()}",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "RANGO: CYBER DRIFTER",
                            color = Color(0xFFFF007F),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Balance de Monedas y Logout
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = Color(0xFF1A1A2E),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFFFFD700).copy(alpha = 0.8f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "🪙", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "${user.coins}",
                                color = Color(0xFFFFD700),
                                fontWeight = FontWeight.Black,
                                fontSize = 15.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "CRÉDITOS",
                                color = Color(0xFFFFD700).copy(alpha = 0.7f),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    OutlinedButton(
                        onClick = onLogout,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF64748B)),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "CAMBIAR PILOTO",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // CUERPO PRINCIPAL: VEHÍCULO ACTIVO & BOTONES DE ACCIÓN
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Card de Visualización del Vehículo Activo
                Card(
                    modifier = Modifier
                        .weight(1.3f)
                        .fillMaxHeight()
                        .border(1.2.dp, Color(0xFF00F0FF).copy(alpha = 0.5f), RoundedCornerShape(18.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D).copy(alpha = 0.9f)),
                    shape = RoundedCornerShape(18.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = carDef.name.uppercase(),
                                    color = Color.White,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = carDef.tagline,
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp
                                )
                            }
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Surface(
                                    color = Color(carDef.archetypeBadgeColor).copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(8.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(carDef.archetypeBadgeColor))
                                ) {
                                    Text(
                                        text = carDef.archetype,
                                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                                        color = Color(carDef.archetypeBadgeColor),
                                        fontSize = 9.5.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                                Surface(
                                    color = Color(0xFF00F0FF).copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(8.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00F0FF))
                                ) {
                                    Text(
                                        text = "LVL ${activeCarState.totalLevel}",
                                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                                        color = Color(0xFF00F0FF),
                                        fontSize = 9.5.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        // Canvas con preview del coche renderizado
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            CarPreviewCanvas(
                                carDef = carDef,
                                carState = activeCarState
                            )
                        }

                        // Resumen de Estadísticas del Vehículo
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            StatMiniBadge(label = "VEL.", level = activeCarState.speedLevel, color = Color(0xFF00F0FF))
                            StatMiniBadge(label = "ACEL.", level = activeCarState.accelLevel, color = Color(0xFFFF007F))
                            StatMiniBadge(label = "MANEJO", level = activeCarState.handlingLevel, color = Color(0xFF00FF66))
                            StatMiniBadge(label = "NITRO", level = activeCarState.nitroLevel, color = Color(0xFFFFD700))
                        }
                    }
                }

                // Panel Lateral de Navegación y Modos
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight(),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    // Botón Principal de Carreras
                    Button(
                        onClick = onNavigateToRaceSelect,
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1.3f),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF)),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(text = "🏁", fontSize = 28.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "COMPETIR",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF03030C),
                                letterSpacing = 2.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "3 CIRCUITOS • RIVALES IA • MISIONES",
                                fontSize = 10.sp,
                                color = Color(0xFF03030C).copy(alpha = 0.8f),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Botón del Ciber Garaje
                    Button(
                        onClick = onNavigateToGarage,
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E1B4B)),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFFFF007F))
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(text = "🚗", fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "CIBER GARAJE",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White,
                                    letterSpacing = 1.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = "MEJORAS • COCHES • PINTURA",
                                    fontSize = 10.sp,
                                    color = Color(0xFFFF007F),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatMiniBadge(label: String, level: Int, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, color = Color(0xFF94A3B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(2.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
            for (i in 1..5) {
                Box(
                    modifier = Modifier
                        .size(width = 12.dp, height = 6.dp)
                        .background(
                            if (i <= level) color else Color(0xFF1E293B),
                            RoundedCornerShape(2.dp)
                        )
                )
            }
        }
    }
}

@Composable
fun CarPreviewCanvas(
    carDef: com.angeldavid.neondrift.model.CarDefinition,
    carState: UserCarState
) {
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(130.dp)
    ) {
        val cx = size.width / 2f
        val cy = size.height / 2f

        val bodyColor = Color(carState.bodyColor)
        val underglowColor = Color(carState.underglowColor)

        // Resplandor Underglow LED
        if (carState.underglowColor != 0L) {
            drawRoundRect(
                color = underglowColor.copy(alpha = 0.35f),
                topLeft = Offset(cx - 75f, cy - 42f),
                size = Size(150f, 84f),
                cornerRadius = CornerRadius(20f, 20f)
            )
        }

        // Chasis del Bólido
        rotate(90f, pivot = Offset(cx, cy)) {
            // Neumáticos con Llantas Personalizadas (Rims)
            val tirePaintColor = Color(0xFF0F172A)
            val rimColor = Color(carState.rimColor)

            drawRoundRect(tirePaintColor, Offset(cx - 36f, cy - 42f), Size(14f, 24f), CornerRadius(4f, 4f))
            drawRoundRect(tirePaintColor, Offset(cx + 22f, cy - 42f), Size(14f, 24f), CornerRadius(4f, 4f))
            drawRoundRect(tirePaintColor, Offset(cx - 36f, cy + 18f), Size(14f, 24f), CornerRadius(4f, 4f))
            drawRoundRect(tirePaintColor, Offset(cx + 22f, cy + 18f), Size(14f, 24f), CornerRadius(4f, 4f))

            // Rines / Llantas de aleación Neón
            drawCircle(rimColor, radius = 4f, center = Offset(cx - 29f, cy - 30f))
            drawCircle(rimColor, radius = 4f, center = Offset(cx + 29f, cy - 30f))
            drawCircle(rimColor, radius = 4f, center = Offset(cx - 29f, cy + 30f))
            drawCircle(rimColor, radius = 4f, center = Offset(cx + 29f, cy + 30f))

            // Carrocería
            val carBodyPath = Path().apply {
                moveTo(cx, cy - 50f)
                lineTo(cx + 24f, cy - 30f)
                lineTo(cx + 26f, cy + 35f)
                lineTo(cx + 30f, cy + 46f)
                lineTo(cx - 30f, cy + 46f)
                lineTo(cx - 26f, cy + 35f)
                lineTo(cx - 24f, cy - 30f)
                close()
            }
            drawPath(carBodyPath, color = Color(0xFF050B14))
            drawPath(carBodyPath, color = bodyColor, style = Stroke(width = 3.5f))

            // Cabina y Parabrisas
            val cockpitPath = Path().apply {
                moveTo(cx, cy - 25f)
                lineTo(cx + 14f, cy - 5f)
                lineTo(cx + 12f, cy + 20f)
                lineTo(cx - 12f, cy + 20f)
                lineTo(cx - 14f, cy - 5f)
                close()
            }
            drawPath(cockpitPath, color = Color(0xFF00F0FF).copy(alpha = 0.65f))
            drawPath(cockpitPath, color = Color.White, style = Stroke(width = 1.2f))

            // Alerón Trasero según estilo de personalización
            when (carState.spoilerStyle) {
                1 -> {
                    // Alerón GT Doble Ala (elevado con soportes laterales)
                    drawRoundRect(Color(0xFF0F172A), Offset(cx - 30f, cy + 40f), Size(5f, 10f), CornerRadius(1f, 1f))
                    drawRoundRect(Color(0xFF0F172A), Offset(cx + 25f, cy + 40f), Size(5f, 10f), CornerRadius(1f, 1f))
                    drawRoundRect(bodyColor, Offset(cx - 34f, cy + 47f), Size(68f, 6f), CornerRadius(2f, 2f))
                    drawRoundRect(rimColor, Offset(cx - 36f, cy + 44f), Size(4f, 10f), CornerRadius(1f, 1f))
                    drawRoundRect(rimColor, Offset(cx + 32f, cy + 44f), Size(4f, 10f), CornerRadius(1f, 1f))
                }
                2 -> {
                    // Cyber Blade (alerón curvo aerodinámico con borde neón)
                    val bladePath = Path().apply {
                        moveTo(cx - 36f, cy + 48f)
                        lineTo(cx - 24f, cy + 40f)
                        lineTo(cx + 24f, cy + 40f)
                        lineTo(cx + 36f, cy + 48f)
                        lineTo(cx + 32f, cy + 52f)
                        lineTo(cx, cy + 45f)
                        lineTo(cx - 32f, cy + 52f)
                        close()
                    }
                    drawPath(bladePath, color = bodyColor)
                    drawPath(bladePath, color = Color.White, style = Stroke(width = 1.2f))
                }
                else -> {
                    // Alerón Racing OEM Estándar
                    drawRoundRect(
                        color = bodyColor,
                        topLeft = Offset(cx - 28f, cy + 42f),
                        size = Size(56f, 8f),
                        cornerRadius = CornerRadius(2f, 2f)
                    )
                }
            }

            // Faros delanteros
            drawCircle(Color.White, radius = 4f, center = Offset(cx - 15f, cy - 40f))
            drawCircle(Color.White, radius = 4f, center = Offset(cx + 15f, cy - 40f))

            // Luces traseras neón
            drawLine(
                color = Color(0xFFFF007F),
                start = Offset(cx - 20f, cy + 45f),
                end = Offset(cx + 20f, cy + 45f),
                strokeWidth = 3f
            )

            // Resplandor de tubos de escape / nitro trail
            val trailColor = Color(carState.trailFxColor)
            drawCircle(trailColor.copy(alpha = 0.7f), radius = 3f, center = Offset(cx - 8f, cy + 48f))
            drawCircle(trailColor.copy(alpha = 0.7f), radius = 3f, center = Offset(cx + 8f, cy + 48f))
        }
    }
}
