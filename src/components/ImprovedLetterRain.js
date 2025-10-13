import { useEffect, useRef } from 'react';

const ImprovedLetterRain = () => {
  const canvasRef = useRef(null);

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
        this.y = Math.random() * -canvas.height;
        this.speed = Math.random() * 0.5 + 0.2;
        this.char = chars[Math.floor(Math.random() * chars.length)];
        this.opacity = Math.random() * 0.25 + 0.15;
        this.glowIntensity = 0.6; // Fixed intensity, no pulsing
        this.color = this.getColor();
        this.changeInterval = Math.floor(Math.random() * 20) + 10;
        this.frameCount = 0;
      }

      getColor() {
        const colors = [
          'rgba(255, 215, 0',   // Gold
          'rgba(212, 175, 55',  // Dark gold
          'rgba(155, 136, 218', // Violet
          'rgba(255, 182, 193', // Light pink/rose
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

        // Reset when off screen
        if (this.y > canvas.height + 50) {
          this.y = Math.random() * -200;
          this.x = Math.floor(Math.random() * columns) * fontSize;
          this.color = this.getColor();
        }
      }

      draw() {
        const alpha = this.opacity;

        // Subtle glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${this.color}, ${alpha * 0.8})`;

        // Draw character
        ctx.fillStyle = `${this.color}, ${alpha})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(this.char, this.x * fontSize, this.y);

        // Small glow dot
        ctx.beginPath();
        ctx.arc(this.x * fontSize + fontSize/2, this.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}, ${alpha})`;
        ctx.fill();
      }
    }

    // Create drops (optimized for performance)
    const drops = [];
    const dropCount = Math.floor(columns * 0.2); // 20% density

    for (let i = 0; i < dropCount; i++) {
      drops.push(new Drop(Math.floor(Math.random() * columns)));
    }

    // Animation loop
    const animate = () => {
      // Sharper clear (less blurry trail)
      ctx.fillStyle = 'rgba(15, 15, 35, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw drops
      drops.forEach(drop => {
        drop.update();
        drop.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
};

export default ImprovedLetterRain;
