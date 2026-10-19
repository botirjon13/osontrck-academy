import { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const { t } = useTranslation();
  const { status, user } = useAuth();
  const isAuthenticated = status === "authenticated" && user;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-28 md:py-[120px] px-6"
      style={{
        backgroundColor: '#0A1628',
        borderTop: '1px solid rgba(138, 154, 176, 0.06)',
      }}
    >
      <div
        className="max-w-[640px] mx-auto text-center transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <h2
          className="font-serif text-3xl md:text-[48px] font-semibold leading-[1.12]"
          style={{ color: '#F0EDE5', letterSpacing: '-1px' }}
        >
          {t("cta.title")}
        </h2>
        <p
          className="text-lg mt-4"
          style={{ color: '#8A9AB0' }}
        >
          {t("cta.subtitle")}
        </p>

        <Link
          to={
            isAuthenticated
              ? user.role === "ADMIN"
                ? "/admin"
                : "/dashboard"
              : "/#courses"
          }
          className="inline-block mt-8 px-11 py-[18px] rounded-full font-semibold text-[17px] transition-all duration-200 hover:scale-[1.03]"
          style={{
            backgroundColor: '#D4A853',
            color: '#0A1628',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E8C876';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(212, 168, 83, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#D4A853';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isAuthenticated
            ? t(user.role === "ADMIN" ? "account.adminPanel" : "account.portal")
            : t("cta.button")}
        </Link>

        {!isAuthenticated && (
          <p className="text-[13px] mt-4" style={{ color: '#4A5A70' }}>
            {t("cta.note")}
          </p>
        )}
      </div>
    </section>
  );
}
