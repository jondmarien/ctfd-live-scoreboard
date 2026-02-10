import { useEffect, useRef } from "react";

interface FogProps {
  color?: string;
  opacity?: number;
  speed?: number;
  className?: string;
}

export default function Fog({
  color = "rgba(255, 160, 60, 0.04)",
  opacity = 0.5,
  speed = 1,
  className = "",
}: FogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const layers = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: canvas.height * (0.3 + i * 0.15),
      radius: 200 + Math.random() * 300,
      speedX: (0.15 + Math.random() * 0.25) * speed * (i % 2 === 0 ? 1 : -1),
      speedY: Math.sin(i) * 0.1 * speed,
      phase: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      layers.forEach((layer) => {
        layer.x += layer.speedX;
        layer.phase += 0.005 * speed;
        layer.y += Math.sin(layer.phase) * 0.5;

        if (layer.speedX > 0 && layer.x > canvas.width + layer.radius) {
          layer.x = -layer.radius;
        } else if (layer.speedX < 0 && layer.x < -layer.radius) {
          layer.x = canvas.width + layer.radius;
        }

        ctx.save();
        ctx.globalAlpha = opacity * (0.3 + Math.sin(layer.phase) * 0.15);
        const gradient = ctx.createRadialGradient(
          layer.x,
          layer.y,
          0,
          layer.x,
          layer.y,
          layer.radius,
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(
          layer.x - layer.radius,
          layer.y - layer.radius,
          layer.radius * 2,
          layer.radius * 2,
        );
        ctx.restore();
      });

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [color, opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-[5] ${className}`}
    />
  );
}
