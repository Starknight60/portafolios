/* ==========================================
   1. VARIABLES GLOBALES Y CONFIGURACIÓN
   ========================================== */
let gameMode = ''; // Puede ser 'numbers' o 'letters'
let correctAnswer = '';

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Tu API Key configurada
const GEMINI_API_KEY = "TU_GEMINI_API_KEY_AQUI";

/* ==========================================
   2. SISTEMA DE NAVEGACIÓN (CAMBIO DE PANTALLAS)
   ========================================== */
function switchScreen(screenId, mode = '') {
    // 1. Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 2. Mostrar la pantalla seleccionada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // 3. Si entramos a jugar, iniciar la ronda
    if (screenId === 'game-screen' && mode !== '') {
        gameMode = mode;
        nextRound();
    }
}

/* ==========================================
   3. LÓGICA DEL JUEGO (NÚMEROS Y LETRAS)
   ========================================== */
function nextRound() {
    const display = document.getElementById('target-display');
    const instruction = document.getElementById('game-instruction');
    const optionsContainer = document.getElementById('options-container');

    optionsContainer.innerHTML = '';
    const dataList = (gameMode === 'numbers') ? numbers : letters;

    // Elegir respuesta correcta aleatoria
    correctAnswer = dataList[Math.floor(Math.random() * dataList.length)];
    display.textContent = correctAnswer;

    // Instrucción y voz
    if (gameMode === 'numbers') {
        instruction.textContent = `Toca el número ${correctAnswer}`;
        speak(`Toca el número ${correctAnswer}`);
    } else {
        instruction.textContent = `Toca la letra ${correctAnswer}`;
        speak(`Toca la letra ${correctAnswer}`);
    }

    // Crear 4 opciones (1 correcta y 3 falsas)
    let options = [correctAnswer];
    while (options.length < 4) {
        let randomOption = dataList[Math.floor(Math.random() * dataList.length)];
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }

    // Mezclar orden
    options.sort(() => Math.random() - 0.5);

    // Renderizar botones
    options.forEach(opt => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = opt;
        button.onclick = () => checkAnswer(opt, button);
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedOption, buttonElement) {
    if (selectedOption === correctAnswer) {
        playSuccessSound();
        buttonElement.style.backgroundColor = '#55efc4';
        speak("¡Muy bien! ¡Excelente!");

        setTimeout(() => {
            nextRound();
        }, 1500);
    } else {
        playErrorSound();
        buttonElement.style.backgroundColor = '#ff7675';
        speak("¡Oh oh! Inténtalo otra vez");

        setTimeout(() => {
            buttonElement.style.backgroundColor = 'white';
        }, 1000);
    }
}

/* ==========================================
   4. EFECTOS DE SONIDO SINTETIZADOS (Web Audio)
   ========================================== */
function playSuccessSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.log("Audio bloqueado:", e);
    }
}

function playErrorSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        console.log("Audio bloqueado:", e);
    }
}

/* ==========================================
   5. SINTETIZADOR DE VOZ (Texto a Voz)
   ========================================== */
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.pitch = 1.3;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

/* ==========================================
   6. CHAT INTERACTIVO CON IA REAL (GEMINI)
   ========================================== */
async function sendMessage() {
    const input = document.getElementById('user-input');
    const messageText = input.value.trim();
    if (messageText === '') return;

    appendMessage(messageText, 'user');
    input.value = '';

    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'robot');
    typingDiv.id = 'typing-indicator';
    typingDiv.textContent = 'Tobi está pensando... 💭';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await getGeminiResponse(messageText);
        document.getElementById('typing-indicator')?.remove();
        appendMessage(response, 'robot');
        speak(response);
    } catch (error) {
        document.getElementById('typing-indicator')?.remove();
        const errorMessage = "¡Oh, oh! Tobi se quedó dormido un ratito. Intenta de nuevo. 😴";
        appendMessage(errorMessage, 'robot');
        speak(errorMessage);
        console.error(error);
    }
}

function appendMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getGeminiResponse(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const systemInstruction = "Eres Tobi, un robot amigable, dulce y tierno del espacio exterior que chatea con niños muy pequeños (de 3 a 6 años). Tus respuestas deben ser sumamente cortas (máximo 2 oraciones sencillas), llenas de entusiasmo, usar palabras fáciles de entender para niños y muchos emojis divertidos. Si el niño te dice algo sin sentido, sé comprensivo y respóndele con mucho cariño y dulzura.";

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt }
                ]
            }
        ],
        systemInstruction: {
            parts: [
                { text: systemInstruction }
            ]
        },
        generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error('Error al conectar con la API de Gemini');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Enviar mensaje con tecla Enter
document.getElementById('user-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});