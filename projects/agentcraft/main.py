import os
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client()

def obtener_hora_actual() -> str:
    """Retorna la fecha y hora actual del sistema en formato de texto"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def calcular_matematicas(expresion: str) -> str:
    """Resuelve una operaciones matematicas enviadas como texto. Ejemplo de entrada: '245 * 89' o '(120 + 30) / 5'."""

    caracteres_permitidos = "0123456789+-*/()."
    if not all(c in caracteres_permitidos for c in expresion):
        return "Error: Expresion inavlida o caracteres no permitidos."

    try: 
        resultado = eval(expresion)
        return str(resultado)
    except Exception as e:
        return f"Error en el calculo: {str(e)}"

def iniciar_agente():
    print("===========================================")
    print("Agente Craft - Iniciado y listo")
    print("Escribe tu pregunta o escribe 'salir' para terminar.")
    print("===========================================\n")

    chat = client.chats.create(
        model='gemini-2.5-flash',
        config=types.GenerateContentConfig(
            tools=[obtener_hora_actual, calcular_matematicas],
            system_instruction=("Eres un asistente de IA llamado Agente Craft creado por David. Eres un asistente util para cualquier tipo de trabajo y ademas puedes responder preguntas sobre matematicas y fechas.")
        )
    )

    try:
        while True:
            try:
                usuario_input = input("Tu: ")
                if usuario_input.lower() in ['salir', 'exit', 'quit']:
                    print("¡Hasta luego!")
                    break
            except KeyboardInterrupt:
                print("\n¡Hasta luego!")
                break
            if not usuario_input.strip():
                continue
            respuesta = chat.send_message(usuario_input)
            print(f"Agente Craft: {respuesta.text}\n")
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            print("[Límite de API]: Has enviado demasiadas preguntas seguidas. Por favor, espera 30-40 segundos antes de intentar de nuevo.\n")
        else:
            print(f"Ocurrio un error inesperado: {e}\n")

if __name__ == "__main__":
    iniciar_agente()