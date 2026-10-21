package com.angeldavid.neondrift

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.angeldavid.neondrift.theme.NeonDriftTheme
import com.angeldavid.neondrift.ui.NeonDriftScreen

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    enableEdgeToEdge()
    setContent {
      NeonDriftTheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = Color(0xFF03030C)
        ) {
          NeonDriftScreen()
        }
      }
    }
  }
}

