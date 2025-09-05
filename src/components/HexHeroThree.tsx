import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  rings?: number;          // 10–14 looks good on desktop
  dotSize?: number;        // px-ish (shader scales it)
  glowStrength?: number;   // 0..1
  idleSpeed?: number;      // radians/sec (very small)
  className?: string;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

// Build axial hex rings → positions in XY
function buildHexDotPositions(R: number, spacing: number) {
  const pts: number[] = [];
  // axial neighbor directions
  const dirs = [
    [1, 0], [1, -1], [0, -1],
    [-1, 0], [-1, 1], [0, 1],
  ];
  // optional tiny hole in the middle for that "sculpture" look
  const hollow = Math.max(0, Math.round(R * 0.18));

  if (hollow === 0) {
    pts.push(0, 0, 0);
  }

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
  uniform vec2  uMouse;     // in world space
  uniform float uDotSize;
  uniform float uGlow;
  attribute float aRing;

  varying float vGlow;

  void main() {
    // base position
    vec3 p = position;

    // tiny idle rotation around Z
    float c = cos(uIdle * uTime), s = sin(uIdle * uTime);
    mat2 rot = mat2(c, -s, s, c);
    p.xy = rot * p.xy;

    // distance to mouse (world space already)
    float d = distance(p.xy, uMouse);
    float t = clamp(1.0 - d / (uDotSize * 22.0), 0.0, 1.0); // influence radius
    // smooth falloff
    vGlow = t * t * (3.0 - 2.0 * t);

    // size fades slightly with ring index
    float ringFade = 0.85 + (1.0 - aRing) * 0.15;

    gl_PointSize = uDotSize * ringFade * (1.0 + vGlow * 0.8);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vGlow;

  void main() {
    // soft round point mask
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float m = 1.0 - clamp(length(uv), 0.0, 1.0);
    // feathered edge
    float alpha = smoothstep(0.0, 1.0, m);

    // base cyan/teal
    vec3 base = vec3(0.51, 1.0, 0.98); // ~ rgb(130,255,250)
    // additive-ish brightness near cursor
    vec3 col  = base * (0.25 + vGlow * 0.9);

    gl_FragColor = vec4(col, alpha * (0.28 + vGlow * 0.7));
  }
`;

const HexHeroThree: React.FC<Props> = ({
  rings = 12,
  dotSize = 5.0,
  glowStrength = 1.0,     // kept for API symmetry (already in shader)
  idleSpeed = 0.15,       // radians / sec (very subtle)
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
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // transparent over dark bg
    rendererRef.current = renderer;
    wrap.appendChild(renderer.domElement);

    // scene + camera (orthographic)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    cameraRef.current = camera;

    // geometry (positions + ring attribute)
    const geom = new THREE.BufferGeometry();

    // scale lattice to fit viewport later; we start with unit spacing then rescale
    const spacing = 1.0;
    const pos = buildHexDotPositions(rings, spacing);

    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    // compute ring index per vertex so inner rings can be slightly bigger/brighter
    const ringAttr = new Float32Array(pos.length / 3);
    {
      // reconstruct ring per vertex by inverse spacing radius
      let write = 0;
      const v = new THREE.Vector3();
      // approximate "ring" by nearest multiple of spacing in hex space → use length
      for (let i = 0; i < pos.length; i += 3) {
        v.set(pos[i], pos[i + 1], 0);
        const r = Math.max(1, Math.round(v.length() / spacing / 1.5));
        ringAttr[write++] = r / rings;
      }
    }
    geom.setAttribute("aRing", new THREE.BufferAttribute(ringAttr, 1));

    // uniforms
    const uniforms: any = {
      uTime:     { value: 0 },
      uIdle:     { value: reduced ? 0 : idleSpeed },
      uMouse:    { value: new THREE.Vector2(9999, 9999) }, // offscreen initially
      uDotSize:  { value: dotSize },
      uGlow:     { value: glowStrength },
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

    // resize
    const onResize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);

      // ortho framing
      const aspect = w / h;
      const viewSize = 1; // baseline
      camera.left   = -viewSize * aspect;
      camera.right  =  viewSize * aspect;
      camera.top    =  viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();

      // scale lattice to sit ~70% of min dimension
      const minDim = Math.min(w, h);
      const target = (minDim * 0.70) / (rings * 1.5); // empirical balance
      points.scale.set(target, target, 1);
    };
    onResize();
    window.addEventListener("resize", onResize);

    // pointer → convert from screen to world (roughly)
    function setMouse(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      // NDC -> world at z=0
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
      window.removeEventListener("resize", onResize);
      wrap.removeEventListener("pointermove", setMouse);
      wrap.removeEventListener("pointerleave", clearMouse);
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      geom.dispose();
      material.dispose();
      renderer.dispose();
      wrap.removeChild(renderer.domElement);
    };
  }, [rings, dotSize, glowStrength, idleSpeed]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden="true" />
  );
};

export default HexHeroThree;