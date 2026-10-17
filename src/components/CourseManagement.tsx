import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  createManagedCourse,
  fetchManagedCourses,
  submitManagedCourse,
  updateManagedCourse,
  updateManagedCourseStatus,
} from "../lib/api";
import type {
  CourseInput,
  CourseLesson,
  CourseStatus,
  ManagedCourse,
  UserRole,
} from "../lib/api";

const newLesson = (): CourseInput["lessons"][number] => ({
  title: "",
  content: "",
  videoUrl: "",
  resources: [],
});

const emptyCourse: CourseInput = {
  slug: "",
  title: "",
  description: "",
  level: "",
  isFree: true,
  lessons: [newLesson()],
};

const statusTranslation: Record<CourseStatus, string> = {
  DRAFT: "courses.manage.status.DRAFT",
  PENDING_REVIEW: "courses.manage.status.PENDING_REVIEW",
  APPROVED: "courses.manage.status.APPROVED",
  PUBLISHED: "courses.manage.status.PUBLISHED",
  REJECTED: "courses.manage.status.REJECTED",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-[#091426] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-yellow-300/60 focus:outline-none";

function slugFromTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CourseManagement({ role }: { role: UserRole }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [form, setForm] = useState<CourseInput>(emptyCourse);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isAdmin = role === "ADMIN";

  const loadCourses = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      throw new Error(t("account.sessionExpired"));
    }
    return fetchManagedCourses(token);
  }, [navigate, t]);

  useEffect(() => {
    let active = true;
    loadCourses()
      .then((result) => {
        if (active) setCourses(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t("courses.manage.loadError")
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadCourses, t]);

  const resetForm = () => {
    setForm(emptyCourse);
    setEditingId(null);
  };

  const saveCourse = async (submitForReview: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const input: CourseInput = {
        ...form,
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        level: form.level.trim(),
        lessons: form.lessons.map((lesson) => ({
          title: lesson.title.trim(),
          content: lesson.content.trim(),
          videoUrl: lesson.videoUrl?.trim() || undefined,
          resources: lesson.resources
            .filter((resource) => resource.title.trim() && resource.url.trim())
            .map((resource) => ({
              title: resource.title.trim(),
              url: resource.url.trim(),
            })),
        })),
      };
      const saved = editingId
        ? await updateManagedCourse(token, editingId, input)
        : await createManagedCourse(token, input);
      const next = submitForReview
        ? await submitManagedCourse(token, saved.id)
        : saved;
      setCourses((current) => [
        next,
        ...current.filter((course) => course.id !== next.id),
      ]);
      resetForm();
      setMessage(
        submitForReview
          ? t("courses.manage.submitted")
          : t("courses.manage.saved")
      );
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t("courses.manage.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveCourse(false);
  };

  const editCourse = (course: ManagedCourse) => {
    setEditingId(course.id);
    setForm({
      slug: course.slug,
      title: course.title,
      description: course.description,
      level: course.level,
      isFree: course.isFree,
      lessons:
        course.lessons.length > 0
          ? course.lessons.map((lesson: CourseLesson) => ({
              title: lesson.title,
              content: lesson.content,
              videoUrl: lesson.videoUrl ?? "",
              resources: lesson.resources.map(({ title, url }) => ({ title, url })),
            }))
          : [newLesson()],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitForReview = async (courseId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await submitManagedCourse(token, courseId);
      setCourses((current) =>
        current.map((course) => (course.id === updated.id ? updated : course))
      );
      setMessage(t("courses.manage.submitted"));
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("courses.manage.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (courseId: string, status: CourseStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateManagedCourseStatus(token, courseId, status, {
        feedback: status === "REJECTED" ? feedback[courseId] : undefined,
      });
      setCourses((current) =>
        current.map((course) => (course.id === updated.id ? updated : course))
      );
      setFeedback((current) => ({ ...current, [courseId]: "" }));
      setMessage(t(`courses.manage.action.${status}`));
    } catch (statusError: unknown) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : t("courses.manage.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  const updateLesson = (
    lessonIndex: number,
    update: Partial<CourseInput["lessons"][number]>
  ) => {
    setForm((current) => ({
      ...current,
      lessons: current.lessons.map((lesson, index) =>
        index === lessonIndex ? { ...lesson, ...update } : lesson
      ),
    }));
  };

  const updateResource = (
    lessonIndex: number,
    resourceIndex: number,
    key: "title" | "url",
    value: string
  ) => {
    const lesson = form.lessons[lessonIndex];
    updateLesson(lessonIndex, {
      resources: lesson.resources.map((resource, index) =>
        index === resourceIndex ? { ...resource, [key]: value } : resource
      ),
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">
          {isAdmin ? t("courses.manage.reviewTitle") : t("courses.manage.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {isAdmin
            ? t("courses.manage.reviewHint")
            : t("courses.manage.instructorHint")}
        </p>
      </header>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-400/5 p-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm text-emerald-200" role="status">
          {message}
        </p>
      )}

      {!isAdmin && (
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
        >
          <h3 className="text-lg font-semibold">
            {editingId ? t("courses.manage.edit") : t("courses.manage.create")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              {t("courses.manage.courseTitle")}
              <input
                required
                minLength={3}
                maxLength={160}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: editingId
                      ? current.slug
                      : slugFromTitle(event.target.value),
                  }))
                }
                className={inputClass}
              />
            </label>
            <label className="text-sm text-slate-300">
              {t("courses.manage.slug")}
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={100}
                value={form.slug}
                onChange={(event) =>
                  setForm({ ...form, slug: event.target.value.toLowerCase() })
                }
                className={inputClass}
              />
            </label>
          </div>
          <label className="block text-sm text-slate-300">
            {t("courses.manage.description")}
            <textarea
              required
              minLength={20}
              maxLength={5000}
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className={inputClass}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              {t("courses.manage.level")}
              <input
                required
                minLength={2}
                maxLength={60}
                value={form.level}
                onChange={(event) =>
                  setForm({ ...form, level: event.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className="text-sm text-slate-300">
              {t("courses.manage.price")}
              <select
                value={String(form.isFree)}
                onChange={(event) =>
                  setForm({ ...form, isFree: event.target.value === "true" })
                }
                className={inputClass}
              >
                <option value="true">{t("courses.manage.free")}</option>
                <option value="false">{t("courses.manage.paidLater")}</option>
              </select>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold">{t("courses.manage.lessons")}</h4>
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    lessons: [...current.lessons, newLesson()],
                  }))
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
              >
                <Plus size={15} aria-hidden="true" />
                {t("courses.manage.addLesson")}
              </button>
            </div>
            {form.lessons.map((lesson, lessonIndex) => (
              <section
                key={lessonIndex}
                className="space-y-3 rounded-xl border border-white/10 bg-black/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h5 className="font-medium">
                    {t("courses.manage.lessonNumber", { number: lessonIndex + 1 })}
                  </h5>
                  {form.lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          lessons: current.lessons.filter(
                            (_, index) => index !== lessonIndex
                          ),
                        }))
                      }
                      aria-label={t("courses.manage.removeLesson")}
                      className="rounded-lg p-2 text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <label className="block text-sm text-slate-300">
                  {t("courses.manage.lessonTitle")}
                  <input
                    required
                    minLength={2}
                    maxLength={160}
                    value={lesson.title}
                    onChange={(event) =>
                      updateLesson(lessonIndex, { title: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  {t("courses.manage.lessonText")}
                  <textarea
                    required
                    minLength={10}
                    maxLength={20000}
                    rows={5}
                    value={lesson.content}
                    onChange={(event) =>
                      updateLesson(lessonIndex, { content: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  {t("courses.manage.videoUrl")}
                  <input
                    type="url"
                    value={lesson.videoUrl ?? ""}
                    onChange={(event) =>
                      updateLesson(lessonIndex, { videoUrl: event.target.value })
                    }
                    placeholder="https://youtube.com/..."
                    className={inputClass}
                  />
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">
                      {t("courses.manage.files")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateLesson(lessonIndex, {
                          resources: [
                            ...lesson.resources,
                            { title: "", url: "" },
                          ],
                        })
                      }
                      className="text-sm text-yellow-200 hover:text-yellow-100"
                    >
                      {t("courses.manage.addFile")}
                    </button>
                  </div>
                  {lesson.resources.map((resource, resourceIndex) => (
                    <div
                      key={resourceIndex}
                      className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
                    >
                      <input
                        aria-label={t("courses.manage.fileTitle")}
                        maxLength={160}
                        value={resource.title}
                        onChange={(event) =>
                          updateResource(
                            lessonIndex,
                            resourceIndex,
                            "title",
                            event.target.value
                          )
                        }
                        placeholder={t("courses.manage.fileTitle")}
                        className={inputClass}
                      />
                      <input
                        aria-label={t("courses.manage.fileUrl")}
                        type="url"
                        value={resource.url}
                        onChange={(event) =>
                          updateResource(
                            lessonIndex,
                            resourceIndex,
                            "url",
                            event.target.value
                          )
                        }
                        placeholder="https://drive.google.com/..."
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateLesson(lessonIndex, {
                            resources: lesson.resources.filter(
                              (_, index) => index !== resourceIndex
                            ),
                          })
                        }
                        aria-label={t("courses.manage.removeFile")}
                        className="mt-2 rounded-lg p-2 text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="text-xs leading-5 text-slate-400">
            {t("courses.manage.linkNotice")}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl border border-white/20 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              {saving ? t("account.saving") : t("courses.manage.saveDraft")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                if (formRef.current?.reportValidity()) {
                  void saveCourse(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
            >
              <Send size={15} aria-hidden="true" />
              {t("courses.manage.submitReview")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:text-white"
              >
                {t("support.cancel")}
              </button>
            )}
          </div>
        </form>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">
          {isAdmin ? t("courses.manage.reviewQueue") : t("courses.manage.myCourses")}
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400" role="status">
            {t("courses.manage.loading")}
          </p>
        ) : courses.length === 0 ? (
          <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">
            {t("courses.manage.empty")}
          </p>
        ) : (
          courses.map((course) => (
            <article
              key={course.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold">{course.title}</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    {course.instructor?.fullName || course.instructor?.email || ""}
                    {" · "}
                    {course.lessons.length} {t("courses.manage.lessonsShort")}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
                  {t(statusTranslation[course.status])}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {course.description}
              </p>
              {course.reviewFeedback && (
                <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">
                  {t("courses.manage.feedback")}: {course.reviewFeedback}
                </p>
              )}
              {isAdmin && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.status === "PENDING_REVIEW" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void changeStatus(course.id, "APPROVED")}
                      className="rounded-lg bg-emerald-400/15 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-400/25 disabled:opacity-50"
                    >
                      {t("courses.manage.approve")}
                    </button>
                  )}
                  {course.status === "APPROVED" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void changeStatus(course.id, "PUBLISHED")}
                      className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
                    >
                      {t("courses.manage.publish")}
                    </button>
                  )}
                  {(course.status === "PENDING_REVIEW" ||
                    course.status === "APPROVED") && (
                    <>
                      <input
                        required
                        minLength={5}
                        maxLength={5000}
                        aria-label={t("courses.manage.rejectReason")}
                        value={feedback[course.id] ?? ""}
                        onChange={(event) =>
                          setFeedback((current) => ({
                            ...current,
                            [course.id]: event.target.value,
                          }))
                        }
                        placeholder={t("courses.manage.rejectReason")}
                        className="min-w-56 flex-1 rounded-lg border border-white/15 bg-[#091426] px-3 py-2 text-sm text-white placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        disabled={saving || (feedback[course.id] ?? "").trim().length < 5}
                        onClick={() => void changeStatus(course.id, "REJECTED")}
                        className="rounded-lg border border-red-300/30 px-3 py-2 text-sm text-red-200 hover:bg-red-400/10 disabled:opacity-50"
                      >
                        {t("courses.manage.requestChanges")}
                      </button>
                    </>
                  )}
                </div>
              )}
              {!isAdmin &&
                (course.status === "DRAFT" || course.status === "REJECTED") && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editCourse(course)}
                      className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/5"
                    >
                      {t("courses.manage.edit")}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void submitForReview(course.id)}
                      className="rounded-lg border border-yellow-300/30 px-3 py-2 text-sm text-yellow-100 hover:bg-yellow-300/10 disabled:opacity-50"
                    >
                      {t("courses.manage.submitReview")}
                    </button>
                  </div>
                )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
