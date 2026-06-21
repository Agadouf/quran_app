import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useRef } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Surah from "./pages/Surah";
import Favorites from "./pages/Favorites";

function App() {

  // 🎧 current surah
  const [currentSurah, setCurrentSurah] =
    useState<any>(null);

  // 📚 all surahs
  const [surahs, setSurahs] =
    useState<any[]>([]);

  // ❤️ favorites
  const [favorites, setFavorites] =
    useState<any[]>(() => {

      const savedFavorites =
        localStorage.getItem("favorites");

      return savedFavorites
        ? JSON.parse(savedFavorites)
        : [];
    });

  // 🌙 dark mode
  const [dark, setDark] =
    useState(true);

  // 🌍 language
  const [lang, setLang] =
    useState("en");

  // 🔊 audio ref
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  // ▶️ play surah
  const playSurah = (surah: any) => {

    setCurrentSurah(surah);

    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  // ⏭️ auto next surah
  const handleNextSurah = () => {

    if (!currentSurah) return;

    const currentIndex =
      surahs.findIndex(
        (s) => s.id === currentSurah.id
      );

    const nextSurah =
      surahs[currentIndex + 1];

    if (nextSurah) {

      setCurrentSurah(nextSurah);

      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    }
  };

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

        {/* Navbar */}
        <nav
          style={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            padding: "12px 20px",

            background: dark
              ? "#1e293b"
              : "#f1f5f9",
          }}
        >

          {/* Logo */}
          <h2>
            📖 {
              lang === "ar"
                ? "القرآن"
                : "Quran"
            }
          </h2>

          {/* Links */}
          <div>

            {/* Home */}
            <Link
              to="/"

              style={styles.link}
            >
              {
                lang === "ar"
                  ? "الرئيسية"
                  : "Home"
              }
            </Link>

            {/* Favorites */}
            <Link
              to="/favorites"

              style={styles.link}
            >
              {
                lang === "ar"
                  ? "المفضلة"
                  : "Favorites"
              }
            </Link>

            {/* About */}
            <Link
              to="/about"

              style={styles.link}
            >
              {
                lang === "ar"
                  ? "حول"
                  : "About"
              }
            </Link>

            {/* Language */}
            <button
              style={styles.button}

              onClick={() =>
                setLang(
                  lang === "en"
                    ? "ar"
                    : "en"
                )
              }
            >
              {
                lang === "en"
                  ? "AR"
                  : "EN"
              }
            </button>

            {/* Dark Mode */}
            <button
              style={styles.button}

              onClick={() =>
                setDark(!dark)
              }
            >
              {
                dark
                  ? "🌞"
                  : "🌙"
              }
            </button>

          </div>
        </nav>

        {/* Pages */}
        <div
          style={{
            padding: "20px",
            paddingBottom: "100px",
          }}
        >

          <Routes>

            {/* Home */}
            <Route
              path="/"

              element={
                <Home
                  playSurah={playSurah}
                  lang={lang}
                  dark={dark}
                  setSurahs={setSurahs}
                  favorites={favorites}
                  setFavorites={setFavorites}
                />
              }
            />

            {/* Favorites */}
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

            {/* About */}
            <Route
              path="/about"

              element={
                <About
                  lang={lang}
                  dark={dark}
                />
              }
            />

            {/* Surah */}
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

        {/* 🎧 Global Player */}
        {currentSurah && (

          <div
            style={{
              position: "fixed",

              bottom: 0,

              left: 0,

              right: 0,

              background: dark
                ? "#1e293b"
                : "#f1f5f9",

              padding: "10px 20px",

              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

              borderTop: dark
                ? "1px solid #334155"
                : "1px solid #e2e8f0",
            }}
          >

            <span>
              🎧 {
                lang === "ar"
                  ? currentSurah.name
                  : currentSurah.english_name ||
                    currentSurah.name
              }
            </span>

            <audio
              ref={audioRef}

              controls

              src={currentSurah.audio_url}

              onEnded={handleNextSurah}
            />

          </div>
        )}

      </BrowserRouter>
    </div>
  );
}

export default App;

//////////////////////////////////////////////////////

const styles = {

  link: {

    margin: "0 10px",

    textDecoration: "none",

    color: "inherit",

    fontWeight: 500,
  },

  button: {

    marginLeft: "8px",

    padding: "6px 10px",

    borderRadius: "6px",

    border: "none",

    background: "#22c55e",

    color: "white",

    cursor: "pointer",
  },
};