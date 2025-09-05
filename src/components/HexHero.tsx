import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HexHeroProps {
  gridDensity?: number;
  colorStops?: string[];
  rippleStrength?: number;
  noiseAmount?: number;
  performanceMode?: 'high' | 'medium' | 'low';
}

export const HexHero: React.FC<HexHeroProps> = ({
  gridDensity = 30,
  colorStops = ['#00ffff', '#0080ff', '#004080'],
  rippleStrength = 1.0,
  noiseAmount = 0.5,
  performanceMode = 'high'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const materialRef = useRef<THREE.ShaderMaterial>();
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [supportsWebGL, setSupportsWebGL] = useState(true);

  // Vertex shader for hexagonal grid
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader with hexagonal pattern and interactive effects
  const fragmentShader = `
    uniform float time;
    uniform vec2 mouse;
    uniform vec2 resolution;
    uniform float rippleStrength;
    uniform float noiseAmount;
    varying vec2 vUv;
    
    // Hexagon distance function
    float hexDist(vec2 p) {
      p = abs(p);
      return max(dot(p, normalize(vec2(1.0, 1.732))), p.x);
    }
    
    // Hexagonal grid function
    vec2 hexGrid(vec2 p) {
      vec2 q = vec2(p.x * 2.0 * 0.5773, p.y + p.x * 0.5773);
      vec2 pi = floor(q);
      vec2 pf = fract(q);
      
      float v = mod(pi.x + pi.y, 3.0);
      
      float ca = step(1.0, v);
      float cb = step(2.0, v);
      vec2 ma = step(pf.xy, pf.yx);
      
      return vec2(pi + ca - cb*ma + (cb-ca)*ma.yx);
    }
    
    // Smooth noise function
    float noise(vec2 p) {
      return sin(p.x * 12.345) * sin(p.y * 23.456) * 0.5 + 0.5;
    }
    
    void main() {
      vec2 p = (vUv - 0.5) * 8.0;
      vec2 hid = hexGrid(p);
      
      // Distance to hex center
      float hexDistance = hexDist(p - hid * 0.866);
      
      // Mouse influence
      vec2 mousePos = (mouse - 0.5) * 8.0;
      float mouseInfluence = 1.0 - smoothstep(0.0, 3.0, distance(hid, hexGrid(mousePos)));
      
      // Ripple effect
      float ripple = sin(distance(hid, hexGrid(mousePos)) * 2.0 - time * 4.0) * 0.5 + 0.5;
      ripple = ripple * mouseInfluence * rippleStrength;
      
      // Hex outline
      float hex = 1.0 - smoothstep(0.7, 0.8, hexDistance);
      
      // Add noise and animation
      float n = noise(hid + time * 0.1) * noiseAmount;
      float pulse = sin(time + hid.x * 0.5 + hid.y * 0.7) * 0.1 + 0.9;
      
      // Combine effects
      float intensity = hex * (0.2 + ripple + n) * pulse;
      intensity = intensity + mouseInfluence * 0.3;
      
      // Color gradient based on position and mouse
      vec3 color1 = vec3(0.0, 1.0, 1.0); // Cyan
      vec3 color2 = vec3(0.0, 0.5, 1.0); // Blue
      vec3 color3 = vec3(0.0, 0.25, 0.5); // Dark blue
      
      vec3 color = mix(color3, mix(color2, color1, mouseInfluence), intensity);
      
      gl_FragColor = vec4(color * intensity, intensity);
    }
  `;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL support
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setSupportsWebGL(false);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true, 
      antialias: performanceMode === 'high' 
    });
    
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(performanceMode === 'high' ? window.devicePixelRatio : 1);

    // Create shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() },
        resolution: { value: new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight) },
        rippleStrength: { value: rippleStrength },
        noiseAmount: { value: noiseAmount }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Create geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    materialRef.current = material;

    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [performanceMode, rippleStrength, noiseAmount]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const material = materialRef.current;
      
      if (!canvas || !renderer || !material) return;
      
      const { offsetWidth, offsetHeight } = canvas;
      renderer.setSize(offsetWidth, offsetHeight);
      material.uniforms.resolution.value.set(offsetWidth, offsetHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const canvas = canvasRef.current;
    const material = materialRef.current;
    
    if (!canvas || !material) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      
      mouseRef.current = { x, y };
      material.uniforms.mouse.value.set(x, y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = 1 - (touch.clientY - rect.top) / rect.height;
        
        mouseRef.current = { x, y };
        material.uniforms.mouse.value.set(x, y);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isVisible || !supportsWebGL) return;

    const animate = () => {
      timeRef.current += 0.016; // ~60fps
      
      if (materialRef.current) {
        materialRef.current.uniforms.time.value = timeRef.current;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, supportsWebGL]);

  // Intersection Observer for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => setIsVisible(!mediaQuery.matches);
    
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!supportsWebGL) {
    // Fallback SVG for unsupported devices
    return (
      <div className="absolute inset-0 bg-gradient-hero opacity-30">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
            <pattern id="hexPattern" x="0" y="0" width="40" height="35" patternUnits="userSpaceOnUse">
              <polygon
                points="20,0 35,12 35,23 20,35 5,23 5,12"
                fill="none"
                stroke="hsl(180 100% 60%)"
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};