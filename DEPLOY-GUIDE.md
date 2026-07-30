# 🐝 Bee Happy Holiday v2 — Deploy Guide (Revised Schema)

---

## Struktur Database (5 Tabel Listing Terpisah)

```
listings_domestik  → province, city
listings_inter     → country, city
listings_cruise    → route
listings_umroh     → package_type (Reguler / Plus / Premium)
offers             → promo & penawaran
reviews            → ulasan pelanggan
gallery            → foto galeri
```

---

## Langkah 1 — Buat Database D1

1. **dash.cloudflare.com** → D1 → **Create database** → nama: `bee-happy-holiday`
2. Buka database → tab **Console**
3. Buka file `schema.sql` → copy semua → paste → klik **Execute**
4. Selesai — tabel + sample data sudah masuk

---

## Langkah 2 — Deploy Worker

1. **Workers & Pages** → **Create Worker** → nama: `bhh-api`
2. **Edit Code** → hapus semua → paste isi `worker.js` → **Deploy**
3. **Settings → Bindings → Add → D1 Database**
   - Variable name: `DB`
   - D1 database: `bee-happy-holiday`
4. **Save**
5. Catat URL worker: `https://bhh-api.namaakun.workers.dev`

Test worker (buka di browser):
- `https://bhh-api.namaakun.workers.dev/api/domestik`
- `https://bhh-api.namaakun.workers.dev/api/inter`
- `https://bhh-api.namaakun.workers.dev/api/umroh`

---

## Langkah 3 — Update config.js

```js
export const API_BASE = 'https://bhh-api.namaakun.workers.dev';
export const WA_NUMBER = '6281331978219';
```

---

## Langkah 4 — Taruh Logo

Salin `beehappylogo.jpeg` ke `assets/images/logo.jpeg`

---

## Langkah 5 — Deploy ke Cloudflare Pages

1. **Workers & Pages → Create → Pages → Direct Upload**
2. Nama: `bee-happy-holiday`
3. Upload folder project (zip semua file kecuali `worker.js` & `schema.sql`)
4. Deploy → live di `bee-happy-holiday.pages.dev`

---

## API Endpoints Lengkap

```
GET /api/domestik                         → semua paket domestik
GET /api/domestik?province=Bali           → filter by provinsi
GET /api/domestik?province=Bali&city=Ubud → filter by provinsi + kota

GET /api/inter                            → semua paket mancanegara
GET /api/inter?country=Jepang             → filter by negara
GET /api/inter?country=Jepang&city=Tokyo  → filter by negara + kota

GET /api/cruise                           → semua cruise
GET /api/umroh                            → semua umroh
GET /api/umroh?type=Reguler               → filter Reguler / Plus / Premium
GET /api/offers                           → semua penawaran aktif
GET /api/reviews                          → semua ulasan
GET /api/gallery                          → semua galeri
GET /api/gallery?category=domestik        → filter galeri

GET /api/meta/domestik  → daftar province+city (untuk filter tabs)
GET /api/meta/inter     → daftar country+city
GET /api/meta/umroh     → daftar package_type
```

---

## Cara Tambah Paket Baru (Daily)

### Tambah Paket Domestik
```sql
INSERT INTO listings_domestik (province, city, name, duration, price, description, image_url, badge, whatsapp_msg)
VALUES (
  'Jawa Tengah',
  'Yogyakarta',
  'Jogja & Borobudur — 3D2N',
  '3D2N',
  'Rp 2.500.000',
  'Candi Borobudur, Prambanan, Malioboro, dan gudeg asli Jogja.',
  'https://drive.google.com/file/d/FILE_ID/view?usp=sharing',
  'Heritage',
  'Halo! Saya tertarik dengan paket Jogja & Borobudur. Bisa info lebih lanjut?'
);
```

### Tambah Paket Inter
```sql
INSERT INTO listings_inter (country, city, name, duration, price, description, image_url, badge, whatsapp_msg)
VALUES (
  'Thailand',
  'Bangkok',
  'Bangkok & Phuket — 6D5N',
  '6D5N',
  'Rp 9.500.000',
  'Grand Palace Bangkok, Wat Pho, dan pantai Phuket yang memesona.',
  'https://drive.google.com/file/d/FILE_ID/view?usp=sharing',
  '🔥 Hot',
  'Halo! Saya tertarik dengan paket Bangkok & Phuket. Bisa info lebih lanjut?'
);
```

### Tambah Paket Cruise
```sql
INSERT INTO listings_cruise (route, name, duration, price, description, image_url, badge, whatsapp_msg)
VALUES (
  'Singapura → Vietnam → Hongkong',
  'Cruise Asia Utara',
  '8 Hari 7 Malam',
  'Rp 22.000.000',
  'Pelayaran spektakuler melewati Ha Long Bay Vietnam hingga Victoria Harbour Hongkong.',
  '',
  '✨ Baru',
  'Halo! Saya tertarik dengan Cruise Asia Utara. Bisa info lebih lanjut?'
);
```

### Tambah Paket Umroh
```sql
INSERT INTO listings_umroh (package_type, name, duration, price, description, image_url, badge, whatsapp_msg)
VALUES (
  'Plus',
  'Umroh Plus Mesir',
  '15 Hari',
  'Rp 48.000.000',
  'Ibadah umroh + wisata Piramida Giza, Sungai Nil, dan Museum Kairo.',
  '',
  '✨ Plus Tour',
  'Halo! Saya tertarik dengan paket Umroh Plus Mesir. Bisa info lebih lanjut?'
);
```

### Tambah Penawaran dengan Expiry
```sql
INSERT INTO offers (name, description, badge, whatsapp_msg, expires)
VALUES (
  'Promo Lebaran 2025',
  'Diskon 20% semua paket domestik selama periode Lebaran. Booking sebelum 1 April!',
  '🎉 Lebaran',
  'Halo! Saya ingin tahu promo Lebaran. Masih tersedia?',
  '2025-04-10'
);
```

---

## Upload Foto Brochure → Google Drive

1. Upload JPEG ke Google Drive
2. Right-click → Get link → **Anyone with the link** → Viewer
3. Copy link → paste ke kolom `image_url`
4. Tidak perlu ubah format URL — website konversi otomatis

---

## Hapus / Expire Paket

```sql
-- Nonaktifkan dengan expiry (lebih aman, data tetap ada)
UPDATE listings_inter SET expires = '2025-01-01' WHERE id = 5;

-- Atau hapus permanen
DELETE FROM listings_domestik WHERE id = 3;
```

---

## Free Tier Cloudflare

| Layanan | Gratis |
|---------|--------|
| D1 | 5 juta baca/hari · 100rb tulis/hari · 1GB storage |
| R2 | 10GB storage · bandwidth gratis |
| Pages | Unlimited bandwidth |
| Workers | 100rb request/hari |

**Total biaya: Rp 0** — lebih dari cukup untuk BHH.
