import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../context/auth-context";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  const { t } = useTranslation();
  const { status, user, logout, error } = useAuth();

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
      href: "/#courses",
    },
    {
      key: "nav.pricing",
      href: "/#pricing",
    },
    {
      key: "nav.about",
      href: "/#about",
    },
    {
      key: "nav.blog",
      href: "/#blog",
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
      <div className="max-w-[1200px] mx-auto flex min-h-16 flex-wrap items-center justify-between gap-y-2 px-4 py-2 sm:px-6">
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

        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end md:gap-4">
          <LanguageSwitcher />

          {status === "authenticated" && user ? (
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="min-w-0 text-right transition-colors hover:text-white"
                title={user.fullName || user.email}
              >
                <span className="block max-w-[150px] truncate text-sm font-semibold text-text-primary sm:max-w-[220px]">
                  {user.fullName || user.email}
                </span>
                <span className="block text-xs text-text-secondary">
                  {t(`account.role.${user.role}`)}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="shrink-0 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {t("dashboard.logout")}
              </button>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-[15px] font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                {t("nav.signin")}
              </Link>
              <Link
                to="/register"
                className="rounded-full px-6 py-2.5 text-[15px] font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: "#D4A853",
                  color: "#0A1628",
                }}
              >
                {t("nav.getstarted")}
              </Link>
            </div>
          ) : (
            <span
              className="max-w-[220px] truncate text-sm text-text-secondary"
              role={status === "error" ? "alert" : "status"}
              title={status === "error" ? error ?? undefined : undefined}
            >
              {t(
                status === "error"
                  ? "account.sessionCheckError"
                  : "account.sessionChecking",
              )}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
