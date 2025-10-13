import { useEffect, useRef } from 'react';

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTouchTime = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        // Check theme from HTML element
        const isDark = document.documentElement.classList.contains('dark');
        // Particles adapt to theme - all gold tones, lighter for dark mode
        const colorChoices = isDark ? [
          '255, 235, 100', // Light gold
          '255, 225, 80',  // Lighter gold
          '250, 215, 60',  // Soft gold
        ] : [
          '255, 215, 0',   // Bright gold
          '255, 193, 102', // Light amber
          '240, 180, 80',  // Light golden
        ];
        this.colorBase = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
      }

      draw() {
        ctx.fillStyle = `rgba(${this.colorBase}, ${this.life})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(${this.colorBase}, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mouse move handler
    const handleMouseMove = (e) => {
      // Ignore synthetic mouse events that occur after touch events
      const now = Date.now();
      if (now - lastTouchTime < 500) {
        return;
      }

      cursorRef.current = { x: e.clientX, y: e.clientY };

      // Create new particles (reduced for performance)
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push(new Particle(e.clientX, e.clientY));
      }
    };

    // Touch handlers for mobile
    const handleTouchMove = (e) => {
      lastTouchTime = Date.now();
      const touch = e.touches[0];
      cursorRef.current = { x: touch.clientX, y: touch.clientY };

      // Create particles on touch move
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push(new Particle(touch.clientX, touch.clientY));
      }
    };

    const handleTouchStart = (e) => {
      lastTouchTime = Date.now();
      const touch = e.touches[0];
      cursorRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
      lastTouchTime = Date.now();
      // Clear cursor position on touch end to hide the dot
      cursorRef.current = { x: 0, y: 0 };
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
      });

      // Draw cursor - adapts to theme
      const { x, y } = cursorRef.current;
      if (x && y) {
        // Check theme from HTML element
        const isDark = document.documentElement.classList.contains('dark');
        const ringColor = isDark ? '255, 215, 0' : '255, 215, 0';
        const dotColor = isDark ? '250, 250, 250' : '220, 180, 80';

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ringColor}, 0.08)`;
        ctx.fill();

        // Middle ring
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ringColor}, 0.3)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner cursor dot
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor}, 0.9)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${ringColor}, 0.6)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    // window.addEventListener('touchcancel', handleTouchEnd); // Disable touchcancel for now
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      // window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[10000]"
    />
  );
};

export default CursorTrail;
