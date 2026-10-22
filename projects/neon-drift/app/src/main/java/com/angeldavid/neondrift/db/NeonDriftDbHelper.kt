@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.db

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.angeldavid.neondrift.data.CatalogData
import com.angeldavid.neondrift.model.UserAccount
import com.angeldavid.neondrift.model.UserCarState
import java.security.MessageDigest

class NeonDriftDbHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "neon_drift_v2.db"
        const val DATABASE_VERSION = 2

        // Tabla Usuarios
        const val TABLE_USERS = "users"
        const val COL_USER_ID = "id"
        const val COL_USERNAME = "username"
        const val COL_PASSWORD_HASH = "password_hash"
        const val COL_COINS = "coins"
        const val COL_SELECTED_CAR = "selected_car"
        const val COL_CREATED_AT = "created_at"

        // Tabla Vehículos por Usuario
        const val TABLE_USER_CARS = "user_cars"
        const val COL_CAR_USER_ID = "user_id"
        const val COL_CAR_ID = "car_id"
        const val COL_IS_UNLOCKED = "is_unlocked"
        const val COL_SPEED_LVL = "speed_lvl"
        const val COL_ACCEL_LVL = "accel_lvl"
        const val COL_HANDLING_LVL = "handling_lvl"
        const val COL_NITRO_LVL = "nitro_lvl"
        const val COL_BODY_COLOR = "body_color"
        const val COL_UNDERGLOW_COLOR = "underglow_color"

        // Tabla Récords de Pistas y Misiones
        const val TABLE_TRACK_PROGRESS = "track_progress"
        const val COL_TP_USER_ID = "user_id"
        const val COL_TRACK_ID = "track_id"
        const val COL_BEST_TIME = "best_time"
        const val COL_BEST_SCORE = "best_score"
        const val COL_M1_DONE = "m1_done"
        const val COL_M2_DONE = "m2_done"
        const val COL_M3_DONE = "m3_done"

        fun hashPassword(password: String): String {
            val digest = MessageDigest.getInstance("SHA-256")
            val hashBytes = digest.digest(password.toByteArray(Charsets.UTF_8))
            return hashBytes.joinToString("") { "%02x".format(it) }
        }
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE $TABLE_USERS (
                $COL_USER_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COL_USERNAME TEXT UNIQUE NOT NULL,
                $COL_PASSWORD_HASH TEXT NOT NULL,
                $COL_COINS INTEGER DEFAULT 1000,
                $COL_SELECTED_CAR TEXT DEFAULT 'cyber_phantom',
                $COL_CREATED_AT INTEGER
            )
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE $TABLE_USER_CARS (
                $COL_CAR_USER_ID INTEGER NOT NULL,
                $COL_CAR_ID TEXT NOT NULL,
                $COL_IS_UNLOCKED INTEGER NOT NULL DEFAULT 0,
                $COL_SPEED_LVL INTEGER DEFAULT 1,
                $COL_ACCEL_LVL INTEGER DEFAULT 1,
                $COL_HANDLING_LVL INTEGER DEFAULT 1,
                $COL_NITRO_LVL INTEGER DEFAULT 1,
                $COL_BODY_COLOR INTEGER DEFAULT 0,
                $COL_UNDERGLOW_COLOR INTEGER DEFAULT 0,
                rim_color INTEGER DEFAULT 0,
                spoiler_style INTEGER DEFAULT 0,
                trail_fx_color INTEGER DEFAULT 0,
                PRIMARY KEY ($COL_CAR_USER_ID, $COL_CAR_ID),
                FOREIGN KEY ($COL_CAR_USER_ID) REFERENCES $TABLE_USERS($COL_USER_ID) ON DELETE CASCADE
            )
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE $TABLE_TRACK_PROGRESS (
                $COL_TP_USER_ID INTEGER NOT NULL,
                $COL_TRACK_ID TEXT NOT NULL,
                $COL_BEST_TIME REAL DEFAULT 999.0,
                $COL_BEST_SCORE INTEGER DEFAULT 0,
                $COL_M1_DONE INTEGER DEFAULT 0,
                $COL_M2_DONE INTEGER DEFAULT 0,
                $COL_M3_DONE INTEGER DEFAULT 0,
                is_unlocked INTEGER DEFAULT 0,
                PRIMARY KEY ($COL_TP_USER_ID, $COL_TRACK_ID),
                FOREIGN KEY ($COL_TP_USER_ID) REFERENCES $TABLE_USERS($COL_USER_ID) ON DELETE CASCADE
            )
            """.trimIndent()
        )

        // Crear piloto por defecto para acceso rápido
        val defaultUserId = insertInitialUser(db, "David", "1234", 1500)
        initializeUserVehicles(db, defaultUserId)
    }

    override fun onOpen(db: SQLiteDatabase) {
        super.onOpen(db)
        try { db.execSQL("ALTER TABLE $TABLE_TRACK_PROGRESS ADD COLUMN is_unlocked INTEGER DEFAULT 0") } catch (_: Exception) {}
        try { db.execSQL("ALTER TABLE $TABLE_USER_CARS ADD COLUMN rim_color INTEGER DEFAULT 0") } catch (_: Exception) {}
        try { db.execSQL("ALTER TABLE $TABLE_USER_CARS ADD COLUMN spoiler_style INTEGER DEFAULT 0") } catch (_: Exception) {}
        try { db.execSQL("ALTER TABLE $TABLE_USER_CARS ADD COLUMN trail_fx_color INTEGER DEFAULT 0") } catch (_: Exception) {}
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        try { db.execSQL("ALTER TABLE $TABLE_TRACK_PROGRESS ADD COLUMN is_unlocked INTEGER DEFAULT 0") } catch (_: Exception) {}
        try { db.execSQL("ALTER TABLE $TABLE_USER_CARS ADD COLUMN rim_color INTEGER DEFAULT 0") } catch (_: Exception) {}
        try { db.execSQL("ALTER TABLE $TABLE_USER_CARS ADD COLUMN spoiler_style INTEGER DEFAULT 0") } catch (_: Exception) {}
        try { db.execSQL("ALTER TABLE $TABLE_USER_CARS ADD COLUMN trail_fx_color INTEGER DEFAULT 0") } catch (_: Exception) {}
    }

    private fun insertInitialUser(db: SQLiteDatabase, username: String, pass: String, starterCoins: Int): Long {
        val values = ContentValues().apply {
            put(COL_USERNAME, username)
            put(COL_PASSWORD_HASH, hashPassword(pass))
            put(COL_COINS, starterCoins)
            put(COL_SELECTED_CAR, "cyber_phantom")
            put(COL_CREATED_AT, System.currentTimeMillis())
        }
        return db.insert(TABLE_USERS, null, values)
    }

    fun registerUser(username: String, pass: String): Long {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_USERNAME, username.trim())
            put(COL_PASSWORD_HASH, hashPassword(pass))
            put(COL_COINS, 1000)
            put(COL_SELECTED_CAR, "cyber_phantom")
            put(COL_CREATED_AT, System.currentTimeMillis())
        }
        val id = db.insert(TABLE_USERS, null, values)
        if (id != -1L) {
            initializeUserVehicles(db, id)
        }
        return id
    }

    fun authenticateUser(username: String, pass: String): UserAccount? {
        val db = readableDatabase
        val hash = hashPassword(pass)
        val cursor = db.rawQuery(
            "SELECT $COL_USER_ID, $COL_USERNAME, $COL_COINS, $COL_SELECTED_CAR FROM $TABLE_USERS WHERE $COL_USERNAME = ? AND $COL_PASSWORD_HASH = ?",
            arrayOf(username.trim(), hash)
        )
        return cursor.use {
            if (it.moveToFirst()) {
                UserAccount(
                    id = it.getLong(0),
                    username = it.getString(1),
                    coins = it.getInt(2),
                    selectedCarId = it.getString(3)
                )
            } else null
        }
    }

    fun getUserById(userId: Long): UserAccount? {
        val db = readableDatabase
        val cursor = db.rawQuery(
            "SELECT $COL_USER_ID, $COL_USERNAME, $COL_COINS, $COL_SELECTED_CAR FROM $TABLE_USERS WHERE $COL_USER_ID = ?",
            arrayOf(userId.toString())
        )
        return cursor.use {
            if (it.moveToFirst()) {
                UserAccount(
                    id = it.getLong(0),
                    username = it.getString(1),
                    coins = it.getInt(2),
                    selectedCarId = it.getString(3)
                )
            } else null
        }
    }

    fun getAllUsernames(): List<String> {
        val db = readableDatabase
        val list = mutableListOf<String>()
        val cursor = db.rawQuery("SELECT $COL_USERNAME FROM $TABLE_USERS ORDER BY $COL_USERNAME ASC", null)
        cursor.use {
            while (it.moveToNext()) {
                list.add(it.getString(0))
            }
        }
        return list
    }

    fun initializeUserVehicles(db: SQLiteDatabase, userId: Long) {
        for (carDef in CatalogData.CAR_CATALOG) {
            val isUnlocked = if (carDef.price == 0) 1 else 0
            val values = ContentValues().apply {
                put(COL_CAR_USER_ID, userId)
                put(COL_CAR_ID, carDef.id)
                put(COL_IS_UNLOCKED, isUnlocked)
                put(COL_SPEED_LVL, 1)
                put(COL_ACCEL_LVL, 1)
                put(COL_HANDLING_LVL, 1)
                put(COL_NITRO_LVL, 1)
                put(COL_BODY_COLOR, carDef.defaultBodyColor)
                put(COL_UNDERGLOW_COLOR, carDef.defaultUnderglowColor)
                put("rim_color", carDef.defaultRimColor)
                put("spoiler_style", 0)
                put("trail_fx_color", 0xFF00F0FFL)
            }
            db.insertWithOnConflict(TABLE_USER_CARS, null, values, SQLiteDatabase.CONFLICT_IGNORE)
        }
    }

    fun getUserCarStates(userId: Long): List<UserCarState> {
        val db = readableDatabase
        val list = mutableListOf<UserCarState>()
        val cursor = db.rawQuery(
            """
            SELECT * FROM $TABLE_USER_CARS WHERE $COL_CAR_USER_ID = ?
            """.trimIndent(),
            arrayOf(userId.toString())
        )
        cursor.use {
            val carIdIdx = it.getColumnIndex(COL_CAR_ID)
            val unlockedIdx = it.getColumnIndex(COL_IS_UNLOCKED)
            val spdIdx = it.getColumnIndex(COL_SPEED_LVL)
            val accIdx = it.getColumnIndex(COL_ACCEL_LVL)
            val hanIdx = it.getColumnIndex(COL_HANDLING_LVL)
            val nitIdx = it.getColumnIndex(COL_NITRO_LVL)
            val bodyIdx = it.getColumnIndex(COL_BODY_COLOR)
            val underIdx = it.getColumnIndex(COL_UNDERGLOW_COLOR)
            val rimIdx = it.getColumnIndex("rim_color")
            val spoilerIdx = it.getColumnIndex("spoiler_style")
            val trailIdx = it.getColumnIndex("trail_fx_color")

            while (it.moveToNext()) {
                val carId = if (carIdIdx >= 0) it.getString(carIdIdx) else "cyber_phantom"
                val carDef = CatalogData.getCarDef(carId)

                val rimVal = if (rimIdx >= 0 && !it.isNull(rimIdx)) it.getLong(rimIdx) else 0L
                val finalRim = if (rimVal != 0L) rimVal else carDef.defaultRimColor

                val trailVal = if (trailIdx >= 0 && !it.isNull(trailIdx)) it.getLong(trailIdx) else 0L
                val finalTrail = if (trailVal != 0L) trailVal else 0xFF00F0FFL

                list.add(
                    UserCarState(
                        carId = carId,
                        isUnlocked = if (unlockedIdx >= 0) it.getInt(unlockedIdx) == 1 else (carDef.price == 0),
                        speedLevel = if (spdIdx >= 0) it.getInt(spdIdx) else 1,
                        accelLevel = if (accIdx >= 0) it.getInt(accIdx) else 1,
                        handlingLevel = if (hanIdx >= 0) it.getInt(hanIdx) else 1,
                        nitroLevel = if (nitIdx >= 0) it.getInt(nitIdx) else 1,
                        bodyColor = if (bodyIdx >= 0 && it.getLong(bodyIdx) != 0L) it.getLong(bodyIdx) else carDef.defaultBodyColor,
                        underglowColor = if (underIdx >= 0) it.getLong(underIdx) else carDef.defaultUnderglowColor,
                        rimColor = finalRim,
                        spoilerStyle = if (spoilerIdx >= 0) it.getInt(spoilerIdx) else 0,
                        trailFxColor = finalTrail
                    )
                )
            }
        }
        return list
    }

    fun addCoins(userId: Long, delta: Int): Int {
        val db = writableDatabase
        db.execSQL(
            "UPDATE $TABLE_USERS SET $COL_COINS = MAX(0, $COL_COINS + ?) WHERE $COL_USER_ID = ?",
            arrayOf(delta.toString(), userId.toString())
        )
        return getUserById(userId)?.coins ?: 0
    }

    fun setSelectedCar(userId: Long, carId: String) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_SELECTED_CAR, carId)
        }
        db.update(TABLE_USERS, values, "$COL_USER_ID = ?", arrayOf(userId.toString()))
    }

    fun unlockCar(userId: Long, carId: String, cost: Int): Boolean {
        val user = getUserById(userId) ?: return false
        if (user.coins < cost) return false

        val db = writableDatabase
        db.beginTransaction()
        try {
            db.execSQL(
                "UPDATE $TABLE_USERS SET $COL_COINS = $COL_COINS - ? WHERE $COL_USER_ID = ?",
                arrayOf(cost.toString(), userId.toString())
            )
            val values = ContentValues().apply {
                put(COL_IS_UNLOCKED, 1)
            }
            db.update(TABLE_USER_CARS, values, "$COL_CAR_USER_ID = ? AND $COL_CAR_ID = ?", arrayOf(userId.toString(), carId))
            db.setTransactionSuccessful()
            return true
        } finally {
            db.endTransaction()
        }
    }

    fun upgradeCarStat(userId: Long, carId: String, statCol: String, newLevel: Int, cost: Int): Boolean {
        val user = getUserById(userId) ?: return false
        if (user.coins < cost) return false

        val db = writableDatabase
        db.beginTransaction()
        try {
            db.execSQL(
                "UPDATE $TABLE_USERS SET $COL_COINS = $COL_COINS - ? WHERE $COL_USER_ID = ?",
                arrayOf(cost.toString(), userId.toString())
            )
            val values = ContentValues().apply {
                put(statCol, newLevel)
            }
            db.update(TABLE_USER_CARS, values, "$COL_CAR_USER_ID = ? AND $COL_CAR_ID = ?", arrayOf(userId.toString(), carId))
            db.setTransactionSuccessful()
            return true
        } finally {
            db.endTransaction()
        }
    }

    fun updateCarColors(userId: Long, carId: String, bodyColor: Long, underglowColor: Long) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_BODY_COLOR, bodyColor)
            put(COL_UNDERGLOW_COLOR, underglowColor)
        }
        db.update(TABLE_USER_CARS, values, "$COL_CAR_USER_ID = ? AND $COL_CAR_ID = ?", arrayOf(userId.toString(), carId))
    }

    fun updateCustomization(
        userId: Long,
        carId: String,
        bodyColor: Long,
        underglowColor: Long,
        rimColor: Long,
        spoilerStyle: Int,
        trailFxColor: Long
    ) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_BODY_COLOR, bodyColor)
            put(COL_UNDERGLOW_COLOR, underglowColor)
            put("rim_color", rimColor)
            put("spoiler_style", spoilerStyle)
            put("trail_fx_color", trailFxColor)
        }
        db.update(TABLE_USER_CARS, values, "$COL_CAR_USER_ID = ? AND $COL_CAR_ID = ?", arrayOf(userId.toString(), carId))
    }

    data class TrackProgressRecord(
        val bestTimeSec: Float,
        val bestScore: Int,
        val m1Done: Boolean,
        val m2Done: Boolean,
        val m3Done: Boolean,
        val isUnlocked: Boolean = false
    )

    fun getTrackProgress(userId: Long, trackId: String): TrackProgressRecord {
        val db = readableDatabase
        val cursor = db.rawQuery(
            "SELECT * FROM $TABLE_TRACK_PROGRESS WHERE $COL_TP_USER_ID = ? AND $COL_TRACK_ID = ?",
            arrayOf(userId.toString(), trackId)
        )
        return cursor.use {
            if (it.moveToFirst()) {
                val timeIdx = it.getColumnIndex(COL_BEST_TIME)
                val scoreIdx = it.getColumnIndex(COL_BEST_SCORE)
                val m1Idx = it.getColumnIndex(COL_M1_DONE)
                val m2Idx = it.getColumnIndex(COL_M2_DONE)
                val m3Idx = it.getColumnIndex(COL_M3_DONE)
                val unlockIdx = it.getColumnIndex("is_unlocked")

                TrackProgressRecord(
                    bestTimeSec = if (timeIdx >= 0) it.getFloat(timeIdx) else 999f,
                    bestScore = if (scoreIdx >= 0) it.getInt(scoreIdx) else 0,
                    m1Done = if (m1Idx >= 0) it.getInt(m1Idx) == 1 else false,
                    m2Done = if (m2Idx >= 0) it.getInt(m2Idx) == 1 else false,
                    m3Done = if (m3Idx >= 0) it.getInt(m3Idx) == 1 else false,
                    isUnlocked = if (unlockIdx >= 0) it.getInt(unlockIdx) == 1 else false
                )
            } else {
                TrackProgressRecord(999f, 0, false, false, false, false)
            }
        }
    }

    fun unlockTrack(userId: Long, trackId: String, cost: Int): Boolean {
        val user = getUserById(userId) ?: return false
        if (user.coins < cost) return false

        val db = writableDatabase
        db.beginTransaction()
        try {
            db.execSQL(
                "UPDATE $TABLE_USERS SET $COL_COINS = $COL_COINS - ? WHERE $COL_USER_ID = ?",
                arrayOf(cost.toString(), userId.toString())
            )
            val current = getTrackProgress(userId, trackId)
            val values = ContentValues().apply {
                put(COL_TP_USER_ID, userId)
                put(COL_TRACK_ID, trackId)
                put(COL_BEST_TIME, current.bestTimeSec)
                put(COL_BEST_SCORE, current.bestScore)
                put(COL_M1_DONE, if (current.m1Done) 1 else 0)
                put(COL_M2_DONE, if (current.m2Done) 1 else 0)
                put(COL_M3_DONE, if (current.m3Done) 1 else 0)
                put("is_unlocked", 1)
            }
            db.insertWithOnConflict(TABLE_TRACK_PROGRESS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
            db.setTransactionSuccessful()
            return true
        } catch (_: Exception) {
            return false
        } finally {
            db.endTransaction()
        }
    }

    fun saveTrackRaceResult(
        userId: Long,
        trackId: String,
        timeSec: Float,
        score: Int,
        m1Completed: Boolean,
        m2Completed: Boolean,
        m3Completed: Boolean
    ) {
        val db = writableDatabase
        val current = getTrackProgress(userId, trackId)

        val newBestTime = if (timeSec < current.bestTimeSec) timeSec else current.bestTimeSec
        val newBestScore = if (score > current.bestScore) score else current.bestScore
        val newM1 = if (m1Completed || current.m1Done) 1 else 0
        val newM2 = if (m2Completed || current.m2Done) 1 else 0
        val newM3 = if (m3Completed || current.m3Done) 1 else 0

        val values = ContentValues().apply {
            put(COL_TP_USER_ID, userId)
            put(COL_TRACK_ID, trackId)
            put(COL_BEST_TIME, newBestTime)
            put(COL_BEST_SCORE, newBestScore)
            put(COL_M1_DONE, newM1)
            put(COL_M2_DONE, newM2)
            put(COL_M3_DONE, newM3)
            put("is_unlocked", if (current.isUnlocked || m1Completed) 1 else 0)
        }
        db.insertWithOnConflict(TABLE_TRACK_PROGRESS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }
}
