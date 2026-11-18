import React, { useEffect, useRef } from 'react';

/**
 * InteractiveParticleMesh
 * Komponen Canvas Jaring-jaring (Constellation / Particle Network) Interaktif
 * - Partikel saling terhubung dengan garis jaring yang dinamis
 * - Merespons gerakan mouse / kursor dan sentuhan (touch) di layar
 * - Ketika disentuh / didekati, jaring-jaring membentuk garis penghubung dan partikel ikut tertarik lembut
 */
export default function InteractiveParticleMesh({ className = '', theme = 'admin' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Konfigurasi Mouse / Touch
    const pointer = {
      x: width / 2,
      y: height / 2,
      radius: 170,
      active: false
    };

    // Konfigurasi Partikel
    const isMobile = width < 768;
    const particleCount = isMobile ? 45 : 85;
    const connectionDistance = isMobile ? 100 : 130;

    // Palette warna: Admin SLiMS Sky Blue + UIM Emerald
    const colorPalette = theme === 'admin'
      ? [
          { r: 2, g: 132, b: 199 },   // Sky 600
          { r: 14, g: 165, b: 233 },  // Sky 500
          { r: 56, g: 189, b: 248 },  // Sky 400
          { r: 16, g: 185, b: 129 },  // Emerald 500
          { r: 45, g: 212, b: 191 },  // Teal 400
          { r: 125, g: 211, b: 252 }  // Sky 200
        ]
      : [
          { r: 52, g: 211, b: 153 },  // Emerald 400
          { r: 16, g: 185, b: 129 },  // Emerald 500
          { r: 110, g: 231, b: 183 }, // Emerald 300
          { r: 45, g: 212, b: 191 },  // Teal 400
          { r: 167, g: 243, b: 208 }  // Emerald 200
        ];

    const strokeRgb = theme === 'admin' ? '14, 165, 233' : '52, 211, 153';

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.9;
        this.vy = (Math.random() - 0.5) * 0.9;
        this.radius = Math.random() * 1.8 + 1.2;
        this.baseRadius = this.radius;
        this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
      }

      update() {
        // Efek denyut lembut
        this.pulse += this.pulseSpeed;
        this.radius = this.baseRadius + Math.sin(this.pulse) * 0.4;

        // Gerakan mengambang alami
        this.x += this.vx;
        this.y += this.vy;

        // Pantulan tepi layar
        if (this.x < 0) {
          this.x = 0;
          this.vx *= -1;
        } else if (this.x > width) {
          this.x = width;
          this.vx *= -1;
        }
        if (this.y < 0) {
          this.y = 0;
          this.vy *= -1;
        } else if (this.y > height) {
          this.y = height;
          this.vy *= -1;
        }

        // Interaksi Ketika Disentuh / Didekati Kursor (Partikel Ikut & Terhubung)
        if (pointer.active) {
          const dx = pointer.x - this.x;
          const dy = pointer.y - this.y;
          const dist = Math.hypot(dx, dy);

          if (dist < pointer.radius && dist > 0) {
            // Tarikan lembut sehingga jaring mengikuti sentuhan
            const force = (1 - dist / pointer.radius) * 0.045;
            this.x += dx * force;
            this.y += dy * force;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.85)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Inisialisasi kumpulan partikel
    const particles = Array.from({ length: particleCount }, () => new Particle());

    // Event Handlers Mouse & Touch
    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerLeave, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('resize', handleResize);

    // Loop Animasi Canvas
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Gambar halo cincin di posisi kursor/sentuhan jika aktif
      if (pointer.active) {
        const glowGradient = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          pointer.radius
        );
        glowGradient.addColorStop(0, 'rgba(52, 211, 153, 0.15)');
        glowGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)');
        glowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update & Render Partikel
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Hubungkan ke Kursor/Sentuhan jika dalam radius
        if (pointer.active) {
          const dxToMouse = pointer.x - particles[i].x;
          const dyToMouse = pointer.y - particles[i].y;
          const distToMouse = Math.hypot(dxToMouse, dyToMouse);

          if (distToMouse < pointer.radius) {
            const alpha = (1 - distToMouse / pointer.radius) * 0.65;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(${strokeRgb}, ${alpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }

        // Hubungkan antar partikel untuk membentuk jaring-jaring
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.28;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${strokeRgb}, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchstart', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerLeave);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ display: 'block' }}
    />
  );
}
