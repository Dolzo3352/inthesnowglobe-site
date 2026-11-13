(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const globe = document.querySelector('.globe');
  const white = document.querySelector('.hero-white');
  const pips = [...document.querySelectorAll('.pips i')];
  const hintText = document.querySelector('.hint-text');

  /* ── 유리구 안의 눈 ── */
  const gc = document.querySelector('.globe-snow');
  const g = gc.getContext('2d');
  const G = gc.width, R = G / 2;
  const flakes = Array.from({ length: 90 }, () => ({
    x: Math.random() * G, y: G * (0.72 + Math.random() * 0.26),
    vx: 0, vy: 0, r: 1 + Math.random() * 2.2,
  }));
  function kick(dx, dy, power) {
    for (const f of flakes) {
      f.vx += dx * (0.4 + Math.random()) + (Math.random() - 0.5) * power;
      f.vy += dy * (0.4 + Math.random()) - Math.random() * power;
    }
  }
  function drawGlobe() {
    g.clearRect(0, 0, G, G);
    g.fillStyle = 'rgba(255,255,255,.92)';
    for (const f of flakes) {
      f.vy += 0.035; f.vx *= 0.975; f.vy *= 0.975;
      f.vx += (Math.random() - 0.5) * 0.06;
      f.x += f.vx; f.y += f.vy;
      const dx = f.x - R, dy = f.y - R, d = Math.hypot(dx, dy), lim = R - 6;
      if (d > lim) {
        f.x = R + dx / d * lim; f.y = R + dy / d * lim;
        const dot = (f.vx * dx + f.vy * dy) / d;
        f.vx -= 1.4 * dot * dx / d; f.vy -= 1.4 * dot * dy / d;
        f.vx *= 0.6; f.vy *= 0.6;
      }
      g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill();
    }
  }

  /* ── 히어로 전체에 내리는 눈 ── */
  const hc = document.querySelector('.hero-snow');
  const h = hc.getContext('2d');
  let W = 0, H = 0, air = [], storm = 0, falling = false;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = hc.clientWidth; H = hc.clientHeight;
    hc.width = W * dpr; hc.height = H * dpr; h.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(n, anywhere) {
    for (let i = 0; i < n; i++) air.push({
      x: Math.random() * W, y: anywhere ? Math.random() * H : -10,
      r: 0.8 + Math.random() * 2.6, s: 0.4 + Math.random() * 1.1, p: Math.random() * 6.28,
    });
  }
  function drawAir(t) {
    h.clearRect(0, 0, W, H);
    if (!falling && !storm) return;
    h.fillStyle = 'rgba(255,255,255,.85)';
    const wind = storm * 5;
    for (const f of air) {
      f.y += f.s * (1 + storm * 5); f.x += Math.sin(t / 1400 + f.p) * 0.35 + wind * f.s;
      if (f.y > H + 10) { f.y = -10; f.x = Math.random() * W; }
      if (f.x > W + 10) f.x = -10;
      h.beginPath(); h.arc(f.x, f.y, f.r, 0, 6.283); h.fill();
    }
  }

  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
  function frame(t) {
    if (heroVisible) { if (hero.dataset.state === 'room') drawGlobe(); drawAir(t); }
    requestAnimationFrame(frame);
  }
  resize(); addEventListener('resize', resize);
  drawGlobe();
  if (!reduce) requestAnimationFrame(frame);

  /* ── 흔들기 ── */
  let shakes = 0, done = false;
  function countShake() {
    if (done) return;
    shakes++;
    pips.forEach((p, i) => p.classList.toggle('on', i < shakes));
    if (shakes >= 3) enterVillage();
  }
  function enterVillage() {
    done = true;
    hintText.textContent = '눈이 방 안으로 번집니다';
    if (reduce) { hero.dataset.state = 'village'; return; }
    hero.classList.add('is-shaken');
    spawn(260, true); storm = 1;
    white.classList.add('in');
    setTimeout(() => {
      hero.dataset.state = 'village';
      air = air.slice(0, 110); storm = 0; falling = true;
      white.classList.remove('in'); white.classList.add('out');
    }, 1700);
  }

  // 끌어서 흔들기: 방향이 바뀔 때마다 한 번
  let drag = null;
  globe.addEventListener('pointerdown', e => {
    if (done) return;
    globe.setPointerCapture(e.pointerId);
    globe.classList.add('dragging');
    drag = { x: e.clientX, y: e.clientY, lx: e.clientX, dir: 0, travel: 0, moved: false };
  });
  globe.addEventListener('pointermove', e => {
    if (!drag) return;
    const ox = e.clientX - drag.x, oy = e.clientY - drag.y;
    const step = e.clientX - drag.lx; drag.lx = e.clientX;
    const cx = Math.max(-90, Math.min(90, ox)), cy = Math.max(-50, Math.min(50, oy));
    globe.style.transform = `translate(${cx}px, ${cy}px) rotate(${cx / 6}deg)`;
    kick(step * 0.12, 0, Math.abs(step) * 0.08);
    if (Math.abs(ox) > 6) drag.moved = true;
    const dir = Math.sign(step);
    if (dir && dir !== drag.dir) {
      if (drag.travel > 28) countShake();
      drag.dir = dir; drag.travel = 0;
    }
    drag.travel += Math.abs(step);
  });
  const release = () => {
    if (!drag) return;
    const moved = drag.moved; drag = null;
    globe.classList.remove('dragging'); globe.style.transform = '';
    if (!moved) tapShake();
  };
  globe.addEventListener('pointerup', release);
  globe.addEventListener('pointercancel', release);

  // 눌러서 흔들기 (탭, 키보드)
  function tapShake() {
    if (done) return;
    kick((Math.random() - 0.5) * 6, -3, 5);
    if (!reduce) globe.animate(
      [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(-22px) rotate(-7deg)' },
       { transform: 'translateX(20px) rotate(6deg)' }, { transform: 'translateX(-10px) rotate(-3deg)' },
       { transform: 'translateX(0) rotate(0)' }], { duration: 420, easing: 'ease-out' });
    countShake();
  }
  globe.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapShake(); }
  });

  /* ── 이야기: 유리구 속 장면 바꾸기 ── */
  const steps = [...document.querySelectorAll('.step')];
  const shots = [...document.querySelectorAll('.lens img')];
  const place = document.querySelector('[data-place]:not(.step)');
  function activate(i) {
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    shots.forEach((s, k) => s.classList.toggle('on', k === i));
    place.textContent = steps[i].dataset.place;
  }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) activate(steps.indexOf(e.target));
  }, { rootMargin: '-50% 0px -50% 0px' });
  steps.forEach(s => io.observe(s));
  activate(0);
})();
