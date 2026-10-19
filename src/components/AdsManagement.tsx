import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createManagedAd, fetchManagedAds, reviewManagedAd } from "../lib/api";
import type { Advertisement, UserRole } from "../lib/api";

const initialForm = {
  title: "",
  imageUrl: "",
  targetUrl: "",
  durationDays: 14,
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-[#091426] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-yellow-300/60 focus:outline-none";

const statusLabel: Record<Advertisement["status"], string> = {
  ACTIVE: "Faol",
  PENDING_REVIEW: "Tasdiq kutilmoqda",
  REJECTED: "Rad etilgan",
  EXPIRED: "Muddati tugagan",
};

export default function AdsManagement({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const isAdmin = role === "ADMIN";
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAds = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      throw new Error("Sessiya tugagan. Qayta tizimga kiring.");
    }
    return fetchManagedAds(token);
  }, [navigate]);

  useEffect(() => {
    let active = true;
    loadAds()
      .then((items) => {
        if (active) setAds(items);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Reklamalarni yuklab bo‘lmadi.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAds]);

  const submitAd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const created = await createManagedAd(token, {
        ...form,
        title: form.title.trim(),
      });
      setAds((current) => [created, ...current]);
      setForm(initialForm);
      setMessage(
        isAdmin
          ? "Reklama joylandi."
          : "Taklif adminga yuborildi. Tasdiqlanmaguncha ko‘rinmaydi.",
      );
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Reklamani saqlab bo‘lmadi.",
      );
    } finally {
      setSaving(false);
    }
  };

  const decideAd = async (adId: string, approve: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await reviewManagedAd(
        token,
        adId,
        approve,
        feedback[adId],
      );
      setAds((current) =>
        current.map((ad) => (ad.id === updated.id ? updated : ad)),
      );
      setFeedback((current) => ({ ...current, [adId]: "" }));
      setMessage(
        approve
          ? "Reklama tasdiqlandi va faollashtirildi."
          : "Reklama rad etildi.",
      );
    } catch (reviewError: unknown) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Qarorni saqlab bo‘lmadi.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Reklama boshqaruvi</h2>
        <p className="mt-1 text-sm text-slate-400">
          {isAdmin
            ? "Reklama joylang, moderatorlar taklifini ko‘rib chiqing va natijalarni kuzating."
            : "Reklama taklifini yuboring. Admin tasdiqlagandan keyin platformada ko‘rinadi."}
        </p>
      </header>

      {error && (
        <p
          className="rounded-xl border border-red-400/30 bg-red-400/5 p-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm text-emerald-200"
          role="status"
        >
          {message}
        </p>
      )}

      <form
        onSubmit={(event) => void submitAd(event)}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2"
      >
        <label className="text-sm text-slate-300">
          Reklama sarlavhasi
          <input
            required
            minLength={3}
            maxLength={160}
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            className={fieldClass}
          />
        </label>
        <label className="text-sm text-slate-300">
          Rasm URL manzili
          <input
            required
            type="url"
            value={form.imageUrl}
            onChange={(event) =>
              setForm({ ...form, imageUrl: event.target.value })
            }
            placeholder="https://..."
            className={fieldClass}
          />
        </label>
        <label className="text-sm text-slate-300">
          O‘tish URL manzili
          <input
            required
            type="url"
            value={form.targetUrl}
            onChange={(event) =>
              setForm({ ...form, targetUrl: event.target.value })
            }
            placeholder="https://..."
            className={fieldClass}
          />
        </label>
        <label className="text-sm text-slate-300">
          Joylashish muddati (kun)
          <input
            required
            type="number"
            min={1}
            max={365}
            value={form.durationDays}
            onChange={(event) =>
              setForm({ ...form, durationDays: Number(event.target.value) })
            }
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50 sm:col-span-2"
        >
          {saving
            ? "Saqlanmoqda..."
            : isAdmin
              ? "Reklamani joylash"
              : "Taklifni yuborish"}
        </button>
      </form>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">
          {isAdmin
            ? "Reklamalar va moderator takliflari"
            : "Mening takliflarim"}
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400" role="status">
            Yuklanmoqda...
          </p>
        ) : ads.length === 0 ? (
          <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">
            Hozircha reklama yo‘q.
          </p>
        ) : (
          ads.map((ad) => (
            <article
              key={ad.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold">{ad.title}</h4>
                  {isAdmin && ad.proposedBy && (
                    <p className="mt-1 text-xs text-slate-400">
                      Taklif qildi:{" "}
                      {ad.proposedBy.fullName || ad.proposedBy.email}
                    </p>
                  )}
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
                  {statusLabel[ad.status]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                <span>Ko‘rishlar: {ad.analytics?.impressions ?? 0}</span>
                <span>Bosishlar: {ad.analytics?.clicks ?? 0}</span>
                <span>
                  Bosish foizi:{" "}
                  {(ad.analytics?.impressions ?? 0) > 0
                    ? `${(((ad.analytics?.clicks ?? 0) / (ad.analytics?.impressions ?? 1)) * 100).toFixed(1)}%`
                    : "—"}
                </span>
                <span>Muddati: {new Date(ad.endsAt).toLocaleDateString()}</span>
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-200 underline"
                >
                  Reklama havolasi
                </a>
              </div>
              {ad.reviewFeedback && (
                <p className="mt-3 text-sm text-amber-200">
                  Izoh: {ad.reviewFeedback}
                </p>
              )}
              {isAdmin && ad.status === "PENDING_REVIEW" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void decideAd(ad.id, true)}
                    className="rounded-lg bg-emerald-400/15 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-400/25 disabled:opacity-50"
                  >
                    Tasdiqlash
                  </button>
                  <input
                    required
                    minLength={5}
                    maxLength={5000}
                    aria-label="Rad etish sababi"
                    placeholder="Rad etish sababi"
                    value={feedback[ad.id] ?? ""}
                    onChange={(event) =>
                      setFeedback((current) => ({
                        ...current,
                        [ad.id]: event.target.value,
                      }))
                    }
                    className="min-w-56 flex-1 rounded-lg border border-white/15 bg-[#091426] px-3 py-2 text-sm text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    disabled={
                      saving || (feedback[ad.id] ?? "").trim().length < 5
                    }
                    onClick={() => void decideAd(ad.id, false)}
                    className="rounded-lg border border-red-300/30 px-3 py-2 text-sm text-red-200 hover:bg-red-400/10 disabled:opacity-50"
                  >
                    Rad etish
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
