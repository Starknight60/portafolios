"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Tag,
  Trash2,
  MoreVertical,
  CheckSquare,
  Square,
  Kanban,
  BarChart2,
  SlidersHorizontal,
  X,
  GripVertical,
} from "lucide-react";

export type Priority = "urgente" | "alta" | "media" | "baja";
export type Status = "todo" | "in_progress" | "in_review" | "done";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: number;
}

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Diseñar arquitectura de base de datos",
    description: "Crear esquema relacional para usuarios, suscripciones y roles en PostgreSQL.",
    status: "done",
    priority: "alta",
    dueDate: "2026-10-05",
    tags: ["Backend", "DB"],
    subtasks: [
      { id: "s1", title: "Diagrama Entidad-Relación", completed: true },
      { id: "s2", title: "Definir índices y claves foráneas", completed: true },
    ],
    createdAt: Date.now() - 300000,
  },
  {
    id: "2",
    title: "Implementar autenticación con OAuth",
    description: "Configurar login con Google y GitHub mediante JWT seguro y refresh tokens.",
    status: "in_progress",
    priority: "urgente",
    dueDate: "2026-10-08",
    tags: ["Seguridad", "Auth"],
    subtasks: [
      { id: "s3", title: "Endpoint de login Google", completed: true },
      { id: "s4", title: "Middleware de verificación JWT", completed: false },
      { id: "s5", title: "Cookies HttpOnly", completed: false },
    ],
    createdAt: Date.now() - 200000,
  },
  {
    id: "3",
    title: "Optimizar rendimiento de imágenes y caché",
    description: "Configurar compresión WebP automática y cabeceras de caché HTTP en CDN.",
    status: "in_review",
    priority: "media",
    dueDate: "2026-10-12",
    tags: ["Frontend", "Performance"],
    subtasks: [
      { id: "s6", title: "Auditoría Lighthouse", completed: true },
      { id: "s7", title: "Configurar Next Image", completed: true },
    ],
    createdAt: Date.now() - 100000,
  },
  {
    id: "4",
    title: "Integrar pasarela de pagos Stripe",
    description: "Implementar webhooks de confirmación y flujo de suscripciones recurrentes.",
    status: "todo",
    priority: "alta",
    dueDate: "2026-10-15",
    tags: ["Fintech", "Stripe"],
    subtasks: [
      { id: "s8", title: "Crear cuenta de prueba Stripe", completed: true },
      { id: "s9", title: "Manejar webhook checkout.session.completed", completed: false },
    ],
    createdAt: Date.now(),
  },
];

const COLUMNS: { id: Status; title: string; color: string; border: string }[] = [
  { id: "todo", title: "Por Hacer", color: "bg-amber-500/10 text-amber-400", border: "border-amber-500/30" },
  { id: "in_progress", title: "En Progreso", color: "bg-blue-500/10 text-blue-400", border: "border-blue-500/30" },
  { id: "in_review", title: "En Revisión", color: "bg-purple-500/10 text-purple-400", border: "border-purple-500/30" },
  { id: "done", title: "Completado", color: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/30" },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("todas");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<Status>("todo");
  const [formPriority, setFormPriority] = useState<Priority>("media");
  const [formDueDate, setFormDueDate] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formSubtaskInput, setFormSubtaskInput] = useState("");
  const [formSubtasks, setFormSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("taskflow_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("taskflow_tasks", JSON.stringify(newTasks));
  };

  // Drag and Drop Handlers
  const handleDragStart = (id: string) => {
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (colId: Status) => {
    if (!draggedTaskId) return;
    const updated = tasks.map((t) =>
      t.id === draggedTaskId ? { ...t, status: colId } : t
    );
    saveTasks(updated);
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        ),
      };
    });
    saveTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      description: formDesc.trim(),
      status: formStatus,
      priority: formPriority,
      dueDate: formDueDate || new Date().toISOString().split("T")[0],
      tags: formTags.length > 0 ? formTags : ["General"],
      subtasks: formSubtasks,
      createdAt: Date.now(),
    };

    saveTasks([newTask, ...tasks]);
    // Reset form
    setFormTitle("");
    setFormDesc("");
    setFormTags([]);
    setFormSubtasks([]);
    setFormDueDate("");
    setIsModalOpen(false);
  };

  const addTag = () => {
    if (formTag.trim() && !formTags.includes(formTag.trim())) {
      setFormTags([...formTags, formTag.trim()]);
      setFormTag("");
    }
  };

  const addSubtask = () => {
    if (formSubtaskInput.trim()) {
      setFormSubtasks([
        ...formSubtasks,
        { id: Date.now().toString(), title: formSubtaskInput.trim(), completed: false },
      ]);
      setFormSubtaskInput("");
    }
  };

  // Filtrado
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority =
      priorityFilter === "todas" ? true : t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Métricas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityBadge = (p: Priority) => {
    switch (p) {
      case "urgente":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">Urgente</span>;
      case "alta":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">Alta</span>;
      case "media":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Media</span>;
      case "baja":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Baja</span>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* 1. HEADER & MÉTRICAS DEL PROYECTO */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                Sprint Kanban Board
              </span>
            </div>
          </div>

          {/* Barra de Progreso Global */}
          <div className="hidden md:flex items-center gap-4 bg-slate-950 border border-slate-800/80 px-4 py-2 rounded-xl">
            <div className="text-xs">
              <span className="text-slate-400">Progreso del Sprint: </span>
              <span className="font-bold text-white">{completedTasks}/{totalTasks} completadas</span>
            </div>
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-400">{progressPercent}%</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </header>

      {/* 2. BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 w-full flex flex-wrap items-center justify-between gap-4">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título, descripción o etiqueta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filtro por Prioridad */}
        <div className="flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">Prioridad:</span>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            {["todas", "urgente", "alta", "media", "baja"].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${priorityFilter === p
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. COLUMNAS KANBAN (DRAG AND DROP) */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[900px] lg:min-w-0 h-full">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isTarget = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(col.id)}
                className={`flex flex-col bg-slate-900/40 border rounded-2xl p-4 transition-all ${isTarget
                    ? "border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/20"
                    : "border-slate-800/80"
                  }`}
              >
                {/* Cabecera de Columna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Lista de Tarjetas */}
                <div className="flex-1 space-y-3 overflow-y-auto min-h-[300px]">
                  {colTasks.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800/60 rounded-xl p-4 text-slate-500 text-xs">
                      <span>Arrastra una tarea aquí</span>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const completedCount = task.subtasks.filter((s) => s.completed).length;
                      const totalSub = task.subtasks.length;
                      const subtaskPercent = totalSub > 0 ? (completedCount / totalSub) * 100 : 0;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          className={`bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${draggedTaskId === task.id ? "opacity-40 scale-95" : ""
                            }`}
                        >
                          {/* Fila Superior: Prioridad y Delete */}
                          <div className="flex items-center justify-between mb-2">
                            {priorityBadge(task.priority)}
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1"
                              title="Eliminar tarea"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Título y Descripción */}
                          <h4 className="font-semibold text-sm text-white mb-1 leading-snug">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Subtareas */}
                          {totalSub > 0 && (
                            <div className="mb-3 space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40">
                              <div className="flex justify-between items-center text-[11px] text-slate-400">
                                <span className="flex items-center gap-1 font-medium">
                                  <CheckSquare className="w-3 h-3 text-indigo-400" />
                                  Subtareas ({completedCount}/{totalSub})
                                </span>
                                <span>{Math.round(subtaskPercent)}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full rounded-full transition-all"
                                  style={{ width: `${subtaskPercent}%` }}
                                />
                              </div>
                              <div className="pt-1 space-y-1">
                                {task.subtasks.map((st) => (
                                  <div
                                    key={st.id}
                                    onClick={() => toggleSubtask(task.id, st.id)}
                                    className="flex items-center gap-2 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none"
                                  >
                                    {st.completed ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                    ) : (
                                      <Square className="w-3 h-3 text-slate-500 shrink-0" />
                                    )}
                                    <span className={st.completed ? "line-through text-slate-500" : ""}>
                                      {st.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tags & Fecha */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-[11px] text-slate-400">
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map((tg, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                                >
                                  #{tg}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                              <Calendar className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. MODAL: CREAR NUEVA TAREA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-4">Nueva Tarea</h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Implementar pasarela Stripe"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre lo que se debe hacer..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Columna Inicial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Status)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="todo">Por Hacer</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="in_review">En Revisión</option>
                    <option value="done">Completado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prioridad</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Etiquetas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ej: Backend, Bug, UI..."
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formTags.map((tg, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-[10px] flex items-center gap-1"
                    >
                      #{tg}
                      <button
                        type="button"
                        onClick={() => setFormTags(formTags.filter((_, idx) => idx !== i))}
                        className="hover:text-red-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Subtareas */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Lista de Subtareas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Paso a realizar..."
                    value={formSubtaskInput}
                    onChange={(e) => setFormSubtaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
                  >
                    + Subtarea
                  </button>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {formSubtasks.map((st, i) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800"
                    >
                      <span className="text-slate-300">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => setFormSubtasks(formSubtasks.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-red-400"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/25"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}