package com.angeldavid.neondrift.model

import androidx.compose.ui.graphics.Color

enum class GameState {
    MENU,
    RACING,
    LAP_FINISHED,
    TIME_OUT
}

data class Car(
    var x: Float = 0f,
    var y: Float = 0f,
    var angle: Float = 0f, // Direction car is facing (radians)
    var velocity: Float = 0f, // Forward speed (px/sec)
    var angularVelocity: Float = 0f,
    var driftAngle: Float = 0f, // Slip angle between car heading and movement direction
    var isDrifting: Boolean = false,
    var driftScore: Float = 0f,
    var driftMultiplier: Float = 1.0f,
    var nitro: Float = 100f,
    var isNitroActive: Boolean = false,
    var maxSpeed: Float = 620f,
    var nitroMaxSpeed: Float = 880f,
    var width: Float = 42f,
    var length: Float = 80f
)

data class TrackPoint(
    val x: Float,
    val y: Float,
    val width: Float = 320f,
    val isCheckpoint: Boolean = false,
    val checkpointIndex: Int = -1
)

data class Skidmark(
    val x1: Float,
    val y1: Float,
    val x2: Float,
    val y2: Float,
    var alpha: Float = 0.55f,
    val color: Color = Color(0xFF00E5FF)
)

data class Particle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    val color: Color,
    var size: Float,
    var life: Float,
    val maxLife: Float
)

data class FloatingBanner(
    val text: String,
    val subText: String = "",
    val color: Color = Color(0xFF00F0FF),
    var life: Float = 1.8f
)
