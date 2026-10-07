import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Surah from "./pages/Surah";
import Favorites from "./pages/Favorites";

function App() {
  const [currentSurah, setCurrentSurah] =
    useState<any>(null);

  const [surahs, setSurahs] =
    useState<any[]>([]);

  const [favorites, setFavorites] =
    useState<any[]>(() => {
      const saved =
        localStorage.getItem("favorites");

      return saved ? JSON.parse(saved) : [];
    });

  const [dark, setDark] = useState(true);

  const [lang, setLang] = useState("en");

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [volume, setVolume] = useState(1);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  // -----------------------------
  // PLAY SURAH
  // -----------------------------

  const playSurah = (surah: any) => {
    setCurrentSurah(surah);
    setIsPlaying(true);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume;

        audioRef.current
          .play()
          .catch((error) => {
            console.error(
              "Audio playback failed:",
              error
            );
          });
      }
    }, 150);
  };

  // -----------------------------
  // PLAY / PAUSE
  // -----------------------------

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // -----------------------------
  // NEXT
  // -----------------------------

  const handleNextSurah = () => {
    if (!currentSurah || !surahs.length)
      return;

    const currentIndex =
      surahs.findIndex(
        (s) => s.id === currentSurah.id
      );

    if (
      currentIndex >= 0 &&
      currentIndex < surahs.length - 1
    ) {
      const next =
        surahs[currentIndex + 1];

      playSurah(next);
    } else {
      setIsPlaying(false);
    }
  };

  // -----------------------------
  // PREVIOUS
  // -----------------------------

  const handlePreviousSurah = () => {
    if (!currentSurah || !surahs.length)
      return;

    const currentIndex =
      surahs.findIndex(
        (s) => s.id === currentSurah.id
      );

    if (currentIndex > 0) {
      const previous =
        surahs[currentIndex - 1];

      playSurah(previous);
    }
  };

  // -----------------------------
  // VOLUME
  // -----------------------------

  const handleVolume = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume =
      Number(e.target.value);

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume =
        newVolume;
    }
  };

  // -----------------------------
  // AUDIO EVENTS
  // -----------------------------

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div
      style={{
        backgroundColor: dark
          ? "#0f172a"
          : "#ffffff",

        minHeight: "100vh",

        color: dark
          ? "#ffffff"
          : "#111827",

        transition: "0.3s",
      }}
    >
      <BrowserRouter>

        {/* =========================
            NAVBAR
        ========================= */}

        <nav
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            padding: "12px 20px",
            background: dark
              ? "#1e293b"
              : "#f1f5f9",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0 }}>
            📖{" "}
            {lang === "ar"
              ? "القرآن الكريم"
              : "Quran"}
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/"
              style={styles.link}
            >
              {lang === "ar"
                ? "الرئيسية"
                : "Home"}
            </Link>

            <Link
              to="/favorites"
              style={styles.link}
            >
              {lang === "ar"
                ? "المفضلة"
                : "Favorites"}
            </Link>

            <Link
              to="/about"
              style={styles.link}
            >
              {lang === "ar"
                ? "حول"
                : "About"}
            </Link>

            <button
              style={styles.navButton}
              onClick={() =>
                setLang(
                  lang === "en"
                    ? "ar"
                    : "en"
                )
              }
            >
              {lang === "en"
                ? "AR"
                : "EN"}
            </button>

            <button
              style={styles.navButton}
              onClick={() =>
                setDark(!dark)
              }
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </nav>

        {/* =========================
            CONTENT
        ========================= */}

        <div
          style={{
            padding: "20px",
            paddingBottom:
              currentSurah
                ? "150px"
                : "40px",
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
                  setSurahs={setSurahs}
                  favorites={favorites}
                  setFavorites={
                    setFavorites
                  }
                />
              }
            />

            <Route
              path="/favorites"
              element={
                <Favorites
                  favorites={favorites}
                  setFavorites={
                    setFavorites
                  }
                  playSurah={playSurah}
                  dark={dark}
                  lang={lang}
                />
              }
            />

            <Route
              path="/about"
              element={
                <About
                  lang={lang}
                  dark={dark}
                />
              }
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

        {/* =========================
            CUSTOM AUDIO PLAYER
        ========================= */}

        {currentSurah && (
          <div
            style={{
              ...styles.player,
              background: dark
                ? "#172033"
                : "#ffffff",
              borderTop: dark
                ? "1px solid #334155"
                : "1px solid #e2e8f0",
            }}
          >

            {/* Hidden audio element */}

            <audio
              ref={audioRef}
              src={currentSurah.audio_url}
              onPlay={() =>
                setIsPlaying(true)
              }
              onPause={() =>
                setIsPlaying(false)
              }
              onEnded={
                handleNextSurah
              }
              preload="metadata"
            />

            {/* Current Surah */}

            <div style={styles.currentInfo}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#22c55e",
                  fontWeight: 700,
                }}
              >
                🎙️ AL-ZAIN MUHAMMAD AHMED
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  direction: "rtl",
                }}
              >
                {currentSurah.name}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.7,
                }}
              >
                {currentSurah.id}.{" "}
                {currentSurah.english_name}
                {" • "}
                {currentSurah.ayah_count ||
                  "—"}{" "}
                Ayahs
              </div>
            </div>

            {/* Controls */}

            <div style={styles.controls}>

              {/* Previous */}

              <button
                style={styles.controlButton}
                onClick={
                  handlePreviousSurah
                }
                disabled={
                  currentSurah.id === 1
                }
                title="Previous Surah"
              >
                ⏮️
              </button>

              {/* Play / Pause */}

              <button
                style={
                  styles.mainControl
                }
                onClick={togglePlay}
                title={
                  isPlaying
                    ? "Pause"
                    : "Play"
                }
              >
                {isPlaying
                  ? "⏸️"
                  : "▶️"}
              </button>

              {/* Next */}

              <button
                style={styles.controlButton}
                onClick={
                  handleNextSurah
                }
                disabled={
                  currentSurah.id === 114
                }
                title="Next Surah"
              >
                ⏭️
              </button>

            </div>

            {/* Volume */}

            <div style={styles.volume}>
              <span>
                {volume === 0
                  ? "🔇"
                  : "🔊"}
              </span>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={
                  handleVolume
                }
              />
            </div>

          </div>
        )}

      </BrowserRouter>
    </div>
  );
}

export default App;

const styles: any = {
  link: {
    margin: "0 5px",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 600,
    padding: "7px 10px",
  },

  navButton: {
    padding: "7px 10px",
    borderRadius: "8px",
    border: "none",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  player: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    minHeight: "80px",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    boxSizing: "border-box",
    boxShadow:
      "0 -8px 30px rgba(0,0,0,0.18)",
    flexWrap: "wrap",
  },

  currentInfo: {
    minWidth: "200px",
    flex: 1,
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
    background: "#334155",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "17px",
  },

  mainControl: {
    width: "52px",
    height: "52px",
    border: "none",
    borderRadius: "50%",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "20px",
  },

  volume: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "130px",
  },
};
