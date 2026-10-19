import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchCourseContent,
  markCourseLessonComplete,
  submitCourseFinalTest,
} from "../lib/api";
import type { LearningCourse } from "../lib/api";

export default function CourseLearning() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !slug) {
      return;
    }
    let active = true;
    fetchCourseContent(token, slug)
      .then((result) => {
        if (active) {
          setCourse(result);
          setAnswers(result.finalQuestions.map(() => -1));
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t("courses.manage.contentError"),
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

  const reloadCourse = async () => {
    if (!token || !slug) return;
    const updatedCourse = await fetchCourseContent(token, slug);
    setCourse(updatedCourse);
    setAnswers(updatedCourse.finalQuestions.map(() => -1));
  };

  const completeLesson = async (lessonId: string) => {
    if (!token || !slug) return;
    setActionBusy(true);
    setError(null);
    setCompletionNotice(null);
    try {
      const result = await markCourseLessonComplete(token, slug, lessonId);
      await reloadCourse();
      if (result.completion === "CERTIFICATE_ISSUED") {
        setCompletionNotice("Kurs yakunlandi — sertifikatingiz tayyor.");
      } else if (result.completion === "FINAL_TEST_REQUIRED") {
        setCompletionNotice(
          "Barcha darslar tugadi. Endi yakuniy testni topshiring.",
        );
      }
    } catch (actionError: unknown) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Darsni yakunlab bo‘lmadi.",
      );
    } finally {
      setActionBusy(false);
    }
  };

  const submitFinalTest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !slug || answers.some((answer) => answer < 0)) return;
    setActionBusy(true);
    setError(null);
    setCompletionNotice(null);
    try {
      const result = await submitCourseFinalTest(token, slug, answers);
      await reloadCourse();
      setCompletionNotice(
        result.completion === "CERTIFICATE_ISSUED"
          ? `Test natijasi: ${result.score}%. Sertifikat berildi.`
          : result.completion === "PENDING_REVIEW"
            ? `Test natijasi: ${result.score}%. Moderator tasdig‘ini kutmoqda.`
            : `Test natijasi: ${result.score}%. O‘tish uchun ${course?.passingScore}% kerak; qayta urinib ko‘ring.`,
      );
    } catch (actionError: unknown) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Testni yuborib bo‘lmadi.",
      );
    } finally {
      setActionBusy(false);
    }
  };

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
          <p
            className="mt-8 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-red-200"
            role="alert"
          >
            {t("account.sessionExpired")}
          </p>
        ) : loading ? (
          <p className="mt-8 text-slate-300" role="status">
            {t("courses.loading")}
          </p>
        ) : error ? (
          <p
            className="mt-8 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : course ? (
          <>
            <header className="mt-8 border-b border-white/10 pb-6">
              <p className="text-sm text-yellow-200">
                {course.instructor?.fullName || t("courses.manage.instructor")}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>
              <p className="mt-3 leading-6 text-slate-300">
                {course.description}
              </p>
              <p className="mt-4 text-sm text-slate-300">
                Bajarilgan darslar:{" "}
                {
                  course.lessons.filter(
                    (lesson) => lesson.completions.length > 0,
                  ).length
                }
                /{course.lessons.length}
              </p>
            </header>
            {error && (
              <p
                className="mt-5 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200"
                role="alert"
              >
                {error}
              </p>
            )}
            {completionNotice && (
              <p
                className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm text-emerald-200"
                role="status"
              >
                {completionNotice}
              </p>
            )}
            {course.certificates[0] && (
              <div className="mt-5 rounded-xl border border-yellow-300/20 bg-yellow-300/5 p-4 text-sm text-yellow-100">
                {course.certificates[0].recipientName} uchun sertifikat berilgan
                · Kod: <strong>{course.certificates[0].code}</strong>
              </div>
            )}
            {course.completionReviews.map((review) => (
              <div
                key={review.id}
                className="mt-4 rounded-xl border border-sky-300/20 bg-sky-300/5 p-4 text-sm text-sky-100"
              >
                Kurs yakuni moderatorda ko‘rib chiqilmoqda: {review.status}
                {review.feedback ? ` · ${review.feedback}` : ""}
              </div>
            ))}
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
                  {lesson.completions.length > 0 ? (
                    <p className="mt-5 inline-flex items-center rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                      Dars bajarildi
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void completeLesson(lesson.id)}
                      className="mt-5 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
                    >
                      {actionBusy ? "Saqlanmoqda..." : "Darsni tugatdim"}
                    </button>
                  )}
                </article>
              ))}
            </div>
            {!course.isFree &&
              course.finalQuestions.length === 0 &&
              course.lessons.length > 0 &&
              course.lessons.every((lesson) => lesson.completions.length > 0) &&
              course.completionReviews.some(
                (review) => review.status === "REJECTED",
              ) && (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() =>
                    void completeLesson(
                      course.lessons[course.lessons.length - 1].id,
                    )
                  }
                  className="mt-6 rounded-xl border border-yellow-300/30 px-4 py-3 text-sm text-yellow-100 hover:bg-yellow-300/10 disabled:opacity-50"
                >
                  Qayta ko‘rib chiqishga yuborish
                </button>
              )}
            {course.finalQuestions.length > 0 && (
              <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
                <h2 className="text-xl font-semibold">Yakuniy test</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Sertifikat olish uchun kamida {course.passingScore}% natija
                  kerak.
                </p>
                {course.certificates.length === 0 &&
                  (course.finalTestAttempts.some(
                    (attempt) => attempt.status === "PENDING_REVIEW",
                  ) ? (
                    <p className="mt-5 rounded-xl border border-sky-300/20 bg-sky-300/5 p-4 text-sm text-sky-100">
                      Test topshirildi. Natija moderator tasdig‘ini kutmoqda.
                    </p>
                  ) : (
                    <form
                      onSubmit={(event) => void submitFinalTest(event)}
                      className="mt-6 space-y-6"
                    >
                      {course.finalQuestions.map((question, questionIndex) => (
                        <fieldset key={question.id} className="space-y-3">
                          <legend className="font-medium">
                            {questionIndex + 1}. {question.prompt}
                          </legend>
                          {[
                            question.optionA,
                            question.optionB,
                            question.optionC,
                            question.optionD,
                          ].map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-sm text-slate-300 hover:bg-white/5"
                            >
                              <input
                                required
                                type="radio"
                                name={`question-${question.id}`}
                                checked={answers[questionIndex] === optionIndex}
                                onChange={() =>
                                  setAnswers((current) =>
                                    current.map((answer, index) =>
                                      index === questionIndex
                                        ? optionIndex
                                        : answer,
                                    ),
                                  )
                                }
                                className="mt-1 accent-yellow-300"
                              />
                              {option}
                            </label>
                          ))}
                        </fieldset>
                      ))}
                      <button
                        type="submit"
                        disabled={
                          actionBusy ||
                          course.lessons.some(
                            (lesson) => lesson.completions.length === 0,
                          )
                        }
                        className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionBusy ? "Yuborilmoqda..." : "Testni yakunlash"}
                      </button>
                    </form>
                  ))}
                {course.finalTestAttempts.map((attempt) => (
                  <p key={attempt.id} className="mt-4 text-sm text-slate-300">
                    Oxirgi urinish: {attempt.score}% · {attempt.status}
                    {attempt.reviewFeedback
                      ? ` · ${attempt.reviewFeedback}`
                      : ""}
                  </p>
                ))}
              </section>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
