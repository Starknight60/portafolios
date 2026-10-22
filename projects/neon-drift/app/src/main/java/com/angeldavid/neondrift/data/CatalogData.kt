@file:Suppress("SpellCheckingInspection")

package com.angeldavid.neondrift.data

import com.angeldavid.neondrift.model.CarDefinition
import com.angeldavid.neondrift.model.TrackDefinition
import com.angeldavid.neondrift.model.TrackMission
import com.angeldavid.neondrift.model.TrackPoint

data class SpoilerOption(
    val id: Int,
    val name: String,
    val description: String
)

object CatalogData {

    // Paleta de Colores de Carrocería (10 opciones)
    val BODY_COLORS = listOf(
        0xFF00F0FFL, // Neón Cian
        0xFFFF007FL, // Magenta Synthwave
        0xFF00FF66L, // Verde Tóxico
        0xFFFFD700L, // Oro Eléctrico
        0xFF7C3AEDL, // Púrpura Cibernético
        0xFFFF5722L, // Naranja Infierno
        0xFFF8FAFCL, // Blanco Cuántico
        0xFFFF1744L, // Rojo Carmesí
        0xFF2979FFL, // Azul Cobalto
        0xFFFFEA00L  // Amarillo Volt
    )

    // Paleta de Luces Underglow LED (Inferior)
    val UNDERGLOW_COLORS = listOf(
        0x00000000L, // Sin luces
        0xFF00F0FFL, // Cian Neón
        0xFFFF1493L, // Rosa Neón Profundo
        0xFF39FF14L, // Lima Neón
        0xFFBF00FFL, // Violeta Láser
        0xFFFFBF00L, // Ámbar Solar
        0xFF00E5FFL, // Azul Hielo
        0xFFFF1744L, // Carmesí Neón
        0xFFFFFFFFL  // Blanco Estroboscópico
    )

    // Paleta de Color de Llantas (Rims)
    val RIM_COLORS = listOf(
        0xFF00F0FFL, // Cian Neón
        0xFFFFD700L, // Oro Eléctrico
        0xFF00FF66L, // Verde Lima
        0xFFFF007FL, // Magenta Synthwave
        0xFFFF5722L, // Naranja Fuego
        0xFFF8FAFCL, // Cromo Plata
        0xFF7C3AEDL  // Púrpura Plasma
    )

    // Estilos de Alerón Aerodinámico
    val SPOILERS = listOf(
        SpoilerOption(0, "Alerón Racing OEM", "Alerón fino integrado para menor resistencia"),
        SpoilerOption(1, "Alerón GT Doble Ala", "Mayor carga aerodinámica en curvas de alta velocidad"),
        SpoilerOption(2, "Cyber Blade Carbono", "Diseño agresivo time-attack con borde neón")
    )

    // Efectos de Estela / Partículas de Humo y Nitro
    val TRAIL_FX_COLORS = listOf(
        0xFF00F0FFL, // Cian Eléctrico
        0xFFFF1744L, // Llamas Carmesí
        0xFFFFD700L, // Chispas de Oro
        0xFF00FF66L, // Plasma Tóxico Verde
        0xFFBF00FFL, // Bruma Synthwave Violeta
        0xFFF8FAFCL  // Vórtice Blanco Cuántico
    )

    // Catálogo de Superdeportivos con Arquetipos Asimétricos
    val CAR_CATALOG = listOf(
        CarDefinition(
            id = "cyber_phantom",
            name = "Cyber Phantom",
            tagline = "El clásico noble del circuito subterráneo",
            archetype = "🔰 EQUILIBRADO",
            archetypeBadgeColor = 0xFF00F0FFL,
            prosText = "Manejo noble y dócil; perdona errores y recupera el control rápido",
            consText = "Velocidad punta estándar; sin ventajas extremas",
            price = 0,
            baseSpeedKmh = 190f,
            baseAccel = 1.05f,
            baseHandling = 1.15f,
            baseNitro = 1.0f,
            defaultBodyColor = 0xFF00F0FFL,
            defaultUnderglowColor = 0xFF00F0FFL,
            defaultRimColor = 0xFF00F0FFL
        ),
        CarDefinition(
            id = "hyperion_gt",
            name = "Hyperion Muscle GT",
            tagline = "Fuerza bruta descomunal para devorar rectas",
            archetype = "⚡ MONSTRUO DE RECTAS",
            archetypeBadgeColor = 0xFFFF5722L,
            prosText = "¡Aceleración explosiva y la mayor velocidad del juego (260 km/h)!",
            consText = "⚠️ Manejo pesado en curvas lentas (Giro reducido). ¡Frena con anticipación!",
            price = 1800,
            baseSpeedKmh = 260f,
            baseAccel = 1.65f,
            baseHandling = 0.72f, // Manejo pesado, tal como pidió el usuario
            baseNitro = 1.35f,
            defaultBodyColor = 0xFFFF5722L,
            defaultUnderglowColor = 0xFFFFBF00L,
            defaultRimColor = 0xFFFFD700L
        ),
        CarDefinition(
            id = "neon_viper",
            name = "Neon Viper RS",
            tagline = "Bisturí de fibra de carbono para curvas cerradas",
            archetype = "🌀 REY DEL DERRAPE",
            archetypeBadgeColor = 0xFFFF007FL,
            prosText = "¡Giro ultra-ágil (1.75x) y multiplicadores de derrape acelerados!",
            consText = "Velocidad punta modesta (175 km/h) en rectas largas",
            price = 2200,
            baseSpeedKmh = 175f,
            baseAccel = 1.35f,
            baseHandling = 1.75f, // Máxima agilidad de derrape
            baseNitro = 1.15f,
            defaultBodyColor = 0xFFFF007FL,
            defaultUnderglowColor = 0xFFFF1493L,
            defaultRimColor = 0xFFFF007FL
        ),
        CarDefinition(
            id = "vortex_apex",
            name = "Vortex Apex Orbital",
            tagline = "Hiperdeportivo espacial con propulsión de iones",
            archetype = "🚀 COHETE DE NITRO",
            archetypeBadgeColor = 0xFF7C3AEDL,
            prosText = "¡Impulso de Nitro supersónico (2.2x) a más de 340 km/h!",
            consText = "El turbo consume carga rápidamente; exige derrapar para recargar",
            price = 4500,
            baseSpeedKmh = 230f,
            baseAccel = 1.30f,
            baseHandling = 1.35f,
            baseNitro = 2.20f, // Nitro masivo
            defaultBodyColor = 0xFF7C3AEDL,
            defaultUnderglowColor = 0xFFBF00FFL,
            defaultRimColor = 0xFF00FF66L
        ),
        CarDefinition(
            id = "kage_ronin",
            name = "Kage Ronin Stealth",
            tagline = "Prototipo clandestino de carreras nocturnas",
            archetype = "⚔️ CAZADOR SUPREMO",
            archetypeBadgeColor = 0xFF00FF66L,
            prosText = "Rendimiento de élite equilibrado en aceleración y derrape continuo",
            consText = "Vehículo exclusivo del mercado negro (6,000 créditos)",
            price = 6000,
            baseSpeedKmh = 235f,
            baseAccel = 1.55f,
            baseHandling = 1.45f,
            baseNitro = 1.50f,
            defaultBodyColor = 0xFF00FF66L,
            defaultUnderglowColor = 0xFF39FF14L,
            defaultRimColor = 0xFFF8FAFCL
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

    // Circuitos de Carreras con Progresión y Desbloqueo
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
            ),
            unlockCost = 0,
            unlockRequiredTrackId = null,
            unlockRequiredMissionText = "Pista libre de inicio"
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
            ),
            unlockCost = 600,
            unlockRequiredTrackId = "neo_tokyo",
            unlockRequiredMissionText = "Haz podio en Neo Tokyo o paga 600 🪙"
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
            ),
            unlockCost = 1400,
            unlockRequiredTrackId = "cyber_canyon",
            unlockRequiredMissionText = "Gana en Cyber Canyon o paga 1,400 🪙"
        ),
        TrackDefinition(
            id = "omega_colosseum",
            name = "Omega Colosseum",
            location = "Mega-Estadio Orbital Synthwave",
            totalLaps = 4,
            trackWidth = 260f,
            baseTimeBonus = 10f,
            skyColorTop = 0xFF140226L,
            skyColorBottom = 0xFF2A034AL,
            barrierPrimaryColor = 0xFFFFD700L,
            barrierSecondaryColor = 0xFFBF00FFL,
            waypoints = listOf(
                TrackPoint(0f, 0f, isCheckpoint = false),
                TrackPoint(800f, 100f, isCheckpoint = true),
                TrackPoint(1600f, 500f, isCheckpoint = false),
                TrackPoint(1800f, 1200f, isCheckpoint = true),
                TrackPoint(1300f, 1900f, isCheckpoint = false),
                TrackPoint(400f, 2200f, isCheckpoint = true),
                TrackPoint(-600f, 2000f, isCheckpoint = false),
                TrackPoint(-1300f, 1400f, isCheckpoint = true),
                TrackPoint(-1700f, 600f, isCheckpoint = false),
                TrackPoint(-1200f, -200f, isCheckpoint = true),
                TrackPoint(-500f, -300f, isCheckpoint = false),
                TrackPoint(0f, 0f, isCheckpoint = true)
            ),
            missions = listOf(
                TrackMission(1, "Leyenda Omega", "Vence a los 3 rivales con más de 3s de ventaja", 1200),
                TrackMission(2, "Maestría Pura", "Alcanza multiplicador de derrape x4.0 máximo", 1000),
                TrackMission(3, "Tiempo Imposible", "Completa las 4 vueltas en menos de 115 segundos", 1500)
            ),
            unlockCost = 2500,
            unlockRequiredTrackId = "quantum_highway",
            unlockRequiredMissionText = "Supera Quantum Highway o paga 2,500 🪙"
        )
    )

    fun getTrack(id: String): TrackDefinition {
        return TRACKS.firstOrNull { it.id == id } ?: TRACKS[0]
    }
}
