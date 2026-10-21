@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.data

import com.angeldavid.neondrift.model.CarDefinition
import com.angeldavid.neondrift.model.TrackDefinition
import com.angeldavid.neondrift.model.TrackMission
import com.angeldavid.neondrift.model.TrackPoint

object CatalogData {

    // Paleta de Colores de Carrocería
    val BODY_COLORS = listOf(
        0xFF00F0FFL, // Neón Cian
        0xFFFF007FL, // Magenta Synthwave
        0xFF00FF66L, // Verde Tóxico
        0xFFFFD700L, // Oro Eléctrico
        0xFF7C3AEDL, // Púrpura Cibernético
        0xFFFF5722L, // Naranja Infierno
        0xFFF8FAFCL  // Blanco Cuántico
    )

    // Paleta de Luces Underglow LED
    val UNDERGLOW_COLORS = listOf(
        0x00000000L, // Sin luces
        0xFF00F0FFL, // Cian Neón
        0xFFFF1493L, // Rosa Neón Profundo
        0xFF39FF14L, // Lima Neón
        0xFFBF00FFL, // Violeta Láser
        0xFFFFBF00L  // Ámbar Solar
    )

    // Catálogo de Superdeportivos
    val CAR_CATALOG = listOf(
        CarDefinition(
            id = "cyber_phantom",
            name = "Cyber Phantom",
            tagline = "Bólido balanceado de inicio rápido",
            price = 0,
            baseSpeedKmh = 185f,
            baseAccel = 1.0f,
            baseHandling = 1.0f,
            baseNitro = 1.0f,
            defaultBodyColor = 0xFF00F0FFL,
            defaultUnderglowColor = 0xFF00F0FFL
        ),
        CarDefinition(
            id = "neon_viper",
            name = "Neon Viper",
            tagline = "El rey supremo de los derrapes y curvas",
            price = 1500,
            baseSpeedKmh = 205f,
            baseAccel = 1.25f,
            baseHandling = 1.35f,
            baseNitro = 1.3f,
            defaultBodyColor = 0xFFFF007FL,
            defaultUnderglowColor = 0xFFFF1493L
        ),
        CarDefinition(
            id = "hyperion_gt",
            name = "Hyperion GT",
            tagline = "Músculo cibernético y aceleración implacable",
            price = 3500,
            baseSpeedKmh = 235f,
            baseAccel = 1.5f,
            baseHandling = 0.95f,
            baseNitro = 1.2f,
            defaultBodyColor = 0xFFFFD700L,
            defaultUnderglowColor = 0xFFFFBF00L
        ),
        CarDefinition(
            id = "vortex_apex",
            name = "Vortex Apex",
            tagline = "Prototipo hiperespacial de velocidad límite",
            price = 8000,
            baseSpeedKmh = 270f,
            baseAccel = 1.7f,
            baseHandling = 1.45f,
            baseNitro = 1.6f,
            defaultBodyColor = 0xFF7C3AEDL,
            defaultUnderglowColor = 0xFFBF00FFL
        )
    )

    fun getCarDef(id: String): CarDefinition {
        return CAR_CATALOG.firstOrNull { it.id == id } ?: CAR_CATALOG[0]
    }

    // Costo de mejoras por nivel (del nivel 1 al 5)
    fun getUpgradeCost(targetLevel: Int): Int {
        return when (targetLevel) {
            2 -> 350
            3 -> 750
            4 -> 1500
            5 -> 3000
            else -> 0
        }
    }

    // Circuitos de Carreras
    val TRACKS = listOf(
        TrackDefinition(
            id = "neo_tokyo",
            name = "Neo Tokyo Grid",
            location = "Distrito Metropolitano Neón",
            totalLaps = 3,
            trackWidth = 240f,
            baseTimeBonus = 12f,
            skyColorTop = 0xFF03030CL,
            skyColorBottom = 0xFF17082CL,
            barrierPrimaryColor = 0xFF00F0FFL,
            barrierSecondaryColor = 0xFFFF007FL,
            waypoints = listOf(
                TrackPoint(0f, 0f, isCheckpoint = false),
                TrackPoint(600f, 0f, isCheckpoint = true),
                TrackPoint(1100f, 300f, isCheckpoint = false),
                TrackPoint(1400f, 800f, isCheckpoint = true),
                TrackPoint(1200f, 1400f, isCheckpoint = false),
                TrackPoint(600f, 1700f, isCheckpoint = true),
                TrackPoint(-200f, 1700f, isCheckpoint = false),
                TrackPoint(-700f, 1300f, isCheckpoint = false),
                TrackPoint(-1100f, 700f, isCheckpoint = true),
                TrackPoint(-1100f, 100f, isCheckpoint = false),
                TrackPoint(-700f, -400f, isCheckpoint = false),
                TrackPoint(-200f, -300f, isCheckpoint = false),
                TrackPoint(0f, 0f, isCheckpoint = true)
            ),
            missions = listOf(
                TrackMission(1, "Podio Inicial", "Termina la carrera en 1º, 2º o 3º lugar", 300),
                TrackMission(2, "Maestro del Derrape", "Acumula más de 2,500 puntos de derrape", 450),
                TrackMission(3, "Velocidad Pura", "Completa la carrera en menos de 95 segundos", 600)
            )
        ),
        TrackDefinition(
            id = "cyber_canyon",
            name = "Cyber Canyon",
            location = "Gargantas de Plasma de Nueva Nevada",
            totalLaps = 3,
            trackWidth = 220f,
            baseTimeBonus = 13f,
            skyColorTop = 0xFF0D0303L,
            skyColorBottom = 0xFF2A0808L,
            barrierPrimaryColor = 0xFFFF5722L,
            barrierSecondaryColor = 0xFFFFD700L,
            waypoints = listOf(
                TrackPoint(0f, 0f, isCheckpoint = false),
                TrackPoint(450f, 200f, isCheckpoint = true),
                TrackPoint(950f, 100f, isCheckpoint = false),
                TrackPoint(1350f, 500f, isCheckpoint = true),
                TrackPoint(1500f, 1100f, isCheckpoint = false),
                TrackPoint(1150f, 1600f, isCheckpoint = true),
                TrackPoint(500f, 1500f, isCheckpoint = false),
                TrackPoint(100f, 1850f, isCheckpoint = false),
                TrackPoint(-600f, 1800f, isCheckpoint = true),
                TrackPoint(-1050f, 1200f, isCheckpoint = false),
                TrackPoint(-850f, 600f, isCheckpoint = false),
                TrackPoint(-450f, 150f, isCheckpoint = false),
                TrackPoint(0f, 0f, isCheckpoint = true)
            ),
            missions = listOf(
                TrackMission(1, "Campeón del Cañón", "Gana el 1er lugar contra los 3 rivales IA", 650),
                TrackMission(2, "Combo Furia", "Alcanza un multiplicador de derrape de 3.0x", 500),
                TrackMission(3, "Conducción Limpia", "No sufras más de 3 choques con barreras", 700)
            )
        ),
        TrackDefinition(
            id = "quantum_highway",
            name = "Quantum Highway",
            location = "Autovía Elevada Orbital",
            totalLaps = 4,
            trackWidth = 250f,
            baseTimeBonus = 11f,
            skyColorTop = 0xFF02091AL,
            skyColorBottom = 0xFF0A1E42L,
            barrierPrimaryColor = 0xFF00FF66L,
            barrierSecondaryColor = 0xFF00F0FFL,
            waypoints = listOf(
                TrackPoint(0f, 0f, isCheckpoint = false),
                TrackPoint(750f, -100f, isCheckpoint = true),
                TrackPoint(1500f, 200f, isCheckpoint = false),
                TrackPoint(1900f, 900f, isCheckpoint = true),
                TrackPoint(1650f, 1600f, isCheckpoint = false),
                TrackPoint(900f, 2100f, isCheckpoint = true),
                TrackPoint(0f, 2200f, isCheckpoint = false),
                TrackPoint(-800f, 1800f, isCheckpoint = false),
                TrackPoint(-1400f, 1200f, isCheckpoint = true),
                TrackPoint(-1600f, 400f, isCheckpoint = false),
                TrackPoint(-1100f, -200f, isCheckpoint = false),
                TrackPoint(-500f, -100f, isCheckpoint = false),
                TrackPoint(0f, 0f, isCheckpoint = true)
            ),
            missions = listOf(
                TrackMission(1, "Barrera del Sonido", "Alcanza más de 230 km/h usando Nitro", 800),
                TrackMission(2, "Dominio Total", "Lidera la carrera durante toda la última vuelta", 900),
                TrackMission(3, "Puntaje Récord", "Alcanza más de 6,500 puntos totales", 1200)
            )
        )
    )

    fun getTrack(id: String): TrackDefinition {
        return TRACKS.firstOrNull { it.id == id } ?: TRACKS[0]
    }
}
