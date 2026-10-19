import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, BadgeCheck, Download, ShieldCheck } from "lucide-react";
import { verifyCertificate } from "../lib/api";
import type { VerifiedCertificate } from "../lib/api";
import { createQrMatrix } from "../lib/qr-code";

function CertificateQrCode({ matrix }: { matrix: boolean[][] }) {
  const quietZone = 4;
  const dimension = matrix.length + quietZone * 2;

  return (
    <svg
      role="img"
      aria-label="Sertifikatning haqiqiyligini tekshirish QR-kodi"
      viewBox={`0 0 ${dimension} ${dimension}`}
      className="size-32 print:size-36"
      shapeRendering="crispEdges"
    >
      <rect width={dimension} height={dimension} fill="white" />
      {matrix.flatMap((row, rowIndex) =>
        row.map((dark, columnIndex) =>
          dark ? (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex + quietZone}
              y={rowIndex + quietZone}
              width="1"
              height="1"
              fill="#07111f"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function CertificatePaper({
  certificate,
  verificationUrl,
  qrMatrix,
}: {
  certificate: VerifiedCertificate;
  verificationUrl: string;
  qrMatrix: boolean[][];
}) {
  const issueDate = new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(certificate.issuedAt));

  return (
    <article className="certificate-paper relative mx-auto flex min-h-[650px] w-full max-w-5xl flex-col items-center justify-center overflow-hidden border-[12px] border-double border-[#c69a44] bg-white px-8 py-12 text-center text-[#132238] shadow-2xl sm:px-16 print:min-h-0 print:max-w-none print:shadow-none">
      <div
        className="absolute inset-3 border border-[#c69a44]/50"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center">
        <div className="grid size-16 place-items-center rounded-full border-2 border-[#c69a44] text-[#a87b22]">
          <Award size={36} aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.35em] text-[#8a6727]">
          OsonTrack Academy
        </p>
        <h1 className="mt-5 font-serif text-3xl font-bold uppercase tracking-wide sm:text-5xl">
          Sertifikat
        </h1>
        <p className="mt-5 text-sm text-slate-600">
          Ushbu sertifikat quyidagi tinglovchiga taqdim etiladi
        </p>
        <p className="mt-3 max-w-3xl border-b border-[#c69a44] px-5 pb-3 font-serif text-2xl font-semibold sm:text-4xl">
          {certificate.recipientName}
        </p>
        <p className="mt-5 text-sm text-slate-600">
          kursni muvaffaqiyatli yakunlaganini tasdiqlaydi
        </p>
        <h2 className="mt-2 max-w-3xl font-serif text-xl font-semibold text-[#8a6727] sm:text-2xl">
          {certificate.course.title}
        </h2>

        <div className="mt-8 flex w-full max-w-3xl flex-col items-center justify-between gap-6 border-t border-slate-200 pt-6 sm:flex-row sm:text-left">
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              Berilgan sana:{" "}
              <strong className="text-slate-800">{issueDate}</strong>
            </p>
            <p>
              Sertifikat kodi:{" "}
              <strong className="font-mono text-slate-800">
                {certificate.code}
              </strong>
            </p>
            <p className="max-w-md break-all text-[10px]">{verificationUrl}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CertificateQrCode matrix={qrMatrix} />
            <span className="text-[10px] font-medium text-slate-500">
              Haqiqiyligini tekshirish
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CertificatePage({
  verificationOnly = false,
}: {
  verificationOnly?: boolean;
}) {
  const { code } = useParams();
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(
    null,
  );
  const [error, setError] = useState<string | null>(() =>
    code ? null : "Sertifikat kodi ko‘rsatilmagan.",
  );
  const [loading, setLoading] = useState(Boolean(code));
  const verificationUrl = useMemo(
    () =>
      code
        ? new URL(
            `/certificates/verify/${encodeURIComponent(code)}`,
            window.location.origin,
          ).toString()
        : "",
    [code],
  );

  useEffect(() => {
    if (!code) {
      return;
    }
    let active = true;
    verifyCertificate(code)
      .then((result) => {
        if (active) setCertificate(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Sertifikatni tekshirib bo‘lmadi.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [code]);

  const qrResult = useMemo(() => {
    if (verificationOnly || !verificationUrl) {
      return { matrix: null, error: null };
    }
    try {
      return { matrix: createQrMatrix(verificationUrl), error: null };
    } catch (qrGenerationError: unknown) {
      return {
        matrix: null,
        error:
          qrGenerationError instanceof Error
            ? qrGenerationError.message
            : "Sertifikat QR-kodini yaratib bo‘lmadi.",
      };
    }
  }, [verificationOnly, verificationUrl]);

  return (
    <main className="certificate-page min-h-screen bg-[#07111f] px-4 py-8 text-white sm:px-8 print:min-h-0 print:bg-white print:p-0">
      <style>{`
        @page { size: A4 landscape; margin: 12mm; }
        @media print {
          body { background: #fff !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .certificate-paper { width: 100%; height: 186mm; min-height: 0; border-width: 8px; }
        }
      `}</style>
      <div className="no-print mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-yellow-200 hover:text-yellow-100"
        >
          <ShieldCheck size={17} aria-hidden="true" />
          OsonTrack Academy
        </Link>
        {!verificationOnly && certificate && (
          <button
            type="button"
            disabled={!qrResult.matrix}
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} aria-hidden="true" />
            PDF sifatida saqlash
          </button>
        )}
      </div>

      <div className="mx-auto max-w-5xl">
        {loading ? (
          <p
            className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300"
            role="status"
          >
            Sertifikat tekshirilmoqda...
          </p>
        ) : error || !certificate ? (
          <section className="mx-auto max-w-2xl rounded-2xl border border-red-300/20 bg-red-300/5 p-8 text-center">
            <p className="text-lg font-semibold text-red-200">
              Sertifikat tasdiqlanmadi
            </p>
            <p className="mt-3 text-sm text-red-100" role="alert">
              {error || "Ushbu kod bo‘yicha sertifikat topilmadi."}
            </p>
          </section>
        ) : verificationOnly ? (
          <section className="mx-auto max-w-2xl rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-300/10 text-emerald-200">
              <BadgeCheck size={30} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-emerald-100">
              Sertifikat haqiqiy
            </h1>
            <p className="mt-5 text-lg font-semibold">
              {certificate.recipientName}
            </p>
            <p className="mt-2 text-slate-300">{certificate.course.title}</p>
            <p className="mt-3 text-sm text-slate-400">
              Berilgan sana:{" "}
              {new Intl.DateTimeFormat("uz-UZ", {
                dateStyle: "long",
                timeZone: "UTC",
              }).format(new Date(certificate.issuedAt))}
            </p>
            <p className="mt-4 font-mono text-xs text-slate-400">
              Kod: {certificate.code}
            </p>
          </section>
        ) : !qrResult.matrix ? (
          <p
            className="rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200"
            role="alert"
          >
            {qrResult.error ?? "QR-kod hozir mavjud emas."}
          </p>
        ) : (
          <CertificatePaper
            certificate={certificate}
            verificationUrl={verificationUrl}
            qrMatrix={qrResult.matrix}
          />
        )}
      </div>
    </main>
  );
}
