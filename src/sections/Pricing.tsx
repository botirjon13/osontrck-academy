import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchPublishedCourses } from "../lib/api";
import type { Course } from "../lib/api";

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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

  useEffect(() => {
    let active = true;
    fetchPublishedCourses()
      .then((publishedCourses) => {
        if (active) setCourses(publishedCourses);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t("courses.catalogError")
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="px-6 py-24 md:py-[100px]"
      style={{ backgroundColor: "#0A1628" }}
    >
      <div
        className="mx-auto max-w-[760px] rounded-[20px] border border-yellow-500/20 bg-[#162236] p-8 text-center transition-all duration-700 md:p-12"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
        }}
      >
        <span className="text-xs font-medium uppercase tracking-[2px] text-yellow-400">
          {t("pricing.badge")}
        </span>
        <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-[#F0EDE5] md:text-[40px]">
          {t("pricing.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-[#8A9AB0]">
          {t("pricing.currentDescription")}
        </p>

        {loading ? (
          <p className="mt-8 text-gray-300" role="status">
            {t("courses.loading")}
          </p>
        ) : error ? (
          <p className="mt-8 text-red-300" role="alert">
            {error}
          </p>
        ) : courses.length === 0 ? (
          <p className="mt-8 text-gray-300">{t("courses.noneAvailable")}</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <article
                key={course.id}
                className="rounded-xl border border-white/10 bg-black/10 p-6"
              >
                <p className="text-sm text-gray-300">
                  {t("pricing.currentCourse")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {course.slug === "rest-api-basics"
                    ? t("courses.rest.title")
                    : course.title}
                </h3>
                <p className="mt-3 text-2xl font-bold text-yellow-400">
                  {course.isFree ? t("courses.free") : t("courses.paid")}
                </p>
              </article>
            ))}
          </div>
        )}

        <p className="mt-5 text-sm text-gray-400">
          {t("pricing.futureCoursePricing")}
        </p>
        <Link
          to="/courses/rest-api-basics"
          className="mt-7 inline-flex rounded-full bg-[#D4A853] px-7 py-3 font-semibold text-[#0A1628] transition hover:scale-[1.02]"
        >
          {t("pricing.viewCourse")}
        </Link>
      </div>
    </section>
  );
}
