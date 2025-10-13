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
    const dropCount = Math.floor(columns * 1.2); // 120% density - very heavy rain

    for (let i = 0; i < dropCount; i++) {
      drops.push(new Drop(Math.floor(Math.random() * columns)));
    }

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

      // Update and draw drops
      for (let i = drops.length - 1; i >= 0; i--) {
        drops[i].update();
        drops[i].draw();

        // Remove drops that are off screen (cleanup) - iterate backwards
        if (drops[i].y > canvas.height + 100) {
          drops.splice(i, 1);
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
