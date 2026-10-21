import os
import logging
import asyncio  # Para ejecutar la llamada de Gemini sin bloquear el bot
import google.generativeai as genai
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters

# 1. Cargar variables de entorno
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

# 2. Configurar el logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# 3. Configurar la API de Gemini
genai.configure(api_key=GEMINI_KEY)
# Usamos el modelo "gemini-1.5-flash", que es rápido y eficiente para chats
ai_model = genai.GenerativeModel("gemini-2.5-flash")

# 4. Comando /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await update.message.reply_html(
        rf"¡Hola, {user.mention_html()}! 👋"
        "\nSoy tu bot inteligente. Puedes preguntarme lo que quieras, al estilo ChatGPT.\n"
        "Escribe /help para ver las instrucciones."
    )

# 5. Comando /help
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "🤖 *Instrucciones:*\n"
        "Solo escribe tu pregunta o mensaje en el chat, y yo le pediré a la inteligencia artificial de Gemini que te responda\.\n\n"
        "Nota: No puedo procesar ni generar imágenes, solo texto\."
    )
    await update.message.reply_text(help_text, parse_mode="MarkdownV2")

# 6. Manejador de mensajes de texto (Integración con Gemini IA)
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    logger.info(f"Mensaje de {update.effective_user.first_name}: {user_message}")

    # Mostrar en Telegram el estado de "Escribiendo..." mientras la IA piensa
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    try:
        # La llamada a la API de Gemini es síncrona y bloquea el hilo de ejecución.
        # Para evitar congelar el bot completo, la ejecutamos en un hilo secundario usando 'asyncio.to_thread'
        response = await asyncio.to_thread(ai_model.generate_content, user_message)
        reply_text = response.text
    except Exception as e:
        logger.error(f"Error con la API de Gemini: {e}")
        reply_text = "Lo siento, tuve un problema al conectarme con mi cerebro de IA. Por favor, intenta de nuevo."

    # Enviar la respuesta generada por Gemini al usuario de Telegram
    await update.message.reply_text(reply_text)

# 7. Inicializar el Bot
def main():
    if not TELEGRAM_TOKEN or not GEMINI_KEY:
        print("[ERROR] Asegúrate de tener configurados TELEGRAM_BOT_TOKEN y GEMINI_API_KEY en tu .env")
        return

    application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

    # Enlazar comandos
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))

    # Reemplazamos el antiguo echo por nuestro manejador inteligente
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("El bot inteligente se está ejecutando... Presiona Ctrl+C para detenerlo.")
    application.run_polling()

if __name__ == '__main__':
    main()