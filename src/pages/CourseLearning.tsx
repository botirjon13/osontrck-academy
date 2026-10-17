import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchCourseContent } from "../lib/api";
import type { LearningCourse } from "../lib/api";

export default function CourseLearning() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !slug) {
      return;
    }
    let active = true;
    fetchCourseContent(token, slug)
      .then((result) => {
        if (active) setCourse(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t("courses.manage.contentError")
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, t, token]);

  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="text-sm text-yellow-200 hover:text-yellow-100"
        >
          ← {t("account.myCourses")}
        </Link>
        {!token || !slug ? (
          <p className="mt-8 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-red-200" role="alert">
            {t("account.sessionExpired")}
          </p>
        ) : loading ? (
          <p className="mt-8 text-slate-300" role="status">
            {t("courses.loading")}
          </p>
        ) : error ? (
          <p className="mt-8 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-red-200" role="alert">
            {error}
          </p>
        ) : course ? (
          <>
            <header className="mt-8 border-b border-white/10 pb-6">
              <p className="text-sm text-yellow-200">
                {course.instructor?.fullName || t("courses.manage.instructor")}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>
              <p className="mt-3 leading-6 text-slate-300">{course.description}</p>
            </header>
            <div className="mt-8 space-y-6">
              {course.lessons.map((lesson, index) => (
                <article
                  key={lesson.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-yellow-200">
                    {t("courses.manage.lessonNumber", { number: index + 1 })}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{lesson.title}</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {lesson.content}
                  </p>
                  {lesson.videoUrl && (
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex rounded-lg border border-yellow-300/30 px-4 py-2 text-sm text-yellow-100 hover:bg-yellow-300/10"
                    >
                      {t("courses.manage.openVideo")}
                    </a>
                  )}
                  {lesson.resources.length > 0 && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <h3 className="text-sm font-semibold">
                        {t("courses.manage.files")}
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {lesson.resources.map((resource) => (
                          <li key={resource.id}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-sky-200 underline underline-offset-4 hover:text-sky-100"
                            >
                              {resource.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
