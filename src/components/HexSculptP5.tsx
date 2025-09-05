import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

interface HexSculptP5Props {
  rings?: number;
  dotSize?: number;
  glowStrength?: number;
  idleSpeed?: number;
  focusCount?: number;
  noiseAmt?: number;
  perfMode?: 'auto' | 'hi' | 'med' | 'low';
}

interface Dot {
  x: number;
  y: number;
  q: number;
  r: number;
  ring: number;
  baseSize: number;
  baseAlpha: number;
  glowAlpha: number;
  breathePhase: number;
}

export const HexSculptP5: React.FC<HexSculptP5Props> = ({
  rings = 10,
  dotSize = 3.0,
  glowStrength = 0.8,
  idleSpeed = 0.002,
  focusCount = 60,
  noiseAmt = 0.15,
  perfMode = 'auto'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let dots: Dot[] = [];
    let globalRotation = 0;
    let mouseX = 0;
    let mouseY = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let sculptureScale = 1;
    let actualRings = rings;
    let actualDotSize = dotSize;
    let tiltX = 0;
    let tiltY = 0;
    let ripples: Array<{ x: number; y: number; radius: number; alpha: number; maxRadius: number }> = [];
    let lastMouseSpeed = 0;
    
    // Performance adjustments
    const adjustForPerformance = (width: number, height: number) => {
      const isMobile = width < 768;
      
      switch (perfMode) {
        case 'low':
          actualRings = Math.max(4, Math.floor(rings * 0.5));
          actualDotSize = dotSize * 0.8;
          break;
        case 'med':
          actualRings = Math.max(6, Math.floor(rings * 0.7));
          actualDotSize = dotSize * 0.9;
          break;
        case 'hi':
          actualRings = rings;
          actualDotSize = dotSize;
          break;
        case 'auto':
        default:
          if (isMobile) {
            actualRings = Math.max(6, Math.min(8, rings));
            actualDotSize = dotSize * 0.8;
          } else {
            actualRings = Math.max(9, Math.min(12, rings));
            actualDotSize = dotSize;
          }
          break;
      }
    };

    // Generate hexagonal rings
    const generateHexRings = (centerX: number, centerY: number, scale: number) => {
      dots = [];
      
      // Center dot
      dots.push({
        x: centerX,
        y: centerY,
        q: 0,
        r: 0,
        ring: 0,
        baseSize: actualDotSize * 1.2,
        baseAlpha: 0.9,
        glowAlpha: 0,
        breathePhase: Math.random() * Math.PI * 2
      });

      // Generate concentric rings
      for (let ring = 1; ring <= actualRings; ring++) {
        // Generate the 6 sides of the hexagon
        for (let side = 0; side < 6; side++) {
          for (let i = 0; i < ring; i++) {
            let q: number, r: number;
            
            // Calculate axial coordinates for each side
            switch (side) {
              case 0: q = ring - i; r = i; break;           // Top right
              case 1: q = -i; r = ring; break;              // Right
              case 2: q = -ring; r = ring - i; break;       // Bottom right
              case 3: q = -ring + i; r = -i; break;         // Bottom left
              case 4: q = i; r = -ring; break;              // Left
              case 5: q = ring; r = -ring + i; break;       // Top left
              default: q = 0; r = 0;
            }
            
            // Convert axial to pixel coordinates
            const pixelX = scale * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
            const pixelY = scale * (3/2 * r);
            
            // Size and brightness based on ring distance from center
            const ringNorm = ring / actualRings;
            const size = actualDotSize * (1.2 - ringNorm * 0.4); // Inner rings larger
            const alpha = 0.8 - ringNorm * 0.4; // Inner rings brighter
            
            dots.push({
              x: centerX + pixelX,
              y: centerY + pixelY,
              q,
              r,
              ring,
              baseSize: size,
              baseAlpha: alpha,
              glowAlpha: 0,
              breathePhase: Math.random() * Math.PI * 2
            });
          }
        }
      }
    };

    const sketch = (p: p5) => {
      p.setup = () => {
        const container = containerRef.current!;
        canvasWidth = container.offsetWidth;
        canvasHeight = container.offsetHeight;
        
        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent(container);
        
        adjustForPerformance(canvasWidth, canvasHeight);
        
        // Calculate scale to fit sculpture nicely
        const minDim = Math.min(canvasWidth, canvasHeight);
        sculptureScale = (minDim * 0.3) / actualRings; // Adjust as needed
        
        generateHexRings(canvasWidth / 2, canvasHeight / 2, sculptureScale);
        
        // Set up canvas attributes
        canvas.attribute('aria-hidden', 'true');
        canvas.style('pointer-events', 'none');
      };

      p.draw = () => {
        if (!isVisible) return;
        
        p.clear();
        
        // Update global rotation (idle motion)
        if (!prefersReducedMotion) {
          globalRotation += idleSpeed;
        }
        
        // Update tilt based on mouse position
        const isMobile = canvasWidth < 768;
        if (!isMobile && !prefersReducedMotion) {
          const targetTiltX = (mouseY - canvasHeight / 2) / canvasHeight * 0.1; // ±6° ≈ 0.1 rad
          const targetTiltY = (mouseX - canvasWidth / 2) / canvasWidth * 0.1;
          tiltX += (targetTiltX - tiltX) * 0.05;
          tiltY += (targetTiltY - tiltY) * 0.05;
        }
        
        // Update mouse influence
        dots.forEach(dot => {
          const dx = dot.x - mouseX;
          const dy = dot.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Smooth falloff for glow
          const maxGlowDistance = 120;
          if (distance < maxGlowDistance) {
            const influence = 1 - (distance / maxGlowDistance);
            const smoothInfluence = influence * influence * (3 - 2 * influence); // smoothstep
            dot.glowAlpha = smoothInfluence * glowStrength;
          } else {
            dot.glowAlpha *= 0.95; // Fade out
          }
        });
        
        // Update ripples
        if (!prefersReducedMotion) {
          ripples = ripples.filter(ripple => {
            ripple.radius += 3;
            ripple.alpha *= 0.98;
            return ripple.alpha > 0.01 && ripple.radius < ripple.maxRadius;
          });
        }
        
        // Setup transforms
        p.push();
        p.translate(canvasWidth / 2, canvasHeight / 2);
        p.rotate(globalRotation);
        
        // Apply subtle tilt
        if (!prefersReducedMotion) {
          p.rotateX(tiltX);
          p.rotateY(tiltY);
        }
        
        p.translate(-canvasWidth / 2, -canvasHeight / 2);
        
        // Draw ripples
        if (!prefersReducedMotion) {
          ripples.forEach(ripple => {
            p.push();
            p.stroke(0, 255, 255, ripple.alpha * 50);
            p.strokeWeight(1);
            p.noFill();
            p.ellipse(ripple.x, ripple.y, ripple.radius * 2);
            p.pop();
          });
        }
        
        // Draw dots with additive blending
        p.blendMode(p.ADD);
        
        dots.forEach(dot => {
          // Calculate shimmer
          let shimmer = 1;
          if (!prefersReducedMotion) {
            shimmer = 1 + Math.sin(p.frameCount * 0.02 + dot.breathePhase) * noiseAmt;
          }
          
          // Base dot
          const totalAlpha = (dot.baseAlpha + dot.glowAlpha) * 255 * shimmer;
          p.fill(0, 255, 255, totalAlpha * 0.6); // Cyan/teal
          p.noStroke();
          
          const breatheSize = dot.glowAlpha > 0 ? dot.baseSize + 1 : dot.baseSize;
          p.ellipse(dot.x, dot.y, breatheSize * shimmer);
          
          // Glow effect
          if (dot.glowAlpha > 0) {
            p.fill(0, 255, 255, dot.glowAlpha * 80);
            p.ellipse(dot.x, dot.y, breatheSize * 2.5 * shimmer);
            
            p.fill(0, 255, 255, dot.glowAlpha * 40);
            p.ellipse(dot.x, dot.y, breatheSize * 4 * shimmer);
          }
        });
        
        p.pop();
        p.blendMode(p.BLEND);
      };

      p.windowResized = () => {
        const container = containerRef.current!;
        canvasWidth = container.offsetWidth;
        canvasHeight = container.offsetHeight;
        
        p.resizeCanvas(canvasWidth, canvasHeight);
        adjustForPerformance(canvasWidth, canvasHeight);
        
        const minDim = Math.min(canvasWidth, canvasHeight);
        sculptureScale = (minDim * 0.3) / actualRings;
        
        generateHexRings(canvasWidth / 2, canvasHeight / 2, sculptureScale);
      };
    };

    // Mouse tracking on parent element
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const newMouseX = e.clientX - rect.left;
      const newMouseY = e.clientY - rect.top;
      
      // Calculate mouse speed for ripple effect
      const dx = newMouseX - mouseX;
      const dy = newMouseY - mouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastMouseSpeed = speed;
      
      mouseX = newMouseX;
      mouseY = newMouseY;
      
      // Add ripple on fast movement
      if (!prefersReducedMotion && speed > 15 && ripples.length < 3) {
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 0,
          alpha: 1,
          maxRadius: 200
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = containerRef.current!.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
      }
    };

    // Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (p5InstanceRef.current) {
          if (entry.isIntersecting) {
            p5InstanceRef.current.loop();
          } else {
            p5InstanceRef.current.noLoop();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    
    // Add event listeners
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Initialize p5
    p5InstanceRef.current = new p5(sketch);

    return () => {
      observer.disconnect();
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('touchmove', handleTouchMove);
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [rings, dotSize, glowStrength, idleSpeed, focusCount, noiseAmt, perfMode, isVisible, prefersReducedMotion]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0A0A0A' }}
    />
  );
};