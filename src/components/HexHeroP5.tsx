import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import p5 from 'p5';

interface HexNode {
  q: number;
  r: number;
  x: number;
  y: number;
  neighbors: HexNode[];
  brightness: number;
  targetBrightness: number;
  breatheOffset: number;
  targetBreatheOffset: number;
}

interface HexHeroP5Props {
  /** Grid density - number of hex rings around center. Auto-reduced on small screens. @default 16 */
  gridDensity?: number;
  /** Strength of ripple effect (0-1). Auto-reduced on small screens. @default 0.6 */
  rippleStrength?: number;
  /** Strength of cursor glow effect (0-1). @default 0.8 */
  glowStrength?: number;
  /** Amount of idle noise shimmer (0-1). @default 0.2 */
  noiseAmt?: number;
  /** Performance mode: 'hi' = high quality, 'med' = balanced, 'low' = performance. @default 'hi' */
  perfMode?: 'hi' | 'med' | 'low';
}

export interface HexHeroP5Api {
  /** Pause the animation loop */
  pause: () => void;
  /** Resume the animation loop */
  resume: () => void;
}

export const HexHeroP5 = forwardRef<HexHeroP5Api, HexHeroP5Props>(({
  gridDensity = 16,
  rippleStrength = 0.6,
  glowStrength = 0.8,
  noiseAmt = 0.2,
  perfMode = 'hi'
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [supportsCanvas, setSupportsCanvas] = useState(true);

  // Auto-adjust settings based on screen size and performance mode
  const getOptimizedSettings = () => {
    const isSmallScreen = screenSize.width < 768;
    const isMediumScreen = screenSize.width < 1024;
    
    let adjustedGridDensity = gridDensity;
    let adjustedRippleStrength = rippleStrength;
    let targetFPS = 60;
    
    // Auto-reduce settings on small screens
    if (isSmallScreen) {
      adjustedGridDensity = Math.min(adjustedGridDensity * 0.6, 10);
      adjustedRippleStrength = adjustedRippleStrength * 0.7;
    } else if (isMediumScreen) {
      adjustedGridDensity = Math.min(adjustedGridDensity * 0.8, 14);
      adjustedRippleStrength = adjustedRippleStrength * 0.85;
    }
    
    // Performance mode adjustments
    switch (perfMode) {
      case 'hi':
        targetFPS = 60;
        break;
      case 'med':
        targetFPS = 45;
        adjustedGridDensity *= 0.8;
        break;
      case 'low':
        targetFPS = 30;
        adjustedGridDensity *= 0.6;
        adjustedRippleStrength *= 0.7;
        break;
    }
    
    return {
      gridDensity: Math.floor(adjustedGridDensity),
      rippleStrength: adjustedRippleStrength,
      targetFPS,
      perfMode
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

  useImperativeHandle(ref, () => ({
    pause: () => {
      setIsPaused(true);
      if (p5InstanceRef.current) {
        p5InstanceRef.current.noLoop();
      }
    },
    resume: () => {
      setIsPaused(false);
      if (p5InstanceRef.current && isVisible) {
        p5InstanceRef.current.loop();
      }
    }
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check canvas support
    try {
      const testCanvas = document.createElement('canvas');
      const ctx = testCanvas.getContext('2d');
      if (!ctx) {
        setSupportsCanvas(false);
        return;
      }
    } catch (error) {
      setSupportsCanvas(false);
      return;
    }

    const settings = getOptimizedSettings();
    
    // p5.js sketch
    const sketch = (p: p5) => {
      let hexNodes: HexNode[] = [];
      let mousePos = { x: 0, y: 0 };
      let targetMousePos = { x: 0, y: 0 };
      let ripples: Array<{ x: number; y: number; radius: number; alpha: number; maxRadius: number }> = [];
      let time = 0;
      let lastFrameTime = 0;
      const frameInterval = 1000 / settings.targetFPS;

      // Hex grid generation using axial coordinates
      const generateHexGrid = (density: number, hexSize: number) => {
        const nodes: HexNode[] = [];
        const nodeMap = new Map<string, HexNode>();

        // Generate nodes in hexagonal pattern
        for (let q = -density; q <= density; q++) {
          const r1 = Math.max(-density, -q - density);
          const r2 = Math.min(density, -q + density);
          
          for (let r = r1; r <= r2; r++) {
            // Axial to pixel coordinates
            const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
            const y = hexSize * (3/2 * r);
            
            const node: HexNode = {
              q, r, x, y,
              neighbors: [],
              brightness: 0.3,
              targetBrightness: 0.3,
              breatheOffset: 0,
              targetBreatheOffset: 0
            };
            
            nodes.push(node);
            nodeMap.set(`${q},${r}`, node);
          }
        }

        // Connect neighbors
        const neighborOffsets = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
        
        nodes.forEach(node => {
          neighborOffsets.forEach(([dq, dr]) => {
            const neighborKey = `${node.q + dq},${node.r + dr}`;
            const neighbor = nodeMap.get(neighborKey);
            if (neighbor) {
              node.neighbors.push(neighbor);
            }
          });
        });

        return nodes;
      };

      p.setup = () => {
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        
        // Generate hex grid
        const hexSize = settings.perfMode === 'low' ? 25 : 20;
        hexNodes = generateHexGrid(settings.gridDensity, hexSize);
        
        // Set framerate
        p.frameRate(settings.targetFPS);
        
        lastFrameTime = p.millis();
      };

      p.draw = () => {
        const currentTime = p.millis();
        const deltaTime = currentTime - lastFrameTime;
        
        // FPS limiting
        if (deltaTime < frameInterval) return;
        
        time += deltaTime * 0.001;
        lastFrameTime = currentTime;

        // Dark gradient background
        for (let i = 0; i <= p.height; i++) {
          const inter = p.map(i, 0, p.height, 0, 1);
          const c = p.lerpColor(
            p.color(15, 23, 42), // Dark blue-gray
            p.color(30, 41, 59), // Slightly lighter
            inter
          );
          p.stroke(c);
          p.line(0, i, p.width, i);
        }

        // Smooth mouse interpolation
        const lerpFactor = 0.1;
        mousePos.x = p.lerp(mousePos.x, targetMousePos.x, lerpFactor);
        mousePos.y = p.lerp(mousePos.y, targetMousePos.y, lerpFactor);

        // Update ripples
        ripples = ripples.filter(ripple => {
          ripple.radius += 3;
          ripple.alpha *= 0.95;
          return ripple.alpha > 0.01 && ripple.radius < ripple.maxRadius;
        });

        // Update node properties
        hexNodes.forEach(node => {
          const centerX = p.width / 2;
          const centerY = p.height / 2;
          const nodeX = centerX + node.x;
          const nodeY = centerY + node.y;
          
          // Base brightness with noise shimmer
          let baseBrightness = 0.3;
          if (settings.perfMode !== 'low' && noiseAmt > 0) {
            const noiseValue = p.noise(node.x * 0.01 + time * 0.2, node.y * 0.01 + time * 0.15);
            baseBrightness += noiseValue * noiseAmt * 0.3;
          }

          // Mouse glow effect
          const mouseDist = p.dist(mousePos.x, mousePos.y, nodeX, nodeY);
          const glowRadius = 150 * glowStrength;
          let glowBrightness = 0;
          
          if (mouseDist < glowRadius) {
            const normalizedDist = mouseDist / glowRadius;
            glowBrightness = (1 - normalizedDist * normalizedDist) * 0.7;
          }

          // Ripple effects
          let rippleBrightness = 0;
          let rippleBreathe = 0;
          
          ripples.forEach(ripple => {
            const rippleDist = p.dist(ripple.x, ripple.y, nodeX, nodeY);
            const ringWidth = 30;
            
            if (Math.abs(rippleDist - ripple.radius) < ringWidth) {
              const intensity = (1 - Math.abs(rippleDist - ripple.radius) / ringWidth) * ripple.alpha;
              rippleBrightness += intensity * settings.rippleStrength * 0.8;
              rippleBreathe += intensity * settings.rippleStrength * 8;
            }
          });

          // Set target values
          node.targetBrightness = p.constrain(baseBrightness + glowBrightness + rippleBrightness, 0, 1);
          node.targetBreatheOffset = rippleBreathe;

          // Smooth interpolation
          node.brightness = p.lerp(node.brightness, node.targetBrightness, 0.15);
          node.breatheOffset = p.lerp(node.breatheOffset, node.targetBreatheOffset, 0.2);
        });

        // Draw connections first (behind nodes)
        p.stroke(100, 200, 255, 30);
        p.strokeWeight(0.5);
        
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        
        hexNodes.forEach(node => {
          const nodeX = centerX + node.x;
          const nodeY = centerY + node.y;
          
          // Only draw to 3 neighbors to avoid duplicates
          node.neighbors.slice(0, 3).forEach(neighbor => {
            const neighborX = centerX + neighbor.x;
            const neighborY = centerY + neighbor.y;
            
            // Fade lines near mouse
            const midX = (nodeX + neighborX) / 2;
            const midY = (nodeY + neighborY) / 2;
            const mouseDist = p.dist(mousePos.x, mousePos.y, midX, midY);
            const alpha = p.map(mouseDist, 0, 200, 60, 15);
            
            p.stroke(100, 200, 255, alpha);
            p.line(nodeX, nodeY, neighborX, neighborY);
          });
        });

        // Draw nodes
        p.noStroke();
        
        hexNodes.forEach(node => {
          const nodeX = centerX + node.x + node.breatheOffset * p.cos(time * 2 + node.q);
          const nodeY = centerY + node.y + node.breatheOffset * p.sin(time * 2 + node.r);
          
          // Node glow
          const alpha = node.brightness * 255;
          const glowSize = 3 + node.brightness * 4;
          
          // Outer glow
          for (let r = glowSize; r > 0; r--) {
            const glowAlpha = (alpha / glowSize) * (glowSize - r + 1) * 0.3;
            p.fill(100, 200, 255, glowAlpha);
            p.circle(nodeX, nodeY, r * 2);
          }
          
          // Core
          p.fill(200, 255, 255, alpha);
          p.circle(nodeX, nodeY, 2);
        });
      };

      p.windowResized = () => {
        if (container) {
          p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        }
      };

      p.mouseMoved = () => {
        targetMousePos.x = p.mouseX;
        targetMousePos.y = p.mouseY;
        return false; // Don't prevent default
      };

      p.mousePressed = () => {
        // Create ripple
        ripples.push({
          x: p.mouseX,
          y: p.mouseY,
          radius: 0,
          alpha: 1,
          maxRadius: 300
        });
        return false; // Don't prevent default
      };

      p.touchMoved = () => {
        if (p.touches && p.touches.length > 0) {
          const touch = p.touches[0] as any; // p5.js touch type
          targetMousePos.x = touch.x;
          targetMousePos.y = touch.y;
        }
        return false; // Don't prevent default
      };
    };

    // Create p5 instance
    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [gridDensity, rippleStrength, glowStrength, noiseAmt, perfMode, screenSize]);

  // Intersection Observer for performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        
        if (p5InstanceRef.current) {
          if (entry.isIntersecting && !isPaused) {
            p5InstanceRef.current.loop();
          } else {
            p5InstanceRef.current.noLoop();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isPaused]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      const shouldPause = mediaQuery.matches;
      setIsPaused(shouldPause);
      
      if (p5InstanceRef.current) {
        if (shouldPause) {
          p5InstanceRef.current.noLoop();
        } else if (isVisible) {
          p5InstanceRef.current.loop();
        }
      }
    };
    
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isVisible]);

  if (!supportsCanvas) {
    // Fallback static pattern
    return (
      <div className="absolute inset-0 bg-gradient-hero opacity-40" aria-hidden="true">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 800 600"
          role="img" 
          aria-label="Hexagonal pattern background"
        >
          <defs>
            <pattern id="hexPatternP5" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon
                points="30,4 52,16 52,36 30,48 8,36 8,16"
                fill="none"
                stroke="hsl(200 100% 70%)"
                strokeWidth="1"
                opacity="0.4"
              />
              <circle
                cx="30"
                cy="26"
                r="2"
                fill="hsl(200 100% 80%)"
                opacity="0.6"
              />
            </pattern>
            <linearGradient id="bgGradientP5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(220 27% 8%)" />
              <stop offset="100%" stopColor="hsl(220 20% 12%)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgGradientP5)" />
          <rect width="100%" height="100%" fill="url(#hexPatternP5)" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      role="presentation"
      style={{ touchAction: 'none' }}
    />
  );
});

HexHeroP5.displayName = 'HexHeroP5';