/* Revamp layer, loaded after data.js on the revamp pages only.
   1. Swaps Shimlen's site photos for stock sample photos (the client asked for samples until their photoshoot).
      The hero and warehouse films are swapped for sample footage of the same kind (aerial site, warehouse floor).
  2. Writes four story sections (rooms, board to room, people, belief) that each design themes with --sl-* tokens.
   3. Tags every stock picture "Sample photo". */
(function () {
  const S = window.SH, K = 'img/stock/';
  window.VIDEO_DIR = 'video/stock/'; /* sample drone and warehouse footage (Pexels) instead of Shimlen's own */
  S.about.img = K + 'wh-panels.jpg';
  S.about.caption = 'Sample photo · our warehouse will be photographed after the move';
  S.warehouse.gallery = [[K + 'wh-racking.jpg', 'Racking, floor to ceiling'], [K + 'wh-panels.jpg', 'Panels ready to go'], [K + 'wh-people.jpg', 'Our floor team']];

  const ROOMS = [['kitchen.jpg', 'Kitchen', 'Melamine faced chipboard'], ['bedroom.jpg', 'Bedroom', 'eucalli E0 plywood'], ['tvwall.jpg', 'Living room', 'Sleek fluted panels'],
    ['island.jpg', 'Kitchen island', 'High pressure laminates'], ['hall.jpg', 'Hallway', 'Lacquered laminate panels']];
  const STEPS = [['boards.jpg', 'The core', 'It starts inside, where no one looks. A plywood or E0 core, cut true, that holds a screw for years and keeps a long door flat.', 'Plywood · eucalli E0 · melamine faced plywood'],
    ['opaq.jpg', 'The surface', 'Then the face you live with every day. Woodgrain, stone, solid colour, in finishes you can feel.', '400+ MFC decors · 500+ HPL decors · OPAQ ultra-matt'],
    ['veneer.jpg', 'The edge', 'Then the edge your hand finds first. Matched to the decor and bent round the curves, so the piece reads as one.', '500+ edgeband colours · Flexi edge for curves'],
    ['kitchen.jpg', 'The room', 'And then it becomes someone\'s kitchen. The carpenter takes the credit, as they should. We make sure the boards were right.', 'Delivered in 24 hours* across the Klang Valley']];
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
  function init() {
    breathe();
    /* sample tags on any stock picture the page itself rendered */
    document.querySelectorAll(`img[src*="/${K}"]`).forEach(i => { const p = i.parentElement; if (!p.closest('.smp')) p.classList.add('smp') });
    document.querySelectorAll('.smp').forEach(e => { if (getComputedStyle(e).position === 'static') e.style.position = 'relative' });
    /* sample tag on the films */
    ['heroReel', 'whFilm'].forEach(id => { const b = document.getElementById(id); if (!b) return; b.classList.add('smpv'); if (getComputedStyle(b).position === 'static') b.style.position = 'relative' });
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
  function place(name, beforeId, cls) {
    const t = beforeId && document.getElementById(beforeId), h = html[name](cls);
    if (t) t.insertAdjacentHTML('beforebegin', h); else document.getElementById('app').insertAdjacentHTML('beforeend', h)
  }
  window.Soul = {html, init, place, ROOMS, STEPS}
})();
