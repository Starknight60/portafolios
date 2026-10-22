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
    val boostPadPath = remember { Path() }
    val chevronPath = remember { Path() }
    val curbPath = remember { Path() }
    val gantryPath = remember { Path() }
    val propPath = remember { Path() }
    val headlightPath = remember { Path() }

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
    val billboardPaint = remember {
        Paint().apply {
            color = android.graphics.Color.WHITE
            textSize = 13f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }
    val gantryPaint = remember {
        Paint().apply {
            color = 0xFFFFD700.toInt()
            textSize = 17f
            isAntiAlias = true
            typeface = Typeface.DEFAULT_BOLD
            textAlign = Paint.Align.CENTER
        }
    }
    val gridBoxPaint = remember {
        Paint().apply {
            color = 0xFFFFFFFF.toInt()
            textSize = 18f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
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

            // 1. Rejilla Retro Synthwave en el suelo y horizonte atmosférico
            drawCyberGrid(size, engine.car, engine.track)

            // 2. Cámara de persecución en 3ª persona centrada en el vehículo
            val carScreenAngleDeg = Math.toDegrees(engine.car.angle.toDouble()).toFloat()
            val cameraRotation = -carScreenAngleDeg - 90f

            rotate(cameraRotation, pivot = Offset(centerX, centerY)) {
                val worldOffsetX = centerX - engine.car.x
                val worldOffsetY = centerY - engine.car.y

                // 3. Objetos de Arquitectura y Escenografía fuera de la pista
                drawSceneryObjects(engine.sceneryObjects, worldOffsetX, worldOffsetY, frameTick, billboardPaint, propPath)

                // 4. Calzada de Asfalto, Huellas de Rodadura, Líneas de Borde, Discontinuas y Parrilla de Meta
                drawTrackSurface(engine.track, worldOffsetX, worldOffsetY, gridBoxPaint)

                // 5. Pianos / Curbs Bicolores de Competición en Curvas
                drawTrackCurbs(engine.trackCurbs, worldOffsetX, worldOffsetY, curbPath)

                // 6. Chevrons / Flechas de Advertencia de Curva
                drawTrackChevrons(engine.trackChevrons, worldOffsetX, worldOffsetY, chevronPath, frameTick)

                // 7. Paneles Turbo Boost Pads en el asfalto
                drawTrackBoostPads(engine.trackBoostPads, worldOffsetX, worldOffsetY, boostPadPath, frameTick)

                // 8. Barreras Volumétricas Neón con Postes de Soporte
                drawTrackBarriers(engine.track, worldOffsetX, worldOffsetY, frameTick)

                // 9. Público Espectador animado en los laterales de la carretera
                drawSpectators(engine.spectators, worldOffsetX, worldOffsetY)

                // 10. Pórticos 3D de Meta y Checkpoints
                drawTrackGantries(engine.trackGantries, worldOffsetX, worldOffsetY, gantryPaint, gantryPath)

                // 11. Huellas de Neumático (Marcas de Derrape)
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

                // 12. Partículas de Humo, Chispas de Barrera y Fuego
                for (i in 0 until engine.particles.size) {
                    val p = engine.particles[i]
                    val alpha = (p.life / p.maxLife).coerceIn(0f, 1f)
                    drawCircle(
                        color = p.color.copy(alpha = alpha),
                        radius = p.size * alpha,
                        center = Offset(p.x + worldOffsetX, p.y + worldOffsetY)
                    )
                }

                // 13. Rivales IA en Pista (con faros delanteros en la carretera)
                drawAIRacers(engine.aiRacers, worldOffsetX, worldOffsetY, aiBodyPath, headlightPath)
            }

            // 14. Faros Delanteros del Coche del Jugador (proyectados sobre la carretera hacia adelante)
            drawPlayerHeadlights(centerX, centerY, headlightPath)

            // 15. Superdeportivo del Jugador (Fijo en el centro de pantalla)
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

private fun DrawScope.drawCyberGrid(size: Size, car: Car, track: TrackDefinition) {
    val spacing = 75f
    val offsetX = (car.x * 0.15f) % spacing
    val offsetY = (car.y * 0.15f) % spacing

    // 1. Resplandor Atmosférico en el fondo (Horizonte Neón)
    drawRect(
        brush = Brush.verticalGradient(
            colors = listOf(
                Color(track.skyColorTop),
                Color(track.skyColorBottom).copy(alpha = 0.5f)
            ),
            startY = 0f,
            endY = size.height
        ),
        topLeft = Offset.Zero,
        size = size
    )

    // 2. Rejilla Retro Synthwave en el suelo
    val gridColor = Color(track.barrierPrimaryColor).copy(alpha = 0.10f)
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

private fun DrawScope.drawSceneryObjects(
    objects: List<TrackSceneryObject>,
    offX: Float,
    offY: Float,
    frameTick: Long,
    billboardPaint: Paint,
    propPath: Path
) {
    for (i in objects.indices) {
        val obj = objects[i]
        val sx = obj.x + offX
        val sy = obj.y + offY

        rotate(obj.rotationDeg, pivot = Offset(sx, sy)) {
            when (obj.type) {
                SceneryType.CYBER_SKYSCRAPER -> {
                    // Edificio / Rascacielos Cyberpunk con Ventanas y Baliza
                    val left = sx - obj.width / 2f
                    val top = sy - obj.height / 2f
                    // Fachada oscura
                    drawRoundRect(
                        color = obj.primaryColor,
                        topLeft = Offset(left, top),
                        size = Size(obj.width, obj.height),
                        cornerRadius = CornerRadius(8f, 8f)
                    )
                    // Moldura de neón en tejado
                    drawRoundRect(
                        color = obj.secondaryColor.copy(alpha = 0.45f),
                        topLeft = Offset(left, top),
                        size = Size(obj.width, obj.height),
                        cornerRadius = CornerRadius(8f, 8f),
                        style = Stroke(width = 2f)
                    )
                    // Matriz de ventanas iluminadas
                    val rows = 5
                    val cols = 4
                    val cellW = (obj.width - 24f) / cols
                    val cellH = (obj.height - 28f) / rows
                    for (r in 0 until rows) {
                        for (c in 0 until cols) {
                            if ((r + c + i) % 3 != 0) {
                                val wx = left + 12f + c * cellW
                                val wy = top + 14f + r * cellH
                                val winColor = when ((r * 2 + c + i) % 4) {
                                    0 -> Color(0xFF00F0FF)
                                    1 -> Color(0xFFFF007F)
                                    2 -> Color(0xFFFFD700)
                                    else -> Color(0xFF00FF66)
                                }
                                drawRect(
                                    color = winColor.copy(alpha = 0.75f),
                                    topLeft = Offset(wx + 2f, wy + 2f),
                                    size = Size(cellW - 5f, cellH - 5f)
                                )
                            }
                        }
                    }
                    // Antena en la azotea con luz parpadeante
                    val spireX = sx
                    val spireY = top - 18f
                    drawLine(Color(0xFF64748B), Offset(sx, top), Offset(spireX, spireY), strokeWidth = 2.5f)
                    val beaconAlpha = (sin(frameTick * 0.000000007f + i) * 0.5f + 0.5f).coerceIn(0.1f, 1f)
                    drawCircle(Color(0xFFFF1744).copy(alpha = beaconAlpha), radius = 4f, center = Offset(spireX, spireY))
                }

                SceneryType.HOLO_BILLBOARD -> {
                    // Valla Publicitaria Holográfica Flotante
                    val left = sx - obj.width / 2f
                    val top = sy - obj.height / 2f
                    // Postes de soporte
                    drawLine(Color(0xFF334155), Offset(left + 12f, top + obj.height), Offset(left + 12f, top + obj.height + 25f), strokeWidth = 5f)
                    drawLine(Color(0xFF334155), Offset(left + obj.width - 12f, top + obj.height), Offset(left + obj.width - 12f, top + obj.height + 25f), strokeWidth = 5f)
                    // Pantalla oscura
                    drawRoundRect(
                        color = Color(0xFF030712).copy(alpha = 0.92f),
                        topLeft = Offset(left, top),
                        size = Size(obj.width, obj.height),
                        cornerRadius = CornerRadius(6f, 6f)
                    )
                    // Borde Neón Resplandeciente
                    drawRoundRect(
                        color = obj.primaryColor,
                        topLeft = Offset(left, top),
                        size = Size(obj.width, obj.height),
                        cornerRadius = CornerRadius(6f, 6f),
                        style = Stroke(width = 3f)
                    )
                    // Línea scanline horizontal
                    drawLine(obj.secondaryColor.copy(alpha = 0.6f), Offset(left + 8f, top + 8f), Offset(left + obj.width - 8f, top + 8f), strokeWidth = 1.5f)
                    // Texto holográfico de marca
                    billboardPaint.color = obj.secondaryColor.toArgb()
                    drawContext.canvas.nativeCanvas.drawText(obj.label, sx, sy + 5f, billboardPaint)
                }

                SceneryType.LIGHT_TOWER -> {
                    // Farola / Poste de Luz Futurista
                    val poleTop = sy - obj.height
                    drawLine(Color(0xFF475569), Offset(sx, sy), Offset(sx, poleTop), strokeWidth = 4f)
                    drawCircle(obj.primaryColor, radius = 6.5f, center = Offset(sx, poleTop))
                    drawCircle(Color.White, radius = 3.5f, center = Offset(sx, poleTop))
                    // Halo de luz proyectado hacia el asfalto
                    drawCircle(obj.primaryColor.copy(alpha = 0.16f), radius = 55f, center = Offset(sx, sy))
                }

                SceneryType.CANYON_CLIFF -> {
                    // Meseta / Formación Rocosa Poligonal de Cañón
                    val left = sx - obj.width / 2f
                    val top = sy - obj.height / 2f
                    propPath.rewind()
                    propPath.moveTo(left, top + obj.height * 0.3f)
                    propPath.lineTo(left + obj.width * 0.25f, top)
                    propPath.lineTo(left + obj.width * 0.85f, top + obj.height * 0.15f)
                    propPath.lineTo(left + obj.width, top + obj.height * 0.8f)
                    propPath.lineTo(left + obj.width * 0.7f, top + obj.height)
                    propPath.lineTo(left + obj.width * 0.1f, top + obj.height * 0.95f)
                    propPath.close()

                    drawPath(propPath, color = obj.primaryColor)
                    drawPath(propPath, color = obj.secondaryColor.copy(alpha = 0.5f), style = Stroke(width = 2.5f))
                    // Veta de plasma brillante
                    drawLine(
                        obj.secondaryColor.copy(alpha = 0.8f),
                        Offset(left + obj.width * 0.2f, top + obj.height * 0.4f),
                        Offset(left + obj.width * 0.8f, top + obj.height * 0.6f),
                        strokeWidth = 3f,
                        cap = StrokeCap.Round
                    )
                }

                SceneryType.QUANTUM_BEACON -> {
                    // Boya y Anillos de Resonancia Cuántica
                    drawCircle(obj.primaryColor, radius = 28f, center = Offset(sx, sy))
                    drawCircle(obj.secondaryColor, radius = 22f, center = Offset(sx, sy), style = Stroke(width = 3f))
                    drawCircle(Color.White, radius = 9f, center = Offset(sx, sy))
                    // Paneles solares laterales
                    drawRoundRect(
                        color = Color(0xFF0F172A),
                        topLeft = Offset(sx - obj.width / 2f, sy - 8f),
                        size = Size(obj.width, 16f),
                        cornerRadius = CornerRadius(4f, 4f)
                    )
                    drawRoundRect(
                        color = obj.secondaryColor,
                        topLeft = Offset(sx - obj.width / 2f, sy - 8f),
                        size = Size(obj.width, 16f),
                        cornerRadius = CornerRadius(4f, 4f),
                        style = Stroke(width = 1.5f)
                    )
                }

                SceneryType.STADIUM_STAND -> {
                    // Tribuna Elevada con Graderío y Pancartas
                    val left = sx - obj.width / 2f
                    val top = sy - obj.height / 2f
                    drawRoundRect(
                        color = obj.primaryColor,
                        topLeft = Offset(left, top),
                        size = Size(obj.width, obj.height),
                        cornerRadius = CornerRadius(6f, 6f)
                    )
                    drawRoundRect(
                        color = obj.secondaryColor.copy(alpha = 0.6f),
                        topLeft = Offset(left, top),
                        size = Size(obj.width, obj.height),
                        cornerRadius = CornerRadius(6f, 6f),
                        style = Stroke(width = 2.5f)
                    )
                    // Filas de público en graderío
                    val spectatorRows = 3
                    val cols = (obj.width / 18f).toInt()
                    val specColors = listOf(Color(0xFF00F0FF), Color(0xFFFF007F), Color(0xFFFFD700), Color(0xFF00FF66))
                    for (r in 0 until spectatorRows) {
                        val rowY = top + 15f + r * 18f
                        for (c in 0 until cols) {
                            val dotX = left + 14f + c * 16f
                            val dotColor = specColors[(r + c + i) % specColors.size]
                            drawCircle(dotColor.copy(alpha = 0.8f), radius = 3f, center = Offset(dotX, rowY))
                        }
                    }
                }
            }
        }
    }
}

private fun DrawScope.drawTrackSurface(
    track: TrackDefinition,
    offX: Float,
    offY: Float,
    gridBoxPaint: Paint
) {
    val points = track.waypoints
    if (points.size < 3) return

    val trackWidth = track.trackWidth
    val halfW = trackWidth / 2f
    val primaryColor = Color(track.barrierPrimaryColor)

    val asphaltColor = when (track.id) {
        "neo_tokyo" -> Color(0xFF090D18)
        "cyber_canyon" -> Color(0xFF130707)
        "quantum_highway" -> Color(0xFF050E1B)
        else -> Color(0xFF100518)
    }

    // 1. Arcén Exterior / Escapatoria de Grava Tecnológica
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        drawLine(
            color = Color(0xFF04060C),
            start = Offset(p1.x + offX, p1.y + offY),
            end = Offset(p2.x + offX, p2.y + offY),
            strokeWidth = trackWidth + 44f,
            cap = StrokeCap.Round
        )
    }

    // 2. Calzada Principal de Asfalto
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        drawLine(
            color = asphaltColor,
            start = Offset(p1.x + offX, p1.y + offY),
            end = Offset(p2.x + offX, p2.y + offY),
            strokeWidth = trackWidth,
            cap = StrokeCap.Round
        )
    }

    // 3. Huellas de Rodadura (Goma acumulada de neumáticos) y Líneas de Borde
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        val dx = p2.x - p1.x
        val dy = p2.y - p1.y
        val len = hypot(dx, dy)
        if (len == 0f) continue
        val perpX = -dy / len
        val perpY = dx / len

        // Huellas oscuras de derrape en los carriles izquierdo y derecho
        val wearDist = halfW * 0.44f
        drawLine(
            color = Color.Black.copy(alpha = 0.28f),
            start = Offset(p1.x + perpX * wearDist + offX, p1.y + perpY * wearDist + offY),
            end = Offset(p2.x + perpX * wearDist + offX, p2.y + perpY * wearDist + offY),
            strokeWidth = 24f,
            cap = StrokeCap.Round
        )
        drawLine(
            color = Color.Black.copy(alpha = 0.28f),
            start = Offset(p1.x - perpX * wearDist + offX, p1.y - perpY * wearDist + offY),
            end = Offset(p2.x - perpX * wearDist + offX, p2.y - perpY * wearDist + offY),
            strokeWidth = 24f,
            cap = StrokeCap.Round
        )

        // Líneas blancas continuas delimitadoras del borde del asfalto
        val edgeDist = halfW - 6f
        drawLine(
            color = Color.White.copy(alpha = 0.5f),
            start = Offset(p1.x + perpX * edgeDist + offX, p1.y + perpY * edgeDist + offY),
            end = Offset(p2.x + perpX * edgeDist + offX, p2.y + perpY * edgeDist + offY),
            strokeWidth = 3f,
            cap = StrokeCap.Round
        )
        drawLine(
            color = Color.White.copy(alpha = 0.5f),
            start = Offset(p1.x - perpX * edgeDist + offX, p1.y - perpY * edgeDist + offY),
            end = Offset(p2.x - perpX * edgeDist + offX, p2.y - perpY * edgeDist + offY),
            strokeWidth = 3f,
            cap = StrokeCap.Round
        )

        // 4. Línea Central Discontinua de Neón
        val dirX = dx / len
        val dirY = dy / len
        val dashLen = 36f
        val gapLen = 26f
        var step = 0f
        while (step < len) {
            val dEnd = min(step + dashLen, len)
            drawLine(
                color = primaryColor.copy(alpha = 0.65f),
                start = Offset(p1.x + dirX * step + offX, p1.y + dirY * step + offY),
                end = Offset(p1.x + dirX * dEnd + offX, p1.y + dirY * dEnd + offY),
                strokeWidth = 4.5f,
                cap = StrokeCap.Round
            )
            step += dashLen + gapLen
        }
    }

    // 5. Línea de Meta Ajedrezada y Cajones de Parrilla de Salida (en Waypoint 0)
    val p0 = points[0]
    val pNext = points[1]

    val fdx = pNext.x - p0.x
    val fdy = pNext.y - p0.y
    val flen = hypot(fdx, fdy)
    if (flen > 0f) {
        val fDirX = fdx / flen
        val fDirY = fdy / flen
        val fPerpX = -fDirY
        val fPerpY = fDirX

        // Damero Ajedrezado de Meta (2 filas de círculos/cuadrados blancos y negros)
        val numCols = 12
        val colWidth = (trackWidth - 24f) / numCols
        val rowHeight = 12f

        for (row in 0..1) {
            val rowOffset = (row - 0.5f) * rowHeight
            for (col in 0 until numCols) {
                val colOffset = -halfW + 12f + col * colWidth + colWidth / 2f
                val tileCenterX = p0.x + fDirX * rowOffset + fPerpX * colOffset + offX
                val tileCenterY = p0.y + fDirY * rowOffset + fPerpY * colOffset + offY
                val isWhite = (row + col) % 2 == 0
                val tileColor = if (isWhite) Color.White else Color(0xFF1E293B)

                drawCircle(tileColor, radius = colWidth * 0.42f, center = Offset(tileCenterX, tileCenterY))
            }
        }

        // Borde Dorado de Meta
        drawLine(
            color = Color(0xFFFFD700),
            start = Offset(p0.x + fPerpX * (halfW - 8f) - fDirX * 14f + offX, p0.y + fPerpY * (halfW - 8f) - fDirY * 14f + offY),
            end = Offset(p0.x - fPerpX * (halfW - 8f) - fDirX * 14f + offX, p0.y - fPerpY * (halfW - 8f) - fDirY * 14f + offY),
            strokeWidth = 3.5f
        )
        drawLine(
            color = Color(0xFFFFD700),
            start = Offset(p0.x + fPerpX * (halfW - 8f) + fDirX * 14f + offX, p0.y + fPerpY * (halfW - 8f) + fDirY * 14f + offY),
            end = Offset(p0.x - fPerpX * (halfW - 8f) + fDirX * 14f + offX, p0.y - fPerpY * (halfW - 8f) + fDirY * 14f + offY),
            strokeWidth = 3.5f
        )

        // 6. Cajones de Salida de la Parrilla (#1, #2, #3, #4)
        val gridPositions = listOf(-55f, -110f, -165f, -220f)
        for (idx in gridPositions.indices) {
            val distBack = gridPositions[idx]
            val gridSide = if (idx % 2 == 0) 1f else -1f
            val boxLateral = halfW * 0.38f * gridSide
            val boxCenterX = p0.x + fDirX * distBack + fPerpX * boxLateral + offX
            val boxCenterY = p0.y + fDirY * distBack + fPerpY * boxLateral + offY

            // Marco del cajón
            drawCircle(Color.White.copy(alpha = 0.55f), radius = 22f, center = Offset(boxCenterX, boxCenterY), style = Stroke(width = 2.5f))
            drawContext.canvas.nativeCanvas.drawText("#${idx + 1}", boxCenterX, boxCenterY + 6f, gridBoxPaint)
        }
    }
}

private fun DrawScope.drawTrackCurbs(
    curbs: List<TrackCurb>,
    offX: Float,
    offY: Float,
    curbPath: Path
) {
    for (curb in curbs) {
        val dx = curb.endX - curb.startX
        val dy = curb.endY - curb.startY
        val stripes = curb.stripes.coerceAtLeast(2)

        for (s in 0 until stripes) {
            val t0 = s.toFloat() / stripes
            val t1 = (s + 1).toFloat() / stripes

            val p0x = curb.startX + dx * t0 + offX
            val p0y = curb.startY + dy * t0 + offY
            val p1x = curb.startX + dx * t1 + offX
            val p1y = curb.startY + dy * t1 + offY

            val w0x = p0x + curb.perpX * curb.width
            val w0y = p0y + curb.perpY * curb.width
            val w1x = p1x + curb.perpX * curb.width
            val w1y = p1y + curb.perpY * curb.width

            curbPath.rewind()
            curbPath.moveTo(p0x, p0y)
            curbPath.lineTo(p1x, p1y)
            curbPath.lineTo(w1x, w1y)
            curbPath.lineTo(w0x, w0y)
            curbPath.close()

            val stripeColor = if (s % 2 == 0) curb.color1 else curb.color2
            drawPath(curbPath, color = stripeColor)
        }

        // Borde exterior reflectante del curb
        drawLine(
            color = Color.White.copy(alpha = 0.85f),
            start = Offset(curb.startX + curb.perpX * curb.width + offX, curb.startY + curb.perpY * curb.width + offY),
            end = Offset(curb.endX + curb.perpX * curb.width + offX, curb.endY + curb.perpY * curb.width + offY),
            strokeWidth = 2.5f,
            cap = StrokeCap.Round
        )
    }
}

private fun DrawScope.drawTrackChevrons(
    chevrons: List<TrackChevron>,
    offX: Float,
    offY: Float,
    chevronPath: Path,
    frameTick: Long
) {
    for (i in chevrons.indices) {
        val ch = chevrons[i]
        val cx = ch.x + offX
        val cy = ch.y + offY
        val pulse = (sin(frameTick * 0.000000008f + i * 0.5f) * 0.3f + 0.7f).coerceIn(0.2f, 1f)

        rotate(Math.toDegrees(ch.angleRad.toDouble()).toFloat(), pivot = Offset(cx, cy)) {
            for (k in -1..1) {
                chevronPath.rewind()
                val kx = cx + k * 14f
                chevronPath.moveTo(kx - 10f, cy - 14f)
                chevronPath.lineTo(kx + 6f, cy)
                chevronPath.lineTo(kx - 10f, cy + 14f)
                drawPath(
                    path = chevronPath,
                    color = ch.color.copy(alpha = pulse),
                    style = Stroke(width = 4.5f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
            }
        }
    }
}

private fun DrawScope.drawTrackBoostPads(
    boostPads: List<TrackBoostPad>,
    offX: Float,
    offY: Float,
    boostPadPath: Path,
    frameTick: Long
) {
    for (i in boostPads.indices) {
        val pad = boostPads[i]
        val bx = pad.x + offX
        val by = pad.y + offY

        rotate(Math.toDegrees(pad.angleRad.toDouble()).toFloat(), pivot = Offset(bx, by)) {
            val halfL = pad.length / 2f
            val halfW = pad.width / 2f

            // Halo suave en asfalto
            drawCircle(
                color = pad.color.copy(alpha = 0.25f),
                radius = pad.length * 0.6f,
                center = Offset(bx, by)
            )

            // Placa metálica oscura
            drawRoundRect(
                color = Color(0xFF09101F),
                topLeft = Offset(bx - halfL, by - halfW),
                size = Size(pad.length, pad.width),
                cornerRadius = CornerRadius(12f, 12f)
            )

            // Borde neón
            drawRoundRect(
                color = pad.color,
                topLeft = Offset(bx - halfL, by - halfW),
                size = Size(pad.length, pad.width),
                cornerRadius = CornerRadius(12f, 12f),
                style = Stroke(width = 3.5f)
            )

            // 3 Flechas animadas en movimiento continuo
            val phase = (frameTick * 0.000000006f) % 1f
            for (a in 0..2) {
                val arrowX = bx - halfL * 0.5f + ((a + phase) % 3f) * (pad.length * 0.28f)
                boostPadPath.rewind()
                boostPadPath.moveTo(arrowX - 12f, by - halfW * 0.55f)
                boostPadPath.lineTo(arrowX + 12f, by)
                boostPadPath.lineTo(arrowX - 12f, by + halfW * 0.55f)
                drawPath(
                    path = boostPadPath,
                    color = Color.White,
                    style = Stroke(width = 5.5f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
            }
        }
    }
}

private fun DrawScope.drawTrackBarriers(track: TrackDefinition, offX: Float, offY: Float, frameTick: Long) {
    val points = track.waypoints
    if (points.size < 3) return

    val trackWidth = track.trackWidth
    val halfW = trackWidth / 2f
    val primaryColor = Color(track.barrierPrimaryColor)
    val secondaryColor = Color(track.barrierSecondaryColor)

    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        val dx = p2.x - p1.x
        val dy = p2.y - p1.y
        val len = hypot(dx, dy)
        if (len == 0f) continue
        val perpX = -dy / len * halfW
        val perpY = dx / len * halfW

        val l1x = p1.x + perpX + offX
        val l1y = p1.y + perpY + offY
        val l2x = p2.x + perpX + offX
        val l2y = p2.y + perpY + offY

        val r1x = p1.x - perpX + offX
        val r1y = p1.y - perpY + offY
        val r2x = p2.x - perpX + offX
        val r2y = p2.y - perpY + offY

        // Barrera Izquierda: Resplandor + Tubo Neón + Núcleo Blanco
        drawLine(primaryColor.copy(alpha = 0.25f), Offset(l1x, l1y), Offset(l2x, l2y), strokeWidth = 14f, cap = StrokeCap.Round)
        drawLine(primaryColor, Offset(l1x, l1y), Offset(l2x, l2y), strokeWidth = 6.5f, cap = StrokeCap.Round)
        drawLine(Color.White.copy(alpha = 0.7f), Offset(l1x, l1y), Offset(l2x, l2y), strokeWidth = 1.8f, cap = StrokeCap.Round)

        // Barrera Derecha: Resplandor + Tubo Neón + Núcleo Blanco
        drawLine(secondaryColor.copy(alpha = 0.25f), Offset(r1x, r1y), Offset(r2x, r2y), strokeWidth = 14f, cap = StrokeCap.Round)
        drawLine(secondaryColor, Offset(r1x, r1y), Offset(r2x, r2y), strokeWidth = 6.5f, cap = StrokeCap.Round)
        drawLine(Color.White.copy(alpha = 0.7f), Offset(r1x, r1y), Offset(r2x, r2y), strokeWidth = 1.8f, cap = StrokeCap.Round)

        // Postes de Soporte Tecnológicos a intervalos
        val postStep = 75f
        var stepDist = 0f
        val dirX = (p2.x - p1.x) / len
        val dirY = (p2.y - p1.y) / len
        while (stepDist < len) {
            val plx = l1x + dirX * stepDist
            val ply = l1y + dirY * stepDist
            val prx = r1x + dirX * stepDist
            val pry = r1y + dirY * stepDist

            drawCircle(Color(0xFF0F172A), radius = 5f, center = Offset(plx, ply))
            drawCircle(primaryColor, radius = 3f, center = Offset(plx, ply))

            drawCircle(Color(0xFF0F172A), radius = 5f, center = Offset(prx, pry))
            drawCircle(secondaryColor, radius = 3f, center = Offset(prx, pry))

            stepDist += postStep
        }
    }
}

private fun DrawScope.drawTrackGantries(
    gantries: List<TrackGantry>,
    offX: Float,
    offY: Float,
    gantryPaint: Paint,
    gantryPath: Path
) {
    for (gantry in gantries) {
        val gx = gantry.x + offX
        val gy = gantry.y + offY

        rotate(Math.toDegrees(gantry.angleRad.toDouble()).toFloat(), pivot = Offset(gx, gy)) {
            val halfSpan = gantry.spanWidth / 2f

            // Viga Principal de Celosía que cruza la pista
            drawRoundRect(
                color = Color(0xFF0B132B),
                topLeft = Offset(gx - 12f, gy - halfSpan),
                size = Size(24f, gantry.spanWidth),
                cornerRadius = CornerRadius(4f, 4f)
            )
            // Rieles luminosos superior e inferior
            drawLine(gantry.primaryColor, Offset(gx - 12f, gy - halfSpan), Offset(gx - 12f, gy + halfSpan), strokeWidth = 3f)
            drawLine(gantry.primaryColor, Offset(gx + 12f, gy - halfSpan), Offset(gx + 12f, gy + halfSpan), strokeWidth = 3f)

            // Columnas de soporte (Pylons) a los lados con franjas diagonales de advertencia
            val pylonW = 22f
            val pylonH = 34f
            // Columna Izquierda
            drawRoundRect(Color(0xFF1E293B), topLeft = Offset(gx - pylonW / 2f, gy - halfSpan - pylonH / 2f), size = Size(pylonW, pylonH), cornerRadius = CornerRadius(4f, 4f))
            drawRoundRect(Color(0xFFFFD700), topLeft = Offset(gx - pylonW / 2f, gy - halfSpan - pylonH / 2f), size = Size(pylonW, pylonH), cornerRadius = CornerRadius(4f, 4f), style = Stroke(width = 2f))
            // Columna Derecha
            drawRoundRect(Color(0xFF1E293B), topLeft = Offset(gx - pylonW / 2f, gy + halfSpan - pylonH / 2f), size = Size(pylonW, pylonH), cornerRadius = CornerRadius(4f, 4f))
            drawRoundRect(Color(0xFFFFD700), topLeft = Offset(gx - pylonW / 2f, gy + halfSpan - pylonH / 2f), size = Size(pylonW, pylonH), cornerRadius = CornerRadius(4f, 4f), style = Stroke(width = 2f))

            // Cartel Digital Central de Información
            val signW = 32f
            val signH = 170f
            drawRoundRect(
                color = Color(0xFF030712).copy(alpha = 0.95f),
                topLeft = Offset(gx - signW / 2f, gy - signH / 2f),
                size = Size(signW, signH),
                cornerRadius = CornerRadius(6f, 6f)
            )
            drawRoundRect(
                color = gantry.primaryColor,
                topLeft = Offset(gx - signW / 2f, gy - signH / 2f),
                size = Size(signW, signH),
                cornerRadius = CornerRadius(6f, 6f),
                style = Stroke(width = 2.5f)
            )

            // Texto ("START / FINISH" o "CHECKPOINT")
            rotate(-90f, pivot = Offset(gx, gy)) {
                gantryPaint.color = gantry.primaryColor.toArgb()
                drawContext.canvas.nativeCanvas.drawText(gantry.title, gx, gy + 5f, gantryPaint)
            }

            // Luces de Semáforo de Salida (en la meta)
            if (gantry.isFinishLine) {
                for (li in -2..2) {
                    val ly = gy + li * 28f
                    val lColor = if (li == 2) Color(0xFF00FF66) else if (li == 1) Color(0xFFFFD700) else Color(0xFFFF1744)
                    drawCircle(lColor, radius = 5f, center = Offset(gx - 18f, ly))
                }
            }
        }
    }
}

private fun DrawScope.drawPlayerHeadlights(centerX: Float, centerY: Float, headlightPath: Path) {
    val hlY = centerY - 32f
    val hlLeftX = centerX - 12f
    val hlRightX = centerX + 12f

    // Haz suave izquierdo
    headlightPath.rewind()
    headlightPath.moveTo(hlLeftX, hlY)
    headlightPath.lineTo(hlLeftX - 60f, hlY - 240f)
    headlightPath.lineTo(hlLeftX + 22f, hlY - 240f)
    headlightPath.close()
    drawPath(headlightPath, color = Color(0xFFE0F7FA).copy(alpha = 0.15f))

    // Haz suave derecho
    headlightPath.rewind()
    headlightPath.moveTo(hlRightX, hlY)
    headlightPath.lineTo(hlRightX - 22f, hlY - 240f)
    headlightPath.lineTo(hlRightX + 60f, hlY - 240f)
    headlightPath.close()
    drawPath(headlightPath, color = Color(0xFFE0F7FA).copy(alpha = 0.15f))

    // Núcleo brillante
    headlightPath.rewind()
    headlightPath.moveTo(hlLeftX, hlY)
    headlightPath.lineTo(hlLeftX - 25f, hlY - 120f)
    headlightPath.lineTo(hlLeftX + 10f, hlY - 120f)
    headlightPath.close()
    drawPath(headlightPath, color = Color.White.copy(alpha = 0.28f))

    headlightPath.rewind()
    headlightPath.moveTo(hlRightX, hlY)
    headlightPath.lineTo(hlRightX - 10f, hlY - 120f)
    headlightPath.lineTo(hlRightX + 25f, hlY - 120f)
    headlightPath.close()
    drawPath(headlightPath, color = Color.White.copy(alpha = 0.28f))
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
    aiBodyPath: Path,
    headlightPath: Path
) {
    for (ai in aiRacers) {
        val sx = ai.x + offX
        val sy = ai.y + offY
        val aiAngleDeg = Math.toDegrees(ai.angle.toDouble()).toFloat() + 90f

        rotate(aiAngleDeg, pivot = Offset(sx, sy)) {
            val w = 36f
            val l = 64f

            // Faros delanteros proyectados sobre el asfalto hacia adelante
            headlightPath.rewind()
            headlightPath.moveTo(sx - 11f, sy - l * 0.4f)
            headlightPath.lineTo(sx - 45f, sy - l * 0.4f - 180f)
            headlightPath.lineTo(sx + 15f, sy - l * 0.4f - 180f)
            headlightPath.close()
            drawPath(headlightPath, color = Color(0xFFE0F7FA).copy(alpha = 0.14f))

            headlightPath.rewind()
            headlightPath.moveTo(sx + 11f, sy - l * 0.4f)
            headlightPath.lineTo(sx - 15f, sy - l * 0.4f - 180f)
            headlightPath.lineTo(sx + 45f, sy - l * 0.4f - 180f)
            headlightPath.close()
            drawPath(headlightPath, color = Color(0xFFE0F7FA).copy(alpha = 0.14f))

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

        // Alerón Trasero según personalización
        spoilerPath.rewind()
        when (car.spoilerStyle) {
            1 -> {
                // Alerón GT Doble Ala (elevado con placas laterales en rimColor)
                spoilerPath.moveTo(centerX - w * 0.58f, centerY + l * 0.40f)
                spoilerPath.lineTo(centerX + w * 0.58f, centerY + l * 0.40f)
                spoilerPath.lineTo(centerX + w * 0.54f, centerY + l * 0.48f)
                spoilerPath.lineTo(centerX - w * 0.54f, centerY + l * 0.48f)
                spoilerPath.close()
                drawPath(spoilerPath, color = car.bodyColor)
                drawCircle(car.rimColor, radius = 3.5f, center = Offset(centerX - w * 0.58f, centerY + l * 0.44f))
                drawCircle(car.rimColor, radius = 3.5f, center = Offset(centerX + w * 0.58f, centerY + l * 0.44f))
            }
            2 -> {
                // Cyber Blade (punta afilada)
                spoilerPath.moveTo(centerX - w * 0.55f, centerY + l * 0.50f)
                spoilerPath.lineTo(centerX, centerY + l * 0.38f)
                spoilerPath.lineTo(centerX + w * 0.55f, centerY + l * 0.50f)
                spoilerPath.lineTo(centerX, centerY + l * 0.44f)
                spoilerPath.close()
                drawPath(spoilerPath, color = car.bodyColor)
            }
            else -> {
                spoilerPath.moveTo(centerX - w * 0.52f, centerY + l * 0.42f)
                spoilerPath.lineTo(centerX + w * 0.52f, centerY + l * 0.42f)
                spoilerPath.lineTo(centerX + w * 0.46f, centerY + l * 0.48f)
                spoilerPath.lineTo(centerX - w * 0.46f, centerY + l * 0.48f)
                spoilerPath.close()
                drawPath(spoilerPath, color = car.bodyColor)
            }
        }

        // Llantas Neón en los 4 neumáticos
        drawCircle(car.rimColor, radius = 3.2f, center = Offset(centerX - w * 0.42f, centerY - l * 0.28f))
        drawCircle(car.rimColor, radius = 3.2f, center = Offset(centerX + w * 0.42f, centerY - l * 0.28f))
        drawCircle(car.rimColor, radius = 3.2f, center = Offset(centerX - w * 0.42f, centerY + l * 0.28f))
        drawCircle(car.rimColor, radius = 3.2f, center = Offset(centerX + w * 0.42f, centerY + l * 0.28f))

        // Faros y Luces Traseras
        drawCircle(Color.White, radius = 3.5f, center = Offset(centerX - w * 0.28f, centerY - l * 0.42f))
        drawCircle(Color.White, radius = 3.5f, center = Offset(centerX + w * 0.28f, centerY - l * 0.42f))
        drawLine(
            Color(0xFFFF1744),
            Offset(centerX - w * 0.38f, centerY + l * 0.45f),
            Offset(centerX + w * 0.38f, centerY + l * 0.45f),
            strokeWidth = 3f
        )

        // Llamas de Nitro Propulsor con color de estela personalizado
        if (car.isNitroActive) {
            val nitroFlameColor = car.trailFxColor
            flamePath.rewind()
            flamePath.moveTo(centerX - 10f, centerY + l * 0.48f)
            flamePath.lineTo(centerX - 5f, centerY + l * 0.88f)
            flamePath.lineTo(centerX, centerY + l * 0.48f)
            flamePath.close()
            drawPath(flamePath, color = nitroFlameColor)

            flamePath.rewind()
            flamePath.moveTo(centerX, centerY + l * 0.48f)
            flamePath.lineTo(centerX + 5f, centerY + l * 0.88f)
            flamePath.lineTo(centerX + 10f, centerY + l * 0.48f)
            flamePath.close()
            drawPath(flamePath, color = Color.White)
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
