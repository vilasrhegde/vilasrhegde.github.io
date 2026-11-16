/* Builds the interactive version of each page on top of the static HTML.
   The static content stays in the page (for search engines and readers without JavaScript) and is hidden only once the
   interactive version has been mounted, so a script error never leaves the visitor with an empty page. */
(function () {
  'use strict';
  var doc = document, body = doc.body, page = doc.documentElement.getAttribute('data-page') || 'index', RT = window.ROOT;
  try {
    var P = window.PAGE, N = [['Work', P('work')], ['Photographs', P('photos')], ['Explore', P('explore')]];
    var cur = { work: 'Work', photos: 'Photographs', explore: 'Explore' }[page] || '';
    var bar = C.bar({ home: P('home'), items: N, cta: ['Say hello', page === 'index' ? '#contact' : P('home', 'contact')] }, cur);
    var tab = C.tabbar([['Home', P('home')], ['Work', P('work')], ['Photos', P('photos')], ['Explore', P('explore')]], { index: 'Home', work: 'Work', photos: 'Photos', explore: 'Explore' }[page]);
    var out = [bar], hero = null;
    var sec = function (id, t, s, b, cls) { var e = C.sec(id, t, s, b, cls); if (!t && !s) e.classList.add('nohead'); return e; };
    var nProj = (window.D && D.projects.length) || 23, nPhoto = (window.D && D.albums.reduce(function (n, a) { return n + a.photos.length; }, 0)) || 0;
    if (page === 'index') {
      hero = C.hero({ h: '92svh', canvas: false, actions: [['Play with my work', P('work'), true], ['Play Signal 32', P('explore')]] });
      var s0 = doc.createElement('section'); s0.className = 'sec s-first'; var w = doc.createElement('div'); w.className = 'wrap'; w.appendChild(X.stats()); w.appendChild(X.doors()); s0.appendChild(w);
      var jn = Journey.make('graph'); jn.id = 'journey';
      out.push(hero, s0, jn, sec('skills', 'What I work with', 'A network, not a list. Hover or tap a skill to see what it connects to.', X.skills()), sec('about', 'About me', '', X.about()), sec('contact', '', '', X.contact()));
    } else if (page === 'work') {
      out.push(C.pagehead('Work', nProj + ' things I built. Tap a tile to play with a live model.'), sec('projects', '', '', X.wall(), 'tight'), sec('skills', 'What I work with', 'A network, not a list. Hover or tap a skill to see what it connects to.', X.skills()));
    } else if (page === 'photos') {
      out.push(C.pagehead('Photographs', nPhoto + ' frames from trails, waterfalls, forts and rooftops. Open any one.'), sec('all', '', '', C.photos(), 'tight'), sec('contact', '', '', X.contact()));
    } else if (page === 'explore') {
      var ex = doc.createElement('div'); ex.className = 'wrap'; var slot = doc.createElement('div'); slot.className = 'g-slot'; ex.appendChild(slot);
      out.push(C.pagehead('Signal 32', 'A sci-fi investigation. Land on Kepler-23b, scan, survive, and recover 32 fragments of one person.'), sec('trek', '', '', ex, 'tight'));
    } else {
      out.push(C.pagehead('Wrong trail', 'This page does not exist. Maybe it fell off the lanyard.'), sec('lost', '', '', (function () { var p = doc.createElement('p'); var a1 = doc.createElement('a'); a1.className = 'btn p'; a1.href = P('home'); a1.textContent = 'Back to the start'; var a2 = doc.createElement('a'); a2.className = 'btn'; a2.href = P('work'); a2.textContent = 'See my work'; p.appendChild(a1); p.appendChild(doc.createTextNode(' ')); p.appendChild(a2); return p; })(), 'tight'));
    }
    out.push(C.foot(), tab); C.mount(out);
    if (page === 'explore') { Game.mount(slot); var e2 = doc.createElement('p'); e2.className = 'explain'; e2.textContent = 'Prefer not to play? Open the case file inside the game and use Skip to reveal all 32 at once.'; slot.parentNode.appendChild(e2); }
    if (hero && window.Hero) Hero.mount(hero, 'idcard');
    if (window.Anim) Anim.init();
    body.classList.add('js-on');
    var st = doc.getElementById('static'); if (st) st.hidden = true;
  } catch (e) {
    /* keep the static page visible and remove anything half-built */
    var app = doc.getElementById('app'); if (app) while (app.firstChild) app.removeChild(app.firstChild);
    body.classList.remove('js-on'); if (window.console) console.error(e);
  }
})();
