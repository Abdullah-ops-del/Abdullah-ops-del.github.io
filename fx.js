(() => {
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const css = `
#bg{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
body::after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,rgba(8,6,24,.25),rgba(8,6,24,.6))}
.wrap{position:relative;z-index:1}
.panel{background:rgba(14,10,34,.44);backdrop-filter:blur(8px)}
.panel input,.panel select{width:100%;min-width:0}
.rv{opacity:0}
.rv.in{animation:rvIn .8s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0s)}
@keyframes rvIn{from{opacity:0;translate:0 26px}to{opacity:1;translate:0 0}}
.btn.primary{background-size:200% 100%;transition:background-position .5s,box-shadow .25s}
.btn.primary:hover{background-position:100% 0}
.wipe{position:fixed;inset:0;z-index:100;pointer-events:none;translate:-101% 0;transition:translate .5s cubic-bezier(.7,0,.2,1);background:linear-gradient(90deg,#0a0a1f 0 92%,#8b5cff 92% 95%,#35f0ff 95% 100%)}
.wipe.go{translate:0 0}.wipe.cover{translate:0 0;transition:none}.wipe.out{translate:101% 0}
.hint{position:fixed;left:50%;bottom:16px;translate:-50% 0;z-index:6;padding:8px 18px;border-radius:99px;background:rgba(10,10,31,.75);border:1px solid rgba(140,130,255,.3);color:#d6d1ff;font:500 .85rem Manrope,system-ui,sans-serif;backdrop-filter:blur(8px);transition:opacity 1s;pointer-events:none}
.hint.off{opacity:0}`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  // ---------- Background scenes ----------
  const cv = document.getElementById('bg');
  const rnd = (a, b) => a + Math.random() * (b - a);
  if (cv) {
    const c = cv.getContext('2d');
    let W, H, d;
    const m = { x: .5, y: .5, tx: .5, ty: .5, down: false, moved: false };
    addEventListener('pointermove', e => { m.tx = e.clientX / innerWidth; m.ty = e.clientY / innerHeight; m.moved = true; }, { passive: true });
    addEventListener('pointerdown', () => m.down = true);
    addEventListener('pointerup', () => m.down = false);
    const S = {};

    // 1. Sunset cyberpunk city (main page)
    S.city = {
      hint: 'Move your mouse to shift the skyline',
      init() {
        this.stars = Array.from({ length: 70 }, () => ({ x: rnd(0, W), y: rnd(0, H * .5), r: rnd(.6, 1.8) * d, p: rnd(0, 6) }));
        const mk = (hMin, hMax, col, win) => {
          const b = []; let x = -80 * d;
          while (x < W + 120 * d) {
            const w = rnd(50, 120) * d, h = rnd(hMin, hMax) * H, cols = Math.max(1, w / (13 * d) | 0), rows = Math.max(1, h / (17 * d) | 0);
            b.push({ x, w, h, cols, rows, lit: Array.from({ length: cols * rows }, () => Math.random() < win), neon: Math.random() < .2 ? (Math.random() < .5 ? '#35f0ff' : '#ff8a2b') : null });
            x += w + rnd(0, 14) * d;
          }
          return { b, col, win };
        };
        this.layers = [mk(.24, .46, '#2a1248', 0), mk(.2, .42, '#180a30', .18), mk(.12, .36, '#0a0518', .3)];
        this.rain = Array.from({ length: Math.min(110, W / 16 | 0) }, () => ({ x: rnd(0, W), y: rnd(0, H), l: rnd(12, 30) * d, v: rnd(5, 9) * d, c: Math.random() < .6 ? 'rgba(53,240,255,.35)' : 'rgba(255,138,43,.35)' }));
        this.drones = Array.from({ length: 4 }, () => ({ x: rnd(0, W), y: rnd(.12, .45) * H, v: rnd(.4, 1.2) * d, c: Math.random() < .5 ? '#ff3d5a' : '#35f0ff' }));
      },
      draw(t) {
        const g = c.createLinearGradient(0, 0, 0, H);
        [[0, '#0d0520'], [.5, '#2b0f48'], [.78, '#a8325a'], [.95, '#ff8a2b']].forEach(s => g.addColorStop(s[0], s[1]));
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = '#fff';
        this.stars.forEach(s => { c.globalAlpha = .35 + .65 * Math.abs(Math.sin(t / 900 + s.p)); c.fillRect(s.x - (m.x - .5) * 10 * d, s.y, s.r, s.r); });
        c.globalAlpha = 1;
        const sx = W * .5 - (m.x - .5) * 30 * d, sy = H * .7, sr = Math.min(W, H) * .26;
        const rg = c.createRadialGradient(sx, sy, sr * .2, sx, sy, sr * 2.4);
        rg.addColorStop(0, 'rgba(255,150,60,.95)'); rg.addColorStop(.35, 'rgba(255,90,80,.35)'); rg.addColorStop(1, 'rgba(255,90,80,0)');
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.fillStyle = '#ffb25a'; c.beginPath(); c.arc(sx, sy, sr * .55, 0, 7); c.fill();
        this.layers.forEach((L, i) => {
          const sh = (m.x - .5) * [-16, -36, -70][i] * d, dy = (m.y - .5) * [4, 8, 14][i] * d;
          L.b.forEach(b => {
            const x = b.x + sh, y = H - b.h + dy;
            c.fillStyle = L.col; c.fillRect(x, y, b.w, b.h + 20 * d);
            if (L.win) {
              const cw = b.w / b.cols, rh = b.h / b.rows;
              for (let k = 0; k < b.lit.length; k++) {
                if (!b.lit[k] || Math.sin(t / 700 + k * 3 + b.x) > .96) continue;
                c.fillStyle = k % 5 ? 'rgba(255,190,90,.75)' : 'rgba(53,240,255,.7)';
                c.fillRect(x + (k % b.cols) * cw + cw * .3, y + (k / b.cols | 0) * rh + rh * .3, cw * .4, rh * .35);
              }
            }
            if (b.neon && i === 2) { c.shadowColor = b.neon; c.shadowBlur = 18 * d; c.fillStyle = b.neon; c.fillRect(x + b.w * .15, y + 8 * d, b.w * .7, 3 * d); c.shadowBlur = 0; }
          });
        });
        this.drones.forEach(o => {
          o.x += o.v; if (o.x > W + 20) o.x = -20;
          c.globalAlpha = .6 + .4 * Math.sin(t / 200 + o.x); c.shadowColor = o.c; c.shadowBlur = 10 * d; c.fillStyle = o.c; c.fillRect(o.x, o.y, 3 * d, 3 * d);
        });
        c.shadowBlur = 0; c.globalAlpha = 1;
        const sl = .18 + (m.x - .5) * .2; c.lineWidth = d;
        this.rain.forEach(r => {
          c.strokeStyle = r.c; c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x - r.l * sl, r.y + r.l); c.stroke();
          r.y += r.v; r.x -= r.v * sl;
          if (r.y > H) { r.y = -30; r.x = rnd(0, W + 100 * d); }
        });
      }
    };

    // 2. Live candlestick chart (Pip Journal)
    S.candles = {
      hint: 'A live crosshair follows your cursor',
      init() { this.step = 20 * d; this.n = Math.ceil(W / this.step) + 3; this.off = 0; this.p = .5; this.cs = Array.from({ length: this.n }, () => this.next()); },
      next() {
        const o = this.p; this.p += (Math.random() - .5) * .12 + (.5 - this.p) * .025;
        return { o, cl: this.p, hi: Math.max(o, this.p) + Math.random() * .02, lo: Math.min(o, this.p) - Math.random() * .02 };
      },
      draw() {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a1628'); g.addColorStop(1, '#06060f');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(120,140,255,.08)'; c.lineWidth = d;
        for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(0, H * i / 8); c.lineTo(W, H * i / 8); c.stroke(); }
        this.off += (m.down ? 2.6 : .9) * d;
        if (this.off >= this.step) { this.off -= this.step; this.cs.shift(); this.cs.push(this.next()); }
        const dy = (m.y - .5) * 30 * d, Y = v => H * (.95 - v * .9) + dy, w = this.step * .58;
        this.cs.forEach((k, i) => {
          const x = i * this.step - this.off, col = k.cl >= k.o ? '#3dffa2' : '#ff8a2b';
          c.strokeStyle = col; c.globalAlpha = .6; c.beginPath(); c.moveTo(x + w / 2, Y(k.hi)); c.lineTo(x + w / 2, Y(k.lo)); c.stroke();
          c.fillStyle = col; c.globalAlpha = .55; c.fillRect(x, Y(Math.max(k.o, k.cl)), w, Math.max(2 * d, Math.abs(Y(k.o) - Y(k.cl))));
        });
        c.globalAlpha = 1; c.strokeStyle = '#35f0ff'; c.lineWidth = 2 * d; c.shadowColor = '#35f0ff'; c.shadowBlur = 12 * d; c.beginPath();
        this.cs.forEach((k, i) => {
          if (i < 8) return;
          const a = this.cs.slice(i - 8, i).reduce((s, q) => s + q.cl, 0) / 8, x = i * this.step - this.off + w / 2;
          i === 8 ? c.moveTo(x, Y(a)) : c.lineTo(x, Y(a));
        });
        c.stroke(); c.shadowBlur = 0;
        if (m.moved) {
          const mx = m.x * W, my = m.y * H;
          c.setLineDash([6 * d, 6 * d]); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = d;
          c.beginPath(); c.moveTo(0, my); c.lineTo(W, my); c.moveTo(mx, 0); c.lineTo(mx, H); c.stroke(); c.setLineDash([]);
          const txt = 'EURUSD ' + (1.07 + (1 - my / H) * .03).toFixed(4); c.font = `${12 * d}px ui-monospace,monospace`;
          const tw = c.measureText(txt).width + 16 * d; c.fillStyle = '#35f0ff'; c.fillRect(W - tw, my - 11 * d, tw, 22 * d);
          c.fillStyle = '#07071a'; c.fillText(txt, W - tw + 8 * d, my + 4 * d);
        }
      }
    };

    // 3. Coffee shop bokeh, beans and steam (Ember & Oak)
    S.coffee = {
      hint: 'Coffee beans drift away from your cursor',
      init() {
        this.bokeh = Array.from({ length: 16 }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(40, 140) * d, z: rnd(.2, 1), c: ['255,170,80', '255,214,150', '255,120,60'][Math.random() * 3 | 0], p: rnd(0, 6) }));
        this.beans = Array.from({ length: 24 }, () => ({ x: rnd(0, W), y: rnd(0, H), s: rnd(10, 26) * d, z: rnd(.3, 1), a: rnd(0, 6), va: rnd(-.01, .01), vy: rnd(.2, .6) * d, sw: rnd(0, 6), vx: 0 }));
        this.steam = Array.from({ length: 5 }, () => ({ x: rnd(.15, .85) * W, ph: rnd(0, 6) }));
      },
      draw(t) {
        const g = c.createLinearGradient(0, 0, 0, H);
        [[0, '#150a05'], [.55, '#321a0d'], [1, '#0f0603']].forEach(s => g.addColorStop(s[0], s[1]));
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        this.bokeh.forEach(b => {
          b.y -= .15 * d * b.z; if (b.y < -b.r) b.y = H + b.r;
          const x = b.x + (m.x - .5) * 60 * b.z * d, rg = c.createRadialGradient(x, b.y, 0, x, b.y, b.r);
          rg.addColorStop(0, `rgba(${b.c},${.2 + .07 * Math.sin(t / 1000 + b.p)})`); rg.addColorStop(1, `rgba(${b.c},0)`);
          c.fillStyle = rg; c.fillRect(x - b.r, b.y - b.r, b.r * 2, b.r * 2);
        });
        c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 22 * d;
        this.steam.forEach(w => {
          for (let j = 0; j < 27; j++) {
            const u = j / 27, u2 = (j + 1) / 27, f = q => [w.x + Math.sin(q * 6 + t / 1200 + w.ph) * 40 * d * q + (m.x - .5) * 40 * d * q, H - q * H * .75];
            const a = f(u), b = f(u2); c.strokeStyle = `rgba(255,230,200,${.09 * (1 - u)})`;
            c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
          }
        });
        const mx = m.x * W, my = m.y * H;
        this.beans.forEach(b => {
          b.y -= b.vy * b.z; b.a += b.va; b.x += b.vx; b.vx *= .92;
          const bx = b.x + Math.sin(t / 1500 + b.sw) * 20 * d + (m.x - .5) * 50 * b.z * d, dx = bx - mx, dy = b.y - my, di = Math.hypot(dx, dy) || 1;
          if (di < 160 * d) { b.vx += dx / di * .8; b.y += dy / di * .8; }
          if (b.y < -40 * d) { b.y = H + 40 * d; b.x = rnd(0, W); }
          c.save(); c.translate(bx, b.y); c.rotate(b.a); c.globalAlpha = .35 + .5 * b.z;
          c.fillStyle = '#4a2814'; c.beginPath(); c.ellipse(0, 0, b.s, b.s * .62, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,200,140,.18)'; c.beginPath(); c.ellipse(-b.s * .2, -b.s * .2, b.s * .5, b.s * .22, 0, 0, 7); c.fill();
          c.strokeStyle = '#1a0c06'; c.lineWidth = b.s * .12; c.beginPath(); c.moveTo(-b.s * .8, 0); c.bezierCurveTo(-b.s * .3, -b.s * .4, b.s * .3, b.s * .4, b.s * .8, 0); c.stroke();
          c.restore();
        });
        c.globalAlpha = 1;
      }
    };

    // 4. Dawn mountain road (Throttle Club)
    S.road = {
      hint: 'Hold click to rev the throttle',
      init() { this.off = 0; this.sp = .006; this.stars = Array.from({ length: 50 }, () => ({ x: rnd(0, W), y: rnd(0, H * .45), r: rnd(.6, 1.6) * d, p: rnd(0, 6) })); },
      draw(t) {
        const hy = H * .6, vx = W / 2 + (m.x - .5) * W * .3;
        const g = c.createLinearGradient(0, 0, 0, hy); [[0, '#050514'], [.55, '#1a0f3d'], [1, '#ff6a3d']].forEach(s => g.addColorStop(s[0], s[1]));
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = '#fff';
        this.stars.forEach(s => { c.globalAlpha = .3 + .6 * Math.abs(Math.sin(t / 1000 + s.p)); c.fillRect(s.x, s.y, s.r, s.r); });
        c.globalAlpha = 1;
        const sr = Math.min(W, H) * .14, rg = c.createRadialGradient(vx, hy, sr * .3, vx, hy, sr * 3);
        rg.addColorStop(0, 'rgba(255,190,100,.9)'); rg.addColorStop(1, 'rgba(255,100,60,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.fillStyle = '#ffcf7a'; c.beginPath(); c.arc(vx, hy, sr * .5, 0, 7); c.fill();
        [0, 1].forEach(l => {
          c.fillStyle = ['#140a2e', '#0a0618'][l]; c.beginPath(); c.moveTo(0, H);
          for (let x = 0; x <= W + 12 * d; x += 12 * d) c.lineTo(x, hy - d * (40 + 40 * Math.sin(x / (180 * d) + l * 2 + (m.x - .5) * (1 + l)) + 25 * Math.sin(x / (70 * d) + l)) * (l ? .6 : 1));
          c.lineTo(W, H); c.fill();
        });
        c.fillStyle = '#07050f'; c.fillRect(0, hy, W, H - hy);
        const bl = W / 2 - W * .46, br = W / 2 + W * .46;
        c.fillStyle = '#0c0b1d'; c.beginPath(); c.moveTo(vx - 6 * d, hy); c.lineTo(vx + 6 * d, hy); c.lineTo(br, H); c.lineTo(bl, H); c.fill();
        c.lineWidth = 2 * d; c.shadowBlur = 12 * d;
        c.strokeStyle = c.shadowColor = '#ff8a2b'; c.beginPath(); c.moveTo(vx - 6 * d, hy); c.lineTo(bl, H); c.stroke();
        c.strokeStyle = c.shadowColor = '#35f0ff'; c.beginPath(); c.moveTo(vx + 6 * d, hy); c.lineTo(br, H); c.stroke(); c.shadowBlur = 0;
        this.sp += ((m.down ? .02 : .006) - this.sp) * .05; this.off = (this.off + this.sp) % 1;
        c.fillStyle = '#ffd27a';
        for (let k = 0; k < 14; k++) {
          const u = (k / 14 + this.off) % 1, u2 = u + .035; if (u2 > 1) continue;
          const s1 = u * u, s2 = u2 * u2, y1 = hy + (H - hy) * s1, y2 = hy + (H - hy) * s2;
          const x1 = vx + (W / 2 - vx) * s1, x2 = vx + (W / 2 - vx) * s2, w1 = (1.5 + 10 * s1) * d, w2 = (1.5 + 10 * s2) * d;
          c.beginPath(); c.moveTo(x1 - w1, y1); c.lineTo(x1 + w1, y1); c.lineTo(x2 + w2, y2); c.lineTo(x2 - w2, y2); c.fill();
        }
        if (this.sp > .01) {
          c.strokeStyle = `rgba(255,255,255,${Math.min(.5, (this.sp - .01) * 40)})`; c.lineWidth = d;
          for (let i = 0; i < 26; i++) { const a = rnd(0, 6.28), r1 = rnd(.15, .4) * W, r2 = r1 + rnd(.08, .25) * W; c.beginPath(); c.moveTo(vx + Math.cos(a) * r1, hy + Math.sin(a) * r1 * .6); c.lineTo(vx + Math.cos(a) * r2, hy + Math.sin(a) * r2 * .6); c.stroke(); }
        }
      }
    };

    const sc = S[cv.dataset.scene];
    if (sc) {
      const size = () => { d = Math.min(devicePixelRatio || 1, 1.5); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; sc.init(); if (reduce) sc.draw(0); };
      let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
      size();
      if (!reduce) { const loop = t => { m.x += (m.tx - m.x) * .06; m.y += (m.ty - m.y) * .06; sc.draw(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
      const hint = Object.assign(document.createElement('div'), { className: 'hint', textContent: sc.hint });
      document.body.appendChild(hint); setTimeout(() => hint.classList.add('off'), 7000);
    }
  }

  // ---------- Scroll reveals ----------
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
    document.querySelectorAll('h1,.sub,.lead,.panel,.card,.skills>div,.stats>div,.mail,.phone,.cta,.avatar,.status,.role,.sec>h2,.about h2,.about p').forEach(el => {
      el.style.setProperty('--d', Math.min(Array.from(el.parentNode.children).indexOf(el), 5) * 90 + 'ms');
      el.classList.add('rv'); io.observe(el);
    });
  }

  // ---------- Page wipe transitions ----------
  if (!reduce) {
    const w = Object.assign(document.createElement('div'), { className: 'wipe' });
    document.body.appendChild(w);
    let came = false; try { came = sessionStorage.getItem('fx'); sessionStorage.removeItem('fx'); } catch {}
    if (came) { w.className = 'wipe cover'; requestAnimationFrame(() => requestAnimationFrame(() => w.className = 'wipe out')); }
    addEventListener('pageshow', e => { if (e.persisted) w.className = 'wipe out'; });
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const u = new URL(a.href, location);
      if (!/^(https?|file):$/.test(u.protocol) || u.origin !== location.origin || u.pathname === location.pathname) return;
      e.preventDefault(); try { sessionStorage.setItem('fx', '1'); } catch {}
      w.className = 'wipe go'; setTimeout(() => location.href = a.href, 480);
    });
  }
})();
