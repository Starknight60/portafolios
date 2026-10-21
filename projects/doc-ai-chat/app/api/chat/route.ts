import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Modelos a probar en orden de prioridad si uno está saturado (503)
const MODELS_TO_TRY = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const message = formData.get("message") as string;
        const historyRaw = formData.get("history") as string;
        const history: { role: string; content: string }[] = historyRaw ? JSON.parse(historyRaw) : [];

        if (!message) {
            return NextResponse.json(
                { error: "El mensaje o pregunta es obligatorio." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "No se encontró GEMINI_API_KEY en el archivo .env.local" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const contents: any[] = [];

        // Si hay un archivo PDF, lo convertimos a Base64 para enviarlo a Gemini
        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");

            contents.push({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type || "application/pdf",
                },
            });
        }

        // Historial de conversación previa
        if (history && history.length > 0) {
            const previousConversation = history
                .map((msg) => `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`)
                .join("\n\n");
            contents.push(`Historial de conversación previa:\n${previousConversation}\n\n`);
        }

        // Pregunta del usuario
        contents.push(`Pregunta del usuario: ${message}`);

        // Intentar con cada modelo disponible si alguno está saturado
        let lastError: any = null;

        for (const modelName of MODELS_TO_TRY) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction:
                        "Eres un analista de documentos profesional y preciso. Tu objetivo es responder dudas basándote principalmente en el documento adjunto. Responde de forma clara usando formato Markdown (viñetas, negritas, subtítulos). Si la respuesta no está en el documento, indícalo amablemente.",
                });

                const result = await model.generateContent(contents);
                const responseText = result.response.text();

                // Si respondió con éxito, devolvemos la respuesta inmediatamente
                return NextResponse.json({ reply: responseText });
            } catch (err: any) {
                console.warn(`Modelo ${modelName} falló o está saturado, probando siguiente...`);
                lastError = err;
            }
        }

        // Si todos fallaron, lanzamos el último error capturado
        throw lastError;
    } catch (error: any) {
        console.error("Error en /api/chat:", error);
        return NextResponse.json(
            { error: error?.message || "Ocurrió un error al procesar tu documento." },
            { status: 500 }
        );
    }
}