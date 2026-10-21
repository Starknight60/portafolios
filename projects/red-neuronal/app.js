import { NeuralNetwork } from './neural-net.js';
const canvas = document.getElementById('canvas-nn');
const ctx = canvas.getContext('2d');

const btnClassRed = document.getElementById('btn-class-red');
const btnClassBlue = document.getElementById('btn-class-blue');
const btnTrain = document.getElementById('btn-train');
const btnPattern = document.getElementById('btn-pattern');
const btnClear = document.getElementById('btn-clear');

const selectNeurons = document.getElementById('select-neurons');
const selectLr = document.getElementById('select-lr');

const metricEpochs = document.getElementById('metric-epochs');
const metricLoss = document.getElementById('metric-loss');

let points = [];
let currentClass = 0;
let nn = null;
let istrainig = false;
let epochs = 0;
let animationFrameId = null;

inicializarRed();

function inicializarRed() {
    const hiddenNeurons = parserInte(selectNeurons.value);
    const learningRate = parseFloat(selectLr.value);

    nn = new NeuralNetwork(2, hiddenNeurons, 1);
    nn.learningRate = learningRate;

    epochs = 0;
    metricEpochs.textContent = '0';
    metricLoss.textContent = '0.0000';

    dibujarTodo();
}

selectNeurons.addEventListener('change', inicializarRed);
selectLr.addEventListener('change', () => {
    if (nn) nn.learningRate = parseFloat(selectLr.value);
});
// Selector de Clase de Puntos
btnClassRed.addEventListener('click', () => {
    currentClass = 0;
    btnClassRed.classList.add('red-active');
    btnClassBlue.classList.remove('blue-active');
});
btnClassBlue.addEventListener('click', () => {
    currentClass = 1;
    btnClassBlue.classList.add('blue-active');
    btnClassRed.classList.remove('red-active');
});
// Capturar clics en el Canvas para añadir puntos
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    // NORMALIZAR: Traducir de píxeles [0, 500] a plano cartesiano [-1.0, 1.0]
    const x = (px / canvas.width) * 2 - 1;
    const y = (py / canvas.height) * 2 - 1;
    points.push({ x, y, label: currentClass });
    dibujarTodo();
});
// ==========================================
// SECCIÓN DE DIBUJO (Rendering del Canvas)
// ==========================================
function dibujarTodo() {
    // 1. Limpiar el lienzo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 2. Dibujar la frontera de decisión (El fondo coloreado)
    const resolucion = 6; // Dibuja bloques de 6x6 píxeles para optimizar el rendimiento
    for (let px = 0; px < canvas.width; px += resolucion) {
        for (let py = 0; py < canvas.height; py += resolucion) {
            // Normalizar las coordenadas de este bloque para consultarle a la red
            const x = (px / canvas.width) * 2 - 1;
            const y = (py / canvas.height) * 2 - 1;
            // Hacer Forward pass: obtener predicción (valor de 0 a 1)
            const pred = nn.forward([x, y])[0];
            // Interpolar colores: 
            // Si pred es cercano a 0 (rojo) -> rojo brillante
            // Si pred es cercano a 1 (azul) -> azul brillante
            const r = Math.floor((1 - pred) * 110 + 10);
            const g = Math.floor(10);
            const b = Math.floor(pred * 110 + 10);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(px, py, resolucion, resolucion);
        }
    }
    // 3. Dibujar ejes cartesianos de guía sutiles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    // 4. Dibujar los puntos que ha colocado el usuario
    points.forEach(point => {
        // Des-normalizar: Traducir de plano [-1, 1] de vuelta a píxeles [0, 500]
        const px = (point.x + 1) * (canvas.width / 2);
        const py = (point.y + 1) * (canvas.height / 2);
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);

        // Relleno
        ctx.fillStyle = point.label === 0 ? '#ef4444' : '#3b82f6';
        ctx.fill();
        // Borde brillante blanco
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });
}
// ==========================================
// BUCLE DE ENTRENAMIENTO ASÍNCRONO
// ==========================================
function bucleEntrenamiento() {
    if (!isTraining) return;
    if (points.length > 0) {
        let errorAcumulado = 0;

        // Entrenamos la red 50 veces por fotograma para acelerar la simulación
        const iteracionesPorFrame = 50;
        for (let k = 0; k < iteracionesPorFrame; k++) {
            // Barajar los puntos aleatoriamente (Stochastic Gradient Descent)
            const puntosBarajados = [...points].sort(() => Math.random() - 0.5);
            puntosBarajados.forEach(pt => {
                // Entrenar con este punto
                nn.train([pt.x, pt.y], [pt.label]);
                // Calcular error cuadrático acumulado para fines informativos (Loss)
                const pred = nn.forward([pt.x, pt.y])[0];
                errorAcumulado += Math.pow(pt.label - pred, 2);
            });
        }
        epochs += iteracionesPorFrame;
        // Calcular el error cuadrático medio promedio
        const loss = errorAcumulado / (points.length * iteracionesPorFrame);
        // Actualizar métricas en la interfaz
        metricEpochs.textContent = epochs;
        metricLoss.textContent = loss.toFixed(5);
    }
    // Redibujar el lienzo con el fondo actualizado y los puntos
    dibujarTodo();
    // Solicitar el siguiente fotograma para un renderizado ultra-suave
    animationFrameId = requestAnimationFrame(bucleEntrenamiento);
}
// ==========================================
// CONTROLES INTERACTIVOS
// ==========================================
// Iniciar/Pausar Entrenamiento
btnTrain.addEventListener('click', () => {
    if (isTraining) {
        // Pausar
        isTraining = false;
        btnTrain.innerHTML = '⚡ Entrenar Red Neuronal';
        btnTrain.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
        cancelAnimationFrame(animationFrameId);
    } else {
        // Iniciar
        isTraining = true;
        btnTrain.innerHTML = '⏸️ Pausar Entrenamiento';
        btnTrain.style.background = 'linear-gradient(135deg, #e11d48, #be123c)';
        bucleEntrenamiento();
    }
});
// Limpiar lienzo completo
btnClear.addEventListener('click', () => {
    // Detener entrenamiento si está activo
    isTraining = false;
    btnTrain.innerHTML = '⚡ Entrenar Red Neuronal';
    btnTrain.style.background = 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
    cancelAnimationFrame(animationFrameId);
    points = [];
    inicializarRed();
});
// Patrón Especial XOR (4 cuadrantes alternados)
btnPattern.addEventListener('click', () => {
    btnClear.click(); // Resetear todo primero

    // Cuadrante Superior Izquierdo (Rojo)
    points.push({ x: -0.5, y: -0.5, label: 0 });
    points.push({ x: -0.4, y: -0.6, label: 0 });
    points.push({ x: -0.6, y: -0.4, label: 0 });
    // Cuadrante Inferior Derecho (Rojo)
    points.push({ x: 0.5, y: 0.5, label: 0 });
    points.push({ x: 0.4, y: 0.6, label: 0 });
    points.push({ x: 0.6, y: 0.4, label: 0 });
    // Cuadrante Superior Derecho (Azul)
    points.push({ x: 0.5, y: -0.5, label: 1 });
    points.push({ x: 0.4, y: -0.6, label: 1 });
    points.push({ x: 0.6, y: -0.4, label: 1 });
    // Cuadrante Inferior Izquierdo (Azul)
    points.push({ x: -0.5, y: 0.5, label: 1 });
    points.push({ x: -0.4, y: 0.6, label: 1 });
    points.push({ x: -0.6, y: 0.4, label: 1 });
    dibujarTodo();
});