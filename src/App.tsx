import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Surah from "./pages/Surah";
import Favorites from "./pages/Favorites";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function App() {
  // Current Surah
  const [currentSurah, setCurrentSurah] = useState<any>(null);

  // All Surahs
 const [surahs] = useState<any[]>([]);

  // Favorites
  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const savedFavorites = localStorage.getItem("favorites");
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch {
      return [];
    }
  });

  // Dark mode
  const [dark, setDark] = useState(true);

  // Language
  const [lang, setLang] = useState("en");

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  // PWA installation
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save favorites
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Listen for the browser installation prompt
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
          ? "لتثبيت التطبيق، افتح قائمة المتصفح واختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية."
          : "To install the app, open your browser menu and choose Install app or Add to Home screen."
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

  // Play a Surah
  const playSurah = (surah: any) => {
    setCurrentSurah(surah);
    setIsPlaying(true);
  };

  // Load and play when the selected Surah changes
  useEffect(() => {
    const audio = audioRef.current;

    if (!currentSurah || !audio) return;

    audio.load();
    audio.volume = volume;

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
    }
  };

  // Next Surah
  const handleNextSurah = () => {
    if (!currentSurah || surahs.length === 0) return;

    const currentIndex = surahs.findIndex(
      (surah) => surah.id === currentSurah.id
    );

    if (currentIndex < 0) return;

    const nextSurah = surahs[currentIndex + 1];

    if (nextSurah) {
      setCurrentSurah(nextSurah);
    } else {
      setIsPlaying(false);
    }
  };

  // Previous Surah
  const handlePreviousSurah = () => {
    if (!currentSurah || surahs.length === 0) return;

    const currentIndex = surahs.findIndex(
      (surah) => surah.id === currentSurah.id
    );

    if (currentIndex <= 0) return;

    setCurrentSurah(surahs[currentIndex - 1]);
  };

  // Volume
  const handleVolumeChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Audio events
  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    handleNextSurah();
  };

  return (
    <div
      style={{
        backgroundColor: dark ? "#0f172a" : "#ffffff",
        minHeight: "100vh",
        color: dark ? "#ffffff" : "#111827",
        transition: "0.3s",
      }}
    >
      <BrowserRouter>
        {/* Navigation */}
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

            {/* Always-visible install button */}
            <button onClick={installApp} style={styles.installButton}>
              📲 {lang === "ar" ? "تثبيت التطبيق" : "Install App"}
            </button>

            {/* Language */}
            <button
              style={styles.button}
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
            >
              {lang === "en" ? "AR" : "EN"}
            </button>

            {/* Dark mode */}
            <button
              style={styles.button}
              onClick={() => setDark(!dark)}
              aria-label="Toggle dark mode"
            >
              {dark ? "🌞" : "🌙"}
            </button>
          </div>
        </nav>

        {/* Pages */}
        <div
          style={{
            padding: "20px",
            paddingBottom: currentSurah ? "150px" : "100px",
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

        {/* Global audio player */}
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
              preload="metadata"
            />

            {/* Surah information */}
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

            {/* Player controls */}
            <div style={styles.controls}>
              <button
                style={{
                  ...styles.controlButton,
                  opacity: currentSurah.id === 1 ? 0.4 : 1,
                }}
                disabled={currentSurah.id === 1}
                onClick={handlePreviousSurah}
                title="Previous Surah"
              >
                ⏮️
              </button>

              <button
                style={styles.playButton}
                onClick={togglePlay}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>

              <button
                style={{
                  ...styles.controlButton,
                  opacity: currentSurah.id === 114 ? 0.4 : 1,
                }}
                disabled={currentSurah.id === 114}
                onClick={handleNextSurah}
                title="Next Surah"
              >
                ⏭️
              </button>
            </div>

            {/* Volume */}
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
          </div>
        )}
      </BrowserRouter>
    </div>
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
    minHeight: "82px",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    boxSizing: "border-box" as const,
    boxShadow: "0 -5px 20px rgba(0,0,0,0.2)",
    flexWrap: "wrap" as const,
  },

  playerInfo: {
    flex: 1,
    minWidth: "220px",
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
    minWidth: "140px",
  },

  volume: {
    width: "100px",
    cursor: "pointer",
  },
};
