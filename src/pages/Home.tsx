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

  // 🔥 local surahs
  const [localSurahs, setLocalSurahs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSurahs();
  }, []);

  async function getSurahs() {

  // اقرأ البيانات المحفوظة محليًا أولاً
  const cached = localStorage.getItem("surahs");

  if (cached) {
    const cachedData = JSON.parse(cached);

    setSurahs(cachedData);
    setLocalSurahs(cachedData);
    setLoading(false);
  }

  // جلب أحدث البيانات من Supabase
  const { data, error } = await supabase
    .from("surahs")
    .select("*")
    .order("id", { ascending: true });

  console.log(data);
  console.log(error);

  if (data && !error) {

    // تحديث الواجهة
    setSurahs(data);
    setLocalSurahs(data);

    // حفظ البيانات محليًا
    localStorage.setItem(
      "surahs",
      JSON.stringify(data)
    );
  }

  setLoading(false);
}

  const toggleFavorite = (surah: any) => {

    const exists = favorites.find(
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
          ⏳ Loading...
        </motion.p>
      )}

      {/* Surahs */}
      <div style={styles.grid}>

        {localSurahs.map((surah, i) => {

          const isFavorite =
            favorites.some(
              (s: any) => s.id === surah.id
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
<h3 style={{ marginBottom: "15px" }}>
  {lang === "ar"
    ? surah.name
    : surah.english_name}
</h3>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                }}
              >

                {/* Play */}
                <motion.button
                  style={styles.button}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() =>
                    playSurah(surah)
                  }
                >
                  ▶️
                </motion.button>

                {/* Favorite */}
                <motion.button
                  style={styles.favoriteButton}
                  whileTap={{ scale: 1.4 }}
                  whileHover={{ scale: 1.2 }}
                  onClick={() =>
                    toggleFavorite(surah)
                  }
                >
                 <span
  style={{
    color: isFavorite
      ? "red"
      : dark
      ? "white"
      : "black",

    opacity: isFavorite
      ? 1
      : 0.7,
  }}
>
  {isFavorite ? "❤️" : "♡"}
</span>
                </motion.button>

              </div>

            </motion.div>
          );
        })}

      </div>
    </motion.div>
  );
}

//////////////////////////////////////////////////////

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

    background: "transparent",

    border: "none",

    cursor: "pointer",

    fontSize: "20px",

    padding: "0",
    opacty:  0.5,
    display: "flex",

    alignItems: "center",

    justifyContent: "center",
  },
};