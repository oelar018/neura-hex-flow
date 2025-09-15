// src/components/HexHeroThree.tsx (enhanced)
// A lightweight, shader-driven hex "nebula" with cursor glow, ripple waves,
// subtle noise shimmer, and parallax tilt. Optimized for DPR and idle pause.

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  rings?: number;          // 10–14 looks good on desktop
  dotSize?: number;        // base point size
  glowStrength?: number;   // 0..1
  idleSpeed?: number;      // radians/sec for slow rotation
  isPaused?: boolean;      // pause rendering externally (modal/tab hide)
  parallax?: number;       // 0..1 amount of tilt with mouse (default 0.35)
  rippleSpeed?: number;    // 0..2 speed of expanding waves (default 0.7)
  rippleFreq?: number;     // ~0.2..0.6 how many waves fit on screen (default 0.35)
  noiseAmt?: number;       // 0..1 subtle twinkle (default 0.25)
  className?: string;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

// Build axial hex rings → XY positions
function buildHexDotPositions(R: number, spacing: number) {
  const pts: number[] = [];
  const dirs = [
    [1, 0], [1, -1], [0, -1],
    [-1, 0], [-1, 1], [0, 1],
  ];
  const hollow = Math.max(0, Math.round(R * 0.18)); // tiny hole
  if (hollow === 0) pts.push(0, 0, 0);

  for (let k = 1; k <= R; k++) {
    if (k <= hollow) continue;
    let q = k, r = 0;
    for (let side = 0; side < 6; side++) {
      const [dq, dr] = dirs[side];
      for (let step = 0; step < k; step++) {
        const x = spacing * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
        const y = spacing * ((3 / 2) * r);
        pts.push(x, y, 0);
        q += dq; r += dr;
      }
    }
  }
  return new Float32Array(pts);
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uIdle;
  uniform vec2  uMouse;      // world coords
  uniform float uDotSize;
  uniform float uGlow;
  uniform float uRippleSpeed;
  uniform float uRippleFreq;
  uniform float uNoiseAmt;
  uniform float uParallaxX;  // -1..1
  uniform float uParallaxY;  // -1..1
  attribute float aRing;

  varying float vGlow;
  varying float vRing;

  // Tiny hash-based noise (cheap, no texture)
  float hash(vec2 p){
    p = fract(p*0.3183099 + vec2(0.71,0.113));
    return fract(23.3*dot(p, p+0.37));
  }

  void main() {
    vec3 p = position;

    // very subtle idle rotation
    float c = cos(uIdle * uTime), s = sin(uIdle * uTime);
    mat2 rot = mat2(c, -s, s, c);
    p.xy = rot * p.xy;

    // parallax tilt (rotate a bit with cursor)
    float px = uParallaxX * 0.1;
    float py = uParallaxY * 0.1;
    mat3 tilt = mat3(
      1.0,      0.0,      px,
      0.0,      1.0,      -py,
      -px,      py,       1.0
    );
    p = tilt * p;

    // distance to mouse; base glow around pointer
    float d = distance(p.xy, uMouse);
    float t = clamp(1.0 - d / (uDotSize * 22.0), 0.0, 1.0);
    float cursorGlow = t*t*(3.0 - 2.0*t);

    // expanding ripple waves from pointer (or center if mouse offscreen)
    vec2 rippleCenter = uMouse.x > 9000.0 ? vec2(0.0) : uMouse;
    float distR = distance(p.xy, rippleCenter);
    float wave   = 0.5 + 0.5 * sin(distR * uRippleFreq - uTime * uRippleSpeed * 6.28318);
    float ripple = smoothstep(0.35, 1.0, wave); // soft highlight

    // tiny per-point twinkle
    float twinkle = (hash(p.xy + uTime*0.05) - 0.5) * uNoiseAmt;

    // combine
    vGlow = clamp(cursorGlow * 0.9 + ripple * 0.6 + twinkle, 0.0, 1.0);
    vRing = aRing;

    float ringFade = 0.85 + (1.0 - aRing) * 0.2;
    gl_PointSize = uDotSize * ringFade * (1.0 + vGlow * 0.9);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vGlow;
  varying float vRing;

  // brand palette: deep teal → cyan glow
  vec3 palette(float t){
    // t in [0,1]
    vec3 c1 = vec3(0.02, 0.75, 0.70); // teal
    vec3 c2 = vec3(0.40, 0.98, 0.95); // cyan
    vec3 c3 = vec3(0.12, 0.86, 0.80); // mid
    return mix(mix(c1, c3, smoothstep(0.0,0.6,t)), c2, smoothstep(0.4,1.0,t));
  }

  void main() {
    // soft round point
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float m = 1.0 - clamp(length(uv), 0.0, 1.0);
    float edge = smoothstep(0.0, 1.0, m);

    // color blends slightly by ring index for depth
    vec3 base = palette(1.0 - vRing);
    vec3 col  = base * (0.25 + vGlow * 0.95);

    gl_FragColor = vec4(col, edge * (0.25 + vGlow * 0.75));
  }
`;

type Uniforms = {
  uTime: { value: number };
  uIdle: { value: number };
  uMouse: { value: THREE.Vector2 };
  uDotSize: { value: number };
  uGlow: { value: number };
  uRippleSpeed: { value: number };
  uRippleFreq: { value: number };
  uNoiseAmt: { value: number };
  uParallaxX: { value: number };
  uParallaxY: { value: number };
};

const HexHeroThree: React.FC<Props> = ({
  rings = 12,
  dotSize = 5,
  glowStrength = 1,
  idleSpeed = 0.15,
  isPaused = false,
  parallax = 0.35,
  rippleSpeed = 0.7,
  rippleFreq = 0.35,
  noiseAmt = 0.25,
  className = "",
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = useRef<THREE.Points | null>(null);
  const uniformsRef = useRef<Uniforms | null>(null);
  const rafRef = useRef<number | null>(null);

  const prefersRM = useMemo(prefersReducedMotion, []);
  const intersectPausedRef = useRef(false);
  const visibilityPausedRef = useRef(false);

  // cache parallax mouse (NDC)
  const parallaxRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    cameraRef.current = camera;

    // geometry
    const geom = new THREE.BufferGeometry();
    const spacing = 1.0;
    const pos = buildHexDotPositions(rings, spacing);
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    // ring weight (approx by radial distance)
    const aRing = new Float32Array(pos.length / 3);
    const v = new THREE.Vector3();
    for (let i = 0, w = 0; i < pos.length; i += 3) {
      v.set(pos[i], pos[i + 1], 0);
      const r = Math.max(1, Math.round(v.length() / spacing / 1.5));
      aRing[w++] = r / rings;
    }
    geom.setAttribute("aRing", new THREE.BufferAttribute(aRing, 1));

    // uniforms & material
    const uniforms: Uniforms = {
      uTime: { value: 0 },
      uIdle: { value: prefersRM ? 0 : idleSpeed },
      uMouse: { value: new THREE.Vector2(9999, 9999) }, // offscreen initially
      uDotSize: { value: dotSize },
      uGlow: { value: glowStrength },
      uRippleSpeed: { value: rippleSpeed },
      uRippleFreq: { value: rippleFreq },
      uNoiseAmt: { value: noiseAmt },
      uParallaxX: { value: 0 },
      uParallaxY: { value: 0 },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    });

    const points = new THREE.Points(geom, material);
    meshRef.current = points;
    scene.add(points);

    // Resize handling
    const resize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);

      const aspect = w / h;
      const viewSize = 1;
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();

      const minDim = Math.min(w, h);
      const target = (minDim * 0.72) / (rings * 1.5);
      points.scale.set(target, target, 1);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // pointer → world coords for glow, and NDC for parallax
    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      parallaxRef.current.x = x;
      parallaxRef.current.y = y;

      const ndc = new THREE.Vector3(x, y, 0);
      ndc.unproject(camera);
      uniforms.uMouse.value.set(ndc.x, ndc.y);
    }
    function onPointerLeave() {
      uniforms.uMouse.value.set(9999, 9999);
      parallaxRef.current.x = 0;
      parallaxRef.current.y = 0;
    }
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);

    // pause when off-screen
    const io = new IntersectionObserver((entries) => {
      intersectPausedRef.current = !entries[0].isIntersecting;
    }, { threshold: 0.01 });
    io.observe(wrap);

    // page visibility pause
    const onVis = () => {
      visibilityPausedRef.current = document.visibilityState !== "visible";
    };
    document.addEventListener("visibilitychange", onVis);

    // animate
    const clock = new THREE.Clock();
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);

      const paused =
        isPaused || prefersRM || intersectPausedRef.current || visibilityPausedRef.current;
      if (paused) return;

      uniforms.uTime.value += clock.getDelta();

      // ease parallax for smoothness
      uniforms.uParallaxX.value += (parallax * parallaxRef.current.x - uniforms.uParallaxX.value) * 0.08;
      uniforms.uParallaxY.value += (parallax * parallaxRef.current.y - uniforms.uParallaxY.value) * 0.08;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      ro.disconnect();
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      geom.dispose();
      material.dispose();
      renderer.dispose();
      if (wrap.contains(renderer.domElement)) wrap.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rings]);

  // live prop updates without teardown
  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uDotSize.value = dotSize;
  }, [dotSize]);
  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uGlow.value = glowStrength;
  }, [glowStrength]);
  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uIdle.value = prefersRM ? 0 : idleSpeed;
  }, [idleSpeed, prefersRM]);
  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uRippleSpeed.value = rippleSpeed;
  }, [rippleSpeed]);
  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uRippleFreq.value = rippleFreq;
  }, [rippleFreq]);
  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uNoiseAmt.value = noiseAmt;
  }, [noiseAmt]);

  return <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden="true" />;
};

export default HexHeroThree;