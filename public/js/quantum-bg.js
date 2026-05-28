/**
 * Quantum Particle Grid Background for FastReading
 * A structured, clean grid of dots (Apple-style neatness)
 * that warps dynamically based on cursor gravity and moves
 * simultaneously with organic quantum vibrations.
 */

(function () {
  const canvas = document.getElementById('quantum-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  // Mouse / cursor tracking
  const mouse = {
    x: null,
    y: null,
    radius: 190, // warp field radius
    active: false,
    lastActive: 0
  };

  // Motion preference detection
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isStatic = motionQuery.matches;

  motionQuery.addEventListener('change', (e) => {
    isStatic = e.matches;
    if (isStatic) {
      cancelAnimationFrame(animationId);
      drawStatic();
    } else {
      startAnimation();
    }
  });

  // Track cursor position
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    mouse.lastActive = Date.now();
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = null;
    mouse.y = null;
  });

  // Handle touch events for mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
      mouse.lastActive = Date.now();
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
    mouse.x = null;
    mouse.y = null;
  });

  // Resize handler
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    if (isStatic) {
      drawStatic();
    }
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // Helper: Safely convert CSS variables (hex/rgb/rgba) to custom opacity rgba
  function convertColorToRgba(colorStr, alpha) {
    if (!colorStr) return `rgba(150, 150, 150, ${alpha})`;
    colorStr = colorStr.trim();
    
    // rgb(r, g, b) -> rgba(r, g, b, alpha)
    if (colorStr.startsWith('rgb(')) {
      return colorStr.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    
    // rgba(r, g, b, a) -> rgba(r, g, b, a * customAlpha)
    if (colorStr.startsWith('rgba(')) {
      const parts = colorStr.substring(5, colorStr.length - 1).split(',');
      if (parts.length === 4) {
        const originalAlpha = parseFloat(parts[3]);
        parts[3] = ` ${alpha * originalAlpha}`;
        return `rgba(${parts.join(',')})`;
      }
      return colorStr;
    }
    
    // #hex format
    if (colorStr.startsWith('#')) {
      let r = 0, g = 0, b = 0;
      if (colorStr.length === 4) {
        r = parseInt(colorStr[1] + colorStr[1], 16);
        g = parseInt(colorStr[2] + colorStr[2], 16);
        b = parseInt(colorStr[3] + colorStr[3], 16);
      } else if (colorStr.length === 7) {
        r = parseInt(colorStr.substring(1, 3), 16);
        g = parseInt(colorStr.substring(3, 5), 16);
        b = parseInt(colorStr.substring(5, 7), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return `rgba(150, 150, 150, ${alpha})`;
  }

  class Particle {
    constructor(col, row, baseX, baseY) {
      this.col = col;
      this.row = row;
      this.baseX = baseX;
      this.baseY = baseY;

      // Actual coordinates
      this.x = baseX;
      this.y = baseY;

      // Smaller, delicate dots (clean Apple & AI style)
      this.size = Math.random() * 0.9 + 0.9; // 0.9px to 1.8px
      this.baseSize = this.size;

      // Slow orbital quantum vibration parameters
      this.angleX = Math.random() * Math.PI * 2;
      this.angleY = Math.random() * Math.PI * 2;
      this.speedX = Math.random() * 0.01 + 0.004;
      this.speedY = Math.random() * 0.01 + 0.004;
      this.orbitRadius = Math.random() * 4.5 + 2.0; // 2.0px to 6.5px drift radius

      // Opacity
      this.alpha = Math.random() * 0.12 + 0.12; // 0.12 to 0.24 baseline
      this.baseAlpha = this.alpha;

      // Accent nodes (pulsing quantum nodes)
      this.isAccentNode = Math.random() > 0.88; // 12% accent nodes
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
      this.pulseAngle = Math.random() * Math.PI * 2;
    }

    update(styles) {
      // 1. Quantum breathing offset (simultaneous gentle drifting)
      this.angleX += this.speedX;
      this.angleY += this.speedY;

      let offsetX = Math.sin(this.angleX) * this.orbitRadius;
      let offsetY = Math.cos(this.angleY) * this.orbitRadius;

      // Pulsing for accent nodes
      if (this.isAccentNode) {
        this.pulseAngle += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.06;
        this.size = this.baseSize + Math.sin(this.pulseAngle) * 0.25;
      }

      let targetX = this.baseX + offsetX;
      let targetY = this.baseY + offsetY;

      let currentAlpha = this.alpha;
      let currentSize = this.size;
      this.isExcited = false;

      // 2. Mouse interaction: Grid Warping (Repelling like a magnetic force field)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x; // Vector from mouse to particle
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          this.isExcited = true;
          // Warp factor reaches 1.0 at center, 0.0 at edge
          const factor = (mouse.radius - dist) / mouse.radius;
          // Smooth sine ease curve
          const smoothFactor = Math.sin(factor * Math.PI / 2);

          // Push particles away (warp field)
          const pushForce = 45; // max push pixels
          targetX += (dx / (dist || 1)) * smoothFactor * pushForce;
          targetY += (dy / (dist || 1)) * smoothFactor * pushForce;

          // Excite particle visual properties (grow and light up)
          currentAlpha = Math.min(this.alpha + smoothFactor * 0.55, 0.8);
          currentSize = this.size + smoothFactor * 0.9;
        }
      }

      // 3. Smooth interpolation (spring mass logic for lag/liquidity)
      this.x += (targetX - this.x) * 0.085;
      this.y += (targetY - this.y) * 0.085;

      this.drawAlpha = currentAlpha;
      this.drawSize = currentSize;
    }

    draw(colorNormal, colorAccent) {
      // If excited by mouse or is base accent, use accent color. Else use text-subtle.
      const color = (this.isAccentNode || this.isExcited) ? colorAccent : colorNormal;
      const a = this.drawAlpha;
      const r = this.drawSize;

      // Draw clean solid core
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = convertColorToRgba(color, a);
      ctx.fill();
    }
  }

  // Generate Centered Symmetric Grid
  function initParticles() {
    particles = [];
    
    // Spacing dynamically scales based on screen width
    // yields ~42-46 columns for denser, ultra-clean Apple-like density
    const spacing = Math.max(38, Math.floor(canvas.width / 44));
    const cols = Math.ceil(canvas.width / spacing) + 1;
    const rows = Math.ceil(canvas.height / spacing) + 1;

    // Centering offsets
    const offsetX = (canvas.width - (cols - 1) * spacing) / 2;
    const offsetY = (canvas.height - (rows - 1) * spacing) / 2;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const baseX = offsetX + c * spacing;
        const baseY = offsetY + r * spacing;
        particles.push(new Particle(c, r, baseX, baseY));
      }
    }
  }



  function getThemeColors() {
    const styles = getComputedStyle(document.body);
    const colorNormal = styles.getPropertyValue('--text-subtle') || 
                        styles.getPropertyValue('--text-muted') || 
                        '#a3a3a3';
    const colorAccent = styles.getPropertyValue('--accent') || '#ea580c';
    return { colorNormal, colorAccent, styles };
  }

  // Main animation loop
  function loop() {
    if (isStatic) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { colorNormal, colorAccent, styles } = getThemeColors();

    // Update and draw particles
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      particles[i].update(styles);
      particles[i].draw(colorNormal, colorAccent);
    }



    // Decay mouse active status if no motion
    if (mouse.active && Date.now() - mouse.lastActive > 2000) {
      mouse.active = false;
      mouse.x = null;
      mouse.y = null;
    }

    animationId = requestAnimationFrame(loop);
  }

  // Static frame rendering for prefers-reduced-motion
  function drawStatic() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { colorNormal, colorAccent } = getThemeColors();
    
    // Draw pure static grid in baseline positions (no offsets, no warp)
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      particles[i].x = particles[i].baseX;
      particles[i].y = particles[i].baseY;
      particles[i].drawAlpha = particles[i].baseAlpha;
      particles[i].drawSize = particles[i].baseSize;
      particles[i].isExcited = false;
      particles[i].draw(colorNormal, colorAccent);
    }
  }

  function startAnimation() {
    if (animationId) cancelAnimationFrame(animationId);
    if (!isStatic) {
      loop();
    } else {
      drawStatic();
    }
  }

  // Init
  resizeCanvas();
  startAnimation();
})();
