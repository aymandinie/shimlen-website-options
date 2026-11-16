/* Shimlen v4 motion layer, shared by the three styles. Each page calls Motion.init({intro}) after Core.init(),
   then adds its own moments with the helpers below. Skipped for reduced motion and ?shot; on touch screens the
   page keeps native scrolling. If the libraries fail to load, the page still works without motion. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = window.ROOT || '';
  const SHOT = location.search.indexOf('shot') > -1;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const coarse = matchMedia('(pointer:coarse)').matches;
  const ok = !reduce && !SHOT && !!window.gsap && !!window.ScrollTrigger;
  const root = document.documentElement;
  let lenis = null;
  const hh = () => parseFloat(getComputedStyle(root).getPropertyValue('--hh')) || 72;
  const E = 'expo.out';

  /* ================= opening intros (one per style) ================= */
  function introShell(cls) {
    let seen = false; try { seen = sessionStorage.getItem('sh-intro-' + location.pathname) === '1'; sessionStorage.setItem('sh-intro-' + location.pathname, '1') } catch (e) {}
    root.classList.add('is-loading');
    const el = document.createElement('div'); el.className = 'pre ' + cls; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el);
    return {el, min: seen ? 700 : 1800}
  }
  /* counts 0 → 100 over `min` (holds at 90 until the page has loaded), then calls out() */
  /* the counter glides: it eases toward where it should be, creeps on slowly if the page is still loading,
     and never freezes and jumps */
  function countUp(numEl, min, onP, out) {
    const t0 = performance.now(); let loaded = document.readyState === 'complete', fin = false, shown = 0;
    addEventListener('load', () => loaded = true);
    (function tick(n) {
      const t = Math.max(0, Math.min(1, (n - t0) / min)), e = 1 - Math.pow(1 - t, 2);
      const target = loaded || n - t0 > 2400 ? e : Math.min(e, .9 + .08 * (1 - Math.exp(-(n - t0 - min) / 900)) * (n - t0 > min ? 1 : 0));
      shown += (target - shown) * .16;
      const v = shown > .995 ? 1 : shown;
      if (numEl) numEl.textContent = String(Math.round(v * 100)).padStart(3, '0'); onP && onP(v);
      if (v >= 1 && !fin) { fin = true; out(); return }
      requestAnimationFrame(tick)
    })(t0)
  }
  const finish = (el, done) => { root.classList.remove('is-loading'); done(); return () => el.remove() };

  /* Option 1 · columns: five panels; the mark and logo rise, a line fills, then the panels lift one after another */
  function introColumns(done) {
    const {el, min} = introShell('pre-cols');
    el.innerHTML = `${'<i class="col"></i>'.repeat(5)}<div class="pre-c"><div class="pre-logo">${window.SHIMLEN_LOGO || ''}</div>
      <div class="pre-line"><b></b></div><div class="pre-row"><span>Semenyih, Selangor</span><span class="pre-num">000</span><span>Since 1980</span></div></div>`;
    const c = $('.pre-c', el), line = $('.pre-line b', el);
    gsap.fromTo($('.pre-logo', el), {y: 40, opacity: 0}, {y: 0, opacity: 1, duration: 1, ease: E});
    gsap.fromTo($$('.pre-row span', el), {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: .8, stagger: .08, delay: .25, ease: E});
    countUp($('.pre-num', el), min, p => line.style.transform = `scaleX(${p})`, () => {
      const rm = finish(el, done);
      gsap.to(c, {y: -60, opacity: 0, duration: .55, ease: 'expo.in'});
      gsap.to($$('.col', el), {yPercent: -100, duration: 1, ease: 'expo.inOut', stagger: .07, delay: .25, onComplete: rm})
    })
  }

  /* Option 2 · log end: growth rings like a real cut log (off-centre heart, uneven wobbly rings, cracks) draw
     outward around the wordmark, then the screen lifts like a curtain */
  function logRings(w = 1200, h = 800, seed = 11) {
    let sd = seed; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
    const cx = w * .47, cy = h * .53, out = []; let r = 10;
    const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
    const smooth = pts => { let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`; const n = pts.length;
      for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}` }
      return d + 'Z' };
    for (let k = 0; k < 22; k++) {
      r += 9 + rnd() * 26 + k * .9;                                  /* uneven growth from year to year */
      const pts = [], N = 48, jit = [];
      for (let i = 0; i < N; i++) jit.push((rnd() - .5) * .035);
      for (let i = 0; i < N; i++) { const t = i / N * Math.PI * 2;
        const f = 1 + .07 * Math.sin(2 * t + ph[0]) + .035 * Math.sin(3 * t + ph[1] + k * .08) + .02 * Math.sin(7 * t + ph[2]) + jit[i] * Math.min(1, k / 6);
        pts.push([cx + Math.cos(t) * r * f * 1.12, cy + Math.sin(t) * r * f]) }
      const late = k % 3 === 2;                                      /* darker late-wood bands */
      out.push(`<path d="${smooth(pts)}" style="--l:${Math.round(r * 7.4)};stroke-width:${late ? 1.7 : .7 + rnd() * .5};opacity:${late ? .62 : .32 + rnd() * .2}"/>`)
    }
    /* drying cracks running out from the heart */
    [[.3, 260], [2.3, 330], [4.4, 200]].forEach(([a, len]) => { let x = cx, y = cy, d = `M${x} ${y}`;
      for (let i = 0; i < 9; i++) { const aa = a + (rnd() - .5) * .35; x += Math.cos(aa) * len / 9; y += Math.sin(aa) * len / 9; d += ` L${x.toFixed(1)} ${y.toFixed(1)}` }
      out.push(`<path class="crack" d="${d}" style="--l:${len + 40}"/>`) });
    out.push(`<ellipse cx="${cx}" cy="${cy}" rx="7" ry="6" class="pith"/>`);
    return out.join('')
  }
  function introRings(done) {
    const {el, min} = introShell('pre-rings');
    el.innerHTML = `<svg class="pre-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">${logRings()}</svg>
      <div class="pre-c"><div class="pre-wm">${window.SHIMLEN_WORDMARK || ''}</div><div class="pre-sub">Semenyih, Selangor · Since 1980</div></div><div class="pre-num">000</div>`;
    const ps = $$('.pre-svg path', el), paths = $$('.pre-wm path', el), svg = $('.pre-svg', el);
    ps.forEach(c => { const l = c.style.getPropertyValue('--l'); c.style.strokeDasharray = l; c.style.strokeDashoffset = l });
    gsap.to(ps, {strokeDashoffset: 0, duration: 1.8, ease: 'power3.out', stagger: .045});
    gsap.fromTo(svg, {scale: 1.12, rotate: -4}, {scale: 1, rotate: 0, duration: 2.6, ease: 'power2.out', transformOrigin: '47% 53%'});
    gsap.set(paths, {yPercent: 115, transformBox: 'fill-box'});
    gsap.to(paths, {yPercent: 0, duration: 1, ease: E, stagger: .06, delay: .25});
    gsap.fromTo($('.pre-sub', el), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: .8, delay: .65, ease: E});
    countUp($('.pre-num', el), min, null, () => {
      const rm = finish(el, done);
      gsap.to($('.pre-c', el), {y: -30, opacity: 0, duration: .45, ease: 'power2.in'});
      gsap.to($('.pre-num', el), {opacity: 0, duration: .3});
      gsap.to(svg, {scale: 1.25, opacity: .4, duration: 1.2, ease: 'expo.inOut', transformOrigin: '47% 53%'});
      gsap.to(el, {clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut', delay: .3, onComplete: rm})
    })
  }

  /* Option 3 · frame: dark screen, Shimlen's photos flick through a frame while a giant counter runs, then the
     frame grows to fill the screen and opens onto the site */
  function introType(done) {
    const {el, min} = introShell('pre-type');
    const pics = ['img/site-aerial.jpg', 'img/p-mfc.jpg', 'img/site-warehouse.jpg', 'img/p-hpl.jpg', 'img/p-opaq.jpg', 'img/site-warehouse-2.jpg', 'img/p-sleek.jpg', 'img/site-building.jpg', 'video/hero-desktop.jpg'];
    el.innerHTML = `<div class="pre-top"><span>Shimlen Sdn. Bhd.</span><span>Semenyih, Selangor</span><span>Since 1980</span></div>
      <div class="pre-frame">${pics.map((p, i) => `<img src="${R}${p}" alt="" style="opacity:${i ? 0 : 1}">`).join('')}</div>
      <div class="pre-big"><span class="pre-num">000</span><div class="pre-wm">${window.SHIMLEN_WORDMARK || ''}</div></div>`;
    const imgs = $$('.pre-frame img', el), fr = $('.pre-frame', el), paths = $$('.pre-wm path', el);
    gsap.fromTo($$('.pre-top span', el), {yPercent: 120}, {yPercent: 0, duration: .9, stagger: .07, ease: E});
    gsap.fromTo(fr, {clipPath: 'inset(50% 50% 50% 50%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: E});
    gsap.set(paths, {yPercent: 115, transformBox: 'fill-box'}); gsap.to(paths, {yPercent: 0, duration: 1, stagger: .05, ease: E, delay: .2});
    let k = 0; const flick = setInterval(() => { imgs[k].style.opacity = 0; k = (k + 1) % (imgs.length - 1); imgs[k].style.opacity = 1 }, 170);
    countUp($('.pre-num', el), min, null, () => {
      clearInterval(flick); imgs.forEach((im, i) => im.style.opacity = i === imgs.length - 1 ? 1 : 0); const rm = finish(el, done);
      gsap.to([$('.pre-top', el), $('.pre-big', el)], {opacity: 0, y: i => i ? 40 : -30, duration: .45, ease: 'power2.in'});
      gsap.set(fr, {xPercent: -50, yPercent: -50});
      gsap.to(fr, {width: innerWidth, height: innerHeight, top: '50%', duration: 1, ease: 'expo.inOut', delay: .15});
      gsap.to(el, {opacity: 0, duration: .6, delay: 1.05, ease: 'power1.out', onComplete: rm})
    })
  }

  /* ================= smooth scroll: light, and never fights the rails ================= */
  function smooth() {
    if (!ok || !window.Lenis || coarse) return;
    $$('.drawer,.lb,.menu,iframe').forEach(e => e.setAttribute('data-lenis-prevent', ''));
    lenis = new Lenis({lerp: .16, wheelMultiplier: 1.1, smoothWheel: true,
      /* a sideways gesture over a rail scrolls the rail natively; everything vertical stays with the page */
      virtualScroll: d => !(Math.abs(d.deltaX) > Math.abs(d.deltaY) && d.event && d.event.target && d.event.target.closest && d.event.target.closest('.rail,.mq,.yl'))});
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    const watch = () => { const stop = $('#drawer.on') || $('#lb.open') || document.body.classList.contains('menu-open'); stop ? lenis.stop() : lenis.start() };
    const mo = new MutationObserver(watch);
    [$('#drawer'), $('#lb'), document.body].forEach(n => n && mo.observe(n, {attributes: true, attributeFilter: ['class']}))
  }

  /* ================= nav transition: a curtain wipes over, the page jumps, the curtain lifts ================= */
  function navCurtain() {
    if (!ok) return;
    const cv = document.createElement('div'); cv.className = 'xfade'; cv.innerHTML = `<img src="${R}img/logo-mark-white.svg" alt="">`; document.body.appendChild(cv);
    let busy = false;
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return; const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = $(id); if (!t) return; e.preventDefault();
      const far = Math.abs(t.getBoundingClientRect().top) > innerHeight * 1.5;
      const isNav = !!a.closest('#hdr,.menu,footer');
      if (!lenis) { t.scrollIntoView({behavior: 'smooth'}); return }
      if (!(isNav && far) || busy) { lenis.scrollTo(t, {offset: -hh() + 1, duration: 1.2}); return }
      busy = true;
      gsap.timeline({onComplete: () => busy = false})
        .set(cv, {display: 'grid'})
        .fromTo(cv, {clipPath: 'inset(100% 0% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: .55, ease: 'expo.inOut'})
        .fromTo($('img', cv), {scale: .6, opacity: 0}, {scale: 1, opacity: 1, duration: .4, ease: E}, '-=.2')
        .add(() => { lenis.scrollTo(t, {offset: -hh() + 1, immediate: true, force: true}); ScrollTrigger.refresh() })
        .to(cv, {clipPath: 'inset(0% 0% 100% 0%)', duration: .7, ease: 'expo.inOut', delay: .1})
        .set(cv, {display: 'none'})
    })
  }

  /* ================= cursor and magnetic buttons ================= */
  function cursor() {
    if (!ok || !fine) return;
    const d = document.createElement('div'), r = document.createElement('div'); d.className = 'cur'; r.className = 'cur-ring'; r.innerHTML = '<span></span>';
    document.body.append(d, r);
    const xd = gsap.quickTo(d, 'x', {duration: .1}), yd = gsap.quickTo(d, 'y', {duration: .1});
    const xr = gsap.quickTo(r, 'x', {duration: .35, ease: 'power3'}), yr = gsap.quickTo(r, 'y', {duration: .35, ease: 'power3'});
    const lab = $('span', r);
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return; root.classList.add('has-cur'); xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY);
      const t = e.target, c = t.closest && t.closest('[data-cursor]');
      root.classList.toggle('cur-label', !!c); if (c) lab.textContent = c.dataset.cursor;
      root.classList.toggle('cur-hover', !c && !!(t.closest && t.closest('a,button,[role=button],input,select,textarea')));
      root.classList.toggle('cur-dark', !!(t.closest && t.closest('[data-cur-dark]')))
    }, {passive: true});
    document.addEventListener('mouseleave', () => root.classList.remove('has-cur'))
  }
  /* buttons lean toward the pointer; while the page is moving they stay put (no "sticky" feeling on fast scrolls) */
  function magnetic(sel = '.btn,.burger,[data-magnetic]') {
    if (!ok || !fine) return;
    $$(sel).forEach(b => {
      const x = gsap.quickTo(b, 'x', {duration: .45, ease: 'power3'}), y = gsap.quickTo(b, 'y', {duration: .45, ease: 'power3'});
      b.addEventListener('pointermove', e => {
        if (lenis && Math.abs(lenis.velocity) > .5) return;
        const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .22); y((e.clientY - r.top - r.height / 2) * .3)
      });
      b.addEventListener('pointerleave', () => { x(0); y(0) })
    })
  }
  /* cards tilt toward the pointer in 3D */
  function tilt(sel, max = 7) {
    if (!ok || !fine) return;
    $$(sel).forEach(c => {
      gsap.set(c, {transformPerspective: 900});
      const rx = gsap.quickTo(c, 'rotateX', {duration: .5, ease: 'power3'}), ry = gsap.quickTo(c, 'rotateY', {duration: .5, ease: 'power3'});
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * max * 2); rx(-((e.clientY - r.top) / r.height - .5) * max * 2) });
      c.addEventListener('pointerleave', () => { rx(0); ry(0) })
    })
  }

  /* ================= scroll reveals ================= */
  /* reveals use IntersectionObserver, so they can't miss because of late layout changes (images, fonts, the intro).
     A safety net shows anything still hidden that is on screen. */
  const watchers = [];
  function onView(els, show, hide) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (!e.target._shown) { e.target._shown = 1; show(e.target) } }
      else if (e.boundingClientRect.top > innerHeight && e.target._shown) { e.target._shown = 0; hide(e.target) }
    }), {threshold: 0, rootMargin: '0px 0px -4% 0px'});
    els.forEach(el => io.observe(el)); watchers.push({els, show})
  }
  function safety() {
    watchers.forEach(w => w.els.forEach(el => { const r = el.getBoundingClientRect();
      if (!el._shown && r.top < innerHeight && r.bottom > 0) { el._shown = 1; w.show(el) } }))
  }
  /* frames unmask from the bottom and the picture inside settles from a zoom */
  function masks(sel) {
    if (!ok) return;
    const els = $$(sel); els.forEach(el => { el.classList.remove('wipe'); el.style.transition = 'none' });
    gsap.set(els, {clipPath: 'inset(100% 0% 0% 0%)', y: 50});
    onView(els, el => {
      gsap.to(el, {clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1, ease: E, overwrite: 'auto'});
      const im = el.querySelector(':scope > img, :scope > video'); if (im && !im._par) gsap.fromTo(im, {scale: 1.3}, {scale: 1, duration: 1.6, ease: E})
    }, el => gsap.set(el, {clipPath: 'inset(100% 0% 0% 0%)', y: 50}))
  }
  /* groups cascade in: rise, un-tilt and fade, one after another (in order on screen) */
  function cascade(sel) {
    if (!ok) return;
    /* CSS transitions (and the layout's per-card transition-delay) would fight the animation and hold the box
       invisible until it ends, then pop it in, so they are switched off on anything animated here */
    const els = $$(sel); if (!els.length) return; els.forEach(i => { i.classList.remove('rv'); i.style.transition = 'none' });
    gsap.set(els, {opacity: 0, y: 40, force3D: true});
    let q = [], t = null;
    const flush = () => { q.sort((x, y) => (x.getBoundingClientRect().top - y.getBoundingClientRect().top) || (x.getBoundingClientRect().left - y.getBoundingClientRect().left));
      gsap.to(q, {opacity: 1, y: 0, duration: .7, ease: 'power3.out', stagger: Math.min(.05, .25 / q.length), overwrite: 'auto'}); q = []; t = null };
    onView(els, el => { q.push(el); if (!t) t = requestAnimationFrame(flush) }, el => gsap.set(el, {opacity: 0, y: 40}))
  }
  /* headings build letter by letter: each character rises and un-tilts in turn */
  function chars(sel = '.split') {
    if (!ok) return;
    const hs = $$(sel); if (!hs.length) return;
    hs.forEach(h => {
      h.classList.add('chars');
      $$('.w>span', h).forEach(w => { w.innerHTML = [...w.textContent].map(c => `<i class="ch">${c}</i>`).join('') })
    });
    hs.forEach(h => gsap.set($$('.ch', h), {yPercent: 115, rotate: 10, opacity: 0}));
    onView(hs, h => gsap.to($$('.ch', h), {yPercent: 0, rotate: 0, opacity: 1, duration: .9, ease: E, stagger: {each: .015, amount: .35}, overwrite: 'auto'}),
      h => gsap.set($$('.ch', h), {yPercent: 115, rotate: 10, opacity: 0}))
  }
  /* ---- scroll-linked reveals: the motion follows the scroll position, so nothing is ever late ----
     items are grouped into rows (by their position on the page); a whole row rises and fades in together */
  function rows(containerSel, singleSel) {
    if (!ok) return;
    const done = new Set();
    /* timed off an element that doesn't move (the row's container), at the row's real, un-shifted position */
    const rowTween = (els, anchor) => { els.forEach(e => { e.classList.remove('rv'); e.style.transition = 'none'; done.add(e) });
      const off = () => Math.round(els[0].getBoundingClientRect().top - (+gsap.getProperty(els[0], 'y') || 0) - anchor.getBoundingClientRect().top);
      gsap.fromTo(els, {y: 56, opacity: 0}, {y: 0, opacity: 1, ease: 'none', immediateRender: true, force3D: true,
        scrollTrigger: {trigger: anchor, start: () => `top+=${off()} bottom`, end: () => `top+=${off()} 86%`, scrub: .3, invalidateOnRefresh: true}}) };
    const conts = $$(containerSel), isCont = new Set(conts);
    conts.forEach(c => {
      /* nested containers and letter-animated headings are handled on their own */
      const kids = [...c.children].filter(k => !done.has(k) && !isCont.has(k) && !k.classList.contains('split') && k.offsetParent !== null); const by = new Map();
      kids.forEach(k => { const t = Math.round(k.getBoundingClientRect().top + scrollY); const key = [...by.keys()].find(x => Math.abs(x - t) < 24); (by.get(key ?? t) || by.set(t, []).get(t)).push(k) });
      [...by.values()].forEach(r => rowTween(r, c))
    });
    if (singleSel) $$(singleSel).forEach(e => { if (!done.has(e)) rowTween([e], e.parentElement) })
  }
  /* headings: letters rise in sequence as the heading scrolls up */
  function charsScrub(sel = '.split') {
    if (!ok) return;
    $$(sel).forEach(h => {
      h.classList.add('chars');
      $$('.w>span', h).forEach(w => { w.innerHTML = [...w.textContent].map(c => `<i class="ch">${c}</i>`).join('') });
      gsap.fromTo($$('.ch', h), {yPercent: 115, rotate: 8, opacity: 0}, {yPercent: 0, rotate: 0, opacity: 1, ease: 'none', stagger: .02, force3D: true,
        scrollTrigger: {trigger: h, start: 'top bottom', end: 'top 80%', scrub: .3}})
    })
  }
  /* big photos unmask upward in step with the scroll */
  function maskScrub(sel) {
    if (!ok) return;
    $$(sel).forEach(el => { el.classList.remove('wipe');
      gsap.fromTo(el, {clipPath: 'inset(100% 0% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: {trigger: el, start: 'top bottom', end: 'top 68%', scrub: .3}}) })
  }
  /* keep every scroll position accurate as photos and fonts finish loading (Safari shifts the layout late) */
  function keepMeasured() {
    if (!ok) return; let t;
    const again = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 120) };
    $$('img').forEach(i => { if (!i.complete) i.addEventListener('load', again, {once: true}) });
    document.fonts && document.fonts.ready.then(again);
    addEventListener('load', again);
    /* any later change in page height (a picture swapped in, a panel opening) re-measures too */
    let h = 0; new ResizeObserver(() => { const nh = document.body.scrollHeight; if (Math.abs(nh - h) > 2) { h = nh; again() } }).observe(document.body)
  }
  /* labels decode letter by letter as they come in */
  function scramble(sel) {
    if (!ok) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $$(sel).forEach(el => {
      const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!node) return;
      const txt = node.textContent;
      const run = () => { let f = 0; const total = 18; (function step() { f++;
        node.textContent = txt.split('').map((ch, i) => ch === ' ' || ch === '·' ? ch : (i < (f / total) * txt.length ? ch : chars[(Math.random() * chars.length) | 0])).join('');
        if (f < total) requestAnimationFrame(step); else node.textContent = txt })() };
      ScrollTrigger.create({trigger: el, start: 'top 92%', onEnter: run, onEnterBack: () => {}})
    })
  }
  /* images drift inside their frames */
  function parallax(sel, amt = 8) {
    if (!ok) return;
    $$(sel).forEach(img => {
      img.style.transition = 'none'; img._par = 1;
      gsap.fromTo(img, {yPercent: -amt, scale: 1.18}, {yPercent: amt, scale: 1.18, ease: 'none',
        scrollTrigger: {trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true}})
    })
  }
  /* a block opens from a framed card to full size as it scrolls in */
  function expand(el, from = 'inset(8% 10% 8% 10% round 30px)', to = 'inset(0% 0% 0% 0% round 0px)', opts = {}) {
    if (!ok || !el) return;
    gsap.fromTo(el, {clipPath: from}, {clipPath: to, ease: 'none', scrollTrigger: Object.assign({trigger: el, start: 'top 92%', end: 'top 20%', scrub: true}, opts)})
  }
  /* footer wordmark letters rise into place */
  function wordRise(sel = '.f-wm') {
    if (!ok) return; const box = $(sel); if (!box) return;
    const paths = $$('svg path', box); $('svg', box).style.overflow = 'hidden';
    gsap.set(paths, {transformBox: 'fill-box'});
    gsap.fromTo(paths, {yPercent: 115}, {yPercent: 0, ease: 'none', stagger: .08, scrollTrigger: {trigger: box, start: 'top bottom', end: 'center bottom', scrub: .4}})
  }
  function scrub(target, fromVars, toVars, st) {
    if (!ok || !target) return;
    gsap.fromTo(target, fromVars, Object.assign({ease: 'none', scrollTrigger: Object.assign({trigger: target, start: 'top bottom', end: 'bottom top', scrub: true}, st)}, toVars))
  }
  /* thin progress line along the top */
  function progress() {
    if (!ok) return; const p = document.createElement('div'); p.className = 'sprog'; document.body.appendChild(p);
    gsap.to(p, {scaleX: 1, ease: 'none', scrollTrigger: {start: 0, end: 'max', scrub: true}})
  }

  window.Motion = {
    ok, get lenis() { return lenis }, parallax, expand, wordRise, scrub, magnetic, tilt, masks, cascade, scramble, chars, rows, charsScrub, maskScrub, keepMeasured,
    init(opts = {}) {
      if (ok) { gsap.registerPlugin(ScrollTrigger); root.classList.add('motion') }
      $$('img').forEach(i => { i.decoding = 'async' });
      smooth(); if (opts.cursor !== false) cursor(); if (opts.magnetic !== false) magnetic(opts.magnetic); if (opts.curtain !== false) navCurtain(); progress();
      const intro = ok ? ({columns: introColumns, rings: introRings, type: introType, none: d => d()}[opts.intro] || introColumns) : (d => d());
      intro(() => { if (ok) setTimeout(() => { ScrollTrigger.refresh(); safety() }, 80); opts.onReady && opts.onReady() });
      if (ok) { let st; addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(safety, 160) }, {passive: true}); addEventListener('load', () => setTimeout(safety, 300)) }
      if (ok) addEventListener('load', () => ScrollTrigger.refresh())
    }
  };
})();
