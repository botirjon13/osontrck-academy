import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCompletionReviews,
  fetchFinalTestReviews,
  reviewCompletion,
  reviewFinalTest,
} from "../lib/api";
import type { CourseCompletionReview, FinalTestReview } from "../lib/api";

export default function CourseReviewQueue() {
  const navigate = useNavigate();
  const [completions, setCompletions] = useState<CourseCompletionReview[]>([]);
  const [tests, setTests] = useState<FinalTestReview[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      throw new Error("Sessiya tugagan. Qayta tizimga kiring.");
    }
    const [completionReviews, finalTestReviews] = await Promise.all([
      fetchCompletionReviews(token),
      fetchFinalTestReviews(token),
    ]);
    return { completionReviews, finalTestReviews };
  }, [navigate]);

  useEffect(() => {
    let active = true;
    loadReviews()
      .then(({ completionReviews, finalTestReviews }) => {
        if (!active) return;
        setCompletions(completionReviews);
        setTests(finalTestReviews);
      })
      .catch((loadError: unknown) => {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Arizalarni yuklab bo‘lmadi.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadReviews]);

  const decide = async (
    kind: "completion" | "test",
    id: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (kind === "completion") {
        await reviewCompletion(token, id, status, feedback[id]);
        setCompletions((current) =>
          current.filter((review) => review.id !== id),
        );
      } else {
        await reviewFinalTest(token, id, status, feedback[id]);
        setTests((current) => current.filter((review) => review.id !== id));
      }
      setFeedback((current) => ({ ...current, [id]: "" }));
      setMessage(
        status === "APPROVED"
          ? "Kurs yakunlanishi tasdiqlandi, sertifikat berildi."
          : "Ariza qaytarildi.",
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

  const renderReview = (
    id: string,
    courseTitle: string,
    studentName: string | null,
    studentEmail: string,
    details: string,
    kind: "completion" | "test",
  ) => (
    <article
      key={id}
      className="rounded-xl border border-white/10 bg-black/10 p-4"
    >
      <h4 className="font-semibold">{courseTitle}</h4>
      <p className="mt-1 text-sm text-slate-300">
        {studentName || studentEmail}
      </p>
      <p className="mt-2 text-sm text-yellow-100">{details}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void decide(kind, id, "APPROVED")}
          className="rounded-lg bg-emerald-400/15 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-400/25 disabled:opacity-50"
        >
          Tasdiqlash
        </button>
        <input
          required
          minLength={5}
          maxLength={5000}
          aria-label="Qaytarish sababi"
          placeholder="Qaytarish sababi"
          value={feedback[id] ?? ""}
          onChange={(event) =>
            setFeedback((current) => ({ ...current, [id]: event.target.value }))
          }
          className="min-w-56 flex-1 rounded-lg border border-white/15 bg-[#091426] px-3 py-2 text-sm text-white placeholder:text-slate-500"
        />
        <button
          type="button"
          disabled={saving || (feedback[id] ?? "").trim().length < 5}
          onClick={() => void decide(kind, id, "REJECTED")}
          className="rounded-lg border border-red-300/30 px-3 py-2 text-sm text-red-200 hover:bg-red-400/10 disabled:opacity-50"
        >
          Qaytarish
        </button>
      </div>
    </article>
  );

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div>
        <h3 className="text-lg font-semibold">Kurs yakunlarini tasdiqlash</h3>
        <p className="mt-1 text-sm text-slate-400">
          Pullik kurslar uchun test natijasi yoki kurs yakunini ko‘rib chiqing.
        </p>
      </div>
      {error && (
        <p
          className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200"
          role="status"
        >
          {message}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-slate-400" role="status">
          Arizalar yuklanmoqda...
        </p>
      ) : (
        <>
          <div className="space-y-3">
            <h4 className="font-medium">Yakuniy testlar ({tests.length})</h4>
            {tests.map((review) =>
              renderReview(
                review.id,
                review.course.title,
                review.user.fullName,
                review.user.email,
                `Natija: ${review.score}%`,
                "test",
              ),
            )}
            {tests.length === 0 && (
              <p className="text-sm text-slate-500">Kutilayotgan test yo‘q.</p>
            )}
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">
              Darslari tugagan kurslar ({completions.length})
            </h4>
            {completions.map((review) =>
              renderReview(
                review.id,
                review.course.title,
                review.user.fullName,
                review.user.email,
                "O‘quvchi kursni tugatganini tasdiqlashni so‘radi.",
                "completion",
              ),
            )}
            {completions.length === 0 && (
              <p className="text-sm text-slate-500">
                Kutilayotgan kurs yakuni yo‘q.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
