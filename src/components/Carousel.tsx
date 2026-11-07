import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { IconArrow } from "./Icons";

export function useRail() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState({ start: true, end: false, progress: 0 });
  const { dir } = useStore();

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = dir === "rtl" ? -el.scrollLeft : el.scrollLeft;
    setState({
      start: pos <= 4,
      end: pos >= max - 4,
      progress: max > 0 ? Math.min(100, (pos / max) * 100) : 100,
    });
  }, [dir]);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const id = window.setTimeout(measure, 400);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.clearTimeout(id);
    };
  }, [measure]);

  const scrollBy = useCallback(
    (direction: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      const amount = Math.max(280, el.clientWidth * 0.78);
      el.scrollBy({ left: direction * (dir === "rtl" ? -amount : amount), behavior: "smooth" });
    },
    [dir],
  );

  return { ref, ...state, scrollBy };
}

export function RailArrows({
  onPrev,
  onNext,
  disabledPrev,
  disabledNext,
  dark = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  disabledPrev: boolean;
  disabledNext: boolean;
  dark?: boolean;
}) {
  const base = `grid h-11 w-11 place-items-center rounded-full border transition-all duration-300 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30`;
  const skin = dark
    ? "border-white/25 text-white hover:border-sun hover:bg-sun hover:text-ink"
    : "border-line bg-white text-ink hover:border-ikea hover:bg-ikea hover:text-white";
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onPrev} disabled={disabledPrev} aria-label="previous" className={`${base} ${skin}`}>
        <IconArrow className="h-4 w-4 rotate-180 rtl:rotate-0" />
      </button>
      <button type="button" onClick={onNext} disabled={disabledNext} aria-label="next" className={`${base} ${skin}`}>
        <IconArrow className="h-4 w-4 rtl:rotate-180" />
      </button>
    </div>
  );
}

export function RailProgress({ progress, dark = false }: { progress: number; dark?: boolean }) {
  return (
    <div className={`mt-6 h-[3px] w-full overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-line"}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-200 ${dark ? "bg-sun" : "bg-ikea"}`}
        style={{ width: `${Math.max(8, progress)}%` }}
      />
    </div>
  );
}
