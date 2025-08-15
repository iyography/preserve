import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  color: string;
}

export default function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      'rgba(147, 51, 234, 0.6)', // purple-600
      'rgba(124, 58, 237, 0.5)', // violet-600  
      'rgba(99, 102, 241, 0.4)', // indigo-500
      'rgba(168, 85, 247, 0.6)', // purple-500
      'rgba(139, 92, 246, 0.5)', // violet-500
      'rgba(196, 181, 253, 0.7)', // purple-200
      'rgba(221, 214, 254, 0.6)', // purple-100
      'rgba(192, 192, 192, 0.8)', // silver
      'rgba(169, 169, 169, 0.6)', // dark gray (silver)
      'rgba(211, 211, 211, 0.7)', // light gray (silver)
      'rgba(220, 220, 220, 0.5)', // gainsboro (light silver)
      'rgba(128, 0, 128, 0.4)',   // deep purple
      'rgba(75, 0, 130, 0.3)',    // indigo
      'rgba(138, 43, 226, 0.5)',  // blue violet
      'rgba(186, 85, 211, 0.4)'   // medium orchid
    ];

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        size: Math.random() * 2 + 0.5, // Smaller particles for fairy dust effect
        opacity: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    const updateParticle = (particle: Particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Fade in and out
      if (particle.life < particle.maxLife * 0.1) {
        particle.opacity = particle.life / (particle.maxLife * 0.1);
      } else if (particle.life > particle.maxLife * 0.9) {
        particle.opacity = 1 - (particle.life - particle.maxLife * 0.9) / (particle.maxLife * 0.1);
      } else {
        particle.opacity = 1;
      }

      // Add some drift and sparkle motion
      particle.vx += (Math.random() - 0.5) * 0.03;
      particle.vy += (Math.random() - 0.5) * 0.02;
      
      // Add gentle floating motion
      particle.x += Math.sin(particle.life * 0.02) * 0.5;
      particle.y += Math.cos(particle.life * 0.015) * 0.3;

      return particle.life < particle.maxLife && 
             particle.y > -10 && 
             particle.x > -10 && 
             particle.x < canvas.width + 10;
    };

    const drawParticle = (particle: Particle) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      
      // Create glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add inner bright spot
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles - much more frequent for fairy dust effect
      if (Math.random() < 0.8) {
        particlesRef.current.push(createParticle());
      }
      
      // Add some particles from random positions for fuller effect
      if (Math.random() < 0.3) {
        const sideParticle = createParticle();
        sideParticle.x = Math.random() < 0.5 ? -10 : canvas.width + 10;
        sideParticle.y = Math.random() * canvas.height;
        sideParticle.vx = sideParticle.x < 0 ? Math.random() * 2 + 0.5 : -(Math.random() * 2 + 0.5);
        sideParticle.vy = (Math.random() - 0.5) * 1;
        particlesRef.current.push(sideParticle);
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        const alive = updateParticle(particle);
        if (alive) {
          drawParticle(particle);
        }
        return alive;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
