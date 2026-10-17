
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import {
  downloadSurah,
  isSurahDownloaded,
} from "../utils/offlineStorage";

type Surah = {
  id: number;
  name: string;
  english_name?: string;
  audio_url: string;
  [key: string]: unknown;
};

type HomeProps = {
  playSurah: (surah: Surah) => void;
  favorites: number[];
  setFavorites: React.Dispatch<React.SetStateAction<number[]>>;
  lang: string;
  dark: boolean;
};

export default function Home({
  playSurah,
  favorites,
  setFavorites,
  lang,
  dark,
}: HomeProps) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [visibleSurahs, setVisibleSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState<Record<number, boolean>>({});
  const [downloading, setDownloading] = useState<Record<number, boolean>>({});

  const isArabic = lang === "ar";

  useEffect(() => {
    let active = true;

    async function loadSurahs() {
      try {
        const { data, error } = await supabase
          .from("surahs")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        if (data && active) {
          setSurahs(data as Surah[]);
          localStorage.setItem("quran-surahs-cache", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to load Surahs:", error);

        try {
          const cached = localStorage.getItem("quran-surahs-cache");
          if (cached && active) {
            setSurahs(JSON.parse(cached) as Surah[]);
          }
        } catch (cacheError) {
          console.error("Failed to read cached Surahs:", cacheError);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSurahs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const status: Record<number, boolean> = {};

    for (let id = 1; id <= 114; id++) {
      status[id] = isSurahDownloaded(id);
    }

    setDownloaded(status);
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setVisibleSurahs(surahs);
      return;
    }

    setVisibleSurahs(
      surahs.filter((surah) => {
        return (
          String(surah.id).includes(query) ||
          (surah.name || "").toLowerCase().includes(query) ||
          (surah.english_name || "").toLowerCase().includes(query)
        );
      })
    );
  }, [search, surahs]);

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id]
    );
  }

  async function handleDownload(surah: Surah) {
    const id = surah.id;

    // Prevent duplicate clicks while downloading.
    if (downloading[id]) return;

    // Check storage again in case the status changed.
    if (isSurahDownloaded(id) || downloaded[id]) {
      setDownloaded((current) => ({ ...current, [id]: true }));

      alert(
        isArabic
          ? `سورة ${surah.name} محمّلة مسبقًا ومتاحة بدون إنترنت ✓`
          : `${surah.english_name || surah.name} is already downloaded and available offline ✓`
      );

      return;
    }

    setDownloading((current) => ({ ...current, [id]: true }));

    try {
      await downloadSurah(surah);

      setDownloaded((current) => ({ ...current, [id]: true }));

      alert(
        isArabic
          ? `تم تحميل سورة ${surah.name} بنجاح ✓`
          : `${surah.english_name || surah.name} downloaded successfully ✓`
      );
    } catch (error) {
      console.error("Failed to download Surah:", error);

      alert(
        isArabic
          ? "تعذّر تحميل السورة. تأكد من اتصال الإنترنت وحاول مرة أخرى."
          : "Could not download the Surah. Check your internet connection and try again."
      );
    } finally {
      setDownloading((current) => ({ ...current, [id]: false }));
    }
  }

  if (loading) {
    return (
      <main className={`home-page ${dark ? "dark-page" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
        <p className="loading">
          {isArabic ? "جاري تحميل السور..." : "Loading Surahs..."}
        </p>
      </main>
    );
  }

  return (
    <main className={`home-page ${dark ? "dark-page" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="home-container">
        <header className="hero-section">
          <div className="quran-icon">📖</div>
          <h1>{isArabic ? "القرآن الكريم" : "Holy Quran"}</h1>
          <p>
            {isArabic
              ? "استمع إلى القرآن الكريم بصوت الشيخ الزين محمد أحمد"
              : "Listen to the Holy Quran recited by Sheikh Al-Zain Muhammad Ahmed"}
          </p>
        </header>

        <section className="offline-notice">
          <strong>📥 {isArabic ? "استمع بدون إنترنت" : "Listen Offline"}</strong>
          <p>
            {isArabic
              ? "حمّل السورة مرة واحدة للاستماع إليها لاحقًا دون إنترنت."
              : "Download a Surah once to listen offline later."}
          </p>
        </section>

        <div className="search-container">
          <span>🔎</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={isArabic ? "ابحث عن سورة..." : "Search Surah..."}
            aria-label={isArabic ? "البحث عن سورة" : "Search Surah"}
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <p className="results-info">
          {isArabic
            ? `عدد السور: ${visibleSurahs.length}`
            : `Surahs: ${visibleSurahs.length}`}
        </p>

        {visibleSurahs.length === 0 ? (
          <p className="empty-state">
            {isArabic ? "لم يتم العثور على سورة." : "No Surah found."}
          </p>
        ) : (
          <div className="surahs-grid">
            {visibleSurahs.map((surah) => {
              const isFavorite = favorites.includes(surah.id);
              const isDownloaded = !!downloaded[surah.id];
              const isDownloading = !!downloading[surah.id];

              return (
                <article className="surah-card" key={surah.id}>
                  <div className="surah-top">
                    <span className="surah-number">{surah.id}</span>
                    <button
                      className={`favorite-button ${isFavorite ? "favorite-active" : ""}`}
                      onClick={() => toggleFavorite(surah.id)}
                      aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
                    >
                      {isFavorite ? "❤️" : "♡"}
                    </button>
                  </div>

                  <div className="surah-info">
                    <h2>{surah.name}</h2>
                    {surah.english_name && <p>{surah.english_name}</p>}
                  </div>

                  <div className="surah-actions">
                    <button
                      className="play-button"
                      onClick={() => playSurah(surah)}
                    >
                      ▶️ {isArabic ? "تشغيل" : "Play"}
                    </button>

                    <button
                      className={`download-button ${isDownloaded ? "downloaded" : ""}`}
                      onClick={() => handleDownload(surah)}
                      disabled={isDownloading || isDownloaded}
                      title={
                        isDownloaded
                          ? isArabic
                            ? "السورة محمّلة مسبقًا"
                            : "Already downloaded"
                          : isArabic
                            ? "تحميل للاستماع بدون إنترنت"
                            : "Download for offline listening"
                      }
                    >
                      {isDownloading
                        ? "⏳"
                        : isDownloaded
                          ? "✓"
                          : "⬇️"}{" "}
                      {isDownloading
                        ? isArabic
                          ? "جاري التحميل..."
                          : "Downloading..."
                        : isDownloaded
                          ? isArabic
                            ? "متاح بدون إنترنت"
                            : "Available Offline"
                          : isArabic
                            ? "تحميل"
                            : "Download"}
                    </button>
                  </div>

                  <Link to={`/surah/${surah.id}`} className="details-link">
                    {isArabic ? "عرض السورة" : "View Surah"} →
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .home-page {
          min-height: 100vh;
          padding: 30px 18px 150px;
          background: #f8fafc;
          color: #111827;
        }

        .dark-page {
          background: #020617;
          color: #f8fafc;
        }

        .home-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .hero-section {
          padding: 35px 20px;
          margin-bottom: 24px;
          border-radius: 24px;
          text-align: center;
          color: white;
          background: linear-gradient(135deg, #064e3b, #047857, #059669);
        }

        .quran-icon { font-size: 48px; }
        .hero-section h1 { font-size: 32px; margin: 8px 0; }
        .hero-section p { line-height: 1.8; }

        .offline-notice {
          padding: 16px 20px;
          margin-bottom: 22px;
          border: 1px solid #a7f3d0;
          border-radius: 16px;
          background: #ecfdf5;
          color: #065f46;
        }

        .offline-notice p { margin-bottom: 0; line-height: 1.6; }
        .dark-page .offline-notice {
          background: #052e2b;
          border-color: #065f46;
          color: #d1fae5;
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 15px;
          min-height: 54px;
          border: 1px solid #d1d5db;
          border-radius: 15px;
          background: white;
        }

        .dark-page .search-container {
          background: #0f172a;
          border-color: #334155;
        }

        .search-container input {
          flex: 1;
          min-width: 0;
          padding: 14px 0;
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          font-size: 16px;
        }

        .search-container button {
          border: none;
          background: transparent;
          color: inherit;
          font-size: 24px;
        }

        .results-info { margin: 18px 0; color: #64748b; }
        .dark-page .results-info { color: #94a3b8; }

        .surahs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 18px;
        }

        .surah-card {
          padding: 22px;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          background: white;
          box-shadow: 0 8px 25px rgba(15, 23, 42, .05);
        }

        .dark-page .surah-card {
          background: #0f172a;
          border-color: #1e293b;
        }

        .surah-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .surah-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #064e3b;
          color: #a7f3d0;
          font-weight: 800;
        }

        .favorite-button {
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 28px;
          cursor: pointer;
        }

        .favorite-active { color: #ef4444; }

        .surah-info {
          min-height: 100px;
          padding-top: 18px;
        }

        .surah-info h2 {
          margin: 0;
          font-size: 28px;
          line-height: 1.5;
        }

        .surah-info p { color: #64748b; }
        .dark-page .surah-info p { color: #94a3b8; }

        .surah-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .play-button, .download-button {
          width: 100%;
          min-height: 48px;
          padding: 12px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .play-button { background: #059669; color: white; }
        .play-button:hover { background: #047857; }

        .download-button {
          background: #e2e8f0;
          color: #334155;
        }

        .dark-page .download-button {
          background: #1e293b;
          color: #e2e8f0;
        }

        .download-button.downloaded {
          background: #14532d;
          color: #bbf7d0;
          cursor: default;
        }

        .download-button:disabled { opacity: .9; }

        .details-link {
          display: block;
          margin-top: 18px;
          text-align: center;
          text-decoration: none;
          color: #059669;
          font-weight: 700;
        }

        .loading, .empty-state {
          padding: 60px 15px;
          text-align: center;
        }

        @media (max-width: 480px) {
          .home-page { padding: 18px 12px 150px; }
          .hero-section { padding: 28px 14px; }
          .hero-section h1 { font-size: 27px; }
          .surahs-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
