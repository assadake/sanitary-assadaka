/**
 * Tiny dependency-free 360° panorama renderer.
 *
 * A single full-screen quad is shaded with an inverse-perspective ray: for each
 * pixel we compute the world direction, convert it to (yaw, elevation), and
 * sample the cylindrical equirectangular strip. Two textures can be drawn in the
 * same frame to get a smooth dissolve between scenes, each with its own vertical
 * field of view.
 */

import { degToYaw, wrapDeg } from "../../data/tour";

export type EngineView = { yaw: number; pitch: number; hfov: number };
export type Projection = { x: number; y: number; visible: boolean; depth: number };

export type FrameCtx = {
  view: EngineView;
  width: number;
  height: number;
  project: (deg: number, pitchDeg: number) => Projection;
};

type Options = {
  canvas: HTMLCanvasElement;
  fallback: HTMLDivElement | null;
  onFrame?: (ctx: FrameCtx) => void;
  onView?: (view: EngineView) => void;
  onInteract?: () => void;
  onError?: (message: string) => void;
};

type Texture = { tex: WebGLTexture; vaov: number; key: string };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const RAD = Math.PI / 180;

/* ── small LRU cache for decoded panoramas ─────────────────────────── */
const cache = new Map<string, Promise<HTMLImageElement>>();

export function loadPano(src: string): Promise<HTMLImageElement> {
  let p = cache.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Unable to load ${src}`));
      img.src = src;
    });
    cache.set(src, p);
    // Never hold more than four decoded 6k strips in memory at once.
    if (cache.size > 4) {
      const oldest = cache.keys().next().value as string | undefined;
      if (oldest && oldest !== src) cache.delete(oldest);
    }
  }
  return p;
}

export function prefetchPano(src: string) {
  loadPano(src).catch(() => undefined);
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uYaw;
uniform float uPitch;
uniform float uHfov;
uniform float uAspect;
uniform float uVaov;
uniform float uAlpha;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float th = tan(radians(uHfov) * 0.5);
  float tv = th / uAspect;
  vec3 d = vec3(p.x * th, p.y * tv, 1.0);

  // camera pitch (positive = look up), then yaw
  float cp = cos(uPitch), sp = sin(uPitch);
  vec3 r = vec3(d.x, d.y * cp + d.z * sp, -d.y * sp + d.z * cp);
  float cy = cos(uYaw), sy = sin(uYaw);
  vec3 w = vec3(r.x * cy + r.z * sy, r.y, -r.x * sy + r.z * cy);

  float theta = atan(w.x, w.z);
  float elev = atan(w.y, length(w.xz));
  float u = fract(theta / 6.28318530718 + 0.5);
  float v = 0.5 + elev / uVaov;

  // beyond the photographed strip the last row is softly extended, then
  // dissolved into a dark architectural void (no hard black bands).
  vec3 bg = mix(vec3(0.085, 0.105, 0.145), vec3(0.018, 0.030, 0.050), clamp(vUv.y, 0.0, 1.0));
  vec3 photo = texture2D(uTex, vec2(u, clamp(v, 0.0, 1.0))).rgb;
  float vignette = 1.0 - 0.20 * dot(p * vec2(0.70, 0.85), p * vec2(0.70, 0.85));
  float over = max(0.0, max(-v, v - 1.0));
  float coverage = 1.0 - smoothstep(0.0, 0.16, over);
  vec3 color = mix(bg, photo * vignette, coverage);

  gl_FragColor = vec4(color, uAlpha);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const msg = gl.getShaderInfoLog(shader) || "shader compile error";
    gl.deleteShader(shader);
    throw new Error(msg);
  }
  return shader;
}

export class PanoEngine {
  private canvas: HTMLCanvasElement;
  private fallback: HTMLDivElement | null;
  private opts: Options;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private alive = true;
  private width = 1;
  private height = 1;

  private cur: Texture | null = null;
  private incoming: Texture | null = null;
  private mix = 0;
  private fadeStart = 0;
  private readonly fadeDuration = 850;

  private yaw = 0;
  private pitch = 0;
  private hfov = 88;
  private vYaw = 0;
  private vPitch = 0;
  private autoRotate = false;
  private rotatePauseUntil = 0;
  private tween: {
    fromYaw: number; toYaw: number; fromPitch: number; toPitch: number; start: number; dur: number;
  } | null = null;

  private pointers = new Map<number, { x: number; y: number }>();
  private lastPinch = 0;
  private dragging = false;
  private lastMove = 0;
  private lastViewEmit = 0;
  private lastFrame = 0;
  private ro: ResizeObserver | null = null;
  private showToken = 0;

  constructor(opts: Options) {
    this.opts = opts;
    this.canvas = opts.canvas;
    this.fallback = opts.fallback;
    this.initGL();
    this.attach();
    this.resize();
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.resize());
      // The canvas is hidden in fallback mode; its container still has a size.
      this.ro.observe(this.fallback ?? this.canvas);
    }
    this.lastFrame = performance.now();
    this.loop(this.lastFrame);
  }

  /* ── WebGL setup ─────────────────────────────────────────────────── */
  private initGL() {
    const gl = this.canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) {
      this.useFallback("WebGL indisponible");
      return;
    }
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      const program = gl.createProgram();
      if (!program) throw new Error("program");
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "link error");
      }
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.uniforms = Object.fromEntries(
        ["uTex", "uYaw", "uPitch", "uHfov", "uAspect", "uVaov", "uAlpha"].map((k) => [
          k,
          gl.getUniformLocation(program, k),
        ]),
      );
      this.gl = gl;
      this.program = program;
      this.buffer = buffer;
      gl.clearColor(0.018, 0.03, 0.05, 1);
      gl.disable(gl.DEPTH_TEST);
    } catch (err) {
      this.useFallback(err instanceof Error ? err.message : String(err));
    }
  }

  private useFallback(message: string) {
    this.gl = null;
    this.canvas.style.display = "none";
    this.opts.onError?.(message);
  }

  private makeTexture(img: HTMLImageElement, key: string, vaovDeg: number): Texture | null {
    const gl = this.gl;
    if (!gl) return null;
    const max = (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) || 4096;
    let source: TexImageSource = img;
    if (img.width > max || img.height > max) {
      const scale = Math.min(max / img.width, max / img.height);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.floor(img.width * scale));
      c.height = Math.max(1, Math.floor(img.height * scale));
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, c.width, c.height);
        source = c;
      }
    }
    const tex = gl.createTexture();
    if (!tex) return null;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    // NPOT strips: wrapping is done with fract() in the shader, so CLAMP is safe.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return { tex, vaov: vaovDeg * RAD, key };
  }

  /* ── Public API ──────────────────────────────────────────────────── */
  async show(src: string, vaovDeg: number, facingDeg: number, instant = false) {
    if (!this.alive) return;
    const token = ++this.showToken;
    const img = await loadPano(src);
    // A newer scene was requested while this one was decoding: discard it.
    if (!this.alive || token !== this.showToken) return;
    if (this.fallback) {
      this.fallback.style.backgroundImage = `url("${src}")`;
      this.fallback.style.backgroundSize = "auto 100%";
      this.fallback.style.backgroundRepeat = "repeat-x";
    }
    if (this.gl) {
      if (this.incoming) this.gl.deleteTexture(this.incoming.tex);
      const tex = this.makeTexture(img, src, vaovDeg);
      if (!tex) {
        this.useFallback("Texture impossible à créer");
        return;
      }
      this.incoming = tex;
      this.mix = 0;
      this.fadeStart = performance.now();
      if (instant) this.finishFade();
    }
    if (facingDeg !== Number.NaN) {
      const target = instant ? degToYaw(facingDeg) : this.nearestYaw(degToYaw(facingDeg));
      if (instant) {
        this.yaw = target;
        this.pitch = 0;
        this.tween = null;
      } else {
        this.tween = {
          fromYaw: this.yaw,
          toYaw: target,
          fromPitch: this.pitch,
          toPitch: 0,
          start: performance.now(),
          dur: 1100,
        };
      }
    }
  }

  setAutoRotate(on: boolean) {
    this.autoRotate = on;
  }

  setFov(v: number) {
    this.hfov = clamp(v, 45, 108);
  }

  zoomBy(delta: number) {
    this.setFov(this.hfov + delta);
  }

  reset(facingDeg: number) {
    this.setFov(88);
    this.tween = {
      fromYaw: this.yaw,
      toYaw: this.nearestYaw(degToYaw(facingDeg)),
      fromPitch: this.pitch,
      toPitch: 0,
      start: performance.now(),
      dur: 700,
    };
  }

  getView(): EngineView {
    return { yaw: this.yaw, pitch: this.pitch, hfov: this.effectiveHfov() };
  }

  get facingDeg() {
    return wrapDeg(180 + (this.yaw * 180) / Math.PI);
  }

  /* ── Camera math ─────────────────────────────────────────────────── */
  private nearestYaw(target: number) {
    const delta = Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw));
    return this.yaw + delta;
  }

  private maxPitch() {
    const vaov = (this.cur?.vaov ?? this.incoming?.vaov ?? 62 * RAD) / RAD;
    return Math.max(6, vaov / 2 - 3) * RAD;
  }

  /**
   * The strips only cover ~60° vertically. On tall/narrow viewports a wide
   * horizontal FOV would ask for pixels above/below the photograph, so we cap
   * the effective FOV to what the strip can fill at the current aspect ratio.
   */
  private effectiveHfov() {
    const vaovDeg = (this.cur?.vaov ?? this.incoming?.vaov ?? 62 * RAD) / RAD;
    const aspect = this.width / Math.max(1, this.height);
    const maxH = (2 * Math.atan(Math.tan((vaovDeg * RAD) / 2) * aspect)) / RAD;
    return Math.max(28, Math.min(this.hfov, maxH * 0.995));
  }

  private project(deg: number, pitchDeg: number): Projection {
    const th = Math.tan((this.effectiveHfov() * RAD) / 2);
    const tv = th / (this.width / Math.max(1, this.height));
    const theta = degToYaw(deg);
    const phi = pitchDeg * RAD;
    const a = theta - this.yaw;
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const dx = Math.cos(phi) * Math.sin(a);
    const dy = Math.sin(phi) * cp - Math.cos(phi) * Math.cos(a) * sp;
    const dz = Math.sin(phi) * sp + Math.cos(phi) * Math.cos(a) * cp;
    if (dz <= 0.05) return { x: -999, y: -999, visible: false, depth: dz };
    const x = ((dx / dz / th) * 0.5 + 0.5) * this.width;
    const y = (0.5 - (dy / dz / tv) * 0.5) * this.height;
    return {
      x,
      y,
      visible: x > -60 && x < this.width + 60 && y > -50 && y < this.height + 50,
      depth: dz,
    };
  }

  /* ── Input ───────────────────────────────────────────────────────── */
  private attach() {
    const c = this.canvas;
    c.style.touchAction = "none";
    c.addEventListener("pointerdown", this.onDown);
    c.addEventListener("pointermove", this.onMove);
    c.addEventListener("pointerup", this.onUp);
    c.addEventListener("pointercancel", this.onUp);
    c.addEventListener("wheel", this.onWheel, { passive: false });
  }

  private onDown = (e: PointerEvent) => {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.dragging = true;
    this.tween = null;
    this.vYaw = 0;
    this.vPitch = 0;
    this.rotatePauseUntil = performance.now() + 4000;
    this.lastMove = performance.now();
    try { this.canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    this.opts.onInteract?.();
  };

  private onMove = (e: PointerEvent) => {
    const prev = this.pointers.get(e.pointerId);
    if (!prev) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const now = performance.now();
    const dt = Math.max(8, now - this.lastMove);
    this.lastMove = now;
    this.rotatePauseUntil = now + 4000;

    if (this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.lastPinch > 0 && dist > 0) this.setFov(this.hfov * (this.lastPinch / dist));
      this.lastPinch = dist;
      return;
    }

    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    const hfov = this.effectiveHfov();
    const yawScale = (hfov * RAD) / Math.max(1, this.width);
    const pitchScale = ((hfov * RAD) / (this.width / Math.max(1, this.height))) / Math.max(1, this.height);
    const dYaw = -dx * yawScale;
    const dPitch = dy * pitchScale;
    this.yaw += dYaw;
    this.pitch = clamp(this.pitch + dPitch, -this.maxPitch(), this.maxPitch());
    this.vYaw = (dYaw / dt) * 16;
    this.vPitch = (dPitch / dt) * 16;
  };

  private onUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.lastPinch = 0;
    if (this.pointers.size === 0) this.dragging = false;
    try { this.canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.zoomBy(Math.sign(e.deltaY) * 4);
    this.rotatePauseUntil = performance.now() + 3000;
    this.opts.onInteract?.();
  };

  /* ── Frame loop ──────────────────────────────────────────────────── */
  private resize() {
    const rect = (this.gl ? this.canvas : this.fallback ?? this.canvas).getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.width = rect.width;
    this.height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const budget = Math.min(1, Math.sqrt(2_600_000 / (rect.width * rect.height * dpr * dpr)));
    const w = Math.max(1, Math.round(rect.width * dpr * budget));
    const h = Math.max(1, Math.round(rect.height * dpr * budget));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl?.viewport(0, 0, w, h);
    }
  }

  private loop = (now: number) => {
    if (!this.alive) return;
    const dt = Math.min(64, now - this.lastFrame);
    this.lastFrame = now;

    if (this.tween) {
      const p = clamp((now - this.tween.start) / this.tween.dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      this.yaw = this.tween.fromYaw + (this.tween.toYaw - this.tween.fromYaw) * e;
      this.pitch = this.tween.fromPitch + (this.tween.toPitch - this.tween.fromPitch) * e;
      if (p >= 1) this.tween = null;
    } else if (!this.dragging) {
      if (Math.abs(this.vYaw) > 0.00001 || Math.abs(this.vPitch) > 0.00001) {
        this.yaw += this.vYaw * (dt / 16);
        this.pitch = clamp(this.pitch + this.vPitch * (dt / 16), -this.maxPitch(), this.maxPitch());
        const decay = Math.pow(0.9, dt / 16);
        this.vYaw *= decay;
        this.vPitch *= decay;
      } else if (this.autoRotate && now > this.rotatePauseUntil) {
        this.yaw += dt * 0.000032;
      }
    }

    if (this.incoming) {
      const p = clamp((now - this.fadeStart) / this.fadeDuration, 0, 1);
      this.mix = p * p * (3 - 2 * p);
      if (p >= 1) this.finishFade();
    }

    if (this.gl) this.renderGL();
    else this.renderFallback();

    const ctx: FrameCtx = {
      view: this.getView(),
      width: this.width,
      height: this.height,
      // Projected hotspots need the WebGL perspective. In the flat-image
      // fallback they would be misplaced and can overlap the controls.
      project: (deg, pitchDeg) => this.gl ? this.project(deg, pitchDeg) : { x: -999, y: -999, visible: false, depth: 0 },
    };
    this.opts.onFrame?.(ctx);
    if (now - this.lastViewEmit > 110) {
      this.lastViewEmit = now;
      this.opts.onView?.(ctx.view);
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private finishFade() {
    if (!this.incoming) return;
    if (this.cur && this.gl) this.gl.deleteTexture(this.cur.tex);
    this.cur = this.incoming;
    this.incoming = null;
    this.mix = 0;
  }

  private renderGL() {
    const gl = this.gl;
    const program = this.program;
    if (!gl || !program || !this.buffer) return;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.cur && !this.incoming) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.uniform1i(this.uniforms.uTex, 0);
    gl.uniform1f(this.uniforms.uYaw, this.yaw);
    gl.uniform1f(this.uniforms.uPitch, this.pitch);
    gl.uniform1f(this.uniforms.uHfov, this.effectiveHfov());
    gl.uniform1f(this.uniforms.uAspect, this.canvas.width / Math.max(1, this.canvas.height));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if (this.cur) this.draw(this.cur, 1);
    if (this.incoming) this.draw(this.incoming, this.mix);
    gl.disable(gl.BLEND);
  }

  private draw(t: Texture, alpha: number) {
    const gl = this.gl;
    if (!gl) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.uniform1f(this.uniforms.uVaov, t.vaov);
    gl.uniform1f(this.uniforms.uAlpha, alpha);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private renderFallback() {
    if (!this.fallback) return;
    const pct = (this.facingDeg / 360) * 100;
    this.fallback.style.backgroundPosition = `${pct}% center`;
  }

  destroy() {
    this.alive = false;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    const c = this.canvas;
    c.removeEventListener("pointerdown", this.onDown);
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("pointercancel", this.onUp);
    c.removeEventListener("wheel", this.onWheel);
    if (this.gl) {
      if (this.cur) this.gl.deleteTexture(this.cur.tex);
      if (this.incoming) this.gl.deleteTexture(this.incoming.tex);
      if (this.program) this.gl.deleteProgram(this.program);
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    this.cur = null;
    this.incoming = null;
  }
}
