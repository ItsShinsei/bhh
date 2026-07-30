/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Cloudflare Worker (Revised)
   Separate endpoints per tour category.

   ENDPOINTS:
     GET /api/domestik  ?province=Bali  ?city=Denpasar
     GET /api/inter     ?country=Jepang ?city=Tokyo
     GET /api/cruise
     GET /api/umroh     ?type=Reguler|Plus|Premium
     GET /api/offers
     GET /api/reviews
     GET /api/gallery   ?category=domestik|inter|cruise|umroh

     GET /api/meta/domestik  → distinct province+city list
     GET /api/meta/inter     → distinct country+city list
     GET /api/meta/umroh     → distinct package_type list
     GET /api/meta/cruise    → distinct route list

   DEPLOY:
     1. Workers & Pages → Create Worker → paste this file → Deploy
     2. Settings → Bindings → D1 Database → variable: DB → select bee-happy-holiday
     3. Copy the worker URL → paste into js/config.js as API_BASE
   ═══════════════════════════════════════════ */

const CORS = {
  'Content-Type':                'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods':'GET, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type',
};

const ok  = (d)      => new Response(JSON.stringify(d),          { status: 200, headers: CORS });
const err = (m, s=500)=> new Response(JSON.stringify({error: m}), { status: s,   headers: CORS });

// ── Shared expiry filter clause ──
// Listings with no expires or expires >= today are shown.
const ALIVE = `(expires IS NULL OR expires = '' OR date(expires) >= date('now'))`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'GET')    return err('Method not allowed', 405);

    const url    = new URL(request.url);
    const path   = url.pathname.replace(/\/$/, ''); // strip trailing slash
    const p      = url.searchParams;

    try {

      // ════════════════════════════════════════
      //  LISTINGS — DOMESTIK
      //  ?province=Bali  ?city=Denpasar
      // ════════════════════════════════════════
      if (path === '/api/domestik') {
        let q = `SELECT * FROM listings_domestik WHERE ${ALIVE}`;
        const args = [];
        if (p.get('province')) { q += ` AND province = ?`; args.push(p.get('province')); }
        if (p.get('city'))     { q += ` AND city = ?`;     args.push(p.get('city')); }
        q += ` ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  LISTINGS — INTER
      //  ?country=Jepang  ?city=Tokyo
      // ════════════════════════════════════════
      if (path === '/api/inter') {
        let q = `SELECT * FROM listings_inter WHERE ${ALIVE}`;
        const args = [];
        if (p.get('country')) { q += ` AND country = ?`; args.push(p.get('country')); }
        if (p.get('city'))    { q += ` AND city = ?`;    args.push(p.get('city')); }
        q += ` ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  LISTINGS — CRUISE
      //  (no sub-filter, just show all)
      // ════════════════════════════════════════
      if (path === '/api/cruise') {
        const { results } = await env.DB
          .prepare(`SELECT * FROM listings_cruise WHERE ${ALIVE} ORDER BY created_at DESC`)
          .all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  LISTINGS — UMROH
      //  ?type=Reguler|Plus|Premium
      // ════════════════════════════════════════
      if (path === '/api/umroh') {
        let q = `SELECT * FROM listings_umroh WHERE ${ALIVE}`;
        const args = [];
        if (p.get('type')) { q += ` AND package_type = ?`; args.push(p.get('type')); }
        q += ` ORDER BY package_type, created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  OFFERS
      // ════════════════════════════════════════
      if (path === '/api/offers') {
        const { results } = await env.DB
          .prepare(`SELECT * FROM offers WHERE ${ALIVE} ORDER BY created_at DESC`)
          .all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  REVIEWS
      // ════════════════════════════════════════
      if (path === '/api/reviews') {
        const { results } = await env.DB
          .prepare(`SELECT * FROM reviews ORDER BY created_at DESC`)
          .all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  GALLERY
      //  ?category=domestik|inter|cruise|umroh
      // ════════════════════════════════════════
      if (path === '/api/gallery') {
        let q = `SELECT * FROM gallery`;
        const args = [];
        if (p.get('category')) { q += ` WHERE category = ?`; args.push(p.get('category')); }
        q += ` ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  META — distinct filter values
      //  Used by frontend to build filter dropdowns dynamically
      // ════════════════════════════════════════

      // Distinct province + city combos for Domestik filter
      if (path === '/api/meta/domestik') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT province, city FROM listings_domestik WHERE ${ALIVE} ORDER BY province, city`)
          .all();
        return ok(results);
      }

      // Distinct country + city combos for Inter filter
      if (path === '/api/meta/inter') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT country, city FROM listings_inter WHERE ${ALIVE} ORDER BY country, city`)
          .all();
        return ok(results);
      }

      // Distinct package_type for Umroh filter
      if (path === '/api/meta/umroh') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT package_type FROM listings_umroh WHERE ${ALIVE} ORDER BY package_type`)
          .all();
        return ok(results);
      }

      // Distinct routes for Cruise (informational)
      if (path === '/api/meta/cruise') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT route FROM listings_cruise WHERE ${ALIVE} ORDER BY route`)
          .all();
        return ok(results);
      }

      // ── Health check ──
      if (path === '' || path === '/health') {
        return ok({ status: 'ok', service: 'Bee Happy Holiday API', version: '2.1' });
      }

      return err('Endpoint tidak ditemukan', 404);

    } catch (e) {
      console.error('Worker error:', e);
      return err(e.message || 'Internal server error', 500);
    }
  }
};
