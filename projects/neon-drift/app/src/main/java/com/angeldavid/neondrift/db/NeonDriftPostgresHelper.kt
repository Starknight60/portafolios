@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.db

import com.angeldavid.neondrift.data.CatalogData
import com.angeldavid.neondrift.model.UserAccount
import com.angeldavid.neondrift.model.UserCarState
import java.security.MessageDigest
import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import java.sql.ResultSet

class NeonDriftPostgresHelper(
    var host: String = "10.0.2.2",
    var port: Int = 5432,
    var databaseName: String = "neon_drift_db",
    var user: String = "postgres",
    var pass: String = "12345"
) {

    init {
        try {
            Class.forName("org.postgresql.Driver")
        } catch (_: Exception) {}
    }

    private val jdbcUrl: String
        get() = "jdbc:postgresql://$host:$port/$databaseName?connectTimeout=4&socketTimeout=4"

    fun getConnection(): Connection {
        return DriverManager.getConnection(jdbcUrl, user, pass)
    }

    fun testConnection(): Boolean {
        return try {
            getConnection().use { conn ->
                conn.isValid(3)
            }
        } catch (_: Exception) {
            false
        }
    }

    private fun hashPassword(password: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(password.toByteArray(Charsets.UTF_8))
        return hashBytes.joinToString("") { "%02x".format(it) }
    }

    fun registerUser(username: String, passText: String): Long {
        val sql = "INSERT INTO users (username, password_hash, coins, selected_car_id, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setString(1, username.trim())
                stmt.setString(2, hashPassword(passText))
                stmt.setInt(3, 1500)
                stmt.setString(4, "cyber_phantom")
                stmt.setLong(5, System.currentTimeMillis())
                val rs = stmt.executeQuery()
                if (rs.next()) {
                    val newId = rs.getLong(1)
                    initializeUserVehicles(conn, newId)
                    return newId
                }
            }
        }
        return -1L
    }

    private fun initializeUserVehicles(conn: Connection, userId: Long) {
        val sql = """
            INSERT INTO user_cars (user_id, car_id, is_unlocked, speed_lvl, accel_lvl, handling_lvl, nitro_lvl, body_color, underglow_color)
            VALUES (?, ?, ?, 1, 1, 1, 1, ?, ?)
            ON CONFLICT (user_id, car_id) DO NOTHING
        """.trimIndent()

        conn.prepareStatement(sql).use { stmt ->
            for (carDef in CatalogData.CAR_CATALOG) {
                val isUnlocked = (carDef.price == 0)
                stmt.setLong(1, userId)
                stmt.setString(2, carDef.id)
                stmt.setBoolean(3, isUnlocked)
                stmt.setLong(4, carDef.defaultBodyColor)
                stmt.setLong(5, carDef.defaultUnderglowColor)
                stmt.addBatch()
            }
            stmt.executeBatch()
        }
    }

    fun authenticateUser(username: String, passText: String): UserAccount? {
        val hash = hashPassword(passText)
        val sql = "SELECT id, username, coins, selected_car_id FROM users WHERE username = ? AND password_hash = ?"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setString(1, username.trim())
                stmt.setString(2, hash)
                val rs = stmt.executeQuery()
                if (rs.next()) {
                    return UserAccount(
                        id = rs.getLong("id"),
                        username = rs.getString("username"),
                        coins = rs.getInt("coins"),
                        selectedCarId = rs.getString("selected_car_id")
                    )
                }
            }
        }
        return null
    }

    fun getUserById(userId: Long): UserAccount? {
        val sql = "SELECT id, username, coins, selected_car_id FROM users WHERE id = ?"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setLong(1, userId)
                val rs = stmt.executeQuery()
                if (rs.next()) {
                    return UserAccount(
                        id = rs.getLong("id"),
                        username = rs.getString("username"),
                        coins = rs.getInt("coins"),
                        selectedCarId = rs.getString("selected_car_id")
                    )
                }
            }
        }
        return null
    }

    fun getAllUsernames(): List<String> {
        val list = mutableListOf<String>()
        val sql = "SELECT username FROM users ORDER BY username ASC"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                val rs = stmt.executeQuery()
                while (rs.next()) {
                    list.add(rs.getString("username"))
                }
            }
        }
        return list
    }

    fun getUserCarStates(userId: Long): List<UserCarState> {
        val list = mutableListOf<UserCarState>()
        val sql = """
            SELECT car_id, is_unlocked, speed_lvl, accel_lvl, handling_lvl, nitro_lvl, body_color, underglow_color
            FROM user_cars WHERE user_id = ?
        """.trimIndent()
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setLong(1, userId)
                val rs = stmt.executeQuery()
                while (rs.next()) {
                    list.add(
                        UserCarState(
                            carId = rs.getString("car_id"),
                            isUnlocked = rs.getBoolean("is_unlocked"),
                            speedLevel = rs.getInt("speed_lvl"),
                            accelLevel = rs.getInt("accel_lvl"),
                            handlingLevel = rs.getInt("handling_lvl"),
                            nitroLevel = rs.getInt("nitro_lvl"),
                            bodyColor = rs.getLong("body_color"),
                            underglowColor = rs.getLong("underglow_color")
                        )
                    )
                }
            }
        }
        return list
    }

    fun addCoins(userId: Long, delta: Int): Int {
        val sql = "UPDATE users SET coins = GREATEST(0, coins + ?) WHERE id = ? RETURNING coins"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setInt(1, delta)
                stmt.setLong(2, userId)
                val rs = stmt.executeQuery()
                if (rs.next()) {
                    return rs.getInt(1)
                }
            }
        }
        return getUserById(userId)?.coins ?: 0
    }

    fun setSelectedCar(userId: Long, carId: String) {
        val sql = "UPDATE users SET selected_car_id = ? WHERE id = ?"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setString(1, carId)
                stmt.setLong(2, userId)
                stmt.executeUpdate()
            }
        }
    }

    fun unlockCar(userId: Long, carId: String, cost: Int): Boolean {
        val user = getUserById(userId) ?: return false
        if (user.coins < cost) return false

        getConnection().use { conn ->
            conn.autoCommit = false
            try {
                // Descontar monedas
                val deductSql = "UPDATE users SET coins = coins - ? WHERE id = ?"
                conn.prepareStatement(deductSql).use { stmt ->
                    stmt.setInt(1, cost)
                    stmt.setLong(2, userId)
                    stmt.executeUpdate()
                }
                // Desbloquear coche
                val unlockSql = "UPDATE user_cars SET is_unlocked = true WHERE user_id = ? AND car_id = ?"
                conn.prepareStatement(unlockSql).use { stmt ->
                    stmt.setLong(1, userId)
                    stmt.setString(2, carId)
                    stmt.executeUpdate()
                }
                conn.commit()
                return true
            } catch (e: Exception) {
                conn.rollback()
                throw e
            } finally {
                conn.autoCommit = true
            }
        }
    }

    fun upgradeCarStat(userId: Long, carId: String, statCol: String, newLevel: Int, cost: Int): Boolean {
        val user = getUserById(userId) ?: return false
        if (user.coins < cost) return false

        val validCol = when (statCol) {
            "speed" -> "speed_lvl"
            "accel" -> "accel_lvl"
            "handling" -> "handling_lvl"
            "nitro" -> "nitro_lvl"
            else -> return false
        }

        getConnection().use { conn ->
            conn.autoCommit = false
            try {
                val deductSql = "UPDATE users SET coins = coins - ? WHERE id = ?"
                conn.prepareStatement(deductSql).use { stmt ->
                    stmt.setInt(1, cost)
                    stmt.setLong(2, userId)
                    stmt.executeUpdate()
                }

                val updateSql = "UPDATE user_cars SET $validCol = ? WHERE user_id = ? AND car_id = ?"
                conn.prepareStatement(updateSql).use { stmt ->
                    stmt.setInt(1, newLevel)
                    stmt.setLong(2, userId)
                    stmt.setString(3, carId)
                    stmt.executeUpdate()
                }
                conn.commit()
                return true
            } catch (e: Exception) {
                conn.rollback()
                throw e
            } finally {
                conn.autoCommit = true
            }
        }
    }

    fun updateCarColors(userId: Long, carId: String, bodyColor: Long, underglowColor: Long) {
        val sql = "UPDATE user_cars SET body_color = ?, underglow_color = ? WHERE user_id = ? AND car_id = ?"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setLong(1, bodyColor)
                stmt.setLong(2, underglowColor)
                stmt.setLong(3, userId)
                stmt.setString(4, carId)
                stmt.executeUpdate()
            }
        }
    }

    fun getTrackProgress(userId: Long, trackId: String): NeonDriftDbHelper.TrackProgressRecord {
        val sql = "SELECT best_time_sec, best_score, m1_done, m2_done, m3_done FROM track_progress WHERE user_id = ? AND track_id = ?"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setLong(1, userId)
                stmt.setString(2, trackId)
                val rs = stmt.executeQuery()
                if (rs.next()) {
                    return NeonDriftDbHelper.TrackProgressRecord(
                        bestTimeSec = rs.getFloat("best_time_sec"),
                        bestScore = rs.getInt("best_score"),
                        m1Done = rs.getBoolean("m1_done"),
                        m2Done = rs.getBoolean("m2_done"),
                        m3Done = rs.getBoolean("m3_done")
                    )
                }
            }
        }
        return NeonDriftDbHelper.TrackProgressRecord(999f, 0, false, false, false)
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
        val current = getTrackProgress(userId, trackId)
        val newBestTime = if (timeSec < current.bestTimeSec) timeSec else current.bestTimeSec
        val newBestScore = if (score > current.bestScore) score else current.bestScore
        val newM1 = m1Completed || current.m1Done
        val newM2 = m2Completed || current.m2Done
        val newM3 = m3Completed || current.m3Done

        val sql = """
            INSERT INTO track_progress (user_id, track_id, best_time_sec, best_score, m1_done, m2_done, m3_done)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, track_id) DO UPDATE SET
                best_time_sec = EXCLUDED.best_time_sec,
                best_score = EXCLUDED.best_score,
                m1_done = EXCLUDED.m1_done,
                m2_done = EXCLUDED.m2_done,
                m3_done = EXCLUDED.m3_done
        """.trimIndent()

        getConnection().use { conn ->
            conn.prepareStatement(sql).use { stmt ->
                stmt.setLong(1, userId)
                stmt.setString(2, trackId)
                stmt.setFloat(3, newBestTime)
                stmt.setInt(4, newBestScore)
                stmt.setBoolean(5, newM1)
                stmt.setBoolean(6, newM2)
                stmt.setBoolean(7, newM3)
                stmt.executeUpdate()
            }
        }
    }
}
