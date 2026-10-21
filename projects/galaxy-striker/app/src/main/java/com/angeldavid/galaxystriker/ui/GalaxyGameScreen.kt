@file:Suppress("SpellCheckingInspection")

package com.angeldavid.galaxystriker.ui

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
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
import com.angeldavid.galaxystriker.engine.GalaxyGameEngine
import com.angeldavid.galaxystriker.engine.SoundManager
import com.angeldavid.galaxystriker.model.*
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

@Composable
fun GalaxyGameScreen() {
    val context = LocalContext.current
    val soundManager = remember { SoundManager(context) }
    val engine = remember { GalaxyGameEngine(context, soundManager) }

    // High refresh rate 60/120 FPS game loop clock
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

    // Pre-allocated reusable paths to prevent Garbage Collector (GC) stutter
    val shipPath = remember { Path() }
    val flamePath = remember { Path() }
    val cockpitPath = remember { Path() }
    val enemyPath = remember { Path() }
    val rockPath = remember { Path() }

    // Pre-cached native text paints for zero-overhead GPU text rendering
    val textPaint = remember {
        Paint().apply {
            color = android.graphics.Color.WHITE
            textSize = 50f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.LEFT
        }
    }
    val labelLeftPaint = remember {
        Paint().apply {
            color = 0xFF90CAF9.toInt()
            textSize = 26f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.LEFT
        }
    }
    val labelRightPaint = remember {
        Paint().apply {
            color = 0xFF90CAF9.toInt()
            textSize = 26f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.RIGHT
        }
    }
    val bestScorePaint = remember {
        Paint().apply {
            color = 0xFFFFD54F.toInt()
            textSize = 42f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.RIGHT
        }
    }
    val wavePaint = remember {
        Paint().apply {
            color = 0xFFFFCA28.toInt()
            textSize = 28f
            isAntiAlias = true
            typeface = Typeface.MONOSPACE
            textAlign = Paint.Align.CENTER
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF060814))
    ) {
        // High-performance Hardware Accelerated Canvas
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectDragGestures { change, _ ->
                        change.consume()
                        engine.onTouchMove(change.position.x, change.position.y)
                    }
                }
        ) {
            // Subscribe Canvas draw phase to 60 FPS clock without recomposition
            if (frameTick == -1L) return@Canvas

            if (size.width <= 0f || size.height <= 0f) return@Canvas
            engine.initDimensions(size.width, size.height)

            // 1. Draw Parallax Starfield
            for (i in 0 until engine.stars.size) {
                val star = engine.stars[i]
                drawCircle(
                    color = star.color,
                    radius = star.size,
                    center = Offset(star.x, star.y)
                )
            }

            // 2. Draw Nova Bomb Shockwave
            if (engine.shockwaveRadius > 0f) {
                drawCircle(
                    color = Color(0xFFFFD54F).copy(alpha = 0.5f),
                    radius = engine.shockwaveRadius,
                    center = Offset(engine.player.x, engine.player.y),
                    style = Stroke(width = 10f)
                )
            }

            // 3. Draw Power-Ups
            for (i in 0 until engine.powerUps.size) {
                drawPowerUp(engine.powerUps[i])
            }

            // 4. Draw Lasers
            for (i in 0 until engine.lasers.size) {
                val laser = engine.lasers[i]
                drawRoundRect(
                    color = laser.color,
                    topLeft = Offset(laser.x - laser.width / 2f, laser.y - laser.height / 2f),
                    size = Size(laser.width, laser.height),
                    cornerRadius = CornerRadius(4f, 4f)
                )
            }

            // 5. Draw Enemies
            for (i in 0 until engine.enemies.size) {
                drawEnemy(engine.enemies[i], enemyPath, rockPath)
            }

            // 6. Draw Player Ship
            if (engine.gameState == GameState.PLAYING) {
                drawPlayerShip(engine.player, shipPath, flamePath, cockpitPath)
            }

            // 7. Draw Particles
            for (i in 0 until engine.particles.size) {
                val particle = engine.particles[i]
                val alpha = (particle.life / particle.maxLife).coerceIn(0f, 1f)
                drawCircle(
                    color = particle.color.copy(alpha = alpha),
                    radius = particle.size * alpha,
                    center = Offset(particle.x, particle.y)
                )
            }

            // 8. Draw In-Game HUD directly on Canvas (Ultra-low CPU overhead)
            if (engine.gameState == GameState.PLAYING) {
                drawInGameHUD(
                    engine = engine,
                    size = size,
                    textPaint = textPaint,
                    labelLeftPaint = labelLeftPaint,
                    labelRightPaint = labelRightPaint,
                    bestScorePaint = bestScorePaint,
                    wavePaint = wavePaint
                )
            }
        }

        // Nova Bomb Touch Button Overlay (Only when playing)
        if (engine.gameState == GameState.PLAYING) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(end = 24.dp, bottom = 44.dp),
                contentAlignment = Alignment.BottomEnd
            ) {
                IconButton(
                    onClick = { engine.triggerNovaBomb() },
                    modifier = Modifier
                        .size(66.dp)
                        .background(
                            if (engine.player.bombCount > 0) Color(0xFFFFD600) else Color(0xFF424242),
                            CircleShape
                        )
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("💣", fontSize = 20.sp)
                        Text(
                            text = "x${engine.player.bombCount}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.Black,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }

        // Start Menu Overlay
        if (engine.gameState == GameState.MENU) {
            StartMenuOverlay(
                highScore = engine.highScore,
                onStart = { engine.startGame() }
            )
        }

        // Game Over Overlay
        if (engine.gameState == GameState.GAME_OVER) {
            GameOverOverlay(
                score = engine.score,
                highScore = engine.highScore,
                wave = engine.wave,
                onRestart = { engine.startGame() }
            )
        }
    }
}

// -------------------------------------------------------------
// ZERO-ALLOCATION DRAWING PIPELINES
// -------------------------------------------------------------

private fun DrawScope.drawInGameHUD(
    engine: GalaxyGameEngine,
    size: Size,
    textPaint: Paint,
    labelLeftPaint: Paint,
    labelRightPaint: Paint,
    bestScorePaint: Paint,
    wavePaint: Paint
) {
    if (size.width <= 0f || size.height <= 0f) return
    val nativeCanvas = drawContext.canvas.nativeCanvas

    // Top HUD: Score & High Score
    nativeCanvas.drawText("SCORE", 48f, 100f, labelLeftPaint)
    nativeCanvas.drawText("${engine.score}", 48f, 155f, textPaint)

    val rightMargin = (size.width - 48f).coerceAtLeast(120f)
    nativeCanvas.drawText("BEST", rightMargin, 100f, labelRightPaint)
    nativeCanvas.drawText("${engine.highScore}", rightMargin, 150f, bestScorePaint)

    // Wave indicator badge
    val waveText = "WAVE ${engine.wave}"
    val waveX = size.width / 2f
    drawRoundRect(
        color = Color(0xFF1E293B).copy(alpha = 0.85f),
        topLeft = Offset(waveX - 70f, 75f),
        size = Size(140f, 44f),
        cornerRadius = CornerRadius(12f, 12f)
    )
    nativeCanvas.drawText(waveText, waveX, 107f, wavePaint)

    // Bottom Left HUD: Shield Bar & Hull Health Bar
    val barX = 48f
    val barWidth = 240f
    val shieldY = (size.height - 110f).coerceAtLeast(60f)
    val healthY = (size.height - 85f).coerceAtLeast(85f)

    // Shield Bar (Cyan)
    val shieldPercent = (engine.player.shield / engine.player.maxShield).coerceIn(0f, 1f)
    drawRoundRect(
        color = Color(0xFF0A2540),
        topLeft = Offset(barX, shieldY),
        size = Size(barWidth, 12f),
        cornerRadius = CornerRadius(6f, 6f)
    )
    drawRoundRect(
        color = Color(0xFF00E5FF),
        topLeft = Offset(barX, shieldY),
        size = Size(barWidth * shieldPercent, 12f),
        cornerRadius = CornerRadius(6f, 6f)
    )

    // Health Bar (Green / Red)
    val healthPercent = (engine.player.health / engine.player.maxHealth).coerceIn(0f, 1f)
    drawRoundRect(
        color = Color(0xFF1B5E20),
        topLeft = Offset(barX, healthY),
        size = Size(barWidth, 16f),
        cornerRadius = CornerRadius(8f, 8f)
    )
    drawRoundRect(
        color = if (engine.player.health > 40f) Color(0xFF00E676) else Color(0xFFFF1744),
        topLeft = Offset(barX, healthY),
        size = Size(barWidth * healthPercent, 16f),
        cornerRadius = CornerRadius(8f, 8f)
    )
}

private fun DrawScope.drawPlayerShip(
    player: Player,
    shipPath: Path,
    flamePath: Path,
    cockpitPath: Path
) {
    val px = player.x
    val py = player.y

    // Reusable Thruster Flame Path
    flamePath.rewind()
    val flameLength = Random.nextFloat() * 14f + 18f
    flamePath.moveTo(px - 10f, py + 30f)
    flamePath.lineTo(px, py + 30f + flameLength)
    flamePath.lineTo(px + 10f, py + 30f)
    flamePath.close()
    drawPath(flamePath, color = Color(0xFF00E5FF))

    // Reusable Ship Hull Path
    shipPath.rewind()
    shipPath.moveTo(px, py - 35f)
    shipPath.lineTo(px + 28f, py + 22f)
    shipPath.lineTo(px + 18f, py + 28f)
    shipPath.lineTo(px + 8f, py + 18f)
    shipPath.lineTo(px - 8f, py + 18f)
    shipPath.lineTo(px - 18f, py + 28f)
    shipPath.lineTo(px - 28f, py + 22f)
    shipPath.close()
    drawPath(shipPath, color = Color(0xFF2979FF))

    // Wing Cannons
    drawRect(Color(0xFF00E5FF), topLeft = Offset(px - 26f, py - 6f), size = Size(4f, 20f))
    drawRect(Color(0xFF00E5FF), topLeft = Offset(px + 22f, py - 6f), size = Size(4f, 20f))

    // Reusable Cockpit Path
    cockpitPath.rewind()
    cockpitPath.moveTo(px, py - 18f)
    cockpitPath.lineTo(px + 7f, py + 2f)
    cockpitPath.lineTo(px - 7f, py + 2f)
    cockpitPath.close()
    drawPath(cockpitPath, color = Color(0xFFE0F7FA))

    // Shield Force Field Bubble
    if (player.shield > 0f) {
        val shieldAlpha = (player.shield / player.maxShield * 0.45f).coerceIn(0.15f, 0.5f)
        drawCircle(
            color = Color(0xFF00E5FF).copy(alpha = shieldAlpha),
            radius = 48f,
            center = Offset(px, py)
        )
        drawCircle(
            color = Color(0xFF80D8FF).copy(alpha = shieldAlpha + 0.2f),
            radius = 48f,
            center = Offset(px, py),
            style = Stroke(width = 3f)
        )
    }
}

private fun DrawScope.drawEnemy(
    enemy: Enemy,
    enemyPath: Path,
    rockPath: Path
) {
    val ex = enemy.x
    val ey = enemy.y

    when (enemy.type) {
        EnemyType.SCOUT -> {
            enemyPath.rewind()
            enemyPath.moveTo(ex, ey + 22f)
            enemyPath.lineTo(ex - 20f, ey - 18f)
            enemyPath.lineTo(ex, ey - 8f)
            enemyPath.lineTo(ex + 20f, ey - 18f)
            enemyPath.close()
            drawPath(enemyPath, color = Color(0xFFFFB300))
            drawCircle(Color(0xFFFF1744), radius = 4f, center = Offset(ex, ey))
        }

        EnemyType.CRUISER -> {
            enemyPath.rewind()
            enemyPath.moveTo(ex, ey + 32f)
            enemyPath.lineTo(ex + 30f, ey - 12f)
            enemyPath.lineTo(ex + 16f, ey - 28f)
            enemyPath.lineTo(ex - 16f, ey - 28f)
            enemyPath.lineTo(ex - 30f, ey - 12f)
            enemyPath.close()
            drawPath(enemyPath, color = Color(0xFFD50000))
            drawCircle(Color(0xFFFFEA00), radius = 6f, center = Offset(ex, ey - 4f))
        }

        EnemyType.ASTEROID -> {
            rotate(enemy.rotationAngle, pivot = Offset(ex, ey)) {
                val r = enemy.type.width / 2f
                rockPath.rewind()
                val points = 8
                for (i in 0 until points) {
                    val angle = i * (Math.PI * 2.0 / points)
                    val variance = if (i % 2 == 0) r else r * 0.78f
                    val px = ex + cos(angle).toFloat() * variance
                    val py = ey + sin(angle).toFloat() * variance
                    if (i == 0) rockPath.moveTo(px, py) else rockPath.lineTo(px, py)
                }
                rockPath.close()
                drawPath(rockPath, color = Color(0xFF795548))
                drawCircle(Color(0xFF5D4037), radius = 7f, center = Offset(ex - 10f, ey - 8f))
            }
        }

        EnemyType.BOSS_TITAN -> {
            val bw = enemy.type.width
            val bh = enemy.type.height
            drawRoundRect(
                color = Color(0xFF4A148C),
                topLeft = Offset(ex - bw / 2f, ey - bh / 2f),
                size = Size(bw, bh),
                cornerRadius = CornerRadius(16f, 16f)
            )
            drawRect(Color(0xFF00E5FF), topLeft = Offset(ex - bw / 3f, ey + bh / 3f), size = Size(10f, 18f))
            drawRect(Color(0xFF00E5FF), topLeft = Offset(ex + bw / 3f - 10f, ey + bh / 3f), size = Size(10f, 18f))
            drawCircle(Color(0xFFFF1744), radius = 16f, center = Offset(ex, ey))

            val healthPercent = (enemy.health / enemy.type.maxHealth).coerceIn(0f, 1f)
            drawRect(Color(0xFF212121), topLeft = Offset(ex - 60f, ey - bh / 2f - 18f), size = Size(120f, 8f))
            drawRect(Color(0xFFFF1744), topLeft = Offset(ex - 60f, ey - bh / 2f - 18f), size = Size(120f * healthPercent, 8f))
        }
    }
}

private fun DrawScope.drawPowerUp(powerUp: PowerUp) {
    val px = powerUp.x
    val py = powerUp.y
    val r = powerUp.width / 2f

    val color = when (powerUp.type) {
        PowerUpType.DOUBLE_BLASTER -> Color(0xFF00E676)
        PowerUpType.SHIELD_RESTORE -> Color(0xFF00B0FF)
        PowerUpType.NOVA_BOMB -> Color(0xFFFFD600)
    }

    drawCircle(color.copy(alpha = 0.25f), radius = r * 1.3f, center = Offset(px, py))
    drawCircle(color, radius = r, center = Offset(px, py))
    drawCircle(Color.White, radius = r * 0.45f, center = Offset(px, py))
}

// -------------------------------------------------------------
// MENUS (START AND GAME OVER)
// -------------------------------------------------------------

@Composable
private fun StartMenuOverlay(
    highScore: Int,
    onStart: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.72f)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.padding(28.dp)
        ) {
            Text(
                text = "GALAXY STRIKER",
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFF00E5FF),
                fontFamily = FontFamily.Monospace,
                letterSpacing = 2.sp
            )

            Text(
                text = "Arcade Space Shooter • 60 FPS Engine",
                fontSize = 12.sp,
                color = Color(0xFF90CAF9),
                fontFamily = FontFamily.Monospace
            )

            Surface(
                color = Color(0xFF1E293B).copy(alpha = 0.9f),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                modifier = Modifier.padding(vertical = 12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("ALL-TIME HIGH SCORE", color = Color(0xFF64748B), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Text("$highScore", color = Color(0xFFFFD54F), fontSize = 26.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                }
            }

            Button(
                onClick = onStart,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .height(54.dp)
            ) {
                Text(
                    text = "LAUNCH FIGHTER",
                    color = Color(0xFF002171),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
            }

            Text(
                text = "Engineered by Ángel David Morillo García",
                fontSize = 11.sp,
                color = Color(0xFF64748B),
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 18.dp)
            )
        }
    }
}

@Composable
private fun GameOverOverlay(
    score: Int,
    highScore: Int,
    wave: Int,
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
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.padding(32.dp)
        ) {
            Text(
                text = "MISSION FAILED",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFFFF1744),
                fontFamily = FontFamily.Monospace,
                letterSpacing = 2.sp
            )

            Text(
                text = "HULL INTEGRITY COMPROMISED",
                fontSize = 11.sp,
                color = Color(0xFFFF8A80),
                fontFamily = FontFamily.Monospace
            )

            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .padding(vertical = 12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("FINAL SCORE", color = Color(0xFF94A3B8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    Text("$score", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace)

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(Color(0xFF334155))
                            .padding(vertical = 4.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Sector Reached:", color = Color(0xFF94A3B8), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        Text("Wave $wave", color = Color(0xFFFFCA28), fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Personal Best:", color = Color(0xFF94A3B8), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        Text("$highScore", color = Color(0xFF00E5FF), fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            Button(
                onClick = onRestart,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .height(52.dp)
            ) {
                Text(
                    text = "REDEPLOY",
                    color = Color(0xFF002171),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

// -------------------------------------------------------------
// ANDROID STUDIO COMPOSE PREVIEWS
// -------------------------------------------------------------

@Preview(showBackground = true, name = "Start Menu Screen")
@Composable
fun StartMenuPreview() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF060814))
    ) {
        StartMenuOverlay(highScore = 1450, onStart = {})
    }
}

@Preview(showBackground = true, name = "Game Over Screen")
@Composable
fun GameOverPreview() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF060814))
    ) {
        GameOverOverlay(score = 820, highScore = 1450, wave = 4, onRestart = {})
    }
}
