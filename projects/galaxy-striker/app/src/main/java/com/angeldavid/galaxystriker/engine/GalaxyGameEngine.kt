package com.angeldavid.galaxystriker.engine

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import com.angeldavid.galaxystriker.model.*
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

class GalaxyGameEngine(
    private val context: Context,
    private val soundManager: SoundManager
) {
    private val prefs = context.getSharedPreferences("galaxy_striker_prefs", Context.MODE_PRIVATE)

    var gameState: GameState by mutableStateOf(GameState.MENU)
        internal set

    var score: Int by mutableIntStateOf(0)
        private set

    var highScore: Int by mutableIntStateOf(prefs.getInt("high_score", 0))
        private set

    var wave: Int by mutableIntStateOf(1)
        private set

    var shockwaveRadius: Float = 0f
        private set

    val stars = ArrayList<Star>(50)
    val lasers = ArrayList<Laser>(30)
    val enemies = ArrayList<Enemy>(12)
    val particles = ArrayList<Particle>(60)
    val powerUps = ArrayList<PowerUp>(6)
    val floatingTexts = ArrayList<FloatingText>(8)

    val player = Player()

    private var laserCooldown = 0f
    private var enemySpawnCooldown = 0f
    private var screenWidth = 1080f
    private var screenHeight = 2200f
    private var initialized = false

    fun initDimensions(width: Float, height: Float) {
        if (width <= 0f || height <= 0f) return
        screenWidth = width
        screenHeight = height

        if (!initialized) {
            initialized = true
            player.x = width / 2f
            player.y = height * 0.82f

            // Populate optimized starfield (45 stars)
            stars.clear()
            for (i in 0 until 45) {
                val speed = Random.nextFloat() * 260f + 60f
                val size = if (speed > 220f) 3.0f else if (speed > 140f) 2.0f else 1.2f
                val alpha = if (speed > 220f) 0.85f else if (speed > 140f) 0.55f else 0.35f
                val color = if (Random.nextFloat() < 0.2f) Color(0xFF64B5F6) else Color.White
                stars.add(
                    Star(
                        x = Random.nextFloat() * width,
                        y = Random.nextFloat() * height,
                        speed = speed,
                        size = size,
                        color = color.copy(alpha = alpha)
                    )
                )
            }
        }
    }

    fun startGame() {
        score = 0
        wave = 1
        shockwaveRadius = 0f
        player.health = player.maxHealth
        player.shield = player.maxShield
        player.powerLevel = 1
        player.bombCount = 2
        player.powerUpTimer = 0f
        player.x = screenWidth / 2f
        player.y = screenHeight * 0.82f

        lasers.clear()
        enemies.clear()
        particles.clear()
        powerUps.clear()
        floatingTexts.clear()

        gameState = GameState.PLAYING
    }

    fun onTouchMove(targetX: Float, targetY: Float) {
        if (gameState != GameState.PLAYING) return
        val padding = player.width / 2f
        player.x = (player.x + (targetX - player.x) * 0.45f).coerceIn(padding, screenWidth - padding)
        player.y = (player.y + (targetY - player.y) * 0.45f).coerceIn(120f, screenHeight - 120f)
    }

    fun triggerNovaBomb(): Boolean {
        if (gameState != GameState.PLAYING || player.bombCount <= 0) return false
        player.bombCount--
        soundManager.playBombSound()
        shockwaveRadius = 10f

        for (i in 0 until enemies.size) {
            val enemy = enemies[i]
            createExplosion(enemy.x, enemy.y, enemy.type.width, Color(0xFFFF5252))
            score += enemy.type.scoreValue
        }
        enemies.clear()
        floatingTexts.add(FloatingText("NOVA DETONATION!", screenWidth / 2f, screenHeight / 2f, Color(0xFFFFD700)))
        return true
    }

    fun update(dt: Float) {
        val clampedDt = dt.coerceIn(0.001f, 0.04f)

        // Star parallax update
        for (i in 0 until stars.size) {
            val star = stars[i]
            star.y += star.speed * clampedDt
            if (star.y > screenHeight) {
                star.y = 0f
                star.x = Random.nextFloat() * screenWidth
            }
        }

        if (gameState != GameState.PLAYING) return

        // Shockwave animation
        if (shockwaveRadius > 0f) {
            shockwaveRadius += 1600f * clampedDt
            if (shockwaveRadius > screenHeight * 1.2f) shockwaveRadius = 0f
        }

        // Power-up duration
        if (player.powerUpTimer > 0f) {
            player.powerUpTimer -= clampedDt
            if (player.powerUpTimer <= 0f) {
                player.powerLevel = 1
                floatingTexts.add(FloatingText("BLASTERS NORMAL", player.x, player.y - 60f, Color.White))
            }
        }

        // Passive shield recharge
        if (player.shield < player.maxShield) {
            player.shield = (player.shield + 2.5f * clampedDt).coerceAtMost(player.maxShield)
        }

        // Auto-fire weapons
        laserCooldown -= clampedDt
        val fireCadence = if (player.powerLevel >= 3) 0.13f else if (player.powerLevel == 2) 0.17f else 0.22f
        if (laserCooldown <= 0f) {
            laserCooldown = fireCadence
            soundManager.playLaserSound()
            when (player.powerLevel) {
                1 -> {
                    lasers.add(Laser(x = player.x, y = player.y - player.height / 2f))
                }
                2 -> {
                    lasers.add(Laser(x = player.x - 18f, y = player.y - player.height / 2f))
                    lasers.add(Laser(x = player.x + 18f, y = player.y - player.height / 2f))
                }
                else -> {
                    lasers.add(Laser(x = player.x, y = player.y - player.height / 2f))
                    lasers.add(Laser(x = player.x - 24f, y = player.y - player.height / 3f, vy = -1100f))
                    lasers.add(Laser(x = player.x + 24f, y = player.y - player.height / 3f, vy = -1100f))
                }
            }
        }

        // Move Lasers
        for (i in lasers.indices.reversed()) {
            val laser = lasers[i]
            laser.y += laser.vy * clampedDt
            if (laser.y < -50f || laser.y > screenHeight + 50f) {
                lasers.removeAt(i)
            }
        }

        // Spawn Enemies (max 7 active enemies to ensure smooth FPS)
        enemySpawnCooldown -= clampedDt
        if (enemySpawnCooldown <= 0f && enemies.size < 7) {
            val spawnInterval = (1.5f - (wave * 0.08f)).coerceAtLeast(0.6f)
            enemySpawnCooldown = spawnInterval
            spawnEnemyWave()
        }

        // Move Enemies
        for (i in enemies.indices.reversed()) {
            val enemy = enemies[i]
            enemy.y += enemy.vy * clampedDt
            enemy.x += enemy.vx * clampedDt

            if (enemy.x < enemy.type.width / 2f || enemy.x > screenWidth - enemy.type.width / 2f) {
                enemy.vx = -enemy.vx
            }

            if (enemy.type == EnemyType.ASTEROID) {
                enemy.rotationAngle += 45f * clampedDt
            }

            if (enemy.type == EnemyType.CRUISER || enemy.type == EnemyType.BOSS_TITAN) {
                enemy.shootCooldown -= clampedDt
                if (enemy.shootCooldown <= 0f) {
                    enemy.shootCooldown = if (enemy.type == EnemyType.BOSS_TITAN) 1.0f else 1.9f
                    lasers.add(
                        Laser(
                            x = enemy.x,
                            y = enemy.y + enemy.type.height / 2f,
                            vy = 520f,
                            isEnemy = true,
                            color = Color(0xFFFF1744)
                        )
                    )
                }
            }

            if (enemy.y > screenHeight + 80f) {
                enemies.removeAt(i)
            }
        }

        // Move PowerUps
        for (i in powerUps.indices.reversed()) {
            val p = powerUps[i]
            p.y += p.vy * clampedDt
            if (p.y > screenHeight + 50f) powerUps.removeAt(i)
        }

        // Move Particles
        for (i in particles.indices.reversed()) {
            val p = particles[i]
            p.x += p.vx * clampedDt
            p.y += p.vy * clampedDt
            p.life -= clampedDt
            if (p.life <= 0f) particles.removeAt(i)
        }

        // Move Floating Text
        for (i in floatingTexts.indices.reversed()) {
            val t = floatingTexts[i]
            t.y -= 75f * clampedDt
            t.life -= clampedDt * 0.9f
            if (t.life <= 0f) floatingTexts.removeAt(i)
        }

        // OPTIMIZED ZERO-ALLOCATION COLLISION DETECTION
        // 1. Player Lasers vs Enemies
        for (i in lasers.indices.reversed()) {
            val laser = lasers[i]
            if (laser.isEnemy) continue
            for (j in enemies.indices.reversed()) {
                val enemy = enemies[j]
                val halfW = (laser.width + enemy.type.width) * 0.5f
                val halfH = (laser.height + enemy.type.height) * 0.5f
                if (abs(laser.x - enemy.x) < halfW && abs(laser.y - enemy.y) < halfH) {
                    laser.y = -9999f
                    enemy.health -= 35f
                    createHitSpark(laser.x, laser.y)

                    if (enemy.health <= 0f) {
                        enemy.y = screenHeight + 9999f
                        onEnemyDestroyed(enemy)
                    }
                    break
                }
            }
        }

        // 2. Enemy Lasers vs Player
        val pRadiusX = player.width * 0.4f
        val pRadiusY = player.height * 0.4f
        for (i in lasers.indices) {
            val laser = lasers[i]
            if (!laser.isEnemy) continue
            if (abs(laser.x - player.x) < (laser.width * 0.5f + pRadiusX) &&
                abs(laser.y - player.y) < (laser.height * 0.5f + pRadiusY)) {
                laser.y = screenHeight + 9999f
                damagePlayer(20f)
            }
        }

        // 3. Enemies ramming Player
        for (i in enemies.indices) {
            val enemy = enemies[i]
            if (abs(enemy.x - player.x) < (enemy.type.width * 0.4f + pRadiusX) &&
                abs(enemy.y - player.y) < (enemy.type.height * 0.4f + pRadiusY)) {
                enemy.y = screenHeight + 9999f
                createExplosion(enemy.x, enemy.y, enemy.type.width, Color(0xFFFF5252))
                damagePlayer(35f)
            }
        }

        // 4. PowerUps vs Player
        for (i in powerUps.indices) {
            val powerUp = powerUps[i]
            if (abs(powerUp.x - player.x) < (powerUp.width * 0.5f + pRadiusX) &&
                abs(powerUp.y - player.y) < (powerUp.height * 0.5f + pRadiusY)) {
                powerUp.y = screenHeight + 9999f
                soundManager.playPowerUpSound()
                when (powerUp.type) {
                    PowerUpType.DOUBLE_BLASTER -> {
                        player.powerLevel = (player.powerLevel + 1).coerceAtMost(3)
                        player.powerUpTimer = 12f
                        floatingTexts.add(FloatingText("BLASTER BOOST!", player.x, player.y - 70f, Color(0xFF00E676)))
                    }
                    PowerUpType.SHIELD_RESTORE -> {
                        player.shield = (player.shield + 50f).coerceAtMost(player.maxShield)
                        floatingTexts.add(FloatingText("SHIELD RECHARGED!", player.x, player.y - 70f, Color(0xFF00E5FF)))
                    }
                    PowerUpType.NOVA_BOMB -> {
                        player.bombCount = (player.bombCount + 1).coerceAtMost(3)
                        floatingTexts.add(FloatingText("+1 NOVA BOMB!", player.x, player.y - 70f, Color(0xFFFFD700)))
                    }
                }
            }
        }

        // Clean dead elements
        lasers.removeAll { it.y < -50f || it.y > screenHeight + 50f }
        enemies.removeAll { it.y > screenHeight + 80f }
        powerUps.removeAll { it.y > screenHeight + 50f }

        if (score > highScore) {
            highScore = score
            prefs.edit().putInt("high_score", highScore).apply()
        }

        val currentWave = (score / 200) + 1
        if (currentWave > wave) {
            wave = currentWave
            floatingTexts.add(FloatingText("WAVE $wave INCOMING", screenWidth / 2f, screenHeight * 0.35f, Color(0xFFFFAB00)))
        }
    }

    private fun spawnEnemyWave() {
        val rand = Random.nextFloat()
        val spawnX = Random.nextFloat() * (screenWidth - 140f) + 70f

        if (score >= 500 && score % 600 in 0..60 && enemies.none { it.type == EnemyType.BOSS_TITAN }) {
            enemies.add(
                Enemy(
                    x = screenWidth / 2f,
                    y = -120f,
                    vx = 80f,
                    vy = 55f,
                    type = EnemyType.BOSS_TITAN
                )
            )
            floatingTexts.add(FloatingText("WARNING: TITAN MOTHERSHIP", screenWidth / 2f, 250f, Color(0xFFFF1744)))
            return
        }

        when {
            rand < 0.50f -> {
                enemies.add(
                    Enemy(
                        x = spawnX,
                        y = -50f,
                        vx = (Random.nextFloat() * 110f - 55f),
                        vy = Random.nextFloat() * 90f + 240f,
                        type = EnemyType.SCOUT
                    )
                )
            }
            rand < 0.82f -> {
                enemies.add(
                    Enemy(
                        x = spawnX,
                        y = -70f,
                        vx = (Random.nextFloat() * 70f - 35f),
                        vy = Random.nextFloat() * 50f + 170f,
                        type = EnemyType.CRUISER
                    )
                )
            }
            else -> {
                enemies.add(
                    Enemy(
                        x = spawnX,
                        y = -80f,
                        vx = (Random.nextFloat() * 30f - 15f),
                        vy = Random.nextFloat() * 30f + 130f,
                        type = EnemyType.ASTEROID
                    )
                )
            }
        }
    }

    private fun onEnemyDestroyed(enemy: Enemy) {
        soundManager.playExplosionSound()
        score += enemy.type.scoreValue
        floatingTexts.add(FloatingText("+${enemy.type.scoreValue}", enemy.x, enemy.y, Color(0xFFFFD54F)))

        val explosionColor = when (enemy.type) {
            EnemyType.SCOUT -> Color(0xFFFFCA28)
            EnemyType.CRUISER -> Color(0xFFFF3D00)
            EnemyType.ASTEROID -> Color(0xFF8D6E63)
            EnemyType.BOSS_TITAN -> Color(0xFFD500F9)
        }
        createExplosion(enemy.x, enemy.y, enemy.type.width, explosionColor)

        if (Random.nextFloat() < 0.22f) {
            val type = when (Random.nextInt(3)) {
                0 -> PowerUpType.DOUBLE_BLASTER
                1 -> PowerUpType.SHIELD_RESTORE
                else -> PowerUpType.NOVA_BOMB
            }
            powerUps.add(PowerUp(x = enemy.x, y = enemy.y, type = type))
        }
    }

    private fun damagePlayer(amount: Float) {
        soundManager.playExplosionSound()
        createExplosion(player.x, player.y, 35f, Color(0xFF00E5FF))

        if (player.shield > 0f) {
            player.shield -= amount
            if (player.shield < 0f) {
                player.health += player.shield
                player.shield = 0f
            }
        } else {
            player.health -= amount
        }

        if (player.health <= 0f) {
            player.health = 0f
            gameState = GameState.GAME_OVER
            soundManager.playBombSound()
            createExplosion(player.x, player.y, 80f, Color(0xFFFF3D00))
        }
    }

    private fun createExplosion(x: Float, y: Float, radius: Float, color: Color) {
        // Reduced to 14 particles for max frame rate without sacrificing beauty
        val count = 14
        for (i in 0 until count) {
            val angle = Random.nextFloat() * Math.PI.toFloat() * 2f
            val speed = Random.nextFloat() * 300f + 60f
            val life = Random.nextFloat() * 0.35f + 0.2f
            particles.add(
                Particle(
                    x = x,
                    y = y,
                    vx = cos(angle) * speed,
                    vy = sin(angle) * speed,
                    size = Random.nextFloat() * 3.5f + 2f,
                    color = color,
                    life = life,
                    maxLife = life
                )
            )
        }
    }

    private fun createHitSpark(x: Float, y: Float) {
        for (i in 0 until 3) {
            val angle = Random.nextFloat() * Math.PI.toFloat() * 2f
            val speed = Random.nextFloat() * 150f + 30f
            particles.add(
                Particle(
                    x = x,
                    y = y,
                    vx = cos(angle) * speed,
                    vy = sin(angle) * speed,
                    size = 2f,
                    color = Color(0xFF80D8FF),
                    life = 0.12f,
                    maxLife = 0.12f
                )
            )
        }
    }
}
