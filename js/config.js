/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Config
   ONE file to update for all settings.
   ═══════════════════════════════════════════ */

// ── Cloudflare Worker URL ──
// After deploying worker.js, replace this with your worker URL.
// e.g. 'https://bhh-api.yourname.workers.dev'
export const API_BASE = 'bhh-api.mnovarahman505.workers.dev';

// ── API endpoints (for reference) ──
// GET /api/domestik         → all domestik listings
// GET /api/domestik?province=Bali&city=Denpasar  → filtered
// GET /api/inter            → all inter listings
// GET /api/inter?country=Jepang&city=Tokyo       → filtered
// GET /api/cruise           → all cruise listings
// GET /api/umroh            → all umroh listings
// GET /api/umroh?type=Reguler                    → filtered
// GET /api/offers           → all active offers
// GET /api/reviews          → all reviews
// GET /api/gallery          → all gallery
// GET /api/gallery?category=domestik             → filtered
// GET /api/meta/domestik    → distinct province+city list
// GET /api/meta/inter       → distinct country+city list
// GET /api/meta/umroh       → distinct package_type list

// ── WhatsApp ──
export const WA_NUMBER  = '6281331978219';
export const WA_DEFAULT = 'Halo Bee Happy Holiday! Saya ingin tanya tentang paket wisata.';

// ── Company info ──
export const COMPANY = {
  name:    'Bee Happy Holiday',
  tagline: 'Trip everywhere, Spread Happiness',
  address: 'Jl. Peneleh VI No.5, Peneleh, Kec. Genteng, Surabaya, Jawa Timur 60274',
  phone:   '+62 813-3197-8219',
  email:   'beehappyholiday@gmail.com',
  hours:   'Senin – Sabtu · 08.00 – 20.00 WIB',
};

// ── Social media ──
export const SOCIALS = {
  instagram: { label: 'Instagram',   handle: '@beehappyholiday',          url: 'https://www.instagram.com/bee_happyholiday'  },
  tiktok:    { label: 'TikTok',      handle: '@beehappyholiday',          url: 'https://www.tiktok.com/@bee_happyholiday'   },
  facebook:  { label: 'Facebook',    handle: 'Bee Happy Holiday',         url: 'https://web.facebook.com/beehappy.holiday'  },
  x:         { label: 'X (Twitter)', handle: '@beehappyholiday',          url: 'https://x.com/beehappyholiday'         },
  youtube:   { label: 'YouTube',     handle: '@beehappyholiday',          url: 'https://youtube.com/@beehappyholiday'  },
  email:     { label: 'Email',       handle: 'beehappyholiday@gmail.com', url: 'mailto:beehappyholiday@gmail.com'       },
};

// ── Image helper: Google Drive share URL → working thumbnail ──
export function driveThumb(url, size = 'w800') {
  if (!url) return '';
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=${size}`;
  return url;
}

// ── WhatsApp link builder ──
export function waLink(msg = WA_DEFAULT) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ── Expiry helpers ──
export function isExpired(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  d.setHours(23, 59, 59);
  return d < new Date();
}

export function expiryLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const days = Math.ceil((d - new Date()) / 86400000);
  if (days <= 0) return '';
  if (days === 1) return '⏰ Berakhir besok';
  if (days <= 7)  return `⏰ Berakhir ${days} hari lagi`;
  return `Berlaku s/d ${d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}`;
}
