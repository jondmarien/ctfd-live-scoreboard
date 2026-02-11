import React, { useRef, useEffect } from 'react';

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const canvasSize = 256;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    };

    // Reuse a single ImageData buffer instead of allocating a new one every frame
    let imageData: ImageData | null = null;
    const drawGrain = () => {
      if (!imageData) {
        imageData = ctx.createImageData(canvasSize, canvasSize);
      }
      const buf = new Uint32Array(imageData.data.buffer);
      const alpha = (patternAlpha & 0xff) << 24;
      for (let i = 0, len = buf.length; i < len; i++) {
        const v = (Math.random() * 255) | 0;
        buf[i] = alpha | (v << 16) | (v << 8) | v;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    // Use setInterval at the target framerate instead of burning a rAF slot every
    // frame just to skip 3 out of 4. At refreshInterval=4 this targets ~15fps.
    const intervalMs = (1000 / 60) * patternRefreshInterval;
    const intervalId = setInterval(drawGrain, intervalMs);

    window.addEventListener('resize', resize);
    resize();
    drawGrain();

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      className="pointer-events-none absolute top-0 left-0 h-screen w-screen"
      ref={grainRef}
      style={{
        imageRendering: 'pixelated'
      }}
    />
  );
};

export default Noise;
