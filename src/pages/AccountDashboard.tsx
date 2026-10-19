import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  BookPlus,
  CheckCircle2,
  Clock3,
  LifeBuoy,
  LogOut,
  Mail,
  Megaphone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/auth-context";
import SupportCenter from "../components/SupportCenter";
import CourseManagement from "../components/CourseManagement";
import AdsManagement from "../components/AdsManagement";
import AdvertisementCarousel from "../components/AdvertisementCarousel";
import CertificatesPanel from "../components/CertificatesPanel";
import CourseReviewQueue from "../components/CourseReviewQueue";
import {
  ApiError,
  fetchCurrentUser,
  fetchMyCourses,
  fetchPublishedCourses,
  updateCurrentUser,
} from "../lib/api";
import type { Course, CourseEnrollment } from "../lib/api";

type AccountTab =
  | "courses"
  | "profile"
  | "certificates"
  | "support"
  | "course-management"
  | "ads";

const tabs: Array<{
  id: AccountTab;
  label: string;
  icon: typeof BookOpen;
}> = [
  { id: "courses", label: "account.courses", icon: BookOpen },
  { id: "profile", label: "account.profile", icon: UserRound },
  { id: "certificates", label: "account.certificates", icon: Award },
  { id: "support", label: "account.support", icon: LifeBuoy },
  {
    id: "course-management",
    label: "account.courseManagement",
    icon: BookPlus,
  },
  { id: "ads", label: "Reklamalar", icon: Megaphone },
];

export default function AccountDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const selectedTab = searchParams.get("tab");
  const availableTabs =
    user?.role === "MODERATOR"
      ? tabs
      : tabs.filter(
          (tab) => tab.id !== "course-management" && tab.id !== "ads",
        );
  const activeTab: AccountTab = availableTabs.some(
    (tab) => tab.id === selectedTab,
  )
    ? (selectedTab as AccountTab)
    : "courses";

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );
  const [coursesError, setCoursesError] = useState<string | null>(() =>
    localStorage.getItem("token") ? null : "sessionExpired",
  );
  const [name, setName] = useState(user?.fullName ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let active = true;
    Promise.all([
      fetchPublishedCourses(),
      fetchMyCourses(token),
      fetchCurrentUser(token),
    ])
      .then(([publishedCourses, myCourses, refreshedUser]) => {
        if (!active) return;
        setCourses(publishedCourses);
        setEnrollments(myCourses);
        updateUser(refreshedUser);
        setCoursesError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setCoursesError(
          loadError instanceof Error
            ? loadError.message
            : t("account.coursesLoadError"),
        );
      })
      .finally(() => {
        if (active) setCoursesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t, updateUser]);

  const changeTab = (tab: AccountTab) => {
    setSearchParams(tab === "courses" ? {} : { tab });
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileError(t("account.sessionExpired"));
      return;
    }

    setProfileSaving(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      const updatedUser = await updateCurrentUser(token, name.trim());
      updateUser(updatedUser);
      setName(updatedUser.fullName ?? "");
      setProfileMessage(t("account.profileSaved"));
    } catch (saveError: unknown) {
      setProfileError(
        saveError instanceof ApiError && saveError.status === 401
          ? t("account.sessionExpired")
          : saveError instanceof Error
            ? saveError.message
            : t("account.profileSaveError"),
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const enrolledSlugs = new Set(
    enrollments.map((enrollment) => enrollment.course.slug),
  );
  const completedCourses =
    enrolledSlugs.has("rest-api-basics") && user?.mission1 ? 1 : 0;

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col md:flex-row">
        <aside className="border-b border-white/10 bg-[#0a1628] p-5 md:w-72 md:border-b-0 md:border-r md:p-7">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-left text-xl font-bold tracking-tight transition hover:text-yellow-300"
          >
            OsonTrack <span className="text-yellow-400">Academy</span>
          </button>
          <p className="mt-2 text-sm text-slate-400">{t("account.portal")}</p>

          <nav
            aria-label={t("account.navigation")}
            className="mt-7 flex gap-2 overflow-x-auto md:flex-col"
          >
            {availableTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => changeTab(id)}
                aria-current={activeTab === id ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === id
                    ? "bg-yellow-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {t(label)}
              </button>
            ))}
          </nav>

          <div className="mt-7 hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:block">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-yellow-400/15 text-yellow-300">
                <UserRound size={19} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.fullName || t("account.user")}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 md:flex-col">
            {user?.role === "ADMIN" && (
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:border-yellow-400/40 hover:text-white"
              >
                <ShieldCheck size={17} aria-hidden="true" />
                {t("account.adminPanel")}
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-400/10 hover:text-red-200"
            >
              <LogOut size={17} aria-hidden="true" />
              {t("dashboard.logout")}
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 md:px-10 md:py-10">
          <AdvertisementCarousel />
          <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-300">
                {t("account.welcome")}, {user?.fullName || t("account.user")}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {t("account.title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {t("account.subtitle")}
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              {t(`account.role.${user?.role ?? "STUDENT"}`)}
            </div>
          </header>

          {activeTab === "courses" && (
            <div>
              <div className="mb-7 grid gap-4 sm:grid-cols-3">
                <StatCard
                  label={t("account.enrolled")}
                  value={enrollments.length}
                  icon={<BookOpen size={19} aria-hidden="true" />}
                />
                <StatCard
                  label={t("account.completed")}
                  value={completedCourses}
                  icon={<CheckCircle2 size={19} aria-hidden="true" />}
                />
                <StatCard
                  label={t("account.totalXp")}
                  value={user?.xp ?? 0}
                  icon={<Award size={19} aria-hidden="true" />}
                />
              </div>

              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {t("account.myCourses")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {t("account.myCoursesHint")}
                  </p>
                </div>
              </div>

              {coursesLoading ? (
                <p
                  className="rounded-2xl border border-white/10 p-6 text-slate-300"
                  role="status"
                >
                  {t("account.loadingCourses")}
                </p>
              ) : coursesError ? (
                <div className="rounded-2xl border border-red-400/30 bg-red-400/5 p-6">
                  <p className="text-sm text-red-200" role="alert">
                    {coursesError === "sessionExpired"
                      ? t("account.sessionExpired")
                      : coursesError}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg border border-red-300/30 px-4 py-2 text-sm text-red-100 hover:bg-red-300/10"
                  >
                    {t("account.retry")}
                  </button>
                </div>
              ) : courses.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                  <BookOpen
                    className="mx-auto text-yellow-300"
                    size={28}
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold">{t("account.noCourses")}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {t("account.noCoursesHint")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {courses.map((course) => {
                    const enrolled = enrolledSlugs.has(course.slug);
                    const completed =
                      enrolled &&
                      course.slug === "rest-api-basics" &&
                      Boolean(user?.mission1);
                    return (
                      <article
                        key={course.id}
                        className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 transition hover:border-yellow-300/30 sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-medium text-yellow-200">
                            {course.slug === "rest-api-basics"
                              ? t("courses.rest.level")
                              : course.level}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs ${completed ? "text-emerald-300" : enrolled ? "text-sky-200" : "text-slate-400"}`}
                          >
                            {completed ? (
                              <CheckCircle2 size={15} aria-hidden="true" />
                            ) : enrolled ? (
                              <Clock3 size={15} aria-hidden="true" />
                            ) : null}
                            {completed
                              ? t("account.courseCompleted")
                              : enrolled
                                ? t("account.courseInProgress")
                                : t("account.courseNotStarted")}
                          </span>
                        </div>
                        <h3 className="mt-5 text-xl font-semibold">
                          {course.slug === "rest-api-basics"
                            ? t("courses.rest.title")
                            : course.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                          {course.slug === "rest-api-basics"
                            ? t("courses.rest.desc")
                            : course.description}
                        </p>
                        {enrolled && (
                          <div className="mt-5">
                            <div className="mb-2 flex justify-between text-xs text-slate-400">
                              <span>{t("account.progress")}</span>
                              <span>{completed ? "100%" : "0%"}</span>
                            </div>
                            <div
                              className="h-1.5 overflow-hidden rounded-full bg-white/10"
                              role="progressbar"
                              aria-label={t("account.progress")}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={completed ? 100 : 0}
                            >
                              <div
                                className="h-full rounded-full bg-yellow-400 transition-all"
                                style={{ width: completed ? "100%" : "0%" }}
                              />
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              enrolled
                                ? course.slug === "rest-api-basics"
                                  ? "/learning"
                                  : `/learn/${course.slug}`
                                : `/courses/${course.slug}`,
                            )
                          }
                          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
                        >
                          {enrolled
                            ? completed
                              ? t("account.reviewCourse")
                              : t("account.continueCourse")
                            : t("account.viewCourse")}
                          <ArrowRight size={16} aria-hidden="true" />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-3xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  {t("account.profile")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t("account.profileHint")}
                </p>
              </div>
              <form
                onSubmit={(event) => void handleSaveProfile(event)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
              >
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("account.fullName")}
                </label>
                <input
                  id="profile-name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-300/60"
                  placeholder={t("account.fullNamePlaceholder")}
                />

                <div className="mt-5">
                  <label
                    htmlFor="profile-email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    {t("account.email")}
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#07111f]/70 px-4 py-3 text-slate-400">
                    <Mail size={17} aria-hidden="true" />
                    <input
                      id="profile-email"
                      type="email"
                      value={user?.email ?? ""}
                      readOnly
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {t("account.emailReadOnly")}
                  </p>
                </div>

                {profileError && (
                  <p className="mt-4 text-sm text-red-300" role="alert">
                    {profileError}
                  </p>
                )}
                {profileMessage && (
                  <p className="mt-4 text-sm text-emerald-300" role="status">
                    {profileMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={
                    profileSaving ||
                    name.trim().length < 2 ||
                    name.trim() === (user?.fullName ?? "")
                  }
                  className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {profileSaving
                    ? t("account.saving")
                    : t("account.saveProfile")}
                </button>
              </form>
            </div>
          )}

          {activeTab === "certificates" && <CertificatesPanel />}

          {activeTab === "support" && (
            <SupportCenter role={user?.role ?? "STUDENT"} />
          )}

          {activeTab === "course-management" && user?.role === "MODERATOR" && (
            <div className="space-y-8">
              <CourseManagement role="MODERATOR" />
              <CourseReviewQueue />
            </div>
          )}

          {activeTab === "ads" && user?.role === "MODERATOR" && (
            <AdsManagement role="MODERATOR" />
          )}

          <footer className="mt-12 border-t border-white/10 pt-5 text-xs text-slate-500">
            {t("account.footer")} ·{" "}
            {new Intl.DateTimeFormat(i18n.language).format(new Date())}
            {user?.role === "ADMIN" && (
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="ml-3 inline-flex items-center gap-1 text-yellow-300 hover:text-yellow-200"
              >
                {t("account.adminPanel")}
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            )}
          </footer>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-yellow-300">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
    </div>
  );
}
