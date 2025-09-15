import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  rings?: number;        // how many concentric hex rings
  dotSize?: number;      // base dot size in px-ish
  idleSpeed?: number;    // slow rotation speed (radians/sec)
  pulseSpeed?: number;   // breathing speed
  pulseDepth?: number;   // 0..1 how much dots grow/brighten while pulsing
  hoverBoost?: number;   // 0..1 how much nearby dots brighten on hover
  className?: string;
};

// utilities
function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

// build axial hex ring positions in XY
function buildHexDotPositions(R: number, spacing: number) {
  const pts: number[] = [];
  const dirs = [
    [1, 0], [1, -1], [0, -1],
    [-1, 0], [-1, 1], [0, 1],
  ];
  // slight hollow center for "sculpture" look
  const hollow = Math.max(0, Math.round(R * 0.20));
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
  uniform float uIdle;        // tiny rotation
  uniform float uDotSize;
  uniform float uPulseSpeed;
  uniform float uPulseDepth;
  uniform vec2  uMouse;       // world coords
  attribute float aRing;      // 0..1 inner->outer

  varying float vProx;        // 0..1 mouse proximity
  varying float vRing;        // pass to fragment for subtle falloff

  void main() {
    vec3 p = position;

    // very slow idle rotation
    float c = cos(uIdle * uTime), s = sin(uIdle * uTime);
    mat2 rot = mat2(c, -s, s, c);
    p.xy = rot * p.xy;

    // proximity to mouse (world)
    float d = distance(p.xy, uMouse);
    float t = clamp(1.0 - d / (uDotSize * 22.0), 0.0, 1.0);
    vProx = t * t * (3.0 - 2.0 * t); // smoothstep-ish

    // global breathing pulse
    float pulse = 1.0;
    if (uPulseSpeed > 0.0) {
      pulse += sin(uTime * uPulseSpeed + aRing * 4.0) * uPulseDepth; // phase by ring
    }

    // ring fade: inner dots a touch bigger/brighter
    float ringBias = 0.90 + (1.0 - aRing) * 0.25;

    gl_PointSize = uDotSize * ringBias * pulse * (1.0 + vProx * 0.25);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vRing = aRing;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vProx;   // mouse proximity 0..1
  varying float vRing;   // 0..1 inner->outer

  // render soft circular dot, monochrome
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r = length(uv);
    if (r > 1.0) discard;

    // feathered edge mask
    float edge = smoothstep(1.0, 0.85, r);

    // base luminance (inner rings slightly brighter)
    float base = 0.60 + (1.0 - vRing) * 0.25;   // 0.60..0.85

    // proximity highlight (subtle)
    float highlight = vProx * 0.35;

    // final intensity
    float L = clamp(base + highlight, 0.0, 1.0);

    // convert to grayscale (white/gray)
    vec3 col = vec3(L);

    // soften alpha so dots feel airy
    float alpha = edge * (0.45 + vProx * 0.25);
    gl_FragColor = vec4(col, alpha);
  }
`;

const HexDotsMonochrome: React.FC<Props> = ({
  rings = 12,
  dotSize = 5.0,
  idleSpeed = 0.12,     // subtle
  pulseSpeed = 0.9,     // breathing speed
  pulseDepth = 0.12,    // amplitude of breathing
  hoverBoost = 1.0,     // kept for API symmetry (proximity already applied)
  className = "",
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = useRef<THREE.Points | null>(null);
  const uniformsRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const reduced = prefersReducedMotion();

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    rendererRef.current = renderer;
    wrap.appendChild(renderer.domElement);

    // scene & camera (orthographic)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    cameraRef.current = camera;

    // geometry
    const geom = new THREE.BufferGeometry();
    const spacing = 1.0;
    const pos = buildHexDotPositions(rings, spacing);
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    // ring attribute 0..1 (inner→outer)
    const ringAttr = new Float32Array(pos.length / 3);
    {
      let w = 0;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.length; i += 3) {
        v.set(pos[i], pos[i + 1], 0);
        const r = Math.max(1, Math.round(v.length() / spacing / 1.5));
        ringAttr[w++] = Math.min(1.0, r / rings);
      }
    }
    geom.setAttribute("aRing", new THREE.BufferAttribute(ringAttr, 1));

    // uniforms
    const uniforms: any = {
      uTime:       { value: 0 },
      uIdle:       { value: reduced ? 0 : idleSpeed },
      uDotSize:    { value: dotSize },
      uPulseSpeed: { value: reduced ? 0 : pulseSpeed },
      uPulseDepth: { value: pulseDepth },
      uMouse:      { value: new THREE.Vector2(9999, 9999) },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending, // makes highlights feel "glowy" while staying mono
      depthTest: false,
    });

    const points = new THREE.Points(geom, material);
    meshRef.current = points;
    scene.add(points);

    // size/fit
    const onResize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);

      const aspect = w / h;
      const viewSize = 1;
      camera.left   = -viewSize * aspect;
      camera.right  =  viewSize * aspect;
      camera.top    =  viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();

      // scale lattice to ~70% of min dimension
      const minDim = Math.min(w, h);
      const target = (minDim * 0.72) / (rings * 1.5); // tune this for density
      points.scale.set(target, target, 1);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    onResize();

    // pointer → world coords
    function setMouse(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const ndc = new THREE.Vector3(x, y, 0);
      ndc.unproject(camera);
      uniforms.uMouse.value.set(ndc.x, ndc.y);
    }
    function clearMouse() {
      uniforms.uMouse.value.set(9999, 9999);
    }
    wrap.addEventListener("pointermove", setMouse);
    wrap.addEventListener("pointerleave", clearMouse);

    // pause when off-screen
    const io = new IntersectionObserver(
      (entries) => { pausedRef.current = !entries[0].isIntersecting; },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    // animate
    const clock = new THREE.Clock();
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (pausedRef.current) return;
      uniforms.uTime.value += clock.getDelta();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      ro.disconnect();
      wrap.removeEventListener("pointermove", setMouse);
      wrap.removeEventListener("pointerleave", clearMouse);
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      geom.dispose();
      material.dispose();
      renderer.dispose();
      if (wrap.contains(renderer.domElement)) wrap.removeChild(renderer.domElement);
    };
  }, [rings, dotSize, idleSpeed, pulseSpeed, pulseDepth, hoverBoost]);

  return <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden="true" />;
};

export default HexDotsMonochrome;