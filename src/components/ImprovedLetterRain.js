import { useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ImprovedLetterRain = () => {
  const canvasRef = useRef(null);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters - mix of tech symbols, numbers, and select letters
    const chars = '01アイウエオカキクケコサシスセソタチツテト0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Splash particle class for impact effects
    class SplashParticle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4; // Horizontal velocity
        this.vy = -Math.random() * 6 - 2; // Upward velocity
        this.gravity = 0.3;
        this.life = 1;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 1;
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.vx *= 0.98; // Air resistance
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = `${this.color}, ${this.life})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${this.color}, ${this.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Ripple class for water rings
    class Ripple {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.random() * 30 + 20;
        this.life = 1;
        this.decay = 0.02;
        this.color = color;
        this.lineWidth = 2;
      }

      update() {
        this.radius += 2;
        this.life -= this.decay;
        this.lineWidth = Math.max(0.5, this.lineWidth - 0.05);
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.3;
        ctx.strokeStyle = `${this.color}, ${this.life})`;
        ctx.lineWidth = this.lineWidth;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `${this.color}, ${this.life * 0.3})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Drop class for firefly effect
    class Drop {
      constructor(x) {
        this.x = x;
        // Spread drops from above screen to bottom for continuous rain
        this.y = Math.random() * (canvas.height * 2) - canvas.height;
        this.speed = Math.random() * 2.0 + 1.5; // Moderate speed: 1.5-3.5
        this.char = chars[Math.floor(Math.random() * chars.length)];
        this.opacity = Math.random() * 0.25 + 0.15;
        this.glowIntensity = 0.6; // Fixed intensity, no pulsing
        this.color = this.getColor();
        this.changeInterval = Math.floor(Math.random() * 20) + 10;
        this.frameCount = 0;
        this.hasSplashed = false; // Track if this drop has already splashed
      }

      getColor() {
        // Bright metallic colors in light mode
        const colors = darkMode ? [
          'rgba(255, 215, 0',   // Gold
          'rgba(212, 175, 55',  // Dark gold
          'rgba(255, 149, 0',   // Amber
          'rgba(205, 127, 50',  // Bronze
        ] : [
          'rgba(255, 215, 0',   // Bright gold
          'rgba(255, 193, 102', // Light amber
          'rgba(218, 165, 32',  // Goldenrod
          'rgba(240, 180, 80',  // Light golden
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speed;
        this.frameCount++;

        // Change character periodically
        if (this.frameCount % this.changeInterval === 0) {
          this.char = chars[Math.floor(Math.random() * chars.length)];
        }

        // Don't reset - let them be removed and new ones created
      }

      draw() {
        const alpha = this.opacity;

        // Reset shadow from previous draws
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Subtle glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${this.color}, ${alpha * 0.5})`;

        // Draw character
        ctx.fillStyle = `${this.color}, ${alpha})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(this.char, this.x * fontSize, this.y);

        // Reset shadow after character
        ctx.shadowBlur = 0;

        // Small glow dot
        ctx.beginPath();
        ctx.arc(this.x * fontSize + fontSize/2, this.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}, ${alpha})`;
        ctx.fill();
      }
    }

    // Create drops (heavy rain)
    const drops = [];
    const splashParticles = [];
    const ripples = [];
    const dropCount = Math.floor(columns * 1.2); // 120% density - very heavy rain

    for (let i = 0; i < dropCount; i++) {
      drops.push(new Drop(Math.floor(Math.random() * columns)));
    }

    // Create splash effect
    const createSplash = (x, y, color) => {
      // Create multiple splash particles
      const particleCount = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < particleCount; i++) {
        splashParticles.push(new SplashParticle(x, y, color));
      }

      // Create ripples
      ripples.push(new Ripple(x, y, color));

      // Occasionally create a second ripple for depth
      if (Math.random() > 0.5) {
        setTimeout(() => {
          ripples.push(new Ripple(x, y, color));
        }, 100);
      }
    };

    // Animation loop
    let frameCounter = 0;
    const animate = () => {
      // Fade out trails - match background color based on theme
      if (darkMode) {
        // Dark theme: #1A1410 = rgb(26, 20, 16)
        ctx.fillStyle = 'rgba(26, 20, 16, 0.6)';
      } else {
        // Light theme: #FDFBF7 = rgb(253, 251, 247)
        ctx.fillStyle = 'rgba(253, 251, 247, 0.6)';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add new drops at a sustainable rate
      frameCounter++;
      if (frameCounter % 2 === 0 && drops.length < columns * 1.5) {
        // Add 5 drops every other frame
        for (let i = 0; i < 5; i++) {
          drops.push(new Drop(Math.floor(Math.random() * columns)));
        }
      }

      // Update and draw ripples (draw first for layering)
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        ripples[i].draw();

        // Remove dead ripples
        if (ripples[i].life <= 0 || ripples[i].radius > ripples[i].maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // Update and draw drops
      for (let i = drops.length - 1; i >= 0; i--) {
        drops[i].update();
        drops[i].draw();

        // Check if drop hits the bottom and create splash
        if (!drops[i].hasSplashed && drops[i].y > canvas.height - 20 && drops[i].y < canvas.height + 10) {
          drops[i].hasSplashed = true;
          // Create splash at the drop position
          createSplash(drops[i].x * fontSize + fontSize/2, canvas.height - 10, drops[i].color);
        }

        // Remove drops that are off screen (cleanup) - iterate backwards
        if (drops[i].y > canvas.height + 100) {
          drops.splice(i, 1);
        }
      }

      // Update and draw splash particles
      for (let i = splashParticles.length - 1; i >= 0; i--) {
        splashParticles[i].update();
        splashParticles[i].draw();

        // Remove dead particles
        if (splashParticles[i].life <= 0) {
          splashParticles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30 blur-[2px]"
    />
  );
};

export default ImprovedLetterRain;
