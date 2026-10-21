"use client";

import { useState, useEffect } from "react";
import { DICT } from "./i18n";

export type Lang = "es" | "en";

export function useLanguage() {
    const [lang, setLangState] = useState<Lang>("es");

    useEffect(() => {
        const saved = (localStorage.getItem("nexus_lang") as Lang) || "es";
        setLangState(saved);

        const handleSync = () => {
            const current = (localStorage.getItem("nexus_lang") as Lang) || "es";
            setLangState(current);
        };

        window.addEventListener("nexus_lang_changed", handleSync);
        window.addEventListener("storage", handleSync);

        return () => {
            window.removeEventListener("nexus_lang_changed", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, []);

    const setLang = (newLang: Lang) => {
        localStorage.setItem("nexus_lang", newLang);
        setLangState(newLang);
        // Notificar a todos los componentes de la aplicación al mismo tiempo
        window.dispatchEvent(new Event("nexus_lang_changed"));
    };

    return { lang, setLang, t: DICT[lang] };
}