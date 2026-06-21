import { motion } from "framer-motion";

export default function Favorites({
  favorites,
  setFavorites,
  playSurah,
  dark,
  lang,
}: any) {

  // ❤️ remove one favorite
  const removeFavorite = (id: number) => {

    const updated = favorites.filter(
      (s: any) => Number(s.id) !== Number(id)
    );

    setFavorites(updated);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  };

  // 🗑️ clear all favorites
  const clearFavorites = () => {

    // clear state
    setFavorites([]);

    // remove favorites completely
    localStorage.removeItem("favorites");

    // refresh immediately
    window.location.reload();
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          marginBottom: "25px",
          color: dark ? "white" : "black",
        }}
      >
        ❤️ {
          lang === "ar"
            ? "المفضلة"
            : "Favorites"
        }
      </h1>

      {/* Clear All Button */}
      {favorites.length > 0 && (

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px",
          }}
        >

          <button
            onClick={clearFavorites}

            style={{
              padding: "6px 10px",

              border: "none",

              borderRadius: "8px",

              background: "#ef4444",

              color: "white",

              cursor: "pointer",

              fontSize: "12px",
            }}
          >
            {
              lang === "ar"
                ? "حذف الكل"
                : "Clear"
            }
          </button>

        </div>
      )}

      {/* Empty favorites */}
      {favorites.length === 0 && (

        <p
          style={{
            textAlign: "center",
            opacity: 0.7,
            color: dark ? "white" : "black",
          }}
        >
          {
            lang === "ar"
              ? "لا توجد سور مفضلة"
              : "No favorite surahs"
          }
        </p>
      )}

      {/* Favorites Grid */}
      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(200px,1fr))",

          gap: "15px",
        }}
      >

        {favorites.map((surah: any) => (

          <motion.div
            key={surah.id}

            whileHover={{
              scale: 1.05,
            }}

            style={{
              background: dark
                ? "#1e293b"
                : "#f1f5f9",

              color: dark
                ? "white"
                : "black",

              padding: "20px",

              borderRadius: "12px",

              textAlign: "center",

              border: dark
                ? "1px solid #334155"
                : "1px solid #e2e8f0",

              transition: "0.3s",
            }}
          >

            {/* Surah Name */}
            <h3>
              {
                lang === "ar"
                  ? surah.name
                  : surah.english_name || surah.name
              }
            </h3>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                marginTop: "15px",
              }}
            >

              {/* Play */}
              <motion.button

                whileTap={{
                  scale: 0.9,
                }}

                whileHover={{
                  scale: 1.1,
                }}

                onClick={() =>
                  playSurah(surah)
                }

                style={{
                  padding: "8px 12px",

                  border: "none",

                  borderRadius: "8px",

                  background: "#22c55e",

                  color: "white",

                  cursor: "pointer",
                }}
              >
                ▶️
              </motion.button>

              {/* Remove Favorite */}
              <motion.button

                whileTap={{
                  scale: 1.3,
                }}

                whileHover={{
                  scale: 1.2,
                }}

                onClick={() =>
                  removeFavorite(surah.id)
                }

                style={{
                  background: "transparent",

                  border: "none",

                  cursor: "pointer",

                  fontSize: "22px",

                  color: "red",
                }}
              >
                ❤️
              </motion.button>

            </div>

          </motion.div>
        ))}

      </div>
    </div>
  );
}