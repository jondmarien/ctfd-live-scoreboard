import { useEffect, useRef } from "react";

interface FirefliesProps {
  count?: number;
  colors?: string[];
  sizeRange?: [number, number];
  className?: string;
}

export default function Fireflies({
  count = 35,
  colors = ["#FFB347", "#FF8C42", "#FFD700", "#FF6B35", "#FFA500"],
  sizeRange = [2, 6],
  className = "",
}: FirefliesProps) {
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

    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      opacity: number;
      opacityDir: number;
      wobble: number;
      wobbleSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size =
          sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = -0.2 - Math.random() * 0.6;
        this.opacity = Math.random() * 0.7 + 0.1;
        this.opacityDir = Math.random() > 0.5 ? 0.003 : -0.003;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.01 + Math.random() * 0.02;
      }

      update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.3;
        this.y += this.speedY;
        this.opacity += this.opacityDir;
        if (this.opacity >= 0.8 || this.opacity <= 0.05) this.opacityDir *= -1;
        this.opacity = Math.max(0.02, Math.min(0.8, this.opacity));

        if (this.y < -20 || this.x < -20 || this.x > canvas!.width + 20) {
          this.x = Math.random() * canvas!.width;
          this.y = canvas!.height + 10 + Math.random() * 40;
          this.opacity = 0.05;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: count }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count, colors, sizeRange]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-10 ${className}`}
    />
  );
}
