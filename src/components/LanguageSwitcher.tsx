import i18n from "i18next";

export default function LanguageSwitcher() {
  const changeLanguage = (
    lang: string
  ) => {
    i18n.changeLanguage(lang);

    localStorage.setItem(
      "language",
      lang
    );
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          changeLanguage("uz")
        }
      >
        🇺🇿 UZ
      </button>

      <button
        onClick={() =>
          changeLanguage("ru")
        }
      >
        🇷🇺 RU
      </button>

      <button
        onClick={() =>
          changeLanguage("en")
        }
      >
        🇺🇸 EN
      </button>
    </div>
  );
}
