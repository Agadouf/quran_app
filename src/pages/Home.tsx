import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { motion } from "framer-motion";

export default function Home({
  playSurah,
  lang,
  dark,
  setSurahs,
  favorites,
  setFavorites,
}: any) {
  const [localSurahs, setLocalSurahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getSurahs();
  }, []);

  async function getSurahs() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("surahs")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(error);
        setErrorMessage(error.message);
        setSurahs([]);
        setLocalSurahs([]);
        return;
      }

      setSurahs(data || []);
      setLocalSurahs(data || []);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Failed to load Surahs."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredSurahs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return localSurahs;

    return localSurahs.filter((surah) => {
      return (
        String(surah.id).includes(query) ||
        surah.name?.toLowerCase().includes(query) ||
        surah.english_name
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [localSurahs, search]);

  const toggleFavorite = (surah: any) => {
    const exists = favorites.some(
      (s: any) => s.id === surah.id
    );

    const updated = exists
      ? favorites.filter(
          (s: any) => s.id !== surah.id
        )
      : [...favorites, surah];

    setFavorites(updated);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title(dark)}>
          {lang === "ar" ? "سور القرآن الكريم" : "Quran Surahs"}
        </h1>

        <p style={styles.subtitle(dark)}>
          {lang === "ar"
            ? "استمع إلى القرآن الكريم بصوت الشيخ الزين محمد أحمد"
            : "Listen to the Holy Quran recited by Sheikh Al-Zain Muhammad Ahmed"}
        </p>
      </div>

      {/* Search */}
      <div style={styles.searchWrapper}>
        <span style={styles.searchIcon}>🔎</span>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            lang === "ar"
              ? "ابحث عن سورة..."
              : "Search Surah by name or number..."
          }
          style={styles.searchInput(dark)}
          dir={lang === "ar" ? "rtl" : "ltr"}
        />
      </div>

      {/* Counter */}
      {!loading && (
        <div style={styles.counter(dark)}>
          {filteredSurahs.length} / 114{" "}
          {lang === "ar" ? "سورة" : "Surahs"}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.message(dark)}>
          ⏳ {lang === "ar"
            ? "جاري تحميل السور..."
            : "Loading Surahs..."}
        </div>
      )}

      {/* Error */}
      {!loading && errorMessage && (
        <div style={styles.error}>
          <h3>⚠️ Unable to load Surahs</h3>

          <p>{errorMessage}</p>

          <button
            onClick={getSurahs}
            style={styles.retryButton}
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Empty search */}
      {!loading &&
        !errorMessage &&
        filteredSurahs.length === 0 && (
          <div style={styles.message(dark)}>
            🔎{" "}
            {lang === "ar"
              ? "لم يتم العثور على سورة."
              : "No Surah found."}
          </div>
        )}

      {/* Surah Grid */}
      {!loading && filteredSurahs.length > 0 && (
        <div style={styles.grid}>
          {filteredSurahs.map((surah, index) => {
            const isFavorite = favorites.some(
              (s: any) => s.id === surah.id
            );

            return (
              <motion.div
                key={surah.id}
                style={styles.card(dark)}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(index * 0.02, 0.4),
                }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 15px 30px rgba(0,0,0,0.25)",
                }}
              >
                {/* Number */}
                <div style={styles.number}>
                  {surah.id}
                </div>

                {/* Arabic */}
                <h2 style={styles.arabicName}>
                  {surah.name}
                </h2>

                {/* English */}
                <div style={styles.englishName}>
                  {surah.english_name}
                </div>

                {/* Ayahs */}
                <div style={styles.info(dark)}>
                  📖 {surah.ayah_count || "—"}{" "}
                  {lang === "ar" ? "آية" : "Ayahs"}
                </div>

                {/* Reciter */}
                <div style={styles.reciter}>
                  🎙️ Al-Zain Muhammad Ahmed
                </div>

                {/* Buttons */}
                <div style={styles.buttons}>
                  <button
                    onClick={() => playSurah(surah)}
                    style={styles.playButton}
                    title="Play Surah"
                  >
                    ▶️
                  </button>

                  <button
                    onClick={() =>
                      toggleFavorite(surah)
                    }
                    style={{
                      ...styles.favoriteButton,
                      background: isFavorite
                        ? "#ef4444"
                        : "#475569",
                    }}
                    title="Favorite"
                  >
                    {isFavorite ? "❤️" : "🤍"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

const styles: any = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
  },

  header: {
    textAlign: "center",
    marginBottom: "25px",
  },

  title: (dark: boolean) => ({
    color: dark ? "#ffffff" : "#111827",
    fontSize: "clamp(28px, 5vw, 42px)",
    marginBottom: "8px",
    fontWeight: 800,
  }),

  subtitle: (dark: boolean) => ({
    color: dark ? "#94a3b8" : "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  }),

  searchWrapper: {
    maxWidth: "650px",
    margin: "0 auto 20px",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
  },

  searchInput: (dark: boolean) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 18px 14px 45px",
    borderRadius: "14px",
    border: dark
      ? "1px solid #334155"
      : "1px solid #cbd5e1",
    background: dark ? "#1e293b" : "#ffffff",
    color: dark ? "#ffffff" : "#111827",
    fontSize: "16px",
    outline: "none",
  }),

  counter: (dark: boolean) => ({
    textAlign: "center",
    color: dark ? "#94a3b8" : "#64748b",
    marginBottom: "20px",
    fontSize: "14px",
  }),

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "18px",
  },

  card: (dark: boolean) => ({
    position: "relative",
    background: dark ? "#1e293b" : "#ffffff",
    color: dark ? "#ffffff" : "#111827",
    border: dark
      ? "1px solid #334155"
      : "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "22px",
    textAlign: "center",
    transition: "0.25s",
    overflow: "hidden",
  }),

  number: {
    width: "38px",
    height: "38px",
    margin: "0 auto 12px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#22c55e",
    color: "#ffffff",
    fontWeight: 800,
  },

  arabicName: {
    fontSize: "27px",
    margin: "5px 0",
    direction: "rtl",
    fontFamily: "serif",
  },

  englishName: {
    fontSize: "15px",
    fontWeight: 600,
    opacity: 0.75,
    marginBottom: "12px",
  },

  info: (dark: boolean) => ({
    color: dark ? "#cbd5e1" : "#475569",
    fontSize: "14px",
    marginBottom: "8px",
  }),

  reciter: {
    color: "#22c55e",
    fontSize: "12px",
    marginBottom: "18px",
    fontWeight: 600,
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },

  playButton: {
    border: "none",
    borderRadius: "10px",
    padding: "11px 18px",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "17px",
  },

  favoriteButton: {
    border: "none",
    borderRadius: "10px",
    padding: "11px 15px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "17px",
  },

  message: (dark: boolean) => ({
    textAlign: "center",
    padding: "50px 20px",
    color: dark ? "#cbd5e1" : "#475569",
  }),

  error: {
    maxWidth: "600px",
    margin: "30px auto",
    padding: "25px",
    textAlign: "center",
    borderRadius: "15px",
    background: "#7f1d1d",
    color: "#ffffff",
  },

  retryButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
  },
};
