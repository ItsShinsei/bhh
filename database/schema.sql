-- ═══════════════════════════════════════════
--  Bee Happy Holiday v2 — D1 Schema (Revised)
--  Separate tables per tour category.
--  Paste this ENTIRE file into Cloudflare D1
--  SQL Editor and click Run.
--  WARNING: this setup script drops/recreates tables.
--  For an existing database, run the additive migration
--  in database/migrations/ instead of rerunning this script.
-- ═══════════════════════════════════════════

-- ── DROP (safe re-run) ──
DROP TABLE IF EXISTS destination_photos;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS listings_domestik;
DROP TABLE IF EXISTS listings_inter;
DROP TABLE IF EXISTS listings_cruise;
DROP TABLE IF EXISTS listings_umroh;
DROP TABLE IF EXISTS offers;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS gallery;

-- ══════════════════════════════════════════
--  SHARED COLUMNS (all listing tables have these)
--  name, price, price2, description,
--  image_url, whatsapp_msg, expires, badge,
--  created_at
-- ══════════════════════════════════════════

-- ──────────────────────────────────────────
--  DOMESTIK
--  Extra: province, city
--  Filter page by: province, then city
-- ──────────────────────────────────────────
CREATE TABLE listings_domestik (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  province      TEXT     NOT NULL,   
  city          TEXT,              
  name          TEXT     NOT NULL,
  duration      TEXT,               
  price         TEXT,
  price2        TEXT,
  description   TEXT,
  image_url     TEXT,
  whatsapp_msg  TEXT,
  expires       DATE,
  badge         TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  INTER (internasional)
--  Extra: country, city
--  Filter page by: country, then city
-- ──────────────────────────────────────────
CREATE TABLE listings_inter (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  country       TEXT     NOT NULL,  
  city          TEXT,               
  name          TEXT     NOT NULL,
  duration      TEXT,                
  price         TEXT,
  price2        TEXT,
  description   TEXT,
  image_url     TEXT,
  whatsapp_msg  TEXT,
  expires       DATE,
  badge         TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  CRUISE
--  Extra: route
--  Filter page by: route (or just show all)
-- ──────────────────────────────────────────
CREATE TABLE listings_cruise (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  route         TEXT     NOT NULL,   -- e.g. "Singapura → Malaysia → Thailand"
  name          TEXT     NOT NULL,
  duration      TEXT,                -- e.g. "5 Hari 4 Malam"
  price         TEXT,
  price2        TEXT,
  description   TEXT,
  image_url     TEXT,
  whatsapp_msg  TEXT,
  expires       DATE,
  badge         TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  UMROH
--  Extra: package_type
--  Filter page by: package_type
-- ──────────────────────────────────────────
CREATE TABLE listings_umroh (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  package_type  TEXT     NOT NULL    -- "Reguler", "Plus", "Premium"
                CHECK (package_type IN ('Reguler', 'Plus', 'Premium')),
  name          TEXT     NOT NULL,
  duration      TEXT,                -- e.g. "9 Hari", "12 Hari"
  price         TEXT,
  price2        TEXT,
  description   TEXT,
  image_url     TEXT,
  whatsapp_msg  TEXT,
  expires       DATE,
  badge         TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  OFFERS  (standalone promotions)
-- ──────────────────────────────────────────
CREATE TABLE offers (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  category      TEXT     CHECK (category IN ('domestik', 'inter', 'cruise') OR category IS NULL),
  province      TEXT,
  country       TEXT,
  city          TEXT,
  name          TEXT     NOT NULL,
  description   TEXT,
  image_url     TEXT,
  whatsapp_msg  TEXT,
  expires       DATE,
  badge         TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  REVIEWS
-- ──────────────────────────────────────────
CREATE TABLE reviews (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  name        TEXT     NOT NULL,
  photo_url   TEXT,
  rating      INTEGER  DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text        TEXT     NOT NULL,
  date        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  GALLERY
-- ──────────────────────────────────────────
CREATE TABLE gallery (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  title       TEXT,
  image_url   TEXT     NOT NULL,
  -- reuse category string to keep gallery filter working
  category    TEXT     CHECK (category IN ('domestik','inter','cruise','umroh')),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  DESTINATIONS
--  One row per country or city
-- ──────────────────────────────────────────
CREATE TABLE destinations (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  slug        TEXT     NOT NULL UNIQUE,          -- e.g. "switzerland", "paris"
  name        TEXT     NOT NULL,                 -- e.g. "Swiss", "Paris"
  type        TEXT     NOT NULL DEFAULT 'country'
              CHECK (type IN ('country', 'city')),
  country     TEXT,                              -- parent country if type=city
  continent   TEXT     NOT NULL
              CHECK (continent IN ('Asia','Eropa','Amerika','Afrika','Oseania','Timur Tengah')),
  lat         REAL     NOT NULL,                 -- map marker latitude
  lng         REAL     NOT NULL,                 -- map marker longitude
  description TEXT,                              -- blog-style rich description
  image_url   TEXT,                              -- hero image
  badge       TEXT,                              -- e.g. "Populer", "Baru"
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
--  DESTINATION PHOTOS
--  Many photos per destination
-- ──────────────────────────────────────────
CREATE TABLE destination_photos (
  id             INTEGER  PRIMARY KEY AUTOINCREMENT,
  destination_id INTEGER  NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  image_url      TEXT     NOT NULL,
  caption        TEXT,
  sort_order     INTEGER  DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ══════════════════════════════════════════
--  INDEXES
-- ══════════════════════════════════════════
CREATE INDEX idx_dom_province    ON listings_domestik(province);
CREATE INDEX idx_dom_city        ON listings_domestik(city);
CREATE INDEX idx_dom_expires     ON listings_domestik(expires);

CREATE INDEX idx_int_country     ON listings_inter(country);
CREATE INDEX idx_int_city        ON listings_inter(city);
CREATE INDEX idx_int_expires     ON listings_inter(expires);

CREATE INDEX idx_cru_route       ON listings_cruise(route);
CREATE INDEX idx_cru_expires     ON listings_cruise(expires);

CREATE INDEX idx_umr_type        ON listings_umroh(package_type);
CREATE INDEX idx_umr_expires     ON listings_umroh(expires);

CREATE INDEX idx_offers_expires  ON offers(expires);
CREATE INDEX idx_offers_category ON offers(category);
CREATE INDEX idx_gallery_cat     ON gallery(category);

CREATE INDEX idx_dest_continent  ON destinations(continent);
CREATE INDEX idx_dest_type       ON destinations(type);
CREATE INDEX idx_dest_slug       ON destinations(slug);
CREATE INDEX idx_photos_dest_id  ON destination_photos(destination_id);
CREATE INDEX idx_photos_sort     ON destination_photos(destination_id, sort_order);

-- ══════════════════════════════════════════
--  SAMPLE DATA — DOMESTIK
-- ══════════════════════════════════════════
INSERT INTO listings_domestik (province, city, name, duration, price, description, image_url, badge, whatsapp_msg) VALUES
  ('Bali', 'Denpasar',     'Bali Romantis testing',        '5D4N', 'Rp 5.500.000', 'Pura Tanah Lot, sawah Tegalalang, dan sunset di Kuta. Sempurna untuk pasangan.',                         'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop', 'Terlaris',   'Halo! Saya tertarik dengan paket Bali Romantis 5D4N. Bisa info lebih lanjut?'),
  ('Bali', 'Ubud',         'Bali Culture & Spa testing',   '4D3N', 'Rp 4.800.000', 'Wisata budaya di Ubud, monkey forest, kelas memasak Bali, dan spa tradisional.',                          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', '',           'Halo! Saya tertarik dengan paket Bali Culture & Spa 4D3N. Bisa info lebih lanjut?'),
  ('NTB',  'Lombok',       'Lombok & Gili Islands testing', '4D3N', 'Rp 3.900.000', 'Air jernih, snorkeling di Gili Trawangan, dan Pantai Senggigi. Paket budget terbaik.',                    'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&auto=format&fit=crop', '💰 Budget',  'Halo! Saya tertarik dengan paket Lombok & Gili 4D3N. Bisa info lebih lanjut?'),
  ('NTT',  'Labuan Bajo',  'Komodo & Labuan Bajo testing', '4D3N', 'Rp 6.500.000', 'Bertemu komodo di habitatnya, snorkeling di Pulau Padar, dan menyaksikan matahari terbenam terbaik.',     'https://images.unsplash.com/photo-1580508174046-170816f65662?w=800&auto=format&fit=crop','🦎 Eksotis', 'Halo! Saya tertarik dengan paket Komodo & Labuan Bajo 4D3N. Bisa info lebih lanjut?'),
  ('Papua Barat', 'Raja Ampat', 'Raja Ampat Diving testing', '5D4N', 'Rp 9.500.000', 'Surga bawah laut terbaik dunia. Diving dan snorkeling di perairan paling kaya biodiversitas di bumi.',  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop', '🤿 Diving', 'Halo! Saya tertarik dengan paket Raja Ampat Diving 5D4N. Bisa info lebih lanjut?'),
  ('Jawa Timur', 'Malang',  'Malang–Bromo Eksplor testing', '3D2N', 'Rp 2.100.000', 'Sunrise di Gunung Bromo, kebun apel Malang, dan Coban Rondo. Paket singkat yang berkesan.',             'https://images.unsplash.com/photo-1588087640728-2a2d98ed4b88?w=800&auto=format&fit=crop', '',          'Halo! Saya tertarik dengan paket Malang–Bromo 3D2N. Bisa info lebih lanjut?'),
  ('Jawa Timur', 'Banyuwangi', 'Kawah Ijen & Baluran testing', '3D2N', 'Rp 1.900.000', 'Blue fire Kawah Ijen yang menakjubkan dan savana Baluran — "Afrika van Java".',                       'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&auto=format&fit=crop', '',          'Halo! Saya tertarik dengan paket Kawah Ijen & Baluran 3D2N. Bisa info lebih lanjut?'),
  ('Sulawesi Selatan', 'Makassar', 'Toraja & Makassar testing', '5D4N', 'Rp 5.200.000', 'Upacara adat Rambu Solo Toraja, benteng Rotterdam Makassar, dan kuliner Coto Makassar.',             '', '',          'Halo! Saya tertarik dengan paket Toraja & Makassar 5D4N. Bisa info lebih lanjut?');

-- ══════════════════════════════════════════
--  SAMPLE DATA — INTER
-- ══════════════════════════════════════════
INSERT INTO listings_inter (country, city, name, duration, price, description, image_url, badge, whatsapp_msg) VALUES
  ('Jepang',        'Tokyo',      'Jepang Sakura Tour testing',      '7D6N',  'Rp 18.000.000', 'Musim bunga sakura di Tokyo, Kyoto, dan Osaka. Termasuk pass Shinkansen dan menginap di ryokan.',          'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop', '🌸 Musiman', 'Halo! Saya tertarik dengan paket Jepang Sakura Tour 7D6N. Bisa info lebih lanjut?'),
  ('Jepang',        'Osaka',      'Jepang Autumn Foliage testing',   '8D7N',  'Rp 20.000.000', 'Daun momiji di Kyoto, Nara, dan Osaka di musim gugur. Pengalaman Jepang yang sesungguhnya.',             '', '🍂 Musiman', 'Halo! Saya tertarik dengan paket Jepang Autumn Foliage. Bisa info lebih lanjut?'),
  ('Korea Selatan', 'Seoul',      'Korea Autumn Tour testing',       '6D5N',  'Rp 14.000.000', 'Seoul, Pulau Jeju, dan Nami Island berbalut daun musim gugur. Pemandangan ala K-Drama.',                  'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&auto=format&fit=crop', '🔥 Hot',    'Halo! Saya tertarik dengan paket Korea Autumn Tour 6D5N. Bisa info lebih lanjut?'),
  ('Korea Selatan', 'Jeju',       'Korea Winter Snow testing',       '5D4N',  'Rp 13.500.000', 'Salju pertama di Jeju Island dan taman Nami yang tertutup putih. Pengalaman musim dingin tak terlupakan.', '', '',          'Halo! Saya tertarik dengan paket Korea Winter Snow 5D4N. Bisa info lebih lanjut?'),
  ('Singapura',     'Singapura',  'Singapura Weekend testing',       '3D2N',  'Rp 7.800.000',  'Gardens by the Bay, Marina Bay Sands, dan Universal Studios. Cocok untuk keluarga.',                      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop', '',          'Halo! Saya tertarik dengan paket Singapura Weekend 3D2N. Bisa info lebih lanjut?'),
  ('Swiss',         'Zurich',     'Swiss Alps Premium testing',      '9D8N',  'Rp 38.000.000', 'Gondola di atas awan, cokelat Swiss asli, dan matahari terbenam di pegunungan Alpen yang megah.',         'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop', '',          'Halo! Saya tertarik dengan paket Swiss Alps Premium 9D8N. Bisa info lebih lanjut?'),
  ('Perancis',      'Paris',      'Paris & Eropa Barat testing',     '10D9N', 'Rp 42.000.000', 'Menara Eiffel, Louvre, Amsterdam, dan Brussel dalam satu paket perjalanan Eropa yang komprehensif.',       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop', '',          'Halo! Saya tertarik dengan paket Paris & Eropa Barat. Bisa info lebih lanjut?'),
  ('Turki',         'Istanbul',   'Istanbul & Cappadocia testing',   '8D7N',  'Rp 22.000.000', 'Balon udara di Cappadocia, Hagia Sophia, Bosphorus cruise, dan pasar rempah Istanbul yang ikonik.',        '', '✨ Populer', 'Halo! Saya tertarik dengan paket Istanbul & Cappadocia 8D7N. Bisa info lebih lanjut?'),
  ('Australia',     'Sydney',     'Australia Explorer testing',      '7D6N',  'Rp 25.000.000', 'Opera House, Bondi Beach, Blue Mountains, dan Great Barrier Reef — ikonis Australia dalam satu perjalanan.','', '',          'Halo! Saya tertarik dengan paket Australia Explorer 7D6N. Bisa info lebih lanjut?'),
  ('Arab Saudi',    'Dubai',      'Dubai City Tour testing',         '5D4N',  'Rp 16.000.000', 'Burj Khalifa, Dubai Mall, desert safari, dan Palm Jumeirah. Kemewahan Timur Tengah dalam 5 hari.',        '', '🌟 Mewah',  'Halo! Saya tertarik dengan paket Dubai City Tour 5D4N. Bisa info lebih lanjut?');

-- ══════════════════════════════════════════
--  SAMPLE DATA — CRUISE
-- ══════════════════════════════════════════
INSERT INTO listings_cruise (route, name, duration, price, description, image_url, badge, whatsapp_msg) VALUES
  ('Singapura → Malaysia → Thailand',     'Cruise Asia Selatan testing',     '5 Hari 4 Malam',   'Rp 12.000.000', 'Berlayar dari Singapura ke Penang dan Phuket. Nikmati fasilitas kapal bintang 5 sambil menjelajahi 3 negara.', 'https://images.unsplash.com/photo-1548194099-bed76927b52e?w=800&auto=format&fit=crop', '🔥 Populer',  'Halo! Saya tertarik dengan Cruise Asia Selatan 5H4M. Bisa info lebih lanjut?'),
  ('Singapura → Bali → Komodo',           'Cruise Nusantara testing',        '7 Hari 6 Malam',   'Rp 18.500.000', 'Jelajahi keajaiban Indonesia dari laut — Bali, Komodo, dan kembali ke Singapura dengan kapal pesiar mewah.', '', '🇮🇩 Lokal',    'Halo! Saya tertarik dengan Cruise Nusantara 7H6M. Bisa info lebih lanjut?'),
  ('Hongkong → Jepang → Korea',           'Cruise Asia Timur testing',       '10 Hari 9 Malam',  'Rp 28.000.000', 'Singgah di Hongkong, Fukuoka, Nagasaki, dan Busan dalam satu pelayaran yang mengesankan.',                   '', '✨ Premium',   'Halo! Saya tertarik dengan Cruise Asia Timur 10H9M. Bisa info lebih lanjut?'),
  ('Dubai → Oman → India',                'Cruise Timur Tengah testing',     '8 Hari 7 Malam',   'Rp 24.000.000', 'Pelayaran mewah dari Dubai, singgah di Muscat Oman, dan berakhir di Mumbai. Budaya, gurun, dan laut.',       '', '',             'Halo! Saya tertarik dengan Cruise Timur Tengah 8H7M. Bisa info lebih lanjut?'),
  ('Barcelona → Italia → Yunani',         'Cruise Mediterania testing',      '12 Hari 11 Malam', 'Rp 48.000.000', 'Pelayaran Mediterania ikonik — Barcelona, Roma, Napoli, Santorini, dan Athena dalam satu perjalanan epik.', '', '🌟 Mewah',     'Halo! Saya tertarik dengan Cruise Mediterania 12H11M. Bisa info lebih lanjut?');

-- ══════════════════════════════════════════
--  SAMPLE DATA — UMROH
-- ══════════════════════════════════════════
INSERT INTO listings_umroh (package_type, name, duration, price, description, image_url, badge, whatsapp_msg) VALUES
  ('Reguler', 'Umroh Reguler Hemat testing',     '9 Hari',  'Rp 25.000.000', 'Paket umroh ekonomis dengan hotel bintang 3 di Mekkah dan Madinah. Termasuk pembimbing ibadah bersertifikat.', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop', 'Terjangkau', 'Halo! Saya tertarik dengan paket Umroh Reguler 9 Hari. Bisa info lebih lanjut?'),
  ('Reguler', 'Umroh Reguler Ramadan testing',   '12 Hari', 'Rp 32.000.000', 'Umroh di bulan Ramadan yang penuh berkah. Rasakan shalat tarawih di Masjidil Haram dan itikaf di 10 malam terakhir.', '', '🌙 Ramadan',  'Halo! Saya tertarik dengan paket Umroh Reguler Ramadan 12 Hari. Bisa info lebih lanjut?'),
  ('Plus',    'Umroh Plus Turki testing',         '14 Hari', 'Rp 42.000.000', 'Ibadah umroh + city tour Istanbul, Cappadocia, dan Konya. Menggabungkan spiritualitas dan wisata sejarah Islam.',  '', '✨ Plus Tour', 'Halo! Saya tertarik dengan paket Umroh Plus Turki 14 Hari. Bisa info lebih lanjut?'),
  ('Plus',    'Umroh Plus Dubai testing',         '12 Hari', 'Rp 45.000.000', 'Ibadah umroh + 3 hari wisata mewah di Dubai. Burj Khalifa, Desert Safari, dan belanja di Dubai Mall.',            '', '✨ Plus Tour', 'Halo! Saya tertarik dengan paket Umroh Plus Dubai 12 Hari. Bisa info lebih lanjut?'),
  ('Premium', 'Umroh Premium Bintang 5 testing',  '10 Hari', 'Rp 65.000.000', 'Pengalaman umroh paling nyaman dengan hotel bintang 5 persis di depan Masjidil Haram dan Masjid Nabawi.',         '', '⭐ Premium',  'Halo! Saya tertarik dengan paket Umroh Premium Bintang 5. Bisa info lebih lanjut?'),
  ('Premium', 'Umroh Premium VIP testing',        '12 Hari', 'Rp 85.000.000', 'Layanan VIP eksklusif: suite room, private guide, ziarah lengkap, dan makan malam di restoran hotel bintang 5.',   '', '👑 VIP',      'Halo! Saya tertarik dengan paket Umroh Premium VIP 12 Hari. Bisa info lebih lanjut?');

-- ══════════════════════════════════════════
--  SAMPLE DATA — OFFERS
-- ══════════════════════════════════════════
INSERT INTO offers (category, province, country, city, name, description, image_url, badge, whatsapp_msg) VALUES
  ('domestik', 'Bali', '', 'Bali', 'Paket Bulan Madu testing', 'Upgrade vila pribadi + makan malam romantis untuk setiap pasangan yang booking 5D4N atau lebih.', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop', '🔥 Spesial', 'Halo! Saya tertarik dengan penawaran Paket Bulan Madu. Bisa info lebih lanjut?'),
  ('domestik', '', '', '', 'Anak Gratis Pergi testing', 'Anak di bawah 5 tahun gratis. Anak 6–12 tahun diskon 30% untuk semua paket wisata domestik.', '', 'Keluarga', 'Halo! Saya ingin tanya tentang promo Anak Gratis Pergi. Bisa info lebih lanjut?'),
  ('inter', '', 'Jepang', 'Tokyo', 'Tour Group & Corporate testing', 'Outing kantor atau reuni? Kami handle rombongan 10+ orang dengan harga spesial dan itinerari custom.', '', 'Group', 'Halo! Saya ingin tanya tentang paket Tour Group/Corporate. Bisa info lebih lanjut?'),
  ('cruise', '', 'Singapura', 'Singapura', 'Flash Deal Akhir Pekan testing', 'Flash deal 7–14 hari sebelum keberangkatan. Follow Instagram kami agar tidak ketinggalan!', '', '⚡ Flash', 'Halo! Saya ingin tahu Flash Deal terbaru. Ada promo yang tersedia?');

-- ══════════════════════════════════════════
--  SAMPLE DATA — REVIEWS
-- ══════════════════════════════════════════
INSERT INTO reviews (name, rating, text, date) VALUES
  ('Siti Rahayu testing',    5, 'Pelayanannya luar biasa! Perjalanan ke Jepang kami diurus sangat profesional. Pasti pakai BHH lagi!', 'Maret 2025'),
  ('Budi Santoso testing',   5, 'Paket umrohnya sangat memuaskan. Hotel dekat Masjidil Haram, pembimbing berpengalaman. Terima kasih!', 'Februari 2025'),
  ('Dewi Lestari testing',   5, 'Honeymoon ke Bali jadi sempurna berkat BHH. Rekomendasi tepat dan harga kompetitif!', 'April 2025'),
  ('Ahmad Fauzi testing',    5, 'Visa Schengen yang saya khawatirkan beres dalam seminggu. Tim BHH sangat komunikatif!', 'Januari 2025'),
  ('Rina Wahyuni testing',   5, 'Cruise bersama keluarga besar (15 orang) berjalan lancar. BHH handle semuanya sempurna!', 'Maret 2025');

-- ══════════════════════════════════════════
--  SAMPLE DATA — GALLERY
-- ══════════════════════════════════════════
INSERT INTO gallery (title, image_url, category) VALUES
  ('Sunset Kuta, Bali testing',     'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&auto=format&fit=crop', 'domestik'),
  ('Sakura Tokyo, Jepang testing',  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&auto=format&fit=crop', 'inter'),
  ('Marina Bay Sands testing',      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=700&auto=format&fit=crop',    'inter'),
  ('Gili Trawangan, NTB testing',   'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&auto=format&fit=crop',   'domestik'),
  ('Cruise Asia testing',           'https://images.unsplash.com/photo-1548194099-bed76927b52e?w=700&auto=format&fit=crop',   'cruise'),
  ('Masjidil Haram testing',        'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=700&auto=format&fit=crop', 'umroh'),
  ('Seoul, Korea testing',          'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=700&auto=format&fit=crop', 'inter'),
  ('Swiss Alps testing',            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&auto=format&fit=crop', 'inter'),
  ('Raja Ampat, Papua testing',     'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=700&auto=format&fit=crop', 'domestik'),
  ('Paris, Perancis testing',       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&auto=format&fit=crop', 'inter'),
  ('Komodo Island testing',         'https://images.unsplash.com/photo-1580508174046-170816f65662?w=700&auto=format&fit=crop', 'domestik'),
  ('Kawah Ijen testing',            'https://images.unsplash.com/photo-1588087640728-2a2d98ed4b88?w=700&auto=format&fit=crop', 'domestik');

-- ══════════════════════════════════════════
--  SAMPLE DATA — DESTINATIONS
-- ══════════════════════════════════════════
INSERT INTO destinations (slug, name, type, continent, lat, lng, description, image_url, badge) VALUES
  ('switzerland', 'Swiss', 'country', 'Eropa', 46.8182, 8.2275,
   'Swiss adalah negara kecil di jantung Eropa yang menyimpan keindahan alam yang luar biasa. Pegunungan Alpen yang megah, danau biru jernih, dan padang rumput hijau menjadi pemandangan sehari-hari di sini. Kota-kota seperti Zurich, Geneva, dan Interlaken menawarkan perpaduan sempurna antara modernitas dan tradisi. Nikmati cokelat Swiss asli, keju Emmental, dan fondue sambil menyaksikan matahari terbenam di balik puncak-puncak salju.',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop', 'Populer'),

  ('jepang', 'Jepang', 'country', 'Asia', 36.2048, 138.2529,
   'Jepang adalah negara yang berhasil memadukan tradisi ribuan tahun dengan teknologi masa depan secara harmonis. Musim semi menghadirkan keajaiban bunga sakura yang memenuhi setiap sudut kota. Musim gugur membalut hutan dan taman dalam nuansa merah dan emas yang menakjubkan. Dari kuil-kuil kuno Kyoto hingga jalanan neon Tokyo yang memukau, Jepang selalu punya cerita baru untuk ditemukan.',
   'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&auto=format&fit=crop', 'Terfavorit'),

  ('turki', 'Turki', 'country', 'Eropa', 38.9637, 35.2433,
   'Turki adalah jembatan antara dua dunia — Eropa dan Asia — dengan kekayaan sejarah dan budaya yang tak ternilai. Istanbul, kota yang pernah menjadi ibu kota tiga kekaisaran besar, menawarkan masjid-masjid bersejarah, pasar rempah yang semarak, dan pemandangan Selat Bosphorus yang memukau. Sementara Cappadocia memanjakan dengan lanskap batu-batu unik dan pengalaman balon udara panas yang tak terlupakan.',
   'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&auto=format&fit=crop', 'Populer'),

  ('korea-selatan', 'Korea Selatan', 'country', 'Asia', 35.9078, 127.7669,
   'Korea Selatan adalah negara yang tak pernah berhenti mengejutkan. Di balik kehidupan kota Seoul yang serba modern dan dinamis, tersimpan kuil-kuil berusia ratusan tahun, desa tradisional yang terawat, dan alam yang indah di setiap musim. Musik K-Pop, drama Korea, dan kuliner seperti bibimbap, tteokbokki, serta samgyeopsal telah menjadikan Korea Selatan sebagai destinasi impian jutaan traveler dunia.',
   'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&auto=format&fit=crop', ''),

  ('perancis', 'Perancis', 'country', 'Eropa', 46.2276, 2.2137,
   'Perancis adalah personifikasi dari keindahan, seni, dan kuliner terbaik dunia. Paris — kota cahaya — memikat jutaan wisatawan dengan Menara Eiffel yang ikonik, museum Louvre yang legendaris, dan aroma croissant di setiap sudut jalan. Di luar Paris, Perancis menawarkan kebun lavender Provence yang memesona, pantai-pantai Riviera yang elegan, dan kastil-kastil Loire Valley yang megah.',
   'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop', ''),

  ('dubai', 'Dubai', 'country', 'Timur Tengah', 25.2048, 55.2708,
   'Dubai adalah kota di mana mimpi menjadi kenyataan. Dari gurun pasir yang luas hingga pencakar langit tertinggi di dunia, Dubai terus mendefinisikan ulang batas kemungkinan. Burj Khalifa yang menjulang 828 meter, Palm Jumeirah yang dibangun di tengah laut, dan Dubai Mall yang lebih besar dari kebanyakan kota — semuanya adalah bukti ambisi tanpa batas negara Emirat ini.',
   'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop', 'Mewah'),

  ('singapura', 'Singapura', 'country', 'Asia', 1.3521, 103.8198,
   'Singapura membuktikan bahwa ukuran bukan segalanya. Negara pulau mungil ini adalah salah satu destinasi paling mengesankan di Asia Tenggara. Gardens by the Bay dengan Supertree Grove-nya yang futuristik, Marina Bay Sands dengan kolam renang di ketinggian 57 lantai, dan Sentosa Island yang penuh hiburan menjadikan Singapura tempat yang tak pernah membosankan.',
   'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&auto=format&fit=crop', ''),

  ('australia', 'Australia', 'country', 'Oseania', -25.2744, 133.7751,
   'Australia adalah benua sekaligus negara yang menawarkan keragaman alam yang luar biasa. Sydney Opera House dan Harbour Bridge menjadi ikon arsitektur dunia. Great Barrier Reef menghadirkan surga bawah laut yang tak tertandingi. Uluru — batu merah raksasa di tengah outback — memancarkan aura spiritual yang kuat. Dan tentu saja, kanguru, koala, serta wallaby siap menyambut di mana-mana.',
   'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&auto=format&fit=crop', '');

-- ══════════════════════════════════════════
--  SAMPLE DATA — DESTINATION PHOTOS
-- ══════════════════════════════════════════
INSERT INTO destination_photos (destination_id, image_url, caption, sort_order) VALUES
  (1, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop', 'Pegunungan Alpen Swiss', 1),
  (1, 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop', 'Interlaken dari ketinggian', 2),
  (1, 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&auto=format&fit=crop', 'Danau Geneva', 3),

  (2, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop', 'Bunga sakura di Tokyo', 1),
  (2, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop', 'Kuil Fushimi Inari Kyoto', 2),
  (2, 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop', 'Gunung Fuji', 3),

  (3, 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop', 'Cappadocia dari udara', 1),
  (3, 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop', 'Hagia Sophia Istanbul', 2),
  (3, 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&auto=format&fit=crop', 'Balon udara Cappadocia', 3),

  (4, 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&auto=format&fit=crop', 'Seoul city skyline', 1),
  (4, 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop', 'Gyeongbokgung Palace', 2),
  (4, 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&auto=format&fit=crop', 'Nami Island musim gugur', 3),

  (5, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop', 'Menara Eiffel Paris', 1),
  (5, 'https://images.unsplash.com/photo-1431274172761-fcdab704a4ef?w=800&auto=format&fit=crop', 'Louvre Museum', 2),
  (5, 'https://images.unsplash.com/photo-1551634979-2b11f8c218da?w=800&auto=format&fit=crop', 'Provence lavender fields', 3),

  (6, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop', 'Dubai skyline malam', 1),
  (6, 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&auto=format&fit=crop', 'Burj Khalifa', 2),
  (6, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop', 'Desert safari Dubai', 3),

  (7, 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&auto=format&fit=crop', 'Marina Bay Sands', 1),
  (7, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop', 'Gardens by the Bay', 2),
  (7, 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800&auto=format&fit=crop', 'Chinatown Singapore', 3),

  (8, 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&auto=format&fit=crop', 'Sydney Opera House', 1),
  (8, 'https://images.unsplash.com/photo-1587139223877-04ea2b0a8ca4?w=800&auto=format&fit=crop', 'Great Barrier Reef', 2),
  (8, 'https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=800&auto=format&fit=crop', 'Uluru sunset', 3);
