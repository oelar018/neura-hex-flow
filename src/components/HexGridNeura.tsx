import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  className?: string;
  isPaused?: boolean;       // pause externally (e.g., when a modal opens)
  hexSize?: number;         // base hex size in screen space (default 0.9 looks good)
  lineWidth?: number;       // thickness of glow line (0.02..0.12 typical)
  glowStrength?: number;    // 0..2 intensity multiplier
  shimmer?: number;         // 0..1 subtle twinkle amount
  breatheSpeed?: number;    // 0..2 breathing speed
  parallax?: number;        // 0..1 tilt + light movement with mouse
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Full-screen hex grid with soft cyan glow, cursor parallax, shimmer and breathing.
const fragmentShader = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;  // px
  uniform vec2  uMouse;       // px, -1 when off
  uniform float uHexSize;     // screen-space scale
  uniform float uLineWidth;   // glow line thickness
  uniform float uGlow;        // glow multiplier
  uniform float uShimmer;     // shimmer amount
  uniform float uBreathe;     // breathing speed
  uniform float uParallax;    // parallax amount
  uniform float uRM;          // reduced motion? 1.0 yes, 0.0 no

  // Hash noise: cheap, stateless
  float hash(vec2 p){
    p = fract(p*0.3183099 + vec2(0.71,0.113));
    return fract(23.3*dot(p, p+0.37));
  }

  // Aspect-corrected NDC -> screen plane coords
  vec2 toPlane(vec2 uv) {
    // map [0,1] to [-1,1]
    vec2 p = uv * 2.0 - 1.0;
    float aspect = uResolution.x / max(1.0, uResolution.y);
    p.x *= aspect;                  // keep hexes round regardless of aspect
    return p;
  }

  // Hex tiling helpers (adapted SDF approach):
  // Convert p into repeated hex cells and return local coordinates
  // Method: skewed basis + nearest cell; see common axial hex math.
  vec2 hexCell(vec2 p, float s) {
    // scale controls hex size
    p /= s;

    // axial-ish transform
    const float k = 0.57735026919; // 1/sqrt(3)
    vec2 q = vec2(p.x * (2.0/3.0), (-p.x * k + p.y));    // to axial-ish basis

    // nearest hex cell center in this basis
    vec2 iq = floor(q + 0.5);
    vec2 fq = q - iq;

    // three barycentric-like coords to decide nearest triangle
    vec2 iq2 = iq + (dot(fq, vec2(1.0,1.0)) > 1.0 ? vec2(1.0,1.0) : vec2(0.0));
    vec2 cell = iq2;

    // back to plane (approx inverse)
    vec2 center;
    center.x = (3.0/2.0) * cell.x;
    center.y = (sqrt(3.0)/2.0) * (2.0*cell.y - cell.x);

    // local coordinates in hex space (scaled back)
    vec2 local = p - center;
    local *= s;
    return local;
  }

  // Distance to hex border (approx): fold into a single wedge and compute edge distance.
  // Reference trick: fold by 60° symmetry (using | and rotation).
  float hexEdgeDist(vec2 lp, float s) {
    // rotate/fold into a 60-degree wedge
    const float SQ3 = 1.73205080757;
    lp = vec2(abs(lp.x), lp.y);
    // project onto the "up-right" edge direction
    float e = max( (lp.x * 0.5 + lp.y * (SQ3*0.5)),  (lp.x * 0.5 - lp.y * (SQ3*0.5)) );
    e = max(e, lp.x); // three edges folded
    // distance from edge (hex circumradius ~ s)
    float r = s * 0.98; // slight shrink for tighter look
    return e - r * 0.5;
  }

  // Brand palette (deep teal -> cyan)
  vec3 brand(float t){
    vec3 c1 = vec3(0.05, 0.80, 0.76); // teal
    vec3 c2 = vec3(0.38, 0.98, 0.96); // cyan
    vec3 c3 = vec3(0.16, 0.88, 0.82);
    return mix(mix(c1, c3, smoothstep(0.0,0.6,t)), c2, smoothstep(0.35,1.0,t));
  }

  void main() {
    vec2 p = toPlane(vUv);

    // subtle breathing: modulate line width a bit
    float breath = (uRM > 0.5) ? 0.0 : (0.08 * sin(uTime * (1.0 + uBreathe * 2.0)));
    float lineW  = clamp(uLineWidth + breath, 0.001, 0.5);

    // mouse parallax in plane space (-1..1)
    vec2 mpx = vec2(0.0);
    if (uParallax > 0.0 && uRM < 0.5) {
      // convert px mouse to plane-ish coords
      vec2 m = uMouse / max(uResolution, vec2(1.0));
      m = m*2.0 - 1.0;
      m.x *= (uResolution.x / max(1.0, uResolution.y));
      // ease toward center
      mpx = m * uParallax * 0.25;
      p += mpx;
    }

    // hex local coords
    float baseSize = uHexSize;  // bigger -> larger hexes
    vec2 lp = hexCell(p, baseSize);

    // distance to nearest border (negative inside)
    float d = hexEdgeDist(lp, baseSize);

    // turn distance into glow: bright near edges, soft falloff
    float glow = smoothstep(lineW, 0.0, abs(d));            // sharp line
    float soft = smoothstep(0.35 + lineW, 0.0, abs(d));     // wider halo
    float edge = glow * 0.85 + soft * 0.55;

    // shimmer: tiny per-cell twinkle using hash of cell id
    float tw = 0.0;
    if (uShimmer > 0.001 && uRM < 0.5) {
      // derive a stable id from lp rounded cell center
      // (recompute cell id similar to above but cheaper approximation)
      vec2 gid = floor((p / baseSize) * vec2(1.0, 0.57735) + 0.5);
      float n = hash(gid + floor(uTime * 0.25) );
      tw = (n - 0.5) * uShimmer;
    }

    // color
    float tone = clamp(edge * (0.85 + tw), 0.0, 1.0);
    vec3 col = brand(0.55 + 0.45 * tone);

    // final brightness: edge pop + overall softness
    float a = tone * uGlow;

    // dark background + additive-y feel
    vec3 bg = vec3(0.02, 0.02, 0.03);
    vec3 outCol = bg + col * (0.15 + a * 0.95);

    gl_FragColor = vec4(outCol, 1.0);
  }
`;

type Uniforms = {
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uMouse: { value: THREE.Vector2 };
  uHexSize: { value: number };
  uLineWidth: { value: number };
  uGlow: { value: number };
  uShimmer: { value: number };
  uBreathe: { value: number };
  uParallax: { value: number };
  uRM: { value: number };
};

const HexGridNeura: React.FC<Props> = ({
  className = "",
  isPaused = false,
  hexSize = 0.9,
  lineWidth = 0.06,
  glowStrength = 1.2,
  shimmer = 0.15,
  breatheSpeed = 0.6,
  parallax = 0.28,
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const uniformsRef = useRef<Uniforms | null>(null);
  const rafRef = useRef<number | null>(null);

  const rm = useMemo(prefersReducedMotion, []);
  const intersectPausedRef = useRef(false);
  const visibilityPausedRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });
    rendererRef.current = renderer;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    // scene / camera (full-screen quad)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    camRef.current = cam;

    const geom = new THREE.PlaneGeometry(2, 2);
    const uniforms: Uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(-1, -1) }, // -1 means "offscreen"
      uHexSize: { value: hexSize },
      uLineWidth: { value: lineWidth },
      uGlow: { value: glowStrength },
      uShimmer: { value: shimmer },
      uBreathe: { value: breatheSpeed },
      uParallax: { value: parallax },
      uRM: { value: rm ? 1 : 0 },
    };
    uniformsRef.current = uniforms;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geom, mat);
    meshRef.current = mesh;
    scene.add(mesh);

    // resize
    const resize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // mouse tracking in pixels
    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      uniforms.uMouse.value.set(e.clientX - rect.left, e.clientY - rect.top);
    }
    function onPointerLeave() {
      uniforms.uMouse.value.set(-1, -1);
    }
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);

    // pause when scrolled off
    const io = new IntersectionObserver((entries) => {
      intersectPausedRef.current = !entries[0].isIntersecting;
    }, { threshold: 0.01 });
    io.observe(wrap);

    // page visibility
    const onVis = () => {
      visibilityPausedRef.current = document.visibilityState !== "visible";
    };
    document.addEventListener("visibilitychange", onVis);

    // animate
    const clock = new THREE.Clock();
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const paused = isPaused || rm || intersectPausedRef.current || visibilityPausedRef.current;
      if (!paused) {
        uniforms.uTime.value += clock.getDelta();
        renderer.render(scene, cam);
      }
    };
    tick();

    return () => {
      ro.disconnect();
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      geom.dispose();
      (mat as any).dispose?.();
      renderer.dispose();
      if (wrap.contains(renderer.domElement)) wrap.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live prop updates (no teardown)
  useEffect(() => { uniformsRef.current?.uHexSize && (uniformsRef.current.uHexSize.value = hexSize); }, [hexSize]);
  useEffect(() => { uniformsRef.current?.uLineWidth && (uniformsRef.current.uLineWidth.value = lineWidth); }, [lineWidth]);
  useEffect(() => { uniformsRef.current?.uGlow && (uniformsRef.current.uGlow.value = glowStrength); }, [glowStrength]);
  useEffect(() => { uniformsRef.current?.uShimmer && (uniformsRef.current.uShimmer.value = shimmer); }, [shimmer]);
  useEffect(() => { uniformsRef.current?.uBreathe && (uniformsRef.current.uBreathe.value = breatheSpeed); }, [breatheSpeed]);
  useEffect(() => { uniformsRef.current?.uParallax && (uniformsRef.current.uParallax.value = parallax); }, [parallax]);

  return <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden="true" />;
};

export default HexGridNeura;