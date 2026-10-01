const express = require('express');
const path = require('path');
const fallback = require('./work/fallback.json');

const app = express();

// Work feed: every reel from @leogodesigns and Vaani's Instagram, newest first.
// Needs LEOGO_IG_TOKEN and VAANI_IG_TOKEN (Instagram Login long-lived tokens).
const CACHE_MS = 30 * 60 * 1000;
const accounts = [
  { from: 'Leogo Designs', token: process.env.LEOGO_IG_TOKEN || '' },
  { from: 'Vaani', token: process.env.VAANI_IG_TOKEN || '' },
].filter(a => a.token);
let cache = { at: 0, items: null };

function toItem(m, from) {
  const caption = (m.caption || '').replace(/#\w+/g, '').trim();
  const [title, ...rest] = caption.split('\n').map(s => s.trim()).filter(Boolean);
  return {
    title: title || from + ' reel',
    text: rest.join(' ').slice(0, 160),
    image: m.thumbnail_url || m.media_url,
    type: 'Reel',
    from,
    link: m.permalink,
    date: m.timestamp,
  };
}

async function fetchAccount(a) {
  const url = 'https://graph.instagram.com/me/media?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp&limit=100&access_token=' + encodeURIComponent(a.token);
  const r = await fetch(url);
  if (!r.ok) throw new Error(a.from + ' instagram ' + r.status);
  const { data = [] } = await r.json();
  return data.filter(m => m.media_type === 'VIDEO' || m.media_product_type === 'REELS').map(m => toItem(m, a.from));
}

async function fetchWork() {
  if (!accounts.length) return null;
  const lists = await Promise.allSettled(accounts.map(fetchAccount));
  lists.filter(l => l.status === 'rejected').forEach(l => console.error('work feed', l.reason.message));
  const items = lists.flatMap(l => (l.status === 'fulfilled' ? l.value : []));
  return items.sort((x, y) => (y.date || '').localeCompare(x.date || ''));
}

// Long-lived Instagram tokens last 60 days; refresh daily while the server runs.
// ponytail: refreshed tokens live in memory only, so after a redeploy more than
// 60 days past the env tokens' issue date the feed falls back. Store them (e.g. Vaani's
// token table, which already auto-refreshes) if that ever bites.
async function refreshTokens() {
  for (const a of accounts) {
    try {
      const r = await fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + encodeURIComponent(a.token));
      if (r.ok) a.token = (await r.json()).access_token || a.token;
    } catch (e) { console.error(a.from + ' token refresh failed', e.message); }
  }
}
refreshTokens();
setInterval(refreshTokens, 24 * 60 * 60 * 1000);

app.get('/api/work', async (req, res) => {
  if (!cache.items || Date.now() - cache.at > CACHE_MS) {
    try {
      const items = await fetchWork();
      if (items && items.length) cache = { at: Date.now(), items };
    } catch (e) { console.error('work feed failed', e.message); }
  }
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ source: cache.items ? 'instagram' : 'fallback', items: cache.items || fallback });
});

app.use(express.static(path.join(__dirname)));
app.get('/work', (req, res) => res.sendFile(path.join(__dirname, 'work', 'index.html')));
app.get('/work/:slug', (req, res) => res.sendFile(path.join(__dirname, 'work', 'case.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(process.env.PORT || 3000);
