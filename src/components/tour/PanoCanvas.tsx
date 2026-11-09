import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { PanoEngine, type EngineView, type FrameCtx } from "./panoEngine";

export type HotspotSpec = {
  id: string;
  deg: number;
  pitch: number;
  kind: "info" | "next" | "prev";
  label: string;
  sub?: string;
  arrow?: "left" | "right";
};

export type PanoCanvasHandle = {
  show: (src: string, vaovDeg: number, facingDeg: number, instant?: boolean) => Promise<void>;
  setAutoRotate: (v: boolean) => void;
  setFov: (v: number) => void;
  zoomBy: (delta: number) => void;
  reset: (facingDeg: number) => void;
  getView: () => EngineView | null;
};

type Props = {
  hotspots: HotspotSpec[];
  onHotspot: (h: HotspotSpec) => void;
  activeInfo: string | null;
  onInteract?: () => void;
  onView?: (v: EngineView) => void;
  onError?: (message: string) => void;
  className?: string;
};

const ArrowGlyph = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {dir === "right" ? <path d="M5 12h13m-5-5 5 5-5 5" /> : <path d="M19 12H6m5-5-5 5 5 5" />}
  </svg>
);

const PanoCanvas = forwardRef<PanoCanvasHandle, Props>(function PanoCanvas(
  { hotspots, onHotspot, activeInfo, onInteract, onView, onError, className = "" },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<PanoEngine | null>(null);
  const onHotspotRef = useRef(onHotspot);
  const onInteractRef = useRef(onInteract);
  const onViewRef = useRef(onView);
  const onErrorRef = useRef(onError);

  onHotspotRef.current = onHotspot;
  onInteractRef.current = onInteract;
  onViewRef.current = onView;
  onErrorRef.current = onError;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onFrame = (ctx: FrameCtx) => {
      const els = overlayRef.current?.querySelectorAll<HTMLElement>("[data-hs]");
      if (!els) return;
      els.forEach((el) => {
        const deg = Number(el.dataset.deg);
        const pitch = Number(el.dataset.pitch);
        const p = ctx.project(deg, pitch);
        el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = p.visible ? "1" : "0";
        el.style.pointerEvents = p.visible ? "auto" : "none";
        el.style.zIndex = String(Math.max(1, Math.round(p.depth * 100)));
      });
    };
    const engine = new PanoEngine({
      canvas,
      fallback: fallbackRef.current,
      onFrame,
      onView: (v) => onViewRef.current?.(v),
      onInteract: () => onInteractRef.current?.(),
      onError: (m) => onErrorRef.current?.(m),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    show: (src, vaovDeg, facingDeg, instant) => engineRef.current?.show(src, vaovDeg, facingDeg, instant) ?? Promise.resolve(),
    setAutoRotate: (v) => engineRef.current?.setAutoRotate(v),
    setFov: (v) => engineRef.current?.setFov(v),
    zoomBy: (d) => engineRef.current?.zoomBy(d),
    reset: (f) => engineRef.current?.reset(f),
    getView: () => engineRef.current?.getView() ?? null,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={fallbackRef} className="tour-fallback absolute inset-0" aria-hidden />
      <canvas ref={canvasRef} className="tour-canvas absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />
      <div className="tour-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="tour-scanlines pointer-events-none absolute inset-0" aria-hidden />

      <div ref={overlayRef} className="pointer-events-none absolute inset-0">
        {hotspots.map((h) =>
          h.kind === "info" ? (
            <button
              key={h.id}
              type="button"
              data-hs={h.id}
              data-deg={h.deg}
              data-pitch={h.pitch}
              onClick={(e) => {
                e.stopPropagation();
                onHotspotRef.current(h);
              }}
              aria-label={h.label}
              aria-expanded={activeInfo === h.id}
              className={`tour-hs tour-hs-info group ${activeInfo === h.id ? "is-open" : ""}`}
            >
              <span className="tour-info-ring" aria-hidden />
              <span className="tour-info-dot" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </span>
              <span className="tour-tip" role="tooltip">
                <span className="tour-tip-title">{h.label}</span>
                <span className="tour-tip-text">{h.sub}</span>
              </span>
            </button>
          ) : (
            <button
              key={h.id}
              type="button"
              data-hs={h.id}
              data-deg={h.deg}
              data-pitch={h.pitch}
              onClick={(e) => {
                e.stopPropagation();
                onHotspotRef.current(h);
              }}
              aria-label={h.label}
              className="tour-hs tour-hs-nav group"
            >
              <span className="tour-nav-pulse" aria-hidden />
              <span className="tour-nav-disc">
                <ArrowGlyph dir={h.arrow ?? "right"} />
              </span>
              <span className="tour-nav-label">
                {h.label}
                {h.sub ? <span className="tour-nav-sub">{h.sub}</span> : null}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
});

export default PanoCanvas;
