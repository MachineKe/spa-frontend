import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useTranslation } from "react-i18next";
import "../i18n";

export default function Home() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    apiFetch("/pagecontent/home")
      .then((res) => {
        setContent(res.content?.content || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-gold">
      {/* Language select removed, now only in navbar */}
      {loading ? (
        <div className="text-gold">{t("loading") || "Loading..."}</div>
      ) : content ? (
        <div
          className="w-full max-w-2xl text-center"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <>
          <h1 className="text-4xl font-serif font-bold mb-4">{t("welcome")}</h1>
          <p className="text-lg font-sans mb-8">
            {t("Luxury Grooming & Wellness. Welcome to your sanctuary.") ||
              "Luxury Grooming & Wellness. Welcome to your sanctuary."}
          </p>
        </>
      )}
      <Link
        to="/booking"
        className="bg-gold text-black px-6 py-3 rounded font-semibold hover:bg-yellow-400 transition"
      >
        {t("bookNow")}
      </Link>
      </div>
  );
}
