---
name: agentcraft-time-and-math-agent
description: Agente de consola interactivo que responde preguntas generales, consulta la hora del sistema local y evalúa expresiones matemáticas complejas utilizando Gemini API.
---

# AgentCraft: Time & Math Agent

Este agente utiliza la API de Gemini (`gemini-2.5-flash`) combinada con el SDK `google-genai` en Python para interactuar con el usuario en un bucle interactivo de terminal.

## Habilidades y Herramientas (Tools)

El agente tiene capacidad para invocar de manera autónoma las siguientes funciones de Python:

1. **`obtener_hora_actual()`**
   - **Descripción**: Consulta el reloj del sistema operativo local.
   - **Retorno**: Un string con la fecha y hora en formato `AAAA-MM-DD HH:MM:SS`.
   - **Cuándo se usa**: Cuando el usuario pregunta la hora o la fecha del día actual.

2. **`calcular_matematica(expresion: str)`**
   - **Descripción**: Evalúa expresiones matemáticas complejas (sumas, restas, multiplicaciones, divisiones, paréntesis).
   - **Parámetros**: `expresion` (un string con la operación matemática).
   - **Retorno**: El resultado numérico de la operación en formato string.
   - **Cuándo se usa**: Cuando el usuario pide resolver un cálculo aritmético.

## Requisitos de Instalación

Para que esta skill funcione, la máquina debe tener:
* Python 3.10 o superior.
* Las librerías: `google-genai` y `python-dotenv`.
* Un archivo `.env` configurado con la clave `GEMINI_API_KEY`.

## Cómo Ejecutar el Agente

Ejecutar el archivo principal desde la consola dentro del entorno virtual:
```bash
python main.py