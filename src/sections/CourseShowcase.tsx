import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchPublishedCourses } from "../lib/api";
import type { Course } from "../lib/api";

interface RoadmapCourse {
  key: string;
  slug: string;
  image: string;
  tag: string;
  title: string;
  description: string;
}

export default function CourseShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
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
          setCatalogError(
            loadError instanceof Error
              ? loadError.message
              : t("courses.catalogError")
          );
        }
      })
      .finally(() => {
        if (active) setCoursesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  const roadmap: RoadmapCourse[] = [
    {
      key: "pg",
      slug: "postgresql-for-developers",
      image: "/images/img-postgresql.jpg",
      tag: t("courses.pg.tag"),
      title: t("courses.pg.title"),
      description: t("courses.pg.desc"),
    },
    {
      key: "nestjs",
      slug: "nestjs-typescript",
      image: "/images/img-nestjs.jpg",
      tag: t("courses.nest.tag"),
      title: t("courses.nest.title"),
      description: t("courses.nest.desc"),
    },
    {
      key: "jwt",
      slug: "jwt-authentication",
      image: "/images/img-jwt.jpg",
      tag: t("courses.jwt.tag"),
      title: t("courses.jwt.title"),
      description: t("courses.jwt.desc"),
    },
    {
      key: "testing",
      slug: "testing-deployment",
      image: "/images/img-rest-api.jpg",
      tag: t("courses.testing.tag"),
      title: t("courses.testing.title"),
      description: t("courses.testing.desc"),
    },
  ];

  return (
    <section
      id="courses"
      ref={sectionRef}
      className="px-6 py-24 md:py-[100px]"
      style={{ backgroundColor: "#0A1628" }}
    >
      <div className="mx-auto max-w-[1100px]">
        <div
          className="transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <span
            className="text-xs font-medium uppercase tracking-[2px]"
            style={{ color: "#D4A853" }}
          >
            {t("courses.badge")}
          </span>
          <h2
            className="mt-4 font-serif text-3xl font-semibold leading-[1.12] md:text-[48px]"
            style={{ color: "#F0EDE5", letterSpacing: "-1px" }}
          >
            {t("courses.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px]" style={{ color: "#8A9AB0" }}>
            {t("courses.subtitle")}
          </p>
        </div>

        {coursesLoading ? (
          <p className="mt-10 text-gray-300" role="status">
            {t("courses.loading")}
          </p>
        ) : catalogError ? (
          <p className="mt-10 text-red-300" role="alert">
            {catalogError}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2">
            {courses.map((course, index) => (
              <Link
                key={course.id}
                to={`/courses/${encodeURIComponent(course.slug)}`}
                className="group overflow-hidden rounded-[20px] border border-yellow-500/30 bg-[#162236] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? undefined : "translateY(30px)",
                  transition: `opacity 700ms ease ${100 + index * 100}ms, transform 700ms ease ${100 + index * 100}ms`,
                }}
              >
                <div className="relative h-[220px] overflow-hidden">
                  <img
                    src={
                      course.slug === "rest-api-basics"
                        ? "/images/img-rest-api.jpg"
                        : "/images/img-nestjs.jpg"
                    }
                    alt={
                      course.slug === "rest-api-basics"
                        ? t("courses.rest.title")
                        : course.title
                    }
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                    {t("courses.available")}
                  </span>
                </div>
                <div className="p-7 pb-8">
                  <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                    {course.slug === "rest-api-basics"
                      ? t("courses.rest.tag")
                      : t("courses.available")}
                  </span>
                  <h3 className="mt-3 text-[22px] font-semibold text-[#F0EDE5]">
                    {course.slug === "rest-api-basics"
                      ? t("courses.rest.title")
                      : course.title}
                  </h3>
                  <p className="mt-2 text-[15px] text-[#8A9AB0]">
                    {course.slug === "rest-api-basics"
                      ? t("courses.rest.desc")
                      : course.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#AAB6C6]">
                    <span>
                      {course.slug === "rest-api-basics"
                        ? t("courses.rest.level")
                        : course.level}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {course.isFree ? t("courses.free") : t("courses.paid")}
                    </span>
                  </div>
                  <span className="mt-6 inline-flex rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-[#0A1628] transition group-hover:bg-yellow-400">
                    {t("courses.viewCourse")}
                  </span>
                </div>
              </Link>
            ))}

            {roadmap
              .filter(
                (plannedCourse) =>
                  !courses.some((course) => course.slug === plannedCourse.slug)
              )
              .map((course, index) => (
            <article
              key={course.key}
              aria-label={`${course.title}: ${t("courses.comingSoon")}`}
              className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-[#162236] opacity-80 transition duration-300 hover:opacity-100 motion-reduce:transition-none"
              title={t("courses.comingSoon")}
              style={{
                opacity: visible ? undefined : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 700ms ease ${200 + index * 100}ms, transform 700ms ease ${200 + index * 100}ms`,
              }}
            >
              <div className="relative h-[220px] overflow-hidden">
                <img
                  src={course.image}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover grayscale transition duration-300 group-hover:scale-105 group-hover:animate-gentle-wiggle motion-reduce:animate-none"
                />
                <span className="absolute right-5 top-5 rounded-full border border-yellow-400/40 bg-[#0A1628]/90 px-3 py-1 text-xs font-semibold text-yellow-300">
                  {t("courses.comingSoon")}
                </span>
              </div>
              <div className="p-7 pb-8">
                <span className="inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
                  {course.tag}
                </span>
                <h3 className="mt-3 text-[22px] font-semibold text-[#F0EDE5]">
                  {course.title}
                </h3>
                <p className="mt-2 text-[15px] text-[#8A9AB0]">
                  {course.description}
                </p>
              </div>
            </article>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
