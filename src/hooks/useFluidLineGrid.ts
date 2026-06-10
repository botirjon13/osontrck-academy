import { useEffect, type RefObject } from 'react';

interface Point {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function useFluidLineGrid(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const LINE_COLOR = 'rgba(138, 154, 176, 0.08)';
    const LINE_ACTIVE_COLOR = 'rgba(212, 168, 83, 0.25)';
    const GLOW_COLOR = 'rgba(212, 168, 83, 0.06)';
    const MOUSE_RADIUS = 150;
    const SPRING_STRENGTH = 0.08;
    const SPRING_DAMPING = 0.85;
    const RETURN_STRENGTH = 0.04;
    const GRID_DENSITY_X = 40;
    const GRID_DENSITY_Y = 30;

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * window.devicePixelRatio;
      canvas!.height = height * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);

      points = [];
      const cols = Math.floor(width / GRID_DENSITY_X);
      const rows = Math.floor(height / GRID_DENSITY_Y);
      const startX = (width - cols * GRID_DENSITY_X) / 2;
      const startY = (height - rows * GRID_DENSITY_Y) / 2;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = startX + i * GRID_DENSITY_X;
          const y = startY + j * GRID_DENSITY_Y;
          points.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
        }
      }
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function handleMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    function draw() {
      ctx!.fillStyle = '#0A1628';
      ctx!.fillRect(0, 0, width, height);

      if (mouse.x > 0) {
        const gradient = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400);
        gradient.addColorStop(0, GLOW_COLOR);
        gradient.addColorStop(1, 'rgba(10, 22, 40, 0)');
        ctx!.fillStyle = gradient;
        ctx!.fillRect(0, 0, width, height);
      }

      for (const point of points) {
        const dx = mouse.x - point.x;
        const dy = mouse.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && mouse.x > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          point.vx += dx * force * SPRING_STRENGTH;
          point.vy += dy * force * SPRING_STRENGTH;
        }

        point.vx += (point.ox - point.x) * RETURN_STRENGTH;
        point.vy += (point.oy - point.y) * RETURN_STRENGTH;

        point.vx *= SPRING_DAMPING;
        point.vy *= SPRING_DAMPING;

        point.x += point.vx;
        point.y += point.vy;
      }

      const cols = Math.floor(width / GRID_DENSITY_X);
      const rows = Math.floor(height / GRID_DENSITY_Y);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows - 1; j++) {
          const p1 = points[i * (rows + 1) + j];
          const p2 = points[i * (rows + 1) + (j + 1)];
          if (!p1 || !p2) continue;
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const dist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
          ctx!.strokeStyle = dist < MOUSE_RADIUS ? LINE_ACTIVE_COLOR : LINE_COLOR;
          ctx!.lineWidth = dist < MOUSE_RADIUS ? 1.5 : 0.5;
          ctx!.beginPath();
          ctx!.moveTo(p1.x, p1.y);
          ctx!.quadraticCurveTo(midX, midY, p2.x, p2.y);
          ctx!.stroke();
        }
      }

      for (let i = 0; i <= cols - 1; i++) {
        for (let j = 0; j <= rows; j++) {
          const p1 = points[i * (rows + 1) + j];
          const p2 = points[(i + 1) * (rows + 1) + j];
          if (!p1 || !p2) continue;
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const dist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
          ctx!.strokeStyle = dist < MOUSE_RADIUS ? LINE_ACTIVE_COLOR : LINE_COLOR;
          ctx!.lineWidth = dist < MOUSE_RADIUS ? 1.5 : 0.5;
          ctx!.beginPath();
          ctx!.moveTo(p1.x, p1.y);
          ctx!.quadraticCurveTo(midX, midY, p2.x, p2.y);
          ctx!.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    function init() {
      resize();
      draw();
    }

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    init();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);
}
