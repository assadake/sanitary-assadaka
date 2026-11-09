import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LangSwitch, SectionHead } from "./Bits";
import { IconArrow, IconClock, IconPhone, IconPin, IconWhatsApp } from "./Icons";
import PanoCanvas, { type HotspotSpec, type PanoCanvasHandle } from "./tour/PanoCanvas";
import { prefetchPano, type EngineView } from "./tour/panoEngine";
import {
  IconChevronL,
  IconChevronR,
  IconCompress,
  IconCube,
  IconExpand,
  IconHand,
  IconKeyboard,
  IconPause,
  IconPlay,
  IconReplay,
  IconReset,
  IconRotate,
  IconSpark,
  IconVolume,
  IconVolumeOff,
  IconZoomIn,
  IconZoomOut,
} from "./tour/TourIcons";
import { SCENE_DURATION, TOUR_SCENES, thumbPosition, tourSrc, vaovOf, wrapDeg, type TourScene } from "../data/tour";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "../i18n";
import { goHome } from "../router";
import { useStore } from "../store";

const N = TOUR_SCENES.length;
const MAPS = "https://www.google.com/maps/dir/?api=1&destination=Jumhuriya%20Street%2C%20Tripoli%2C%20Libya";
const pad = (n: number) => String(n).padStart(2, "0");

/* ── small building blocks ─────────────────────────────────────────── */
function Ctrl({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`tour-ctrl ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3.5 shadow-[0_12px_30px_-24px_rgba(0,63,119,0.9)]">
      <p className="font-display text-[22px] font-black leading-none tabular text-ikea sm:text-[26px]">{value}</p>
      <p className="mt-1.5 text-[11.5px] font-medium leading-tight text-ink-soft">{label}</p>
    </div>
  );
}

function Tip({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="group flex gap-4 rounded-[20px] border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ikea/40 hover:shadow-[0_26px_50px_-32px_rgba(0,88,163,0.9)]">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ikea-soft text-ikea transition-colors group-hover:bg-ikea group-hover:text-white">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-[14px] font-black text-ink">{title}</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{text}</p>
      </div>
    </div>
  );
}

/* ── page ──────────────────────────────────────────────────────────── */
export default function Showroom360() {
  const { t, lang, waLink } = useStore();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [rotate, setRotate] = useState(true);
  const [narration, setNarration] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hint, setHint] = useState(true);
  const [soundSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  const panoRef = useRef<PanoCanvasHandle | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const compassNeedleRef = useRef<HTMLSpanElement | null>(null);
  const compassDegRef = useRef<HTMLSpanElement | null>(null);
  const zoomRef = useRef<HTMLSpanElement | null>(null);
  const elapsedRef = useRef(0);
  const firstRef = useRef(true);

  const scene = TOUR_SCENES[index];
  const rtl = lang === "ar";
  const bookLink = waLink(
    rtl
      ? "السلام عليكم، نبي نحجز موعد زيارة للمعرض بعد ما شفت الجولة 360°."
      : "Hello, I'd like to book a showroom visit after taking the 360° tour.",
  );

  /* ── navigation ─────────────────────────────────────────────────── */
  const goTo = useCallback((target: number, keepPlaying = false) => {
    elapsedRef.current = 0;
    if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";
    setIndex(((target % N) + N) % N);
    setActiveInfo(null);
    if (!keepPlaying) setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setStarted(true);
    setPlaying((v) => !v);
  }, []);

  const replay = useCallback(() => {
    elapsedRef.current = 0;
    if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";
    setIndex(0);
    setStarted(true);
    setPlaying(true);
  }, []);

  /* ── engine wiring ──────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadErr(false);
    setActiveInfo(null);
    const s = TOUR_SCENES[index];
    panoRef.current
      ?.show(tourSrc(s.file), vaovOf(s), s.facing, firstRef.current)
      .then(() => !cancelled && setLoading(false))
      .catch(() => {
        if (!cancelled) {
          setLoadErr(true);
          setLoading(false);
        }
      });
    firstRef.current = false;
    return () => {
      cancelled = true;
    };
  }, [index]);

  useEffect(() => {
    panoRef.current?.setAutoRotate(rotate);
  }, [rotate]);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let n = 0;
    const step = () => {
      if (cancelled || n >= TOUR_SCENES.length) return;
      prefetchPano(tourSrc(TOUR_SCENES[n++].file));
      timer = window.setTimeout(step, 420);
    };
    timer = window.setTimeout(step, 1400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const handleView = useCallback((v: EngineView) => {
    const deg = wrapDeg(180 + (v.yaw * 180) / Math.PI);
    if (compassNeedleRef.current) compassNeedleRef.current.style.transform = `rotate(${-deg}deg)`;
    if (compassDegRef.current) compassDegRef.current.textContent = `${String(Math.round(deg)).padStart(3, "0")}°`;
    if (zoomRef.current) zoomRef.current.textContent = `${Math.round(v.hfov)}°`;
  }, []);

  const handleInteract = useCallback(() => {
    setHint(false);
    setActiveInfo(null);
  }, []);

  const handleError = useCallback(() => setSimplified(true), []);

  /* ── guided tour clock ──────────────────────────────────────────── */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      const p = Math.min(1, elapsedRef.current / SCENE_DURATION);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      if (elapsedRef.current >= SCENE_DURATION) {
        elapsedRef.current = 0;
        if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";
        setIndex((i) => (i + 1) % N);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  /* ── optional voice narration (browser TTS, no audio files) ─────── */
  useEffect(() => {
    if (!narration || !soundSupported) return;
    const s = TOUR_SCENES[index];
    const utterance = new SpeechSynthesisUtterance(`${s.title[lang]}. ${s.text[lang]}`);
    utterance.lang = rtl ? "ar-SA" : "en-GB";
    utterance.rate = 0.96;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [narration, soundSupported, index, lang, rtl]);

  /* ── page metadata / shortcuts / fullscreen ─────────────────────── */
  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content;
    document.title = `${t("tour.eyebrow")} — ${t("brand.full")}`;
    if (meta) meta.content = t("tour.text");
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc) meta.content = prevDesc;
    };
  }, [t]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (!hint) return;
    const id = window.setTimeout(() => setHint(false), 8000);
    return () => window.clearTimeout(id);
  }, [hint]);

  const toggleFull = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frameRef.current?.requestFullscreen?.();
    } catch {
      /* fullscreen can be blocked by the browser — ignore */
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          goTo(index + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          goTo(index - 1);
          break;
        case " ":
          e.preventDefault();
          setStarted(true);
          setPlaying((v) => !v);
          break;
        case "+":
        case "=":
          panoRef.current?.zoomBy(-6);
          break;
        case "-":
          panoRef.current?.zoomBy(6);
          break;
        case "Escape":
          setActiveInfo(null);
          break;
        default: {
          const k = e.key.toLowerCase();
          if (k === "f") toggleFull();
          else if (k === "r") panoRef.current?.reset(TOUR_SCENES[index].facing);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, toggleFull]);

  /* ── hotspots ───────────────────────────────────────────────────── */
  const hotspots = useMemo<HotspotSpec[]>(() => {
    const s = TOUR_SCENES[index];
    const next = (index + 1) % N;
    return [
      ...s.points.map((p) => ({
        id: p.id,
        deg: p.deg,
        pitch: p.pitch,
        kind: "info" as const,
        label: p.title[lang],
        sub: p.text[lang],
      })),
      {
        id: `next-${s.id}`,
        deg: s.nextDeg,
        pitch: -9,
        kind: "next" as const,
        label: t("tour.next"),
        sub: TOUR_SCENES[next].title[lang],
        arrow: rtl ? ("left" as const) : ("right" as const),
      },
      {
        id: `prev-${s.id}`,
        deg: s.prevDeg,
        pitch: -9,
        kind: "prev" as const,
        label: t("tour.prev"),
        arrow: rtl ? ("right" as const) : ("left" as const),
      },
    ];
  }, [index, lang, t, rtl]);

  const onHotspot = useCallback(
    (h: HotspotSpec) => {
      if (h.kind === "info") {
        setActiveInfo((v) => (v === h.id ? null : h.id));
        return;
      }
      goTo(h.kind === "next" ? index + 1 : index - 1);
    },
    [index, goTo],
  );

  const jumpTo = useCallback(
    (i: number) => {
      goTo(i);
      document.getElementById("tour-viewer")?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [goTo],
  );

  const tags = rtl ? scene.tags : scene.tagsEn;

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-mist">
      {/* compact top bar */}
      <div className="sticky top-0 z-40 border-b border-line bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => goHome()}
            className="group inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 font-display text-[12.5px] font-bold text-ink transition-colors hover:border-ikea hover:text-ikea"
          >
            <IconArrow className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:rotate-0 rtl:group-hover:translate-x-0.5" />
            <span className="hidden sm:inline">{t("tour.back")}</span>
          </button>

          <div className="mx-auto flex items-center gap-2.5">
            <span className="inline-flex items-center rounded-[7px] bg-ikea p-[3px] shadow-[0_2px_0_0_#003f77]">
              <span className="inline-flex items-center rounded-[50%] bg-sun px-2.5 py-[5px] font-display text-[14px] font-black leading-none text-ikea-deep">
                {rtl ? "تولين" : "TOLIN"}
              </span>
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[12.5px] font-bold text-ink">{t("brand.full")}</span>
              <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-ikea">Tripoli · Libya</span>
            </span>
          </div>

          <div className="ms-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-ikea-soft px-3 py-1.5 font-display text-[10.5px] font-black tracking-[0.16em] text-ikea md:inline-flex">
              360°
            </span>
            <LangSwitch />
            <a
              href={bookLink}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden items-center gap-2 rounded-full bg-leaf px-4 py-2.5 font-display text-[12.5px] font-bold text-white transition-transform hover:scale-[1.03] sm:inline-flex"
            >
              <IconWhatsApp className="h-4 w-4" />
              {t("showroom.wa")}
            </a>
          </div>
        </div>
      </div>

      {/* intro */}
      <header className="mx-auto max-w-[1440px] px-4 pb-8 pt-9 sm:px-6 lg:px-10 lg:pb-10 lg:pt-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 font-display text-[11px] font-black uppercase tracking-[0.22em] text-ikea">
              <span className="h-px w-9 bg-ikea/60" />
              {t("tour.eyebrow")}
            </span>
            <h1 className="font-display text-[clamp(2rem,4.7vw,3.65rem)] font-black leading-[1.09] tracking-tight text-ink">
              {t("tour.title")}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">{t("tour.text")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:w-[400px]">
            <Stat value={pad(N)} label={t("tour.meta1")} />
            <Stat value="360°" label={t("tour.meta2")} />
            <Stat value="≈2" label={t("tour.meta3")} />
          </div>
        </div>
      </header>

      {/* viewer + programme */}
      <section id="tour-viewer" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 sm:px-6 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── immersive frame ── */}
          <div ref={frameRef} className="tour-frame relative isolate overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1220]">
            <PanoCanvas
              ref={panoRef}
              hotspots={hotspots}
              onHotspot={onHotspot}
              activeInfo={activeInfo}
              onInteract={handleInteract}
              onView={handleView}
              onError={handleError}
            />

            {/* cinematic gradients */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-72 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            {/* guided-tour progress */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[3px] bg-white/10">
              <div ref={progressRef} className="tour-progress-fill" />
            </div>

            {/* viewer top bar */}
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3.5 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tour-chip">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sun" />
                  {t("tour.live")}
                </span>
                <span className="tour-chip tabular">
                  {pad(index + 1)} <span className="opacity-50">/</span> {pad(N)}
                </span>
                {simplified && <span className="tour-chip tour-chip-warn">{t("tour.noWebgl")}</span>}
              </div>

              <div className="flex items-center gap-2">
                <div className="tour-compass" title={`${t("tour.step")} ${index + 1}`}>
                  <span ref={compassNeedleRef} className="tour-compass-needle">
                    <span className="tour-compass-arrow" />
                  </span>
                  <span ref={compassDegRef} className="tour-compass-deg tabular">
                    000°
                  </span>
                </div>
                <Ctrl label={t("tour.rotate")} onClick={() => setRotate((v) => !v)} active={rotate}>
                  <IconRotate />
                </Ctrl>
                <Ctrl
                  label={soundSupported ? t("tour.narration") : t("tour.narrationOff")}
                  onClick={() => setNarration((v) => !v)}
                  active={narration}
                  disabled={!soundSupported}
                >
                  {narration ? <IconVolume /> : <IconVolumeOff />}
                </Ctrl>
                <Ctrl label={fullscreen ? t("tour.exitFull") : t("tour.fullscreen")} onClick={toggleFull}>
                  {fullscreen ? <IconCompress /> : <IconExpand />}
                </Ctrl>
              </div>
            </div>

            {/* first-visit hint */}
            {hint && !loading && (
              <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 sm:top-[4.6rem]">
                <span className="tour-hint-pill">
                  <IconHand className="h-4 w-4" />
                  {t("tour.hint")}
                </span>
              </div>
            )}

            {/* edge navigation */}
            <button
              type="button"
              onClick={() => goTo(rtl ? index + 1 : index - 1)}
              aria-label={rtl ? t("tour.next") : t("tour.prev")}
              className="tour-edge tour-edge-l hidden md:grid"
            >
              <IconChevronL className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => goTo(rtl ? index - 1 : index + 1)}
              aria-label={rtl ? t("tour.prev") : t("tour.next")}
              className="tour-edge tour-edge-r hidden md:grid"
            >
              <IconChevronR className="h-6 w-6" />
            </button>

            {/* caption + controls */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 sm:p-5">
              <div key={index} className="tour-caption mb-3 max-w-xl sm:mb-5" aria-live="polite">
                <p className="tour-caption-kicker">{scene.subtitle[lang]}</p>
                <h2 className="mt-1 font-display text-[19px] font-black leading-tight text-white sm:text-[25px]">
                  {scene.title[lang]}
                </h2>
                <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-white/70 sm:line-clamp-3 sm:text-[13.5px]">
                  {scene.text[lang]}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="tour-look">{t("tour.look")}</span>
                  {tags.map((tag) => (
                    <span key={tag} className="tour-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="tour-controls flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? t("tour.pause") : started ? t("tour.resume") : t("tour.play")}
                    className="tour-play-round"
                  >
                    {playing ? <IconPause className="h-4.5 w-4.5" /> : <IconPlay className="h-4.5 w-4.5" />}
                  </button>
                  <Ctrl label={t("tour.prev")} onClick={() => goTo(index - 1)}>
                    {rtl ? <IconChevronR /> : <IconChevronL />}
                  </Ctrl>
                  <Ctrl label={t("tour.next")} onClick={() => goTo(index + 1)}>
                    {rtl ? <IconChevronL /> : <IconChevronR />}
                  </Ctrl>
                  <div className="tour-segments hidden md:flex">
                    {TOUR_SCENES.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`${t("tour.step")} ${i + 1} — ${s.title[lang]}`}
                        title={s.title[lang]}
                        className={`tour-segment ${i === index ? "is-current" : ""} ${i < index ? "is-done" : ""}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span ref={zoomRef} className="tour-zoom tabular">
                    88°
                  </span>
                  <Ctrl label={t("tour.zoomOut")} onClick={() => panoRef.current?.zoomBy(6)}>
                    <IconZoomOut />
                  </Ctrl>
                  <Ctrl label={t("tour.zoomIn")} onClick={() => panoRef.current?.zoomBy(-6)}>
                    <IconZoomIn />
                  </Ctrl>
                  <Ctrl label={t("tour.reset")} onClick={() => panoRef.current?.reset(scene.facing)}>
                    <IconReset />
                  </Ctrl>
                </div>
              </div>
            </div>

            {/* loading / error */}
            {loading && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-[#0b1220]/92 backdrop-blur-sm">
                <div className="text-center">
                  <span className="tour-spinner mx-auto" />
                  <p className="mt-5 font-display text-[15px] font-black text-white">{t("tour.loading")}</p>
                  <p className="mt-1.5 text-[12.5px] text-white/50">{t("tour.loadingSub")}</p>
                </div>
              </div>
            )}
            {loadErr && !loading && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-[#0b1220]/92 p-6 text-center">
                <div>
                  <p className="font-display text-[15px] font-black text-white">{t("tour.error")}</p>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className="mt-4 rounded-full bg-sun px-5 py-2.5 font-display text-[12.5px] font-black text-ink"
                  >
                    {t("tour.replay")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── right column ── */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-[22px] border border-line bg-white p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sun text-ink">
                  <IconSpark className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-[10.5px] font-black uppercase tracking-[0.2em] text-ikea">
                    {t("tour.eyebrow")}
                  </p>
                  <h2 className="font-display text-[16px] font-black text-ink">{t("tour.guide")}</h2>
                </div>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">{t("tour.guideText")}</p>
              <button type="button" onClick={togglePlay} className="tour-play-btn mt-4 w-full">
                {playing ? <IconPause className="h-4.5 w-4.5" /> : <IconPlay className="h-4.5 w-4.5" />}
                <span>{playing ? t("tour.pause") : started ? t("tour.resume") : t("tour.play")}</span>
              </button>
              {started && (
                <button
                  type="button"
                  onClick={replay}
                  className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 font-display text-[12px] font-bold text-ink-soft transition-colors hover:border-ikea hover:text-ikea"
                >
                  <IconReplay />
                  {t("tour.replay")}
                </button>
              )}
            </div>

            <div className="flex-1 rounded-[22px] border border-line bg-white p-4">
              <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
                <h2 className="font-display text-[13.5px] font-black text-ink">{t("tour.program")}</h2>
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft/55 tabular">
                  {pad(index + 1)} / {pad(N)}
                </span>
              </div>
              <p className="mb-3 px-1 text-[11.5px] leading-relaxed text-ink-soft/75">{t("tour.programText")}</p>
              <ol className="tour-program">
                {TOUR_SCENES.map((s, i) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === index ? "step" : undefined}
                      className={`tour-prog-row ${i === index ? "is-active" : ""}`}
                    >
                      <span className="tour-prog-num tabular">{pad(i + 1)}</span>
                      <img
                        src={tourSrc(s.file)}
                        alt=""
                        loading="lazy"
                        className="tour-prog-thumb"
                        style={{ objectPosition: thumbPosition(s.facing) }}
                      />
                      <span className="tour-prog-copy">
                        <span className="tour-prog-title">{s.title[lang]}</span>
                        <span className="tour-prog-sub">{s.subtitle[lang]}</span>
                      </span>
                      <IconArrow className="tour-prog-arrow h-3.5 w-3.5 rtl:rotate-180" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="tour-contact relative overflow-hidden rounded-[22px] bg-ikea p-5 text-white">
              <span aria-hidden className="pointer-events-none absolute -end-6 -top-8 font-display text-[7rem] font-black leading-none text-white/[0.08]">
                360
              </span>
              <div className="relative">
                <p className="font-display text-[10.5px] font-black uppercase tracking-[0.2em] text-sun">
                  TOLIN · Tripoli
                </p>
                <h2 className="mt-2 font-display text-[16px] font-black leading-snug">{t("tour.visit")}</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-white/70">{t("tour.visitText")}</p>
                <a
                  href={bookLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 font-display text-[12.5px] font-bold text-ink transition-colors hover:bg-sun"
                >
                  <IconWhatsApp className="h-4.5 w-4.5 text-leaf" />
                  {t("tour.book")}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* controls tips */}
      <section className="mx-auto mt-14 max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHead kicker="360°" title={t("tour.tips")} />
        <div className="grid gap-4 md:grid-cols-3">
          <Tip icon={<IconHand className="h-5 w-5" />} title={t("tour.tip1t")} text={t("tour.tip1d")} />
          <Tip icon={<IconZoomIn className="h-5 w-5" />} title={t("tour.tip2t")} text={t("tour.tip2d")} />
          <Tip icon={<IconKeyboard className="h-5 w-5" />} title={t("tour.tip3t")} text={t("tour.tip3d")} />
        </div>
      </section>

      {/* gallery of stops */}
      <section className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHead kicker={t("tour.bannerKicker")} title={t("tour.gallery")} text={t("tour.galleryText")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOUR_SCENES.map((s: TourScene, i) => (
            <article
              key={s.id}
              className="group overflow-hidden rounded-[20px] border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-ikea/40 hover:shadow-[0_30px_60px_-38px_rgba(0,63,119,0.95)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0b1220]">
                <img
                  src={tourSrc(s.file)}
                  alt={s.title[lang]}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.12]"
                  style={{ objectPosition: thumbPosition(s.facing) }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
                <span className="absolute start-3 top-3 grid h-8 min-w-8 place-items-center rounded-full bg-white/92 px-2 font-display text-[12px] font-black tabular text-ikea">
                  {pad(i + 1)}
                </span>
                <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 font-display text-[9.5px] font-black tracking-[0.14em] text-white backdrop-blur">
                  <IconCube className="h-3 w-3" />
                  360°
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display text-[14px] font-black leading-snug text-ink">{s.title[lang]}</h3>
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">{s.text[lang]}</p>
                <button
                  type="button"
                  onClick={() => jumpTo(i)}
                  className="mt-3 inline-flex items-center gap-1.5 font-display text-[12px] font-bold text-ikea transition-colors hover:text-ikea-deep"
                >
                  <span className="link-sweep">{t("tour.enter")}</span>
                  <IconArrow className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* real visit band */}
      <section className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-9 lg:p-10">
          <span aria-hidden className="pointer-events-none absolute -bottom-[5vw] end-[4%] font-display text-[18vw] font-black leading-none tracking-tighter text-white/[0.045]">
            360°
          </span>
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-display text-[10.5px] font-black uppercase tracking-[0.18em] text-sun">
                <IconPin className="h-3.5 w-3.5" />
                {t("top.location")}
              </span>
              <h2 className="mt-4 font-display text-[clamp(1.5rem,3vw,2.3rem)] font-black leading-tight">
                {t("tour.visit")}
              </h2>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/60">{t("tour.visitText")}</p>
              <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2.5 text-[12.5px] text-white/70">
                <li className="flex items-center gap-2">
                  <IconPin className="h-4 w-4 text-sun" />
                  {t("showroom.addressVal")}
                </li>
                <li className="flex items-center gap-2">
                  <IconClock className="h-4 w-4 text-sun" />
                  {t("showroom.hoursVal")}
                </li>
                <li className="flex items-center gap-2">
                  <IconPhone className="h-4 w-4 text-sun" />
                  <span className="tabular">{WHATSAPP_DISPLAY}</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3 lg:flex-col">
              <a
                href={bookLink}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf px-5 py-3.5 font-display text-[13px] font-bold text-white transition-transform hover:scale-[1.02]"
              >
                <IconWhatsApp className="h-5 w-5" />
                {t("tour.book")}
              </a>
              <a
                href={MAPS}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3.5 font-display text-[13px] font-bold text-white/85 transition-colors hover:border-sun hover:text-sun"
              >
                <IconPin className="h-4.5 w-4.5" />
                {t("tour.directions")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* compact footer */}
      <footer className="mt-16 border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-7 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => goHome()}
            className="inline-flex items-center gap-2 font-display text-[12.5px] font-bold text-ikea hover:text-ikea-deep"
          >
            <IconArrow className="h-4 w-4 rotate-180 rtl:rotate-0" />
            {t("tour.back")}
          </button>
          <p className="text-[11.5px] text-ink-soft/70 tabular">
            © {new Date().getFullYear()} {t("brand.full")} · {t("footer.made")}
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11.5px] text-ink-soft/60 sm:inline tabular">+{WHATSAPP_NUMBER}</span>
            <LangSwitch />
          </div>
        </div>
      </footer>
    </div>
  );
}
