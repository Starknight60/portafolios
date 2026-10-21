@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.data

import android.content.Context
import androidx.compose.ui.graphics.Color
import com.angeldavid.neondrift.db.NeonDriftDbHelper
import com.angeldavid.neondrift.model.Car
import com.angeldavid.neondrift.model.CarDefinition
import com.angeldavid.neondrift.model.UserAccount
import com.angeldavid.neondrift.model.UserCarState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class NeonDriftRepository(context: Context) {

    private val dbHelper = NeonDriftDbHelper(context)

    suspend fun register(username: String, pass: String): UserAccount? = withContext(Dispatchers.IO) {
        val id = dbHelper.registerUser(username, pass)
        if (id != -1L) {
            dbHelper.getUserById(id)
        } else null
    }

    suspend fun login(username: String, pass: String): UserAccount? = withContext(Dispatchers.IO) {
        dbHelper.authenticateUser(username, pass)
    }

    suspend fun getUser(userId: Long): UserAccount? = withContext(Dispatchers.IO) {
        dbHelper.getUserById(userId)
    }

    suspend fun getAvailableUsernames(): List<String> = withContext(Dispatchers.IO) {
        dbHelper.getAllUsernames()
    }

    suspend fun getUserCars(userId: Long): List<UserCarState> = withContext(Dispatchers.IO) {
        dbHelper.getUserCarStates(userId)
    }

    suspend fun selectCar(userId: Long, carId: String) = withContext(Dispatchers.IO) {
        dbHelper.setSelectedCar(userId, carId)
    }

    suspend fun unlockCar(userId: Long, carDef: CarDefinition): Boolean = withContext(Dispatchers.IO) {
        dbHelper.unlockCar(userId, carDef.id, carDef.price)
    }

    suspend fun upgradeStat(
        userId: Long,
        carId: String,
        statType: String,
        currentLevel: Int
    ): Boolean = withContext(Dispatchers.IO) {
        if (currentLevel >= 5) return@withContext false
        val nextLevel = currentLevel + 1
        val cost = CatalogData.getUpgradeCost(nextLevel)
        val col = when (statType) {
            "speed" -> NeonDriftDbHelper.COL_SPEED_LVL
            "accel" -> NeonDriftDbHelper.COL_ACCEL_LVL
            "handling" -> NeonDriftDbHelper.COL_HANDLING_LVL
            "nitro" -> NeonDriftDbHelper.COL_NITRO_LVL
            else -> return@withContext false
        }
        dbHelper.upgradeCarStat(userId, carId, col, nextLevel, cost)
    }

    suspend fun updateColors(
        userId: Long,
        carId: String,
        bodyColor: Long,
        underglowColor: Long
    ) = withContext(Dispatchers.IO) {
        dbHelper.updateCarColors(userId, carId, bodyColor, underglowColor)
    }

    suspend fun addCoins(userId: Long, amount: Int): Int = withContext(Dispatchers.IO) {
        dbHelper.addCoins(userId, amount)
    }

    suspend fun getTrackProgress(userId: Long, trackId: String): NeonDriftDbHelper.TrackProgressRecord =
        withContext(Dispatchers.IO) {
            dbHelper.getTrackProgress(userId, trackId)
        }

    suspend fun saveRace(
        userId: Long,
        trackId: String,
        timeSec: Float,
        score: Int,
        m1Done: Boolean,
        m2Done: Boolean,
        m3Done: Boolean
    ) = withContext(Dispatchers.IO) {
        dbHelper.saveTrackRaceResult(userId, trackId, timeSec, score, m1Done, m2Done, m3Done)
    }

    /**
     * Construye y calcula las físicas del coche del jugador en base al modelo base + niveles de mejoras guardados en la BD.
     */
    fun buildPlayerCar(carDef: CarDefinition, carState: UserCarState): Car {
        // Base Speed: p.ej. 185 km/h -> cada nivel agrega +12 km/h
        val totalSpeedKmh = carDef.baseSpeedKmh + (carState.speedLevel - 1) * 12f
        // Convertir km/h a píxeles/segundo del motor (1 km/h aprox = 1.95 px/s)
        val maxSpeedPx = totalSpeedKmh * 1.95f

        // Acceleration: base * (1.0 + (level - 1) * 0.14)
        val accelPx = 220f * carDef.baseAccel * (1.0f + (carState.accelLevel - 1) * 0.14f)

        // Handling: turn speed base * (1.0 + (level - 1) * 0.12)
        val turnSpeedRad = 2.8f * carDef.baseHandling * (1.0f + (carState.handlingLevel - 1) * 0.12f)

        // Normal and drift friction
        val driftFriction = 0.965f + (carState.handlingLevel - 1) * 0.003f

        return Car(
            maxSpeed = maxSpeedPx,
            acceleration = accelPx,
            turnSpeed = turnSpeedRad,
            driftFriction = driftFriction.coerceAtMost(0.985f),
            bodyColor = Color(carState.bodyColor),
            underglowColor = Color(carState.underglowColor)
        )
    }
}
