import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const navLinks = [
    {
      key: "nav.courses",
      href: "#courses",
    },
    {
      key: "nav.pricing",
      href: "#pricing",
    },
    {
      key: "nav.about",
      href: "#about",
    },
    {
      key: "nav.blog",
      href: "#blog",
    },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? "rgba(10, 22, 40, 0.85)"
          : "transparent",
        backdropFilter: scrolled
          ? "blur(12px)"
          : "none",
        borderBottom: scrolled
          ? "1px solid rgba(138, 154, 176, 0.08)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 border-2 border-accent-gold rotate-45"
            style={{
              borderRadius: "2px",
            }}
          />

          <span className="font-serif text-[22px] text-text-primary font-semibold tracking-tight">
            OsonTrack
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="relative text-[15px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 group"
            >
              {t(link.key)}

              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-[15px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            {t("nav.signin")}
          </Link>

          <Link
            to="/register"
            className="text-[15px] font-semibold px-6 py-2.5 rounded-full transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: "#D4A853",
              color: "#0A1628",
            }}
          >
            {t("nav.getstarted")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
