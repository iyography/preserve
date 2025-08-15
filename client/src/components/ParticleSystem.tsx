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
      '#9333ea',  // vibrant purple
      '#a855f7',  // bright violet
      '#7c3aed',  // deep purple
      '#8b5cf6',  // medium purple
      '#c084fc',  // light purple
      '#ddd6fe',  // very light purple
      '#e879f9',  // magenta purple
      '#fbbf24',  // golden yellow
      '#f59e0b',  // amber gold
      '#d97706',  // darker gold
      '#eab308',  // bright gold
      '#facc15',  // light gold
      '#fef3c7',  // pale gold
      '#fde68a'   // soft gold
    ];

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        size: Math.random() * 3 + 0.5, // Fairy dust variety - 0.5-3.5px
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
      
      // Create magical fairy dust with varying effects based on size
      const isGold = particle.color.includes('f') && (particle.color.includes('b') || particle.color.includes('c') || particle.color.includes('e'));
      
      // Larger particles get more dramatic effects
      if (particle.size > 2.5) {
        // Large fairy dust - dramatic glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color + '80'; // Semi-transparent
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright core
        ctx.shadowBlur = 8;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add sparkle rays for gold particles
        if (isGold) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = particle.color + 'CC';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Four-point star
          ctx.moveTo(particle.x - particle.size * 2.5, particle.y);
          ctx.lineTo(particle.x + particle.size * 2.5, particle.y);
          ctx.moveTo(particle.x, particle.y - particle.size * 2.5);
          ctx.lineTo(particle.x, particle.y + particle.size * 2.5);
          // Diagonal rays
          ctx.moveTo(particle.x - particle.size * 1.8, particle.y - particle.size * 1.8);
          ctx.lineTo(particle.x + particle.size * 1.8, particle.y + particle.size * 1.8);
          ctx.moveTo(particle.x + particle.size * 1.8, particle.y - particle.size * 1.8);
          ctx.lineTo(particle.x - particle.size * 1.8, particle.y + particle.size * 1.8);
          ctx.stroke();
        }
      } else if (particle.size > 1.5) {
        // Medium fairy dust - moderate glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color + '99';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 5;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Simple cross sparkle
        if (isGold) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = particle.color + 'AA';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particle.x - particle.size * 1.5, particle.y);
          ctx.lineTo(particle.x + particle.size * 1.5, particle.y);
          ctx.moveTo(particle.x, particle.y - particle.size * 1.5);
          ctx.lineTo(particle.x, particle.y + particle.size * 1.5);
          ctx.stroke();
        }
      } else {
        // Small fairy dust - subtle glow
        ctx.shadowBlur = 6;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color + 'BB';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 3;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
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
