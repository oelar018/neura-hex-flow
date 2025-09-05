import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

interface HexHeroProps {
  /** Grid density - number of hex nodes in each direction. Auto-reduced on small screens. @default 20 */
  gridDensity?: number;
  /** Strength of ripple effect on pointer interaction. Auto-reduced on small screens. @default 1.0 */
  rippleStrength?: number;
  /** Array of hex color strings for gradient effect. @default ['#00ffff', '#0080ff', '#004080'] */
  colorStops?: string[];
  /** Amount of shimmer noise animation. @default 0.3 */
  noise?: number;
  /** Performance mode: 'hi' = high quality, 'med' = balanced, 'low' = performance. @default 'hi' */
  perfMode?: 'hi' | 'med' | 'low';
}

export interface HexHeroApi {
  /** Pause the animation loop */
  pause: () => void;
  /** Resume the animation loop */
  resume: () => void;
}

export const HexHero = forwardRef<HexHeroApi, HexHeroProps>(({
  gridDensity = 20,
  rippleStrength = 1.0,
  colorStops = ['#00ffff', '#0080ff', '#004080'],
  noise = 0.3,
  perfMode = 'hi'
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const hexMeshRef = useRef<THREE.InstancedMesh>();
  const lineMeshRef = useRef<THREE.LineSegments>();
  const animationRef = useRef<number>();
  const mouseRef = useRef(new THREE.Vector2());
  const targetMouseRef = useRef(new THREE.Vector2());
  const timeRef = useRef(0);
  const rippleTimeRef = useRef(0);
  const lastFrameTime = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [deviceMotion, setDeviceMotion] = useState(new THREE.Vector2());
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  // Auto-adjust settings based on screen size and performance mode
  const getOptimizedSettings = () => {
    const isSmallScreen = screenSize.width < 768;
    const isMediumScreen = screenSize.width < 1024;
    
    let adjustedGridDensity = gridDensity;
    let adjustedRippleStrength = rippleStrength;
    let targetFPS = 60;
    let pixelRatio = 1;
    let antialias = true;
    
    // Auto-reduce settings on small screens
    if (isSmallScreen) {
      adjustedGridDensity = Math.min(adjustedGridDensity * 0.6, 15);
      adjustedRippleStrength = adjustedRippleStrength * 0.7;
    } else if (isMediumScreen) {
      adjustedGridDensity = Math.min(adjustedGridDensity * 0.8, 18);
      adjustedRippleStrength = adjustedRippleStrength * 0.85;
    }
    
    // Performance mode adjustments
    switch (perfMode) {
      case 'hi':
        pixelRatio = Math.min(window.devicePixelRatio, 2);
        targetFPS = 60;
        antialias = true;
        break;
      case 'med':
        pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        targetFPS = 45;
        antialias = !isSmallScreen;
        adjustedGridDensity *= 0.8;
        break;
      case 'low':
        pixelRatio = 1;
        targetFPS = 30;
        antialias = false;
        adjustedGridDensity *= 0.6;
        adjustedRippleStrength *= 0.7;
        break;
    }
    
    return {
      gridDensity: Math.floor(adjustedGridDensity),
      rippleStrength: adjustedRippleStrength,
      targetFPS,
      pixelRatio,
      antialias
    };
  };

  // Track screen size
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Hex grid generation
  const generateHexGrid = (density: number) => {
    const positions = [];
    const connections = [];
    const hexSize = 0.8;
    const spacing = 1.5;
    
    // Generate hexagonal grid positions
    for (let q = -density; q <= density; q++) {
      for (let r = -density; r <= density; r++) {
        if (Math.abs(q + r) <= density) {
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

  // Enhanced vertex shader for hex nodes with smooth interpolation
  const hexVertexShader = `
    uniform float time;
    uniform vec2 mouse;
    uniform vec2 targetMouse;
    uniform float rippleStrength;
    uniform float noise;
    uniform float rippleRadius;
    attribute float instanceIndex;
    varying float vDistance;
    varying float vIntensity;
    varying vec3 vPosition;
    varying float vGlowFactor;
    
    // Enhanced noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(random(i), random(i + vec2(1.0, 0.0)), f.x),
                 mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    
    void main() {
      vec3 pos = position + instanceMatrix[3].xyz;
      vPosition = pos;
      
      // Smooth mouse interpolation for trails
      vec2 smoothMouse = mix(mouse, targetMouse, 0.8);
      
      // Distance from smooth mouse position
      vDistance = distance(pos.xy, smoothMouse * 10.0 - vec2(5.0, 5.0));
      
      // Enhanced mouse influence with smooth falloff
      float mouseInfluence = 1.0 - smoothstep(0.0, 4.0, vDistance);
      mouseInfluence = pow(mouseInfluence, 2.0); // Smoother falloff
      
      // Expanding/decaying ripple effect
      float rippleDistance = abs(vDistance - rippleRadius);
      float ripple = exp(-rippleDistance * 1.5) * sin(rippleDistance * 3.0 - time * 8.0);
      ripple *= rippleStrength * 0.5;
      
      // Enhanced shimmer with multiple octaves
      float shimmer = smoothNoise(pos.xy * 2.0 + time * 0.1) * 0.3;
      shimmer += smoothNoise(pos.xy * 4.0 + time * 0.15) * 0.2;
      shimmer *= noise;
      
      // Oscillation for nearby nodes with phase variation
      float oscillation = sin(time * 2.0 + instanceIndex * 0.1 + pos.x * 0.5) * mouseInfluence * 0.15;
      pos.z += oscillation;
      
      // Calculate intensity with bloom factor
      vIntensity = 0.15 + ripple + shimmer + mouseInfluence * 0.6;
      
      // Glow factor for fragment shader bloom
      vGlowFactor = mouseInfluence * exp(-vDistance * 0.3);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Enhanced fragment shader with additive bloom and smoothstep falloff
  const hexFragmentShader = `
    uniform vec3 colorStops[3];
    uniform float time;
    varying float vDistance;
    varying float vIntensity;
    varying vec3 vPosition;
    varying float vGlowFactor;
    
    void main() {
      // Soft circular gradient for node with enhanced falloff
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      float alpha = 1.0 - smoothstep(0.2, 0.6, dist);
      
      // Enhanced color mixing with bloom
      vec3 baseColor = mix(colorStops[2], mix(colorStops[1], colorStops[0], vIntensity), vIntensity);
      
      // Additive bloom effect with smoothstep falloff
      float bloomRadius = 2.0 + vGlowFactor * 3.0;
      float bloom = exp(-vDistance * 0.2) * vGlowFactor;
      bloom = smoothstep(0.0, bloomRadius, bloom);
      
      // Time-based shimmer enhancement
      float shimmer = sin(time * 3.0 + vPosition.x + vPosition.y) * 0.1 + 0.9;
      
      // Combine effects with enhanced glow
      vec3 glowColor = colorStops[0] * bloom * 1.5;
      vec3 finalColor = baseColor + glowColor;
      finalColor *= shimmer;
      
      // Enhanced alpha with glow contribution
      float finalAlpha = alpha * (vIntensity + bloom * 0.5);
      
      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  // Enhanced line shader with smooth opacity transitions
  const lineVertexShader = `
    uniform float time;
    uniform vec2 mouse;
    uniform float rippleRadius;
    varying float vOpacity;
    varying float vGlow;
    
    void main() {
      vec3 pos = position;
      
      // Distance from mouse for line opacity with smooth transitions
      float mouseDistance = distance(pos.xy, mouse * 10.0 - vec2(5.0, 5.0));
      vOpacity = 0.05 + (1.0 - smoothstep(0.0, 5.0, mouseDistance)) * 0.4;
      
      // Ripple effect on lines
      float rippleEffect = exp(-abs(mouseDistance - rippleRadius) * 0.8) * 0.3;
      vGlow = rippleEffect;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const lineFragmentShader = `
    uniform vec3 colorStops[3];
    varying float vOpacity;
    varying float vGlow;
    
    void main() {
      vec3 color = mix(colorStops[2], colorStops[1], vOpacity + vGlow);
      gl_FragColor = vec4(color, vOpacity + vGlow * 0.5);
    }
  `;

  useImperativeHandle(ref, () => ({
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false)
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevent context conflicts during hot reload
    const existingContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (existingContext && rendererRef.current) {
      // Clean up existing renderer first
      rendererRef.current.dispose();
      rendererRef.current = undefined;
    }

    // Check WebGL support
    let gl;
    try {
      gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (error) {
      console.warn('WebGL context creation failed:', error);
    }
    
    if (!gl) {
      setSupportsWebGL(false);
      return;
    }

    // Get optimized settings
    const settings = getOptimizedSettings();

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true, 
      antialias: settings.antialias,
      powerPreference: perfMode === 'hi' ? 'high-performance' : 'low-power'
    });
    
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(settings.pixelRatio);
    renderer.setClearColor(0x000000, 0);

    // Generate hex grid with optimized density
    const { positions, connections } = generateHexGrid(settings.gridDensity);

    // Create hex node geometry and material
    const hexGeometry = new THREE.CircleGeometry(0.05, 6);
    const hexMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() },
        targetMouse: { value: new THREE.Vector2() },
        rippleStrength: { value: settings.rippleStrength },
        noise: { value: noise },
        rippleRadius: { value: 0 },
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
    });
    
    // Set instance index for shader
    hexMesh.geometry.setAttribute('instanceIndex', 
      new THREE.InstancedBufferAttribute(new Float32Array(positions.map((_, idx) => idx)), 1)
    );
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
        rippleRadius: { value: 0 },
        colorStops: { 
          value: colorStops.map(color => new THREE.Color(color))
        }
      },
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true
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

    // Store target FPS
    lastFrameTime.current = performance.now();

    return () => {
      try {
        renderer.dispose();
        hexGeometry.dispose();
        hexMaterial.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
      } catch (error) {
        // Silently handle disposal errors
      }
    };
  }, [gridDensity, rippleStrength, noise, perfMode, colorStops, screenSize]);

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

  // Enhanced mouse/touch movement with smooth interpolation
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
      
      // Set target mouse for smooth interpolation
      targetMouseRef.current.set(x, y);
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

  // Enhanced animation loop with FPS limiting and smooth interpolation
  useEffect(() => {
    if (!isVisible || !supportsWebGL || isPaused) return;

    const settings = getOptimizedSettings();
    const frameInterval = 1000 / settings.targetFPS;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime.current;
      
      // FPS limiting
      if (deltaTime >= frameInterval) {
        timeRef.current += deltaTime * 0.001;
        
        // Smooth mouse interpolation
        mouseRef.current.lerp(targetMouseRef.current, 0.1);
        
        // Update ripple radius with expanding/decaying pattern
        rippleTimeRef.current += deltaTime * 0.003;
        const rippleRadius = Math.sin(rippleTimeRef.current * 2) * 3 + 3;
        
        // Update shader uniforms
        if (hexMeshRef.current) {
          const material = hexMeshRef.current.material as THREE.ShaderMaterial;
          material.uniforms.time.value = timeRef.current;
          material.uniforms.mouse.value.copy(mouseRef.current);
          material.uniforms.targetMouse.value.copy(targetMouseRef.current);
          material.uniforms.rippleRadius.value = rippleRadius;
        }
        
        if (lineMeshRef.current) {
          const material = lineMeshRef.current.material as THREE.ShaderMaterial;
          material.uniforms.time.value = timeRef.current;
          material.uniforms.mouse.value.copy(mouseRef.current);
          material.uniforms.rippleRadius.value = rippleRadius;
        }
        
        // Render scene
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        
        lastFrameTime.current = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, supportsWebGL, isPaused, screenSize, gridDensity, rippleStrength, perfMode]);

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
    // Fallback static SVG with enhanced accessibility
    return (
      <div className="absolute inset-0 bg-gradient-hero opacity-40" aria-hidden="true">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 800 600"
          role="img" 
          aria-label="Hexagonal pattern background"
        >
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
        aria-hidden="true"
        tabIndex={-1}
        role="presentation"
      />
    </div>
  );
});

HexHero.displayName = 'HexHero';