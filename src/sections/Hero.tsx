import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/auth-context";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();
  const { status, user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Sariq kataklarni (Grid / Micro Slats) Canvas'ga chizish effekti
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const gridSize = 40; // Kataklar hajmi
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Katak chiziqlarini chizish (Sariq / Oltin rangli yorug'lik bilan)
      ctx.strokeStyle = "rgba(212, 168, 83, 0.12)"; // Oltin-sariq shaffof katak
      ctx.lineWidth = 1;

      offset += 0.2; // Sekin va mayin harakat
      if (offset >= gridSize) offset = 0;

      // Vertikal (tik) katak chiziqlari
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Gorizontal (yotiq) katak chiziqlari
      for (let y = offset; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const stats = [
    {
      number: "1",
      label: t("hero.availableCourses"),
    },
    {
      number: "Swagger",
      label: t("hero.practice"),
    },
    {
      number: t("courses.free"),
      label: t("hero.currentCourse"),
    },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#0A1628" }}
    >
      {/* Sariq Kataklar Chiziladigan Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div
          className="max-w-[720px] mx-auto text-center"
          style={{ paddingTop: "18vh" }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 transition-all duration-600"
            style={{
              backgroundColor: "rgba(212, 168, 83, 0.1)",
              border: "1px solid rgba(212, 168, 83, 0.2)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "0ms",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
            <span
              className="text-xs font-medium uppercase tracking-[2px]"
              style={{ color: "#D4A853" }}
            >
              {t("hero.badge")}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-serif text-5xl md:text-7xl font-semibold leading-[1.08] tracking-tight"
            style={{
              color: "#F0EDE5",
              letterSpacing: "-1.5px",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transitionDelay: "150ms",
            }}
          >
            {t("hero.title1")}{" "}
            <span style={{ color: "#D4A853" }}>{t("hero.title2")}</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl mt-6 mx-auto max-w-[560px]"
            style={{
              color: "#8A9AB0",
              lineHeight: 1.65,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transitionDelay: "300ms",
            }}
          >
            {t("hero.subtitle")}
          </p>

          {/* Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transitionDelay: "450ms",
            }}
          >
            <Link
              to={
                status === "authenticated" && user
                  ? user.role === "ADMIN"
                    ? "/admin"
                    : "/dashboard"
                  : "/register"
              }
              className="px-9 py-4 rounded-full font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "#D4A853",
                color: "#0A1628",
              }}
            >
              {status === "authenticated" && user
                ? t(
                    user.role === "ADMIN"
                      ? "account.adminPanel"
                      : "account.portal"
                  )
                : t("hero.start")}
            </Link>

            <Link
              to="/#courses"
              className="px-9 py-4 rounded-full font-semibold text-base border transition-all duration-200 hover:border-accent-gold hover:text-accent-gold"
              style={{
                borderColor: "#4A5A70",
                color: "#F0EDE5",
              }}
            >
              {t("hero.courses")}
            </Link>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-20"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transitionDelay: "600ms",
            }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="font-serif text-4xl font-medium"
                  style={{
                    color: "#F0EDE5",
                    letterSpacing: "-1px",
                  }}
                >
                  {stat.number}
                </div>
                <div className="text-sm mt-1" style={{ color: "#8A9AB0" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div
            className="relative w-[1px] h-8"
            style={{ backgroundColor: "#4A5A70" }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full animate-scroll-dot"
              style={{ backgroundColor: "#D4A853" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
