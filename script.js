(() => {
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const email = 'abdullahshahtkd123@gmail.com', gh = 'https://github.com/Abdullah-ops-del';

  // Cursor glow
  const glow = $('.glow');
  addEventListener('pointermove', e => {
    glow.style.setProperty('--mx', e.clientX + 'px');
    glow.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  // Neon rain
  const cv = $('#rain'), cx = cv.getContext('2d');
  let W, H, drops = [];
  const mk = r => ({ x: Math.random() * W, y: r ? Math.random() * H : -30, l: 12 + Math.random() * 26, v: 3 + Math.random() * 5, c: Math.random() < .6 ? '53,240,255' : '255,138,43' });
  function size() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    drops = Array.from({ length: Math.min(90, W / 14 | 0) }, () => mk(true));
  }
  function tick() {
    cx.clearRect(0, 0, W, H);
    for (const d of drops) {
      cx.strokeStyle = `rgba(${d.c},.35)`;
      cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.l * .18, d.y + d.l); cx.stroke();
      d.y += d.v; d.x -= d.v * .18;
      if (d.y > H) Object.assign(d, mk());
    }
    requestAnimationFrame(tick);
  }
  size(); addEventListener('resize', size);
  if (!reduce) tick();

  // 3D tilt on project cards
  if (!reduce) document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--ry', (x - .5) * 8 + 'deg');
      c.style.setProperty('--rx', (.5 - y) * 8 + 'deg');
      c.style.setProperty('--x', x * 100 + '%');
      c.style.setProperty('--y', y * 100 + '%');
    });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  });

  // Copy email
  const copy = $('#copy');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(email); copy.textContent = 'Copied'; }
    catch { copy.textContent = 'Press Ctrl+C on the email above'; }
    setTimeout(() => copy.textContent = 'Copy email', 1800);
  });

  // Interactive terminal
  const out = $('#out'), inp = $('#in');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const add = html => {
    const p = document.createElement('p'); p.innerHTML = html;
    out.appendChild(p); out.scrollTop = out.scrollHeight; return p;
  };
  const echo = t => { const p = add('<span class="p">$</span> <span></span>'); p.lastChild.textContent = t; };
  async function typeCmd(t) {
    const p = add('<span class="p">$</span> <span></span>'), s = p.lastChild;
    for (const ch of t) { s.textContent += ch; await sleep(reduce ? 0 : 55); }
    await sleep(reduce ? 0 : 250);
  }
  const themes = [['#35f0ff', '#ff8a2b', '#8b5cff'], ['#3dffa2', '#ffc83d', '#35f0ff'], ['#ff4d8d', '#ff8a2b', '#ffc83d']];
  let ti = 0;
  const cmds = {
    help: () => 'Try: ' + ['about', 'skills', 'projects', 'contact', 'hire', 'theme', 'clear'].map(c => `<span class="c">${c}</span>`).join(', '),
    whoami: () => 'Abdullah Shah (aka old_cat)\nWeb developer. Clean, fast sites that work on every screen.',
    about: () => 'About 1.5 years of learning and building websites. I write the HTML, CSS and JavaScript myself, so what you see is what runs, with no bloated templates.',
    skills: () => 'WordPress   custom themes and plugins\nHTML        semantic, accessible markup\nCSS         responsive layouts and animation\nJavaScript  interactive features, no framework bloat',
    projects: () => `Pip Journal, Ember & Oak Coffee, Throttle Club.
Open them in <a href="#work">Projects</a> or browse <a href="${gh}" target="_blank" rel="noopener">GitHub</a>.`,
    contact: () => `Email:    <a href="mailto:${email}">${email}</a>
Phone:    <a href="tel:+923355700708">+92 3355700708</a>
WhatsApp: <a href="https://wa.me/923355700708" target="_blank" rel="noopener">message me</a>
GitHub:   <a href="${gh}" target="_blank" rel="noopener">${gh}</a>`,
    hire: () => { setTimeout(() => location.href = `mailto:${email}?subject=Project%20inquiry`, 900); return 'Good call. Opening your email app...'; },
    theme: () => { ti = (ti + 1) % themes.length; ['--cyan', '--pink', '--violet'].forEach((v, i) => document.documentElement.style.setProperty(v, themes[ti][i])); return 'Neon palette switched.'; }
  };
  const hist = []; let hi = 0;
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hist.length) { hi = Math.max(0, hi - 1); inp.value = hist[hi]; e.preventDefault(); return; }
    if (e.key === 'ArrowDown' && hist.length) { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; return; }
    if (e.key !== 'Enter') return;
    const raw = inp.value.trim(), k = raw.toLowerCase();
    inp.value = ''; if (!raw) return;
    hist.push(raw); hi = hist.length;
    echo(raw);
    if (k === 'clear') { out.innerHTML = ''; return; }
    const f = k === 'sudo hire-me' ? cmds.hire : cmds[k];
    if (f) add(f()); else { const p = add(''); p.textContent = `command not found: ${raw}. Type help.`; }
  });
  $('#term').addEventListener('click', () => inp.focus());

  (async () => {
    await typeCmd('whoami'); add(cmds.whoami());
    await sleep(reduce ? 0 : 300);
    await typeCmd('help'); add(cmds.help());
  })();

  // Count-up stats
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    const el = en.target, n = +el.dataset.n, d = +el.dataset.d || 0, t0 = performance.now();
    const step = t => { const k = reduce ? 1 : Math.min(1, (t - t0) / 1200); el.textContent = (n * k).toFixed(d); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  document.querySelectorAll('[data-n]').forEach(el => io.observe(el));
})();
