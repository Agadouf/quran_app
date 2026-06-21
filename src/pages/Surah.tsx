import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";

export default function Surah({ playSurah, lang }: any) {
  const { id } = useParams();
  const [surah, setSurah] = useState<any>(null);

  useEffect(() => {
    getSurah();
  }, []);

  async function getSurah() {
    const { data } = await supabase
      .from("surahs")
      .select("*")
      .eq("id", id)
      .single();

    setSurah(data);
  }

  if (!surah) return <p>Loading...</p>;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <h2>{surah.name}</h2>

      <button onClick={() => playSurah(surah)}>
        {lang === "ar" ? "تشغيل" : "Play"}
      </button>
    </div>
  );
}