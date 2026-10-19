import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, Download, ShieldCheck } from "lucide-react";
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
      className="size-[clamp(64px,12vw,120px)]"
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

function formatUzbekDate(value: string): string {
  const date = new Date(value);
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];
  return `${date.getUTCDate()}-${months[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
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
  const issueDate = formatUzbekDate(certificate.issuedAt);

  return (
    <article className="certificate-paper relative mx-auto aspect-[918/648] w-full max-w-6xl overflow-hidden bg-white text-[#14243d] shadow-2xl print:max-w-none print:shadow-none">
      <span
        className="absolute left-[6%] top-0 h-[3px] w-[7%] bg-[#b18b4c]"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-[2%] left-[6%] right-[6%] h-[2px] bg-[#b18b4c]"
        aria-hidden="true"
      />
      <div className="absolute left-[6%] right-[38%] top-[17%] h-px bg-[#d6dce5]" />

      <img
        src="/images/osontrack-certificate-emblem.png"
        alt=""
        aria-hidden="true"
        className="absolute right-[2%] top-[2%] z-0 h-[44%] w-[38%] object-contain"
      />

      <header className="absolute left-[6%] top-[7%] z-10 w-[56%]">
        <p className="font-serif text-[clamp(15px,2.55vw,30px)] leading-tight">
          OsonTrack Academy
        </p>
      </header>

      <section className="absolute left-[6%] right-[6%] top-[24%] z-10">
        <h1 className="font-serif text-[clamp(30px,6.2vw,58px)] uppercase leading-none tracking-wide text-[#ad884d]">
          Sertifikat
        </h1>
        <p className="mt-[3.5%] text-[clamp(9px,1.35vw,13px)] text-[#53627a]">
          Ushbu sertifikat quyidagi tinglovchiga taqdim etiladi
        </p>
        <p className="mt-[1.5%] w-full border-b border-[#b18b4c] pb-[1.1%] font-serif text-[clamp(22px,4.4vw,40px)] leading-tight">
          <span className="inline-block max-w-[90%]">
            {certificate.recipientName}
          </span>
        </p>
        <p className="mt-[3.2%] text-[clamp(9px,1.35vw,13px)] text-[#53627a]">
          kursni muvaffaqiyatli yakunlaganini tasdiqlaydi
        </p>
        <h2 className="mt-[1.6%] max-w-[85%] font-serif text-[clamp(15px,2.8vw,25px)] leading-tight">
          {certificate.course.title}
        </h2>
      </section>

      <footer className="absolute bottom-[3%] left-[6%] right-[6%] z-10 grid grid-cols-[1fr_1fr_clamp(64px,12vw,120px)] items-center gap-x-4 border-t border-[#d6dce5] pt-[1.5%]">
        <div className="self-center">
          <p className="text-[clamp(9px,1.2vw,12px)] text-[#53627a]">
            Berilgan sana:
          </p>
          <p className="mt-1 text-[clamp(10px,1.5vw,15px)] font-semibold text-[#14243d]">
            {issueDate}
          </p>
        </div>
        <div className="self-center">
          <p className="text-[clamp(9px,1.2vw,12px)] text-[#53627a]">
            Sertifikat kodi:
          </p>
          <p className="mt-1 break-all font-mono text-[clamp(10px,1.5vw,15px)] font-semibold uppercase text-[#14243d]">
            {certificate.code}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CertificateQrCode matrix={qrMatrix} />
          <span className="text-center text-[clamp(8px,0.95vw,10px)] font-medium text-[#53627a]">
            Haqiqiyligini tekshirish
          </span>
        </div>
        <p className="absolute bottom-0 left-0 break-all text-[clamp(8px,0.95vw,10px)] text-[#53627a]">
          {verificationUrl}
        </p>
      </footer>
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
        @page { size: A4 landscape; margin: 0; }
        @media print {
          body { background: #fff !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .certificate-page { width: 297mm; height: 210mm; min-height: 0; padding: 12mm !important; }
          .certificate-paper { width: 273mm; height: 192.5mm; aspect-ratio: auto; }
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
              Berilgan sana: {formatUzbekDate(certificate.issuedAt)}
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
