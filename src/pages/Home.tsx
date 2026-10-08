import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import {
  downloadSurah,
  deleteDownloadedSurah,
  isSurahDownloaded,
} from "../utils/offlineStorage";

type Surah = {
  id: number;
  name: string;
  english_name?: string;
  audio_url: string;
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
  const [localSurahs, setLocalSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [downloaded, setDownloaded] = useState<
    Record<number, boolean>
  >({});

  const [downloading, setDownloading] = useState<
    Record<number, boolean>
  >({});

  /* =========================
     LOAD DOWNLOAD STATUS
  ========================= */

  async function loadDownloadStatus() {
    const status: Record<number, boolean> = {};

    for (let i = 1; i <= 114; i++) {
      status[i] = isSurahDownloaded(i);
    }

    setDownloaded(status);
  }

  /* =========================
     LOAD SURAHS
  ========================= */

  async function loadSurahs() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("surahs")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setSurahs(data);
        setLocalSurahs(data);

        // Save Surah list for offline use
        localStorage.setItem(
          "quran-surahs-cache",
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.error("Failed to load Surahs:", error);

      // Try offline cached Surah list
      const cached = localStorage.getItem(
        "quran-surahs-cache"
      );

      if (cached) {
        try {
          const data = JSON.parse(cached);

          setSurahs(data);
          setLocalSurahs(data);
        } catch (cacheError) {
          console.error(
            "Failed to read offline Surah cache:",
            cacheError
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSurahs();
    loadDownloadStatus();
  }, []);

  /* =========================
     SEARCH
  ========================= */

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setLocalSurahs(surahs);
      return;
    }

    const filtered = surahs.filter((surah) => {
      const id = String(surah.id);

      const arabicName =
        surah.name?.toLowerCase() || "";

      const englishName =
        surah.english_name?.toLowerCase() || "";

      return (
        id.includes(query) ||
        arabicName.includes(query) ||
        englishName.includes(query)
      );
    });

    setLocalSurahs(filtered);
  }, [search, surahs]);

  /* =========================
     FAVORITES
  ========================= */

  function toggleFavorite(id: number) {
    setFavorites((current) => {
      if (current.includes(id)) {
        return current.filter(
          (favoriteId) => favoriteId !== id
        );
      }

      return [...current, id];
    });
  }

  /* =========================
     DOWNLOAD SURAH
  ========================= */

  async function handleDownload(surah: Surah) {
    if (downloading[surah.id]) {
      return;
    }

    // If already downloaded → delete it
    if (downloaded[surah.id]) {
      try {
        setDownloading((current) => ({
          ...current,
          [surah.id]: true,
        }));

        await deleteDownloadedSurah(surah);

        setDownloaded((current) => ({
          ...current,
          [surah.id]: false,
        }));
      } catch (error) {
        console.error(
          "Failed to delete Surah:",
          error
        );

        alert(
          lang === "ar"
            ? "حدث خطأ أثناء حذف السورة."
            : "Failed to delete the Surah."
        );
      } finally {
        setDownloading((current) => ({
          ...current,
          [surah.id]: false,
        }));
      }

      return;
    }

    // Download
    try {
      setDownloading((current) => ({
        ...current,
        [surah.id]: true,
      }));

      await downloadSurah(surah);

      setDownloaded((current) => ({
        ...current,
        [surah.id]: true,
      }));
    } catch (error) {
      console.error(
        "Failed to download Surah:",
        error
      );

      alert(
        lang === "ar"
          ? "تعذر تحميل السورة. تأكد من اتصال الإنترنت."
          : "Failed to download the Surah. Please check your internet connection."
      );
    } finally {
      setDownloading((current) => ({
        ...current,
        [surah.id]: false,
      }));
    }
  }

  /* =========================
     PLAY SURAH
  ========================= */

  function handlePlay(surah: Surah) {
    playSurah(surah);
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div
        className={`home-page ${
          dark ? "dark-page" : ""
        }`}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            {lang === "ar"
              ? "جاري تحميل السور..."
              : "Loading Surahs..."}
          </p>
        </div>

        <style>{`
          .home-page {
            min-height: 100vh;
            padding: 40px 20px;
            background: #ffffff;
            color: #111827;
          }

          .dark-page {
            background: #0f172a;
            color: #ffffff;
          }

          .loading-container {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }

          .loading-spinner {
            width: 42px;
            height: 42px;
            border: 4px solid #e5e7eb;
            border-top-color: #16a34a;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <div
      className={`home-page ${
        dark ? "dark-page" : ""
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="home-container">

        {/* =========================
            HEADER
        ========================= */}

        <section className="hero-section">
          <div className="hero-content">

            <div className="quran-icon">
              📖
            </div>

            <h1>
              {lang === "ar"
                ? "القرآن الكريم"
                : "Holy Quran"}
            </h1>

            <p>
              {lang === "ar"
                ? "استمع إلى القرآن الكريم بصوت الشيخ الزين محمد أحمد"
                : "Listen to the Holy Quran recited by Sheikh Al-Zain Muhammad Ahmed"}
            </p>

          </div>
        </section>

        {/* =========================
            OFFLINE NOTICE
        ========================= */}

        <div className="offline-notice">

          <div className="offline-icon">
            📥
          </div>

          <div className="offline-text">
            <strong>
              {lang === "ar"
                ? "استمع بدون إنترنت"
                : "Listen Offline"}
            </strong>

            <span>
              {lang === "ar"
                ? "حمّل السور التي تريدها واستمع إليها بدون اتصال بالإنترنت."
                : "Download the Surahs you want and listen to them without an internet connection."}
            </span>
          </div>

        </div>

        {/* =========================
            SEARCH
        ========================= */}

        <div className="search-container">

          <span className="search-icon">
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={
              lang === "ar"
                ? "ابحث عن سورة..."
                : "Search Surah..."
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        {/* =========================
            RESULTS
        ========================= */}

        <div className="results-info">
          {lang === "ar"
            ? `عدد السور: ${localSurahs.length}`
            : `Surahs: ${localSurahs.length}`}
        </div>

        {/* =========================
            EMPTY SEARCH
        ========================= */}

        {localSurahs.length === 0 && (
          <div className="empty-state">

            <div className="empty-icon">
              🔍
            </div>

            <h3>
              {lang === "ar"
                ? "لم يتم العثور على سورة"
                : "No Surah found"}
            </h3>

            <p>
              {lang === "ar"
                ? "حاول البحث باسم سورة آخر."
                : "Try searching for another Surah."}
            </p>

          </div>
        )}

        {/* =========================
            SURAHS GRID
        ========================= */}

        <div className="surahs-grid">

          {localSurahs.map((surah) => {
            const isFavorite =
              favorites.includes(surah.id);

            const isDownloaded =
              downloaded[surah.id];

            const isDownloading =
              downloading[surah.id];

            return (
              <div
                className="surah-card"
                key={surah.id}
              >

                {/* TOP */}

                <div className="surah-top">

                  <div className="surah-number">
                    {surah.id}
                  </div>

                  <button
                    className={`favorite-button ${
                      isFavorite
                        ? "favorite-active"
                        : ""
                    }`}
                    onClick={() =>
                      toggleFavorite(surah.id)
                    }
                    aria-label={
                      isFavorite
                        ? "Remove favorite"
                        : "Add favorite"
                    }
                  >
                    {isFavorite ? "❤️" : "♡"}
                  </button>

                </div>

                {/* NAME */}

                <div className="surah-info">

                  <h2>
                    {surah.name}
                  </h2>

                  {surah.english_name && (
                    <p>
                      {surah.english_name}
                    </p>
                  )}

                </div>

                {/* BUTTONS */}

                <div className="surah-actions">

                  {/* PLAY */}

                  <button
                    className="play-button"
                    onClick={() =>
                      handlePlay(surah)
                    }
                  >
                    ▶️{" "}
                    {lang === "ar"
                      ? "تشغيل"
                      : "Play"}
                  </button>

                  {/* DOWNLOAD */}

                  <button
                    className={`download-button ${
                      isDownloaded
                        ? "downloaded"
                        : ""
                    }`}
                    onClick={() =>
                      handleDownload(surah)
                    }
                    disabled={isDownloading}
                    title={
                      isDownloaded
                        ? lang === "ar"
                          ? "حذف التحميل"
                          : "Delete download"
                        : lang === "ar"
                        ? "تحميل للاستماع بدون إنترنت"
                        : "Download for offline listening"
                    }
                  >
                    {isDownloading
                      ? "⏳"
                      : isDownloaded
                      ? "✓"
                      : "⬇️"}

                    <span>
                      {isDownloading
                        ? lang === "ar"
                          ? "جاري التحميل..."
                          : "Downloading..."
                        : isDownloaded
                        ? lang === "ar"
                          ? "متاح بدون إنترنت"
                          : "Available Offline"
                        : lang === "ar"
                        ? "تحميل"
                        : "Download"}
                    </span>
                  </button>

                </div>

                {/* OPEN SURAH */}

                <Link
                  to={`/surah/${surah.id}`}
                  className="details-link"
                >
                  {lang === "ar"
                    ? "عرض السورة"
                    : "View Surah"}
                  {" →"}
                </Link>

              </div>
            );
          })}

        </div>

      </div>

      {/* =========================
          STYLES
      ========================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .home-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #111827;
          padding: 30px 18px 120px;
          transition: background 0.3s ease,
                      color 0.3s ease;
        }

        .dark-page {
          background: #020617;
          color: #f8fafc;
        }

        .home-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* HERO */

        .hero-section {
          padding: 35px 20px;
          margin-bottom: 25px;
          border-radius: 24px;
          background: linear-gradient(
            135deg,
            #064e3b,
            #047857,
            #059669
          );
          color: white;
          box-shadow:
            0 15px 40px rgba(
              0,
              0,
              0,
              0.15
            );
        }

        .hero-content {
          text-align: center;
        }

        .quran-icon {
          font-size: 50px;
          margin-bottom: 10px;
        }

        .hero-section h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 800;
        }

        .hero-section p {
          margin: 12px auto 0;
          max-width: 700px;
          font-size: 16px;
          line-height: 1.7;
          opacity: 0.95;
        }

        /* OFFLINE NOTICE */

        .offline-notice {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 17px 20px;
          margin-bottom: 25px;
          border-radius: 16px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .dark-page .offline-notice {
          background: #052e2b;
          border-color: #065f46;
          color: #d1fae5;
        }

        .offline-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #d1fae5;
          font-size: 22px;
          flex-shrink: 0;
        }

        .dark-page .offline-icon {
          background: #064e3b;
        }

        .offline-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .offline-text strong {
          font-size: 15px;
        }

        .offline-text span {
          font-size: 13px;
          opacity: 0.9;
        }

        /* SEARCH */

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .search-icon {
          position: absolute;
          left: 17px;
          font-size: 18px;
          pointer-events: none;
        }

        [dir="rtl"] .search-icon {
          left: auto;
          right: 17px;
        }

        .search-container input {
          width: 100%;
          height: 54px;
          padding: 0 50px;
          border: 1px solid #d1d5db;
          border-radius: 15px;
          outline: none;
          background: white;
          color: #111827;
          font-size: 15px;
          transition: all 0.2s ease;
        }

        .dark-page .search-container input {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }

        .search-container input:focus {
          border-color: #10b981;
          box-shadow:
            0 0 0 3px rgba(
              16,
              185,
              129,
              0.12
            );
        }

        .clear-search {
          position: absolute;
          right: 12px;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: #e5e7eb;
          color: #374151;
          cursor: pointer;
          font-size: 20px;
        }

        [dir="rtl"] .clear-search {
          right: auto;
          left: 12px;
        }

        .dark-page .clear-search {
          background: #334155;
          color: white;
        }

        /* RESULTS */

        .results-info {
          margin-bottom: 18px;
          color: #6b7280;
          font-size: 13px;
        }

        .dark-page .results-info {
          color: #94a3b8;
        }

        /* GRID */

        .surahs-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(270px, 1fr)
            );
          gap: 18px;
        }

        /* CARD */

        .surah-card {
          padding: 20px;
          border-radius: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow:
            0 8px 25px rgba(
              15,
              23,
              42,
              0.05
            );
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .dark-page .surah-card {
          background: #0f172a;
          border-color: #1e293b;
          box-shadow:
            0 8px 25px rgba(
              0,
              0,
              0,
              0.25
            );
        }

        .surah-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 14px 35px rgba(
              15,
              23,
              42,
              0.1
            );
          border-color: #a7f3d0;
        }

        /* TOP */

        .surah-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .surah-number {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #ecfdf5;
          color: #047857;
          font-weight: 800;
          font-size: 14px;
        }

        .dark-page .surah-number {
          background: #064e3b;
          color: #a7f3d0;
        }

        .favorite-button {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 25px;
          color: #9ca3af;
          transition: transform 0.2s ease;
        }

        .favorite-button:hover {
          transform: scale(1.15);
        }

        .favorite-active {
          color: #ef4444;
        }

        /* INFO */

        .surah-info {
          min-height: 85px;
        }

        .surah-info h2 {
          margin: 0;
          font-size: 27px;
          font-weight: 800;
          line-height: 1.5;
        }

        .surah-info p {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .dark-page .surah-info p {
          color: #94a3b8;
        }

        /* ACTIONS */

        .surah-actions {
          display: flex;
          gap: 9px;
          margin-top: 12px;
        }

        .play-button,
        .download-button {
          flex: 1;
          min-height: 43px;
          border: none;
          border-radius: 11px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .play-button {
          background: #059669;
          color: white;
        }

        .play-button:hover {
          background: #047857;
          transform: translateY(-1px);
        }

        .download-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
        }

        .dark-page .download-button {
          background: #1e293b;
          color: #e2e8f0;
          border-color: #334155;
        }

        .download-button:hover {
          background: #e2e8f0;
        }

        .dark-page
          .download-button:hover {
          background: #334155;
        }

        .download-button.downloaded {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }

        .dark-page
          .download-button.downloaded {
          background: #14532d;
          color: #bbf7d0;
          border-color: #166534;
        }

        .download-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        /* DETAILS */

        .details-link {
          display: block;
          margin-top: 14px;
          text-align: center;
          color: #059669;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .details-link:hover {
          text-decoration: underline;
        }

        /* EMPTY */

        .empty-state {
          padding: 70px 20px;
          text-align: center;
        }

        .empty-icon {
          font-size: 45px;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          margin: 0 0 8px;
        }

        .empty-state p {
          margin: 0;
          color: #6b7280;
        }

        /* LOADING */

        .loading-container {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 45px;
          height: 45px;
          border: 4px solid #e5e7eb;
          border-top-color: #059669;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {

          .home-page {
            padding:
              20px 12px 120px;
          }

          .hero-section {
            padding: 28px 15px;
            border-radius: 18px;
          }

          .hero-section h1 {
            font-size: 27px;
          }

          .hero-section p {
            font-size: 14px;
          }

          .offline-notice {
            align-items: flex-start;
            padding: 14px;
          }

          .offline-text span {
            line-height: 1.6;
          }

          .surahs-grid {
            grid-template-columns: 1fr;
          }

          .surah-card {
            padding: 17px;
          }

          .surah-actions {
            flex-direction: column;
          }

          .play-button,
          .download-button {
            width: 100%;
          }

        }

      `}</style>
    </div>
  );
}
