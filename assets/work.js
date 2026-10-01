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
  function caseStudy(el, slug) {
    projects().then(function (list) {
      var p = list.filter(function (x) { return x.slug === slug; })[0];
      if (!p) { el.innerHTML = '<h1>Not found</h1><a class="back" href="/work">All work</a>'; return; }
      document.title = p.title + ' | Leogo Designs';
      var steps = (p.steps || []).map(function (s) { return '<figure><img src="' + esc(s.image) + '" alt="' + esc(s.heading) + '" loading="lazy"><figcaption><b>' + esc(s.heading) + '</b><span>' + esc(s.text) + '</span></figcaption></figure>'; }).join('');
      el.innerHTML = '<p class="small"><a href="/work">Work</a> / ' + esc(p.client) + '</p><div class="case-top"><div><h1>' + esc(p.title) + '</h1><p class="lead">' + esc(p.summary) + '</p><p class="small" style="margin-top:14px">' + esc(p.type) + ', ' + esc(p.year) + '</p></div>' +
        (p.reel ? '<video src="' + esc(p.reel) + '" poster="' + esc(p.cover) + '" controls playsinline preload="metadata"></video>' : '<img src="' + esc(p.cover) + '" alt="">') + '</div>' +
        (steps ? '<div class="steps">' + steps + '</div>' : '') + '<a class="back" href="/work">All work</a>';
    });
  }
  return { cases: cases, reels: reels, caseStudy: caseStudy };
})();
