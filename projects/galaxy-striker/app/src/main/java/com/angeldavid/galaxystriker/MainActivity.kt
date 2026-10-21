package com.angeldavid.galaxystriker

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.angeldavid.galaxystriker.theme.GalaxyStrikerTheme
import com.angeldavid.galaxystriker.ui.GalaxyGameScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Keep screen awake while playing
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        enableEdgeToEdge()
        setContent {
            GalaxyStrikerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF060814)
                ) {
                    GalaxyGameScreen()
                }
            }
        }
    }
}
