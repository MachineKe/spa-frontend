import { useTranslation } from "react-i18next";

export default function LanguageSelect() {
  const { i18n } = useTranslation();

  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      className="bg-black border border-gold rounded px-2 py-1 text-gold"
      value={i18n.language}
      onChange={handleLangChange}
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="sw">Swahili</option>
    </select>
  );
}
