import React, { useEffect, useRef } from 'react';

export const LiquidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Liquid droplets / refraction bubbles
    const droplets = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 120 + 60,
      phase: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.008
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Deep obsidian void base
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.3,
        10,
        width / 2,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#090c12');
      bgGrad.addColorStop(0.6, '#050608');
      bgGrad.addColorStop(1, '#020304');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Interactive mouse liquid glare (colorless white specular glow)
      const mouseGrad = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        380
      );
      mouseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.055)');
      mouseGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.018)');
      mouseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle colorless liquid refractive blobs
      droplets.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        d.phase += d.speed;

        // Wrap around boundaries
        if (d.x < -d.radius) d.x = width + d.radius;
        if (d.x > width + d.radius) d.x = -d.radius;
        if (d.y < -d.radius) d.y = height + d.radius;
        if (d.y > height + d.radius) d.y = -d.radius;

        const currentRadius = d.radius + Math.sin(d.phase) * 15;

        const blobGrad = ctx.createRadialGradient(
          d.x - currentRadius * 0.2,
          d.y - currentRadius * 0.2,
          currentRadius * 0.05,
          d.x,
          d.y,
          currentRadius
        );
        blobGrad.addColorStop(0, 'rgba(255, 255, 255, 0.035)');
        blobGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.008)');
        blobGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = blobGrad;
        ctx.fill();
      });

      // Subtle liquid caustic noise lattice
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      {/* Precision hairline grid for structural clarity */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Specular horizontal light streak */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};
