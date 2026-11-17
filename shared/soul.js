/* Revamp layer, loaded after data.js on the revamp pages only.
   1. Swaps Shimlen's site photos for stock sample photos (the client asked for samples until their photoshoot).
      The hero and warehouse films are swapped for sample footage of the same kind (aerial site, warehouse floor).
  2. Writes story sections (rooms, board to room, people, belief) that each design themes with --sl-* tokens.
   3. Tags every stock picture "Sample photo". */
(function () {
  const S = window.SH, K = 'img/stock/';
  window.VIDEO_DIR = 'video/stock/'; /* sample drone and warehouse footage (Pexels) instead of Shimlen's own */
  const RD = 'img/renders/'; /* the client's renders of the planned new building */
  S.about.img = RD + 'new-corner-tropical.jpg';
  S.about.caption = 'Artist\'s impression · our new building, under construction next door';
  S.warehouse.gallery = [[RD + 'new-corner.jpg', 'The new building'], [K + 'boards.jpg', 'Boards stacked and ready'], [RD + 'new-night.jpg', 'The new front, at night']];

  const ROOMS = [['kitchen-dark.jpg', 'Kitchen', 'Melamine faced chipboard'], ['bedroom.jpg', 'Bedroom', 'eucalli E0 plywood'], ['tvwall.jpg', 'Living room', 'Sleek fluted panels'],
    ['island.jpg', 'Kitchen island', 'High pressure laminates'], ['study.jpg', 'Study', 'Lacquered laminate panels']];
  const STEPS = [['boards.jpg', 'The core', 'It starts inside, where no one looks. A plywood or E0 core, cut true, that holds a screw for years and keeps a long door flat.', 'Plywood · eucalli E0 · melamine faced plywood'],
    ['surface.jpg', 'The surface', 'Then the face you live with every day. Woodgrain, stone, solid colour, in finishes you can feel.', '400+ MFC decors · 500+ HPL decors · OPAQ ultra-matt'],
    ['veneer.jpg', 'The edge', 'Then the edge your hand finds first. Matched to the decor and bent round the curves, so the piece reads as one.', '500+ edgeband colours · Flexi edge for curves'],
    ['kitchen-dark.jpg', 'The room', 'And then it becomes someone\'s kitchen. The carpenter takes the credit, as they should. We make sure the boards were right.', 'Delivered in 24 hours* across the Klang Valley']];
  const R = () => window.ROOT || '../';
  const img = (f, alt, lazy = true) => `<img src="${R()}${K}${f}" alt="${alt}"${lazy ? ' loading="lazy"' : ''}>`;

  const html = {
    rooms: (cls = '') => `<section class="sl sl-rooms ${cls}" id="rooms"><div class="sl-w">
      <div class="sl-top"><div><div class="sl-lab">Where our boards end up</div><h2 class="sl-h">Not boards. <em>Rooms</em> people live in.</h2></div>
        <p class="sl-p">Kitchens that get cooked in every night, wardrobes opened every morning. This is what Shimlen materials turn into, in the hands of Malaysia's furniture makers.</p></div>
      <div class="sl-grid">${ROOMS.map(([f, r, m]) => `<figure class="smp">${img(f, `${r} in ${m}`)}<figcaption><b>${r}</b><span>${m}</span></figcaption></figure>`).join('')}</div></div></section>`,

    story: (cls = '') => `<section class="sl sl-story ${cls}" id="craft"><div class="sl-w sl-ss">
      <div class="sl-pics">${STEPS.map(([f, h], i) => `<figure class="smp${i ? '' : ' on'}">${img(f, h)}</figure>`).join('')}<span class="sl-n">01</span></div>
      <div><div style="padding-top:clamp(10px,3vw,40px)"><div class="sl-lab">From board to room</div><h2 class="sl-h">Every piece of furniture is <em>four</em> decisions.</h2></div>
        ${STEPS.map(([f, h, p, s], i) => `<article class="sl-step${i ? '' : ' on'}" data-i="${i}"><div class="sl-m smp">${img(f, h)}</div><span class="k">0${i + 1}</span><h3>${h}</h3><p>${p}</p><small>${s}</small></article>`).join('')}</div>
    </div></section>`,

    people: (cls = '') => `<section class="sl sl-people ${cls}" id="people"><div class="sl-w sl-ppl">
      <div class="pic smp">${img('carpenter.jpg', 'A carpenter at work, smiling')}<div class="pic2 smp">${img('swatches.jpg', 'Choosing decor samples')}</div></div>
      <div><div class="sl-lab">The people we work for</div><h2 class="sl-h">Built for the people who <em>build.</em></h2>
        <p class="sl-p" style="margin-top:22px">For 45 years our customers have been carpenters, cabinet makers, contractors and designers. They put their name on the work. We make sure nothing slows them down.</p>
        <ul class="who"><li><b>Carpenters</b><span>The right board, cut to size, on site tomorrow.</span></li><li><b>Furniture makers</b><span>Decors and edgebands matched, in volume.</span></li><li><b>Designers</b><span>Samples in hand before the client meeting.</span></li></ul>
        <a class="sl-link" href="#contact">Talk to our team</a></div></div></section>`,

    /* the new building, three ways: a card (Open), an arch at night (Heartwood), an index of views (Studio) */
    home: (cls = '', kind = 'card') => {
      const lab = `<div class="sl-lab">What comes next</div><h2 class="sl-h">Our next home is already <em>rising.</em></h2>`,
        txt = `On the lot next to our warehouse in Bandar Teknologi Kajang, a new Shimlen building is under construction. More room for stock, a brighter front door for our customers, and a façade with the same fluted rhythm as the panels we sell.`,
        h = lab + `<p class="sl-p" style="margin-top:22px">${txt}</p>`;
      const r = (f, alt) => `<img src="${R()}${RD}${f}" alt="${alt} (artist's impression)" loading="lazy">`;
      if (kind === 'index') return `<section class="sl sl-home idx ${cls}" id="new-home"><div class="sl-w">
        <div class="sl-top"><div>${lab}</div><p class="sl-p">${txt}</p></div>
        <div class="sl-idx">${[['new-front-dawn.jpg', 'Front, at dawn'], ['new-corner-tropical.jpg', 'Corner, from the car park'], ['new-front-mist.jpg', 'Front, morning mist'], ['new-night.jpg', 'Front, at night']].map(([f, c], i) => `<figure class="rnd">${r(f, c)}<figcaption><span>0${i + 1}</span>${c}</figcaption></figure>`).join('')}</div></div></section>`;
      if (kind === 'arch') return `<section class="sl sl-home arch ${cls}" id="new-home"><div class="sl-w sl-ppl">
        <div class="pic rnd">${r('new-night.jpg', 'The new Shimlen building at night')}</div><div>${h}<a class="sl-link" href="#contact">Visit us</a></div></div></section>`;
      return `<section class="sl sl-home ${cls}" id="new-home"><div class="sl-w"><div class="sl-card">
        <div class="pic rnd">${r('new-front-dusk.jpg', 'The new Shimlen building at dusk')}</div><div class="tx">${h}<a class="sl-link" href="#contact">Visit us</a></div></div></div></section>`
    },

    belief: (cls = '') => `<section class="sl sl-belief ${cls}"><div class="sl-w"><div class="sl-lab">What we believe</div>
      <p>Good boards <em>disappear</em> into good rooms.</p>
      <div class="sl-p">No one admires the plywood inside a wardrobe. They notice the door still closes straight ten years on. That is the part we look after.</div></div></section>`
  };

  /* where a new section meets one with a different background, both sides get room to breathe
     (some original sections had no top padding because the section before them was padded) */
  function breathe() {
    const bl = [...document.getElementById('app').children], gap = 'clamp(72px,8vw,120px)';
    const bg = e => { for (; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c } return '' };
    const media = e => { const f = e.firstElementChild; return !!f && /film|reel|hero|gal/i.test(f.className + ' ' + f.id) };
    for (let i = 1; i < bl.length; i++) {
      const A = bl[i - 1], B = bl[i];
      if (!A.classList.contains('sl') && !B.classList.contains('sl')) continue;
      if (bg(A) === bg(B)) continue;
      if (parseFloat(getComputedStyle(B).paddingTop) < 40 && !media(B)) B.style.paddingTop = gap;
      if (parseFloat(getComputedStyle(A).paddingBottom) < 40 && !media(A)) A.style.paddingBottom = gap
    }
  }
  /* hero openings, each with its own character:
     slow   – two views drift in slowly and cross-fade (Open)
     still  – one view, nothing moves (Studio)
     night  – the lit building, revealed by the page's own arch (Heartwood)
     blinds – views change through vertical strips, like the fluted façade (Quiet) */
  function reel(id, mode, files) {
    const box = document.getElementById(id); if (!box) return;
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.classList.add('rr', 'rr-' + mode, 'rnd');
    box.insertAdjacentHTML('afterbegin', files.map((f, i) => `<figure class="${i ? '' : 'on'}"><img src="${R()}${RD}${f}" alt="Shimlen's new building (artist's impression)"${i ? ' loading="lazy"' : ' fetchpriority="high"'}></figure>`).join(''));
    if (files.length < 2 || rm || mode === 'still' || mode === 'night') return;
    const fs = [...box.querySelectorAll('figure')]; let c = 0;
    if (mode === 'slow') { setInterval(() => { fs[c].classList.remove('on'); c = (c + 1) % fs.length; fs[c].classList.add('on') }, 9000); return }
    /* blinds: twelve strips close over the picture in a wave, carrying the next view */
    const N = innerWidth < 700 ? 6 : 12, bl = document.createElement('div'); bl.className = 'rr-bl'; box.appendChild(bl);
    const go = () => {
      const n = (c + 1) % fs.length, src = fs[n].querySelector('img').src, W = box.clientWidth;
      bl.innerHTML = Array.from({length: N}, (_, i) => `<i style="left:${i * 100 / N}%;width:${100 / N + .2}%"><img src="${src}" alt="" style="width:${W}px;left:${-i * W / N}px"></i>`).join('');
      const st = [...bl.children];
      gsap.fromTo(st, {clipPath: i => i % 2 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)'}, {clipPath: 'inset(0% 0 0% 0)', duration: 1.1, ease: 'expo.inOut', stagger: .06,
        onComplete: () => { fs[c].classList.remove('on'); c = n; fs[c].classList.add('on'); bl.innerHTML = '' }})
    };
    setInterval(go, 6000)
  }
  function init() {
    /* the warehouse film becomes a still: the stock factory footage wasn't strong enough */
    const wf = document.getElementById('whFilm');
    if (wf) { wf.id = 'whStill'; wf.classList.add('smp'); wf.insertAdjacentHTML('afterbegin', `<img class="still" src="${R()}${K}lumber.jpg" alt="Timber racked and ready to go (sample photo)" loading="lazy">`) }
    breathe();
    document.querySelectorAll('img[src*="/' + RD + '"]').forEach(i => { const p = i.parentElement; if (!p.closest('.rnd')) p.classList.add('rnd'); if (getComputedStyle(p).position === 'static') p.style.position = 'relative' });
    /* sample tags on any stock picture the page itself rendered */
    document.querySelectorAll(`img[src*="/${K}"]`).forEach(i => { const p = i.parentElement; if (!p.closest('.smp')) p.classList.add('smp') });
    document.querySelectorAll('.smp').forEach(e => { if (getComputedStyle(e).position === 'static') e.style.position = 'relative' });
    /* sample tag on the films */
    ['heroReel'].forEach(id => { const b = document.getElementById(id); if (!b) return; b.classList.add('smpv'); if (getComputedStyle(b).position === 'static') b.style.position = 'relative' });
    /* board to room: the step in the middle of the screen turns the picture */
    const st = [...document.querySelectorAll('.sl-step')], fs = [...document.querySelectorAll('.sl-pics figure')], n = document.querySelector('.sl-n'); let c = 0;
    if (!st.length) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const i = +e.target.dataset.i; if (i === c) return;
      st.forEach((s, j) => s.classList.toggle('on', j === i)); fs.forEach((f, j) => { f.classList.toggle('was', j < i); f.classList.toggle('on', j === i) }); c = i; n.textContent = '0' + (i + 1)
    }), {rootMargin: '-45% 0px -45% 0px'});
    st.forEach(s => io.observe(s))
  }
  /* put a section before an element with this id (or append to main) */
  function place(name, beforeId, cls, kind) {
    const t = beforeId && document.getElementById(beforeId), h = html[name](cls, kind);
    if (t) t.insertAdjacentHTML('beforebegin', h); else document.getElementById('app').insertAdjacentHTML('beforeend', h)
  }
  window.Soul = {html, init, place, reel, ROOMS, STEPS}
})();
