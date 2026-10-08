
const AUDIO_CACHE_NAME = "quran-audio";
const DOWNLOADED_KEY = "quran-downloaded-surahs";

export type DownloadedSurah = {
  id: number;
  name: string;
  audio_url: string;
};

function readDownloadedSurahs(): DownloadedSurah[] {
  try {
    const saved = localStorage.getItem(DOWNLOADED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveDownloadedSurahs(
  surahs: DownloadedSurah[]
) {
  localStorage.setItem(
    DOWNLOADED_KEY,
    JSON.stringify(surahs)
  );
}

export function getDownloadedSurahs(): DownloadedSurah[] {
  return readDownloadedSurahs();
}

export function isSurahDownloaded(
  id: number
): boolean {
  return readDownloadedSurahs().some(
    (surah) => surah.id === id
  );
}

export async function downloadSurah(
  surah: DownloadedSurah
): Promise<void> {
  if (!surah.audio_url) {
    throw new Error("Audio URL is missing.");
  }

  if (!("caches" in window)) {
    throw new Error(
      "Offline storage is not supported by this browser."
    );
  }

  const cache = await caches.open(
    AUDIO_CACHE_NAME
  );

  const existing = await cache.match(
    surah.audio_url
  );

  if (!existing) {
    let response: Response;

    try {
      response = await fetch(
        surah.audio_url,
        {
          mode: "cors",
          cache: "no-cache",
        }
      );
    } catch {
      response = await fetch(
        surah.audio_url,
        {
          mode: "no-cors",
          cache: "no-cache",
        }
      );
    }

    if (
      !response.ok &&
      response.type !== "opaque"
    ) {
      throw new Error(
        "Failed to download audio."
      );
    }

    await cache.put(
      surah.audio_url,
      response
    );
  }

  const downloaded =
    readDownloadedSurahs();

  if (
    !downloaded.some(
      (item) => item.id === surah.id
    )
  ) {
    downloaded.push({
      id: surah.id,
      name: surah.name,
      audio_url: surah.audio_url,
    });

    saveDownloadedSurahs(downloaded);
  }
}

export async function deleteDownloadedSurah(
  surah: DownloadedSurah
): Promise<void> {
  if ("caches" in window) {
    const cache = await caches.open(
      AUDIO_CACHE_NAME
    );

    await cache.delete(
      surah.audio_url
    );
  }

  const downloaded =
    readDownloadedSurahs().filter(
      (item) => item.id !== surah.id
    );

  saveDownloadedSurahs(downloaded);
}

export async function clearDownloadedSurahs(): Promise<void> {
  if ("caches" in window) {
    await caches.delete(
      AUDIO_CACHE_NAME
    );
  }

  localStorage.removeItem(
    DOWNLOADED_KEY
  );
}
