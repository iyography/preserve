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

    // Get the hero section height instead of full window
    const heroSection = document.getElementById('home');
    
    const resizeCanvas = () => {
      if (heroSection) {
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
      } else {
        // Fallback to viewport height if hero section not found
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      '#ffffff',  // pure white - heavenly
      '#f8fafc',  // very light blue-white
      '#f1f5f9',  // soft white with hint of blue
      '#e2e8f0',  // light silver
      '#cbd5e1',  // subtle silver-blue
      '#94a3b8',  // soft gray-blue
      '#e0f2fe',  // very light sky blue
      '#bae6fd',  // light celestial blue
      '#7dd3fc',  // soft sky blue
      '#38bdf8',  // bright celestial blue
      '#0ea5e9',  // vivid sky blue
      '#0284c7'   // deep celestial blue
    ];

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        size: Math.random() * 1.5 + 0.3, // Tiny fairy dust - 0.3-1.8px
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
      
      // Create heavenly fairy dust effect with sparkly glow
      
      // Outer ethereal glow - large and soft
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Medium celestial glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      ctx.fillStyle = particle.color.includes('rgb') ? particle.color.replace('rgb', 'rgba').replace(')', ', 0.6)') : particle.color + '99';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Bright center - tiny sparkle
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add tiny star twinkle effect
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(particle.x - particle.size * 2, particle.y);
      ctx.lineTo(particle.x + particle.size * 2, particle.y);
      ctx.moveTo(particle.x, particle.y - particle.size * 2);
      ctx.lineTo(particle.x, particle.y + particle.size * 2);
      ctx.stroke();
      
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new fairy dust occasionally for subtle heavenly effect  
      if (Math.random() < 0.3) {
        particlesRef.current.push(createParticle());
      }
      
      // Add occasional sparkles from sides
      if (Math.random() < 0.1) {
        const sideParticle = createParticle();
        sideParticle.x = Math.random() < 0.5 ? -10 : canvas.width + 10;
        sideParticle.y = Math.random() * canvas.height;
        sideParticle.vx = sideParticle.x < 0 ? Math.random() * 1.5 + 0.3 : -(Math.random() * 1.5 + 0.3);
        sideParticle.vy = (Math.random() - 0.5) * 0.8;
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
      className="absolute inset-0 pointer-events-none z-0"
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    />
  );
}
