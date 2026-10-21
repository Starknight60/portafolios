import os
from fastapi import FastAPI, Request, Response, Query, HTTPException
import requests
from dotenv import load_dotenv

# Cargamos las variables de entorno del archivo .env
load_dotenv()

app = FastAPI()

# Leemos las credenciales configuradas
ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")

@app.get("/webhook")
async def verify_webhook(
    mode: str = Query(None, alias="hub.mode"),
    token: str = Query(None, alias="hub.verify_token"),
    challenge: int = Query(None, alias="hub.challenge")
):
    """
    1. META VERIFICATION HANDSHAKE (GET)
    Cuando configures el Webhook en el portal de Meta, Meta enviará un GET a esta URL.
    Verifica que el 'token' coincida con tu VERIFY_TOKEN. 
    Si coincide, debe retornar el número recibido en 'challenge'.
    """
    if mode == "subscribe" and token == VERIFY_TOKEN:
        print("¡Webhook verificado con éxito por Meta!")
        return Response(content=str(challenge), media_type="text/plain")
    
    raise HTTPException(status_code=403, detail="Verification failed")

@app.post("/webhook")
async def receive_message(request: Request):
    """
    2. RECIBIR MENSAJES (POST)
    Cada vez que un usuario envíe un mensaje a tu bot, Meta enviará un POST con un JSON
    que contiene toda la información de la conversación.
    """
    payload = await request.json()
    print("Payload recibido:", payload)
    
    # Retornamos 200 OK inmediatamente para indicarle a Meta que recibimos el mensaje
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "¡El servidor del Bot de WhatsApp está activo!"}