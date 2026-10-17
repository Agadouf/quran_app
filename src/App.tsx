
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Surah from "./pages/Surah";
import Favorites from "./pages/Favorites";
import SplashScreen from "./components/SplashScreen";
import { supabase } from "./supabase";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type SurahItem = {
  id: number;
  name: string;
  english_name?: string;
  audio_url: string;
  ayah_count?: number;
  [key: string]: any;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [currentSurah, setCurrentSurah] = useState<SurahItem | null>(null);
  const [surahs, setSurahs] = useState<SurahItem[]>([]);

  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize page background with the selected theme
  useEffect(() => {
    const background = dark ? "#0f172a" : "#ffffff";

    document.documentElement.classList.toggle("dark-theme", dark);
    document.documentElement.style.backgroundColor = background;
    document.body.style.backgroundColor = background;
  }, [dark]);

  // Load all Surahs
  useEffect(() => {
    let cancelled = false;

    async function loadSurahs() {
      try {
        const { data, error } = await supabase
          .from("surahs")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        if (data && !cancelled) {
          setSurahs(data as SurahItem[]);

          localStorage.setItem(
            "quran-surahs-cache",
            JSON.stringify(data)
          );
        }
          } catch (error) {
        console.error("Failed to load Surahs:", error);

        try {
          const cached = localStorage.getItem("quran-surahs-cache");

          if (cached && !cancelled) {
            setSurahs(JSON.parse(cached) as SurahItem[]);
          }
        } catch (cacheError) {
          console.error("Failed to load cached Surahs:", cacheError);
        }
      }
    }

    void loadSurahs();

    return () => {
      cancelled = true;
    };
  }, []);
