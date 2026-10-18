
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Surah from "./pages/Surah";
import Favorites from "./pages/Favorites";
import Contact from "./pages/Contact";
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

  // Save favorites
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Listen for PWA installation events
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Install app
  const installApp = async () => {
    if (!installPrompt) {
      alert(
        lang === "ar"
          ? "افتح قائمة Chrome ⋮ واختر تثبيت التطبيق (Install app)."
          : "Open Chrome's ⋮ menu and choose Install app."
      );
      return;
    }

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;

      if (result.outcome === "accepted") {
        setInstallPrompt(null);
      }
    } catch (error) {
      console.error("Installation error:", error);
    }
  };

  // Play a selected Surah
  const playSurah = (surah: SurahItem) => {
    setCurrentSurah(surah);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
  };

  // Load and play the selected Surah
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSurah || !audio) return;

    audio.volume = volume;
    audio.load();

    const startPlayback = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
        setIsPlaying(false);
      }
    };

    void startPlayback();
  }, [currentSurah]);

  // Synchronize volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play / pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentSurah) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const getCurrentIndex = () => {
    if (!currentSurah) return -1;

    return surahs.findIndex(
      (surah) => Number(surah.id) === Number(currentSurah.id)
    );
  };

  // Next Surah
  const handleNextSurah = () => {
    if (!currentSurah || surahs.length === 0) return;

    const nextSurah = surahs.find(
      (surah) => Number(surah.id) === Number(currentSurah.id) + 1
    );

    if (nextSurah) {
      playSurah(nextSurah);
    } else {
      setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setCurrentTime(0);
    }
  };

  // Previous Surah
  const handlePreviousSurah = () => {
    if (!currentSurah || surahs.length === 0) return;

    const previousSurah = surahs.find(
      (surah) => Number(surah.id) === Number(currentSurah.id) - 1
    );

    if (previousSurah) {
      playSurah(previousSurah);
    }
  };

  // Automatically play the next Surah when the current one ends
  const handleAudioEnded = () => {
    const currentIndex = getCurrentIndex();

    if (currentIndex >= 0 && currentIndex < surahs.length - 1) {
      playSurah(surahs[currentIndex + 1]);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (audio && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);

    if (Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(event.target.value);
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(newTime)) return;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setVolume(Number(event.target.value));
  };

  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          minHeight: "100vh",
          backgroundColor: dark ? "#0f172a" : "#ffffff",
          color: dark ? "#ffffff" : "#111827",
          transition: "background-color 0.3s, color 0.3s",
        }}
      >
        <BrowserRouter>
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              background: dark ? "#1e293b" : "#f1f5f9",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0 }}>
              📖 {lang === "ar" ? "القرآن" : "Quran"}
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flexWrap: "wrap",
              }}
            >
              <Link to="/" style={styles.link}>
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>

              <Link to="/favorites" style={styles.link}>
                {lang === "ar" ? "المفضلة" : "Favorites"}
              </Link>

              <Link to="/about" style={styles.link}>
                {lang === "ar" ? "حول" : "About"}
              </Link>

              <Link to="/contact" style={styles.link}>
                {lang === "ar" ? "تواصل معنا" : "Contact Us"}
              </Link>

              <button onClick={installApp} style={styles.installButton}>
                📲 {lang === "ar" ? "تثبيت التطبيق" : "Install App"}
              </button>

              <button
                style={styles.button}
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
              >
                {lang === "en" ? "AR" : "EN"}
              </button>

              <button
                style={styles.button}
                onClick={() => setDark((value) => !value)}
                aria-label="Toggle dark mode"
              >
                {dark ? "🌞" : "🌙"}
              </button>
            </div>
          </nav>

          <div
            style={{
              width: "100%",
              padding: "20px",
              paddingBottom: currentSurah ? "190px" : "100px",
              boxSizing: "border-box",
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    playSurah={playSurah}
                    lang={lang}
                    dark={dark}
                    favorites={favorites}
                    setFavorites={setFavorites}
                  />
                }
              />

              <Route
                path="/favorites"
                element={
                  <Favorites
                    favorites={favorites}
                    setFavorites={setFavorites}
                    playSurah={playSurah}
                    dark={dark}
                    lang={lang}
                  />
                }
              />

              <Route
                path="/about"
                element={<About lang={lang} dark={dark} />}
              />

              <Route
                path="/contact"
                element={<Contact lang={lang} dark={dark} />}
              />

              <Route
                path="/surah/:id"
                element={
                  <Surah
                    playSurah={playSurah}
                    lang={lang}
                    dark={dark}
                  />
                }
              />
            </Routes>
          </div>

          {currentSurah && (
            <div
              style={{
                ...styles.player,
                background: dark ? "#1e293b" : "#ffffff",
                color: dark ? "#ffffff" : "#111827",
                borderTop: dark
                  ? "1px solid #334155"
                  : "1px solid #e2e8f0",
              }}
            >
              <audio
                ref={audioRef}
                src={currentSurah.audio_url}
                onPlay={handleAudioPlay}
                onPause={handleAudioPause}
                onEnded={handleAudioEnded}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                preload="metadata"
              />

              <div style={styles.playerInfo}>
                <div style={styles.reciter}>
                  🎙️ Sheikh Al-Zain Muhammad Ahmed
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    direction: "rtl",
                  }}
                >
                  {currentSurah.name}
                </div>

                <div style={{ fontSize: "13px", opacity: 0.7 }}>
                  {currentSurah.id}.{" "}
                  {currentSurah.english_name || currentSurah.name}
                  {currentSurah.ayah_count
                    ? ` • ${currentSurah.ayah_count} Ayahs`
                    : ""}
                </div>
              </div>

              <div style={styles.controls}>
                <button
                  style={{
                    ...styles.controlButton,
                    opacity: Number(currentSurah.id) === 1 ? 0.4 : 1,
                  }}
                  disabled={Number(currentSurah.id) === 1}
                  onClick={handlePreviousSurah}
                  title="Previous Surah"
                  aria-label="Previous Surah"
                >
                  ⏮️
                </button>

                <button
                  style={styles.playButton}
                  onClick={togglePlay}
                  title={isPlaying ? "Pause" : "Play"}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "⏸️" : "▶️"}
                </button>

                <button
                  style={{
                    ...styles.controlButton,
                    opacity: Number(currentSurah.id) === 114 ? 0.4 : 1,
                  }}
                  disabled={Number(currentSurah.id) === 114}
                  onClick={handleNextSurah}
                  title="Next Surah"
                  aria-label="Next Surah"
                >
                  ⏭️
                </button>
              </div>

              <div style={styles.volumeContainer}>
                <span style={{ fontSize: "18px" }}>
                  {volume === 0 ? "🔇" : "🔊"}
                </span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={styles.volume}
                  aria-label="Volume"
                />
              </div>

              <div style={styles.progressContainer}>
                <div style={styles.progressLabels}>
                  <span>{formatTime(currentTime)}</span>
                  <span style={styles.nowPlaying}>
                    {lang === "ar" ? "وقت السورة" : "Surah progress"}
                  </span>
                  <span>{formatTime(duration)}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={handleSeek}
                  disabled={!duration}
                  style={{
                    ...styles.progressSlider,
                    background: `linear-gradient(to right, #22c55e ${progress}%, #475569 ${progress}%)`,
                  }}
                  aria-label="Seek audio"
                />
              </div>
            </div>
          )}
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;

const styles = {
  link: {
    margin: "0 5px",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 500,
    padding: "6px 8px",
  },

  button: {
    marginLeft: "5px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
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
