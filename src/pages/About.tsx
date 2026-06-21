export default function About({ lang, dark }: any) {
  const t = {
    en: {
      title: "About",
      intro: "A simple Quran listening app",

      sheikhTitle: "Sheikh Al-Zain",
      sheikhDesc:
        "Sheikh Al-Zain Mohamed Ahmed is a well-known Sudanese Quran reciter, famous for his emotional and beautiful recitation.",

      appTitle: "About the App",
      appDesc:
        "This app helps you listen to Quran recitations easily with a clean and simple interface.",

      featuresTitle: "Features",
      features: [
        "Global audio player",
        "Play one surah at a time",
        "Search surahs",
        "Works on mobile and desktop",
      ],

      goalTitle: "Goal",
      goalDesc:
        "To provide a modern and simple Quran listening experience for everyone.",

      supportTitle: "Support",
      supportDesc:
        "If you like this app, you can support us to improve it.",

      donate: "Donate",
    },

    ar: {
      title: "حول التطبيق",
      intro: "تطبيق بسيط للاستماع إلى القرآن",

      sheikhTitle: "الشيخ الزين",
      sheikhDesc:
        "الشيخ الزين محمد أحمد قارئ سوداني مشهور بصوته الجميل والمؤثر.",

      appTitle: "عن التطبيق",
      appDesc:
        "يساعدك هذا التطبيق على الاستماع للقرآن بسهولة بتصميم بسيط ونظيف.",

      featuresTitle: "المميزات",
      features: [
        "مشغل صوت عالمي",
        "تشغيل سورة واحدة فقط",
        "البحث عن السور",
        "يعمل على الهاتف والكمبيوتر",
      ],

      goalTitle: "الهدف",
      goalDesc:
        "تقديم تجربة حديثة وبسيطة للاستماع إلى القرآن.",

      supportTitle: "الدعم",
      supportDesc:
        "إذا أعجبك التطبيق يمكنك دعمه لتطويره.",

      donate: "تبرع",
    },
  };

 const text = t[lang as keyof typeof t];

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={styles.container}
    >
      {/* 🔥 Header */}
      <h1 style={styles.title}>{text.title}</h1>
      <p style={styles.intro}>{text.intro}</p>

      {/* 🕌 Sheikh */}
      <div style={styles.card(dark)}>
        <h2>{text.sheikhTitle}</h2>
        <p>{text.sheikhDesc}</p>
      </div>

      {/* 📱 App */}
      <div style={styles.card(dark)}>
        <h2>{text.appTitle}</h2>
        <p>{text.appDesc}</p>
      </div>

      {/* 🎧 Features */}
      <div style={styles.card(dark)}>
        <h2>{text.featuresTitle}</h2>
        <ul style={styles.list}>
          {text.features.map((f: string, i: number) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      {/* 🎯 Goal */}
      <div style={styles.card(dark)}>
        <h2>{text.goalTitle}</h2>
        <p>{text.goalDesc}</p>
      </div>

      {/* ❤️ Support */}
      <div style={styles.card(dark)}>
        <h2>{text.supportTitle}</h2>
        <p>{text.supportDesc}</p>

        <button style={styles.button}>
          💖 {text.donate}
        </button>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////

const styles = {
  container: {
    maxWidth: "700px",
    margin: "auto",
    padding: "20px",
  },

  title: {
    textAlign: "center" as const,
    marginBottom: "5px",
  },

  intro: {
    textAlign: "center" as const,
    marginBottom: "25px",
    opacity: 0.7,
  },

  card: (dark: boolean) => ({
    background: dark ? "#1e293b" : "#f1f5f9",
    color: dark ? "#e2e8f0" : "#0f172a",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  }),

  list: {
    paddingLeft: "20px",
    lineHeight: "1.8",
  },

  button: {
    marginTop: "10px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#22c55e",
    color: "white",
    cursor: "pointer",
  },
};