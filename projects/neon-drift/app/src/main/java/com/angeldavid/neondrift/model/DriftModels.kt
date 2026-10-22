@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.model

import androidx.compose.ui.graphics.Color

/**
 * Estados de navegación principal en la aplicación.
 */
enum class AppScreen {
    AUTH_LOGIN,
    MAIN_HUB,
    GARAGE,
    TRACK_SELECT,
    RACE_GAME,
    RACE_RESULTS
}

/**
 * Estados de la carrera en el motor 60 FPS.
 */
enum class GameState {
    READY,
    RACING,
    TIME_OUT,
    LAP_FINISHED,
    VICTORY
}

/**
 * Cuenta de usuario persistente en la Base de Datos.
 */
data class UserAccount(
    val id: Long,
    val username: String,
    val coins: Int,
    val selectedCarId: String
)

/**
 * Definición de catálogo de un vehículo con arquetipo de conducción.
 */
data class CarDefinition(
    val id: String,
    val name: String,
    val tagline: String,
    val archetype: String,
    val archetypeBadgeColor: Long,
    val prosText: String,
    val consText: String,
    val price: Int,
    val baseSpeedKmh: Float,
    val baseAccel: Float,
    val baseHandling: Float,
    val baseNitro: Float,
    val defaultBodyColor: Long,
    val defaultUnderglowColor: Long,
    val defaultRimColor: Long = 0xFF00F0FFL
)

/**
 * Estado guardado del coche del usuario (niveles de mejoras y personalización).
 */
data class UserCarState(
    val carId: String,
    val isUnlocked: Boolean,
    val speedLevel: Int = 1,
    val accelLevel: Int = 1,
    val handlingLevel: Int = 1,
    val nitroLevel: Int = 1,
    val bodyColor: Long = 0xFF00F0FFL,
    val underglowColor: Long = 0xFF00F0FFL,
    val rimColor: Long = 0xFF00F0FFL,
    val spoilerStyle: Int = 0, // 0: Estándar, 1: GT Wing, 2: Cyber Blade
    val trailFxColor: Long = 0xFF00F0FFL
) {
    val totalLevel: Int get() = speedLevel + accelLevel + handlingLevel + nitroLevel
}

/**
 * Misión por circuito con recompensa en monedas.
 */
data class TrackMission(
    val id: Int,
    val title: String,
    val description: String,
    val rewardCoins: Int,
    val isCompleted: Boolean = false
)

/**
 * Circuito de carreras completo con sistema de desbloqueo.
 */
data class TrackDefinition(
    val id: String,
    val name: String,
    val location: String,
    val totalLaps: Int,
    val trackWidth: Float,
    val baseTimeBonus: Float,
    val skyColorTop: Long,
    val skyColorBottom: Long,
    val barrierPrimaryColor: Long,
    val barrierSecondaryColor: Long,
    val waypoints: List<TrackPoint>,
    val missions: List<TrackMission>,
    val unlockCost: Int = 0,
    val unlockRequiredTrackId: String? = null,
    val unlockRequiredMissionText: String = ""
)

/**
 * Competidor controlado por Inteligencia Artificial en pista.
 */
data class AIRacer(
    val id: String,
    val name: String,
    var x: Float,
    var y: Float,
    var angle: Float = -Math.PI.toFloat() / 2f,
    var velocity: Float = 0f,
    val maxSpeed: Float,
    val accelRate: Float,
    val bodyColor: Color,
    val numberTag: String,
    var currentWaypointIndex: Int = 1,
    var lap: Int = 1,
    var totalProgress: Float = 0f,
    var finished: Boolean = false,
    var finishTimeSec: Float = 0f
)

/**
 * Espectador / público neón animado al margen de la carretera.
 */
data class Spectator(
    val x: Float,
    val y: Float,
    val color: Color,
    var cheerOffset: Float = 0f,
    val cheerSpeed: Float = 3f,
    val hasGlowStick: Boolean = true,
    var flashAlpha: Float = 0f
)

/**
 * Estado del vehículo del jugador con físicas completas de derrape arcade.
 */
data class Car(
    var x: Float = 0f,
    var y: Float = 0f,
    var angle: Float = 0f,
    var velocity: Float = 0f,
    var angularVelocity: Float = 0f,
    var driftAngle: Float = 0f,
    var isDrifting: Boolean = false,
    var nitro: Float = 100f,
    var maxSpeed: Float = 360f,
    var nitroMaxSpeed: Float = 490f,
    var acceleration: Float = 260f,
    var turnSpeed: Float = 2.8f,
    var driftFriction: Float = 0.965f,
    var isNitroActive: Boolean = false,
    var bodyColor: Color = Color(0xFF00F0FF),
    var underglowColor: Color = Color(0xFF00F0FF),
    var rimColor: Color = Color(0xFF00F0FF),
    var spoilerStyle: Int = 0,
    var trailFxColor: Color = Color(0xFF00F0FF),
    val length: Float = 66f,
    val width: Float = 38f
)

/**
 * Waypoint de pista de carreras.
 */
data class TrackPoint(
    val x: Float,
    val y: Float,
    val width: Float = 320f,
    val isCheckpoint: Boolean = false,
    val checkpointIndex: Int = -1
)

/**
 * Huella de neumático en el asfalto.
 */
data class Skidmark(
    val startX: Float,
    val startY: Float,
    val endX: Float,
    val endY: Float,
    var alpha: Float = 0.6f,
    val color: Color = Color(0xFF00E5FF)
)

/**
 * Partículas de humo, chispas o llamas de nitro.
 */
data class Particle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    val color: Color,
    val size: Float = 6f,
    var life: Float = 0.3f,
    val maxLife: Float = 0.3f
)

/**
 * Banner flotante de combo y puntos.
 */
data class FloatingBanner(
    val text: String,
    val subText: String = "",
    val color: Color,
    var life: Float = 1.2f,
    var alpha: Float = 1.0f
)

/**
 * Resultado final de una carrera para recompensas y guardado.
 */
data class RaceResult(
    val position: Int,
    val totalTimeSec: Float,
    val totalScore: Int,
    val maxCombo: Float,
    val coinsEarned: Int,
    val completedMissionIds: List<Int>,
    val isNewBestTime: Boolean
)
