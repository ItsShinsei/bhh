/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Listings JS (Revised)
   Fetch + render functions for all 4 tour
   tables, offers, and reviews.
   ═══════════════════════════════════════════ */
import { API_BASE, driveThumb, waLink, expiryLabel } from './config.js';

const WA_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

// ══════════════════════════════════════════
//  FETCH FUNCTIONS
// ══════════════════════════════════════════

async function get(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`Fetch failed: ${endpoint}`);
  return res.json();
}

export const fetchDomestik = (province, city) => {
  let q = '/api/domestik';
  const params = new URLSearchParams();
  if (province) params.set('province', province);
  if (city)     params.set('city', city);
  const qs = params.toString();
  return get(qs ? `${q}?${qs}` : q);
};

export const fetchInter = (country, city) => {
  const params = new URLSearchParams();
  if (country) params.set('country', country);
  if (city)    params.set('city', city);
  const qs = params.toString();
  return get(qs ? `/api/inter?${qs}` : '/api/inter');
};

export const fetchCruise  = ()     => get('/api/cruise');
export const fetchUmroh   = (type) => get(type ? `/api/umroh?type=${encodeURIComponent(type)}` : '/api/umroh');
export const fetchOffers  = ()     => get('/api/offers');
export const fetchReviews = ()     => get('/api/reviews');
export const fetchGallery = (cat)  => get(cat ? `/api/gallery?category=${cat}` : '/api/gallery');

// Meta (distinct filter values)
export const fetchMetaDomestik = () => get('/api/meta/domestik');
export const fetchMetaInter    = () => get('/api/meta/inter');
export const fetchMetaUmroh    = () => get('/api/meta/umroh');

// Convenience: fetch all 4 categories for homepage featured section
export async function fetchFeatured(limit = 6) {
  const [dom, inter, cruise, umroh] = await Promise.all([
    fetchDomestik(), fetchInter(), fetchCruise(), fetchUmroh()
  ]);
  // Tag each with its source table so the card can show the right subtitle
  const tag = (arr, cat) => arr.map(i => ({ ...i, _cat: cat }));
  return [
    ...tag(dom,    'domestik'),
    ...tag(inter,  'inter'),
    ...tag(cruise, 'cruise'),
    ...tag(umroh,  'umroh'),
  ].slice(0, limit);
}

// ══════════════════════════════════════════
//  SUBTITLE helpers per table
// ══════════════════════════════════════════
function subtitle(item) {
  if (item._cat === 'domestik' || (item.province))
    return [item.province, item.city].filter(Boolean).join(' · ');
  if (item._cat === 'inter' || item.country)
    return [item.country, item.city].filter(Boolean).join(' · ');
  if (item._cat === 'cruise' || item.route)
    return item.route || '';
  if (item._cat === 'umroh' || item.package_type)
    return item.package_type ? `Paket ${item.package_type}` : '';
  return '';
}

// ══════════════════════════════════════════
//  RENDER — PACKAGE CARD
//  Works for all 4 table types
// ══════════════════════════════════════════
export function renderCard(item, delay = 0) {
  const imgUrl  = driveThumb(item.image_url);
  const sub     = subtitle(item);
  const price   = item.price2
    ? `${item.price} <span style="opacity:.55;font-size:.8em">– ${item.price2}</span>`
    : (item.price || 'Hubungi Kami');
  const msg     = item.whatsapp_msg || `Halo! Saya tertarik dengan ${item.name}. Bisa info lebih lanjut?`;
  const daysLeft = item.expires
    ? Math.ceil((new Date(item.expires) - new Date()) / 86400000)
    : null;

  return `
    <div class="card reveal" style="animation-delay:${delay}ms">
      <div class="card-img">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${item.name}" loading="lazy"
               onerror="this.parentElement.innerHTML='<div class=card-img-placeholder>🌍</div>'" />`
          : `<div class="card-img-placeholder">🌍</div>`}
        ${item.badge  ? `<span class="card-badge">${item.badge}</span>` : ''}
        ${daysLeft !== null && daysLeft > 0 && daysLeft <= 7
          ? `<span class="card-expiry">⏰ ${daysLeft}h lagi</span>` : ''}
        ${item.duration ? `<span class="card-category">${item.duration}</span>` : ''}
      </div>
      <div class="card-body">
        ${sub  ? `<div class="card-dest">${sub}</div>` : ''}
        <div class="card-name">${item.name}</div>
        ${item.description ? `<p class="card-desc">${item.description}</p>` : ''}
        <div class="card-footer">
          <div>
            <div class="card-price-label">Mulai dari</div>
            <div class="card-price">${price}</div>
            <div class="card-price-per">/ orang</div>
          </div>
          <a class="btn btn-primary btn-sm" href="${waLink(msg)}" target="_blank" rel="noopener">
            ${WA_SVG} Pesan
          </a>
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
//  RENDER — OFFER CARD
// ══════════════════════════════════════════
export function renderOfferCard(o, delay = 0) {
  const imgUrl = driveThumb(o.image_url);
  const msg    = o.whatsapp_msg || `Halo! Saya tertarik dengan penawaran ${o.name}. Bisa info lebih lanjut?`;
  return `
    <div class="offer-card reveal" style="animation-delay:${delay}ms">
      ${imgUrl
        ? `<div class="offer-img"><img src="${imgUrl}" alt="${o.name}" loading="lazy"
             onerror="this.parentElement.style.display='none'" /></div>` : ''}
      <div class="offer-body">
        <div class="offer-header">
          <div class="offer-name">${o.name}</div>
          ${o.badge ? `<span class="offer-pill">${o.badge}</span>` : ''}
        </div>
        ${o.description ? `<p class="offer-desc">${o.description}</p>` : ''}
        <div class="offer-footer">
          <span class="offer-expiry">${expiryLabel(o.expires)}</span>
          <a class="btn btn-primary btn-sm" href="${waLink(msg)}" target="_blank" rel="noopener">
            ${WA_SVG} Klaim
          </a>
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
//  RENDER — REVIEW CARD
// ══════════════════════════════════════════
export function renderReviewCard(r, delay = 0) {
  const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
  return `
    <div class="review-card reveal" style="animation-delay:${delay}ms">
      <div class="review-stars">${stars}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <div class="review-avatar">
          ${r.photo_url
            ? `<img src="${r.photo_url}" alt="${r.name}" />`
            : r.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div class="review-name">${r.name}</div>
          ${r.date ? `<div class="review-date">${r.date}</div>` : ''}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
//  STATE HELPERS
// ══════════════════════════════════════════
export function showLoading(el) {
  el.innerHTML = `<div class="state-box"><div class="spinner"></div><p class="state-desc">Memuat data...</p></div>`;
}
export function showEmpty(el, msg = 'Belum ada data tersedia.') {
  el.innerHTML = `<div class="state-box"><div class="state-icon">🐝</div><p class="state-title">Belum Ada Data</p><p class="state-desc">${msg}</p></div>`;
}
export function showError(el) {
  el.innerHTML = `<div class="state-box"><div class="state-icon">⚠️</div><p class="state-title">Gagal Memuat</p><p class="state-desc">Coba refresh halaman. Jika masih bermasalah, hubungi kami via WhatsApp.</p></div>`;
}

// ── Re-observe newly injected .reveal elements ──
export function reObserve() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

// ══════════════════════════════════════════
//  DEMO DATA (shown when API_BASE not set)
// ══════════════════════════════════════════
export const DEMO = {
  domestik: [
    { province:'Bali',       city:'Denpasar',  name:'Bali Romantis',         duration:'5D4N', price:'Rp 5.500.000', description:'Pura Tanah Lot, sawah Tegalalang, dan sunset di Kuta.',               image_url:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop', badge:'Terlaris',  whatsapp_msg:'Halo! Saya tertarik dengan paket Bali Romantis. Bisa info lebih lanjut?' },
    { province:'NTB',        city:'Lombok',    name:'Lombok & Gili Islands',  duration:'4D3N', price:'Rp 3.900.000', description:'Air jernih, snorkeling di Gili Trawangan, dan Pantai Senggigi.',       image_url:'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600&auto=format&fit=crop', badge:'💰 Budget', whatsapp_msg:'Halo! Saya tertarik dengan paket Lombok & Gili. Bisa info lebih lanjut?' },
    { province:'Papua Barat',city:'Raja Ampat',name:'Raja Ampat Diving',      duration:'5D4N', price:'Rp 9.500.000', description:'Surga bawah laut terbaik dunia. Diving dan snorkeling paling kaya.',   image_url:'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop', badge:'🤿 Diving', whatsapp_msg:'Halo! Saya tertarik dengan paket Raja Ampat. Bisa info lebih lanjut?' },
  ],
  inter: [
    { country:'Jepang',        city:'Tokyo',      name:'Jepang Sakura Tour',  duration:'7D6N',  price:'Rp 18.000.000', description:'Musim bunga sakura di Tokyo, Kyoto, dan Osaka.',                    image_url:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&auto=format&fit=crop', badge:'🌸 Musiman', whatsapp_msg:'Halo! Saya tertarik dengan paket Jepang Sakura. Bisa info lebih lanjut?' },
    { country:'Korea Selatan', city:'Seoul',      name:'Korea Autumn Tour',   duration:'6D5N',  price:'Rp 14.000.000', description:'Seoul, Jeju, dan Nami Island berbalut daun musim gugur.',            image_url:'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&auto=format&fit=crop', badge:'🔥 Hot',     whatsapp_msg:'Halo! Saya tertarik dengan paket Korea Autumn. Bisa info lebih lanjut?' },
    { country:'Singapura',     city:'Singapura', name:'Singapura Weekend',    duration:'3D2N',  price:'Rp 7.800.000',  description:'Gardens by the Bay, Marina Bay Sands, dan Universal Studios.',       image_url:'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop', badge:'',           whatsapp_msg:'Halo! Saya tertarik dengan paket Singapura Weekend. Bisa info lebih lanjut?' },
  ],
  cruise: [
    { route:'Singapura → Malaysia → Thailand', name:'Cruise Asia Selatan',  duration:'5 Hari 4 Malam',   price:'Rp 12.000.000', description:'Berlayar dari Singapura ke Penang dan Phuket. Nikmati 3 negara.',       image_url:'https://images.unsplash.com/photo-1548194099-bed76927b52e?w=600&auto=format&fit=crop', badge:'🔥 Populer', whatsapp_msg:'Halo! Saya tertarik dengan Cruise Asia Selatan. Bisa info lebih lanjut?' },
    { route:'Barcelona → Italia → Yunani',     name:'Cruise Mediterania',   duration:'12 Hari 11 Malam', price:'Rp 48.000.000', description:'Pelayaran ikonik — Barcelona, Roma, Santorini, dan Athena.',            image_url:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop', badge:'🌟 Mewah',   whatsapp_msg:'Halo! Saya tertarik dengan Cruise Mediterania. Bisa info lebih lanjut?' },
  ],
  umroh: [
    { package_type:'Reguler', name:'Umroh Reguler Hemat',    duration:'9 Hari',  price:'Rp 25.000.000', description:'Hotel bintang 3 di Mekkah dan Madinah. Termasuk pembimbing bersertifikat.',    image_url:'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&auto=format&fit=crop', badge:'Terjangkau', whatsapp_msg:'Halo! Saya tertarik dengan Umroh Reguler. Bisa info lebih lanjut?' },
    { package_type:'Plus',    name:'Umroh Plus Turki',        duration:'14 Hari', price:'Rp 42.000.000', description:'Ibadah umroh + city tour Istanbul, Cappadocia, dan Konya.',                    image_url:'', badge:'✨ Plus Tour', whatsapp_msg:'Halo! Saya tertarik dengan Umroh Plus Turki. Bisa info lebih lanjut?' },
    { package_type:'Premium', name:'Umroh Premium Bintang 5', duration:'10 Hari', price:'Rp 65.000.000', description:'Hotel bintang 5 persis di depan Masjidil Haram dan Masjid Nabawi.',            image_url:'', badge:'⭐ Premium',   whatsapp_msg:'Halo! Saya tertarik dengan Umroh Premium. Bisa info lebih lanjut?' },
  ],
  offers: [
    { name:'Paket Bulan Madu',    description:'Upgrade vila + makan malam romantis untuk pasangan yang booking 5D4N atau lebih.', image_url:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop', badge:'🔥 Spesial', whatsapp_msg:'Halo! Saya tertarik dengan Paket Bulan Madu. Bisa info?' },
    { name:'Anak Gratis Pergi',   description:'Anak bawah 5 tahun gratis. Anak 6–12 tahun diskon 30% untuk paket domestik.', image_url:'', badge:'Keluarga', whatsapp_msg:'Halo! Saya ingin tanya promo Anak Gratis. Bisa info?' },
    { name:'Tour Group & Corporate', description:'Outing kantor 10+ orang dengan harga spesial dan itinerari custom.', image_url:'', badge:'Group', whatsapp_msg:'Halo! Saya ingin tanya paket Group/Corporate. Bisa info?' },
  ],
  reviews: [
    { name:'Siti Rahayu',  rating:5, text:'Pelayanannya luar biasa! Perjalanan ke Jepang kami diurus sangat profesional. Pasti pakai BHH lagi!', date:'Maret 2025' },
    { name:'Budi Santoso', rating:5, text:'Paket umrohnya sangat memuaskan. Hotel dekat Masjidil Haram dan pembimbing berpengalaman. Terima kasih!', date:'Februari 2025' },
    { name:'Dewi Lestari', rating:5, text:'Honeymoon ke Bali jadi sempurna berkat BHH. Rekomendasi tepat dan harga kompetitif!', date:'April 2025' },
  ],
};
