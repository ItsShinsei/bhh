/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Main JS
   Handles: nav, footer, scroll reveal,
   floating WA button, mobile menu
   ═══════════════════════════════════════════ */
import { COMPANY, SOCIALS, WA_NUMBER, WA_DEFAULT, waLink } from './config.js';
import { icon } from './icons.js';

// ── Resolve root path (domain-root hosting only) ──
function rootPath(p) {
  // Absolute root path — assumes the site is served at the domain root
  // (e.g. https://example.com/). Will 404 on GitHub Pages project pages
  // (user.github.io/repo/), subpath deploys, and file://.
  return '/' + p;
}

// ══════════════════════════════════════════
//  NAV INJECTION
// ══════════════════════════════════════════
function injectNav() {
  const R = rootPath('');
  const currentPath = window.location.pathname;

  function isActive(href) {
    if (href === 'index.html' || href === '') return currentPath === '/' || currentPath === '/index.html';
    return currentPath.includes(href.replace('.html',''));
  }

  const html = `
  <nav class="nav" id="mainNav">
    <a class="nav-logo" href="${R}index.html">
      <img src="${R}assets/images/BHH.svg" alt="Bee Happy Holiday" />
      <div class="nav-logo-text">
        Bee Happy Holiday
        <small>Trip everywhere, Spread Happiness</small>
      </div>
    </a>

    <ul class="nav-links">
      <li>
        <a class="nav-link ${isActive('index.html') ? 'active' : ''}" href="/">Beranda</a>
      </li>
      <li>
          <span class="nav-link has-dropdown" tabindex="0" data-nav="tours/index.html">
          Paket Wisata <span class="nav-chevron">▾</span>
          <div class="nav-dropdown">
            <a href="${R}tours/index.html"><span class="nav-dropdown-icon">${icon('globe', 18)}</span> Semua Paket</a>
            <a href="${R}tours/domestik.html"><span class="nav-dropdown-icon">${icon('flag', 18)}</span> Wisata Domestik</a>
            <a href="${R}tours/inter.html"><span class="nav-dropdown-icon">${icon('plane', 18)}</span> Mancanegara</a>
            <a href="${R}tours/cruise.html"><span class="nav-dropdown-icon">${icon('ship', 18)}</span> Cruise</a>
            <a href="${R}tours/umroh.html"><span class="nav-dropdown-icon">${icon('mosque', 18)}</span> Umroh & Haji</a>
          </div>
        </span>
      </li>
      <li>
        <a class="nav-link ${isActive('dokumen') ? 'active' : ''}" href="${R}dokumen/dokumen.html">Dokumen</a>
      </li>
      <li>
        <a class="nav-link ${isActive('galeri') ? 'active' : ''}" href="${R}galeri.html">Galeri</a>
      </li>
      <li>
        <a class="nav-link ${isActive('about') ? 'active' : ''}" href="${R}about.html">Tentang Kami</a>
      </li>
      <li>
        <a class="nav-link ${isActive('contact') ? 'active' : ''}" href="${R}contact.html">Kontak</a>
      </li>
    </ul>

    <a class="btn btn-primary btn-sm nav-cta" href="${waLink()}" target="_blank" rel="noopener">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Hubungi Kami
    </a>

    <button class="nav-hamburger" id="hamburger" aria-label="Buka menu">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="mobile-nav" id="mobileNav">
    <a class="mobile-nav-link" href="/"><span class="mobile-nav-icon">${icon('home', 18)}</span> Beranda</a>
    <div>
      <a class="mobile-nav-link" href="${R}tours/index.html"><span class="mobile-nav-icon">${icon('globe', 18)}</span> Paket Wisata</a>
      <div class="mobile-nav-sub">
        <a href="${R}tours/domestik.html"><span class="mobile-nav-icon">${icon('flag', 15)}</span> Wisata Domestik</a>
        <a href="${R}tours/inter.html"><span class="mobile-nav-icon">${icon('plane', 15)}</span> Mancanegara</a>
        <a href="${R}tours/cruise.html"><span class="mobile-nav-icon">${icon('ship', 15)}</span> Cruise</a>
        <a href="${R}tours/umroh.html"><span class="mobile-nav-icon">${icon('mosque', 15)}</span> Umroh & Haji</a>
      </div>
    </div>
    <a class="mobile-nav-link" href="${R}dokumen/dokumen.html"><span class="mobile-nav-icon">${icon('fileText', 18)}</span> Dokumen</a>
    <a class="mobile-nav-link" href="${R}galeri.html"><span class="mobile-nav-icon">${icon('image', 18)}</span> Galeri</a>
    <a class="mobile-nav-link" href="${R}about.html"><span class="mobile-nav-icon">${icon('info', 18)}</span> Tentang Kami</a>
    <a class="mobile-nav-link" href="${R}contact.html"><span class="mobile-nav-icon">${icon('mail', 18)}</span> Kontak</a>
    <div class="mobile-nav-cta">
      <a class="btn btn-wa btn--block" href="${waLink()}" target="_blank" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Chat WhatsApp
      </a>
    </div>
  </div>`;

  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) placeholder.outerHTML = html;


  // Mobile toggle
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('mobileNav')?.classList.toggle('open');
  });

  // Close on link click
  document.querySelectorAll('.mobile-nav-link, .mobile-nav-sub a, .mobile-nav-cta a')
    .forEach(el => el.addEventListener('click', () => {
      document.getElementById('mobileNav')?.classList.remove('open');
    }));
}

// ══════════════════════════════════════════
//  FOOTER INJECTION
// ══════════════════════════════════════════
function injectFooter() {
  const R = rootPath('');

  const socialIcons = {
    instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    tiktok:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.14 8.14 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>`,
    facebook:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    x:         `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.527-8.607L1.704 2.25h6.391l4.266 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    youtube:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    email:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  };

  const html = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand-logo">
            <img src="${R}assets/images/BHH.svg" alt="Bee Happy Holiday" />
            <div class="footer-brand-name">
              Bee Happy Holiday
              <small>Trip everywhere, Spread Happiness</small>
            </div>
          </div>
          <p class="footer-tagline">Agen perjalanan wisata terpercaya di Surabaya. Kami hadir untuk membuat setiap perjalanan Anda menjadi kenangan indah yang tak terlupakan.</p>
          <div class="footer-socials">
            ${Object.entries(SOCIALS).map(([k, s]) => `
              <a class="footer-social-btn" href="${s.url}" target="_blank" rel="noopener" title="${s.label}">
                ${socialIcons[k] || `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`}
              </a>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="footer-col-title">Paket Wisata</div>
          <div class="footer-links">
            <a href="${R}tours/domestik.html"><span class="footer-link-icon">${icon('flag', 16)}</span> Wisata Domestik</a>
            <a href="${R}tours/inter.html"><span class="footer-link-icon">${icon('plane', 16)}</span> Mancanegara</a>
            <a href="${R}tours/cruise.html"><span class="footer-link-icon">${icon('ship', 16)}</span> Cruise</a>
            <a href="${R}tours/umroh.html"><span class="footer-link-icon">${icon('mosque', 16)}</span> Umroh & Haji</a>
          </div>
        </div>

        <div>
          <div class="footer-col-title">Layanan</div>
          <div class="footer-links">
            <a href="${R}dokumen/visa.html"><span class="footer-link-icon">${icon('fileText', 16)}</span> Pengurusan Visa</a>
            <a href="${R}dokumen/paspor.html"><span class="footer-link-icon">${icon('idCard', 16)}</span> Pengurusan Paspor</a>
            <a href="${R}galeri.html"><span class="footer-link-icon">${icon('image', 16)}</span> Galeri</a>
            <a href="${R}about.html"><span class="footer-link-icon">${icon('info', 16)}</span> Tentang Kami</a>
            <a href="${R}contact.html"><span class="footer-link-icon">${icon('mail', 16)}</span> Kontak</a>
          </div>
        </div>

        <div>
          <div class="footer-col-title">Hubungi Kami</div>
          <div class="footer-contact-row"><span class="footer-contact-icon">${icon('mapPin', 16)}</span><span>${COMPANY.address}</span></div>
          <div class="footer-contact-row"><span class="footer-contact-icon">${icon('phone', 16)}</span><span>${COMPANY.phone}</span></div>
          <div class="footer-contact-row"><span class="footer-contact-icon">${icon('mail', 16)}</span><span>${COMPANY.email}</span></div>
          <div class="footer-contact-row"><span class="footer-contact-icon">${icon('clock', 16)}</span><span>${COMPANY.hours}</span></div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">© ${new Date().getFullYear()} Bee Happy Holiday. Hak cipta dilindungi undang-undang.</p>
        <p class="footer-copy">CV./PT. Berkah Persada Pratama · Surabaya, Jawa Timur</p>
      </div>
    </div>
  </footer>

  <!-- Floating WA button -->
  <a class="wa-float" href="${waLink()}" target="_blank" rel="noopener" title="Chat WhatsApp">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>`;

  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) placeholder.outerHTML = html;
}

// ══════════════════════════════════════════
//  SCROLL REVEAL
// ══════════════════════════════════════════
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectFooter();
  initReveal();
});
