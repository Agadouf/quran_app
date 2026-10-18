
import { Link } from "react-router-dom";

interface ContactProps {
  lang: string;
  dark: boolean;
}

export default function Contact({ lang, dark }: ContactProps) {
  const isArabic = lang === "ar";

  const whatsappNumber = "249999179949";
  const whatsappMessage = encodeURIComponent(
    isArabic
      ? "السلام عليكم، لدي اقتراح بخصوص موقع القرآن الكريم."
      : "Hello, I have a suggestion about the Quran website."
  );

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const portfolioUrl = "https://agadouf.vercel.app/";

  return (
    <main
      style={{
        minHeight: "65vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 16px",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          textAlign: "center",
          padding: "32px 24px",
          borderRadius: "20px",
          background: dark ? "#1e293b" : "#f8fafc",
          color: dark ? "#ffffff" : "#0f172a",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "12px" }}>
          📩
        </div>

        <h1 style={{ margin: "0 0 12px", fontSize: "30px" }}>
          {isArabic ? "تواصل معنا" : "Contact Us"}
        </h1>

        <p
          style={{
            lineHeight: 1.8,
            opacity: 0.8,
            marginBottom: "28px",
          }}
        >
          {isArabic
            ? "عندك اقتراح أو فكرة لتطوير موقع القرآن الكريم؟ يسعدنا نسمع منك."
            : "Have a suggestion or idea to improve our Quran website? We would love to hear from you."}
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "15px 12px",
            boxSizing: "border-box",
            borderRadius: "12px",
            background: "#16a34a",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "16px",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "22px" }}>💬</span>
          {isArabic ? "تواصل معنا عبر واتساب" : "Contact Us on WhatsApp"}
        </a>

        <a
          href={portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "15px 12px",
            boxSizing: "border-box",
            borderRadius: "12px",
            border: "1px solid #d4af65",
            background: "transparent",
            color: dark ? "#f1d28a" : "#92400e",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          <span style={{ fontSize: "20px" }}>🚀</span>
          {isArabic ? "شاهد مشاريعنا" : "Our Projects"}
        </a>

        <div style={{ marginTop: "24px" }}>
          <Link
            to="/"
            style={{
              color: dark ? "#cbd5e1" : "#475569",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            {isArabic ? "← العودة إلى الرئيسية" : "← Back to Home"}
          </Link>
        </div>
      </section>
    </main>
  );
}
