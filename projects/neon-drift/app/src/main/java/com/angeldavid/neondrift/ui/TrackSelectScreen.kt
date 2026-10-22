@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angeldavid.neondrift.data.CatalogData
import com.angeldavid.neondrift.data.NeonDriftRepository
import com.angeldavid.neondrift.db.NeonDriftDbHelper
import com.angeldavid.neondrift.model.TrackDefinition
import com.angeldavid.neondrift.model.UserAccount
import kotlinx.coroutines.launch

@Composable
fun TrackSelectScreen(
    user: UserAccount,
    repository: NeonDriftRepository,
    onTrackSelected: (TrackDefinition, Boolean) -> Unit,
    onBackToHub: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var selectedTrackIndex by remember { mutableIntStateOf(0) }
    var trackProgressRecords by remember { mutableStateOf<Map<String, NeonDriftDbHelper.TrackProgressRecord>>(emptyMap()) }
    var currentUserCoins by remember { mutableIntStateOf(user.coins) }
    var isUnlockingTrack by remember { mutableStateOf(false) }
    var isHardModeSelected by remember { mutableStateOf(false) }

    fun refreshTrackRecords() {
        scope.launch {
            val map = mutableMapOf<String, NeonDriftDbHelper.TrackProgressRecord>()
            for (track in CatalogData.TRACKS) {
                map[track.id] = repository.getTrackProgress(user.id, track.id)
            }
            trackProgressRecords = map
            val u = repository.getUser(user.id)
            if (u != null) {
                currentUserCoins = u.coins
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshTrackRecords()
    }

    fun isTrackUnlocked(track: TrackDefinition): Boolean {
        if (track.unlockCost == 0) return true
        val rec = trackProgressRecords[track.id]
        if (rec != null && rec.isUnlocked) return true
        val reqId = track.unlockRequiredTrackId ?: return false
        val prevRec = trackProgressRecords[reqId] ?: return false
        return prevRec.m1Done || (prevRec.bestTimeSec < 900f && prevRec.bestScore > 0)
    }

    val currentTrack = CatalogData.TRACKS[selectedTrackIndex]
    val record = trackProgressRecords[currentTrack.id] ?: NeonDriftDbHelper.TrackProgressRecord(999f, 0, false, false, false, false)
    val isCurrentTrackUnlocked = isTrackUnlocked(currentTrack)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF03030C),
                        Color(0xFF0B081E),
                        Color(0xFF16062A)
                    )
                )
            )
            .padding(horizontal = 20.dp, vertical = 10.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // CABECERA
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
                        text = "CIRCUITOS Y MISIONES",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 20.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Surface(
                    color = Color(0xFF1E1B4B),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFFFFD700))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "🪙 $currentUserCoins CRÉDITOS", color = Color(0xFFFFD700), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // SELECTOR DE CIRCUITOS (TABS SUPERIORES)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CatalogData.TRACKS.forEachIndexed { idx, track ->
                    val isSelected = (idx == selectedTrackIndex)
                    val unlocked = isTrackUnlocked(track)

                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedTrackIndex = idx },
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) Color(0xFF1E293B) else Color(0xFF0F172A),
                        border = androidx.compose.foundation.BorderStroke(
                            if (isSelected) 1.5.dp else 1.dp,
                            if (isSelected) Color(track.barrierPrimaryColor) else Color(0xFF334155)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(vertical = 8.dp, horizontal = 8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = if (unlocked) "🏁" else "🔒",
                                    fontSize = 11.sp
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = track.name,
                                    color = if (isSelected) Color(track.barrierPrimaryColor) else if (unlocked) Color.White else Color(0xFF94A3B8),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    maxLines = 1
                                )
                            }
                            Text(
                                text = if (unlocked) "${track.totalLaps} VUELTAS" else "${track.unlockCost} 🪙",
                                color = if (unlocked) Color(0xFF00FF66) else Color(0xFFFFD700),
                                fontSize = 9.5.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // CONTENIDO: MINIATURA DE PISTA Y PANEL DE MISIONES / DESBLOQUEO
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Tarjeta Izquierda: Mapa y Récords
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .border(1.2.dp, Color(currentTrack.barrierPrimaryColor).copy(alpha = if (isCurrentTrackUnlocked) 0.6f else 0.25f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(14.dp),
                        verticalArrangement = Arrangement.SpaceBetween,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = currentTrack.location.uppercase(),
                                color = if (isCurrentTrackUnlocked) Color(0xFFFF007F) else Color(0xFF64748B),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = currentTrack.name,
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        // Miniatura Vectorial del Circuito con velo de bloqueo si está cerrado
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(130.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            TrackMiniMapCanvas(track = currentTrack)

                            if (!isCurrentTrackUnlocked) {
                                Surface(
                                    color = Color(0xFF03030C).copy(alpha = 0.85f),
                                    shape = RoundedCornerShape(12.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFFFF1744))
                                ) {
                                    Column(
                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text(text = "🔒 CIRCUITO BLOQUEADO", color = Color(0xFFFF1744), fontWeight = FontWeight.Black, fontSize = 11.sp)
                                        Text(text = "Acceso restringido por la liga neón", color = Color(0xFF94A3B8), fontSize = 9.sp)
                                    }
                                }
                            }
                        }

                        // Récord Personal
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(text = "MEJOR TIEMPO", color = Color(0xFF94A3B8), fontSize = 10.sp)
                                val timeText = if (record.bestTimeSec >= 900f) "--:--" else String.format("%.1fs", record.bestTimeSec)
                                Text(text = timeText, color = Color(0xFF00FF66), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(text = "RÉCORD PUNTOS", color = Color(0xFF94A3B8), fontSize = 10.sp)
                                Text(text = "${record.bestScore} PTS", color = Color(0xFFFFD700), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                // Tarjeta Derecha: Lista de Misiones o Panel de Desbloqueo
                Card(
                    modifier = Modifier
                        .weight(1.3f)
                        .fillMaxHeight()
                        .border(1.2.dp, Color(currentTrack.barrierSecondaryColor).copy(alpha = 0.6f), RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(14.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                                .verticalScroll(rememberScrollState())
                        ) {
                            if (isCurrentTrackUnlocked) {
                                Text(
                                    text = "MISIONES Y RECOMPENSAS",
                                    color = Color(currentTrack.barrierPrimaryColor),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.sp
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    currentTrack.missions.forEachIndexed { index, mission ->
                                        val isDone = when (mission.id) {
                                            1 -> record.m1Done
                                            2 -> record.m2Done
                                            3 -> record.m3Done
                                            else -> false
                                        }
                                        MissionRow(mission = mission, isCompleted = isDone)
                                    }
                                }
                            } else {
                                // Vista de Requisitos de Desbloqueo
                                Surface(
                                    color = Color(0xFFFFD700).copy(alpha = 0.12f),
                                    shape = RoundedCornerShape(10.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFFD700))
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text(
                                            text = "🏆 CÓMO DESBLOQUEAR ESTA PISTA",
                                            color = Color(0xFFFFD700),
                                            fontWeight = FontWeight.Black,
                                            fontSize = 12.sp
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = currentTrack.unlockRequiredMissionText,
                                            color = Color.White,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Puedes clasificar gratis superando el circuito anterior o adquirir el pase oficial de pista inmediatamente con créditos.",
                                            color = Color(0xFF94A3B8),
                                            fontSize = 9.5.sp
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Text(
                                    text = "RECOMPENSAS POR COMPLETAR:",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 10.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                currentTrack.missions.forEach { m ->
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(text = "• ${m.title}", color = Color.White, fontSize = 10.sp)
                                        Text(text = "+${m.rewardCoins} 🪙", color = Color(0xFFFFD700), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }

                        // Selector de Dificultad (Modo Normal vs Modo Difícil)
                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF0F172A), RoundedCornerShape(10.dp))
                                .border(1.dp, if (isHardModeSelected) Color(0xFFFF5722) else Color(0xFF334155), RoundedCornerShape(10.dp))
                                .padding(3.dp),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { isHardModeSelected = false },
                                shape = RoundedCornerShape(8.dp),
                                color = if (!isHardModeSelected) Color(0xFF1E293B) else Color.Transparent
                            ) {
                                Row(
                                    modifier = Modifier.padding(vertical = 7.dp),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "🛡️ NORMAL",
                                        color = if (!isHardModeSelected) Color(0xFF00F0FF) else Color(0xFF64748B),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }

                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { isHardModeSelected = true },
                                shape = RoundedCornerShape(8.dp),
                                color = if (isHardModeSelected) Color(0xFFFF5722).copy(alpha = 0.35f) else Color.Transparent
                            ) {
                                Row(
                                    modifier = Modifier.padding(vertical = 7.dp),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "🔥 DIFÍCIL (+85% 🪙)",
                                        color = if (isHardModeSelected) Color(0xFFFFD700) else Color(0xFF64748B),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }

                        // Botón de Acción: Iniciar Carrera o Desbloquear Pista
                        Spacer(modifier = Modifier.height(8.dp))

                        if (isCurrentTrackUnlocked) {
                            val startBtnColor = if (isHardModeSelected) Color(0xFFFF5722) else Color(currentTrack.barrierPrimaryColor)
                            Button(
                                onClick = { onTrackSelected(currentTrack, isHardModeSelected) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(46.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = startBtnColor)
                            ) {
                                Text(
                                    text = if (isHardModeSelected) {
                                        "🔥 INICIAR MODO DIFÍCIL (${currentTrack.totalLaps} VUELTAS)"
                                    } else {
                                        "🏁 INICIAR CARRERA (${currentTrack.totalLaps} VUELTAS)"
                                    },
                                    color = Color(0xFF03030C),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 12.sp,
                                    letterSpacing = 1.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        } else {
                            val canAfford = currentUserCoins >= currentTrack.unlockCost
                            Button(
                                onClick = {
                                    scope.launch {
                                        isUnlockingTrack = true
                                        val ok = repository.unlockTrack(user.id, currentTrack.id, currentTrack.unlockCost)
                                        if (ok) {
                                            refreshTrackRecords()
                                        }
                                        isUnlockingTrack = false
                                    }
                                },
                                enabled = canAfford && !isUnlockingTrack,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(46.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFFFFD700),
                                    disabledContainerColor = Color(0xFF1E293B)
                                )
                            ) {
                                Text(
                                    text = if (canAfford) {
                                        "🔓 DESBLOQUEAR PISTA (${currentTrack.unlockCost} 🪙)"
                                    } else {
                                        "🔒 BLOQUEADA (Requiere ${currentTrack.unlockCost} 🪙)"
                                    },
                                    color = if (canAfford) Color(0xFF03030C) else Color(0xFF64748B),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 12.sp,
                                    letterSpacing = 1.sp,
                                    fontFamily = FontFamily.Monospace
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
fun MissionRow(mission: com.angeldavid.neondrift.model.TrackMission, isCompleted: Boolean) {
    Surface(
        color = Color(0xFF131B2E),
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, if (isCompleted) Color(0xFF00FF66) else Color(0xFF1E293B))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 7.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Text(
                    text = if (isCompleted) "✅" else "🎯",
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = mission.title,
                        color = if (isCompleted) Color(0xFF00FF66) else Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                    Text(
                        text = mission.description,
                        color = Color(0xFF94A3B8),
                        fontSize = 9.5.sp
                    )
                }
            }
            Surface(
                color = Color(0xFFFFD700).copy(alpha = 0.15f),
                shape = RoundedCornerShape(6.dp),
                border = androidx.compose.foundation.BorderStroke(0.8.dp, Color(0xFFFFD700))
            ) {
                Text(
                    text = "+${mission.rewardCoins} 🪙",
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                    color = Color(0xFFFFD700),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun TrackMiniMapCanvas(track: TrackDefinition) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val wps = track.waypoints
        if (wps.size < 3) return@Canvas

        var minX = Float.MAX_VALUE
        var maxX = Float.MIN_VALUE
        var minY = Float.MAX_VALUE
        var maxY = Float.MIN_VALUE

        for (p in wps) {
            if (p.x < minX) minX = p.x
            if (p.x > maxX) maxX = p.x
            if (p.y < minY) minY = p.y
            if (p.y > maxY) maxY = p.y
        }

        val rangeX = (maxX - minX).coerceAtLeast(1f)
        val rangeY = (maxY - minY).coerceAtLeast(1f)

        val padding = 20f
        val scaleX = (size.width - padding * 2f) / rangeX
        val scaleY = (size.height - padding * 2f) / rangeY
        val scale = minOf(scaleX, scaleY)

        val offsetX = (size.width - rangeX * scale) / 2f
        val offsetY = (size.height - rangeY * scale) / 2f

        val path = Path().apply {
            val startX = (wps[0].x - minX) * scale + offsetX
            val startY = (wps[0].y - minY) * scale + offsetY
            moveTo(startX, startY)
            for (i in 1 until wps.size) {
                val px = (wps[i].x - minX) * scale + offsetX
                val py = (wps[i].y - minY) * scale + offsetY
                lineTo(px, py)
            }
            close()
        }

        // Trazado de Pista Neón
        drawPath(path, color = Color(track.barrierPrimaryColor).copy(alpha = 0.3f), style = Stroke(width = 10f))
        drawPath(path, color = Color(track.barrierPrimaryColor), style = Stroke(width = 3.5f))

        // Checkpoints
        for (p in wps) {
            if (p.isCheckpoint) {
                val cx = (p.x - minX) * scale + offsetX
                val cy = (p.y - minY) * scale + offsetY
                drawCircle(Color(track.barrierSecondaryColor), radius = 4f, center = Offset(cx, cy))
            }
        }

        // Meta / Salida (Primer punto)
        val metaX = (wps[0].x - minX) * scale + offsetX
        val metaY = (wps[0].y - minY) * scale + offsetY
        drawCircle(Color.White, radius = 5.5f, center = Offset(metaX, metaY))
    }
}
