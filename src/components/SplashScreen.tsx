import { useEffect, useState } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const finishTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 1600);

    const removeTimer = window.setTimeout(() => {
      onFinish();
    }, 2100);

    return () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${leaving ? "splash-leaving" : ""}`}>
      <div className="splash-decoration splash-decoration-one" />
      <div className="splash-decoration splash-decoration-two" />

      <div className="splash-content">
        <div className="splash-icon-wrapper">
          <img
            src="/icon-512.png"
            alt="Quran App"
            className="splash-icon"
          />
        </div>

        <h1 className="splash-title">Quran App</h1>

        <div className="splash-divider">
          <span />
          <span className="splash-star">✦</span>
          <span />
        </div>

        <p className="splash-subtitle">القرآن الكريم</p>

        <p className="splash-reciter">
          Sheikh Al-Zain Muhammad Ahmed
        </p>

        <div className="splash-loading">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
