@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.data

import android.content.Context
import androidx.compose.ui.graphics.Color
import com.angeldavid.neondrift.db.NeonDriftDbHelper
import com.angeldavid.neondrift.db.NeonDriftPostgresHelper
import com.angeldavid.neondrift.model.Car
import com.angeldavid.neondrift.model.CarDefinition
import com.angeldavid.neondrift.model.UserAccount
import com.angeldavid.neondrift.model.UserCarState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class NeonDriftRepository(context: Context) {

    private val localDb = NeonDriftDbHelper(context)
    val postgresHelper = NeonDriftPostgresHelper()

    var isPostgresActive: Boolean = false
        private set

    suspend fun checkPostgresConnection(): Boolean = withContext(Dispatchers.IO) {
        val ok = postgresHelper.testConnection()
        isPostgresActive = ok
        ok
    }

    suspend fun setPostgresHost(host: String) = withContext(Dispatchers.IO) {
        postgresHelper.host = host.trim()
        checkPostgresConnection()
    }

    suspend fun register(username: String, pass: String): UserAccount? = withContext(Dispatchers.IO) {
        if (checkPostgresConnection()) {
            try {
                val pgId = postgresHelper.registerUser(username, pass)
                if (pgId != -1L) {
                    val user = postgresHelper.getUserById(pgId)
                    // Sincronizar en local
                    localDb.registerUser(username, pass)
                    return@withContext user
                }
            } catch (_: Exception) {}
        }
        // Fallback local SQLite
        val id = localDb.registerUser(username, pass)
        if (id != -1L) localDb.getUserById(id) else null
    }

    suspend fun login(username: String, pass: String): UserAccount? = withContext(Dispatchers.IO) {
        if (checkPostgresConnection()) {
            try {
                val user = postgresHelper.authenticateUser(username, pass)
                if (user != null) {
                    // Sincronizar usuario en local
                    localDb.registerUser(user.username, pass)
                    localDb.addCoins(user.id, user.coins - (localDb.getUserById(user.id)?.coins ?: 0))
                    return@withContext user
                }
            } catch (_: Exception) {}
        }
        // Fallback local SQLite
        localDb.authenticateUser(username, pass)
    }

    suspend fun getUser(userId: Long): UserAccount? = withContext(Dispatchers.IO) {
        if (isPostgresActive) {
            try {
                val user = postgresHelper.getUserById(userId)
                if (user != null) return@withContext user
            } catch (_: Exception) {}
        }
        localDb.getUserById(userId)
    }

    suspend fun getAvailableUsernames(): List<String> = withContext(Dispatchers.IO) {
        if (checkPostgresConnection()) {
            try {
                val pgList = postgresHelper.getAllUsernames()
                if (pgList.isNotEmpty()) return@withContext pgList
            } catch (_: Exception) {}
        }
        localDb.getAllUsernames()
    }

    suspend fun getUserCars(userId: Long): List<UserCarState> = withContext(Dispatchers.IO) {
        if (isPostgresActive) {
            try {
                val pgCars = postgresHelper.getUserCarStates(userId)
                if (pgCars.isNotEmpty()) return@withContext pgCars
            } catch (_: Exception) {}
        }
        localDb.getUserCarStates(userId)
    }

    suspend fun selectCar(userId: Long, carId: String) = withContext(Dispatchers.IO) {
        if (isPostgresActive) {
            try {
                postgresHelper.setSelectedCar(userId, carId)
            } catch (_: Exception) {}
        }
        localDb.setSelectedCar(userId, carId)
    }

    suspend fun unlockCar(userId: Long, carDef: CarDefinition): Boolean = withContext(Dispatchers.IO) {
        if (isPostgresActive) {
            try {
                val ok = postgresHelper.unlockCar(userId, carDef.id, carDef.price)
                if (ok) {
                    localDb.unlockCar(userId, carDef.id, carDef.price)
                    return@withContext true
                }
            } catch (_: Exception) {}
        }
        localDb.unlockCar(userId, carDef.id, carDef.price)
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

        if (isPostgresActive) {
            try {
                val ok = postgresHelper.upgradeCarStat(userId, carId, statType, nextLevel, cost)
                if (ok) {
                    val col = when (statType) {
                        "speed" -> NeonDriftDbHelper.COL_SPEED_LVL
                        "accel" -> NeonDriftDbHelper.COL_ACCEL_LVL
                        "handling" -> NeonDriftDbHelper.COL_HANDLING_LVL
                        "nitro" -> NeonDriftDbHelper.COL_NITRO_LVL
                        else -> return@withContext false
                    }
                    localDb.upgradeCarStat(userId, carId, col, nextLevel, cost)
                    return@withContext true
                }
            } catch (_: Exception) {}
        }

        val col = when (statType) {
            "speed" -> NeonDriftDbHelper.COL_SPEED_LVL
            "accel" -> NeonDriftDbHelper.COL_ACCEL_LVL
            "handling" -> NeonDriftDbHelper.COL_HANDLING_LVL
            "nitro" -> NeonDriftDbHelper.COL_NITRO_LVL
            else -> return@withContext false
        }
        localDb.upgradeCarStat(userId, carId, col, nextLevel, cost)
    }

    suspend fun updateColors(
        userId: Long,
        carId: String,
        bodyColor: Long,
        underglowColor: Long
    ) = withContext(Dispatchers.IO) {
        if (isPostgresActive) {
            try {
                postgresHelper.updateCarColors(userId, carId, bodyColor, underglowColor)
            } catch (_: Exception) {}
        }
        localDb.updateCarColors(userId, carId, bodyColor, underglowColor)
    }

    suspend fun updateCustomization(
        userId: Long,
        carId: String,
        bodyColor: Long,
        underglowColor: Long,
        rimColor: Long,
        spoilerStyle: Int,
        trailFxColor: Long
    ) = withContext(Dispatchers.IO) {
        localDb.updateCustomization(userId, carId, bodyColor, underglowColor, rimColor, spoilerStyle, trailFxColor)
    }

    suspend fun unlockTrack(userId: Long, trackId: String, cost: Int): Boolean = withContext(Dispatchers.IO) {
        localDb.unlockTrack(userId, trackId, cost)
    }

    suspend fun addCoins(userId: Long, amount: Int): Int = withContext(Dispatchers.IO) {
        if (isPostgresActive) {
            try {
                val newCoins = postgresHelper.addCoins(userId, amount)
                localDb.addCoins(userId, amount)
                return@withContext newCoins
            } catch (_: Exception) {}
        }
        localDb.addCoins(userId, amount)
    }

    suspend fun getTrackProgress(userId: Long, trackId: String): NeonDriftDbHelper.TrackProgressRecord =
        withContext(Dispatchers.IO) {
            if (isPostgresActive) {
                try {
                    return@withContext postgresHelper.getTrackProgress(userId, trackId)
                } catch (_: Exception) {}
            }
            localDb.getTrackProgress(userId, trackId)
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
        if (isPostgresActive) {
            try {
                postgresHelper.saveTrackRaceResult(userId, trackId, timeSec, score, m1Done, m2Done, m3Done)
            } catch (_: Exception) {}
        }
        localDb.saveTrackRaceResult(userId, trackId, timeSec, score, m1Done, m2Done, m3Done)
    }

    fun buildPlayerCar(carDef: CarDefinition, carState: UserCarState): Car {
        val totalSpeedKmh = carDef.baseSpeedKmh + (carState.speedLevel - 1) * 14f
        val maxSpeedPx = totalSpeedKmh * 1.95f
        val accelPx = 210f * carDef.baseAccel * (1.0f + (carState.accelLevel - 1) * 0.15f)
        val turnSpeedRad = 2.6f * carDef.baseHandling * (1.0f + (carState.handlingLevel - 1) * 0.12f)
        
        // El nitro escala con la estadística base del coche (Vortex Apex = boost brutal supersónico)
        val nitroMultiplier = 1.25f + (carDef.baseNitro - 1.0f) * 0.22f + (carState.nitroLevel - 1) * 0.06f
        val nitroMaxSpeedPx = maxSpeedPx * nitroMultiplier

        // Fricción de derrape según el manejo del auto
        val driftFriction = (0.955f + (carDef.baseHandling * 0.008f) + (carState.handlingLevel - 1) * 0.003f).coerceIn(0.950f, 0.988f)

        return Car(
            maxSpeed = maxSpeedPx,
            nitroMaxSpeed = nitroMaxSpeedPx,
            acceleration = accelPx,
            turnSpeed = turnSpeedRad,
            driftFriction = driftFriction,
            bodyColor = Color(carState.bodyColor),
            underglowColor = Color(carState.underglowColor),
            rimColor = Color(carState.rimColor),
            spoilerStyle = carState.spoilerStyle,
            trailFxColor = Color(carState.trailFxColor)
        )
    }
}
