import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  className?: string;
  rings?: number;       // 10–14 looks good on desktop
  dotSize?: number;     // base dot size
  idleSpeed?: number;   // tiny rotation
  pulseSpeed?: number;  // breathing speed
  pulseDepth?: number;  // 0..1 breathing amount
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

// Build concentric hex rings (axial coords)
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
  uniform float uDotSize;
  uniform float uPulseSpeed;
  uniform float uPulseDepth;
  uniform vec2  uMouse;   // world space
  attribute float aRing;  // 0..1 inner->outer

  varying float vProx;
  varying float vRing;

  void main() {
    vec3 p = position;

    // very subtle idle rotation
    float c = cos(uIdle * uTime), s = sin(uIdle * uTime);
    mat2 rot = mat2(c, -s, s, c);
    p.xy = rot * p.xy;

    // distance to mouse (already world space)
    float d = distance(p.xy, uMouse);
    float t = clamp(1.0 - d / (uDotSize * 22.0), 0.0, 1.0);
    vProx = t * t * (3.0 - 2.0 * t);

    // breathing pulse (phase per ring)
    float pulse = 1.0;
    if (uPulseSpeed > 0.0) {
      pulse += sin(uTime * uPulseSpeed + aRing * 4.0) * uPulseDepth;
    }

    // inner rings slightly larger
    float ringBias = 0.90 + (1.0 - aRing) * 0.25;

    gl_PointSize = uDotSize * ringBias * pulse * (1.0 + vProx * 0.25);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vRing = aRing;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vProx;   // 0..1
  varying float vRing;   // 0..1 inner->outer

  void main() {
    // soft round dot
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r = length(uv);
    if (r > 1.0) discard;

    // feathered edge mask (crisp but soft)
    float edge = smoothstep(1.0, 0.72, r);

    // base luminance (inner rings a touch brighter)
    float base = 0.70 + (1.0 - vRing) * 0.18;  // 0.70..0.88

    // cursor proximity boost (subtle)
    float highlight = vProx * 0.35;

    float L = clamp(base + highlight, 0.0, 1.0);
    vec3 col = vec3(L);                       // grayscale white/gray

    // slightly stronger alpha so it's clearly visible
    float alpha = edge * (0.75 + vProx * 0.15);
    gl_FragColor = vec4(col, alpha);
  }
`;

const HexDotsMonochrome: React.FC<Props> = ({
  className = "",
  rings = 12,
  dotSize = 8,        // a little bigger so you SEE it immediately
  idleSpeed = 0.08,
  pulseSpeed = 0.85,
  pulseDepth = 0.12,
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const uniformsRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const reduced = prefersReducedMotion();

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;
    wrap.appendChild(renderer.domElement);

    // scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    cameraRef.current = camera;

    // geometry
    const geom = new THREE.BufferGeometry();
    const spacing = 1.0;
    const pos = buildHexDotPositions(rings, spacing);
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    // ring attribute 0..1
    const ringAttr = new Float32Array(pos.length / 3);
    {
      let w = 0;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.length; i += 3) {
        v.set(pos[i], pos[i + 1], 0);
        const rr = Math.max(1, Math.round(v.length() / spacing / 1.5));
        ringAttr[w++] = Math.min(1.0, rr / rings);
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
      blending: THREE.NormalBlending, // clearer; switch to Additive if you want extra glow
      depthTest: false,
    });

    const points = new THREE.Points(geom, material);
    scene.add(points);

    // size & fit
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

      // scale sculpture to ~70% of min dimension
      const minDim = Math.min(w, h);
      const target = (minDim * 0.72) / (rings * 1.5);
      points.scale.set(target, target, 1);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    onResize();

    // mouse → world coords
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
    const io = new IntersectionObserver((entries) => {
      pausedRef.current = !entries[0].isIntersecting;
    }, { threshold: 0.01 });
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
  }, [rings, dotSize, idleSpeed, pulseSpeed, pulseDepth]);

  return <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden="true" />;
};

export default HexDotsMonochrome;
