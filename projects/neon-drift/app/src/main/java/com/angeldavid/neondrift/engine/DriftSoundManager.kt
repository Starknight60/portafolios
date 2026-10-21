package com.angeldavid.neondrift.engine

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.sin

class DriftSoundManager(private val context: Context) {

    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    private val scope = CoroutineScope(Dispatchers.Default)
    private var lastDriftSoundTime = 0L

    fun playDriftScreech() {
        val now = System.currentTimeMillis()
        if (now - lastDriftSoundTime < 180) return
        lastDriftSoundTime = now
        vibrate(40)
        scope.launch {
            playNoiseSweep(durationMs = 120, filterFreq = 1800f)
        }
    }

    fun playNitroBoost() {
        vibrate(90)
        scope.launch {
            playToneSweep(startFreq = 300f, endFreq = 1400f, durationMs = 280)
        }
    }

    fun playCheckpointChime() {
        vibrate(50)
        scope.launch {
            playChime(listOf(659.25f, 987.77f, 1318.51f), noteMs = 60)
        }
    }

    fun playVictoryFanfare() {
        vibrate(120)
        scope.launch {
            playChime(listOf(523.25f, 659.25f, 783.99f, 1046.50f), noteMs = 110)
        }
    }

    fun playCheerChime() {
        scope.launch {
            playToneSweep(startFreq = 440f, endFreq = 880f, durationMs = 180)
        }
    }

    fun playBarrierScrape() {
        vibrate(70)
        scope.launch {
            playNoiseSweep(durationMs = 90, filterFreq = 800f)
        }
    }

    private fun vibrate(milliseconds: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(milliseconds)
            }
        } catch (_: Exception) {}
    }

    private fun playToneSweep(startFreq: Float, endFreq: Float, durationMs: Int) {
        try {
            val sampleRate = 22050
            val numSamples = (sampleRate * durationMs) / 1000
            val buffer = ShortArray(numSamples)

            var phase = 0.0
            for (i in 0 until numSamples) {
                val progress = i.toFloat() / numSamples
                val currentFreq = startFreq + (endFreq - startFreq) * progress
                val envelope = if (progress < 0.2f) progress / 0.2f else 1.0f - (progress - 0.2f) / 0.8f
                phase += 2.0 * Math.PI * currentFreq / sampleRate
                buffer[i] = (sin(phase) * 32767 * envelope * 0.35).toInt().toShort()
            }
            playBuffer(buffer, sampleRate)
        } catch (_: Exception) {}
    }

    private fun playNoiseSweep(durationMs: Int, filterFreq: Float) {
        try {
            val sampleRate = 22050
            val numSamples = (sampleRate * durationMs) / 1000
            val buffer = ShortArray(numSamples)

            var lastSample = 0.0
            val alpha = (2.0 * Math.PI * (filterFreq / sampleRate)).coerceIn(0.01, 0.95)

            for (i in 0 until numSamples) {
                val progress = i.toFloat() / numSamples
                val envelope = 1.0f - progress
                val whiteNoise = Math.random() * 2.0 - 1.0
                lastSample += alpha * (whiteNoise - lastSample)
                buffer[i] = (lastSample * 32767 * envelope * 0.3).toInt().toShort()
            }
            playBuffer(buffer, sampleRate)
        } catch (_: Exception) {}
    }

    private fun playChime(frequencies: List<Float>, noteMs: Int) {
        try {
            val sampleRate = 22050
            val samplesPerNote = (sampleRate * noteMs) / 1000
            val buffer = ShortArray(samplesPerNote * frequencies.size)

            for ((noteIdx, freq) in frequencies.withIndex()) {
                var phase = 0.0
                val startIdx = noteIdx * samplesPerNote
                for (i in 0 until samplesPerNote) {
                    val progress = i.toFloat() / samplesPerNote
                    val envelope = 1.0f - progress
                    phase += 2.0 * Math.PI * freq / sampleRate
                    buffer[startIdx + i] = (sin(phase) * 32767 * envelope * 0.32).toInt().toShort()
                }
            }
            playBuffer(buffer, sampleRate)
        } catch (_: Exception) {}
    }

    private fun playBuffer(buffer: ShortArray, sampleRate: Int) {
        val audioTrack = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_GAME)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setSampleRate(sampleRate)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
            )
            .setBufferSizeInBytes(buffer.size * 2)
            .setTransferMode(AudioTrack.MODE_STATIC)
            .build()

        audioTrack.write(buffer, 0, buffer.size)
        audioTrack.play()
        audioTrack.setNotificationMarkerPosition(buffer.size)
        audioTrack.setPlaybackPositionUpdateListener(object : AudioTrack.OnPlaybackPositionUpdateListener {
            override fun onMarkerReached(track: AudioTrack?) {
                track?.release()
            }
            override fun onPeriodicNotification(track: AudioTrack?) {}
        })
    }
}
