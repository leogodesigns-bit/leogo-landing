// Renders case studies (/work/projects.json) and reels (/api/work) wherever a page asks.
var Work = (function () {
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var skel = function (n, cls) { return Array.from({ length: n }, function () { return '<div class="' + cls + '"><div class="cover skel"></div><div class="skel" style="height:18px;margin-top:12px;width:70%"></div></div>'; }).join(''); };
  var projects = function () { return fetch('/work/projects.json').then(function (r) { return r.json(); }); };
  function caseHref(p) { return p.link || '/work/' + p.slug; }
  function cases(el, limit) {
    el.innerHTML = skel(limit || 3, 'case');
    projects().then(function (list) {
      el.innerHTML = list.slice(0, limit || list.length).map(function (p) {
        return '<a class="case" href="' + esc(caseHref(p)) + '"><div class="cover"><img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy"></div><div class="meta">' + esc(p.type) + ', ' + esc(p.year) + '</div><h3>' + esc(p.title) + '</h3><p>' + esc(p.summary) + '</p></a>';
      }).join('');
    }).catch(function () { el.innerHTML = '<p class="small">Work could not load. <a href="https://instagram.com/leogodesigns">See it on Instagram</a>.</p>'; });
  }
  function reels(el, limit) {
    el.innerHTML = skel(5, 'reel');
    fetch('/api/work').then(function (r) { return r.json(); }).then(function (d) {
      var items = (d.items || []).slice(0, limit || 10);
      if (!items.length) { el.innerHTML = '<p class="small">New reels appear here as we post them. <a href="https://instagram.com/leogodesigns">Follow @leogodesigns</a>.</p>'; return; }
      el.innerHTML = items.map(function (m) {
        return '<a class="reel" href="' + esc(m.link) + '" target="_blank" rel="noopener"><div class="cover"><img src="' + esc(m.image) + '" alt="' + esc(m.title) + '" loading="lazy"></div><b>' + esc(m.title) + '</b><span>' + esc(m.from || 'Leogo Designs') + '</span></a>';
      }).join('');
    }).catch(function () { el.innerHTML = '<p class="small">Reels could not load. <a href="https://instagram.com/leogodesigns">See them on Instagram</a>.</p>'; });
  }
  function fig(it, cls) { return '<figure class="' + (cls || '') + '"><img src="' + esc(it.image) + '" alt="' + esc(it.caption) + '" loading="lazy"><figcaption>' + esc(it.caption) + '</figcaption></figure>'; }
  var blocks = {
    hero: function (b) { return '<div class="b-hero" style="background:' + esc(b.bg) + '"><img src="' + esc(b.image) + '" alt="' + esc(b.alt) + '"></div>'; },
    brief: function (b) { return '<div class="b-brief"><h2>' + esc(b.title) + '</h2><dl>' + b.items.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl></div>'; },
    row: function (b) { return '<div class="b-row"><h2>' + esc(b.title) + '</h2>' + (b.text ? '<p class="lead">' + esc(b.text) + '</p>' : '') + '<div class="grid n' + b.items.length + (b.fit ? ' ' + esc(b.fit) : '') + '">' + b.items.map(function (it) { return fig(it); }).join('') + '</div></div>'; },
    feature: function (b) { return '<div class="b-feature"><h2>' + esc(b.title) + '</h2><div class="grid">' + fig(b.main, 'main') + '<div class="side">' + b.items.map(function (it) { return fig(it); }).join('') + '</div></div></div>'; },
    palette: function (b) { return '<div class="b-palette"><h2>' + esc(b.title) + '</h2><div class="sw">' + b.colors.map(function (c) { return '<div><i style="background:' + esc(c[0]) + '"></i><b>' + esc(c[1]) + '</b><span>' + esc(c[0]) + '</span></div>'; }).join('') + '</div></div>'; },
    video: function (b) { return '<div class="b-video"><h2>' + esc(b.title) + '</h2><video src="' + esc(b.src) + '" poster="' + esc(b.poster) + '" controls playsinline preload="metadata"></video></div>'; }
  };
  function caseStudy(el, slug) {
    projects().then(function (list) {
      var i = list.findIndex(function (x) { return x.slug === slug; }), p = list[i];
      if (!p) { el.innerHTML = '<h1>Not found</h1><a class="back" href="/work">All work</a>'; return; }
      document.title = p.title + ' | Leogo Designs';
      var next = list.slice(i + 1).concat(list.slice(0, i)).filter(function (x) { return x.slug !== slug; })[0];
      el.innerHTML = '<p class="small crumb"><a href="/work">Work</a> / ' + esc(p.client) + '</p><h1>' + esc(p.title) + '</h1><p class="lead">' + esc(p.summary) + '</p><p class="meta-line">' + esc(p.type) + ', ' + esc(p.year) + '</p>' +
        (p.blocks || []).map(function (b) { return blocks[b.type] ? blocks[b.type](b) : ''; }).join('') +
        (next ? '<a class="next" href="' + esc(caseHref(next)) + '"><span>Next project</span><b>' + esc(next.title) + '</b></a>' : '');
    });
  }
  return { cases: cases, reels: reels, caseStudy: caseStudy };
})();
