@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.ui

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angeldavid.neondrift.data.CatalogData
import com.angeldavid.neondrift.data.NeonDriftRepository
import com.angeldavid.neondrift.engine.DriftSoundManager
import com.angeldavid.neondrift.engine.NeonDriftEngine
import com.angeldavid.neondrift.model.*
import kotlinx.coroutines.launch
import kotlin.math.*

@Composable
fun NeonDriftScreen() {
    val context = LocalContext.current
    val repository = remember { NeonDriftRepository(context) }
    val soundManager = remember { DriftSoundManager(context) }
    val engine = remember { NeonDriftEngine(context, soundManager) }
    val scope = rememberCoroutineScope()

    var currentScreen by remember { mutableStateOf(AppScreen.AUTH_LOGIN) }
    var currentUser by remember { mutableStateOf<UserAccount?>(null) }
    var userCars by remember { mutableStateOf<List<UserCarState>>(emptyList()) }
    var selectedTrack by remember { mutableStateOf(CatalogData.TRACKS[0]) }

    fun refreshUserData() {
        val u = currentUser ?: return
        scope.launch {
            val updated = repository.getUser(u.id)
            if (updated != null) {
                currentUser = updated
                userCars = repository.getUserCars(updated.id)
            }
        }
    }

    when (currentScreen) {
        AppScreen.AUTH_LOGIN -> {
            AuthScreen(
                repository = repository,
                onUserLoggedIn = { user ->
                    currentUser = user
                    scope.launch {
                        userCars = repository.getUserCars(user.id)
                        currentScreen = AppScreen.MAIN_HUB
                    }
                }
            )
        }

        AppScreen.MAIN_HUB -> {
            currentUser?.let { user ->
                MainHubScreen(
                    user = user,
                    userCars = userCars,
                    onNavigateToRaceSelect = { currentScreen = AppScreen.TRACK_SELECT },
                    onNavigateToGarage = { currentScreen = AppScreen.GARAGE },
                    onLogout = {
                        currentUser = null
                        currentScreen = AppScreen.AUTH_LOGIN
                    }
                )
            }
        }

        AppScreen.GARAGE -> {
            currentUser?.let { user ->
                GarageScreen(
                    user = user,
                    repository = repository,
                    onBackToHub = { currentScreen = AppScreen.MAIN_HUB },
                    onUserDataChanged = { refreshUserData() }
                )
            }
        }

        AppScreen.TRACK_SELECT -> {
            currentUser?.let { user ->
                TrackSelectScreen(
                    user = user,
                    repository = repository,
                    onTrackSelected = { track ->
                        selectedTrack = track
                        val activeCarState = userCars.firstOrNull { it.carId == user.selectedCarId }
                            ?: userCars.firstOrNull { it.isUnlocked }
                            ?: UserCarState(carId = "cyber_phantom", isUnlocked = true)
                        val carDef = CatalogData.getCarDef(activeCarState.carId)
                        val builtCar = repository.buildPlayerCar(carDef, activeCarState)

                        engine.setupRace(track, builtCar)
                        currentScreen = AppScreen.RACE_GAME
                    },
                    onBackToHub = { currentScreen = AppScreen.MAIN_HUB }
                )
            }
        }

        AppScreen.RACE_GAME, AppScreen.RACE_RESULTS -> {
            RaceCanvasScreen(
                engine = engine,
                onExitToMenu = {
                    refreshUserData()
                    currentScreen = AppScreen.MAIN_HUB
                },
                onGoToGarage = {
                    refreshUserData()
                    currentScreen = AppScreen.GARAGE
                },
                onSaveRaceResults = { coinsEarned, m1, m2, m3 ->
                    currentUser?.let { u ->
                        scope.launch {
                            repository.addCoins(u.id, coinsEarned)
                            repository.saveRace(
                                userId = u.id,
                                trackId = engine.track.id,
                                timeSec = engine.raceElapsedTimeSec,
                                score = engine.totalScore,
                                m1Done = m1,
                                m2Done = m2,
                                m3Done = m3
                            )
                            refreshUserData()
                        }
                    }
                }
            )
        }
    }
}

@Composable
fun RaceCanvasScreen(
    engine: NeonDriftEngine,
    onExitToMenu: () -> Unit,
    onGoToGarage: () -> Unit,
    onSaveRaceResults: (Int, Boolean, Boolean, Boolean) -> Unit
) {
    var frameTick by remember { mutableLongStateOf(0L) }
    var hasSavedResults by remember { mutableStateOf(false) }

    // Bucle de Físicas de 60 FPS
    LaunchedEffect(Unit) {
        var lastNanos = System.nanoTime()
        while (true) {
            withFrameNanos { nowNanos ->
                val dt = (nowNanos - lastNanos) / 1_000_000_000f
                lastNanos = nowNanos
                engine.update(dt)
                frameTick = nowNanos
            }
        }
    }

    // Auto-guardado de resultados en la Base de Datos al ganar o terminar tiempo
    LaunchedEffect(engine.gameState) {
        if ((engine.gameState == GameState.VICTORY || engine.gameState == GameState.TIME_OUT) && !hasSavedResults) {
            hasSavedResults = true
            val coins = engine.calculateCoinsEarned()
            val m1 = engine.completedMissionIds.contains(1)
            val m2 = engine.completedMissionIds.contains(2)
            val m3 = engine.completedMissionIds.contains(3)
            onSaveRaceResults(coins, m1, m2, m3)
        } else if (engine.gameState == GameState.RACING) {
            hasSavedResults = false
        }
    }

    // Objetos gráficos reusables en el pipeline de renderizado
    val carBodyPath = remember { Path() }
    val glassPath = remember { Path() }
    val spoilerPath = remember { Path() }
    val flamePath = remember { Path() }
    val aiBodyPath = remember { Path() }

    val speedPaint = remember {
        Paint().apply {
            color = android.graphics.Color.WHITE
            textSize = 58f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.LEFT
        }
    }
    val unitPaint = remember {
        Paint().apply {
            color = 0xFF00F0FF.toInt()
            textSize = 18f
            isAntiAlias = true
            typeface = Typeface.DEFAULT_BOLD
            textAlign = Paint.Align.LEFT
        }
    }
    val timerPaint = remember {
        Paint().apply {
            color = 0xFFFFD700.toInt()
            textSize = 34f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }
    val bannerPaint = remember {
        Paint().apply {
            color = 0xFF00FFCC.toInt()
            textSize = 36f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }
    val bannerSubPaint = remember {
        Paint().apply {
            color = android.graphics.Color.WHITE
            textSize = 22f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }
    val rankPaint = remember {
        Paint().apply {
            color = android.graphics.Color.WHITE
            textSize = 28f
            isAntiAlias = true
            typeface = Typeface.DEFAULT_BOLD
            textAlign = Paint.Align.CENTER
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(engine.track.skyColorTop))
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            if (frameTick == -1L) return@Canvas
            if (size.width <= 0f || size.height <= 0f) return@Canvas

            val centerX = size.width / 2f
            val centerY = size.height / 2f

            // 1. Rejilla Retro Synthwave en el suelo
            drawCyberGrid(size, engine.car)

            // 2. Cámara de persecución en 3ª persona centrada en el vehículo
            val carScreenAngleDeg = Math.toDegrees(engine.car.angle.toDouble()).toFloat()
            val cameraRotation = -carScreenAngleDeg - 90f

            rotate(cameraRotation, pivot = Offset(centerX, centerY)) {
                val worldOffsetX = centerX - engine.car.x
                val worldOffsetY = centerY - engine.car.y

                // 3. Trazado del Circuito Cerrado con Barreras Neón
                drawNeonCircuit(engine.track, worldOffsetX, worldOffsetY)

                // 4. Público Espectador animado en los laterales de la carretera
                drawSpectators(engine.spectators, worldOffsetX, worldOffsetY)

                // 5. Huellas de Neumático (Marcas de Derrape)
                for (i in 0 until engine.skidmarks.size) {
                    val s = engine.skidmarks[i]
                    drawLine(
                        color = s.color.copy(alpha = s.alpha),
                        start = Offset(s.startX + worldOffsetX, s.startY + worldOffsetY),
                        end = Offset(s.endX + worldOffsetX, s.endY + worldOffsetY),
                        strokeWidth = 7f,
                        cap = StrokeCap.Round
                    )
                }

                // 6. Partículas de Humo, Chispas de Barrera y Fuego
                for (i in 0 until engine.particles.size) {
                    val p = engine.particles[i]
                    val alpha = (p.life / p.maxLife).coerceIn(0f, 1f)
                    drawCircle(
                        color = p.color.copy(alpha = alpha),
                        radius = p.size * alpha,
                        center = Offset(p.x + worldOffsetX, p.y + worldOffsetY)
                    )
                }

                // 7. Rivales IA en Pista
                drawAIRacers(engine.aiRacers, worldOffsetX, worldOffsetY, aiBodyPath)
            }

            // 8. Superdeportivo del Jugador (Fijo en el centro de pantalla)
            drawPlayerCar(
                car = engine.car,
                centerX = centerX,
                centerY = centerY,
                bodyPath = carBodyPath,
                glassPath = glassPath,
                spoilerPath = spoilerPath,
                flamePath = flamePath
            )

            // 9. HUD Completo de Carrera
            if (engine.gameState == GameState.RACING) {
                drawDriftHUD(
                    engine = engine,
                    size = size,
                    speedPaint = speedPaint,
                    unitPaint = unitPaint,
                    timerPaint = timerPaint,
                    bannerPaint = bannerPaint,
                    bannerSubPaint = bannerSubPaint,
                    rankPaint = rankPaint
                )
            }
        }

        // Botón de Pausa / Salir en la esquina superior derecha
        IconButton(
            onClick = onExitToMenu,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 10.dp, end = 10.dp)
                .background(Color(0xFF0F172A).copy(alpha = 0.8f), CircleShape)
                .border(1.dp, Color(0xFF334155), CircleShape)
        ) {
            Text(text = "✕", color = Color.White, fontWeight = FontWeight.Black, fontSize = 16.sp)
        }

        // Controles Táctiles Horizontales (Ergonomía Móvil)
        if (engine.gameState == GameState.RACING) {
            GameTouchControls(engine = engine)
        }

        // Overlay de Inicio de Carrera
        if (engine.gameState == GameState.READY) {
            StartRaceOverlay(
                track = engine.track,
                onStart = { engine.startRace() }
            )
        }

        // Overlay de Resultados (Victoria o Tiempo Agotado)
        if (engine.gameState == GameState.VICTORY || engine.gameState == GameState.TIME_OUT) {
            RaceResultsOverlay(
                engine = engine,
                coinsEarned = engine.calculateCoinsEarned(),
                onRestart = {
                    engine.setupRace(engine.track, engine.car)
                    engine.startRace()
                },
                onGoToGarage = onGoToGarage,
                onExitToMenu = onExitToMenu
            )
        }
    }
}

// -------------------------------------------------------------
// PIPELINE DE RENDERIZADO GRÁFICO (60 FPS HARDWARE ACCELERATED)
// -------------------------------------------------------------

private fun DrawScope.drawCyberGrid(size: Size, car: Car) {
    val spacing = 75f
    val offsetX = (car.x * 0.15f) % spacing
    val offsetY = (car.y * 0.15f) % spacing

    val gridColor = Color(0xFF160A30).copy(alpha = 0.5f)
    var x = -offsetX
    while (x < size.width) {
        drawLine(gridColor, Offset(x, 0f), Offset(x, size.height), strokeWidth = 1f)
        x += spacing
    }
    var y = -offsetY
    while (y < size.height) {
        drawLine(gridColor, Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
        y += spacing
    }
}

private fun DrawScope.drawNeonCircuit(track: TrackDefinition, offX: Float, offY: Float) {
    val points = track.waypoints
    if (points.size < 3) return

    val trackWidth = track.trackWidth
    val primaryColor = Color(track.barrierPrimaryColor)
    val secondaryColor = Color(track.barrierSecondaryColor)

    // 1. Cinta de Asfalto Oscuro
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        drawLine(
            color = Color(0xFF090D17),
            start = Offset(p1.x + offX, p1.y + offY),
            end = Offset(p2.x + offX, p2.y + offY),
            strokeWidth = trackWidth,
            cap = StrokeCap.Round
        )
    }

    // 2. Línea Central Discontinua Neón
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        drawLine(
            color = primaryColor.copy(alpha = 0.35f),
            start = Offset(p1.x + offX, p1.y + offY),
            end = Offset(p2.x + offX, p2.y + offY),
            strokeWidth = 4f,
            cap = StrokeCap.Round
        )
    }

    // 3. Rieles de Barrera Neón Resplandeciente
    val halfW = trackWidth / 2f
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        val dx = p2.x - p1.x
        val dy = p2.y - p1.y
        val len = hypot(dx, dy)
        if (len == 0f) continue
        val perpX = -dy / len * halfW
        val perpY = dx / len * halfW

        // Barrera Izquierda
        drawLine(
            color = primaryColor,
            start = Offset(p1.x + perpX + offX, p1.y + perpY + offY),
            end = Offset(p2.x + perpX + offX, p2.y + perpY + offY),
            strokeWidth = 6.5f,
            cap = StrokeCap.Round
        )

        // Barrera Derecha
        drawLine(
            color = secondaryColor,
            start = Offset(p1.x - perpX + offX, p1.y - perpY + offY),
            end = Offset(p2.x - perpX + offX, p2.y - perpY + offY),
            strokeWidth = 6.5f,
            cap = StrokeCap.Round
        )

        // Puertas Láser de Checkpoints
        if (p1.isCheckpoint) {
            val isMeta = (i == 0)
            val gateColor = if (isMeta) Color(0xFFFFD700) else primaryColor
            drawLine(
                color = gateColor.copy(alpha = 0.85f),
                start = Offset(p1.x - perpX + offX, p1.y - perpY + offY),
                end = Offset(p1.x + perpX + offX, p1.y + perpY + offY),
                strokeWidth = 8f
            )
            drawCircle(gateColor, radius = 11f, center = Offset(p1.x - perpX + offX, p1.y - perpY + offY))
            drawCircle(gateColor, radius = 11f, center = Offset(p1.x + perpX + offX, p1.y + perpY + offY))
        }
    }
}

private fun DrawScope.drawSpectators(spectators: List<Spectator>, offX: Float, offY: Float) {
    for (spec in spectators) {
        val sx = spec.x + offX
        val sy = spec.y + offY + sin(spec.cheerOffset) * 5f

        // Cabeza y Torso
        drawCircle(spec.color.copy(alpha = 0.85f), radius = 5f, center = Offset(sx, sy - 8f))
        drawLine(spec.color.copy(alpha = 0.75f), Offset(sx, sy - 3f), Offset(sx, sy + 7f), strokeWidth = 3f)

        // Barra de Luz Neón (Glow stick)
        if (spec.hasGlowStick) {
            val glowArmX = sx + cos(spec.cheerOffset) * 8f
            val glowArmY = sy - 14f + sin(spec.cheerOffset) * 4f
            drawLine(spec.color, Offset(sx, sy - 2f), Offset(glowArmX, glowArmY), strokeWidth = 2.5f)
            drawCircle(spec.color, radius = 3f, center = Offset(glowArmX, glowArmY))
        }

        // Destello de Cámara / Flash
        if (spec.flashAlpha > 0f) {
            drawCircle(Color.White.copy(alpha = spec.flashAlpha), radius = 14f * spec.flashAlpha, center = Offset(sx, sy - 6f))
        }
    }
}

private fun DrawScope.drawAIRacers(
    aiRacers: List<AIRacer>,
    offX: Float,
    offY: Float,
    aiBodyPath: Path
) {
    for (ai in aiRacers) {
        val sx = ai.x + offX
        val sy = ai.y + offY
        val aiAngleDeg = Math.toDegrees(ai.angle.toDouble()).toFloat() + 90f

        rotate(aiAngleDeg, pivot = Offset(sx, sy)) {
            val w = 36f
            val l = 64f

            // Underglow del rival
            drawCircle(ai.bodyColor.copy(alpha = 0.35f), radius = 35f, center = Offset(sx, sy))

            // Chasis
            aiBodyPath.rewind()
            aiBodyPath.moveTo(sx - w * 0.34f, sy - l * 0.46f)
            aiBodyPath.lineTo(sx + w * 0.34f, sy - l * 0.46f)
            aiBodyPath.lineTo(sx + w * 0.48f, sy - l * 0.16f)
            aiBodyPath.lineTo(sx + w * 0.46f, sy + l * 0.44f)
            aiBodyPath.lineTo(sx - w * 0.46f, sy + l * 0.44f)
            aiBodyPath.lineTo(sx - w * 0.48f, sy - l * 0.16f)
            aiBodyPath.close()

            drawPath(aiBodyPath, color = Color(0xFF0F172A))
            drawPath(aiBodyPath, color = ai.bodyColor, style = Stroke(width = 3f))

            // Cabina oscura
            drawRoundRect(
                color = Color(0xFF00F0FF).copy(alpha = 0.6f),
                topLeft = Offset(sx - 10f, sy - 14f),
                size = Size(20f, 26f),
                cornerRadius = CornerRadius(4f, 4f)
            )

            // Alerón
            drawRoundRect(
                color = ai.bodyColor,
                topLeft = Offset(sx - 18f, sy + l * 0.38f),
                size = Size(36f, 6f),
                cornerRadius = CornerRadius(2f, 2f)
            )

            // Faros y luces traseras
            drawCircle(Color.White, radius = 3f, center = Offset(sx - 11f, sy - l * 0.4f))
            drawCircle(Color.White, radius = 3f, center = Offset(sx + 11f, sy - l * 0.4f))
            drawLine(Color(0xFFFF1744), Offset(sx - 12f, sy + l * 0.42f), Offset(sx + 12f, sy + l * 0.42f), strokeWidth = 2.5f)
        }
    }
}

private fun DrawScope.drawPlayerCar(
    car: Car,
    centerX: Float,
    centerY: Float,
    bodyPath: Path,
    glassPath: Path,
    spoilerPath: Path,
    flamePath: Path
) {
    // Underglow LED inferior
    val underglowColor = car.underglowColor
    if (underglowColor != Color.Transparent) {
        drawCircle(
            color = underglowColor.copy(alpha = 0.45f),
            radius = 58f,
            center = Offset(centerX, centerY)
        )
    }

    // Luces delanteras proyectadas en el asfalto
    drawCircle(
        color = Color(0xFF80D8FF).copy(alpha = 0.16f),
        radius = 160f,
        center = Offset(centerX, centerY - 105f)
    )

    // Inclinación visual por derrape
    val visualSlipDeg = Math.toDegrees(car.driftAngle.toDouble()).toFloat() * 0.8f

    rotate(visualSlipDeg, pivot = Offset(centerX, centerY)) {
        val w = car.width
        val l = car.length

        // Chasis del Bólido
        bodyPath.rewind()
        bodyPath.moveTo(centerX - w * 0.35f, centerY - l * 0.48f)
        bodyPath.lineTo(centerX + w * 0.35f, centerY - l * 0.48f)
        bodyPath.lineTo(centerX + w * 0.5f, centerY - l * 0.18f)
        bodyPath.lineTo(centerX + w * 0.48f, centerY + l * 0.45f)
        bodyPath.lineTo(centerX - w * 0.48f, centerY + l * 0.45f)
        bodyPath.lineTo(centerX - w * 0.5f, centerY - l * 0.18f)
        bodyPath.close()

        drawPath(bodyPath, color = Color(0xFF070C16))
        drawPath(bodyPath, color = car.bodyColor, style = Stroke(width = 3.5f))

        // Cúpula de la Cabina
        glassPath.rewind()
        glassPath.moveTo(centerX - w * 0.28f, centerY - l * 0.22f)
        glassPath.lineTo(centerX + w * 0.28f, centerY - l * 0.22f)
        glassPath.lineTo(centerX + w * 0.24f, centerY + l * 0.18f)
        glassPath.lineTo(centerX - w * 0.24f, centerY + l * 0.18f)
        glassPath.close()
        drawPath(glassPath, color = Color(0xFF00F0FF).copy(alpha = 0.85f))

        // Alerón Trasero
        spoilerPath.rewind()
        spoilerPath.moveTo(centerX - w * 0.52f, centerY + l * 0.42f)
        spoilerPath.lineTo(centerX + w * 0.52f, centerY + l * 0.42f)
        spoilerPath.lineTo(centerX + w * 0.46f, centerY + l * 0.48f)
        spoilerPath.lineTo(centerX - w * 0.46f, centerY + l * 0.48f)
        spoilerPath.close()
        drawPath(spoilerPath, color = car.bodyColor)

        // Faros y Luces Traseras
        drawCircle(Color.White, radius = 3.5f, center = Offset(centerX - w * 0.28f, centerY - l * 0.42f))
        drawCircle(Color.White, radius = 3.5f, center = Offset(centerX + w * 0.28f, centerY - l * 0.42f))
        drawLine(
            Color(0xFFFF1744),
            Offset(centerX - w * 0.38f, centerY + l * 0.45f),
            Offset(centerX + w * 0.38f, centerY + l * 0.45f),
            strokeWidth = 3f
        )

        // Llamas de Nitro Propulsor
        if (car.isNitroActive) {
            flamePath.rewind()
            flamePath.moveTo(centerX - 10f, centerY + l * 0.48f)
            flamePath.lineTo(centerX - 5f, centerY + l * 0.88f)
            flamePath.lineTo(centerX, centerY + l * 0.48f)
            flamePath.close()
            drawPath(flamePath, color = Color(0xFF00F0FF))

            flamePath.rewind()
            flamePath.moveTo(centerX, centerY + l * 0.48f)
            flamePath.lineTo(centerX + 5f, centerY + l * 0.88f)
            flamePath.lineTo(centerX + 10f, centerY + l * 0.48f)
            flamePath.close()
            drawPath(flamePath, color = Color(0xFFFF007F))
        }
    }
}

private fun DrawScope.drawDriftHUD(
    engine: NeonDriftEngine,
    size: Size,
    speedPaint: Paint,
    unitPaint: Paint,
    timerPaint: Paint,
    bannerPaint: Paint,
    bannerSubPaint: Paint,
    rankPaint: Paint
) {
    val nativeCanvas = drawContext.canvas.nativeCanvas
    val centerX = size.width / 2f
    val centerY = size.height / 2f

    // 1. Velocímetro y Arco de RPM (Superior Izquierda)
    val speedText = "${engine.currentSpeedKmh}"
    nativeCanvas.drawText(speedText, 48f, 95f, speedPaint)
    nativeCanvas.drawText("KM/H", 155f, 95f, unitPaint)

    val speedRatio = (engine.car.velocity / engine.car.maxSpeed).coerceIn(0f, 1f)
    drawArc(
        color = Color(0xFF1E293B),
        startAngle = 180f,
        sweepAngle = 180f,
        useCenter = false,
        topLeft = Offset(48f, 110f),
        size = Size(110f, 110f),
        style = Stroke(width = 8f)
    )
    drawArc(
        color = if (speedRatio > 0.85f) Color(0xFFFF1744) else Color(0xFF00F0FF),
        startAngle = 180f,
        sweepAngle = 180f * speedRatio,
        useCenter = false,
        topLeft = Offset(48f, 110f),
        size = Size(110f, 110f),
        style = Stroke(width = 8f)
    )

    // 2. Posición en Carrera (Badge 1ST, 2ND, 3RD, 4TH)
    val (posText, posColor) = when (engine.racePosition) {
        1 -> "1ST" to Color(0xFFFFD700)
        2 -> "2ND" to Color(0xFFE2E8F0)
        3 -> "3RD" to Color(0xFFCD7F32)
        else -> "4TH" to Color(0xFF00F0FF)
    }
    drawRoundRect(
        color = posColor.copy(alpha = 0.25f),
        topLeft = Offset(centerX - 165f, 40f),
        size = Size(65f, 55f),
        cornerRadius = CornerRadius(12f, 12f)
    )
    drawRoundRect(
        color = posColor,
        topLeft = Offset(centerX - 165f, 40f),
        size = Size(65f, 55f),
        cornerRadius = CornerRadius(12f, 12f),
        style = Stroke(width = 2f)
    )
    rankPaint.color = posColor.toArgb()
    nativeCanvas.drawText(posText, centerX - 132f, 78f, rankPaint)

    // 3. Cronómetro con Bonificación (Centro Superior)
    val timeInt = ceil(engine.timeLeft).toInt()
    timerPaint.color = if (timeInt <= 6) 0xFFFF1744.toInt() else 0xFFFFD700.toInt()
    drawRoundRect(
        color = Color(0xFF0F172A).copy(alpha = 0.88f),
        topLeft = Offset(centerX - 90f, 40f),
        size = Size(180f, 55f),
        cornerRadius = CornerRadius(14f, 14f)
    )
    nativeCanvas.drawText("${timeInt}s", centerX, 80f, timerPaint)

    // 4. Vuelta y Puntuación (Superior Derecha)
    val lapText = "VUELTA ${engine.currentLap}/${engine.track.totalLaps}"
    drawRoundRect(
        color = Color(0xFF1E1B4B).copy(alpha = 0.9f),
        topLeft = Offset(size.width - 240f, 40f),
        size = Size(170f, 65f),
        cornerRadius = CornerRadius(14f, 14f)
    )
    nativeCanvas.drawText(lapText, size.width - 225f, 70f, unitPaint)
    nativeCanvas.drawText("SCORE: ${engine.totalScore}", size.width - 225f, 95f, speedPaint.apply { textSize = 20f })

    // 5. Banner Flotante de Derrape
    if (engine.car.isDrifting && engine.currentDriftScoreDisplay > 0) {
        val multStr = String.format("%.1fx", engine.driftMultiplierDisplay)
        nativeCanvas.drawText("DRIFT $multStr  +${engine.currentDriftScoreDisplay}", centerX, centerY - 140f, bannerPaint)
    } else {
        engine.activeBanner?.let { banner ->
            bannerPaint.color = banner.color.toArgb()
            nativeCanvas.drawText(banner.text, centerX, centerY - 140f, bannerPaint)
            if (banner.subText.isNotEmpty()) {
                nativeCanvas.drawText(banner.subText, centerX, centerY - 105f, bannerSubPaint)
            }
        }
    }

    // 6. Barra de Nitro (Debajo del RPM)
    val nitroW = 160f
    val nitroRatio = (engine.nitroPercent / 100f).coerceIn(0f, 1f)
    drawRoundRect(
        color = Color(0xFF0F172A),
        topLeft = Offset(48f, 180f),
        size = Size(nitroW, 14f),
        cornerRadius = CornerRadius(7f, 7f)
    )
    drawRoundRect(
        brush = Brush.horizontalGradient(listOf(Color(0xFF00F0FF), Color(0xFFFF007F))),
        topLeft = Offset(48f, 180f),
        size = Size(nitroW * nitroRatio, 14f),
        cornerRadius = CornerRadius(7f, 7f)
    )
}

// -------------------------------------------------------------
// CONTROLES TÁCTILES HORIZONTALES (TOUCH SCREEN)
// -------------------------------------------------------------

@Composable
private fun GameTouchControls(engine: NeonDriftEngine) {
    Box(modifier = Modifier.fillMaxSize()) {
        // PANEL IZQUIERDO: GIRO (◄ / ►)
        Row(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 32.dp, bottom = 28.dp),
            horizontalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            TouchHoldButton(
                text = "◄ GIRAR",
                color = Color(0xFF00F0FF),
                onPressState = { isDown ->
                    engine.steerInput = if (isDown) -1f else 0f
                }
            )
            TouchHoldButton(
                text = "GIRAR ►",
                color = Color(0xFF00F0FF),
                onPressState = { isDown ->
                    engine.steerInput = if (isDown) 1f else 0f
                }
            )
        }

        // PANEL DERECHO: FRENO DE MANO DERRAPE Y NITRO BOOST
        Row(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 32.dp, bottom = 28.dp),
            horizontalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            TouchHoldButton(
                text = "DERRAPE",
                color = Color(0xFFFF007F),
                isPill = true,
                onPressState = { isDown ->
                    engine.driftInput = isDown
                }
            )
            TouchHoldButton(
                text = "NITRO",
                color = Color(0xFFFFD700),
                isPill = true,
                onPressState = { isDown ->
                    engine.nitroInput = isDown
                }
            )
        }
    }
}

@Composable
private fun TouchHoldButton(
    text: String,
    color: Color,
    isPill: Boolean = false,
    onPressState: (Boolean) -> Unit
) {
    var isPressed by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier
            .size(width = if (isPill) 110.dp else 95.dp, height = 70.dp)
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        isPressed = true
                        onPressState(true)
                        tryAwaitRelease()
                        isPressed = false
                        onPressState(false)
                    }
                )
            },
        shape = RoundedCornerShape(18.dp),
        color = if (isPressed) color else color.copy(alpha = 0.22f),
        border = androidx.compose.foundation.BorderStroke(2.dp, color)
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = text,
                color = if (isPressed) Color(0xFF03030C) else color,
                fontWeight = FontWeight.Black,
                fontSize = 13.sp,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

// -------------------------------------------------------------
// OVERLAYS (INICIO Y RESULTADOS DE CARRERA)
// -------------------------------------------------------------

@Composable
fun StartRaceOverlay(
    track: TrackDefinition,
    onStart: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.75f)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .width(440.dp)
                .border(2.dp, Color(track.barrierPrimaryColor), RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = track.name.uppercase(),
                    color = Color(track.barrierPrimaryColor),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "${track.totalLaps} VUELTAS • 3 RIVALES IA",
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = onStart,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(track.barrierPrimaryColor))
                ) {
                    Text(
                        text = "🏁 ¡INICIAR CARRERA!",
                        color = Color(0xFF03030C),
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

@Composable
fun RaceResultsOverlay(
    engine: NeonDriftEngine,
    coinsEarned: Int,
    onRestart: () -> Unit,
    onGoToGarage: () -> Unit,
    onExitToMenu: () -> Unit
) {
    val isWin = (engine.gameState == GameState.VICTORY)
    val posTitle = when (engine.racePosition) {
        1 -> "🏆 ¡1ER LUGAR - CAMPEÓN!"
        2 -> "🥈 ¡2º LUGAR - PODIO!"
        3 -> "🥉 ¡3ER LUGAR - PODIO!"
        else -> "4º LUGAR"
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.82f)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .width(520.dp)
                .border(2.dp, if (isWin) Color(0xFFFFD700) else Color(0xFFFF1744), RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0F1D)),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = if (isWin) posTitle else "¡TIEMPO AGOTADO!",
                    color = if (isWin) Color(0xFFFFD700) else Color(0xFFFF1744),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Resumen de Recompensas
                Surface(
                    color = Color(0xFF131B2E),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("PUNTOS", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text("${engine.totalScore}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("TIEMPO", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text(String.format("%.1fs", engine.raceElapsedTimeSec), color = Color(0xFF00FF66), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("CRÉDITOS", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text("+$coinsEarned 🪙", color = Color(0xFFFFD700), fontWeight = FontWeight.Black, fontSize = 16.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Misiones Cumplidas
                Text(
                    text = "MISIONES COMPLETADAS: ${engine.completedMissionIds.size} / 3",
                    color = Color(0xFF00F0FF),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Botones de Acción
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onRestart,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF))
                    ) {
                        Text("🔄 REINTENTAR", color = Color(0xFF03030C), fontWeight = FontWeight.Black, fontSize = 11.sp)
                    }

                    Button(
                        onClick = onGoToGarage,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF007F))
                    ) {
                        Text("🚗 GARAJE", color = Color.White, fontWeight = FontWeight.Black, fontSize = 11.sp)
                    }

                    OutlinedButton(
                        onClick = onExitToMenu,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF64748B))
                    ) {
                        Text("MENÚ", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}
