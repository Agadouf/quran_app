import { useEffect, useState } from "react";
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

  const [errorMessage, setErrorMessage] = useState("");

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

      console.log("Supabase Surahs:", data);
      console.log("Supabase Error:", error);

      if (error) {
        console.error("Failed to load Surahs:", error);

        setErrorMessage(
          error.message || "Failed to load Surahs."
        );

        setSurahs([]);
        setLocalSurahs([]);

        return;
      }

      if (!data || data.length === 0) {
        console.warn("Supabase returned zero Surahs.");

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
      console.error(
        "Unexpected error loading Surahs:",
        error
      );

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


  // ❤️ Favorite
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
      updated = [...favorites, surah];
    }

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
      transition={{ duration: 0.6 }}
      style={styles.container}
    >

      {/* Title */}

      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={styles.title(dark)}
      >
        {lang === "ar"
          ? "السور"
          : "Surahs"}
      </motion.h1>


      {/* Loading */}

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.loading}
        >
          ⏳ Loading Surahs...
        </motion.p>
      )}


      {/* Error */}

      {!loading && errorMessage && (
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


      {/* Empty */}

      {!loading &&
        !errorMessage &&
        localSurahs.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              📖
            </div>

            <h3>
              {lang === "ar"
                ? "لا توجد سور"
                : "No Surahs"}
            </h3>

            <p>
              {lang === "ar"
                ? "لم يتم العثور على أي سورة."
                : "No Surahs were found in the database."}
            </p>
          </div>
        )}


      {/* Surahs */}

      {!loading &&
        localSurahs.length > 0 && (

          <div style={styles.grid}>

            {localSurahs.map((surah, i) => {

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
                    y: 30,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                  }}

                  transition={{
                    delay: i * 0.05,
                  }}

                  whileHover={{
                    scale: 1.05,

                    boxShadow:
                      "0px 10px 25px rgba(0,0,0,0.3)",
                  }}
                >

                  <h3
                    style={{
                      marginBottom: "15px",
                    }}
                  >
                    {surah.name}
                  </h3>


                  {/* Buttons */}

                  <div
                    style={{
                      display: "flex",

                      justifyContent:
                        "center",

                      gap: "10px",
                    }}
                  >

                    {/* Play */}

                    <motion.button
                      style={styles.button}

                      whileTap={{
                        scale: 0.9,
                      }}

                      whileHover={{
                        scale: 1.1,
                      }}

                      onClick={() =>
                        playSurah(surah)
                      }
                    >
                      ▶️
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
                        scale: 1.3,
                      }}

                      whileHover={{
                        scale: 1.1,
                      }}

                      onClick={() =>
                        toggleFavorite(surah)
                      }
                    >
                      {isFavorite
                        ? "❤️"
                        : "🤍"}
                    </motion.button>

                  </div>

                </motion.div>
              );
            })}

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
  },


  title: (dark: boolean) => ({
    textAlign: "center" as const,

    marginBottom: "25px",

    color: dark
      ? "#ffffff"
      : "#111827",

    fontSize: "34px",

    fontWeight: "bold",
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


  empty: {
    maxWidth: "600px",

    margin: "40px auto",

    padding: "30px",

    textAlign: "center" as const,

    borderRadius: "16px",

    background: "#1e293b",

    color: "#ffffff",
  },


  emptyIcon: {
    fontSize: "45px",

    marginBottom: "10px",
  },


  grid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",

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


  button: {

    padding: "10px 14px",

    borderRadius: "10px",

    border: "none",

    background: "#22c55e",

    color: "white",

    cursor: "pointer",

    fontSize: "16px",
  },


  favoriteButton: {

    padding: "10px 14px",

    borderRadius: "10px",

    border: "none",

    color: "white",

    cursor: "pointer",

    fontSize: "16px",
  },
};
