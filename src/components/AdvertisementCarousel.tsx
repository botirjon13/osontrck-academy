import { useEffect, useState } from "react";
import { fetchActiveAds, trackAdEvent } from "../lib/api";
import type { Advertisement } from "../lib/api";

export default function AdvertisementCarousel() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchActiveAds()
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
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % ads.length),
      8000,
    );
    return () => window.clearInterval(timer);
  }, [ads.length]);

  const ad = ads[index];

  useEffect(() => {
    if (!ad) return;
    trackAdEvent(ad.id, "IMPRESSION").catch((trackingError: unknown) => {
      console.error(
        "Failed to record advertisement impression.",
        trackingError,
      );
    });
  }, [ad]);

  if (!ad) {
    return error ? (
      <p
        className="rounded-xl border border-red-300/20 bg-red-300/5 p-3 text-sm text-red-200"
        role="alert"
      >
        {error}
      </p>
    ) : null;
  }

  return (
    <aside
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
      aria-label="Reklama"
    >
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackAdEvent(ad.id, "CLICK").catch((trackingError: unknown) => {
            console.error(
              "Failed to record advertisement click.",
              trackingError,
            );
          });
        }}
        className="group grid min-h-32 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]"
      >
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-200">
            Hamkor reklama
          </p>
          <h2 className="mt-2 text-lg font-semibold group-hover:text-yellow-100">
            {ad.title}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Batafsil ko‘rish uchun bosing ·{" "}
            {ads.length > 1 ? `${index + 1}/${ads.length}` : ""}
          </p>
        </div>
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="h-36 w-full object-cover sm:h-full"
          loading="lazy"
        />
      </a>
    </aside>
  );
}
