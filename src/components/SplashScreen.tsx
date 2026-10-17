
import { useEffect, useState } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 2200);

    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, 2700);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash-screen ${leaving ? "splash-leaving" : ""}`}
      role="status"
      aria-label="Quran App"
    >
      <div className="islamic-pattern" />

      <div className="splash-arch">
        <div className="splash-stars">✦　·　✧　·　✦</div>

        <div className="splash-moon">☪</div>

        <div className="splash-lanterns">
          <div className="lantern lantern-left">
            <span>✧</span>
          </div>

          <div className="lantern lantern-right">
            <span>✧</span>
          </div>
        </div>

        <div className="splash-mosque">
          <div className="mosque-dome">✦</div>

          <div className="mosque-building">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="mosque-minaret minaret-left">◆</div>
          <div className="mosque-minaret minaret-right">◆</div>
        </div>

        <div className="splash-glow">
          <div className="splash-star-large">✦</div>
          <div className="splash-welcome">أهلاً بك</div>
        </div>

        <div className="splash-title">Quran App</div>

        <div className="splash-divider">
          <span />
          <b>✦</b>
          <span />
        </div>

        <div className="splash-arabic-title">القرآن الكريم</div>

        <div className="splash-reciter">
          بصوت الشيخ الزين محمد أحمد
        </div>

        <div className="splash-loading">
          <span />
          <span />
          <span />
        </div>

        <div className="splash-loading-text">بسم الله</div>
      </div>
    </div>
  );
}
