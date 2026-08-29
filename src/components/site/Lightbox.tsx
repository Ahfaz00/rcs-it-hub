import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

import { useMotion } from "@/components/site/MotionProvider";
import { cn } from "@/lib/utils";

export type LightboxImage = { src: string; alt: string };

export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const motion = useMotion();
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const go = useCallback(
    (delta: number) => {
      setZoom(false);
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const current = images[index];
  if (!current) return null;

  function trackPointer(e: MouseEvent<HTMLImageElement>) {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-primary/95 backdrop-blur-sm",
        motion.enabled && "animate-fade-in",
      )}
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 text-primary-foreground">
        <span className="text-xs font-medium tracking-wide">
          {index + 1} / {images.length}
        </span>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setZoom((z) => !z)}
            aria-label={zoom ? "Zoom out" : "Zoom in"}
            className="rounded-md border border-primary-foreground/25 p-2 transition-colors hover:bg-primary-foreground/10"
          >
            {zoom ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="rounded-md border border-primary-foreground/25 p-2 transition-colors hover:bg-primary-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {images.length > 1 ? (
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-3 z-10 rounded-full border border-primary-foreground/25 bg-primary/50 p-2.5 text-primary-foreground transition-transform hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}

        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => !z);
          }}
          onMouseMove={trackPointer}
          style={{ transformOrigin: origin, transitionDuration: `${motion.duration}ms` }}
          className={cn(
            "max-h-full max-w-full select-none object-contain transition-transform ease-out motion-reduce:transition-none",
            zoom ? "scale-[2.2] cursor-zoom-out" : "scale-100 cursor-zoom-in",
            motion.enabled && "animate-fade-in",
          )}
        />

        {images.length > 1 ? (
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-3 z-10 rounded-full border border-primary-foreground/25 bg-primary/50 p-2.5 text-primary-foreground transition-transform hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex justify-center gap-2 overflow-x-auto p-4" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => {
                setZoom(false);
                onIndexChange(i);
              }}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-md border p-1 transition-all",
                i === index
                  ? "border-accent opacity-100"
                  : "border-primary-foreground/25 opacity-60 hover:opacity-100",
              )}
            >
              <img src={img.src} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
