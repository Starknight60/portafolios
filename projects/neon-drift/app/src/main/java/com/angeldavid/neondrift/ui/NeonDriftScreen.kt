@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.ui

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.angeldavid.neondrift.engine.DriftSoundManager
import com.angeldavid.neondrift.engine.NeonDriftEngine
import com.angeldavid.neondrift.model.*
import kotlin.math.*

@Composable
fun NeonDriftScreen() {
    val context = LocalContext.current
    val soundManager = remember { DriftSoundManager(context) }
    val engine = remember { NeonDriftEngine(context, soundManager) }

    // 60/120 FPS high-precision hardware clock
    var frameTick by remember { mutableLongStateOf(0L) }

    LaunchedEffect(Unit) {
        var lastTimeNanos = 0L
        while (true) {
            withFrameNanos { now ->
                if (lastTimeNanos > 0L) {
                    val dt = (now - lastTimeNanos) / 1_000_000_000f
                    engine.update(dt)
                }
                lastTimeNanos = now
                frameTick = now
            }
        }
    }

    // Pre-allocated reusable paths for zero-GC allocation
    val carBodyPath = remember { Path() }
    val glassPath = remember { Path() }
    val spoilerPath = remember { Path() }
    val flamePath = remember { Path() }

    // Pre-cached native text paints for low-overhead HUD drawing
    val speedPaint = remember {
        Paint().apply {
            color = android.graphics.Color.WHITE
            textSize = 54f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.LEFT
        }
    }
    val unitPaint = remember {
        Paint().apply {
            color = 0xFF00F0FF.toInt()
            textSize = 24f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.LEFT
        }
    }
    val timerPaint = remember {
        Paint().apply {
            color = 0xFFFFD700.toInt()
            textSize = 48f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }
    val bannerPaint = remember {
        Paint().apply {
            color = 0xFF00FFCC.toInt()
            textSize = 38f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }
    val bannerSubPaint = remember {
        Paint().apply {
            color = android.graphics.Color.WHITE
            textSize = 24f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF070415))
    ) {
        // High-performance Hardware Accelerated Canvas
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Subscribe Canvas draw phase to 60 FPS clock without recomposition
            if (frameTick == -1L) return@Canvas
            if (size.width <= 0f || size.height <= 0f) return@Canvas

            val centerX = size.width / 2f
            val centerY = size.height / 2f

            // 1. Draw Cyber Synthwave Grid Background
            drawCyberGrid(size, engine.car)

            // 2. Chase-cam view: Camera anchored to Car, rotating so car points forward (upwards)
            val carScreenAngleDeg = Math.toDegrees(engine.car.angle.toDouble()).toFloat()
            val cameraRotation = -carScreenAngleDeg - 90f

            rotate(cameraRotation, pivot = Offset(centerX, centerY)) {
                val worldOffsetX = centerX - engine.car.x
                val worldOffsetY = centerY - engine.car.y

                // 3. Draw Neon Circuit Track
                drawNeonCircuit(engine.trackPoints, worldOffsetX, worldOffsetY)

                // 4. Draw Tire Skidmarks on Track
                for (i in 0 until engine.skidmarks.size) {
                    val s = engine.skidmarks[i]
                    drawLine(
                        color = s.color.copy(alpha = s.alpha),
                        start = Offset(s.x1 + worldOffsetX, s.y1 + worldOffsetY),
                        end = Offset(s.x2 + worldOffsetX, s.y2 + worldOffsetY),
                        strokeWidth = 7f,
                        cap = StrokeCap.Round
                    )
                }

                // 5. Draw Particles (Smoke & Sparks)
                for (i in 0 until engine.particles.size) {
                    val p = engine.particles[i]
                    val alpha = (p.life / p.maxLife).coerceIn(0f, 1f)
                    drawCircle(
                        color = p.color.copy(alpha = alpha),
                        radius = p.size * alpha,
                        center = Offset(p.x + worldOffsetX, p.y + worldOffsetY)
                    )
                }
            }

            // 6. Draw Cyberpunk Supercar (Always rendered centered at screen, pointing up)
            drawCyberpunkCar(
                car = engine.car,
                centerX = centerX,
                centerY = centerY,
                bodyPath = carBodyPath,
                glassPath = glassPath,
                spoilerPath = spoilerPath,
                flamePath = flamePath
            )

            // 7. Draw In-Game HUD directly on Canvas
            if (engine.gameState == GameState.RACING) {
                drawDriftHUD(
                    engine = engine,
                    size = size,
                    speedPaint = speedPaint,
                    unitPaint = unitPaint,
                    timerPaint = timerPaint,
                    bannerPaint = bannerPaint,
                    bannerSubPaint = bannerSubPaint
                )
            }
        }

        // Touch Control Panels (Landscape layout: Steering on Left, Drift/Nitro on Right)
        if (engine.gameState == GameState.RACING) {
            GameTouchControls(engine = engine)
        }

        // Start Menu Overlay
        if (engine.gameState == GameState.MENU) {
            StartMenuOverlay(
                highDriftScore = engine.highDriftScore,
                bestLap = engine.bestLapTimeSeconds,
                onStart = { engine.startRace() }
            )
        }

        // Race Finished or Time Out Overlay
        if (engine.gameState == GameState.LAP_FINISHED || engine.gameState == GameState.TIME_OUT) {
            RaceResultsOverlay(
                isWon = engine.gameState == GameState.LAP_FINISHED,
                score = engine.totalScore,
                highScore = engine.highDriftScore,
                laps = engine.currentLap,
                onRestart = { engine.startRace() }
            )
        }
    }
}

// -------------------------------------------------------------
// ZERO-ALLOCATION DRAWING PIPELINES
// -------------------------------------------------------------

private fun DrawScope.drawCyberGrid(size: Size, car: Car) {
    val spacing = 70f
    val offsetX = (car.x * 0.15f) % spacing
    val offsetY = (car.y * 0.15f) % spacing

    val gridColor = Color(0xFF1E103A).copy(alpha = 0.6f)
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

private fun DrawScope.drawNeonCircuit(points: List<TrackPoint>, offX: Float, offY: Float) {
    if (points.size < 3) return

    val trackWidth = points[0].width

    // 1. Dark Asphalt Ribbon
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        drawLine(
            color = Color(0xFF0B0E17),
            start = Offset(p1.x + offX, p1.y + offY),
            end = Offset(p2.x + offX, p2.y + offY),
            strokeWidth = trackWidth,
            cap = StrokeCap.Round
        )
    }

    // 2. Dashed Centerline (Neon Cyan)
    for (i in points.indices) {
        val p1 = points[i]
        val p2 = points[(i + 1) % points.size]
        drawLine(
            color = Color(0xFF00E5FF).copy(alpha = 0.45f),
            start = Offset(p1.x + offX, p1.y + offY),
            end = Offset(p2.x + offX, p2.y + offY),
            strokeWidth = 5f,
            cap = StrokeCap.Round
        )
    }

    // 3. Glowing Outer and Inner Neon Rails
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

        // Left Neon Rail (Electric Cyan)
        drawLine(
            color = Color(0xFF00F0FF),
            start = Offset(p1.x + perpX + offX, p1.y + perpY + offY),
            end = Offset(p2.x + perpX + offX, p2.y + perpY + offY),
            strokeWidth = 6f,
            cap = StrokeCap.Round
        )

        // Right Neon Rail (Hot Magenta)
        drawLine(
            color = Color(0xFFFF007F),
            start = Offset(p1.x - perpX + offX, p1.y - perpY + offY),
            end = Offset(p2.x - perpX + offX, p2.y - perpY + offY),
            strokeWidth = 6f,
            cap = StrokeCap.Round
        )

        // Draw Checkpoint Laser Gates
        if (p1.isCheckpoint) {
            val gateColor = if (p1.checkpointIndex == 0) Color(0xFFFFD700) else Color(0xFF00FFCC)
            drawLine(
                color = gateColor.copy(alpha = 0.85f),
                start = Offset(p1.x - perpX + offX, p1.y - perpY + offY),
                end = Offset(p1.x + perpX + offX, p1.y + perpY + offY),
                strokeWidth = 8f
            )
            drawCircle(gateColor, radius = 12f, center = Offset(p1.x - perpX + offX, p1.y - perpY + offY))
            drawCircle(gateColor, radius = 12f, center = Offset(p1.x + perpX + offX, p1.y + perpY + offY))
        }
    }
}

private fun DrawScope.drawCyberpunkCar(
    car: Car,
    centerX: Float,
    centerY: Float,
    bodyPath: Path,
    glassPath: Path,
    spoilerPath: Path,
    flamePath: Path
) {
    // Underglow Neon LED Ground Lighting
    val underglowColor = if (car.isNitroActive) Color(0xFF00F0FF) else Color(0xFFFF007F)
    drawCircle(
        color = underglowColor.copy(alpha = 0.45f),
        radius = 56f,
        center = Offset(centerX, centerY)
    )

    // Headlight Light Cones beaming forward onto asphalt
    drawCircle(
        color = Color(0xFF80D8FF).copy(alpha = 0.15f),
        radius = 160f,
        center = Offset(centerX, centerY - 100f)
    )

    // Slip rotation angle: In drift mode, car body rotates slightly relative to screen
    val visualSlipDeg = Math.toDegrees(car.driftAngle.toDouble()).toFloat() * 0.8f

    rotate(visualSlipDeg, pivot = Offset(centerX, centerY)) {
        val w = car.width
        val l = car.length

        // Car Body (Futuristic Cyberpunk Supercar)
        bodyPath.rewind()
        bodyPath.moveTo(centerX - w * 0.35f, centerY - l * 0.48f) // Front Left
        bodyPath.lineTo(centerX + w * 0.35f, centerY - l * 0.48f) // Front Right
        bodyPath.lineTo(centerX + w * 0.5f, centerY - l * 0.18f)  // Right Fender
        bodyPath.lineTo(centerX + w * 0.48f, centerY + l * 0.45f) // Rear Right
        bodyPath.lineTo(centerX - w * 0.48f, centerY + l * 0.45f) // Rear Left
        bodyPath.lineTo(centerX - w * 0.5f, centerY - l * 0.18f)  // Left Fender
        bodyPath.close()

        drawPath(bodyPath, color = Color(0xFF0D1B2A)) // Sleek Obsidian Chassis
        drawPath(bodyPath, color = Color(0xFF00E5FF), style = Stroke(width = 3f)) // Neon Cyan Accent Rim

        // Cockpit Glass Canopy
        glassPath.rewind()
        glassPath.moveTo(centerX - w * 0.28f, centerY - l * 0.22f)
        glassPath.lineTo(centerX + w * 0.28f, centerY - l * 0.22f)
        glassPath.lineTo(centerX + w * 0.24f, centerY + l * 0.18f)
        glassPath.lineTo(centerX - w * 0.24f, centerY + l * 0.18f)
        glassPath.close()
        drawPath(glassPath, color = Color(0xFF00F0FF).copy(alpha = 0.85f))

        // Rear Spoiler Wing
        spoilerPath.rewind()
        spoilerPath.moveTo(centerX - w * 0.52f, centerY + l * 0.42f)
        spoilerPath.lineTo(centerX + w * 0.52f, centerY + l * 0.42f)
        spoilerPath.lineTo(centerX + w * 0.46f, centerY + l * 0.48f)
        spoilerPath.lineTo(centerX - w * 0.46f, centerY + l * 0.48f)
        spoilerPath.close()
        drawPath(spoilerPath, color = Color(0xFFFF007F))

        // Glowing Taillights
        drawRect(Color(0xFFFF1744), topLeft = Offset(centerX - w * 0.44f, centerY + l * 0.45f), size = Size(10f, 4f))
        drawRect(Color(0xFFFF1744), topLeft = Offset(centerX + w * 0.44f - 10f, centerY + l * 0.45f), size = Size(10f, 4f))

        // Nitro Flame Jets when active
        if (car.isNitroActive) {
            val flameLen = 28f
            flamePath.rewind()
            flamePath.moveTo(centerX - 8f, centerY + l * 0.48f)
            flamePath.lineTo(centerX, centerY + l * 0.48f + flameLen)
            flamePath.lineTo(centerX + 8f, centerY + l * 0.48f)
            flamePath.close()
            drawPath(flamePath, color = Color(0xFF00F0FF))
            drawCircle(Color.White, radius = 5f, center = Offset(centerX, centerY + l * 0.48f + 6f))
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
    bannerSubPaint: Paint
) {
    val nativeCanvas = drawContext.canvas.nativeCanvas

    // 1. Top Left: Speedometer & RPM
    val speedText = "${engine.currentSpeedKmh}"
    nativeCanvas.drawText(speedText, 48f, 95f, speedPaint)
    nativeCanvas.drawText("KM/H", 155f, 95f, unitPaint)

    // RPM Speedometer Arc
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

    // 2. Top Center: Countdown Timer Badge
    val centerX = size.width / 2f
    val centerY = size.height / 2f
    val timeInt = ceil(engine.timeLeft).toInt()
    timerPaint.color = if (timeInt <= 5) 0xFFFF1744.toInt() else 0xFFFFD700.toInt()
    drawRoundRect(
        color = Color(0xFF0F172A).copy(alpha = 0.85f),
        topLeft = Offset(centerX - 90f, 40f),
        size = Size(180f, 65f),
        cornerRadius = CornerRadius(14f, 14f)
    )
    nativeCanvas.drawText("${timeInt}s", centerX, 92f, timerPaint)

    // 3. Top Right: Lap & Drift Score
    val lapText = "LAP ${engine.currentLap}/3"
    drawRoundRect(
        color = Color(0xFF1E1B4B).copy(alpha = 0.9f),
        topLeft = Offset(size.width - 240f, 40f),
        size = Size(190f, 75f),
        cornerRadius = CornerRadius(14f, 14f)
    )
    nativeCanvas.drawText(lapText, size.width - 225f, 75f, unitPaint)
    nativeCanvas.drawText("SCORE: ${engine.totalScore}", size.width - 225f, 105f, speedPaint.apply { textSize = 22f })

    // 4. Center Screen Floating Drift Banner
    if (engine.car.isDrifting && engine.currentDriftScoreDisplay > 0) {
        val multStr = String.format("%.1fx", engine.driftMultiplierDisplay)
        nativeCanvas.drawText("DRIFT $multStr  +${engine.currentDriftScoreDisplay}", centerX, centerY - 140f, bannerPaint)
    } else {
        engine.activeBanner?.let { banner ->
            bannerPaint.color = banner.color.toArgb()
            nativeCanvas.drawText(banner.text, centerX, centerY - 140f, bannerPaint)
            if (banner.subText.isNotEmpty()) {
                nativeCanvas.drawText(banner.subText, centerX, centerY - 100f, bannerSubPaint)
            }
        }
    }

    // 5. Nitro Gauge (Top Left below RPM)
    val nitroW = 160f
    val nitroRatio = (engine.nitroPercent / 100f).coerceIn(0f, 1f)
    drawRoundRect(
        color = Color(0xFF0F172A),
        topLeft = Offset(48f, 180f),
        size = Size(nitroW, 14f),
        cornerRadius = CornerRadius(7f, 7f)
    )
    drawRoundRect(
        color = Color(0xFF00E5FF),
        topLeft = Offset(48f, 180f),
        size = Size(nitroW * nitroRatio, 14f),
        cornerRadius = CornerRadius(7f, 7f)
    )
}

// -------------------------------------------------------------
// TOUCH CONTROLS (LANDSCAPE LAYOUT)
// -------------------------------------------------------------

@Composable
private fun GameTouchControls(engine: NeonDriftEngine) {
    Row(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom
    ) {
        // LEFT THUMB: Steering Controls
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Steer Left Button
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .background(Color(0xFF1E293B).copy(alpha = 0.82f), CircleShape)
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                engine.steerInput = -1.0f
                                tryAwaitRelease()
                                engine.steerInput = 0f
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Text("◄", fontSize = 28.sp, color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold)
            }

            // Steer Right Button
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .background(Color(0xFF1E293B).copy(alpha = 0.82f), CircleShape)
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                engine.steerInput = 1.0f
                                tryAwaitRelease()
                                engine.steerInput = 0f
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Text("►", fontSize = 28.sp, color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold)
            }
        }

        // RIGHT THUMB: Drift / Handbrake & Nitro Boost
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Handbrake / Drift Button (Magenta)
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(Color(0xFFFF007F).copy(alpha = 0.85f), CircleShape)
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                engine.driftInput = true
                                tryAwaitRelease()
                                engine.driftInput = false
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("💨", fontSize = 22.sp)
                    Text("DRIFT", fontSize = 11.sp, color = Color.White, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace)
                }
            }

            // Nitro Boost Button (Cyan)
            Box(
                modifier = Modifier
                    .size(84.dp)
                    .background(
                        if (engine.nitroPercent > 5f) Color(0xFF00E5FF).copy(alpha = 0.9f) else Color(0xFF475569).copy(alpha = 0.8f),
                        CircleShape
                    )
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                engine.nitroInput = true
                                tryAwaitRelease()
                                engine.nitroInput = false
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("⚡", fontSize = 24.sp)
                    Text("NITRO", fontSize = 11.sp, color = Color(0xFF002171), fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace)
                }
            }
        }
    }
}

// -------------------------------------------------------------
// MENUS & OVERLAYS
// -------------------------------------------------------------

@Composable
private fun StartMenuOverlay(
    highDriftScore: Int,
    bestLap: Float,
    onStart: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.78f)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                text = "NEON DRIFT",
                fontSize = 38.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFF00F0FF),
                fontFamily = FontFamily.Monospace,
                letterSpacing = 3.sp
            )

            Text(
                text = "CYBER CIRCUIT • DRIFT TIME ATTACK",
                fontSize = 13.sp,
                color = Color(0xFFFF007F),
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )

            Surface(
                color = Color(0xFF1E1B4B).copy(alpha = 0.9f),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF4338CA)),
                modifier = Modifier.padding(vertical = 8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 28.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(28.dp)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("RECORD DRIFT", color = Color(0xFF94A3B8), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                        Text("$highDriftScore PTS", color = Color(0xFFFFD700), fontSize = 20.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("BEST LAP", color = Color(0xFF94A3B8), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                        val lapStr = if (bestLap > 0f) String.format("%.2fs", bestLap) else "--"
                        Text(lapStr, color = Color(0xFF00F0FF), fontSize = 20.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            Button(
                onClick = onStart,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF)),
                modifier = Modifier
                    .width(260.dp)
                    .height(52.dp)
            ) {
                Text(
                    text = "START ENGINE",
                    color = Color(0xFF002171),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
            }

            Text(
                text = "Engineered by Ángel David Morillo García",
                fontSize = 11.sp,
                color = Color(0xFF64748B),
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 10.dp)
            )
        }
    }
}

@Composable
private fun RaceResultsOverlay(
    isWon: Boolean,
    score: Int,
    highScore: Int,
    laps: Int,
    onRestart: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.85f)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                text = if (isWon) "CIRCUIT COMPLETED!" else "TIME EXPIRED",
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                color = if (isWon) Color(0xFFFFD700) else Color(0xFFFF1744),
                fontFamily = FontFamily.Monospace,
                letterSpacing = 2.sp
            )

            Text(
                text = if (isWon) "3 LAPS CHAMPION • MASTER OF DRIFT" else "CHECKPOINTS MISSED • TRY AGAIN",
                fontSize = 12.sp,
                color = Color(0xFF94A3B8),
                fontFamily = FontFamily.Monospace
            )

            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                modifier = Modifier.width(320.dp).padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("TOTAL SCORE", color = Color(0xFF94A3B8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    Text("$score", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace)

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Laps Completed:", color = Color(0xFF94A3B8), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        Text("$laps / 3", color = Color(0xFF00F0FF), fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("High Score:", color = Color(0xFF94A3B8), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        Text("$highScore", color = Color(0xFFFFD700), fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            Button(
                onClick = onRestart,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF)),
                modifier = Modifier
                    .width(220.dp)
                    .height(48.dp)
            ) {
                Text(
                    text = "RACE AGAIN",
                    color = Color(0xFF002171),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

// -------------------------------------------------------------
// ANDROID STUDIO PREVIEWS
// -------------------------------------------------------------

@Preview(showBackground = true, widthDp = 720, heightDp = 360, name = "Start Menu Screen")
@Composable
fun StartMenuPreview() {
    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF070415))) {
        StartMenuOverlay(highDriftScore = 24500, bestLap = 42.15f, onStart = {})
    }
}

@Preview(showBackground = true, widthDp = 720, heightDp = 360, name = "Race Results Screen")
@Composable
fun RaceResultsPreview() {
    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF070415))) {
        RaceResultsOverlay(isWon = true, score = 38400, highScore = 42000, laps = 3, onRestart = {})
    }
}
