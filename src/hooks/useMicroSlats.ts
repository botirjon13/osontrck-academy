import { useEffect, type RefObject } from 'react';

export function useMicroSlats(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colors = ['#101c2a', '#172233', '#232a32', '#34332f', '#4a3d2b', '#66512e', '#8b7041', '#b5a77e'];
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let pitchX = 0;
    let pitchY = 0;
    let startX = 0;
    let startY = 0;
    let lastFrame = 0;
    const pointer = { x: -1000, y: -1000 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * pixelRatio);
      canvas!.height = Math.round(height * pixelRatio);
      ctx!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      pitchX = Math.max(8, width / 82);
      pitchY = Math.max(17, height / 36);
      columns = Math.ceil(width / pitchX) + 1;
      rows = Math.ceil(height / pitchY) + 1;
      startX = (width - (columns - 1) * pitchX) / 2;
      startY = (height - (rows - 1) * pitchY) / 2;
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    }

    function clearPointer() {
      pointer.x = -1000;
      pointer.y = -1000;
    }

    function draw(now: number) {
      if (now - lastFrame < 32) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;

      ctx!.fillStyle = '#0A1628';
      ctx!.fillRect(0, 0, width, height);

      const time = reduceMotion.matches ? 0 : now * 0.00045;
      const pointerEnabled = !reduceMotion.matches;
      const slatWidth = pitchX * 0.72;
      const cornerRadius = Math.min(slatWidth / 2, 4);

      for (let column = 0; column < columns; column++) {
        for (let row = 0; row < rows; row++) {
          const x = startX + column * pitchX;
          const y = startY + row * pitchY;
          const phase = x * 0.012 + y * 0.019 - time;
          const wave = Math.sin(phase) * 0.5 + 0.5;
          const crest = Math.sin(phase * 0.58 + 1.2) * 0.5 + 0.5;
          const distance = Math.hypot(pointer.x - x, pointer.y - y);
          const pointerGlow = pointerEnabled
            ? Math.max(0, 1 - distance / 190) * 0.3
            : 0;
          const shade = Math.min(
            colors.length - 1,
            Math.floor(wave * 2.8 + crest * 1 + pointerGlow * 1.5),
          );
          const verticalOffset = reduceMotion.matches
            ? 0
            : Math.sin(phase * 0.7) * 1.5;
          const cellHeight = pitchY * (0.78 + wave * 0.12);

          ctx!.fillStyle = colors[shade];
          ctx!.beginPath();
          ctx!.roundRect(
            x,
            y + verticalOffset,
            slatWidth,
            cellHeight,
            cornerRadius,
          );
          ctx!.fill();
        }
      }

      const vignette = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.48,
        height * 0.08,
        width * 0.5,
        height * 0.48,
        width * 0.75,
      );
      vignette.addColorStop(0, 'rgba(10, 22, 40, 0.42)');
      vignette.addColorStop(0.65, 'rgba(10, 22, 40, 0.24)');
      vignette.addColorStop(1, 'rgba(10, 22, 40, 0.1)');
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(draw);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastFrame = 0;
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    resize();
    animationFrameId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', clearPointer);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', clearPointer);
    };
  }, [canvasRef]);
}
