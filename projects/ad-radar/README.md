# 📡 AdRadar Enterprise — Plataforma de Inteligencia Competitiva de Anuncios y Ofertas

> **SaaS B2B Full-Stack** para monitorizar, analizar y comparar las campañas publicitarias, ofertas agresivas y copys creativos de la competencia directa en tiempo real.

🔗 **URL Pública en Producción (Vercel 24/7):** [https://ad-radar-eta.vercel.app/](https://ad-radar-eta.vercel.app/)

Desarrollado por **Ángel David Morillo García** — *Full-Stack & AI Software Engineer*

---

## 🎯 ¿Qué es AdRadar?

En el mercado actual, las empresas necesitan saber **qué está haciendo su competencia** para no quedarse atrás en promociones, formatos publicitarios y canales de adquisición.

**AdRadar** permite a marcas y directores de marketing:
- **Analizar a sus rivales directos**: Por ejemplo, **KFC vs Arturo's** (Fast Food), **PedidosYa vs Yummy** (Delivery), **Ridery vs Yango** (Transporte), **Farmatodo vs Locatel** (Salud), **Apple vs Samsung** (Tecnología), **PlayStation vs Xbox** (Videojuegos).
- **Feed Centralizado de Anuncios**: Filtrar por industria, empresa, plataforma publicitaria (Instagram, TikTok, Facebook, Google, YouTube, LinkedIn) y tipo de oferta (Descuento %, 2x1, Envío Gratis, Combo, Lanzamiento).
- **Benchmark Head-to-Head**: Comparativas directas con métricas de alcance estimado, distribución de plataformas, intensidad de descuentos y análisis de estrategia agresiva vs institucional.
- **Moodboards / Swipe File**: Guardar anuncios clave para inspirar las próximas campañas publicitarias del equipo creativo.
- **Registro de Inteligencia**: Formulario estructurado para indexar nuevos anuncios descubiertos con validación relacional en PostgreSQL.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js 16 (Turbopack, App Router)](https://nextjs.org/) | Renderizado híbrido SSR/CSR y Server Actions de alto rendimiento |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Tipado estricto y seguridad en tiempo de compilación |
| **Estilos & UI** | [Tailwind CSS 3](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) | Diseño corporativo moderno con modo oscuro |
| **Gráficos & Métricas** | [Recharts](https://recharts.org/) | Visualización interactiva de benchmarking y distribución de canales |
| **Base de Datos** | [PostgreSQL 17](https://www.postgresql.org/) | Almacenamiento relacional robusto con llaves foráneas e índices optimizados |
| **ORM** | [Prisma ORM 6](https://www.prisma.io/) | Modelado de datos declarativo, migraciones y cliente tipado con pooling |

---

## 🗄️ Modelo Relacional de Base de Datos (PostgreSQL)

```mermaid
erDiagram
    COMPANY ||--o{ AD : publishes
    COMPANY ||--o{ COMPETITOR_PAIR : primary_company
    COMPANY ||--o{ COMPETITOR_PAIR : rival_company
    BOARD ||--o{ BOARD_ITEM : contains
    AD ||--o{ BOARD_ITEM : saved_in

    COMPANY {
        string id PK
        string name
        string slug
        string industry
        string logoUrl
        string website
        string country
    }

    AD {
        string id PK
        string companyId FK
        string title
        string creativeCopy
        string offerType
        string discountValue
        string platform
        string mediaUrl
        string landingUrl
        string targetAudience
        int estimatedReach
        datetime startDate
    }

    COMPETITOR_PAIR {
        string id PK
        string companyAId FK
        string companyBId FK
        string industry
        string notes
    }

    BOARD {
        string id PK
        string title
        string description
    }

    BOARD_ITEM {
        string id PK
        string boardId FK
        string adId FK
        string strategicNote
    }
```

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
- Node.js 18+ o 20+
- Servidor PostgreSQL activo (ej. PostgreSQL 17 en `localhost:5432`)

### Pasos de Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Crea o edita `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/adradar_db?schema=public"
   ```

3. **Sincronizar el esquema con PostgreSQL**:
   ```bash
   npx prisma db push
   ```

4. **Poblar la base de datos con datos de prueba realistas**:
   ```bash
   node prisma/seed.js
   ```

5. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Guía de Despliegue en Producción (URL Pública Gratuita)

Para publicar AdRadar en internet con tu propia URL pública (ejemplo: `https://adradar.vercel.app`) y que cualquier usuario o reclutador pueda usarlo en tiempo real:

### 1. Base de Datos en la Nube Gratuita (Neon.tech o Supabase)
1. Crea una cuenta gratuita en [Neon.tech](https://neon.tech/) o [Supabase.com](https://supabase.com/).
2. Crea un proyecto llamado `adradar-production`.
3. Copia tu Connection String PostgreSQL con SSL (ejemplo: `postgresql://neondb_owner:xyz@ep-cold-mountain.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### 2. Sincronizar y Sembrar la Nube
En tu terminal local, ejecuta con la URL de la nube:
```bash
DATABASE_URL="tu-url-de-neon" npx prisma db push
DATABASE_URL="tu-url-de-neon" node prisma/seed.js
```

### 3. Desplegar en Vercel
1. Sube tu código a GitHub.
2. Ingresa a [Vercel.com](https://vercel.com) y selecciona **Add New Project**.
3. Importa el repositorio `portafolios` (o el repositorio individual de `ad-radar`).
4. En **Environment Variables**, agrega:
   - `DATABASE_URL`: La URL de conexión de Neon/Supabase.
5. Haz clic en **Deploy**. ¡En menos de 2 minutos tu SaaS estará en vivo con HTTPS automático y URL global!

---

## 👨‍💻 Autor

**Ángel David Morillo García**  
- Full-Stack & AI Software Engineer  
- GitHub: [@Starknight60](https://github.com/Starknight60)
