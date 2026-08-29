/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Cloudflare Worker (Revised)
   Separate endpoints per tour category.

   ENDPOINTS:
     GET    /api/domestik  ?province=Bali  ?city=Denpasar  ?all=1
     GET    /api/inter     ?country=Jepang ?city=Tokyo     ?all=1
     GET    /api/cruise                                    ?all=1
     GET    /api/umroh     ?type=Reguler|Plus|Premium       ?all=1
     GET    /api/offers                                    ?all=1
     GET    /api/reviews
     GET    /api/gallery   ?category=domestik|inter|cruise|umroh

     POST   /api/domestik | /api/inter | /api/cruise | /api/umroh
            /api/offers | /api/reviews | /api/gallery

     PUT    /api/domestik/:id | /api/inter/:id | /api/cruise/:id
            /api/umroh/:id | /api/offers/:id | /api/reviews/:id
            /api/gallery/:id
            → body: any subset of that table's editable columns

     DELETE /api/domestik/:id | /api/inter/:id | /api/cruise/:id
            /api/umroh/:id | /api/offers/:id | /api/reviews/:id
            /api/gallery/:id

     GET /api/meta/domestik  → distinct province+city list
     GET /api/meta/inter     → distinct country+city list
     GET /api/meta/umroh     → distinct package_type list
     GET /api/meta/cruise    → distinct route list

   NOTE on ?all=1:
     By default, GET on domestik/inter/cruise/umroh/offers only
     returns "alive" rows (not expired) — used by the public site.
     Pass ?all=1 to get every row regardless of expiry — used by
     the admin dashboard so expired items can still be seen/edited/deleted.

   DEPLOY:
     1. Workers & Pages → Create Worker → paste this file → Deploy
     2. Settings → Bindings → D1 Database → variable: DB → select bee-happy-holiday
     3. Copy the worker URL → paste into js/config.js as API_BASE
   ═══════════════════════════════════════════ */

const CORS = {
  'Content-Type':                'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type',
};

const ok      = (d)      => new Response(JSON.stringify(d),       { status: 200, headers: CORS });
const err     = (m, s=500)=> new Response(JSON.stringify({error: m}), { status: s,   headers: CORS });
const created = (d)      => new Response(JSON.stringify(d),       { status: 201, headers: CORS });

// ── Shared expiry filter clause ──
// Listings with no expires or expires >= today are shown.
const ALIVE = `(expires IS NULL OR expires = '' OR date(expires) >= date('now'))`;

// ── Resource → D1 table map (used by PUT/DELETE) ──
const TABLES = {
  domestik: 'listings_domestik',
  inter:    'listings_inter',
  cruise:   'listings_cruise',
  umroh:    'listings_umroh',
  offers:   'offers',
  reviews:  'reviews',
  gallery:  'gallery',
};

// ── Resource → editable columns (used by PUT) ──
const EDITABLE_COLUMNS = {
  domestik: ['province', 'city', 'name', 'duration', 'price', 'price2', 'description', 'image_url', 'badge', 'whatsapp_msg', 'expires'],
  inter:    ['country', 'city', 'name', 'duration', 'price', 'price2', 'description', 'image_url', 'badge', 'whatsapp_msg', 'expires'],
  cruise:   ['route', 'name', 'duration', 'price', 'price2', 'description', 'image_url', 'badge', 'whatsapp_msg', 'expires'],
  umroh:    ['package_type', 'name', 'duration', 'price', 'price2', 'description', 'image_url', 'badge', 'whatsapp_msg', 'expires'],
  offers:   ['name', 'description', 'image_url', 'badge', 'whatsapp_msg', 'expires'],
  reviews:  ['name', 'photo_url', 'rating', 'text'],
  gallery:  ['title', 'image_url', 'category'],
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) return err('Method not allowed', 405);

    const url  = new URL(request.url);
    const path = url.pathname.replace(/\/$/, ''); // strip trailing slash
    const p    = url.searchParams;

    try {

      // ════════════════════════════════════════
      //  PUT — /api/{resource}/{id}
      //  Updates any subset of the resource's editable columns
      // ════════════════════════════════════════
      if (request.method === 'PUT') {
        const m = path.match(/^\/api\/([a-z]+)\/(\d+)$/);
        if (!m) return err('Endpoint tidak ditemukan', 404);
        const [, resource, idStr] = m;
        const table = TABLES[resource];
        const allowed = EDITABLE_COLUMNS[resource];
        if (!table || !allowed) return err('Resource tidak dikenal', 404);
        const id = Number(idStr);

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') return err('Body JSON tidak valid', 400);

        const setCols = allowed.filter(c => body[c] !== undefined);
        if (!setCols.length) return err('Tidak ada field untuk diupdate', 400);

        const setClause = setCols.map(c => `${c} = ?`).join(', ');
        const values = setCols.map(c => (c === 'expires' && body[c] === '') ? null : body[c]);

        const res = await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).bind(...values, id).run();
        if (!res.meta || res.meta.changes === 0) return err('Data tidak ditemukan', 404);
        return ok({ updated: true, id });
      }

      // ════════════════════════════════════════
      //  DELETE — /api/{resource}/{id}
      // ════════════════════════════════════════
      if (request.method === 'DELETE') {
        const m = path.match(/^\/api\/([a-z]+)\/(\d+)$/);
        if (!m) return err('Endpoint tidak ditemukan', 404);
        const [, resource, idStr] = m;
        const table = TABLES[resource];
        if (!table) return err('Resource tidak dikenal', 404);
        const id = Number(idStr);
        const res = await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
        if (!res.meta || res.meta.changes === 0) return err('Data tidak ditemukan', 404);
        return ok({ deleted: true, id });
      }

      // ════════════════════════════════════════
      //  UPLOAD — /api/upload
      //  Accepts multipart/form-data with field "image"
      //  Stores in R2, returns public URL
      // ════════════════════════════════════════
      if (path === '/api/upload' && request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('image');
        if (!file) return err('No file provided', 400);

        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const key = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

        await env.BHH_IMAGES.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        const publicUrl = `https://pub-5effb5342cd94102a9ddd904b038efb4.r2.dev/${key}`;
        return created({ url: publicUrl });
      }

      // ════════════════════════════════════════
      //  LISTINGS — DOMESTIK
      //  ?province=Bali  ?city=Denpasar  ?all=1
      // ════════════════════════════════════════
      if (path === '/api/domestik') {
        if (request.method === 'POST') {
          const body = await request.json();
          const { province, city, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires } = body;
          if (!province || !city || !name) return err('Missing required fields: province, city, name', 400);
          const res = await env.DB.prepare(
            `INSERT INTO listings_domestik (province, city, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(province, city, name, duration || '', price || '', price2 || '', description || '', image_url || '', badge || '', whatsapp_msg || '', expires || null).run();
          return created({ id: res.meta.last_row_id, ...body });
        }
        let q = p.get('all') === '1' ? `SELECT * FROM listings_domestik WHERE 1=1` : `SELECT * FROM listings_domestik WHERE ${ALIVE}`;
        const args = [];
        if (p.get('province')) { q += ` AND province = ?`; args.push(p.get('province')); }
        if (p.get('city'))     { q += ` AND city = ?`;     args.push(p.get('city')); }
        q += ` ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  LISTINGS — INTER
      //  ?country=Jepang  ?city=Tokyo  ?all=1
      // ════════════════════════════════════════
      if (path === '/api/inter') {
        if (request.method === 'POST') {
          const body = await request.json();
          const { country, city, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires } = body;
          if (!country || !city || !name) return err('Missing required fields: country, city, name', 400);
          const res = await env.DB.prepare(
            `INSERT INTO listings_inter (country, city, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(country, city, name, duration || '', price || '', price2 || '', description || '', image_url || '', badge || '', whatsapp_msg || '', expires || null).run();
          return created({ id: res.meta.last_row_id, ...body });
        }
        let q = p.get('all') === '1' ? `SELECT * FROM listings_inter WHERE 1=1` : `SELECT * FROM listings_inter WHERE ${ALIVE}`;
        const args = [];
        if (p.get('country')) { q += ` AND country = ?`; args.push(p.get('country')); }
        if (p.get('city'))    { q += ` AND city = ?`;    args.push(p.get('city')); }
        q += ` ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  LISTINGS — CRUISE
      //  ?all=1
      // ════════════════════════════════════════
      if (path === '/api/cruise') {
        if (request.method === 'POST') {
          const body = await request.json();
          const { route, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires } = body;
          if (!route || !name) return err('Missing required fields: route, name', 400);
          const res = await env.DB.prepare(
            `INSERT INTO listings_cruise (route, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(route, name, duration || '', price || '', price2 || '', description || '', image_url || '', badge || '', whatsapp_msg || '', expires || null).run();
          return created({ id: res.meta.last_row_id, ...body });
        }
        const q = p.get('all') === '1' ? `SELECT * FROM listings_cruise ORDER BY created_at DESC` : `SELECT * FROM listings_cruise WHERE ${ALIVE} ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  LISTINGS — UMROH
      //  ?type=Reguler|Plus|Premium  ?all=1
      // ════════════════════════════════════════
      if (path === '/api/umroh') {
        if (request.method === 'POST') {
          const body = await request.json();
          const { package_type, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires } = body;
          if (!package_type || !name) return err('Missing required fields: package_type, name', 400);
          const res = await env.DB.prepare(
            `INSERT INTO listings_umroh (package_type, name, duration, price, price2, description, image_url, badge, whatsapp_msg, expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(package_type, name, duration || '', price || '', price2 || '', description || '', image_url || '', badge || '', whatsapp_msg || '', expires || null).run();
          return created({ id: res.meta.last_row_id, ...body });
        }
        let q = p.get('all') === '1' ? `SELECT * FROM listings_umroh WHERE 1=1` : `SELECT * FROM listings_umroh WHERE ${ALIVE}`;
        const args = [];
        if (p.get('type')) { q += ` AND package_type = ?`; args.push(p.get('type')); }
        q += ` ORDER BY package_type, created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  OFFERS
      //  ?all=1
      // ════════════════════════════════════════
      if (path === '/api/offers') {
        if (request.method === 'POST') {
          const body = await request.json();
          const { name, description, image_url, badge, whatsapp_msg, expires } = body;
          if (!name) return err('Missing required field: name', 400);
          const res = await env.DB.prepare(
            `INSERT INTO offers (name, description, image_url, badge, whatsapp_msg, expires) VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(name, description || '', image_url || '', badge || '', whatsapp_msg || '', expires || null).run();
          return created({ id: res.meta.last_row_id, ...body });
        }
        const q = p.get('all') === '1' ? `SELECT * FROM offers ORDER BY created_at DESC` : `SELECT * FROM offers WHERE ${ALIVE} ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  REVIEWS
      // ════════════════════════════════════════
      if (path === '/api/reviews') {
        if (request.method === 'POST') {
          const body = await request.json();
          const { name, photo_url, rating, text } = body;
          if (!name || rating === undefined) return err('Missing required fields: name, rating', 400);
          const res = await env.DB.prepare(
            `INSERT INTO reviews (name, photo_url, rating, text) VALUES (?, ?, ?, ?)`
          ).bind(name, photo_url || '', rating, text || '').run();
          return created({ id: res.meta.last_row_id, ...body });
        }
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
        if (request.method === 'POST') {
          const body = await request.json();
          const { title, image_url, category } = body;
          if (!title || !image_url || !category) return err('Missing required fields: title, image_url, category', 400);
          const res = await env.DB.prepare(
            `INSERT INTO gallery (title, image_url, category) VALUES (?, ?, ?)`
          ).bind(title, image_url, category).run();
          return created({ id: res.meta.last_row_id, ...body });
        }
        let q = `SELECT * FROM gallery`;
        const args = [];
        if (p.get('category')) { q += ` WHERE category = ?`; args.push(p.get('category')); }
        q += ` ORDER BY created_at DESC`;
        const { results } = await env.DB.prepare(q).bind(...args).all();
        return ok(results);
      }

      // ════════════════════════════════════════
      //  META — distinct filter values
      // ════════════════════════════════════════

      if (path === '/api/meta/domestik') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT province, city FROM listings_domestik WHERE ${ALIVE} ORDER BY province, city`)
          .all();
        return ok(results);
      }

      if (path === '/api/meta/inter') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT country, city FROM listings_inter WHERE ${ALIVE} ORDER BY country, city`)
          .all();
        return ok(results);
      }

      if (path === '/api/meta/umroh') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT package_type FROM listings_umroh WHERE ${ALIVE} ORDER BY package_type`)
          .all();
        return ok(results);
      }

      if (path === '/api/meta/cruise') {
        const { results } = await env.DB
          .prepare(`SELECT DISTINCT route FROM listings_cruise WHERE ${ALIVE} ORDER BY route`)
          .all();
        return ok(results);
      }

      // ── Health check ──
      if (path === '' || path === '/health') {
        return ok({ status: 'ok', service: 'Bee Happy Holiday API', version: '2.3' });
      }

      return err('Endpoint tidak ditemukan', 404);

    } catch (e) {
      console.error('Worker error:', e);
      return err(e.message || 'Internal server error', 500);
    }
  }
};