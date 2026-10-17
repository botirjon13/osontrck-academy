import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import {
  archiveChallenge,
  createChallenge,
  fetchAdminOverview,
  fetchChallenges,
  updateChallenge,
} from "../lib/api";
import type {
  AdminOverview,
  Challenge,
  ChallengeDifficulty,
  ChallengeInput,
} from "../lib/api";

const emptyChallenge: ChallengeInput = {
  title: "",
  description: "",
  difficulty: "EASY",
  category: "",
};

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [form, setForm] = useState<ChallengeInput>(emptyChallenge);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChallenges = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      throw new Error("Tizimga qayta kiring.");
    }

    return fetchChallenges(token);
  }, [navigate]);

  const getAdminOverview = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      throw new Error("Tizimga qayta kiring.");
    }

    return fetchAdminOverview(token);
  }, [navigate]);

  useEffect(() => {
    let active = true;
    getChallenges()
      .then((items) => {
        if (active) setChallenges(items);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Challenge’larni yuklash amalga oshmadi."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getChallenges]);

  useEffect(() => {
    let active = true;
    getAdminOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setOverviewError(
            loadError instanceof Error
              ? loadError.message
              : "Foydalanuvchilar statistikasi yuklanmadi."
          );
        }
      })
      .finally(() => {
        if (active) setOverviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getAdminOverview]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      setChallenges(await getChallenges());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Challenge’larni yuklash amalga oshmadi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const resetForm = () => {
    setForm(emptyChallenge);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateChallenge(token, editingId, form);
      } else {
        await createChallenge(token, form);
      }
      resetForm();
      setChallenges(await getChallenges());
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Challenge’ni saqlash amalga oshmadi."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (challenge: Challenge) => {
    setEditingId(challenge.id);
    setForm({
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      category: challenge.category,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleArchive = async (challenge: Challenge) => {
    if (!window.confirm(`“${challenge.title}” challenge’ini arxivlaysizmi?`)) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError(null);
    try {
      await archiveChallenge(token, challenge.id);
      setChallenges((current) =>
        current.filter((item) => item.id !== challenge.id)
      );
      if (editingId === challenge.id) resetForm();
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Challenge’ni arxivlash amalga oshmadi."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#020817] p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-yellow-400">
              OsonTrack Academy
            </p>
            <h1 className="mt-2 text-3xl font-bold">Admin panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
          >
            Chiqish
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Administrator</h2>
          <p className="mt-2 text-gray-300">
            Tizimga {user?.email} manzili bilan ADMIN rolida kirgansiz.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Foydalanuvchilar statistikasi</h2>
          {overviewError && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300" role="alert">
              {overviewError}
            </p>
          )}
          {overviewLoading ? (
            <p className="mt-4 text-gray-300" role="status">Statistika yuklanmoqda...</p>
          ) : overview ? (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Jami foydalanuvchi", overview.stats.totalUsers],
                  ["O‘quvchilar", overview.stats.students],
                  ["Adminlar", overview.stats.admins],
                  ["Mission tugatganlar", overview.stats.mission1Completed],
                  ["Jami XP", overview.stats.totalXp],
                ].map(([label, value]) => (
                  <article
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-yellow-400">
                      {value}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">Yaqinda qo‘shilgan o‘quvchilar</h3>
                {overview.recentStudents.length === 0 ? (
                  <p className="mt-4 text-gray-400">Hozircha o‘quvchilar yo‘q.</p>
                ) : (
                  <table className="mt-4 w-full min-w-[640px] text-left text-sm">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="py-2 pr-4 font-medium">Ism</th>
                        <th className="py-2 pr-4 font-medium">Email</th>
                        <th className="py-2 pr-4 font-medium">XP</th>
                        <th className="py-2 pr-4 font-medium">Mission #1</th>
                        <th className="py-2 font-medium">Ro‘yxatdan o‘tgan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recentStudents.map((student) => (
                        <tr key={student.id} className="border-t border-white/10">
                          <td className="py-3 pr-4">{student.fullName || "—"}</td>
                          <td className="py-3 pr-4">{student.email}</td>
                          <td className="py-3 pr-4">{student.xp}</td>
                          <td className="py-3 pr-4">
                            {student.mission1 ? "Bajarilgan" : "Bajarilmagan"}
                          </td>
                          <td className="py-3">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : !overviewError ? (
            <p className="mt-4 text-gray-400">Statistika mavjud emas.</p>
          ) : null}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-xl font-semibold">
              {editingId ? "Challenge’ni tahrirlash" : "Yangi challenge"}
            </h2>

            <label className="mt-5 block text-sm text-gray-300" htmlFor="challenge-title">
              Nomi
            </label>
            <input
              id="challenge-title"
              required
              maxLength={160}
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-white"
            />

            <label className="mt-4 block text-sm text-gray-300" htmlFor="challenge-description">
              Tavsif
            </label>
            <textarea
              id="challenge-description"
              required
              maxLength={5000}
              rows={5}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-white"
            />

            <label className="mt-4 block text-sm text-gray-300" htmlFor="challenge-category">
              Kategoriya
            </label>
            <input
              id="challenge-category"
              required
              maxLength={100}
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-white"
            />

            <label className="mt-4 block text-sm text-gray-300" htmlFor="challenge-difficulty">
              Qiyinlik
            </label>
            <select
              id="challenge-difficulty"
              value={form.difficulty}
              onChange={(event) =>
                setForm({
                  ...form,
                  difficulty: event.target.value as ChallengeDifficulty,
                })
              }
              className="mt-2 w-full rounded-lg border border-white/15 bg-[#101a2b] px-3 py-2 text-white"
            >
              <option value="EASY">Oson</option>
              <option value="MEDIUM">O‘rta</option>
              <option value="HARD">Qiyin</option>
            </select>

            {error && (
              <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
              >
                {saving ? "Saqlanmoqda..." : editingId ? "Saqlash" : "Yaratish"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10"
                >
                  Bekor qilish
                </button>
              )}
            </div>
          </form>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Challenge’lar</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Faol challenge’lar: {challenges.length}
                </p>
              </div>
              <button
                onClick={() => void handleRefresh()}
                disabled={loading}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              >
                Yangilash
              </button>
            </div>

            {loading ? (
              <p className="mt-6 text-gray-300" role="status">Yuklanmoqda...</p>
            ) : challenges.length === 0 ? (
              <p className="mt-6 text-gray-400">Hozircha faol challenge yo‘q.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {challenges.map((challenge) => (
                  <li
                    key={challenge.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {challenge.category} · {challenge.difficulty}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="rounded-md border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
                        >
                          Tahrirlash
                        </button>
                        <button
                          onClick={() => void handleArchive(challenge)}
                          className="rounded-md border border-red-400/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
                        >
                          Arxivlash
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-300">
                      {challenge.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
