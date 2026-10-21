package com.angeldavid.galaxystriker.engine

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

class SoundManager(private val context: Context) {

    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    private val scope = CoroutineScope(Dispatchers.Default)

    fun playLaserSound() {
        scope.launch {
            playToneSweep(startFreq = 880f, endFreq = 220f, durationMs = 80)
        }
    }

    fun playExplosionSound() {
        vibrate(60)
        scope.launch {
            playNoiseBurst(durationMs = 200)
        }
    }

    fun playPowerUpSound() {
        vibrate(30)
        scope.launch {
            playArpeggio(listOf(523.25f, 659.25f, 783.99f, 1046.50f), noteMs = 45)
        }
    }

    fun playBombSound() {
        vibrate(180)
        scope.launch {
            playToneSweep(startFreq = 300f, endFreq = 60f, durationMs = 400)
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

    /**
     * Synthesizes and plays a smooth frequency sweep PCM buffer
     */
    private fun playToneSweep(startFreq: Float, endFreq: Float, durationMs: Int) {
        try {
            val sampleRate = 22050
            val numSamples = (sampleRate * durationMs) / 1000
            val buffer = ShortArray(numSamples)

            var phase = 0.0
            for (i in 0 until numSamples) {
                val progress = i.toFloat() / numSamples
                val currentFreq = startFreq + (endFreq - startFreq) * progress
                val envelope = 1.0 - progress // Linear decay
                phase += 2.0 * Math.PI * currentFreq / sampleRate
                buffer[i] = (sin(phase) * 32767 * envelope * 0.4).toInt().toShort()
            }

            playBuffer(buffer, sampleRate)
        } catch (_: Exception) {}
    }

    /**
     * Synthesizes white noise explosion sound
     */
    private fun playNoiseBurst(durationMs: Int) {
        try {
            val sampleRate = 22050
            val numSamples = (sampleRate * durationMs) / 1000
            val buffer = ShortArray(numSamples)

            for (i in 0 until numSamples) {
                val progress = i.toFloat() / numSamples
                val envelope = 1.0 - progress
                val noise = (Math.random() * 2.0 - 1.0)
                buffer[i] = (noise * 32767 * envelope * 0.5).toInt().toShort()
            }

            playBuffer(buffer, sampleRate)
        } catch (_: Exception) {}
    }

    /**
     * Synthesizes a rapid chime arpeggio
     */
    private fun playArpeggio(frequencies: List<Float>, noteMs: Int) {
        try {
            val sampleRate = 22050
            val noteSamples = (sampleRate * noteMs) / 1000
            val totalSamples = noteSamples * frequencies.size
            val buffer = ShortArray(totalSamples)

            for ((index, freq) in frequencies.withIndex()) {
                var phase = 0.0
                val start = index * noteSamples
                for (i in 0 until noteSamples) {
                    val progress = i.toFloat() / noteSamples
                    val envelope = 1.0 - (progress * 0.6)
                    phase += 2.0 * Math.PI * freq / sampleRate
                    buffer[start + i] = (sin(phase) * 32767 * envelope * 0.35).toInt().toShort()
                }
            }

            playBuffer(buffer, sampleRate)
        } catch (_: Exception) {}
    }

    private fun playBuffer(buffer: ShortArray, sampleRate: Int) {
        val audioTrack = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_GAME)
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
    }
}
