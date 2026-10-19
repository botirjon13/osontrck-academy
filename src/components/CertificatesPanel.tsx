import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { fetchMyCertificates } from "../lib/api";
import type { Certificate } from "../lib/api";

export default function CertificatesPanel() {
  const token = localStorage.getItem("token");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(() =>
    token ? null : "Sessiya tugagan. Qayta tizimga kiring.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    let active = true;
    fetchMyCertificates(token)
      .then((items) => {
        if (active) setCertificates(items);
      })
      .catch((loadError: unknown) => {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Sertifikatlarni yuklab bo‘lmadi.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Sertifikatlarim</h2>
        <p className="mt-1 text-sm text-slate-400">
          Yakunlangan kurslar bo‘yicha berilgan sertifikatlaringiz.
        </p>
      </div>
      {error && (
        <p
          className="rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-slate-400" role="status">
          Sertifikatlar yuklanmoqda...
        </p>
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <Award size={24} className="text-yellow-200" aria-hidden="true" />
          <p className="mt-4 text-sm text-slate-400">
            Hozircha sertifikat yo‘q. Bepul kurslarda yakuniy testdan o‘ting
            yoki barcha darslarni bajaring.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((certificate) => (
            <article
              key={certificate.id}
              className="rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.04] p-5"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-yellow-300/10 text-yellow-200">
                  <Award size={22} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{certificate.course.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Berilgan sana:{" "}
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-yellow-100">
                    Tasdiqlash kodi: {certificate.code}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                    <a
                      href={`/certificates/${encodeURIComponent(certificate.code)}`}
                      className="text-sm text-yellow-100 underline underline-offset-4 hover:text-yellow-50"
                    >
                      Sertifikatni ko‘rish va PDF saqlash
                    </a>
                    <a
                      href={`/certificates/verify/${encodeURIComponent(certificate.code)}`}
                      className="text-sm text-sky-200 underline underline-offset-4 hover:text-sky-100"
                    >
                      Haqiqiyligini tekshirish
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
