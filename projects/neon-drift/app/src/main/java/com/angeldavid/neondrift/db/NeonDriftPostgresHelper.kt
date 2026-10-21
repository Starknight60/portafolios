@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.db

import com.angeldavid.neondrift.model.UserAccount
import com.angeldavid.neondrift.model.UserCarState
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class NeonDriftPostgresHelper(
    var host: String = "10.0.2.2",
    var port: Int = 5000
) {

    private val baseUrl: String
        get() = "http://$host:$port/api"

    private fun postJson(endpoint: String, jsonBody: JSONObject): JSONObject? {
        var conn: HttpURLConnection? = null
        return try {
            val url = URL("$baseUrl$endpoint")
            conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 2500
                readTimeout = 2500
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }
            OutputStreamWriter(conn.outputStream, "UTF-8").use { writer ->
                writer.write(jsonBody.toString())
                writer.flush()
            }
            if (conn.responseCode in 200..299) {
                val response = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                JSONObject(response)
            } else {
                null
            }
        } catch (_: Exception) {
            null
        } finally {
            conn?.disconnect()
        }
    }

    private fun getJson(endpoint: String): JSONObject? {
        var conn: HttpURLConnection? = null
        return try {
            val url = URL("$baseUrl$endpoint")
            conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 2000
                readTimeout = 2000
                setRequestProperty("Accept", "application/json")
            }
            if (conn.responseCode in 200..299) {
                val response = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                JSONObject(response)
            } else {
                null
            }
        } catch (_: Exception) {
            null
        } finally {
            conn?.disconnect()
        }
    }

    fun testConnection(): Boolean {
        return try {
            val res = getJson("/health")
            res?.optString("status") == "ok"
        } catch (_: Exception) {
            false
        }
    }

    fun registerUser(username: String, passText: String): Long {
        return try {
            val body = JSONObject().apply {
                put("username", username.trim())
                put("password", passText)
            }
            val res = postJson("/auth/register", body)
            val userObj = res?.optJSONObject("user")
            userObj?.optLong("id") ?: -1L
        } catch (_: Exception) {
            -1L
        }
    }

    fun authenticateUser(username: String, passText: String): UserAccount? {
        return try {
            val body = JSONObject().apply {
                put("username", username.trim())
                put("password", passText)
            }
            val res = postJson("/auth/login", body)
            val u = res?.optJSONObject("user") ?: return null
            UserAccount(
                id = u.optLong("id"),
                username = u.optString("username"),
                coins = u.optInt("coins"),
                selectedCarId = u.optString("selected_car_id", "cyber_phantom")
            )
        } catch (_: Exception) {
            null
        }
    }

    fun getUserById(userId: Long): UserAccount? {
        return try {
            val res = getJson("/users/$userId")
            val u = res?.optJSONObject("user") ?: return null
            UserAccount(
                id = u.optLong("id"),
                username = u.optString("username"),
                coins = u.optInt("coins"),
                selectedCarId = u.optString("selected_car_id", "cyber_phantom")
            )
        } catch (_: Exception) {
            null
        }
    }

    fun getAllUsernames(): List<String> {
        val list = mutableListOf<String>()
        try {
            val res = getJson("/users")
            val arr = res?.optJSONArray("usernames") ?: return list
            for (i in 0 until arr.length()) {
                list.add(arr.getString(i))
            }
        } catch (_: Exception) {}
        return list
    }

    fun getUserCarStates(userId: Long): List<UserCarState> {
        val list = mutableListOf<UserCarState>()
        try {
            val res = getJson("/cars/$userId")
            val arr = res?.optJSONArray("cars") ?: return list
            for (i in 0 until arr.length()) {
                val c = arr.getJSONObject(i)
                list.add(
                    UserCarState(
                        carId = c.getString("car_id"),
                        isUnlocked = c.optBoolean("is_unlocked", false),
                        speedLevel = c.optInt("speed_lvl", 1),
                        accelLevel = c.optInt("accel_lvl", 1),
                        handlingLevel = c.optInt("handling_lvl", 1),
                        nitroLevel = c.optInt("nitro_lvl", 1),
                        bodyColor = c.optLong("body_color", 0xFF00F0FFL),
                        underglowColor = c.optLong("underglow_color", 0xFF00F0FFL)
                    )
                )
            }
        } catch (_: Exception) {}
        return list
    }

    fun addCoins(userId: Long, delta: Int): Int {
        return try {
            val body = JSONObject().apply {
                put("userId", userId)
                put("delta", delta)
            }
            val res = postJson("/coins", body)
            res?.optInt("coins") ?: 0
        } catch (_: Exception) {
            0
        }
    }

    fun setSelectedCar(userId: Long, carId: String) {
        try {
            val body = JSONObject().apply {
                put("userId", userId)
                put("carId", carId)
            }
            postJson("/cars/select", body)
        } catch (_: Exception) {}
    }

    fun unlockCar(userId: Long, carId: String, cost: Int): Boolean {
        return try {
            val body = JSONObject().apply {
                put("userId", userId)
                put("carId", carId)
                put("cost", cost)
            }
            val res = postJson("/cars/unlock", body)
            res?.optBoolean("success", false) ?: false
        } catch (_: Exception) {
            false
        }
    }

    fun upgradeCarStat(userId: Long, carId: String, statCol: String, newLevel: Int, cost: Int): Boolean {
        return try {
            val body = JSONObject().apply {
                put("userId", userId)
                put("carId", carId)
                put("statType", statCol)
                put("newLevel", newLevel)
                put("cost", cost)
            }
            val res = postJson("/cars/upgrade", body)
            res?.optBoolean("success", false) ?: false
        } catch (_: Exception) {
            false
        }
    }

    fun updateCarColors(userId: Long, carId: String, bodyColor: Long, underglowColor: Long) {
        try {
            val body = JSONObject().apply {
                put("userId", userId)
                put("carId", carId)
                put("bodyColor", bodyColor)
                put("underglowColor", underglowColor)
            }
            postJson("/cars/colors", body)
        } catch (_: Exception) {}
    }

    fun getTrackProgress(userId: Long, trackId: String): NeonDriftDbHelper.TrackProgressRecord {
        try {
            val res = getJson("/tracks/$userId/$trackId")
            if (res != null) {
                return NeonDriftDbHelper.TrackProgressRecord(
                    bestTimeSec = res.optDouble("best_time_sec", 999.0).toFloat(),
                    bestScore = res.optInt("best_score", 0),
                    m1Done = res.optBoolean("m1_done", false),
                    m2Done = res.optBoolean("m2_done", false),
                    m3Done = res.optBoolean("m3_done", false)
                )
            }
        } catch (_: Exception) {}
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
        try {
            val body = JSONObject().apply {
                put("userId", userId)
                put("trackId", trackId)
                put("timeSec", timeSec)
                put("score", score)
                put("m1", m1Completed)
                put("m2", m2Completed)
                put("m3", m3Completed)
            }
            postJson("/tracks/race-result", body)
        } catch (_: Exception) {}
    }
}
