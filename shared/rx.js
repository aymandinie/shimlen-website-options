/* Revamp kit (Set B): shared by revamp-1..4. Each revamp writes its own layout; this file gives them
   - four opening screens, one per design (dawn, chapter, index, stack), polished and quick on a return visit
   - the building-render hero reel (slow cross-fade, still, night, blinds)
   - sample-photo and artist's-impression tags, the stock picture list, and the contact form fields.
   Load after data.js and brand.js; the opening screen uses GSAP when it is there and steps aside when it is not. */
(function () {
  const S = window.SH, root = document.documentElement;
  const R = () => window.ROOT || '../';
  const K = 'img/stock/', RD = 'img/renders/';
  const SHOT = location.search.indexOf('shot') > -1;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* a sample "in use" picture for each product, in SH.products.list order */
  const PK = ['plywood', 'mfc', 'hpl', 'opaq', 'sleek', 'edgeband', 'envplas', 'flexi', 'mfp'];
  const CAT = ['board', 'board', 'surface', 'surface', 'surface', 'edge', 'board', 'board', 'board'];
  const LOWF = [0, 1, 7, 8]; /* products with low-formaldehyde / E0 grades */
  const stock = f => `${R()}${K}${f}`, render = f => `${R()}${RD}${f}`;
  const use = i => stock(PK[i] + '.jpg');
  const ROOMS = [
    {f: 'kitchen-dark.jpg', room: 'Kitchen', line: 'Carcass in moisture-resistant MFC, doors in HPL, every edge matched.', p: [1, 2, 5]},
    {f: 'bedroom.jpg', room: 'Bedroom', line: 'Wardrobes on an E0 core that keeps tall doors straight for years.', p: [8, 0, 5]},
    {f: 'tvwall.jpg', room: 'Living room', line: 'A fluted feature wall that also softens the sound of the room.', p: [4, 3]},
    {f: 'island.jpg', room: 'Kitchen island', line: 'Laminate tops that take the knocks of a family kitchen.', p: [2, 1, 5]},
    {f: 'study.jpg', room: 'Study', line: 'Ultra-matt lacquered panels that don’t hold a fingerprint.', p: [3, 0]},
    {f: 'hall.jpg', room: 'Hallway', line: 'Full-height storage, flush and quiet, in a warm woodgrain.', p: [1, 5]}
  ];
  const RENDERS = [['new-front-dusk.jpg', 'The front, at dusk'], ['new-corner-tropical.jpg', 'The corner, from the car park'], ['new-front-mist.jpg', 'The front, morning mist'],
    ['new-night.jpg', 'The front, lit at night'], ['new-front-dawn.jpg', 'The front, at dawn'], ['new-corner.jpg', 'The corner, in daylight']];
  /* scale, from the published figure (10,000 sq m warehouse). 10,000 m² ≈ 107,600 sq ft; a FIFA pitch is about 7,140 m².
     Land size (~7 acres) and staff (~50) are not confirmed by the client yet, so they are not used. */
  const SCALE = {big: '10,000 m²', sqft: 'about 108,000 sq ft', pitch: 'bigger than a football pitch',
    line: 'Ten thousand square metres under one roof: about 108,000 sq ft, bigger than a football pitch, racked floor to ceiling with ready stock.'};
  const HOME = {h: 'Our next home is already rising.', p: 'On the lot next to our warehouse in Bandar Teknologi Kajang, a new Shimlen building is under construction. More room for stock, a brighter front door for our customers, and a façade with the same fluted rhythm as the panels we sell.'};

  /* ======================= opening screens ======================= */
  /* the page's <head> adds html.rx-loading before anything paints (see rx.css), so the content never flashes */
  function loader(kind, opts = {}) {
    const done = opts.done || (() => {});
    const skip = reduce || SHOT || !window.gsap;
    if (skip) { root.classList.remove('rx-loading'); done(); return }
    let seen = false; try { seen = sessionStorage.getItem('rx-' + location.pathname) === '1'; sessionStorage.setItem('rx-' + location.pathname, '1') } catch (e) {}
    const el = document.createElement('div'); el.className = 'rxl rxl-' + kind; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el);
    const min = seen ? 900 : (opts.min || 2400);
    (L[kind] || L.dawn)(el, min, (opts.preload || []).map(f => R() + f), () => { root.classList.remove('rx-loading'); done() })
  }
  /* real progress: the hero pictures and the fonts, never faster than `min`, never stuck (gives up waiting at 6s) */
  function progress(min, files, onP, onEnd) {
    let n = 0, fonts = false; const total = files.length + 1;
    files.forEach(f => { const i = new Image(); i.onload = i.onerror = () => n++; i.src = f });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => fonts = true);
    const t0 = performance.now(); let shown = 0, fin = false;
    (function tick(now) {
      const el = now - t0, t = Math.min(1, el / min), te = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const real = el > 6000 ? 1 : (n + (fonts ? 1 : 0)) / total;
      shown += (Math.min(te, real) - shown) * .14; const v = shown > .996 ? 1 : shown;
      onP(v); if (v >= 1 && !fin) { fin = true; onEnd(); return } requestAnimationFrame(tick)
    })(t0)
  }
  const L = {
    /* Open · dawn: a warm, light screen; the logo is drawn in from left to right, a hairline fills along the
       foot, and the screen fades away slowly onto the hero */
    dawn(el, min, files, done) {
      el.innerHTML = `<div class="rxl-c"><div class="rxl-logo">${window.SHIMLEN_LOGO}</div><div class="rxl-tag">Materials for custom-made furniture</div></div>
        <div class="rxl-foot"><span>Semenyih, Selangor</span><span class="rxl-pct">0</span><span>Since 1980</span></div><i class="rxl-bar"></i>`;
      const logo = $('.rxl-logo', el), bar = $('.rxl-bar', el), pct = $('.rxl-pct', el);
      gsap.fromTo(logo, {clipPath: 'inset(0% 100% 0% 0%)', filter: 'blur(6px)'}, {clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', duration: Math.min(1.8, min / 1000 * .75), ease: 'power2.inOut'});
      gsap.fromTo($('.rxl-tag', el), {opacity: 0, letterSpacing: '.6em'}, {opacity: 1, letterSpacing: '.26em', duration: 1.8, delay: .4, ease: 'power2.out'});
      gsap.fromTo($$('.rxl-foot span', el), {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: 1, stagger: .12, delay: .3, ease: 'power2.out'});
      progress(min, files, p => { bar.style.transform = `scaleX(${p})`; pct.textContent = Math.round(p * 100) }, () => {
        gsap.to($('.rxl-c', el), {opacity: 0, y: -14, duration: .8, ease: 'power2.in'});
        gsap.to([$('.rxl-foot', el), bar], {opacity: 0, duration: .5});
        gsap.to(el, {opacity: 0, duration: 1.3, delay: .55, ease: 'power1.inOut', onStart: done, onComplete: () => el.remove()})
      })
    },

    /* Heartwood · chapter: walnut; an arch is drawn round the year, which turns from 1980 to today; then an
       arch-shaped window opens in the walnut and grows until the page is uncovered */
    chapter(el, min, files, done) {
      const Y0 = 1980, Y1 = new Date().getFullYear();
      el.innerHTML = `<svg class="rxl-mask" aria-hidden="true"><path fill-rule="evenodd"/></svg>
        <div class="rxl-c"><svg class="rxl-arch" viewBox="0 0 220 300" aria-hidden="true"><path d="M8 300 V110 A102 102 0 0 1 212 110 V300"/><path class="in" d="M24 300 V114 A86 86 0 0 1 196 114 V300"/></svg>
          <div class="rxl-in"><div class="rxl-k">From ${Y0} to</div><div class="rxl-year">${Y0}</div><div class="rxl-sub">Shimlen · Semenyih</div></div></div>`;
      const path = $('.rxl-mask path', el), arcs = $$('.rxl-arch path', el), yr = $('.rxl-year', el);
      let W = innerWidth, H = innerHeight;
      const hole = w => { const cx = W / 2, h = w * 1.28, yb = H / 2 + h / 2, ys = yb - h + w / 2, x0 = cx - w / 2, x1 = cx + w / 2;
        path.setAttribute('d', `M0 0H${W}V${H}H0Z` + (w > 0 ? `M${x0} ${yb}V${ys}A${w / 2} ${w / 2} 0 0 1 ${x1} ${ys}V${yb}Z` : '')) };
      const svg = $('.rxl-mask', el); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); hole(0);
      arcs.forEach(a => { const l = a.getTotalLength(); a.style.strokeDasharray = l; a.style.strokeDashoffset = l });
      gsap.fromTo($('.rxl-in', el), {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: .15});
      progress(min, files, p => { yr.textContent = Math.round(Y0 + (Y1 - Y0) * p); arcs.forEach((a, i) => a.style.strokeDashoffset = parseFloat(a.style.strokeDasharray) * (1 - Math.min(1, p * (i ? 1.15 : 1)))) }, () => {
        root.classList.remove('rx-loading');
        const o = {w: 0}, end = Math.hypot(W, H) * 1.5;
        gsap.timeline({onComplete: () => el.remove()})
          .to($('.rxl-c', el), {opacity: 0, scale: .94, duration: .7, ease: 'power2.in'})
          .add(done, '-=.2')
          .to(o, {w: end, duration: 1.5, ease: 'expo.inOut', onUpdate: () => hole(o.w)}, '-=.35')
      })
    },

    /* Studio · index: the catalogue is written line by line on a ruled sheet, numbered 01 to 09, then the
       lines slip away and the sheet lifts off in one clean move */
    index(el, min, files, done) {
      const P = S.products.list;
      el.innerHTML = `<div class="rxl-grid">${'<i></i>'.repeat(12)}</div>
        <div class="rxl-top"><span>Shimlen Sdn. Bhd.</span><span>Product index</span><span>Semenyih, Selangor</span></div>
        <ol class="rxl-list">${P.map((p, i) => `<li><span class="n">0${i + 1}</span><span class="t"><b>${p.n}</b><em>${p.b}</em></span></li>`).join('')}</ol>
        <div class="rxl-bot"><span>Board · Surface · Edge</span><span class="rxl-cnt">00 / 0${P.length}</span><i class="rxl-bar"></i></div>`;
      const lis = $$('.rxl-list li', el), cnt = $('.rxl-cnt', el), bar = $('.rxl-bar', el); let k = -1;
      gsap.fromTo($$('.rxl-top span, .rxl-bot span', el), {yPercent: 110}, {yPercent: 0, duration: .9, stagger: .06, ease: 'expo.out'});
      gsap.fromTo($$('.rxl-grid i', el), {scaleY: 0}, {scaleY: 1, duration: 1.2, stagger: .03, ease: 'expo.out'});
      progress(min, files, p => {
        bar.style.transform = `scaleX(${p})`; const nk = Math.min(lis.length - 1, Math.floor(p * lis.length - .001));
        while (k < nk) { k++; lis[k].classList.add('on'); gsap.fromTo(lis[k].children, {yPercent: 105}, {yPercent: 0, duration: .7, ease: 'expo.out', stagger: .05}); cnt.textContent = `0${k + 1} / 0${lis.length}` }
      }, () => {
        gsap.to($$('.rxl-list li > *, .rxl-top span, .rxl-bot span', el), {yPercent: -110, duration: .55, stagger: .015, ease: 'expo.in'});
        gsap.to(el, {yPercent: -100, duration: 1.05, delay: .45, ease: 'expo.inOut', onStart: () => { root.classList.remove('rx-loading'); setTimeout(done, 350) }, onComplete: () => el.remove()})
      })
    },

    /* Quiet · stack: boards in eight decors slide in from alternate sides and stack up the screen while the
       stock count runs; then they fly out, top first, onto the hero */
    stack(el, min, files, done) {
      const D = [['#E9E2D6', 'Natural ash'], ['#C9A27A', 'Light oak'], ['#2B2725', 'Midnight'], ['#8C6A50', 'Teak'], ['#A9A49C', 'Concrete'], ['#4A3A31', 'Walnut'], ['#7F8A76', 'Sage'], ['#D8CFC4', 'Linen']];
      const dark = h => { const n = parseInt(h.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return .299 * r + .587 * g + .114 * b < 150 };
      el.innerHTML = `<div class="rxl-top"><div class="rxl-t">Every room starts with a <em>board.</em></div>
        <div class="rxl-cnt"><b>0</b><span>low-formaldehyde boards in our record stockpile</span></div></div>` +
        D.map(([c, n], i) => `<div class="rxl-b${dark(c) ? ' dk' : ''}" style="background:${c};bottom:${i * 8.5}%"><span>${n}</span></div>`).join('');
      const bs = $$('.rxl-b', el), num = $('.rxl-cnt b', el); let k = -1;
      gsap.set(bs, {xPercent: i => i % 2 ? 101 : -101});
      gsap.fromTo($$('.rxl-top>*', el), {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 1, stagger: .12, delay: .15, ease: 'expo.out'});
      progress(min, files, p => {
        num.textContent = Math.round(S.lf.record.n * p).toLocaleString('en');
        const nk = Math.min(bs.length - 1, Math.floor(p * bs.length * 1.08));
        while (k < nk) { k++; gsap.to(bs[k], {xPercent: 0, duration: .8, ease: 'expo.out'}) }
      }, () => {
        gsap.to($$('.rxl-top>*', el), {opacity: 0, y: -24, duration: .45, stagger: .05, ease: 'power2.in'});
        root.classList.remove('rx-loading');
        gsap.to([...bs].reverse(), {xPercent: i => (bs.length - 1 - i) % 2 ? -101 : 101, duration: .85, ease: 'expo.inOut', stagger: .05, delay: .15});
        gsap.to(el, {backgroundColor: 'rgba(255,255,255,0)', duration: .7, delay: .45, ease: 'power1.inOut', onStart: () => setTimeout(done, 150), onComplete: () => el.remove()})
      })
    }
  };

  /* ======================= hero reel of the renders ======================= */
  function reel(box, mode, files) {
    if (typeof box === 'string') box = document.getElementById(box); if (!box) return;
    box.classList.add('rr', 'rr-' + mode, 'rnd');
    box.insertAdjacentHTML('afterbegin', files.map((f, i) => `<figure class="${i ? '' : 'on'}"><img src="${render(f)}" alt="Shimlen's new building (artist's impression)"${i ? ' loading="lazy"' : ' fetchpriority="high"'}></figure>`).join(''));
    if (files.length < 2 || reduce || SHOT || mode === 'still' || mode === 'night') return;
    const fs = $$('figure', box); let c = 0;
    if (mode !== 'blinds' || !window.gsap) { setInterval(() => { fs[c].classList.remove('on'); c = (c + 1) % fs.length; fs[c].classList.add('on') }, mode === 'slow' ? 9000 : 6000); return }
    const N = innerWidth < 700 ? 6 : 12, bl = document.createElement('div'); bl.className = 'rr-bl'; box.appendChild(bl);
    const go = () => {
      const n = (c + 1) % fs.length, src = $('img', fs[n]).src, W = box.clientWidth;
      bl.innerHTML = Array.from({length: N}, (_, i) => `<i style="left:${i * 100 / N}%;width:${100 / N + .2}%"><img src="${src}" alt="" style="width:${W}px;left:${-i * W / N}px"></i>`).join('');
      gsap.fromTo([...bl.children], {clipPath: i => i % 2 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)'}, {clipPath: 'inset(0% 0 0% 0)', duration: 1.1, ease: 'expo.inOut', stagger: .06,
        onComplete: () => { fs[c].classList.remove('on'); c = n; fs[c].classList.add('on'); bl.innerHTML = '' }})
    };
    setInterval(go, 6000)
  }

  /* ======================= tags ======================= */
  /* every stock picture says "Sample photo", every render "Artist's impression" (small pictures are left clean) */
  function tag() {
    $$(`img[src*="/${K}"], img[src*="/${RD}"]`).forEach(i => {
      if (i.closest('[data-notag],.rr,.rxl')) return; const p = i.closest('figure,article,.pic,button,a,div'); if (!p) return;
      if (p.closest('.smp,.rnd')) return;
      p.classList.add(i.src.indexOf('/' + RD) > -1 ? 'rnd' : 'smp');
      if (getComputedStyle(p).position === 'static') p.style.position = 'relative'
    });
    const small = () => $$('.smp,.rnd').forEach(e => e.classList.toggle('tag-sm', e.clientWidth < 200));
    small(); addEventListener('resize', small)
  }

  /* ======================= shared bits of markup ======================= */
  const form = (fieldCls = 'field') => `
    <div class="${fieldCls}"><label for="fName">Name *</label><input id="fName" name="name" required autocomplete="name"><div class="msg">Please enter your name</div></div>
    <div class="${fieldCls}"><label for="fPhone">Phone / WhatsApp *</label><input id="fPhone" name="phone" type="tel" required autocomplete="tel"><div class="msg">Please enter a contact number</div></div>
    <div class="${fieldCls}"><label for="fEmail">Email</label><input id="fEmail" name="email" type="email" autocomplete="email"><div class="msg">Please check the email address</div></div>
    <div class="${fieldCls}"><label for="fCo">Company</label><input id="fCo" name="company" autocomplete="organization"></div>
    <div class="${fieldCls}"><label for="fRole">I am a</label><select id="fRole" name="role">${S.contact.roles.map(r => `<option>${r}</option>`).join('')}</select></div>
    <div class="${fieldCls}"><label for="prodSelect">Product</label><select name="product" id="prodSelect"></select></div>
    <div class="${fieldCls} full"><label for="fMsg">Message</label><textarea id="fMsg" name="msg" placeholder="Decors, sizes, quantities…"></textarea></div>`;
  const map = () => `<div class="map-ph">Loading map… <a href="${S.contact.gmaps}" target="_blank" rel="noopener">Open in Google Maps</a></div>
    <iframe class="map-frame" id="mapFrame" title="Shimlen Sdn. Bhd. on Google Maps" referrerpolicy="no-referrer-when-downgrade" data-src="${S.contact.embed}"></iframe>`;
  const note = 'Photos marked “Sample photo” are placeholders from Unsplash, to be replaced after Shimlen’s photoshoot. Pictures marked “Artist’s impression” are renders of Shimlen’s planned new building.';
  /* the nav for the header and the menu, from [label, id] pairs */
  const nav = list => list.map(([t, id]) => `<a href="#${id}">${t}</a>`).join('');

  window.RX = {K, RD, PK, CAT, LOWF, ROOMS, RENDERS, HOME, SCALE, stock, render, use, loader, reel, tag, form, map, note, nav};
})();
