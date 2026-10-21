# 📄 DocuMind AI — Analizador Inteligente de Documentos PDF

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini%20API-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

> Aplicación Full-Stack para interactuar, analizar y extraer conocimiento de documentos PDF en lenguaje natural mediante Inteligencia Artificial Multimodal.

---

## 🌟 Características Principales

- **Lectura Multimodal Nativa:** Envío y procesamiento directo de archivos PDF en memoria (Base64) hacia la API de Gemini, permitiendo analizar tanto texto como diagramas y tablas estructuradas.
- **Arquitectura Resiliente (Multi-Model Fallback):** Sistema de tolerancia a fallos que detecta saturación en servidores de IA (HTTP 503 / High Demand) y conmuta automáticamente a modelos alternativos en milisegundos sin interrumpir al usuario.
- **Memoria Conversacional:** Mantiene el contexto de preguntas anteriores para permitir diálogos fluidos y preguntas de seguimiento.
- **UI Moderna y Responsiva:** Soporte para arrastrar y soltar (*Drag & Drop*), preguntas rápidas prediseñadas, temas oscuros y renderizado de texto enriquecido.
- **Herramientas de Productividad:** Botón de copiado rápido al portapapeles con confirmación visual y descarga de reportes en archivo `.txt`.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework Full-Stack** | Next.js (App Router, Route Handlers) |
| **Lenguaje** | TypeScript |
| **Estilos & Diseño** | Tailwind CSS v4 + Lucide React Icons |
| **Motor de Inteligencia Artificial** | Google Generative AI SDK (`gemini-3.8-flash`, `gemini-3.5-flash`) |
| **Despliegue** | Vercel |

---

## 🧠 Retos Técnicos y Decisiones de Arquitectura

### 1. Manejo de Saturación de Servidores (HTTP 503)
Durante picos de demanda en modelos de IA gratuitos, las llamadas pueden fallar con `503 Service Unavailable`. En lugar de mostrar un error crítico al usuario final, implementé un patrón de **Fallback en Cascada** en el endpoint `POST /api/chat`:

Esto garantiza una disponibilidad (*uptime*) cercana al 99.9% para el usuario.

### 2. Eficiencia en Memoria sin Almacenamiento en Disco
Para evitar el almacenamiento de archivos temporales en el servidor y optimizar el rendimiento, los archivos se procesan directamente como `ArrayBuffer` en memoria, eliminando fugas de almacenamiento y cumpliendo con mejores prácticas de privacidad.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18 o superior
- Una API Key gratuita de [Google AI Studio](https://aistudio.google.com/)

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/doc-ai-chat.git
   cd doc-ai-chat

   Instalar dependencias:
   ```bash
   npm install
   ```

   Configurar variables de entorno: Crea un archivo .env.local en la raíz del proyecto:

   ```env
   GEMINI_API_KEY=tu_clave_de_gemini_aqui
   ```

   Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

   Abre http://localhost:3000 en tu navegador.