package com.angeldavid.neondrift.engine

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import com.angeldavid.neondrift.model.*
import kotlin.math.*
import kotlin.random.Random

class NeonDriftEngine(
    context: Context,
    private val soundManager: DriftSoundManager
) {
    private val prefs = context.getSharedPreferences("neon_drift_prefs", Context.MODE_PRIVATE)

    // Observable Compose States for UI Overlays
    var gameState: GameState by mutableStateOf(GameState.MENU)
        internal set

    var totalScore: Int by mutableIntStateOf(0)
        private set

    var highDriftScore: Int by mutableIntStateOf(prefs.getInt("high_drift_score", 0))
        private set

    var currentLap: Int by mutableIntStateOf(1)
        private set

    var timeLeft: Float by mutableFloatStateOf(35f)
        private set

    var currentSpeedKmh: Int by mutableIntStateOf(0)
        private set

    var currentDriftScoreDisplay: Int by mutableIntStateOf(0)
        private set

    var driftMultiplierDisplay: Float by mutableFloatStateOf(1.0f)
        private set

    var nitroPercent: Float by mutableFloatStateOf(100f)
        private set

    var activeBanner: FloatingBanner? by mutableStateOf(null)
        private set

    val car = Car()
    val particles = ArrayList<Particle>(90)
    val skidmarks = ArrayList<Skidmark>(120)

    // Track Waypoints (Closed Circuit Loop)
    val trackPoints = listOf(
        TrackPoint(x = 600f, y = 2000f, width = 340f, isCheckpoint = true, checkpointIndex = 0), // Start/Finish
        TrackPoint(x = 600f, y = 1300f, width = 340f),
        TrackPoint(x = 800f, y = 700f, width = 320f),
        TrackPoint(x = 1400f, y = 450f, width = 320f),
        TrackPoint(x = 2200f, y = 450f, width = 320f, isCheckpoint = true, checkpointIndex = 1), // Sector 1
        TrackPoint(x = 2900f, y = 750f, width = 300f),
        TrackPoint(x = 2700f, y = 1200f, width = 300f),
        TrackPoint(x = 3200f, y = 1600f, width = 310f),
        TrackPoint(x = 3500f, y = 2200f, width = 320f, isCheckpoint = true, checkpointIndex = 2), // Hairpin
        TrackPoint(x = 3100f, y = 2700f, width = 340f),
        TrackPoint(x = 2300f, y = 2800f, width = 340f),
        TrackPoint(x = 1400f, y = 2800f, width = 340f, isCheckpoint = true, checkpointIndex = 3), // Tunnel
        TrackPoint(x = 800f, y = 2600f, width = 340f)
    )

    var nextCheckpoint = 1
    private var currentDriftPoints = 0f
    private var currentDriftMultiplier = 1.0f
    private var lastSkidLeftX = 0f
    private var lastSkidLeftY = 0f
    private var lastSkidRightX = 0f
    private var lastSkidRightY = 0f
    private var lapStartTime = 0L
    var bestLapTimeSeconds = prefs.getFloat("best_lap_time", 0f)

    // Player Touch Controls state
    var steerInput = 0f // -1f = Left, +1f = Right
    var driftInput = false
    var nitroInput = false

    fun startRace() {
        totalScore = 0
        currentLap = 1
        timeLeft = 38f
        nextCheckpoint = 1
        currentDriftPoints = 0f
        currentDriftMultiplier = 1.0f
        activeBanner = FloatingBanner("RACE STARTED!", "HIT APEX & DRIFT TO CHARGE NITRO", Color(0xFF00F0FF))

        // Reset car at Start Line heading North (Upwards, -PI/2)
        car.x = trackPoints[0].x
        car.y = trackPoints[0].y + 100f
        car.angle = -Math.PI.toFloat() / 2f
        car.velocity = 0f
        car.angularVelocity = 0f
        car.driftAngle = 0f
        car.isDrifting = false
        car.nitro = 100f

        particles.clear()
        skidmarks.clear()
        lapStartTime = System.currentTimeMillis()

        gameState = GameState.RACING
    }

    fun update(dt: Float) {
        val clampedDt = dt.coerceIn(0.001f, 0.04f)

        // Banner timer
        activeBanner?.let { banner ->
            banner.life -= clampedDt
            if (banner.life <= 0f) activeBanner = null
        }

        // Particle updates
        for (i in particles.indices.reversed()) {
            val p = particles[i]
            p.x += p.vx * clampedDt
            p.y += p.vy * clampedDt
            p.life -= clampedDt
            if (p.life <= 0f) particles.removeAt(i)
        }

        // Skidmark fading
        for (i in skidmarks.indices.reversed()) {
            val s = skidmarks[i]
            s.alpha -= clampedDt * 0.06f
            if (s.alpha <= 0f) skidmarks.removeAt(i)
        }

        if (gameState != GameState.RACING) return

        // Time countdown
        timeLeft -= clampedDt
        if (timeLeft <= 0f) {
            timeLeft = 0f
            gameState = GameState.TIME_OUT
            soundManager.playBarrierScrape()
            activeBanner = FloatingBanner("TIME'S UP!", "FINAL SCORE: $totalScore", Color(0xFFFF1744))
            return
        }

        // 1. NITRO SYSTEM
        val isNitroEngaged = nitroInput && car.nitro > 0f
        car.isNitroActive = isNitroEngaged
        val targetMaxSpeed = if (isNitroEngaged) car.nitroMaxSpeed else car.maxSpeed
        val accelerationRate = if (isNitroEngaged) 420f else 260f

        if (isNitroEngaged) {
            car.nitro = (car.nitro - 28f * clampedDt).coerceAtLeast(0f)
            soundManager.playNitroBoost()
            createNitroExhaustParticles()
        } else {
            // Slow passive recharge
            car.nitro = (car.nitro + 4f * clampedDt).coerceAtMost(100f)
        }
        nitroPercent = car.nitro

        // 2. FORWARD ACCELERATION & BRAKING
        if (car.velocity < targetMaxSpeed) {
            car.velocity += accelerationRate * clampedDt
        } else {
            car.velocity -= 140f * clampedDt
        }

        // 3. STEERING & DRIFT PHYSICS
        val speedRatio = (car.velocity / car.maxSpeed).coerceIn(0.15f, 1.0f)
        val baseTurnRate = 2.4f * speedRatio

        if (driftInput && car.velocity > 180f) {
            // Handbrake Drift Mode: lateral friction drops, car rotates faster
            car.isDrifting = true
            val driftTurnBoost = 3.6f
            car.angle += steerInput * driftTurnBoost * clampedDt

            // Oversteer slip angle builds up
            val slipTendency = steerInput * 0.75f
            car.driftAngle = (car.driftAngle + (slipTendency - car.driftAngle) * 5f * clampedDt).coerceIn(-0.85f, 0.85f)

            // Accrue Drift Points
            val angleIntensity = abs(car.driftAngle)
            currentDriftMultiplier = (currentDriftMultiplier + clampedDt * 0.5f).coerceAtMost(4.0f)
            currentDriftPoints += (angleIntensity * car.velocity * 0.35f * currentDriftMultiplier) * clampedDt

            // Spawn Skidmarks & Smoke
            createSkidmarksAndSmoke()
            soundManager.playDriftScreech()
        } else {
            // Normal Grip Steering
            car.angle += steerInput * baseTurnRate * clampedDt
            car.driftAngle = car.driftAngle * (1f - 8f * clampedDt) // Straighten out

            if (car.isDrifting) {
                // Drift just ended safely! Bank score & reward Nitro!
                if (currentDriftPoints > 150f) {
                    val pointsEarned = currentDriftPoints.toInt()
                    totalScore += pointsEarned
                    car.nitro = (car.nitro + 22f).coerceAtMost(100f)
                    val tier = if (currentDriftMultiplier > 3.0f) "SUPER DRIFT!" else if (currentDriftMultiplier > 2.0f) "GREAT DRIFT!" else "NICE DRIFT!"
                    activeBanner = FloatingBanner(tier, "+$pointsEarned PTS  (x${String.format("%.1f", currentDriftMultiplier)})", Color(0xFF00FFCC))
                }
                currentDriftPoints = 0f
                currentDriftMultiplier = 1.0f
                car.isDrifting = false
            }
        }

        currentDriftScoreDisplay = currentDriftPoints.toInt()
        driftMultiplierDisplay = currentDriftMultiplier

        // 4. WORLD MOVEMENT (Heading adjusted by drift slip angle)
        val moveDirection = car.angle - car.driftAngle * 0.65f
        car.x += cos(moveDirection) * car.velocity * clampedDt
        car.y += sin(moveDirection) * car.velocity * clampedDt

        currentSpeedKmh = (car.velocity * 0.42f).toInt()

        // 5. TRACK BOUNDARY & BARRIER COLLISION DETECTION
        val nearestDistance = getDistanceToTrack(car.x, car.y)
        val maxAllowedDistance = 150f // Half of track width

        if (nearestDistance > maxAllowedDistance) {
            // Hit Neon Barrier!
            car.velocity = (car.velocity * 0.75f).coerceAtLeast(80f)
            createBarrierSparks()
            soundManager.playBarrierScrape()

            // Push car back towards track center
            val pushAngle = getAngleTowardsTrackCenter(car.x, car.y)
            car.x += cos(pushAngle) * 12f
            car.y += sin(pushAngle) * 12f

            // Break current drift combo on crash
            if (currentDriftPoints > 0f) {
                currentDriftPoints = 0f
                currentDriftMultiplier = 1.0f
                activeBanner = FloatingBanner("DRIFT COMBO LOST!", "HIT BARRIER", Color(0xFFFF1744))
            }
        }

        // 6. CHECKPOINT & LAP TRACKING
        checkCheckpoints()

        // High score updates
        if (totalScore > highDriftScore) {
            highDriftScore = totalScore
            prefs.edit().putInt("high_drift_score", highDriftScore).apply()
        }
    }

    private fun checkCheckpoints() {
        val targetPoint = trackPoints.firstOrNull { it.isCheckpoint && it.checkpointIndex == nextCheckpoint } ?: return
        val dist = hypot(car.x - targetPoint.x, car.y - targetPoint.y)

        if (dist < 260f) {
            soundManager.playCheckpointChime()
            timeLeft += 12f // +12s time extension per checkpoint

            if (nextCheckpoint == 0) {
                // Completed a full lap!
                val lapTimeSeconds = (System.currentTimeMillis() - lapStartTime) / 1000f
                lapStartTime = System.currentTimeMillis()

                if (bestLapTimeSeconds <= 0f || lapTimeSeconds < bestLapTimeSeconds) {
                    bestLapTimeSeconds = lapTimeSeconds
                    prefs.edit().putFloat("best_lap_time", bestLapTimeSeconds).apply()
                }

                if (currentLap >= 3) {
                    // Won the 3-Lap Championship!
                    gameState = GameState.LAP_FINISHED
                    activeBanner = FloatingBanner("CHAMPIONSHIP COMPLETED!", "FINAL SCORE: $totalScore", Color(0xFFFFD700))
                    return
                } else {
                    currentLap++
                    activeBanner = FloatingBanner("LAP $currentLap STARTED!", "+12s EXTENSION", Color(0xFFFF007F))
                }
            } else {
                activeBanner = FloatingBanner("CHECKPOINT $nextCheckpoint!", "+12s EXTENSION", Color(0xFF00F0FF))
            }

            nextCheckpoint = (nextCheckpoint + 1) % 4
        }
    }

    private fun getDistanceToTrack(px: Float, py: Float): Float {
        var minDistance = Float.MAX_VALUE
        for (i in trackPoints.indices) {
            val p1 = trackPoints[i]
            val p2 = trackPoints[(i + 1) % trackPoints.size]
            val d = distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y)
            if (d < minDistance) minDistance = d
        }
        return minDistance
    }

    private fun getAngleTowardsTrackCenter(px: Float, py: Float): Float {
        var minDistance = Float.MAX_VALUE
        var closestX = 0f
        var closestY = 0f
        for (i in trackPoints.indices) {
            val p1 = trackPoints[i]
            val p2 = trackPoints[(i + 1) % trackPoints.size]
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
        // Calculate rear tire positions
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

        // Tire Smoke & Neon Sparks
        for (i in 0 until 3) {
            val smokeX = if (Random.nextBoolean()) leftTireX else rightTireX
            val smokeY = if (Random.nextBoolean()) leftTireY else rightTireY
            particles.add(
                Particle(
                    x = smokeX,
                    y = smokeY,
                    vx = (Random.nextFloat() * 60f - 30f) - cosA * (car.velocity * 0.2f),
                    vy = (Random.nextFloat() * 60f - 30f) - sinA * (car.velocity * 0.2f),
                    color = if (Random.nextFloat() < 0.6f) Color(0xFF80D8FF).copy(alpha = 0.4f) else Color(0xFFFF4081).copy(alpha = 0.4f),
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
                    color = if (Random.nextBoolean()) Color(0xFF00F0FF) else Color(0xFFD500F9),
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
