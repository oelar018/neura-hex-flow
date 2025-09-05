import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

interface HexHeroProps {
  gridDensity?: number;
  rippleStrength?: number;
  colorStops?: string[];
  noise?: number;
  perfMode?: 'high' | 'medium' | 'low';
}

export interface HexHeroApi {
  pause: () => void;
  resume: () => void;
}

export const HexHero = forwardRef<HexHeroApi, HexHeroProps>(({
  gridDensity = 20,
  rippleStrength = 1.0,
  colorStops = ['#00ffff', '#0080ff', '#004080'],
  noise = 0.3,
  perfMode = 'high'
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const hexMeshRef = useRef<THREE.InstancedMesh>();
  const lineMeshRef = useRef<THREE.LineSegments>();
  const animationRef = useRef<number>();
  const mouseRef = useRef(new THREE.Vector2());
  const timeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [deviceMotion, setDeviceMotion] = useState(new THREE.Vector2());

  // Hex grid generation
  const generateHexGrid = () => {
    const positions = [];
    const connections = [];
    const hexSize = 0.8;
    const spacing = 1.5;
    
    // Generate hexagonal grid positions
    for (let q = -gridDensity; q <= gridDensity; q++) {
      for (let r = -gridDensity; r <= gridDensity; r++) {
        if (Math.abs(q + r) <= gridDensity) {
          const x = hexSize * (3/2 * q);
          const y = hexSize * (Math.sqrt(3)/2 * (q + 2 * r));
          positions.push(new THREE.Vector3(x, y, 0));
        }
      }
    }

    // Generate connections between adjacent hexagons
    positions.forEach((pos, i) => {
      positions.forEach((otherPos, j) => {
        if (i !== j) {
          const distance = pos.distanceTo(otherPos);
          if (distance < spacing * 1.2) {
            connections.push(pos, otherPos);
          }
        }
      });
    });

    return { positions, connections };
  };

  // Vertex shader for hex nodes
  const hexVertexShader = `
    uniform float time;
    uniform vec2 mouse;
    uniform float rippleStrength;
    uniform float noise;
    attribute float instanceIndex;
    varying float vDistance;
    varying float vIntensity;
    varying vec3 vPosition;
    
    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      vec3 pos = position + instanceMatrix[3].xyz;
      vPosition = pos;
      
      // Distance from mouse
      vDistance = distance(pos.xy, mouse * 10.0 - vec2(5.0, 5.0));
      
      // Mouse influence with ripple
      float mouseInfluence = 1.0 - smoothstep(0.0, 3.0, vDistance);
      float ripple = sin(vDistance * 2.0 - time * 6.0) * 0.5 + 0.5;
      ripple *= mouseInfluence * rippleStrength;
      
      // Noise-based shimmer
      float shimmer = random(pos.xy + time * 0.1) * noise;
      
      // Oscillation for nearby nodes
      float oscillation = sin(time * 2.0 + instanceIndex * 0.1) * mouseInfluence * 0.1;
      pos.z += oscillation;
      
      // Calculate final intensity
      vIntensity = 0.2 + ripple + shimmer + mouseInfluence * 0.5;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Fragment shader for hex nodes
  const hexFragmentShader = `
    uniform vec3 colorStops[3];
    varying float vDistance;
    varying float vIntensity;
    varying vec3 vPosition;
    
    void main() {
      // Soft circular gradient for node
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      // Color mixing based on intensity and distance
      vec3 color = mix(colorStops[2], mix(colorStops[1], colorStops[0], vIntensity), vIntensity);
      
      // Glow effect
      float glow = exp(-vDistance * 0.5) * vIntensity;
      color += vec3(glow * 0.3, glow * 0.6, glow);
      
      gl_FragColor = vec4(color, alpha * vIntensity);
    }
  `;

  // Line shader for connections
  const lineVertexShader = `
    uniform float time;
    uniform vec2 mouse;
    varying float vOpacity;
    
    void main() {
      vec3 pos = position;
      
      // Distance from mouse for line opacity
      float mouseDistance = distance(pos.xy, mouse * 10.0 - vec2(5.0, 5.0));
      vOpacity = 0.1 + (1.0 - smoothstep(0.0, 4.0, mouseDistance)) * 0.3;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const lineFragmentShader = `
    uniform vec3 colorStops[3];
    varying float vOpacity;
    
    void main() {
      gl_FragColor = vec4(colorStops[1], vOpacity);
    }
  `;

  useImperativeHandle(ref, () => ({
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false)
  }));

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
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true, 
      antialias: perfMode === 'high',
      powerPreference: perfMode === 'high' ? 'high-performance' : 'low-power'
    });
    
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, perfMode === 'high' ? 2 : 1));
    renderer.setClearColor(0x000000, 0);

    // Generate hex grid
    const { positions, connections } = generateHexGrid();

    // Create hex node geometry and material
    const hexGeometry = new THREE.CircleGeometry(0.05, 6);
    const hexMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() },
        rippleStrength: { value: rippleStrength },
        noise: { value: noise },
        colorStops: { 
          value: colorStops.map(color => new THREE.Color(color))
        }
      },
      vertexShader: hexVertexShader,
      fragmentShader: hexFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Create instanced mesh for hex nodes
    const hexMesh = new THREE.InstancedMesh(hexGeometry, hexMaterial, positions.length);
    positions.forEach((pos, i) => {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(pos);
      hexMesh.setMatrixAt(i, matrix);
      
      // Set instance index for shader
      hexMesh.geometry.setAttribute('instanceIndex', 
        new THREE.InstancedBufferAttribute(new Float32Array(positions.map((_, idx) => idx)), 1)
      );
    });
    hexMesh.instanceMatrix.needsUpdate = true;
    scene.add(hexMesh);

    // Create line connections
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(connections.length * 3);
    connections.forEach((pos, i) => {
      linePositions[i * 3] = pos.x;
      linePositions[i * 3 + 1] = pos.y;
      linePositions[i * 3 + 2] = pos.z;
    });
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() },
        colorStops: { 
          value: colorStops.map(color => new THREE.Color(color))
        }
      },
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      opacity: 0.3
    });

    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Position camera
    camera.position.z = 8;

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    hexMeshRef.current = hexMesh;
    lineMeshRef.current = lineMesh;

    return () => {
      renderer.dispose();
      hexGeometry.dispose();
      hexMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [gridDensity, rippleStrength, noise, perfMode, colorStops]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      
      if (!canvas || !renderer || !camera) return;
      
      const { offsetWidth, offsetHeight } = canvas;
      camera.aspect = offsetWidth / offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(offsetWidth, offsetHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mouse/touch movement
  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (!canvas) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      mouseRef.current.set(x, y);
      
      // Update shader uniforms
      if (hexMeshRef.current) {
        (hexMeshRef.current.material as THREE.ShaderMaterial).uniforms.mouse.value.copy(mouseRef.current);
      }
      if (lineMeshRef.current) {
        (lineMeshRef.current.material as THREE.ShaderMaterial).uniforms.mouse.value.copy(mouseRef.current);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handlePointerMove(e);
    const handleTouchMove = (e: TouchEvent) => handlePointerMove(e);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Device motion for mobile parallax
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) return;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (e.accelerationIncludingGravity) {
        const x = Math.max(-0.5, Math.min(0.5, (e.accelerationIncludingGravity.x || 0) / 20));
        const y = Math.max(-0.5, Math.min(0.5, (e.accelerationIncludingGravity.y || 0) / 20));
        setDeviceMotion(new THREE.Vector2(x, y));
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, []);

  // Parallax tilt effect
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const isMobile = window.innerWidth < 768;
    const tiltStrength = isMobile ? 0.02 : 0.05;
    
    if (isMobile) {
      // Use device motion on mobile
      camera.rotation.x = deviceMotion.y * tiltStrength;
      camera.rotation.y = deviceMotion.x * tiltStrength;
    } else {
      // Use mouse position on desktop
      const tiltX = mouseRef.current.y * tiltStrength;
      const tiltY = mouseRef.current.x * tiltStrength;
      camera.rotation.x = tiltX;
      camera.rotation.y = tiltY;
    }
  }, [deviceMotion]);

  // Animation loop
  useEffect(() => {
    if (!isVisible || !supportsWebGL || isPaused) return;

    const animate = () => {
      timeRef.current += 0.016; // ~60fps
      
      // Update shader uniforms
      if (hexMeshRef.current) {
        const material = hexMeshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.time.value = timeRef.current;
      }
      
      if (lineMeshRef.current) {
        const material = lineMeshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.time.value = timeRef.current;
      }
      
      // Render scene
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
  }, [isVisible, supportsWebGL, isPaused]);

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
    
    const handleChange = () => setIsPaused(mediaQuery.matches);
    
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!supportsWebGL) {
    // Fallback static SVG
    return (
      <div className="absolute inset-0 bg-gradient-hero opacity-40">
        <svg className="w-full h-full" viewBox="0 0 800 600">
          <defs>
            <pattern id="hexPattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon
                points="30,4 52,16 52,36 30,48 8,36 8,16"
                fill="none"
                stroke="hsl(180 100% 60%)"
                strokeWidth="1"
                opacity="0.4"
              />
              <circle
                cx="30"
                cy="26"
                r="2"
                fill="hsl(180 100% 70%)"
                opacity="0.6"
              />
            </pattern>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(200 50% 5%)" />
              <stop offset="100%" stopColor="hsl(220 50% 10%)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgGradient)" />
          <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
});

HexHero.displayName = 'HexHero';