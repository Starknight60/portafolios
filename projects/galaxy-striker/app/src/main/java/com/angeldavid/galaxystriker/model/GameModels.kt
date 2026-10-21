package com.angeldavid.galaxystriker.model

import androidx.compose.ui.graphics.Color
import kotlin.random.Random

enum class GameState {
    MENU,
    PLAYING,
    GAME_OVER
}

enum class EnemyType(
    val maxHealth: Float,
    val scoreValue: Int,
    val width: Float,
    val height: Float
) {
    SCOUT(maxHealth = 25f, scoreValue = 20, width = 45f, height = 45f),
    CRUISER(maxHealth = 60f, scoreValue = 50, width = 65f, height = 65f),
    ASTEROID(maxHealth = 90f, scoreValue = 80, width = 75f, height = 75f),
    BOSS_TITAN(maxHealth = 450f, scoreValue = 350, width = 160f, height = 110f)
}

enum class PowerUpType {
    DOUBLE_BLASTER,
    SHIELD_RESTORE,
    NOVA_BOMB
}

data class Star(
    var x: Float,
    var y: Float,
    val speed: Float,
    val size: Float,
    val color: Color
)

data class Player(
    var x: Float = 500f,
    var y: Float = 1500f,
    val width: Float = 60f,
    val height: Float = 70f,
    var health: Float = 100f,
    val maxHealth: Float = 100f,
    var shield: Float = 100f,
    val maxShield: Float = 100f,
    var powerLevel: Int = 1,
    var bombCount: Int = 2,
    var powerUpTimer: Float = 0f
)

data class Laser(
    var x: Float,
    var y: Float,
    val width: Float = 6f,
    val height: Float = 22f,
    val vy: Float = -1200f,
    val isEnemy: Boolean = false,
    val color: Color = Color(0xFF00FFCC)
)

data class Enemy(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    val type: EnemyType,
    var health: Float = type.maxHealth,
    var shootCooldown: Float = Random.nextFloat() * 1.5f + 1f,
    var rotationAngle: Float = 0f
)

data class Particle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var size: Float,
    val color: Color,
    var life: Float,
    val maxLife: Float
)

data class PowerUp(
    var x: Float,
    var y: Float,
    val type: PowerUpType,
    val width: Float = 36f,
    val height: Float = 36f,
    var vy: Float = 220f
)

data class FloatingText(
    val text: String,
    var x: Float,
    var y: Float,
    val color: Color,
    var life: Float = 1.0f
)
