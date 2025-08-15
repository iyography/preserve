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
  twinkle: number;
  twinkleSpeed: number;
  sparklePhase: number;
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
      '#ffffff',  // pure white
      '#f8fafc',  // very light blue-white
      '#e2e8f0',  // light silver
      '#cbd5e1',  // silver-blue
      '#94a3b8',  // soft silver
      '#f1f5f9',  // pale silver-white
      '#e5e7eb'   // light gray-silver
    ];

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        size: (Math.random() * 3 + 0.5) * 0.6, // Fairy dust variety - 0.3-2.1px (40% smaller)
        opacity: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2, // Random starting twinkle phase
        twinkleSpeed: Math.random() * 0.08 + 0.02, // Varying twinkle speeds
        sparklePhase: Math.random() * Math.PI * 2 // For sparkle timing
      };
    };

    const updateParticle = (particle: Particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Update twinkle and sparkle phases
      particle.twinkle += particle.twinkleSpeed;
      particle.sparklePhase += 0.05;

      // Fade in and out with heavenly twinkling
      let baseOpacity = 1;
      if (particle.life < particle.maxLife * 0.1) {
        baseOpacity = particle.life / (particle.maxLife * 0.1);
      } else if (particle.life > particle.maxLife * 0.9) {
        baseOpacity = 1 - (particle.life - particle.maxLife * 0.9) / (particle.maxLife * 0.1);
      }

      // Add heavenly twinkling effect
      const twinkleMultiplier = (Math.sin(particle.twinkle) + 1) * 0.4 + 0.3; // 0.3 to 1.1
      particle.opacity = baseOpacity * twinkleMultiplier;

      // Add some drift and sparkle motion
      particle.vx += (Math.random() - 0.5) * 0.03;
      particle.vy += (Math.random() - 0.5) * 0.02;
      
      // Add gentle floating motion with sparkle dance
      particle.x += Math.sin(particle.life * 0.02 + particle.sparklePhase) * 0.5;
      particle.y += Math.cos(particle.life * 0.015 + particle.sparklePhase * 0.8) * 0.3;

      return particle.life < particle.maxLife && 
             particle.y > -10 && 
             particle.x > -10 && 
             particle.x < canvas.width + 10;
    };

    const drawParticle = (particle: Particle) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      
      // Create heavenly sparkling fairy dust with varying effects based on size
      const isSilver = particle.color.includes('f') || particle.color.includes('e') || particle.color.includes('c') || particle.color.includes('9');
      
      // Calculate sparkle intensity based on twinkle phase
      const sparkleIntensity = (Math.sin(particle.sparklePhase) + 1) * 0.5; // 0 to 1
      const twinkleGlow = (Math.cos(particle.twinkle * 2) + 1) * 0.3 + 0.4; // 0.4 to 1.0
      
      // Larger particles get more dramatic effects
      if (particle.size > 1.5) {
        // Large fairy dust - heavenly dramatic glow with sparkle
        const glowSize = 15 + sparkleIntensity * 10; // 15-25 blur
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color + Math.floor(128 * twinkleGlow).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (3 + sparkleIntensity), 0, Math.PI * 2);
        ctx.fill();
        
        // Bright twinkling core
        ctx.shadowBlur = 8 + sparkleIntensity * 12;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 + sparkleIntensity * 0.5), 0, Math.PI * 2);
        ctx.fill();
        
        // Add heavenly sparkle rays for silver particles
        if (isSilver && sparkleIntensity > 0.3) {
          ctx.shadowBlur = sparkleIntensity * 8;
          ctx.shadowColor = '#ffffff';
          ctx.strokeStyle = '#ffffff' + Math.floor(255 * sparkleIntensity).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5 + sparkleIntensity;
          ctx.beginPath();
          // Four-point star with sparkle variation
          const rayLength = particle.size * (2.5 + sparkleIntensity);
          ctx.moveTo(particle.x - rayLength, particle.y);
          ctx.lineTo(particle.x + rayLength, particle.y);
          ctx.moveTo(particle.x, particle.y - rayLength);
          ctx.lineTo(particle.x, particle.y + rayLength);
          // Diagonal rays
          const diagLength = particle.size * (1.8 + sparkleIntensity * 0.8);
          ctx.moveTo(particle.x - diagLength, particle.y - diagLength);
          ctx.lineTo(particle.x + diagLength, particle.y + diagLength);
          ctx.moveTo(particle.x + diagLength, particle.y - diagLength);
          ctx.lineTo(particle.x - diagLength, particle.y + diagLength);
          ctx.stroke();
        }
      } else if (particle.size > 0.9) {
        // Medium fairy dust - moderate glow with sparkle
        ctx.shadowBlur = 10 + sparkleIntensity * 6;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color + Math.floor(153 * twinkleGlow).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (2 + sparkleIntensity * 0.5), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 5 + sparkleIntensity * 8;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 + sparkleIntensity * 0.3), 0, Math.PI * 2);
        ctx.fill();
        
        // Simple cross sparkle with heavenly twinkle
        if (sparkleIntensity > 0.2) {
          ctx.shadowBlur = sparkleIntensity * 5;
          ctx.shadowColor = '#ffffff';
          ctx.strokeStyle = '#ffffff' + Math.floor(170 * sparkleIntensity).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5 + sparkleIntensity * 0.5;
          ctx.beginPath();
          const rayLength = particle.size * (1.5 + sparkleIntensity * 0.5);
          ctx.moveTo(particle.x - rayLength, particle.y);
          ctx.lineTo(particle.x + rayLength, particle.y);
          ctx.moveTo(particle.x, particle.y - rayLength);
          ctx.lineTo(particle.x, particle.y + rayLength);
          ctx.stroke();
        }
      } else {
        // Small fairy dust - subtle glow with gentle twinkle
        ctx.shadowBlur = 6 + sparkleIntensity * 4;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color + Math.floor(187 * twinkleGlow).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1.5 + sparkleIntensity * 0.3), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 3 + sparkleIntensity * 6;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 + sparkleIntensity * 0.2), 0, Math.PI * 2);
        ctx.fill();
        
        // Tiny sparkle dot for smallest particles
        if (sparkleIntensity > 0.4) {
          ctx.shadowBlur = sparkleIntensity * 3;
          ctx.shadowColor = '#ffffff';
          ctx.fillStyle = '#ffffff' + Math.floor(100 * sparkleIntensity).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
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
