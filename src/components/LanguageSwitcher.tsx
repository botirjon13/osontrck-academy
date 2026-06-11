import { useState } from "react";
import i18n from "i18next";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);

    localStorage.setItem(
      "language",
      lang
    );

    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10"
      >
        🌐 Language
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-[#0f172a] border border-white/10 rounded-lg shadow-lg">
          <button
            onClick={() => changeLanguage("uz")}
            className="w-full text-left px-4 py-2 hover:bg-white/10"
          >
            🇺🇿 O'zbek
          </button>

          <button
            onClick={() => changeLanguage("ru")}
            className="w-full text-left px-4 py-2 hover:bg-white/10"
          >
            🇷🇺 Русский
          </button>

          <button
            onClick={() => changeLanguage("en")}
            className="w-full text-left px-4 py-2 hover:bg-white/10"
          >
            🇺🇸 English
          </button>
        </div>
      )}
    </div>
  );
}
