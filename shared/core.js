/* Shimlen v4: behaviour shared by the three styles. Each style page writes its own markup (from SH in data.js)
   with the ids/classes below, styles everything itself, then calls Core.init(). */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = window.ROOT || '';
  const SHOT = location.search.indexOf('shot') > -1; if (SHOT) document.documentElement.classList.add('shot');
  const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const isMobile = () => innerWidth <= 860;
  const ic = (id, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function toast(msg) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.append(t) }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1900)
  }

  /* words of .split headings wrapped for a staggered rise */
  function split() {
    $$('.split').forEach(el => {
      if (el.dataset.done) return; el.dataset.done = 1;
      el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      $$('.w>span', el).forEach((sp, i) => sp.style.transitionDelay = (i * 50) + 'ms')
    })
  }

  /* reveal on scroll; replays when an element drops back below the fold and comes up again */
  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
      else if (e.boundingClientRect.top > innerHeight) e.target.classList.remove('in')
    }), {threshold: .12, rootMargin: '0px 0px -6% 0px'});
    $$('.rv,.split,.wipe').forEach(el => io.observe(el))
  }

  /* number counters, eased, in big jumps */
  function counters() {
    const run = el => {
      const to = +el.dataset.count, t0 = performance.now(), dur = to > 9999 ? 1500 : 1100;
      (function f(n) {
        const q = Math.min((n - t0) / dur, 1), e = 1 - Math.pow(1 - q, 4);
        el.textContent = Math.round(to * e).toLocaleString('en'); if (q < 1) requestAnimationFrame(f)
      })(t0)
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target) }
    }), {threshold: .6});
    $$('[data-count]').forEach(el => { if (SHOT) { el.textContent = (+el.dataset.count).toLocaleString('en'); return } el.textContent = '0'; io.observe(el) })
  }

  /* the hero reel: signage fly-up, then the aerial pan, each dissolving into the other (from v3) */
  function heroReel(box) {
    if (!box) return;
    box.insertAdjacentHTML('beforeend', `<video class="rv-a" autoplay muted playsinline preload="auto" aria-hidden="true"></video><video class="rv-b off" muted playsinline preload="none" aria-hidden="true"></video>`);
    const vs = $$('video', box), names = ['hero', 'aerial'], XF = .9; let cur = 0, on = false, left = false, busy = false;
    const play = v => v.play().catch(() => {});
    vs.forEach((v, i) => { v.muted = true; v.poster = `${R}${window.VIDEO_DIR || 'video/'}${names[i]}-desktop.jpg` });
    if (reduceMotion) return;
    vs[0].src = `${R}${window.VIDEO_DIR || 'video/'}hero-desktop.mp4`; vs[0].load();
    const loadSecond = () => { if (!vs[1].src) { vs[1].preload = 'auto'; vs[1].src = `${R}${window.VIDEO_DIR || 'video/'}aerial-desktop.mp4`; vs[1].load() } };
    vs[0].addEventListener('playing', () => setTimeout(loadSecond, 1500), {once: true});
    const swap = () => {
      if (busy) return; busy = true; loadSecond(); const a = vs[cur], b = vs[1 - cur];
      b.currentTime = 0; play(b); b.classList.remove('off'); a.classList.add('off'); cur = 1 - cur;
      setTimeout(() => { a.pause(); busy = false }, XF * 1000 + 50)
    };
    vs.forEach((v, i) => {
      v.addEventListener('timeupdate', () => { if (i === cur && on && v.duration && v.currentTime > v.duration - XF) swap() });
      v.addEventListener('ended', () => { if (i === cur && on) swap() });
      v.addEventListener('canplay', () => { if (i === cur && on && v.paused) play(v) })
    });
    heroReel.resume = () => { if (on && vs[cur].paused) play(vs[cur]) };
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on) {
        if (left) { left = false; busy = false; cur = 0; vs[1].pause(); vs[1].classList.add('off'); vs[0].classList.remove('off'); vs[0].currentTime = 0 }
        play(vs[cur])
      } else { vs.forEach(v => v.pause()); left = true }
    }, {threshold: .05}).observe(box)
  }

  /* a single looping film that plays only while on screen */
  function film(box, name) {
    if (!box) return;
    box.insertAdjacentHTML('beforeend', `<video muted loop playsinline preload="metadata" aria-hidden="true"></video>`);
    const v = $('video', box); v.muted = true; v.poster = `${R}${window.VIDEO_DIR || 'video/'}${name}-desktop.jpg`;
    if (reduceMotion) return;
    v.src = `${R}${window.VIDEO_DIR || 'video/'}${name}-desktop.mp4`;
    let on = false, left = false;
    v.addEventListener('canplay', () => { if (on && v.paused) v.play().catch(() => {}) });
    film.list = (film.list || []).concat(() => { if (on && v.paused) v.play().catch(() => {}) });
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on) { if (left) { v.currentTime = 0; left = false } v.play().catch(() => {}) } else { v.pause(); left = true }
    }, {threshold: .05}).observe(box)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || reduceMotion) return;
    if (heroReel.resume) heroReel.resume(); (film.list || []).forEach(f => f())
  });

  /* simple tab sets: [data-tabs] holds buttons[data-tab], its sibling/target [data-panes] holds .pane */
  function tabs() {
    $$('[data-tabs]').forEach(tb => {
      const panes = $(tb.dataset.tabs), btns = $$('[data-tab]', tb);
      btns.forEach(b => b.onclick = () => {
        btns.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b) });
        $$('.pane', panes).forEach((p, i) => p.classList.toggle('on', i === +b.dataset.tab))
      })
    })
  }

  /* product drawer (markup made here, styled by each page) */
  let curP = 0;
  function drawer() {
    const P = SH.products.list;
    document.body.insertAdjacentHTML('beforeend', `<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-hidden="true" aria-label="Product details">
  <button class="d-close" id="dClose" aria-label="Close">${ic('x')}</button>
  <div class="d-img"><img id="dImg" alt=""></div>
  <div class="d-body"><img class="d-logo" id="dLogo" alt=""><div class="d-brand" id="dBrand"></div><h3 class="d-name" id="dName"></h3>
    <p class="d-desc" id="dDesc"></p><dl class="d-spec" id="dSpec"></dl>
    <button class="btn btn-solid" id="dEnq">Enquire about this product ${ic('arrow')}</button>
    <div class="d-nav"><button id="dPrev">← Previous</button><button id="dNext">Next →</button></div></div>
</aside>`);
    const dr = $('#drawer'), scrim = $('#scrim');
    function open(i) {
      curP = (i + P.length) % P.length; const p = P[curP];
      $('#dImg').src = R + p.img; $('#dImg').alt = p.n; $('#dLogo').style.display = p.logo ? 'block' : 'none'; if (p.logo) $('#dLogo').src = R + p.logo;
      $('#dBrand').textContent = p.b; $('#dName').textContent = p.n; $('#dDesc').textContent = p.d;
      $('#dSpec').innerHTML = p.s.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
      dr.classList.add('on'); scrim.classList.add('on'); dr.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden'
    }
    function close() { dr.classList.remove('on'); scrim.classList.remove('on'); dr.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = '' }
    drawer.open = open; drawer.close = close;
    $('#dClose').onclick = close; scrim.onclick = close; $('#dPrev').onclick = () => open(curP - 1); $('#dNext').onclick = () => open(curP + 1);
    $('#dEnq').onclick = () => {
      const s = $('#prodSelect'); if (s) s.value = P[curP].n; close();
      setTimeout(() => { $('#contact').scrollIntoView({behavior: 'smooth'}); toast(`${P[curP].n} added to your enquiry`) }, 300)
    };
    $$('[data-p]').forEach(b => b.addEventListener('click', e => { if (b._moved) return; open(+b.dataset.p) }));
    $$('[data-open]').forEach(a => a.addEventListener('click', () => setTimeout(() => open(+a.dataset.open), 500)))
  }

  /* lightbox */
  let LB = [], LI = 0;
  function lightbox() {
    document.body.insertAdjacentHTML('beforeend', `<div class="lb" id="lb" role="dialog" aria-label="Image viewer">
  <button class="lb-x" aria-label="Close">${ic('x')}</button><button class="lb-pv" aria-label="Previous">${ic('back')}</button>
  <figure><img alt=""><figcaption></figcaption></figure><button class="lb-nx" aria-label="Next">${ic('arrow')}</button></div>`);
    const lb = $('#lb'), im = $('img', lb), cap = $('figcaption', lb);
    const show = () => { im.src = LB[LI].src; cap.textContent = LB[LI].cap || '' };
    lightbox.open = (list, i = 0) => { LB = list; LI = i; show(); lb.classList.add('open'); $('.lb-pv', lb).hidden = $('.lb-nx', lb).hidden = list.length < 2 };
    $('.lb-x', lb).onclick = () => lb.classList.remove('open');
    lb.onclick = e => { if (e.target === lb || e.target.tagName === 'FIGURE') lb.classList.remove('open') };
    $('.lb-pv', lb).onclick = () => { LI = (LI - 1 + LB.length) % LB.length; show() };
    $('.lb-nx', lb).onclick = () => { LI = (LI + 1) % LB.length; show() };
    addEventListener('keydown', e => {
      if (e.key === 'Escape') { lb.classList.remove('open'); drawer.close && drawer.close() }
      if (lb.classList.contains('open') && LB.length > 1) { if (e.key === 'ArrowRight') $('.lb-nx', lb).click(); if (e.key === 'ArrowLeft') $('.lb-pv', lb).click() }
    });
    /* [data-lb="group"] items open as one set */
    const groups = {};
    $$('[data-lb]').forEach(el => { (groups[el.dataset.lb] = groups[el.dataset.lb] || []).push(el) });
    Object.values(groups).forEach(list => list.forEach((el, i) => el.addEventListener('click', () => {
      if (el._moved) return;
      lightbox.open(list.map(x => ({src: x.dataset.src || x.querySelector('img')?.src || x.src, cap: x.dataset.cap || ''})), i)
    })))
  }

  /* brands marquee: drifts, pauses on hover, drag or swipe to move */
  function marquee(mq) {
    if (!mq) return;
    const tr = $('.mq-track', mq);
    const one = SH.brands.map(([img, n, c]) => `<div class="mq-item"><img class="${c || ''}" src="${R}img/${img}" alt="${n}" draggable="false"><span>${n}</span></div>`).join('');
    tr.innerHTML = one + one + one;
    let x = 0, half = 0, drag = false, sx = 0, sx0 = 0, vel = 0, hover = false, last = performance.now();
    const measure = () => { half = tr.scrollWidth / 3 }; measure(); addEventListener('resize', measure); addEventListener('load', measure);
    (function tick(n) {
      const dt = Math.min(n - last, 50); last = n;
      if (!drag) { x -= (hover || reduceMotion ? 0 : .035 * dt) + vel; vel *= .92; if (Math.abs(vel) < .05) vel = 0 }
      if (half) { while (x <= -half) x += half; while (x > 0) x -= half }
      tr.style.transform = `translate3d(${x}px,0,0)`; requestAnimationFrame(tick)
    })(last);
    mq.addEventListener('mouseenter', () => hover = true); mq.addEventListener('mouseleave', () => hover = false);
    mq.addEventListener('pointerdown', e => { drag = true; sx = e.clientX; sx0 = x; vel = 0; mq.classList.add('drag'); mq.setPointerCapture(e.pointerId) });
    mq.addEventListener('pointermove', e => { if (!drag) return; const nx = sx0 + (e.clientX - sx); vel = x - nx; x = nx });
    const up = () => { if (!drag) return; drag = false; mq.classList.remove('drag'); if (matchMedia('(hover:none)').matches) hover = false };
    mq.addEventListener('pointerup', up); mq.addEventListener('pointercancel', up)
  }

  /* horizontal rails: mouse drag with momentum, wheel moves them sideways until an end, prev/next buttons */
  function rail(el, prev, next) {
    if (!el) return;
    let down = false, sx = 0, sl = 0, vel = 0, lx = 0, raf, moved = false;
    el.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = lx = e.clientX; sl = el.scrollLeft; vel = 0;
      cancelAnimationFrame(raf); el.style.scrollSnapType = 'none'; el.classList.add('drag')
    });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true; el.scrollLeft = sl - dx; vel = e.clientX - lx; lx = e.clientX });
    addEventListener('pointerup', () => {
      if (!down) return; down = false; el.classList.remove('drag');
      (function glide() { vel *= .92; el.scrollLeft -= vel; if (Math.abs(vel) > .5) raf = requestAnimationFrame(glide); else el.style.scrollSnapType = '' })()
    });
    el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } }, true);
    el.addEventListener('dragstart', e => e.preventDefault());
    const step = () => { const c = el.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0) : 300 };
    if (prev) prev.onclick = () => el.scrollBy({left: -step(), behavior: 'smooth'});
    if (next) next.onclick = () => el.scrollBy({left: step(), behavior: 'smooth'});
    const upd = () => {
      const max = el.scrollWidth - el.clientWidth - 2;
      if (prev) prev.disabled = el.scrollLeft <= 2; if (next) next.disabled = el.scrollLeft >= max;
      el.dispatchEvent(new CustomEvent('railmove', {detail: max > 0 ? el.scrollLeft / max : 0}))
    };
    el.addEventListener('scroll', upd, {passive: true}); addEventListener('resize', upd); setTimeout(upd, 100)
  }

  /* testimonials: stacked in one cell so the height never changes */
  function quotes() {
    const qs = $$('.q'), qd = $$('.q-dots button'); if (!qs.length) return; let qi = 0, qT;
    const go = i => {
      qi = (i + qs.length) % qs.length; qs.forEach((x, k) => x.classList.toggle('on', k === qi)); qd.forEach((x, k) => x.classList.toggle('on', k === qi));
      clearTimeout(qT); qT = setTimeout(() => go(qi + 1), 6500)
    };
    qd.forEach((b, i) => b.onclick = () => go(i)); go(0)
  }

  /* low formaldehyde steps fill one after another once in view */
  function steps() {
    const st = $$('.step'), box = $('#steps'); if (!box) return; let T;
    const set = i => { st.forEach((s, k) => s.classList.toggle('on', k <= i)); box.style.setProperty('--fill', ((i + 1) / st.length)) };
    st.forEach((s, i) => s.onclick = () => { clearInterval(T); set(i) });
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !T) { let i = 0; set(0); T = setInterval(() => { i++; if (i >= st.length) { clearInterval(T); return } set(i) }, 1200) }
    }), {threshold: .45}).observe(box)
  }

  /* the 60/40 core split animates in quickly */
  function coreBar() {
    const bar = $('#coreBar'); if (!bar) return;
    new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; bar.classList.add('in');
      $$('[data-pct]', bar).forEach(s => {
        const to = +s.dataset.pct, t0 = performance.now();
        (function f(n) { const q = Math.min((n - t0) / 900, 1); s.textContent = Math.round(to * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(f) })(t0)
      })
    }), {threshold: .5}).observe(bar)
  }

  /* copy to clipboard, form checks, map loads when near */
  function contact() {
    $$('.copyable').forEach(el => el.onclick = () => { navigator.clipboard?.writeText(el.dataset.copy).catch(() => {}); toast(`Copied ${el.textContent.trim()}`) });
    const sel = $('#prodSelect'); if (sel) sel.innerHTML = '<option>General enquiry</option>' + SH.products.list.map(p => `<option>${p.n}</option>`).join('');
    const f = $('#form'); if (f) f.onsubmit = e => {
      e.preventDefault(); let ok = true;
      $$('.field', f).forEach(fl => {
        const i = $('input,select,textarea', fl); if (!i) return;
        const bad = (i.required && !i.value.trim()) || (i.type === 'email' && i.value && !/^\S+@\S+\.\S+$/.test(i.value));
        fl.classList.toggle('bad', bad); if (bad) ok = false
      });
      if (ok) { $('#sent').classList.add('on'); f.reset() } else toast('Please check the highlighted fields')
    };
    /* the map lets the page scroll past it until it is clicked; it locks again when the pointer leaves */
    const fr0 = $('#mapFrame'); if (fr0) {
      const sh = document.createElement('button'); sh.className = 'map-shield'; sh.type = 'button'; sh.innerHTML = '<span>Click to use the map</span>';
      fr0.insertAdjacentElement('afterend', sh);
      sh.onclick = () => sh.classList.add('off');
      fr0.parentElement.addEventListener('mouseleave', () => sh.classList.remove('off'))
    }
    const fr = $('#mapFrame'); if (fr) new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting) return; fr.src = fr.dataset.src; fr.onload = () => fr.classList.add('on'); o.disconnect()
    }), {rootMargin: '400px'}).observe(fr)
  }

  /* header: solid once scrolled, hides on the way down, returns on the way up; scroll-spy; mobile menu */
  function header() {
    const hdr = $('#hdr'); if (!hdr) return; let lastY = scrollY, dir = 0;
    const links = $$('.nav-links a'), targets = links.map(a => $(a.getAttribute('href')));
    const on = () => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      hdr.classList.toggle('scrolled', y > 10);
      if (y > 0 && y < max - 2) {
        const dy = y - lastY; lastY = y; dir = Math.sign(dy) === Math.sign(dir) ? dir + dy : dy;
        if (dir > 60 && y > 500 && !document.body.classList.contains('menu-open')) hdr.classList.add('hide'); else if (dir < -60) hdr.classList.remove('hide')
      }
      if (y < 500) hdr.classList.remove('hide');
      let cur = -1; targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * .4) cur = i });
      links.forEach((a, i) => a.classList.toggle('active', i === cur));
      const p = $('#progress'); if (p) p.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      document.dispatchEvent(new CustomEvent('pagescroll', {detail: y}))
    };
    let tk = false; addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { tk = false; on() }) }, {passive: true}); on();
    const bg = $('#burger'); if (bg) bg.onclick = () => { const o = document.body.classList.toggle('menu-open'); bg.setAttribute('aria-expanded', o) };
    $$('.nav-links a, .menu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')))
  }

  /* callable phone numbers and a mail link (each number written out in full) */
  const tels = (sep = '') => SH.contact.phones.map(([c, t]) => `<a class="tel" href="tel:${c}">${t}</a>`).join(sep);
  const mail = () => `<a class="tel" href="mailto:${SH.contact.email}">${SH.contact.email}</a>`;

  window.Core = {
    $, $$, R, ic, esc, toast, isMobile, reduceMotion, rail, heroReel, film, tels, mail,
    open: i => drawer.open(i), lightbox: (l, i) => lightbox.open(l, i),
    logo: () => window.SHIMLEN_LOGO, wordmark: () => window.SHIMLEN_WORDMARK,
    init(opts = {}) {
      document.body.insertAdjacentHTML('afterbegin', window.SHIMLEN_ICONS);
      if (!$('.fab-wa')) document.body.insertAdjacentHTML('beforeend', `<a class="fab-wa" href="${SH.contact.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ic('wa')}</a>`);
      split(); header(); tabs(); drawer(); lightbox(); marquee($('#mq')); quotes(); steps(); coreBar(); contact(); counters();
      heroReel($(opts.hero || '#heroReel')); film($(opts.warehouse || '#whFilm'), 'warehouse');
      requestAnimationFrame(() => requestAnimationFrame(reveal))
    }
  };
})();
