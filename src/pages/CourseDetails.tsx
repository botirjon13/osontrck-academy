import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "../sections/Navigation";
import { useAuth } from "../context/auth-context";
import {
  enrollInCourse,
  fetchMyCourses,
  fetchPublishedCourses,
} from "../lib/api";
import type { Course } from "../lib/api";

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { status } = useAuth();
  const { t } = useTranslation();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    let active = true;

    const load = async () => {
      try {
        const courses = await fetchPublishedCourses();
        const selectedCourse = courses.find((item) => item.slug === slug) ?? null;
        if (active) setCourse(selectedCourse);

        const token = localStorage.getItem("token");
        if (status === "authenticated" && token && selectedCourse) {
          const enrollments = await fetchMyCourses(token);
          if (active) {
            setEnrolled(
              enrollments.some(
                (enrollment) => enrollment.course.slug === selectedCourse.slug
              )
            );
          }
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t("courses.loadError")
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [slug, status, t]);

  const handleEnroll = async () => {
    if (!course) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(`/login?course=${encodeURIComponent(course.slug)}`);
      return;
    }

    setEnrolling(true);
    setError(null);
    try {
      await enrollInCourse(token, course.slug);
      navigate("/learning");
    } catch (enrollError: unknown) {
      setError(
        enrollError instanceof Error
          ? enrollError.message
          : t("courses.enrollError")
      );
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-28">
        <Link
          to="/#courses"
          className="text-sm text-yellow-400 hover:text-yellow-300"
        >
          ← {t("courses.backToCourses")}
        </Link>

        {loading ? (
          <p className="mt-8" role="status">
            {t("courses.loading")}
          </p>
        ) : error && !course ? (
          <p className="mt-8 text-red-300" role="alert">
            {error}
          </p>
        ) : !course ? (
          <p className="mt-8" role="status">
            {t("courses.notFound")}
          </p>
        ) : (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-400">
              {t("courses.available")}
            </span>
            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              {course.slug === "rest-api-basics"
                ? t("courses.rest.title")
                : course.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              {course.slug === "rest-api-basics"
                ? t("courses.rest.desc")
                : course.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-300">
              <span className="rounded-full border border-white/10 px-4 py-2">
                {t("courses.level")}:{" "}
                {course.slug === "rest-api-basics"
                  ? t("courses.rest.level")
                  : course.level}
              </span>
              <span className="rounded-full border border-white/10 px-4 py-2">
                {course.isFree ? t("courses.free") : t("courses.paid")}
              </span>
            </div>

            {course.slug === "rest-api-basics" && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h2 className="text-xl font-semibold">{t("courses.whatYouDo")}</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-300">
                  <li>{t("courses.topic1")}</li>
                  <li>{t("courses.topic2")}</li>
                  <li>{t("courses.topic3")}</li>
                </ul>
              </div>
            )}

            {error && (
              <p className="mt-5 text-sm text-red-300" role="alert">
                {error}
              </p>
            )}

            <div className="mt-8">
              {enrolled ? (
                <button
                  type="button"
                  onClick={() => navigate("/learning")}
                  className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-[#0A1628] transition hover:bg-yellow-400"
                >
                  {t("courses.openCourse")}
                </button>
              ) : !course.isFree ? (
                <p className="text-gray-300">{t("courses.paidUnavailable")}</p>
              ) : status === "unauthenticated" ? (
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={`/register?course=${encodeURIComponent(course.slug)}`}
                    className="inline-flex rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-[#0A1628] transition hover:bg-yellow-400"
                  >
                    {t("courses.registerToStart")}
                  </Link>
                  <Link
                    to={`/login?course=${encodeURIComponent(course.slug)}`}
                    className="text-sm text-yellow-300 underline underline-offset-4 hover:text-yellow-200"
                  >
                    {t("courses.alreadyAccount")}
                  </Link>
                </div>
              ) : status === "error" ? (
                <Link
                  to={`/login?course=${encodeURIComponent(course.slug)}`}
                  className="text-yellow-300 underline underline-offset-4"
                >
                  {t("courses.signInAgain")}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleEnroll()}
                  disabled={enrolling}
                  className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-[#0A1628] transition hover:bg-yellow-400 disabled:cursor-wait disabled:opacity-60"
                >
                  {enrolling
                    ? t("courses.enrolling")
                    : t("courses.enroll")}
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
