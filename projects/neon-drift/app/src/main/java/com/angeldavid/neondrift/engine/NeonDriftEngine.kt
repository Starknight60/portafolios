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

    var activeBanner: FloatingBanner? by mutableStateOf(null)
        private set

    // Player Car & Collections
    var car = Car()
    val particles = ArrayList<Particle>(110)
    val skidmarks = ArrayList<Skidmark>(140)
    val aiRacers = ArrayList<AIRacer>(3)
    val spectators = ArrayList<Spectator>(35)

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
     * Prepara e inicializa la carrera con el circuito seleccionado y el coche del jugador.
     */
    fun setupRace(selectedTrack: TrackDefinition, playerCar: Car) {
        this.track = selectedTrack
        this.car = playerCar

        // Reset de métricas
        totalScore = 0
        currentLap = 1
        timeLeft = 38f + selectedTrack.baseTimeBonus
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

        // Inicializar 3 Rivales IA en posiciones escalonadas de la parrilla
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
            val lateralOffset = if (i % 2 == 0) 35f else -35f
            val aiX = startPoint.x + cos(initialAngle) * forwardOffset + cos(perpAngle) * lateralOffset
            val aiY = startPoint.y + sin(initialAngle) * forwardOffset + sin(perpAngle) * lateralOffset

            val aiSpeed = car.maxSpeed * (0.86f + i * 0.04f)
            val aiAccel = car.acceleration * (0.88f + i * 0.05f)

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

        activeBanner = FloatingBanner("¡LISTOS PARA CORRER!", "MANTÉN EL CONTROL EN LAS CURVAS", Color(0xFF00F0FF))
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
            car.velocity = (car.velocity * 0.72f).coerceAtLeast(80f)
            createBarrierSparks()
            soundManager.playBarrierScrape()

            val pushAngle = getAngleTowardsTrackCenter(car.x, car.y)
            car.x += cos(pushAngle) * 14f
            car.y += sin(pushAngle) * 14f

            if (currentDriftPoints > 0f) {
                currentDriftPoints = 0f
                currentDriftMultiplier = 1.0f
                activeBanner = FloatingBanner("¡COMBO PERDIDO!", "COLISIÓN CON BARRERA", Color(0xFFFF1744))
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

            // Rotación suave del rival IA hacia el waypoint
            var angleDiff = desiredAngle - ai.angle
            while (angleDiff < -Math.PI) angleDiff += (Math.PI * 2.0).toFloat()
            while (angleDiff > Math.PI) angleDiff -= (Math.PI * 2.0).toFloat()

            val maxTurnThisFrame = 3.2f * dt
            ai.angle += angleDiff.coerceIn(-maxTurnThisFrame, maxTurnThisFrame)

            // Ajuste de velocidad según la curva
            val turnSharpness = abs(angleDiff)
            val speedTarget = if (turnSharpness > 0.6f) ai.maxSpeed * 0.75f else ai.maxSpeed

            if (ai.velocity < speedTarget) {
                ai.velocity += ai.accelRate * dt
            } else {
                ai.velocity -= 160f * dt
            }

            ai.x += cos(ai.angle) * ai.velocity * dt
            ai.y += sin(ai.angle) * ai.velocity * dt

            // Si el rival llega cerca del waypoint, avanza al siguiente
            if (dist < 220f) {
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

        if (dist < 280f) {
            soundManager.playCheckpointChime()
            timeLeft += track.baseTimeBonus

            val isFinishLine = (nextCheckpoint % checkpointIndices.size == 0)

            if (isFinishLine) {
                if (currentLap >= track.totalLaps) {
                    // ¡Carrera finalizada con éxito!
                    evaluateMissions()
                    gameState = GameState.VICTORY
                    soundManager.playVictoryFanfare()
                    val posText = when (racePosition) {
                        1 -> "¡1ER LUGAR - CAMPEÓN!"
                        2 -> "¡2º LUGAR - PODIO!"
                        3 -> "¡3ER LUGAR - PODIO!"
                        else -> "CARRERA COMPLETADA"
                    }
                    activeBanner = FloatingBanner(posText, "TIEMPO: ${String.format("%.1fs", raceElapsedTimeSec)}", Color(0xFFFFD700))
                    return
                } else {
                    currentLap++
                    activeBanner = FloatingBanner("¡VUELTA $currentLap / ${track.totalLaps}!", "+${track.baseTimeBonus.toInt()}s EXTENSIÓN", Color(0xFFFF007F))
                }
            } else {
                activeBanner = FloatingBanner("CHECKPOINT SUPERADO", "+${track.baseTimeBonus.toInt()}s", Color(0xFF00F0FF))
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
}
