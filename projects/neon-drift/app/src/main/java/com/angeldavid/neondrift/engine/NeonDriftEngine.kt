@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.engine

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import com.angeldavid.neondrift.data.CatalogData
import com.angeldavid.neondrift.model.*
import kotlin.math.*
import kotlin.random.Random

class NeonDriftEngine(
    context: Context,
    val soundManager: DriftSoundManager
) {
    // Current Active Track Definition
    var track: TrackDefinition = CatalogData.TRACKS[0]
        private set

    // Observable Compose States for HUD & Overlays
    var gameState: GameState by mutableStateOf(GameState.READY)
        internal set

    var totalScore: Int by mutableIntStateOf(0)
        private set

    var currentLap: Int by mutableIntStateOf(1)
        private set

    var timeLeft: Float by mutableFloatStateOf(40f)
        private set

    var currentSpeedKmh: Int by mutableIntStateOf(0)
        private set

    var currentDriftScoreDisplay: Int by mutableIntStateOf(0)
        private set

    var driftMultiplierDisplay: Float by mutableFloatStateOf(1.0f)
        private set

    var nitroPercent: Float by mutableFloatStateOf(100f)
        private set

    var racePosition: Int by mutableIntStateOf(1)
        private set

    var isHardMode: Boolean by mutableStateOf(false)
        internal set

    var activeBanner: FloatingBanner? by mutableStateOf(null)
        private set

    // Player Car & Collections
    var car = Car()
    val particles = ArrayList<Particle>(110)
    val skidmarks = ArrayList<Skidmark>(140)
    val aiRacers = ArrayList<AIRacer>(3)
    val spectators = ArrayList<Spectator>(35)

    // Elementos de Detalle del Circuito (Pistas Detalladas)
    val sceneryObjects = ArrayList<TrackSceneryObject>(70)
    val trackCurbs = ArrayList<TrackCurb>(50)
    val trackChevrons = ArrayList<TrackChevron>(40)
    val trackBoostPads = ArrayList<TrackBoostPad>(8)
    val trackGantries = ArrayList<TrackGantry>(8)
    private var boostCooldownTimer = 0f

    // Player Touch Controls state
    var steerInput = 0f // -1f = Left, +1f = Right
    var driftInput = false
    var nitroInput = false

    // Race Tracking & Mission Metrics
    var raceStartTime = 0L
    var raceElapsedTimeSec = 0f
    var nextCheckpoint = 1
    var barrierHitsCount = 0
    var maxDriftMultiplierReached = 1.0f
    var maxSpeedReachedKmh = 0
    var completedMissionIds = mutableListOf<Int>()

    private var currentDriftPoints = 0f
    private var currentDriftMultiplier = 1.0f
    private var lastSkidLeftX = 0f
    private var lastSkidLeftY = 0f
    private var lastSkidRightX = 0f
    private var lastSkidRightY = 0f

    /**
     * Prepara e inicializa la carrera con el circuito seleccionado, el coche del jugador y dificultad.
     */
    fun setupRace(selectedTrack: TrackDefinition, playerCar: Car, hardMode: Boolean = false) {
        this.track = selectedTrack
        this.car = playerCar
        this.isHardMode = hardMode

        // Reset de métricas
        totalScore = 0
        currentLap = 1
        timeLeft = if (hardMode) (26f + selectedTrack.baseTimeBonus * 0.65f) else (38f + selectedTrack.baseTimeBonus)
        nextCheckpoint = 1
        currentDriftPoints = 0f
        currentDriftMultiplier = 1.0f
        maxDriftMultiplierReached = 1.0f
        maxSpeedReachedKmh = 0
        barrierHitsCount = 0
        completedMissionIds.clear()

        // Colocar coche del jugador en la parrilla de salida
        val startPoint = track.waypoints[0]
        val nextPoint = track.waypoints[1]
        val initialAngle = atan2(nextPoint.y - startPoint.y, nextPoint.x - startPoint.x)

        car.x = startPoint.x - 30f
        car.y = startPoint.y
        car.angle = initialAngle
        car.velocity = 0f
        car.angularVelocity = 0f
        car.driftAngle = 0f
        car.isDrifting = false
        car.nitro = 100f

        particles.clear()
        skidmarks.clear()

        // Inicializar 3 Rivales IA en posiciones escalonadas de la parrilla (espaciado ancho)
        aiRacers.clear()
        val aiConfigs = listOf(
            Triple("KAGE-01", Color(0xFFFF1744), "#01"),
            Triple("VIPER-X", Color(0xFF00FF66), "#07"),
            Triple("NOVA-7", Color(0xFFFF9100), "#99")
        )

        val perpAngle = initialAngle + Math.PI.toFloat() / 2f
        for (i in aiConfigs.indices) {
            val (name, color, tag) = aiConfigs[i]
            val forwardOffset = (i + 1) * -45f
            val lateralOffset = if (i % 2 == 0) 55f else -55f
            val aiX = startPoint.x + cos(initialAngle) * forwardOffset + cos(perpAngle) * lateralOffset
            val aiY = startPoint.y + sin(initialAngle) * forwardOffset + sin(perpAngle) * lateralOffset

            val speedBase = if (hardMode) 0.98f else 0.86f
            val speedStep = if (hardMode) 0.05f else 0.04f
            val accelBase = if (hardMode) 1.15f else 0.88f
            val accelStep = if (hardMode) 0.06f else 0.05f

            val aiSpeed = car.maxSpeed * (speedBase + i * speedStep)
            val aiAccel = car.acceleration * (accelBase + i * accelStep)

            aiRacers.add(
                AIRacer(
                    id = "ai_$i",
                    name = name,
                    x = aiX,
                    y = aiY,
                    angle = initialAngle,
                    velocity = 0f,
                    maxSpeed = aiSpeed,
                    accelRate = aiAccel,
                    bodyColor = color,
                    numberTag = tag,
                    currentWaypointIndex = 1,
                    lap = 1
                )
            )
        }

        // Generar público espectador neón en los exteriores de la pista
        generateSpectators()

        // Generar detalles arquitectónicos y de asfalto del circuito
        generateTrackFeatures()

        val modeLabel = if (hardMode) "🔥 MODO DIFÍCIL (x1.85 🪙)" else "¡LISTOS PARA CORRER!"
        val subLabel = if (hardMode) "CRONÓMETRO IMPLACABLE • RIVALES HARDCORE" else "MANTÉN EL CONTROL EN LAS CURVAS"
        val bannerColor = if (hardMode) Color(0xFFFF5722) else Color(0xFF00F0FF)
        activeBanner = FloatingBanner(modeLabel, subLabel, bannerColor)
        gameState = GameState.READY
    }

    private fun generateSpectators() {
        spectators.clear()
        val numWaypoints = track.waypoints.size
        val spectatorColors = listOf(
            Color(0xFF00F0FF),
            Color(0xFFFF007F),
            Color(0xFF00FF66),
            Color(0xFFFFD700),
            Color(0xFFD500F9)
        )

        for (i in 0 until numWaypoints) {
            val p1 = track.waypoints[i]
            val p2 = track.waypoints[(i + 1) % numWaypoints]
            val angle = atan2(p2.y - p1.y, p2.x - p1.x)
            val perpAngle = angle + Math.PI.toFloat() / 2f

            // Generar 2 a 3 espectadores a ambos lados de cada tramo fuera de las barreras
            val sideDistance = (track.trackWidth / 2f) + 40f
            for (j in 0 until 2) {
                val side = if (j % 2 == 0) 1f else -1f
                val jitter = Random.nextFloat() * 30f - 15f
                val specX = p1.x + cos(perpAngle) * (sideDistance * side) + cos(angle) * jitter
                val specY = p1.y + sin(perpAngle) * (sideDistance * side) + sin(angle) * jitter

                spectators.add(
                    Spectator(
                        x = specX,
                        y = specY,
                        color = spectatorColors.random(),
                        cheerSpeed = Random.nextFloat() * 4f + 2.5f,
                        hasGlowStick = Random.nextBoolean()
                    )
                )
            }
        }
    }

    private fun generateTrackFeatures() {
        sceneryObjects.clear()
        trackCurbs.clear()
        trackChevrons.clear()
        trackBoostPads.clear()
        trackGantries.clear()

        val points = track.waypoints
        val numPoints = points.size
        if (numPoints < 3) return
        val halfW = track.trackWidth / 2f
        val primaryColor = Color(track.barrierPrimaryColor)
        val secondaryColor = Color(track.barrierSecondaryColor)

        // 1. Pórticos 3D de Meta y Checkpoints (Gantries)
        for (i in points.indices) {
            val p = points[i]
            if (p.isCheckpoint) {
                val nextP = points[(i + 1) % numPoints]
                val angle = atan2(nextP.y - p.y, nextP.x - p.x)
                val isMeta = (i == 0)
                trackGantries.add(
                    TrackGantry(
                        x = p.x,
                        y = p.y,
                        angleRad = angle,
                        spanWidth = track.trackWidth + 36f,
                        isFinishLine = isMeta,
                        title = if (isMeta) "START / FINISH" else "CHECKPOINT",
                        primaryColor = if (isMeta) Color(0xFFFFD700) else primaryColor
                    )
                )
            }
        }

        // 2. Curbs (Pianos de Circuito Bicolores) y Chevrons en Curvas
        for (i in points.indices) {
            val prevP = points[(i + numPoints - 1) % numPoints]
            val currP = points[i]
            val nextP = points[(i + 1) % numPoints]

            val inAngle = atan2(currP.y - prevP.y, currP.x - prevP.x)
            val outAngle = atan2(nextP.y - currP.y, nextP.x - currP.x)

            var diff = outAngle - inAngle
            while (diff > Math.PI) diff -= (2.0 * Math.PI).toFloat()
            while (diff < -Math.PI) diff += (2.0 * Math.PI).toFloat()

            // Si hay curvatura notable
            if (abs(diff) > 0.22f) {
                val isTurnRight = diff > 0f
                val innerSide = if (isTurnRight) -1f else 1f
                val outerSide = -innerSide

                val midAngle = inAngle + diff / 2f
                val perpMidX = -sin(midAngle)
                val perpMidY = cos(midAngle)

                // Curb interior en el vértice
                val curbDist = halfW - 2f
                val curbStartX = currP.x - cos(inAngle) * 55f + perpMidX * (curbDist * innerSide)
                val curbStartY = currP.y - sin(inAngle) * 55f + perpMidY * (curbDist * innerSide)
                val curbEndX = currP.x + cos(outAngle) * 55f + perpMidX * (curbDist * innerSide)
                val curbEndY = currP.y + sin(outAngle) * 55f + perpMidY * (curbDist * innerSide)

                val (c1, c2) = when (track.id) {
                    "neo_tokyo" -> Pair(Color(0xFFFF007F), Color.White)
                    "cyber_canyon" -> Pair(Color(0xFFFF5722), Color.White)
                    "quantum_highway" -> Pair(Color(0xFF00F0FF), Color.White)
                    else -> Pair(Color(0xFFFFD700), Color(0xFFBF00FF))
                }

                trackCurbs.add(
                    TrackCurb(
                        startX = curbStartX,
                        startY = curbStartY,
                        endX = curbEndX,
                        endY = curbEndY,
                        perpX = perpMidX * innerSide,
                        perpY = perpMidY * innerSide,
                        width = 24f,
                        color1 = c1,
                        color2 = c2,
                        stripes = 8
                    )
                )

                // Chevrons de neón en la barrera exterior si la curva es pronunciada
                if (abs(diff) > 0.38f) {
                    val chevronDist = halfW + 12f
                    for (ch in -1..1) {
                        val chAngle = midAngle + ch * 0.16f
                        val chPerpX = -sin(chAngle) * outerSide
                        val chPerpY = cos(chAngle) * outerSide
                        val chX = currP.x + chPerpX * chevronDist + cos(chAngle) * (ch * 34f)
                        val chY = currP.y + chPerpY * chevronDist + sin(chAngle) * (ch * 34f)
                        trackChevrons.add(
                            TrackChevron(
                                x = chX,
                                y = chY,
                                angleRad = chAngle + (if (isTurnRight) 0.45f else -0.45f),
                                color = if (isTurnRight) secondaryColor else primaryColor
                            )
                        )
                    }
                }
            }
        }

        // 3. Paneles Turbo Boost Pads en rectas largas
        for (i in points.indices) {
            val p1 = points[i]
            val p2 = points[(i + 1) % numPoints]
            val segLen = hypot(p2.x - p1.x, p2.y - p1.y)
            if (segLen > 520f && i != 0) {
                val segAngle = atan2(p2.y - p1.y, p2.x - p1.x)
                val midX = (p1.x + p2.x) / 2f
                val midY = (p1.y + p2.y) / 2f
                trackBoostPads.add(
                    TrackBoostPad(
                        x = midX,
                        y = midY,
                        angleRad = segAngle,
                        width = 80f,
                        length = 110f,
                        color = Color(0xFF00FFCC)
                    )
                )
            }
        }

        // 4. Elementos Temáticos de Escenario por Circuito
        generateThematicScenery()
    }

    private fun generateThematicScenery() {
        val points = track.waypoints
        val numPoints = points.size
        val halfW = track.trackWidth / 2f
        val primaryColor = Color(track.barrierPrimaryColor)
        val secondaryColor = Color(track.barrierSecondaryColor)

        val billboardTexts = when (track.id) {
            "neo_tokyo" -> listOf("NEON DRIFT", "CYBER TOKYO", "TURBO 2099", "NITRO-X", "HYPERION GT")
            "cyber_canyon" -> listOf("PLASMA GORGE", "NITRO RIDGE", "OUTLAW DRIFT", "DESERT APEX", "HYPERION")
            "quantum_highway" -> listOf("QUANTUM SPEED", "ORBITAL RUN", "HYPER DRIVE", "ION BOOST", "WARP CORE")
            else -> listOf("OMEGA GP", "DRIFT KING", "COLOSSEUM 2099", "FINAL LAP", "NITRO FURY")
        }

        for (i in points.indices) {
            val p = points[i]
            val nextP = points[(i + 1) % numPoints]
            val segAngle = atan2(nextP.y - p.y, nextP.x - p.x)
            val perpAngle = segAngle + Math.PI.toFloat() / 2f
            val side = if (i % 2 == 0) 1f else -1f

            // A) Postes de Luz / Farolas Tecnológicas
            val lightDist = halfW + 36f
            val lx = p.x + cos(perpAngle) * (lightDist * side)
            val ly = p.y + sin(perpAngle) * (lightDist * side)
            sceneryObjects.add(
                TrackSceneryObject(
                    type = SceneryType.LIGHT_TOWER,
                    x = lx,
                    y = ly,
                    width = 18f,
                    height = 36f,
                    rotationDeg = Math.toDegrees(perpAngle.toDouble()).toFloat() + (if (side > 0) 180f else 0f),
                    primaryColor = primaryColor,
                    secondaryColor = Color.White
                )
            )

            // B) Vallas Publicitarias Holográficas Flotantes en rectas
            val segLen = hypot(nextP.x - p.x, nextP.y - p.y)
            if (segLen > 380f) {
                val bx = (p.x + nextP.x) / 2f + cos(perpAngle) * ((halfW + 68f) * -side)
                val by = (p.y + nextP.y) / 2f + sin(perpAngle) * ((halfW + 68f) * -side)
                val labelText = billboardTexts[i % billboardTexts.size]
                sceneryObjects.add(
                    TrackSceneryObject(
                        type = SceneryType.HOLO_BILLBOARD,
                        x = bx,
                        y = by,
                        width = 110f,
                        height = 42f,
                        rotationDeg = Math.toDegrees(segAngle.toDouble()).toFloat(),
                        primaryColor = primaryColor,
                        secondaryColor = secondaryColor,
                        label = labelText
                    )
                )
            }

            // C) Megaestructuras de Fondo según el circuito
            val deepDist = halfW + 180f + (i % 3) * 60f
            val dx = p.x + cos(perpAngle) * (deepDist * side)
            val dy = p.y + sin(perpAngle) * (deepDist * side)

            when (track.id) {
                "neo_tokyo" -> {
                    // Rascacielos Futuristas con Ventanas de Neón
                    val bWidth = 110f + (i % 4) * 25f
                    val bHeight = 140f + (i % 5) * 30f
                    sceneryObjects.add(
                        TrackSceneryObject(
                            type = SceneryType.CYBER_SKYSCRAPER,
                            x = dx,
                            y = dy,
                            width = bWidth,
                            height = bHeight,
                            rotationDeg = Math.toDegrees(segAngle.toDouble()).toFloat(),
                            primaryColor = Color(0xFF0F172A),
                            secondaryColor = if (i % 2 == 0) primaryColor else secondaryColor,
                            detailLevel = (i % 3) + 1
                        )
                    )
                }
                "cyber_canyon" -> {
                    // Formaciones Rocosas y Mesetas de Plasma
                    val mWidth = 140f + (i % 3) * 35f
                    val mHeight = 110f + (i % 4) * 25f
                    sceneryObjects.add(
                        TrackSceneryObject(
                            type = SceneryType.CANYON_CLIFF,
                            x = dx,
                            y = dy,
                            width = mWidth,
                            height = mHeight,
                            rotationDeg = Math.toDegrees(segAngle.toDouble()).toFloat(),
                            primaryColor = Color(0xFF260D0D),
                            secondaryColor = primaryColor,
                            detailLevel = (i % 3) + 1
                        )
                    )
                }
                "quantum_highway" -> {
                    // Torres y Boyas de Energía Cuántica Orbital
                    val qWidth = 90f + (i % 3) * 20f
                    val qHeight = 130f + (i % 3) * 30f
                    sceneryObjects.add(
                        TrackSceneryObject(
                            type = SceneryType.QUANTUM_BEACON,
                            x = dx,
                            y = dy,
                            width = qWidth,
                            height = qHeight,
                            rotationDeg = Math.toDegrees(segAngle.toDouble()).toFloat(),
                            primaryColor = Color(0xFF0A1E3F),
                            secondaryColor = primaryColor,
                            detailLevel = (i % 3) + 1
                        )
                    )
                }
                else -> {
                    // Tribunas de Estadio con Público y Pancartas
                    val sWidth = 170f + (i % 3) * 30f
                    val sHeight = 90f + (i % 2) * 25f
                    sceneryObjects.add(
                        TrackSceneryObject(
                            type = SceneryType.STADIUM_STAND,
                            x = dx,
                            y = dy,
                            width = sWidth,
                            height = sHeight,
                            rotationDeg = Math.toDegrees(segAngle.toDouble()).toFloat(),
                            primaryColor = Color(0xFF1E0730),
                            secondaryColor = primaryColor,
                            detailLevel = (i % 3) + 1
                        )
                    )
                }
            }
        }
    }

    fun startRace() {
        raceStartTime = System.currentTimeMillis()
        raceElapsedTimeSec = 0f
        gameState = GameState.RACING
        activeBanner = FloatingBanner("¡SALIDA!", "¡PULSA EL TURBO Y DERRAPA!", Color(0xFF00FF66))
    }

    fun update(dt: Float) {
        val clampedDt = dt.coerceIn(0.001f, 0.04f)

        // Actualizar banner flotante
        activeBanner?.let { banner ->
            banner.life -= clampedDt
            if (banner.life <= 0f) activeBanner = null
        }

        // Actualizar partículas
        for (i in particles.indices.reversed()) {
            val p = particles[i]
            p.x += p.vx * clampedDt
            p.y += p.vy * clampedDt
            p.life -= clampedDt
            if (p.life <= 0f) particles.removeAt(i)
        }

        // Desvanecimiento de marcas de derrape
        for (i in skidmarks.indices.reversed()) {
            val s = skidmarks[i]
            s.alpha -= clampedDt * 0.05f
            if (s.alpha <= 0f) skidmarks.removeAt(i)
        }

        // Animar público espectador
        for (spec in spectators) {
            spec.cheerOffset = (spec.cheerOffset + clampedDt * spec.cheerSpeed) % (Math.PI.toFloat() * 2f)
            if (spec.flashAlpha > 0f) {
                spec.flashAlpha = (spec.flashAlpha - clampedDt * 3.5f).coerceAtLeast(0f)
            } else if (Random.nextFloat() < 0.008f) {
                spec.flashAlpha = 1.0f // Destello de flash de cámara
            }
        }

        if (gameState != GameState.RACING) return

        raceElapsedTimeSec += clampedDt

        // Cuenta regresiva de tiempo
        timeLeft -= clampedDt
        if (timeLeft <= 0f) {
            timeLeft = 0f
            gameState = GameState.TIME_OUT
            soundManager.playBarrierScrape()
            activeBanner = FloatingBanner("¡TIEMPO AGOTADO!", "PUNTUACIÓN FINAL: $totalScore", Color(0xFFFF1744))
            return
        }

        // 1. SISTEMA NITRO
        val isNitroEngaged = nitroInput && car.nitro > 0f
        car.isNitroActive = isNitroEngaged
        val targetMaxSpeed = if (isNitroEngaged) car.nitroMaxSpeed else car.maxSpeed
        val accelerationRate = if (isNitroEngaged) car.acceleration * 1.65f else car.acceleration

        if (isNitroEngaged) {
            car.nitro = (car.nitro - 26f * clampedDt).coerceAtLeast(0f)
            soundManager.playNitroBoost()
            createNitroExhaustParticles()
        } else {
            // Recarga pasiva gradual
            car.nitro = (car.nitro + 3.5f * clampedDt).coerceAtMost(100f)
        }
        nitroPercent = car.nitro

        // 2. ACELERACIÓN Y FRENADO DEL JUGADOR
        if (car.velocity < targetMaxSpeed) {
            car.velocity += accelerationRate * clampedDt
        } else {
            car.velocity -= 130f * clampedDt
        }

        // 2b. PANELES TURBO BOOST PADS
        if (boostCooldownTimer > 0f) {
            boostCooldownTimer -= clampedDt
        } else {
            for (pad in trackBoostPads) {
                if (hypot(car.x - pad.x, car.y - pad.y) < 65f) {
                    car.velocity = (car.velocity * 1.30f).coerceAtMost(car.nitroMaxSpeed * 1.08f)
                    car.nitro = (car.nitro + 20f).coerceAtMost(100f)
                    boostCooldownTimer = 1.25f
                    soundManager.playNitroBoost()
                    createBoostParticles(pad.x, pad.y, pad.angleRad)
                    activeBanner = FloatingBanner("¡TURBO BOOST!", "+IMPULSO EN PISTA", Color(0xFF00FFCC), life = 0.85f)
                    break
                }
            }
        }

        // 3. FÍSICAS DE GIRO Y DERRAPE ARCADE
        val speedRatio = (car.velocity / car.maxSpeed).coerceIn(0.12f, 1.0f)
        val baseTurnRate = car.turnSpeed * speedRatio

        if (driftInput && car.velocity > 160f) {
            car.isDrifting = true
            // El giro en derrape depende del manejo específico del coche (Viper = ultra-ágil, Hyperion = pesado y ancho)
            val driftTurnBoost = (car.turnSpeed * 1.35f).coerceIn(2.2f, 4.8f)
            car.angle += steerInput * driftTurnBoost * clampedDt

            val slipTendency = steerInput * (0.85f / (car.turnSpeed / 2.6f).coerceIn(0.6f, 1.6f))
            car.driftAngle = (car.driftAngle + (slipTendency - car.driftAngle) * 5.5f * clampedDt).coerceIn(-0.95f, 0.95f)

            // Acumular puntos de derrape y combo
            val angleIntensity = abs(car.driftAngle)
            currentDriftMultiplier = (currentDriftMultiplier + clampedDt * 0.55f).coerceAtMost(4.0f)
            if (currentDriftMultiplier > maxDriftMultiplierReached) {
                maxDriftMultiplierReached = currentDriftMultiplier
            }

            currentDriftPoints += (angleIntensity * car.velocity * 0.38f * currentDriftMultiplier) * clampedDt
            createSkidmarksAndSmoke()
            soundManager.playDriftScreech()
        } else {
            car.angle += steerInput * baseTurnRate * clampedDt
            car.driftAngle = car.driftAngle * (1f - 8f * clampedDt)

            if (car.isDrifting) {
                // Fin del derrape: premiar puntos y nitro
                if (currentDriftPoints > 120f) {
                    val pointsEarned = currentDriftPoints.toInt()
                    totalScore += pointsEarned
                    car.nitro = (car.nitro + 25f).coerceAtMost(100f)
                    val tier = when {
                        currentDriftMultiplier >= 3.0f -> "¡DERRAPE ÉPICO!"
                        currentDriftMultiplier >= 2.0f -> "¡GRAN DERRAPE!"
                        else -> "¡BUEN DERRAPE!"
                    }
                    activeBanner = FloatingBanner(tier, "+$pointsEarned PTS  (x${String.format("%.1f", currentDriftMultiplier)})", Color(0xFF00FFCC))
                }
                currentDriftPoints = 0f
                currentDriftMultiplier = 1.0f
                car.isDrifting = false
            }
        }

        currentDriftScoreDisplay = currentDriftPoints.toInt()
        driftMultiplierDisplay = currentDriftMultiplier

        // 4. TRASLACIÓN DEL COCHE
        val moveDirection = car.angle - car.driftAngle * 0.65f
        car.x += cos(moveDirection) * car.velocity * clampedDt
        car.y += sin(moveDirection) * car.velocity * clampedDt

        currentSpeedKmh = (car.velocity * 0.42f).toInt()
        if (currentSpeedKmh > maxSpeedReachedKmh) {
            maxSpeedReachedKmh = currentSpeedKmh
        }

        // 5. DETECCIÓN DE LÍMITES Y CHOQUES CON BARRERAS
        val nearestDistance = getDistanceToTrack(car.x, car.y)
        val maxAllowedDistance = track.trackWidth / 2f

        if (nearestDistance > maxAllowedDistance) {
            barrierHitsCount++
            if (isHardMode) {
                car.velocity = (car.velocity * 0.52f).coerceAtLeast(50f)
                timeLeft = (timeLeft - 1.2f).coerceAtLeast(0.1f)
                activeBanner = FloatingBanner("¡COLISIÓN! -1.2s", "PENALIZACIÓN MODO DIFÍCIL", Color(0xFFFF1744))
            } else {
                car.velocity = (car.velocity * 0.72f).coerceAtLeast(80f)
            }
            createBarrierSparks()
            soundManager.playBarrierScrape()

            val pushAngle = getAngleTowardsTrackCenter(car.x, car.y)
            car.x += cos(pushAngle) * 16f
            car.y += sin(pushAngle) * 16f

            if (currentDriftPoints > 0f) {
                currentDriftPoints = 0f
                currentDriftMultiplier = 1.0f
                if (!isHardMode) {
                    activeBanner = FloatingBanner("¡COMBO PERDIDO!", "COLISIÓN CON BARRERA", Color(0xFFFF1744))
                }
            }
        }

        // 6. ACTUALIZAR RIVALES IA
        updateAIRacers(clampedDt)

        // 7. CALCULAR POSICIÓN EN TIEMPO REAL (1º, 2º, 3º, 4º)
        calculateRaceRankings()

        // 8. CHECKPOINTS Y META
        checkCheckpoints()
    }

    private fun updateAIRacers(dt: Float) {
        val numWaypoints = track.waypoints.size

        for (ai in aiRacers) {
            if (ai.finished) continue

            val targetWp = track.waypoints[ai.currentWaypointIndex]
            val dx = targetWp.x - ai.x
            val dy = targetWp.y - ai.y
            val dist = hypot(dx, dy)
            val desiredAngle = atan2(dy, dx)

            // Rotación del rival IA hacia el waypoint (más agresiva en modo difícil)
            var angleDiff = desiredAngle - ai.angle
            while (angleDiff < -Math.PI) angleDiff += (Math.PI * 2.0).toFloat()
            while (angleDiff > Math.PI) angleDiff -= (Math.PI * 2.0).toFloat()

            val maxTurnThisFrame = (if (isHardMode) 4.2f else 3.2f) * dt
            ai.angle += angleDiff.coerceIn(-maxTurnThisFrame, maxTurnThisFrame)

            // Ajuste de velocidad según la curva
            val turnSharpness = abs(angleDiff)
            val speedTarget = if (turnSharpness > 0.6f) {
                if (isHardMode) ai.maxSpeed * 0.86f else ai.maxSpeed * 0.75f
            } else ai.maxSpeed

            val effectiveAccel = if (isHardMode) ai.accelRate * 1.22f else ai.accelRate
            if (ai.velocity < speedTarget) {
                ai.velocity += effectiveAccel * dt
            } else {
                ai.velocity -= 160f * dt
            }

            ai.x += cos(ai.angle) * ai.velocity * dt
            ai.y += sin(ai.angle) * ai.velocity * dt

            // Boost pads para IA
            for (pad in trackBoostPads) {
                if (hypot(ai.x - pad.x, ai.y - pad.y) < 50f) {
                    ai.velocity = (ai.velocity * 1.15f).coerceAtMost(ai.maxSpeed * 1.12f)
                }
            }

            // Si el rival llega cerca del waypoint, avanza al siguiente
            if (dist < 240f) {
                ai.currentWaypointIndex = (ai.currentWaypointIndex + 1) % numWaypoints
                if (ai.currentWaypointIndex == 1) {
                    ai.lap++
                    if (ai.lap > track.totalLaps) {
                        ai.finished = true
                        ai.finishTimeSec = raceElapsedTimeSec
                    }
                }
            }

            // Progreso total normalizado para ordenamiento de posiciones
            ai.totalProgress = (ai.lap - 1) * numWaypoints + ai.currentWaypointIndex + (1f - (dist / 1000f).coerceIn(0f, 1f))
        }
    }

    private fun calculateRaceRankings() {
        val numWaypoints = track.waypoints.size
        // Progreso del jugador
        val targetWp = track.waypoints[nextCheckpoint % numWaypoints]
        val distToWp = hypot(targetWp.x - car.x, targetWp.y - car.y)
        val playerTotalProgress = (currentLap - 1) * numWaypoints + nextCheckpoint + (1f - (distToWp / 1000f).coerceIn(0f, 1f))

        var rank = 1
        for (ai in aiRacers) {
            if (ai.totalProgress > playerTotalProgress) {
                rank++
            }
        }
        racePosition = rank
    }

    private fun checkCheckpoints() {
        val checkpointIndices = track.waypoints.indices.filter { track.waypoints[it].isCheckpoint }
        if (checkpointIndices.isEmpty()) return

        val targetIndex = checkpointIndices[nextCheckpoint % checkpointIndices.size]
        val targetPoint = track.waypoints[targetIndex]
        val dist = hypot(car.x - targetPoint.x, car.y - targetPoint.y)

        // Radio de detección adaptado a pistas más anchas
        if (dist < 340f) {
            soundManager.playCheckpointChime()
            val timeBonus = if (isHardMode) (track.baseTimeBonus * 0.65f) else track.baseTimeBonus
            timeLeft += timeBonus

            val isFinishLine = (nextCheckpoint % checkpointIndices.size == 0)

            if (isFinishLine) {
                if (currentLap >= track.totalLaps) {
                    // ¡Carrera finalizada con éxito!
                    evaluateMissions()
                    gameState = GameState.VICTORY
                    soundManager.playVictoryFanfare()
                    val posText = when (racePosition) {
                        1 -> if (isHardMode) "🔥 ¡1ER LUGAR HARDCORE!" else "¡1ER LUGAR - CAMPEÓN!"
                        2 -> "¡2º LUGAR - PODIO!"
                        3 -> "¡3ER LUGAR - PODIO!"
                        else -> "CARRERA COMPLETADA"
                    }
                    val bonusSub = if (isHardMode) "TIEMPO: ${String.format("%.1fs", raceElapsedTimeSec)} (+85% 🪙)" else "TIEMPO: ${String.format("%.1fs", raceElapsedTimeSec)}"
                    activeBanner = FloatingBanner(posText, bonusSub, Color(0xFFFFD700))
                    return
                } else {
                    currentLap++
                    activeBanner = FloatingBanner("¡VUELTA $currentLap / ${track.totalLaps}!", "+${timeBonus.toInt()}s EXTENSIÓN", Color(0xFFFF007F))
                }
            } else {
                val bannerText = if (isHardMode) "+${timeBonus.toInt()}s (MODO DIFÍCIL)" else "+${timeBonus.toInt()}s"
                activeBanner = FloatingBanner("CHECKPOINT SUPERADO", bannerText, Color(0xFF00F0FF))
            }

            nextCheckpoint++
        }
    }

    private fun evaluateMissions() {
        completedMissionIds.clear()
        when (track.id) {
            "neo_tokyo" -> {
                // Misión 1: Podio (Top 3)
                if (racePosition <= 3) completedMissionIds.add(1)
                // Misión 2: Maestro del Derrape (2,500 pts)
                if (totalScore >= 2500) completedMissionIds.add(2)
                // Misión 3: Menos de 95s
                if (raceElapsedTimeSec <= 95f) completedMissionIds.add(3)
            }
            "cyber_canyon" -> {
                // Misión 1: 1er Lugar
                if (racePosition == 1) completedMissionIds.add(1)
                // Misión 2: Combo 3.0x
                if (maxDriftMultiplierReached >= 3.0f) completedMissionIds.add(2)
                // Misión 3: Conducción limpia (<= 3 choques)
                if (barrierHitsCount <= 3) completedMissionIds.add(3)
            }
            "quantum_highway" -> {
                // Misión 1: Más de 230 km/h
                if (maxSpeedReachedKmh >= 230) completedMissionIds.add(1)
                // Misión 2: 1er Lugar
                if (racePosition == 1) completedMissionIds.add(2)
                // Misión 3: Puntuación récord (6,500 pts)
                if (totalScore >= 6500) completedMissionIds.add(3)
            }
            "omega_colosseum" -> {
                // Misión 1: 1er Lugar
                if (racePosition == 1) completedMissionIds.add(1)
                // Misión 2: Combo 3.8x
                if (maxDriftMultiplierReached >= 3.8f) completedMissionIds.add(2)
                // Misión 3: Menos de 115s
                if (raceElapsedTimeSec <= 115f) completedMissionIds.add(3)
            }
        }
    }

    fun calculateCoinsEarned(): Int {
        var coins = (totalScore / 10).coerceAtLeast(100)
        // Bonus por posición
        coins += when (racePosition) {
            1 -> 600
            2 -> 350
            3 -> 200
            else -> 80
        }
        // Bonus por misiones cumplidas
        for (mId in completedMissionIds) {
            val mission = track.missions.firstOrNull { it.id == mId }
            if (mission != null) {
                coins += mission.rewardCoins
            }
        }
        // Multiplicador por Modo Difícil (+85% en recompensa total de créditos)
        if (isHardMode) {
            coins = (coins * 1.85f).toInt()
        }
        return coins
    }

    private fun getDistanceToTrack(px: Float, py: Float): Float {
        var minDistance = Float.MAX_VALUE
        val size = track.waypoints.size
        for (i in 0 until size) {
            val p1 = track.waypoints[i]
            val p2 = track.waypoints[(i + 1) % size]
            val d = distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y)
            if (d < minDistance) minDistance = d
        }
        return minDistance
    }

    private fun getAngleTowardsTrackCenter(px: Float, py: Float): Float {
        var minDistance = Float.MAX_VALUE
        var closestX = 0f
        var closestY = 0f
        val size = track.waypoints.size
        for (i in 0 until size) {
            val p1 = track.waypoints[i]
            val p2 = track.waypoints[(i + 1) % size]
            val (cx, cy, d) = closestPointOnSegment(px, py, p1.x, p1.y, p2.x, p2.y)
            if (d < minDistance) {
                minDistance = d
                closestX = cx
                closestY = cy
            }
        }
        return atan2(closestY - py, closestX - px)
    }

    private fun distanceToSegment(px: Float, py: Float, x1: Float, y1: Float, x2: Float, y2: Float): Float {
        val dx = x2 - x1
        val dy = y2 - y1
        val lengthSq = dx * dx + dy * dy
        if (lengthSq == 0f) return hypot(px - x1, py - y1)
        val t = ((px - x1) * dx + (py - y1) * dy) / lengthSq
        val clampedT = t.coerceIn(0f, 1f)
        val projX = x1 + clampedT * dx
        val projY = y1 + clampedT * dy
        return hypot(px - projX, py - projY)
    }

    private fun closestPointOnSegment(px: Float, py: Float, x1: Float, y1: Float, x2: Float, y2: Float): Triple<Float, Float, Float> {
        val dx = x2 - x1
        val dy = y2 - y1
        val lengthSq = dx * dx + dy * dy
        if (lengthSq == 0f) return Triple(x1, y1, hypot(px - x1, py - y1))
        val t = ((px - x1) * dx + (py - y1) * dy) / lengthSq
        val clampedT = t.coerceIn(0f, 1f)
        val projX = x1 + clampedT * dx
        val projY = y1 + clampedT * dy
        return Triple(projX, projY, hypot(px - projX, py - projY))
    }

    private fun createSkidmarksAndSmoke() {
        val cosA = cos(car.angle)
        val sinA = sin(car.angle)
        val rearOffsetX = -cosA * (car.length * 0.4f)
        val rearOffsetY = -sinA * (car.length * 0.4f)
        val halfW = car.width * 0.42f
        val perpX = -sinA * halfW
        val perpY = cosA * halfW

        val leftTireX = car.x + rearOffsetX + perpX
        val leftTireY = car.y + rearOffsetY + perpY
        val rightTireX = car.x + rearOffsetX - perpX
        val rightTireY = car.y + rearOffsetY - perpY

        if (lastSkidLeftX != 0f) {
            skidmarks.add(Skidmark(lastSkidLeftX, lastSkidLeftY, leftTireX, leftTireY, alpha = 0.6f, color = Color(0xFF00E5FF)))
            skidmarks.add(Skidmark(lastSkidRightX, lastSkidRightY, rightTireX, rightTireY, alpha = 0.6f, color = Color(0xFFFF007F)))
        }

        lastSkidLeftX = leftTireX
        lastSkidLeftY = leftTireY
        lastSkidRightX = rightTireX
        lastSkidRightY = rightTireY

        // Partículas de humo de derrape
        for (i in 0 until 3) {
            val smokeX = if (Random.nextBoolean()) leftTireX else rightTireX
            val smokeY = if (Random.nextBoolean()) leftTireY else rightTireY
            particles.add(
                Particle(
                    x = smokeX,
                    y = smokeY,
                    vx = (Random.nextFloat() * 60f - 30f) - cosA * (car.velocity * 0.2f),
                    vy = (Random.nextFloat() * 60f - 30f) - sinA * (car.velocity * 0.2f),
                    color = if (Random.nextFloat() < 0.65f) car.trailFxColor.copy(alpha = 0.45f) else car.bodyColor.copy(alpha = 0.4f),
                    size = Random.nextFloat() * 12f + 8f,
                    life = 0.35f,
                    maxLife = 0.35f
                )
            )
        }
    }

    private fun createNitroExhaustParticles() {
        val cosA = cos(car.angle)
        val sinA = sin(car.angle)
        val exhaustX = car.x - cosA * (car.length * 0.52f)
        val exhaustY = car.y - sinA * (car.length * 0.52f)

        for (i in 0 until 4) {
            particles.add(
                Particle(
                    x = exhaustX + Random.nextFloat() * 10f - 5f,
                    y = exhaustY + Random.nextFloat() * 10f - 5f,
                    vx = -cosA * (Random.nextFloat() * 320f + 250f),
                    vy = -sinA * (Random.nextFloat() * 320f + 250f),
                    color = if (Random.nextBoolean()) car.trailFxColor else Color(0xFF00F0FF),
                    size = Random.nextFloat() * 7f + 4f,
                    life = 0.22f,
                    maxLife = 0.22f
                )
            )
        }
    }

    private fun createBarrierSparks() {
        for (i in 0 until 5) {
            val angle = Random.nextFloat() * Math.PI.toFloat() * 2f
            val speed = Random.nextFloat() * 260f + 50f
            particles.add(
                Particle(
                    x = car.x,
                    y = car.y,
                    vx = cos(angle) * speed,
                    vy = sin(angle) * speed,
                    color = Color(0xFFFFD600),
                    size = 3.5f,
                    life = 0.18f,
                    maxLife = 0.18f
                )
            )
        }
    }

    private fun createBoostParticles(padX: Float, padY: Float, padAngle: Float) {
        val cosA = cos(padAngle)
        val sinA = sin(padAngle)
        for (i in 0 until 18) {
            val spreadAngle = padAngle + (Random.nextFloat() * 1.2f - 0.6f) + Math.PI.toFloat()
            val speed = Random.nextFloat() * 380f + 180f
            particles.add(
                Particle(
                    x = padX + (Random.nextFloat() * 40f - 20f),
                    y = padY + (Random.nextFloat() * 40f - 20f),
                    vx = cos(spreadAngle) * speed,
                    vy = sin(spreadAngle) * speed,
                    color = if (Random.nextBoolean()) Color(0xFF00FFCC) else Color(0xFFFFFFFF),
                    size = Random.nextFloat() * 6.5f + 3.5f,
                    life = 0.28f,
                    maxLife = 0.28f
                )
            )
        }
    }
}
