/* ============================================================
   HAREESHRADDI DANI — RESUME WEBSITE INTERACTIONS
   Vanilla JS · commented & beginner-friendly
   Sections: loader, hero name, particles, cursor, parallax,
   reveals, nav, skills, rings, tilt, magnetic, form, print
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. INTRO LOADER ---------- */
  var loader = document.getElementById('loader');
  var loaderFill = document.getElementById('loaderFill');
  var loaderStatus = document.getElementById('loaderStatus');
  var progress = 0;
  var messages = ['Initializing experience…', 'Shaping morph field…', 'Lighting the stage…', 'Revealing portfolio…'];

  // Fake-but-smooth loading progress
  var tick = setInterval(function () {
    progress += Math.random() * 22 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      setTimeout(finishLoading, 250);
    }
    loaderFill.style.width = progress + '%';
    loaderStatus.textContent = messages[Math.min(messages.length - 1, Math.floor(progress / 28))];
  }, 220);

  function finishLoading() {
    loader.classList.add('done');
    document.body.classList.add('loaded');
    startHeroSequence();
  }
  // Safety: never trap the user behind the loader
  setTimeout(function () {
    if (!loader.classList.contains('done')) { clearInterval(tick); finishLoading(); }
  }, 4500);

  /* ---------- 2. HERO NAME — char-by-char reveal ---------- */
  document.querySelectorAll('#heroName .name-line').forEach(function (line, li) {
    var text = line.getAttribute('data-text') || '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.animationDelay = (0.55 + li * 0.35 + i * 0.045) + 's';
      line.appendChild(s);
    });
  });

  /* ---------- 3. HERO ENTRANCE SEQUENCE ---------- */
  function startHeroSequence() {
    var els = document.querySelectorAll('.reveal-hero');
    els.forEach(function (el) {
      var d = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(function () { el.classList.add('in'); }, 150 + d * 140);
    });
  }

  /* ---------- 4. PROFILE PHOTO FALLBACK ---------- */
  var img = document.getElementById('profileImg');
  var placeholder = document.getElementById('photoPlaceholder');
  function showPlaceholder() { img.style.display = 'none'; placeholder.classList.add('show'); }
  img.addEventListener('error', showPlaceholder);
  if (img.complete && img.naturalWidth === 0) showPlaceholder();

  /* ---------- 5. PARTICLE FIELD (lightweight canvas) ---------- */
  var canvas = document.getElementById('particles');
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext('2d');
    var W, H, parts = [];
    var COUNT = window.innerWidth < 640 ? 36 : 70;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width;
      H = canvas.height = r.height;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawn(i) {
      parts[i] = {
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        hue: Math.random() > 0.5 ? '139,92,246' : '34,211,238',
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2
      };
    }
    for (var i = 0; i < COUNT; i++) spawn(i);

    var mx = -999, my = -999;
    canvas.parentElement.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('mouseleave', function () { mx = my = -999; });

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        // gentle repulsion from cursor
        var dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130 && d > 1) { p.vx += (dx / d) * 0.02; p.vy += (dy / d) * 0.02; }
        p.vx *= 0.985; p.vy *= 0.985;
        // keep a minimum drift
        if (Math.abs(p.vx) < 0.08) p.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(p.vy) < 0.08) p.vy += (Math.random() - 0.5) * 0.02;
        p.x += p.vx; p.y += p.vy; p.tw += 0.03;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        var alpha = p.a * (0.65 + 0.35 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.hue + ',' + alpha.toFixed(2) + ')';
        ctx.fill();
      }
      // connective lines (only nearby pairs, capped)
      ctx.lineWidth = 1;
      for (var a = 0; a < parts.length; a += 2) {
        for (var b = a + 2; b < parts.length; b += 2) {
          var pa = parts[a], pb = parts[b];
          var ddx = pa.x - pb.x, ddy = pa.y - pb.y;
          var dist = ddx * ddx + ddy * ddy;
          if (dist < 11000) {
            ctx.strokeStyle = 'rgba(139,92,246,' + (0.12 * (1 - dist / 11000)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 6. CURSOR GLOW + RING (desktop) ---------- */
  if (isFinePointer && !prefersReduced) {
    var glow = document.getElementById('cursorGlow');
    var ring = document.getElementById('cursorRing');
    var gx = -999, gy = -999, rx = -999, ry = -999, tx = -999, ty = -999;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function follow() {
      gx += (tx - gx) * 0.08; gy += (ty - gy) * 0.08;
      rx += (tx - rx) * 0.22; ry += (ty - ry) * 0.22;
      glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(follow);
    })();
    // grow ring over interactive elements
    document.querySelectorAll('a, button, .proj, input, textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('link-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('link-hover'); });
    });
  }

  /* ---------- 7. HERO PARALLAX (morph stage tilts with mouse) ---------- */
  var stage = document.getElementById('morphStage');
  var heroVisual = document.getElementById('heroVisual');
  if (stage && isFinePointer && !prefersReduced) {
    var hero = document.getElementById('home');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.transform = 'perspective(900px) rotateY(' + (px * 14) + 'deg) rotateX(' + (-py * 14) + 'deg)';
    });
    hero.addEventListener('mouseleave', function () {
      stage.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
    });
    stage.style.transition = 'transform .25s ease-out';
  }

  /* ---------- 8. SCROLL REVEALS ---------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var d = parseInt(en.target.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { en.target.classList.add('in'); }, d * 120);
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

  /* ---------- 9. SCROLL PROGRESS + NAV STATE + TIMELINE ---------- */
  var progressBar = document.querySelector('#scrollProgress span');
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = ['home', 'objective', 'education', 'skills', 'projects', 'strengths', 'contact']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var timelineFill = document.getElementById('timelineFill');

  function onScroll() {
    var st = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';

    // active nav link
    var current = 'home';
    sections.forEach(function (s) {
      if (st >= s.offsetTop - window.innerHeight * 0.4) current = s.id;
    });
    navLinks.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-section') === current);
    });

    // education timeline fill
    var tl = document.querySelector('.timeline');
    if (tl && timelineFill) {
      var r = tl.getBoundingClientRect();
      var p = 1 - (r.bottom - window.innerHeight * 0.6) / r.height;
      timelineFill.style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 10. SKILL BARS + RINGS animate on view ---------- */
  var skillObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var card = en.target;
      // bars
      card.querySelectorAll('.skill').forEach(function (sk, i) {
        var level = parseInt(sk.getAttribute('data-level'), 10);
        var fill = sk.querySelector('.fill');
        var pct = sk.querySelector('.skill-pct');
        setTimeout(function () {
          fill.style.width = level + '%';
          // count up
          var n = 0;
          var c = setInterval(function () {
            n += 2;
            if (n >= level) { n = level; clearInterval(c); }
            pct.textContent = n + '%';
          }, 24);
        }, i * 200);
      });
      // rings
      card.querySelectorAll('.ring').forEach(function (ringEl, i) {
        var pctV = parseInt(ringEl.getAttribute('data-pct'), 10);
        var fg = ringEl.querySelector('.fg');
        var C = 2 * Math.PI * 52;
        setTimeout(function () { fg.style.strokeDashoffset = C * (1 - pctV / 100); }, i * 200);
      });
      skillObs.unobserve(card);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('#skills .card').forEach(function (c) { skillObs.observe(c); });

  /* ---------- 11. 3D TILT on project cards ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(1000px) rotateY(' + (px * 7) + 'deg) rotateX(' + (-py * 7) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- 12. MAGNETIC BUTTONS ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.18 + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- 13. MOBILE MENU ---------- */
  var burger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', function () {
    var open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 14. CONTACT FORM → opens email app ---------- */
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var subject = encodeURIComponent(f.subject.value || ('Hello from ' + f.name.value));
    var body = encodeURIComponent('Hi Hareeshraddi,\n\n' + f.message.value + '\n\n— ' + f.name.value + ' (' + f.email.value + ')');
    window.location.href = 'mailto:hareeshraddi2005@gmail.com?subject=' + subject + '&body=' + body;
  });

  /* ---------- 15. PRINT / PDF + BACK TO TOP ---------- */
  function doPrint() { window.print(); }
  document.getElementById('printBtn').addEventListener('click', doPrint);
  document.getElementById('printBtn2').addEventListener('click', doPrint);
  var mp = document.getElementById('mobilePrintBtn');
  if (mp) mp.addEventListener('click', doPrint);
  document.getElementById('toTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* ---------- 16. Footer year (auto) ---------- */
  // (kept static 2026 in footer for print consistency)

})();
