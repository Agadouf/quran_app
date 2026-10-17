
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
                background: "#22c55e",
    color: "white",
    cursor: "pointer",
  },

  installButton: {
    marginLeft: "5px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#059669",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 3px 10px rgba(5,150,105,0.3)",
  },

  player: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    boxSizing: "border-box" as const,
    boxShadow: "0 -5px 20px rgba(0,0,0,0.2)",
    flexWrap: "wrap" as const,
  },

  playerInfo: {
    flex: "1 1 180px",
    minWidth: "160px",
  },

  reciter: {
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "3px",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  controlButton: {
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "50%",
    background: "#475569",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "17px",
  },

  playButton: {
    width: "52px",
    height: "52px",
    border: "none",
    borderRadius: "50%",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "20px",
  },

  volumeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "120px",
  },

  volume: {
    width: "90px",
    cursor: "pointer",
  },

  progressContainer: {
    flex: "1 1 100%",
    width: "100%",
    minWidth: 0,
    marginTop: "2px",
  },

  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontVariantNumeric: "tabular-nums" as const,
    marginBottom: "5px",
  },

  nowPlaying: {
    opacity: 0.75,
    textAlign: "center" as const,
  },

  progressSlider: {
    display: "block",
    width: "100%",
    height: "6px",
    borderRadius: "999px",
    appearance: "none" as const,
    cursor: "pointer",
    accentColor: "#22c55e",
  },
};
