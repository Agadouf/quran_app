import { useEffect, useMemo, useState } from "react";
// @ts-ignore
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

  const [errorMessage, setErrorMessage] =
    useState("");

  // 🔎 Search
  const [search, setSearch] = useState("");

  // ==========================================
  // GET ALL SURAHS
  // ==========================================

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
        .order("id", {
          ascending: true,
        });

      console.log(
        "Supabase Surahs:",
        data
      );

      console.log(
        "Supabase Error:",
        error
      );

      if (error) {
        console.error(
          "Failed to load Surahs:",
          error
        );

        setErrorMessage(
          error.message ||
            "Failed to load Surahs."
        );

        setSurahs([]);
        setLocalSurahs([]);

        return;
      }

      if (!data || data.length === 0) {
        setErrorMessage(
          lang === "ar"
            ? "لم يتم العثور على السور."
            : "No Surahs were found."
        );

        setSurahs([]);
        setLocalSurahs([]);

        return;
      }

      setSurahs(data);
      setLocalSurahs(data);
    } catch (error: any) {
      console.error(error);

      setErrorMessage(
        error?.message ||
          "Unexpected error loading Surahs."
      );

      setSurahs([]);
      setLocalSurahs([]);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FAVORITES
  // ==========================================

  const toggleFavorite = (surah: any) => {
    const exists = favorites.some(
      (s: any) => s.id === surah.id
    );

    let updated;

    if (exists) {
      updated = favorites.filter(
        (s: any) => s.id !== surah.id
      );
    } else {
      updated = [
        ...favorites,
        surah,
      ];
    }

    setFavorites(updated);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredSurahs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return localSurahs;
    }

    return localSurahs.filter(
      (surah) => {
        const id = String(surah.id);

        const arabicName =
          surah.name
            ?.toLowerCase() || "";

        const englishName =
          surah.english_name
            ?.toLowerCase() || "";

        return (
          id.includes(query) ||
          arabicName.includes(query) ||
          englishName.includes(query)
        );
      }
    );
  }, [search, localSurahs]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={styles.container}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <motion.h1
        initial={{
          y: -20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        style={styles.title(dark)}
      >
        {lang === "ar"
          ? "سور القرآن الكريم"
          : "Quran Surahs"}
      </motion.h1>

      <p style={styles.subtitle(dark)}>
        {lang === "ar"
          ? "استمع إلى القرآن الكريم بصوت الشيخ الزين محمد أحمد"
          : "Listen to the Holy Quran recited by Sheikh Al-Zain Muhammad Ahmed"}
      </p>

      {/* =====================================
          SEARCH
      ===================================== */}

      <div style={styles.searchContainer}>
        <span style={styles.searchIcon}>
          🔎
        </span>

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder={
            lang === "ar"
              ? "ابحث عن السورة..."
              : "Search Surah by name or number..."
          }
          style={styles.searchInput(dark)}
          dir={
            lang === "ar"
              ? "rtl"
              : "ltr"
          }
        />
      </div>

      {/* =====================================
          RESULT COUNT
      ===================================== */}

      {!loading &&
        !errorMessage && (
          <div style={styles.count(dark)}>
            {filteredSurahs.length} / 114{" "}
            {lang === "ar"
              ? "سورة"
              : "Surahs"}
          </div>
        )}

      {/* =====================================
          LOADING
      ===================================== */}

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.loading}
        >
          ⏳{" "}
          {lang === "ar"
            ? "جاري تحميل السور..."
            : "Loading Surahs..."}
        </motion.p>
      )}

      {/* =====================================
          ERROR
      ===================================== */}

      {!loading &&
        errorMessage && (
          <div style={styles.error}>
            <div style={styles.errorIcon}>
              ⚠️
            </div>

            <h3>
              {lang === "ar"
                ? "تعذر تحميل السور"
                : "Unable to load Surahs"}
            </h3>

            <p>
              {errorMessage}
            </p>

            <button
              style={styles.retryButton}
              onClick={getSurahs}
            >
              🔄{" "}
              {lang === "ar"
                ? "إعادة المحاولة"
                : "Try Again"}
            </button>
          </div>
        )}

      {/* =====================================
          NO SEARCH RESULTS
      ===================================== */}

      {!loading &&
        !errorMessage &&
        filteredSurahs.length === 0 && (
          <div style={styles.empty(dark)}>
            <div
              style={{
                fontSize: "45px",
              }}
            >
              🔎
            </div>

            <h3>
              {lang === "ar"
                ? "لم يتم العثور على سورة"
                : "No Surah Found"}
            </h3>

            <p>
              {lang === "ar"
                ? "حاول البحث باسم سورة آخر."
                : "Try another Surah name or number."}
            </p>
          </div>
        )}

      {/* =====================================
          SURAHS GRID
      ===================================== */}

      {!loading &&
        !errorMessage &&
        filteredSurahs.length > 0 && (
          <div style={styles.grid}>
            {filteredSurahs.map(
              (surah, i) => {
                const isFavorite =
                  favorites.some(
                    (s: any) =>
                      s.id === surah.id
                  );

                return (
                  <motion.div
                    key={surah.id}
                    style={styles.card(dark)}
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        Math.min(
                          i * 0.02,
                          0.5
                        ),
                    }}
                    whileHover={{
                      y: -5,
                      boxShadow:
                        "0px 10px 25px rgba(0,0,0,0.25)",
                    }}
                  >
                    {/* Number */}

                    <div
                      style={styles.number}
                    >
                      {surah.id}
                    </div>

                    {/* Arabic Name */}

                    <h2
                      style={
                        styles.arabicName
                      }
                    >
                      {surah.name}
                    </h2>

                    {/* English Name */}

                    <div
                      style={
                        styles.englishName
                      }
                    >
                      {surah.english_name ||
                        ""}
                    </div>

                    {/* Ayah Count */}

                    <div
                      style={
                        styles.ayahCount(
                          dark
                        )
                      }
                    >
                      📖{" "}
                      {surah.ayah_count ||
                        "—"}{" "}
                      {lang === "ar"
                        ? "آية"
                        : "Ayahs"}
                    </div>

                    {/* Reciter */}

                    <div
                      style={
                        styles.reciter
                      }
                    >
                      🎙️ Al-Zain Muhammad
                      Ahmed
                    </div>

                    {/* Buttons */}

                    <div
                      style={
                        styles.buttons
                      }
                    >
                      {/* Play */}

                      <motion.button
                        style={
                          styles.playButton
                        }
                        whileTap={{
                          scale: 0.9,
                        }}
                        whileHover={{
                          scale: 1.05,
                        }}
                        onClick={() =>
                          playSurah(
                            surah
                          )
                        }
                      >
                        ▶️ Play
                      </motion.button>

                      {/* Favorite */}

                      <motion.button
                        style={{
                          ...styles.favoriteButton,
                          background:
                            isFavorite
                              ? "#ef4444"
                              : "#475569",
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        whileHover={{
                          scale: 1.05,
                        }}
                        onClick={() =>
                          toggleFavorite(
                            surah
                          )
                        }
                      >
                        {isFavorite
                          ? "❤️"
                          : "🤍"}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        )}
    </motion.div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  title: (dark: boolean) => ({
    textAlign: "center" as const,
    marginBottom: "8px",
    color: dark
      ? "#ffffff"
      : "#111827",
    fontSize:
      "clamp(28px, 5vw, 40px)",
    fontWeight: "bold",
  }),

  subtitle: (dark: boolean) => ({
    textAlign: "center" as const,
    color: dark
      ? "#94a3b8"
      : "#64748b",
    marginBottom: "25px",
    fontSize: "15px",
    lineHeight: 1.6,
  }),

  searchContainer: {
    position: "relative" as const,
    maxWidth: "650px",
    margin: "0 auto 15px",
  },

  searchIcon: {
    position: "absolute" as const,
    left: "15px",
    top: "50%",
    transform:
      "translateY(-50%)",
    fontSize: "18px",
    zIndex: 2,
  },

  searchInput: (dark: boolean) => ({
    width: "100%",
    boxSizing:
      "border-box" as const,
    padding:
      "14px 18px 14px 45px",
    borderRadius: "14px",
    border: dark
      ? "1px solid #334155"
      : "1px solid #cbd5e1",
    background: dark
      ? "#1e293b"
      : "#ffffff",
    color: dark
      ? "#ffffff"
      : "#111827",
    fontSize: "16px",
    outline: "none",
  }),

  count: (dark: boolean) => ({
    textAlign: "center" as const,
    color: dark
      ? "#94a3b8"
      : "#64748b",
    marginBottom: "20px",
    fontSize: "14px",
  }),

  loading: {
    textAlign: "center" as const,
    fontSize: "18px",
    marginTop: "30px",
    color: "#94a3b8",
  },

  error: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "30px",
    textAlign: "center" as const,
    borderRadius: "16px",
    background: "#7f1d1d",
    border:
      "1px solid #ef4444",
    color: "#ffffff",
  },

  errorIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  retryButton: {
    marginTop: "20px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },

  empty: (dark: boolean) => ({
    maxWidth: "600px",
    margin: "40px auto",
    padding: "30px",
    textAlign: "center" as const,
    borderRadius: "16px",
    background: dark
      ? "#1e293b"
      : "#f8fafc",
    color: dark
      ? "#ffffff"
      : "#111827",
  }),

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
  },

  card: (dark: boolean) => ({
    background: dark
      ? "#1e293b"
      : "#f8fafc",
    color: dark
      ? "#e2e8f0"
      : "#0f172a",
    padding: "20px",
    borderRadius: "16px",
    textAlign: "center" as const,
    transition: "0.3s",
    border: dark
      ? "1px solid #334155"
      : "1px solid #e2e8f0",
  }),

  number: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#22c55e",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    fontWeight: "bold",
  },

  arabicName: {
    margin: "5px 0",
    fontSize: "28px",
    direction: "rtl" as const,
    fontFamily: "serif",
  },

  englishName: {
    fontSize: "15px",
    fontWeight: 600,
    opacity: 0.7,
    marginBottom: "12px",
  },

  ayahCount: (dark: boolean) => ({
    color: dark
      ? "#cbd5e1"
      : "#475569",
    fontSize: "14px",
    marginBottom: "8px",
  }),

  reciter: {
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "16px",
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },

  playButton: {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 600,
  },

  favoriteButton: {
    padding: "10px 13px",
    borderRadius: "10px",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
  },
};
