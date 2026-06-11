import { useRef, useEffect, useState } from "react";
import { useFluidLineGrid } from "../hooks/useFluidLineGrid";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useFluidLineGrid(canvasRef);

  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setVisible(true),
      100
    );

    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      number: "12,000+",
      label: t("hero.students"),
    },
    {
      number: "85+",
      label: t("hero.lessons"),
    },
    {
      number: "4.9",
      label: t("hero.rating"),
    },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundColor: "#0A1628",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div
          className="max-w-[720px] mx-auto text-center"
          style={{
            paddingTop: "18vh",
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 transition-all duration-600"
            style={{
              backgroundColor:
                "rgba(212, 168, 83, 0.1)",
              border:
                "1px solid rgba(212, 168, 83, 0.2)",
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateY(0)"
                : "translateY(20px)",
              transitionDelay: "0ms",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />

            <span
              className="text-xs font-medium uppercase tracking-[2px]"
              style={{
                color: "#D4A853",
              }}
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
              transform: visible
                ? "translateY(0)"
                : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transitionDelay: "150ms",
            }}
          >
            {t("hero.title1")}{" "}
            <span
              style={{
                color: "#D4A853",
              }}
            >
              {t("hero.title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl mt-6 mx-auto max-w-[560px]"
            style={{
              color: "#8A9AB0",
              lineHeight: 1.65,
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateY(0)"
                : "translateY(20px)",
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
              transform: visible
                ? "translateY(0)"
                : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transitionDelay: "450ms",
            }}
          >
            <Link
              to="/register"
              className="px-9 py-4 rounded-full font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "#D4A853",
                color: "#0A1628",
              }}
            >
              {t("hero.start")}
            </Link>

            <Link
              to="/login"
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
              transform: visible
                ? "translateY(0)"
                : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transitionDelay: "600ms",
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center"
              >
                <div
                  className="font-serif text-4xl font-medium"
                  style={{
                    color: "#F0EDE5",
                    letterSpacing: "-1px",
                  }}
                >
                  {stat.number}
                </div>

                <div
                  className="text-sm mt-1"
                  style={{
                    color: "#8A9AB0",
                  }}
                >
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
            style={{
              backgroundColor: "#4A5A70",
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full animate-scroll-dot"
              style={{
                backgroundColor: "#D4A853",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
