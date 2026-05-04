/* ══════════════════════════════════════
   COUNTDOWN
══════════════════════════════════════ */
(function () {
  const overlay = document.getElementById('countdown');
  const circle  = document.getElementById('ring-circle');
  const nums    = [5, 4, 3, 2, 1].map(n => document.getElementById('n' + n));
  const circ    = 2 * Math.PI * 140;
  circle.style.strokeDasharray  = circ;
  circle.style.strokeDashoffset = circ;
  let step = 0;

  function tick() {
    if (step > 0) nums[step - 1].classList.remove('active');
    if (step < 5) {
      nums[step].classList.add('active');
      circle.style.strokeDashoffset = circ * (1 - (step + 1) / 5);
      step++;
      setTimeout(tick, 380);
    } else {
      circle.classList.add('go');
      circle.style.strokeDashoffset = 0;
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 700);
      }, 250);
    }
  }
  setTimeout(tick, 200);
})();

/* ══════════════════════════════════════
   HERO NAME LETTER REVEAL
══════════════════════════════════════ */
(function () {
  const names = ['PRAKIT', 'LAW'], ids = ['word1', 'word2'];
  let gi = 0;
  names.forEach((word, wi) => {
    const el = document.getElementById(ids[wi]);
    [...word].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'letter';
      s.textContent = ch;
      s.style.animationDelay = (700 + gi * 70) + 'ms';
      el.appendChild(s);
      gi++;
    });
    gi++;
  });
})();

/* ══════════════════════════════════════
   HERO FLOATING CUBES (Kinich style)
══════════════════════════════════════ */
(function () {
  const container = document.getElementById('hero-cubes');
  const configs = [
    { size: 24, x: 72, dur: 6,  delay: 0,   color: 'rgba(57,255,110,0.18)', border: 'rgba(57,255,110,0.7)',  glow: 'rgba(57,255,110,0.4)' },
    { size: 16, x: 82, dur: 8,  delay: 1.5, color: 'rgba(57,255,110,0.12)', border: 'rgba(57,255,110,0.5)',  glow: 'rgba(57,255,110,0.3)' },
    { size: 32, x: 88, dur: 10, delay: 3,   color: 'rgba(57,255,110,0.08)', border: 'rgba(57,255,110,0.35)', glow: 'rgba(57,255,110,0.2)' },
    { size: 20, x: 65, dur: 7,  delay: 4,   color: 'rgba(245,210,0,0.12)',  border: 'rgba(245,210,0,0.55)',  glow: 'rgba(245,210,0,0.3)'  },
    { size: 28, x: 55, dur: 9,  delay: 2,   color: 'rgba(57,255,110,0.07)', border: 'rgba(57,255,110,0.3)',  glow: 'rgba(57,255,110,0.15)'},
    { size: 16, x: 78, dur: 5,  delay: 0.5, color: 'rgba(245,210,0,0.08)', border: 'rgba(245,210,0,0.4)',   glow: 'rgba(245,210,0,0.2)'  },
    { size: 12, x: 92, dur: 6,  delay: 2.5, color: 'rgba(0,212,184,0.10)', border: 'rgba(0,212,184,0.55)',  glow: 'rgba(0,212,184,0.3)'  },
    { size: 20, x: 20, dur: 11, delay: 1,   color: 'rgba(57,255,110,0.06)', border: 'rgba(57,255,110,0.25)', glow: 'rgba(57,255,110,0.1)' },
    { size: 14, x: 45, dur: 7,  delay: 3.5, color: 'rgba(200,128,255,0.1)', border: 'rgba(200,128,255,0.5)', glow: 'rgba(200,128,255,0.3)'},
  ];
  configs.forEach(cfg => {
    const el = document.createElement('div');
    el.className = 'cube';
    const bottom = 10 + Math.random() * 40;
    el.style.cssText = `
      width:${cfg.size}px; height:${cfg.size}px;
      left:${cfg.x}%; bottom:${bottom}%;
      background:${cfg.color};
      border:2px solid ${cfg.border};
      box-shadow:0 0 ${Math.round(cfg.size / 2)}px ${cfg.glow};
      animation-duration:${cfg.dur}s; animation-delay:${cfg.delay}s;
    `;
    container.appendChild(el);
  });
})();

/* ══════════════════════════════════════
   TRACK STARS
══════════════════════════════════════ */
(function () {
  const c = document.getElementById('track-stars');
  const pts = [
    [8,18],[18,35],[30,12],[45,28],[58,8],[72,22],[83,38],[92,12],
    [15,42],[38,6],[55,40],[68,18],[80,30],[95,45],[5,55],[25,52],
    [50,55],[75,48],[88,58],[12,65],[40,62],[65,60],[90,66],[35,20],[60,30]
  ];
  pts.forEach(([l, t], i) => {
    const s = document.createElement('div');
    s.className = 'px-star' + (i % 4 === 0 ? ' gold' : '');
    s.style.left = l + '%';
    s.style.top  = t + '%';
    s.style.animationDelay    = (Math.random() * 2) + 's';
    s.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
    c.appendChild(s);
  });
})();

/* ══════════════════════════════════════
   TRACK CUBES (Kinich cubes in track)
══════════════════════════════════════ */
(function () {
  const c = document.getElementById('track-cubes');
  const cfgs = [
    { size: 14, x: 25, dur: 4,  delay: 0   },
    { size: 10, x: 55, dur: 5,  delay: 1   },
    { size: 18, x: 75, dur: 6,  delay: 2   },
    { size: 10, x: 90, dur: 4,  delay: 0.5 },
    { size: 12, x: 10, dur: 7,  delay: 1.5 },
    { size: 8,  x: 38, dur: 5,  delay: 3   },
  ];
  cfgs.forEach(cfg => {
    const el = document.createElement('div');
    el.className = 'track-cube';
    el.style.cssText = `
      width:${cfg.size}px; height:${cfg.size}px;
      left:${cfg.x}%; bottom:${36 + Math.random() * 28}%;
      background:rgba(57,255,110,0.10);
      border:2px solid rgba(57,255,110,0.5);
      box-shadow:0 0 8px rgba(57,255,110,0.4);
      animation-duration:${cfg.dur}s; animation-delay:${cfg.delay}s;
    `;
    c.appendChild(el);
  });
})();

/* ══════════════════════════════════════
   SPARKLES (dreamy cards)
══════════════════════════════════════ */
(function () {
  function addSparkles(id, colors, count) {
    const card = document.getElementById(id);
    if (!card) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.cssText = `
        width:3px; height:3px;
        left:${5 + Math.random() * 90}%;
        top:${5 + Math.random() * 85}%;
        background:${colors[i % colors.length]};
        animation-duration:${2 + Math.random() * 2}s;
        animation-delay:${Math.random() * 3}s;
      `;
      card.appendChild(s);
    }
  }
  addSparkles('ms0', ['#c880ff', '#e0b0ff', '#b860ff', '#ddd8ff'], 12);
  addSparkles('ms1', ['#f5d200', '#ffe84a', '#d4aa00'], 6);
})();

/* ══════════════════════════════════════
   SCROLL REVEALS
══════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.project-card, .ms-card').forEach(c => io.observe(c));

/* ══════════════════════════════════════
   MILESTONE SYSTEM
══════════════════════════════════════ */
const flagPcts   = [17, 40, 63, 86];
const runner     = document.getElementById('pixel-runner');
const runnerHint = document.getElementById('runner-hint');
const rope       = document.getElementById('runner-rope');
const trackScene = document.getElementById('track-scene');
const flags      = flagPcts.map((_, i) => document.getElementById('flag' + i));
const msCards    = Array.from(document.querySelectorAll('.ms-card'));

let currentMilestone = -1;
let runnerFired      = false;
let isAnimating      = false;

/* ── lasso rope animation ── */
function animateRope(fromPx, toPx) {
  if (!rope) return;
  const ropeBottom = trackScene.offsetHeight * 0.36 + 55;
  rope.style.transition = 'none';
  rope.style.bottom     = ropeBottom + 'px';
  rope.style.left       = fromPx + 'px';
  rope.style.width      = '0px';
  rope.style.opacity    = '1';

  requestAnimationFrame(() => {
    rope.style.transition = 'width 1.4s cubic-bezier(0.4,0,0.2,1)';
    rope.style.width      = Math.abs(toPx - fromPx) + 'px';
    setTimeout(() => {
      rope.style.transition = 'opacity 0.5s ease';
      rope.style.opacity    = '0';
    }, 1800);
  });
}

/* ── sun burst on milestone reach ── */
function sunBurst(flagPct) {
  const sceneW = trackScene.offsetWidth;
  const x      = (flagPct / 100) * sceneW;
  const burst  = document.createElement('div');
  burst.style.cssText = `
    position:absolute; left:${x}px; bottom:calc(36% + 4px);
    width:4px; height:4px; border-radius:50%;
    background:transparent;
    border:3px solid #f5d200;
    box-shadow:0 0 16px #f5d200, 0 0 32px rgba(245,210,0,0.5);
    transform:translate(-50%,50%);
    pointer-events:none; z-index:6;
    animation:sunBurst 0.7s ease-out forwards;
  `;
  trackScene.appendChild(burst);
  setTimeout(() => burst.remove(), 800);

  /* second ring — green */
  const burst2 = burst.cloneNode();
  burst2.style.border      = '2px solid #39ff6e';
  burst2.style.boxShadow   = '0 0 12px #39ff6e';
  burst2.style.animationDelay = '0.15s';
  trackScene.appendChild(burst2);
  setTimeout(() => burst2.remove(), 1000);
}

/* ── select milestone ── */
function selectMilestone(index) {
  if (isAnimating) return;
  if (index === currentMilestone) return;
  isAnimating = true;

  const sceneW   = trackScene.offsetWidth || 1100;
  const destPct  = flagPcts[index];
  const destPx   = (destPct / 100) * sceneW - 42;
  const fromPx   = parseInt(runner.style.left) || 42;

  /* rope */
  animateRope(fromPx + 60, destPx);

  /* move runner */
  runner.style.left = destPx + 'px';

  /* update flags */
  flags.forEach((f, i) => {
    f.classList.remove('current', 'reached');
    if (i < index)  f.classList.add('reached');
    if (i === index) f.classList.add('current');
  });

  /* expand/collapse cards */
  msCards.forEach((c, i) => {
    c.classList.remove('active');
    if (i === index) c.classList.add('active');
  });

  /* sun burst on arrival */
  setTimeout(() => {
    sunBurst(destPct);
    isAnimating = false;
  }, 2500);

  /* hide hint after first click */
  if (runnerHint) runnerHint.style.display = 'none';
  currentMilestone = index;
}

/* ── runner click (cycle forward) ── */
if (runner) {
  runner.addEventListener('click', () => {
    const next = (currentMilestone + 1) % flagPcts.length;
    selectMilestone(next);
  });
}

/* ── card click ── */
msCards.forEach((card, i) => {
  card.addEventListener('click', () => selectMilestone(i));
});

/* ── flag click ── */
document.querySelectorAll('.ms-pole-group').forEach((pole, i) => {
  pole.addEventListener('click', () => selectMilestone(i));
});

/* ── auto-run on section enter ── */
const ioTrack = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !runnerFired) {
      runnerFired = true;
      /* wait a beat then run to last milestone */
      setTimeout(() => selectMilestone(flagPcts.length - 1), 600);
      ioTrack.unobserve(e.target);
    }
  });
}, { threshold: 0.35 });
if (trackScene) ioTrack.observe(trackScene);

/* ══════════════════════════════════════
   FOOTER EASTER EGG
══════════════════════════════════════ */
let clicks = 0, clickTimer;
const footer = document.getElementById('footer');
if (footer) {
  footer.addEventListener('click', () => {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => (clicks = 0), 500);
    if (clicks >= 3) {
      const easter = document.getElementById('easter');
      if (easter) easter.classList.add('revealed');
      clicks = 0;
    }
  });
}

/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault();
  const btn  = e.target.querySelector('.submit-btn span');
  const orig = btn.textContent;
  btn.textContent = 'Message Sent ✓';
  e.target.reset();
  setTimeout(() => (btn.textContent = orig), 3000);
}
