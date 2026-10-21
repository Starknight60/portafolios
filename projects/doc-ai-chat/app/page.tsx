"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  FileCheck,
  Copy,
  Check,
  Download,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Componente para formatear el texto enriquecido de la IA (Markdown limpio sin librerías pesadas)
function FormattedContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Títulos (### o ##)
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-indigo-300 text-base mt-3">
              {trimmed.replace("### ", "")}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-bold text-indigo-200 text-lg mt-4">
              {trimmed.replace("## ", "")}
            </h3>
          );
        }

        // Listas con viñetas (* o -)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 ml-2">
              <span className="text-indigo-400 mt-1">•</span>
              <span>{renderBold(content)}</span>
            </div>
          );
        }

        // Línea vacía
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Párrafo normal con soporte de negritas
        return <p key={idx}>{renderBold(trimmed)}</p>;
      })}
    </div>
  );
}

// Función auxiliar para resaltar **texto en negrita**
function renderBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Por favor, sube únicamente archivos en formato PDF.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== "application/pdf") {
        setError("Por favor, sube únicamente archivos en formato PDF.");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    if (!file) {
      setError("Primero debes subir un archivo PDF para poder chatear.");
      return;
    }

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message", messageContent);
      formData.append(
        "history",
        JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content })))
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error en el servidor.");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "📝 Haz un resumen ejecutivo de este documento.",
    "🔍 ¿Cuáles son los 3 puntos más importantes?",
    "💡 Explica este documento de forma sencilla para principiantes.",
  ];

  return (
    <main className="flex h-screen bg-slate-950 text-slate-100 antialiased">
      {/* PANEL LATERAL: ARCHIVO & CONTROLES */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          {/* Logo y Encabezado */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">DocuMind AI</h1>
              <span className="text-xs text-indigo-400 font-medium">Powered by Gemini 3.8</span>
            </div>
          </div>

          {/* Subir PDF / Drag & Drop */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Documento Activo
            </label>

            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging
                  ? "border-indigo-500 bg-indigo-950/20 scale-[0.99]"
                  : "border-slate-700 hover:border-slate-500 bg-slate-900/40"
                  }`}
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">Arrastra tu PDF aquí</p>
                <p className="text-xs text-slate-500 mt-1">o haz clic para explorar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-indigo-950/60 border border-indigo-800/50 rounded-lg text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate text-slate-200">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  title="Eliminar archivo"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Preguntas sugeridas */}
          {file && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Preguntas rápidas
              </label>
              <div className="space-y-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="w-full text-left text-xs bg-slate-900/60 hover:bg-slate-800 text-slate-300 p-2.5 rounded-lg border border-slate-800 transition truncate block hover:border-slate-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer del panel lateral */}
        <div className="text-xs text-slate-500 border-t border-slate-800/80 pt-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Arquitectura</span>
            <span className="text-emerald-400 font-medium">Resiliente (Fallback)</span>
          </div>
          <p className="text-slate-600 mt-1">Next.js &middot; TypeScript &middot; Tailwind CSS</p>
        </div>
      </aside>

      {/* ÁREA DE CHAT PRINCIPAL */}
      <section className="flex-1 flex flex-col h-full bg-slate-950">
        {/* Header superior */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300">
              {file ? (
                <span className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                  <FileCheck className="w-3.5 h-3.5" /> PDF Activo: {file.name}
                </span>
              ) : (
                <span className="text-xs text-slate-500">Ningún archivo cargado</span>
              )}
            </span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpiar chat
            </button>
          )}
        </header>

        {/* Alerta de Error */}
        {error && (
          <div className="bg-red-950/50 border-b border-red-800/50 px-6 py-2.5 flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Lista de Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 mb-4 text-indigo-400 shadow-xl shadow-indigo-950/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-slate-200 mb-1">
                Analizador Inteligente de Documentos
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Sube un PDF (reportes, libros, manuales, contratos) y haz cualquier pregunta. Las respuestas se generan contextualizadas y con citas precisas.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="md:hidden px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium"
              >
                Subir documento PDF
              </button>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-3xl ${msg.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
                  }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="group relative">
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900/90 border border-slate-800 text-slate-200"
                      }`}
                  >
                    {msg.role === "assistant" ? (
                      <FormattedContent text={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {/* Acciones para mensajes del Asistente (Copiar y Descargar) */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-1.5 ml-2 text-xs text-slate-500">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="flex items-center gap-1 hover:text-slate-300 transition"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar respuesta</span>
                          </>
                        )}
                      </button>
                      <span>&middot;</span>
                      <button
                        onClick={() =>
                          downloadText(msg.content, `analisis-${file?.name || "documento"}.txt`)
                        }
                        className="flex items-center gap-1 hover:text-slate-300 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar (.txt)</span>
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loader mientras piensa */}
          {loading && (
            <div className="flex gap-4 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 flex items-center gap-3 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Analizando el contenido del documento con Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensaje */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="max-w-3xl mx-auto flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                file
                  ? "Escribe tu pregunta sobre el PDF..."
                  : "Primero sube un PDF para comenzar..."
              }
              disabled={loading || !file}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !file}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition flex items-center justify-center shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}