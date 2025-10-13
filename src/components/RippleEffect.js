import { useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const RippleEffect = () => {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Capture darkMode value for use in Ripple class
    const isDark = darkMode;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Ripple class
    class Ripple {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 150;
        this.speed = 3;
        this.opacity = 1;
        this.width = 3;
      }

      update() {
        this.radius += this.speed;
        this.opacity = 1 - (this.radius / this.maxRadius);
        this.width = 3 - (this.radius / this.maxRadius) * 2;
      }

      draw() {
        // Outer ripple - bright gold in both modes
        const outerColor = isDark ? '255, 215, 0' : '255, 215, 0'; // Gold
        const innerColor = isDark ? '255, 193, 102' : '240, 180, 80'; // Amber or light golden

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${outerColor}, ${this.opacity})`;
        ctx.lineWidth = this.width;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${outerColor}, ${this.opacity})`;
        ctx.stroke();

        // Inner ripple
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${innerColor}, ${this.opacity * 0.6})`;
        ctx.lineWidth = this.width * 0.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${innerColor}, ${this.opacity * 0.5})`;
        ctx.stroke();
      }
    }

    // Click handler
    const handleClick = (e) => {
      ripplesRef.current.push(new Ripple(e.clientX, e.clientY));

      // Create multiple ripples for more impact
      setTimeout(() => {
        ripplesRef.current.push(new Ripple(e.clientX, e.clientY));
      }, 100);
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw ripples
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        ripple.update();
        ripple.draw();
        return ripple.radius < ripple.maxRadius;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('click', handleClick);
    animate();

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[10000]"
    />
  );
};

export default RippleEffect;
