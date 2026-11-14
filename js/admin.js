/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Admin Dashboard Logic
   Data-driven RESOURCES config drives forms,
   tables, and add/edit/delete for every D1 table.
   Mobile-first: lazy tab loading, pagination,
   search, and card-style rows on small screens.
   ═══════════════════════════════════════════ */

import { API_BASE, driveThumb } from "./config.js";

const workerUrl = API_BASE.replace(/\/api$/, "");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const PAGE_SIZE = 15;

const DESTINATION_PRESETS = [
  {
    name: "Jepang",
    type: "country",
    continent: "Asia",
    lat: 36.2048,
    lng: 138.2529,
    badge: "Terfavorit",
    description:
      "Jepang memadukan tradisi kuno, kota modern, dan keindahan alam seperti sakura dan gunung.",
  },
  {
    name: "Swiss",
    type: "country",
    continent: "Eropa",
    lat: 46.8182,
    lng: 8.2275,
    badge: "Populer",
    description:
      "Swiss dikenal dengan Alpen, danau, kota bersih, dan pengalaman alam yang tenang serta elegan.",
  },
  {
    name: "Dubai",
    type: "country",
    continent: "Timur Tengah",
    lat: 25.2048,
    lng: 55.2708,
    badge: "Mewah",
    description:
      "Dubai menawarkan skyline modern, resort mewah, dan pengalaman gurun yang spektakuler.",
  },
  {
    name: "Australia",
    type: "country",
    continent: "Oseania",
    lat: -25.2744,
    lng: 133.7751,
    badge: "Eksotis",
    description:
      "Australia terkenal dengan outback, pantai ikonik, fauna unik, dan pengalaman outdoor yang luas.",
  },
  {
    name: "Paris",
    type: "city",
    continent: "Eropa",
    country: "Perancis",
    lat: 48.8566,
    lng: 2.3522,
    badge: "Ikonik",
    description:
      "Paris adalah kota seni, fashion, sejarah, dan landmark ikonik seperti Menara Eiffel.",
  },
];

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload gagal (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.url;
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// ── Resource configuration ──
const RESOURCES = [
  {
    key: "domestik",
    label: "Domestik",
    endpoint: "/api/domestik",
    listAll: true,
    fields: [
      { name: "province", label: "Provinsi", type: "text", required: true },
      { name: "city", label: "Kota", type: "text", required: true },
      { name: "name", label: "Nama Paket", type: "text", required: true },
      { name: "duration", label: "Durasi", type: "text" },
      { name: "price", label: "Harga", type: "text" },
      { name: "price2", label: "Harga Coret (opsional)", type: "text" },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "image_url", label: "Gambar", type: "image" },
      { name: "badge", label: "Badge", type: "text" },
      { name: "whatsapp_msg", label: "WhatsApp Msg", type: "text" },
      { name: "expires", label: "Kadaluarsa (opsional)", type: "date" },
    ],
  },
  {
    key: "inter",
    label: "Inter",
    endpoint: "/api/inter",
    listAll: true,
    fields: [
      { name: "country", label: "Negara", type: "text", required: true },
      { name: "city", label: "Kota", type: "text", required: true },
      { name: "name", label: "Nama Paket", type: "text", required: true },
      { name: "duration", label: "Durasi", type: "text" },
      { name: "price", label: "Harga", type: "text" },
      { name: "price2", label: "Harga Coret (opsional)", type: "text" },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "image_url", label: "Gambar", type: "image" },
      { name: "badge", label: "Badge", type: "text" },
      { name: "whatsapp_msg", label: "WhatsApp Msg", type: "text" },
      { name: "expires", label: "Kadaluarsa (opsional)", type: "date" },
    ],
  },
  {
    key: "cruise",
    label: "Cruise",
    endpoint: "/api/cruise",
    listAll: true,
    fields: [
      { name: "route", label: "Rute", type: "text", required: true },
      { name: "name", label: "Nama Paket", type: "text", required: true },
      { name: "duration", label: "Durasi", type: "text" },
      { name: "price", label: "Harga", type: "text" },
      { name: "price2", label: "Harga Coret (opsional)", type: "text" },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "image_url", label: "Gambar", type: "image" },
      { name: "badge", label: "Badge", type: "text" },
      { name: "whatsapp_msg", label: "WhatsApp Msg", type: "text" },
      { name: "expires", label: "Kadaluarsa (opsional)", type: "date" },
    ],
  },
  {
    key: "umroh",
    label: "Umroh",
    endpoint: "/api/umroh",
    listAll: true,
    fields: [
      {
        name: "package_type",
        label: "Tipe",
        type: "select",
        required: true,
        options: ["Reguler", "Plus", "Premium"],
      },
      { name: "name", label: "Nama Paket", type: "text", required: true },
      { name: "duration", label: "Durasi", type: "text" },
      { name: "price", label: "Harga", type: "text" },
      { name: "price2", label: "Harga Coret (opsional)", type: "text" },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "image_url", label: "Gambar", type: "image" },
      { name: "badge", label: "Badge", type: "text" },
      { name: "whatsapp_msg", label: "WhatsApp Msg", type: "text" },
      { name: "expires", label: "Kadaluarsa (opsional)", type: "date" },
    ],
  },
  {
    key: "offers",
    label: "Promo",
    endpoint: "/api/offers",
    listAll: true,
    fields: [
      {
        name: "category",
        label: "Kategori Promo",
        type: "select",
        required: true,
        placeholder: "Pilih kategori",
        options: ["domestik", "inter", "cruise"],
        hint: "Promo akan tampil di halaman kategori yang dipilih. Promo Umroh tidak menggunakan tag.",
      },
      {
        name: "province",
        label: "Provinsi (Domestik)",
        type: "text",
        hint: "Opsional. Isi jika promo hanya berlaku untuk provinsi tertentu.",
      },
      {
        name: "country",
        label: "Negara (Mancanegara/Cruise)",
        type: "text",
        hint: "Opsional. Untuk beberapa negara, pisahkan dengan koma (contoh: Malaysia, Singapore, Thailand).",
      },
      {
        name: "city",
        label: "Kota",
        type: "text",
        hint: "Opsional. Isi jika promo hanya berlaku untuk kota tertentu.",
      },
      { name: "name", label: "Nama Promo", type: "text", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "image_url", label: "Gambar", type: "image" },
      { name: "badge", label: "Badge", type: "text" },
      { name: "whatsapp_msg", label: "WhatsApp Msg", type: "text" },
      { name: "expires", label: "Kadaluarsa (opsional)", type: "date" },
    ],
  },
  {
    key: "reviews",
    label: "Ulasan",
    endpoint: "/api/reviews",
    listAll: false,
    fields: [
      { name: "name", label: "Nama Pelanggan", type: "text", required: true },
      {
        name: "rating",
        label: "Rating (1-5)",
        type: "number",
        min: 1,
        max: 5,
        required: true,
      },
      { name: "text", label: "Ulasan", type: "textarea", required: true },
      { name: "photo_url", label: "Photo URL (opsional)", type: "text" },
    ],
  },
  {
    key: "gallery",
    label: "Galeri",
    endpoint: "/api/gallery",
    listAll: false,
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      {
        name: "category",
        label: "Kategori",
        type: "select",
        required: true,
        options: ["domestik", "inter", "cruise", "umroh"],
      },
      { name: "image_url", label: "Gambar", type: "image", required: true },
    ],
  },
  // ── NEW: Destination Guide ──
  {
    key: "destinations",
    label: "Destinasi",
    endpoint: "/api/destinations",
    listAll: false,
    fields: [
      {
        name: "name",
        label: "Nama Destinasi",
        type: "text",
        required: true,
        hint: "e.g. Swiss, Tokyo, Santorini",
      },
      {
        name: "slug",
        label: "Slug (URL ID)",
        type: "text",
        required: true,
        hint: "huruf kecil, tanpa spasi, e.g. swiss · tokyo · santorini",
      },
      {
        name: "type",
        label: "Tipe",
        type: "select",
        required: true,
        options: ["country", "city"],
      },
      {
        name: "continent",
        label: "Benua",
        type: "select",
        required: true,
        options: [
          "Asia",
          "Eropa",
          "Timur Tengah",
          "Oseania",
          "Amerika",
          "Afrika",
        ],
      },
      {
        name: "country",
        label: "Negara Induk",
        type: "text",
        hint: "Isi jika tipe = city, e.g. Jepang",
      },
      {
        name: "lat",
        label: "Latitude",
        type: "text",
        required: true,
        hint: "e.g. 35.6762 (Tokyo)",
      },
      {
        name: "lng",
        label: "Longitude",
        type: "text",
        required: true,
        hint: "e.g. 139.6503 (Tokyo)",
      },
      { name: "description", label: "Deskripsi (blog)", type: "textarea" },
      { name: "image_url", label: "Foto Hero", type: "image" },
      {
        name: "badge",
        label: "Badge",
        type: "text",
        hint: "e.g. Populer, Baru, Terfavorit",
      },
    ],
  },
];

// ── Helpers ──
function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function escAttr(s) {
  return esc(s).replace(/\n/g, " ");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanCoordinate(value, type) {
  const raw = String(value ?? "")
    .trim()
    .replace(",", ".");
  if (!raw) return "";
  const num = Number(raw);
  if (!Number.isFinite(num)) return "";
  if (type === "lat" && (num < -90 || num > 90)) return "invalid";
  if (type === "lng" && (num < -180 || num > 180)) return "invalid";
  return Number(num.toFixed(6));
}

function validateDestinationCoords(form) {
  const latInput = form.elements.lat;
  const lngInput = form.elements.lng;
  if (!latInput || !lngInput) return true;

  const latStatus = form.querySelector('[data-coordinate-status="lat"]');
  const lngStatus = form.querySelector('[data-coordinate-status="lng"]');
  const check = (input, status, type) => {
    const value = cleanCoordinate(input.value, type);
    if (!input.value.trim()) {
      status.textContent =
        type === "lat"
          ? "Latitude wajib diisi (-90 sampai 90)"
          : "Longitude wajib diisi (-180 sampai 180)";
      status.style.color = "#b91c1c";
      input.setAttribute("aria-invalid", "true");
      return false;
    }
    if (value === "invalid" || value === "") {
      status.textContent =
        type === "lat"
          ? "Latitude harus antara -90 sampai 90"
          : "Longitude harus antara -180 sampai 180";
      status.style.color = "#b91c1c";
      input.setAttribute("aria-invalid", "true");
      return false;
    }
    input.value = value;
    status.textContent = `OK • ${type === "lat" ? "Latitude" : "Longitude"}: ${value}`;
    status.style.color = "#166534";
    input.removeAttribute("aria-invalid");
    return true;
  };

  const okLat = check(latInput, latStatus, "lat");
  const okLng = check(lngInput, lngStatus, "lng");
  return okLat && okLng;
}

function applyDestinationPreset(form, preset) {
  if (!preset) return;
  const fields = {
    name: preset.name || "",
    slug: slugify(preset.name || ""),
    type: preset.type || "country",
    continent: preset.continent || "Asia",
    country: preset.country || "",
    lat: preset.lat ?? "",
    lng: preset.lng ?? "",
    badge: preset.badge || "",
    description: preset.description || "",
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = form.elements[key];
    if (!input) return;
    input.value = value;
  });

  validateDestinationCoords(form);
}

function formatRupiahInput(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/[^\d-]/g, "");
  if (!digits) return "";
  const isNegative = digits.startsWith("-");
  const absDigits = digits.replace(/-/g, "");
  const numeric = Number(absDigits);
  if (!Number.isFinite(numeric) || absDigits === "") return raw;
  const formatted = new Intl.NumberFormat("id-ID").format(Math.trunc(numeric));
  return `${isNegative ? "-" : ""}RP ${formatted}`;
}

function normalizePriceField(value) {
  const formatted = formatRupiahInput(value);
  return formatted || "";
}

function thumbCell(url) {
  const src = driveThumb(url, "w200");
  if (!src) return `<span class="list-state" style="padding:0;">—</span>`;
  const fullImage = driveThumb(url, "w2000");
  return `<button type="button" class="image-preview-button table-image-preview" data-full-image="${escAttr(fullImage)}" aria-label="Lihat gambar penuh"><img class="thumb" src="${esc(src)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"></button>`;
}

function expiresCell(expires) {
  if (!expires) return "-";
  const d = new Date(expires);
  const expired = !isNaN(d) && d < new Date(new Date().toDateString());
  return `${esc(expires)}${expired ? '<span class="badge-expired">Kadaluarsa</span>' : ""}`;
}

function isRowExpired(item) {
  if (!item.expires) return false;
  const d = new Date(item.expires);
  return !isNaN(d) && d < new Date(new Date().toDateString());
}

function isImageField(f) {
  return f.type === "image" || f.name === "photo_url";
}

function buildColumns(fields) {
  const cols = [];
  const imgField = fields.find(isImageField);
  if (imgField)
    cols.push({ label: "Gambar", render: (i) => thumbCell(i[imgField.name]) });
  fields.forEach((f) => {
    if (isImageField(f)) return;
    if (f.name === "expires") {
      cols.push({ label: f.label, render: (i) => expiresCell(i.expires) });
      return;
    }
    if (f.name === "rating") {
      cols.push({
        label: f.label,
        render: (i) => "⭐".repeat(Number(i.rating) || 0),
      });
      return;
    }
    if (f.name === "name" || f.name === "title") {
      cols.push({
        label: f.label,
        render: (i) => `<strong>${esc(i[f.name] || "")}</strong>`,
      });
      return;
    }
    if (f.name === "description") {
      cols.push({
        label: f.label,
        render: (i) =>
          `<span class="cell-truncate" title="${escAttr(i[f.name])}">${esc((i[f.name] || "").slice(0, 80))}${(i[f.name] || "").length > 80 ? "…" : ""}</span>`,
      });
      return;
    }
    if (f.type === "textarea" || f.name === "whatsapp_msg") {
      cols.push({
        label: f.label,
        render: (i) =>
          `<span class="cell-truncate" title="${escAttr(i[f.name])}">${esc(i[f.name] || "")}</span>`,
      });
      return;
    }
    cols.push({ label: f.label, render: (i) => esc(i[f.name] ?? "-") });
  });
  return cols;
}

RESOURCES.forEach((r) => {
  r.columns = buildColumns(r.fields);
  r.state = {
    items: [],
    filtered: [],
    page: 1,
    search: "",
    sortKey: "id",
    sortDirection: "desc",
    loaded: false,
    loading: false,
  };
});

function fieldsHtml(fields, idPrefix) {
  return fields
    .map((f) => {
      const req = f.required ? "required" : "";
      const inputId = `${idPrefix}-${f.name}`;
      let control;
      if (f.type === "textarea") {
        control = `<textarea id="${inputId}" name="${f.name}" ${req}></textarea>`;
      } else if (f.type === "select") {
        const opts = [
          ...(f.placeholder
            ? [`<option value="" disabled selected>${esc(f.placeholder)}</option>`]
            : []),
          ...f.options
            .map((o) => `<option value="${esc(o)}">${esc(o)}</option>`),
        ].join("");
        control = `<select id="${inputId}" name="${f.name}" ${req}>${opts}</select>`;
      } else if (f.type === "number") {
        control = `<input id="${inputId}" type="number" name="${f.name}" ${f.min != null ? `min="${f.min}"` : ""} ${f.max != null ? `max="${f.max}"` : ""} ${req}>`;
      } else if (f.type === "image") {
        control = `
        <input id="${inputId}" type="file" name="${f.name}" accept="image/*" data-image-input>
        <div class="form-hint">Maks 5MB · JPG, PNG, atau WebP</div>
        <div class="image-preview" data-image-preview></div>
      `;
      } else if (f.name === "price" || f.name === "price2") {
        control = `<input id="${inputId}" type="text" name="${f.name}" inputmode="numeric" autocomplete="off" data-rupiah-input ${req}>`;
      } else if (f.name === "lat" || f.name === "lng") {
        const axis = f.name === "lat" ? "lat" : "lng";
        const minmax = axis === "lat" ? "-90 sampai 90" : "-180 sampai 180";
        control = `
          <input id="${inputId}" type="text" name="${f.name}" data-coordinate-input="${axis}" ${req}>
          <div class="form-hint" data-coordinate-status="${axis}">Validasi: ${minmax}</div>
        `;
      } else {
        control = `<input id="${inputId}" type="${f.type}" name="${f.name}" ${req}>`;
      }
      const hintHtml = f.hint
        ? `<div class="form-hint">${esc(f.hint)}</div>`
        : "";
      return `<div class="form-group"><label for="${inputId}">${esc(f.label)}</label>${control}${hintHtml}</div>`;
    })
    .join("");
}

function wirePriceFormatting(form) {
  form.querySelectorAll("[data-rupiah-input]").forEach((input) => {
    input.addEventListener("input", () => {
      input.value = formatRupiahInput(input.value);
    });
  });
}

function wireImagePreviews(form) {
  form.querySelectorAll("[data-image-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const preview = input
        .closest(".form-group")
        .querySelector("[data-image-preview]");
      const file = input.files[0];
      preview.innerHTML = "";
      if (!file) return;
      if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES)
        return;
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.dataset.fullImage = img.src;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "image-preview-button";
      button.setAttribute("aria-label", "Lihat gambar penuh");
      button.appendChild(img);
      button.addEventListener("click", () =>
        openImageViewer(img.dataset.fullImage),
      );
      preview.appendChild(button);
    });
  });
}

function wireDestinationSlug(form) {
  const nameField = form.elements.name;
  const slugField = form.elements.slug;
  if (!nameField || !slugField) return;

  const syncSlug = () => {
    if (!slugField.value.trim()) slugField.value = slugify(nameField.value);
  };

  nameField.addEventListener("input", syncSlug);
  slugField.addEventListener("blur", () => {
    if (!slugField.value.trim()) slugField.value = slugify(nameField.value);
  });
  syncSlug();
}

function wireDestinationCoordinateValidation(form) {
  const latInput = form.elements.lat;
  const lngInput = form.elements.lng;
  if (!latInput || !lngInput) return;

  [latInput, lngInput].forEach((input) => {
    input.addEventListener("input", () => {
      validateDestinationCoords(form);
    });
    input.addEventListener("blur", () => {
      validateDestinationCoords(form);
    });
  });

  validateDestinationCoords(form);
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Build tabs ──
const tabsEl = document.getElementById("adminTabs");
const mainEl = document.getElementById("adminMain");

RESOURCES.forEach((r, idx) => {
  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = "admin-tab" + (idx === 0 ? " active" : "");
  tab.dataset.key = r.key;
  tab.id = `tab-${r.key}`;
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-controls", `panel-${r.key}`);
  tab.setAttribute("aria-selected", String(idx === 0));
  tab.tabIndex = idx === 0 ? 0 : -1;
  tab.innerHTML = `${esc(r.label)} <span class="count" id="count-${r.key}"></span>`;
  tab.addEventListener("click", () => activateTab(r.key));
  tab.addEventListener("keydown", (event) => {
    const tabs = [...tabsEl.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(tab);
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex].dataset.key);
  });
  tabsEl.appendChild(tab);
});

function activateTab(key) {
  document
    .querySelectorAll(".admin-tab")
    .forEach((t) => {
      const selected = t.dataset.key === key;
      t.classList.toggle("active", selected);
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
  document
    .querySelectorAll(".admin-panel")
    .forEach((p) => {
      const selected = p.dataset.key === key;
      p.classList.toggle("active", selected);
      p.setAttribute("aria-hidden", String(!selected));
    });
  const r = RESOURCES.find((x) => x.key === key);
  if (r && !r.state.loaded && !r.state.loading) loadList(r);
}

// ── Build panels ──
RESOURCES.forEach((r) => {
  const panel = document.createElement("section");
  panel.className = "admin-panel";
  panel.dataset.key = r.key;
  panel.id = `panel-${r.key}`;
  panel.tabIndex = 0;
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `tab-${r.key}`);
  panel.setAttribute("aria-hidden", String(r.key !== RESOURCES[0].key));

  panel.innerHTML = `
    <div class="panel-grid">
      <div class="panel-form-col">
        <div class="admin-card">
          <h2>Tambah ${esc(r.label)}</h2>
          ${
            r.key === "destinations"
              ? `
                <div class="destination-presets" style="display:flex; flex-wrap:wrap; gap:8px; margin:0 0 16px;">
                  ${DESTINATION_PRESETS.map(
                    (preset) => `
                      <button type="button" class="btn btn-outline btn-sm" data-destination-preset="${esc(preset.name)}">
                        ${esc(preset.name)}
                      </button>
                    `,
                  ).join("")}
                </div>
              `
              : ""
          }
          <form id="form-${r.key}">
            ${fieldsHtml(r.fields, `form-${r.key}`)}
            <button type="submit" class="btn btn-primary">Tambah ${esc(r.label)}</button>
          </form>
          <div id="result-${r.key}" class="results-small" role="status" aria-live="polite"></div>
        </div>
      </div>
      <div class="panel-list-col">
        <div class="admin-card">
          <div class="list-header">
            <h2>Data ${esc(r.label)}</h2>
            <button type="button" class="btn btn-outline btn-sm" data-refresh="${r.key}">🔄 Refresh</button>
          </div>
          <div class="list-search">
            <input type="search" aria-label="Cari ${esc(r.label)}" placeholder="Cari ${esc(r.label).toLowerCase()}..." data-search="${r.key}" inputmode="search">
            <div class="list-sort" aria-label="Urutkan data">
              <label for="sort-${r.key}">Urutkan:</label>
              <select id="sort-${r.key}" data-sort="${r.key}">
                <option value="id">ID</option>
                ${r.fields
                  .filter((f) => !isImageField(f))
                  .map(
                    (f) =>
                      `<option value="${esc(f.name)}">${esc(f.label)}</option>`,
                  )
                  .join("")}
              </select>
              <select data-sort-direction="${r.key}" aria-label="Arah urutan">
                <option value="asc">Naik</option>
                <option value="desc" selected>Turun</option>
              </select>
            </div>
          </div>
          <p class="keyboard-hint" id="table-help-${r.key}">
            Saat tombol baris fokus: ↑/↓ pindah baris, Home/End awal/akhir halaman,
            Ctrl+Home/End awal/akhir daftar, E edit.
          </p>
          <div class="table-wrap">
            <table class="data-table" aria-label="Data ${esc(r.label)}" aria-describedby="table-help-${r.key}">
              <thead><tr>
                <th>ID</th>
                ${r.columns.map((c) => `<th>${esc(c.label)}</th>`).join("")}
                <th scope="col">Aksi</th>
              </tr></thead>
              <tbody id="tbody-${r.key}">
                <tr><td colspan="${r.columns.length + 2}" class="list-state">Buka tab ini untuk memuat data.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-controls" id="pagination-${r.key}" hidden>
            <span class="pagination-info" id="paginfo-${r.key}" aria-live="polite"></span>
            <div class="pagination-btns">
              <button type="button" class="btn btn-outline btn-sm" data-page-first="${r.key}">« Awal</button>
              <button type="button" class="btn btn-outline btn-sm" data-page-prev="${r.key}">‹ Prev</button>
              <button type="button" class="btn btn-outline btn-sm" data-page-next="${r.key}">Next ›</button>
              <button type="button" class="btn btn-outline btn-sm" data-page-last="${r.key}">Akhir »</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  mainEl.appendChild(panel);
});
mainEl.querySelector(".admin-panel").classList.add("active");

// ── Edit modal ──
const editModal = document.createElement("div");
editModal.className = "modal-overlay";
editModal.setAttribute("role", "dialog");
editModal.setAttribute("aria-modal", "true");
editModal.setAttribute("aria-labelledby", "editModalTitle");
editModal.setAttribute("aria-describedby", "editModalKeyboardHelp");
editModal.tabIndex = -1;
editModal.innerHTML = `
  <div class="modal-box">
    <button type="button" class="modal-close" aria-label="Tutup">&times;</button>
    <h2 id="editModalTitle">Edit</h2>
    <p class="keyboard-hint" id="editModalKeyboardHelp">
      Ctrl+Alt+↑/↓ pindah field. Tab/Shift+Tab juga bisa digunakan.
    </p>
    <form id="editForm"></form>
    <div id="editResult" class="results-small"></div>
  </div>
`;
document.body.appendChild(editModal);

const imageViewer = document.createElement("div");
imageViewer.className = "image-viewer-overlay";
imageViewer.setAttribute("role", "dialog");
imageViewer.setAttribute("aria-modal", "true");
imageViewer.setAttribute("aria-label", "Pratinjau gambar penuh");
imageViewer.tabIndex = -1;
imageViewer.innerHTML = `
  <button type="button" class="modal-close image-viewer-close" aria-label="Tutup gambar">&times;</button>
  <img class="image-viewer-image" alt="Pratinjau gambar penuh">
`;
document.body.appendChild(imageViewer);

let editModalReturnFocus = null;
let imageViewerReturnFocus = null;

function restoreFocus(target) {
  if (target?.isConnected && !target.disabled) {
    target.focus();
    return;
  }
  tabsEl.querySelector('[aria-selected="true"]')?.focus();
}

function closeImageViewer() {
  if (!imageViewer.classList.contains("open")) return;
  imageViewer.classList.remove("open");
  imageViewer.querySelector(".image-viewer-image").removeAttribute("src");
  restoreFocus(imageViewerReturnFocus);
  imageViewerReturnFocus = null;
}

function openImageViewer(src) {
  if (!src) return;
  imageViewerReturnFocus = document.activeElement;
  imageViewer.querySelector(".image-viewer-image").src = src;
  imageViewer.classList.add("open");
  setTimeout(() => {
    if (imageViewer.classList.contains("open"))
      imageViewer.querySelector(".image-viewer-close").focus();
  }, 50);
}

imageViewer
  .querySelector(".image-viewer-close")
  .addEventListener("click", closeImageViewer);
imageViewer.addEventListener("click", (e) => {
  if (e.target === imageViewer) closeImageViewer();
});

function closeEditModal() {
  if (!editModal.classList.contains("open")) return;
  editModal.classList.remove("open");
  document.getElementById("editForm").innerHTML = "";
  document.getElementById("editResult").innerHTML = "";
  restoreFocus(editModalReturnFocus);
  editModalReturnFocus = null;
}
editModal
  .querySelector(".modal-close")
  .addEventListener("click", closeEditModal);
editModal.addEventListener("keydown", (e) => {
  if (
    !(e.ctrlKey || e.metaKey) ||
    !e.altKey ||
    !["ArrowUp", "ArrowDown"].includes(e.key)
  )
    return;

  const controls = [
    ...editModal.querySelectorAll(
      '.modal-close, #editForm input:not([type="hidden"]):not([disabled]), #editForm select:not([disabled]), #editForm textarea:not([disabled]), #editForm button:not([disabled])',
    ),
  ].filter((control) => control.getClientRects().length > 0);
  const currentIndex = controls.indexOf(document.activeElement);
  if (currentIndex < 0 || !controls.length) return;

  e.preventDefault();
  const step = e.key === "ArrowDown" ? 1 : -1;
  const nextIndex = (currentIndex + step + controls.length) % controls.length;
  controls[nextIndex].focus();
});
editModal.addEventListener("click", (e) => {
  const imagePreview = e.target.closest("[data-full-image]");
  if (imagePreview && editModal.contains(imagePreview)) {
    openImageViewer(imagePreview.dataset.fullImage);
    return;
  }
  if (e.target === editModal) closeEditModal();
});
document.addEventListener("keydown", (e) => {
  const activeModal = imageViewer.classList.contains("open")
    ? imageViewer
    : editModal.classList.contains("open")
      ? editModal
      : null;
  if (!activeModal) return;

  if (e.key === "Escape") {
    if (activeModal === imageViewer) closeImageViewer();
    else closeEditModal();
    return;
  }

  if (e.key !== "Tab") return;
  const focusable = [
    ...activeModal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.getClientRects().length > 0);
  if (!focusable.length) {
    e.preventDefault();
    activeModal.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (
    e.shiftKey &&
    (document.activeElement === first ||
      !activeModal.contains(document.activeElement))
  ) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || !activeModal.contains(document.activeElement))) {
    e.preventDefault();
    first.focus();
  }
});

function openEditModal(r, item) {
  document.getElementById("editModalTitle").textContent = `Edit ${r.label}`;
  const form = document.getElementById("editForm");
  form.innerHTML =
    fieldsHtml(r.fields, "editForm") +
    `<button type="submit" class="btn btn-primary">Simpan Perubahan</button>`;

  r.fields.forEach((f) => {
    if (f.type === "image") return;
    const el = form.elements[f.name];
    if (!el) return;
    el.value =
      f.name === "price" || f.name === "price2"
        ? normalizePriceField(item[f.name] ?? "")
        : (item[f.name] ?? "");
  });

  const imgField = r.fields.find((f) => f.type === "image");
  if (imgField) {
    const current = item[imgField.name];
    const preview = form.querySelector("[data-image-preview]");
    if (preview && current) {
      const fullImage = escAttr(driveThumb(current, "w2000"));
      preview.innerHTML = `<button type="button" class="image-preview-button" data-full-image="${fullImage}" aria-label="Lihat gambar penuh"><img src="${esc(driveThumb(current, "w200"))}" alt="" loading="lazy"></button>`;
    }
  }

  wirePriceFormatting(form);
  wireImagePreviews(form);
  wireDestinationSlug(form);
  wireDestinationCoordinateValidation(form);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;

    const data = {};
    try {
      for (const f of r.fields) {
        if (f.type === "image") {
          const file = form.elements[f.name].files[0];
          if (file) {
            if (!file.type.startsWith("image/"))
              throw new Error(`${f.label}: file harus berupa gambar.`);
            if (file.size > MAX_IMAGE_BYTES)
              throw new Error(`${f.label}: ukuran maksimal 5MB.`);
            submitBtn.textContent = "Mengunggah gambar...";
            data[f.name] = await uploadImage(file);
          }
          continue;
        }
        let v = form.elements[f.name].value;
        if (typeof v === "string") v = v.trim();
        if (f.type === "number" && v !== "") v = Number(v);
        if ((f.name === "price" || f.name === "price2") && v !== "")
          v = normalizePriceField(v);
        data[f.name] = v;
      }

      if (r.key === "destinations" && !validateDestinationCoords(form)) {
        throw new Error("Latitude dan longitude harus valid sebelum disimpan.");
      }

      submitBtn.textContent = "Menyimpan...";
      await apiFetch(`${r.endpoint}/${item.id}`, { method: "PUT", body: data });
      closeEditModal();
      loadList(r, { force: true, preservePage: true });
    } catch (err) {
      document.getElementById("editResult").innerHTML =
        `<div class="result-error" style="padding:8px; border-radius:4px; font-size:12px; background:rgba(239,68,68,0.1); color:#ef4444;">❌ Error: ${esc(err.message)}</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  };

  editModalReturnFocus = document.activeElement;
  editModal.classList.add("open");
  setTimeout(() => {
    if (editModal.classList.contains("open"))
      form.querySelector("input, select, textarea, button")?.focus();
  }, 50);
}

// ── Wire up add forms, search, pagination, refresh, edit/delete ──
RESOURCES.forEach((r) => {
  const form = document.getElementById(`form-${r.key}`);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;

    const data = {};
    try {
      if (r.key === "destinations" && !validateDestinationCoords(form)) {
        throw new Error("Latitude dan longitude harus valid sebelum disimpan.");
      }

      for (const f of r.fields) {
        if (f.type === "image") {
          const fileInput = form.elements[f.name];
          const file = fileInput.files[0];
          if (!file) {
            if (f.required) throw new Error(`${f.label} wajib diisi.`);
            continue;
          }
          if (!file.type.startsWith("image/"))
            throw new Error(`${f.label}: file harus berupa gambar.`);
          if (file.size > MAX_IMAGE_BYTES)
            throw new Error(`${f.label}: ukuran maksimal 5MB.`);
          submitBtn.textContent = "Mengunggah gambar...";
          data[f.name] = await uploadImage(file);
          continue;
        }
        let v = form.elements[f.name].value;
        if (typeof v === "string") v = v.trim();
        if (f.type === "number" && v !== "") v = Number(v);
        if ((f.name === "price" || f.name === "price2") && v !== "")
          v = normalizePriceField(v);
        if (v !== "") data[f.name] = v;
      }

      submitBtn.textContent = "Menyimpan...";
      const result = await apiFetch(r.endpoint, { method: "POST", body: data });
      showResult(
        r.key,
        `✅ ${r.label} ditambahkan (ID: ${result.id})`,
        "success",
      );
      form.reset();
      form
        .querySelectorAll("[data-image-preview]")
        .forEach((el) => (el.innerHTML = ""));
      loadList(r, { force: true });
    } catch (err) {
      showResult(r.key, `❌ Error: ${err.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  wirePriceFormatting(form);
  wireImagePreviews(form);
  wireDestinationSlug(form);
  wireDestinationCoordinateValidation(form);

  if (r.key === "destinations") {
    document.querySelectorAll("[data-destination-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = DESTINATION_PRESETS.find(
          (item) => item.name === btn.dataset.destinationPreset,
        );
        applyDestinationPreset(form, preset);
      });
    });
  }

  document
    .querySelector(`[data-refresh="${r.key}"]`)
    .addEventListener("click", () => loadList(r, { force: true }));

  const searchInput = document.querySelector(`[data-search="${r.key}"]`);
  searchInput.addEventListener(
    "input",
    debounce(() => {
      r.state.search = searchInput.value.trim().toLowerCase();
      r.state.page = 1;
      renderTable(r);
    }, 250),
  );

  const sortInput = document.querySelector(`[data-sort="${r.key}"]`);
  const sortDirectionInput = document.querySelector(
    `[data-sort-direction="${r.key}"]`,
  );
  sortInput.addEventListener("change", () => {
    r.state.sortKey = sortInput.value;
    r.state.page = 1;
    renderTable(r);
  });
  sortDirectionInput.addEventListener("change", () => {
    r.state.sortDirection = sortDirectionInput.value;
    r.state.page = 1;
    renderTable(r);
  });

  document
    .querySelector(`[data-page-first="${r.key}"]`)
    .addEventListener("click", () => {
      if (r.state.page > 1) {
        r.state.page = 1;
        renderTable(r);
      }
    });
  document
    .querySelector(`[data-page-prev="${r.key}"]`)
    .addEventListener("click", () => {
      if (r.state.page > 1) {
        r.state.page--;
        renderTable(r);
      }
    });
  document
    .querySelector(`[data-page-next="${r.key}"]`)
    .addEventListener("click", () => {
      const totalPages = Math.max(
        1,
        Math.ceil(r.state.filtered.length / PAGE_SIZE),
      );
      if (r.state.page < totalPages) {
        r.state.page++;
        renderTable(r);
      }
    });
  document
    .querySelector(`[data-page-last="${r.key}"]`)
    .addEventListener("click", () => {
      const totalPages = Math.max(
        1,
        Math.ceil(r.state.filtered.length / PAGE_SIZE),
      );
      if (r.state.page !== totalPages) {
        r.state.page = totalPages;
        renderTable(r);
      }
    });

  const tbody = document.getElementById(`tbody-${r.key}`);
  tbody.addEventListener("keydown", (e) => {
    const control = e.target.closest(
      "[data-edit], [data-delete], [data-full-image]",
    );
    if (
      !control ||
      e.altKey ||
      ((e.ctrlKey || e.metaKey) && !["Home", "End"].includes(e.key))
    )
      return;

    const rows = [...tbody.querySelectorAll("tr")].filter((row) =>
      row.querySelector("[data-edit]"),
    );
    const currentRow = control.closest("tr");
    const currentIndex = rows.indexOf(currentRow);
    if (currentIndex < 0) return;

    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      currentRow.querySelector("[data-edit]")?.click();
      return;
    }

    const totalPages = Math.max(
      1,
      Math.ceil(r.state.filtered.length / PAGE_SIZE),
    );
    let targetPage = r.state.page;
    let targetIndex = currentIndex;
    if (e.key === "ArrowDown") {
      if (currentIndex < rows.length - 1) targetIndex++;
      else if (targetPage < totalPages) {
        targetPage++;
        targetIndex = 0;
      }
    } else if (e.key === "ArrowUp") {
      if (currentIndex > 0) targetIndex--;
      else if (targetPage > 1) {
        targetPage--;
        targetIndex = PAGE_SIZE - 1;
      }
    } else if (e.key === "Home") {
      targetPage = e.ctrlKey || e.metaKey ? 1 : targetPage;
      targetIndex = 0;
    } else if (e.key === "End") {
      if (e.ctrlKey || e.metaKey) targetPage = totalPages;
      targetIndex = rows.length - 1;
    } else return;

    e.preventDefault();
    const selector = control.matches("[data-delete]")
      ? "[data-delete]"
      : control.matches("[data-full-image]")
        ? "[data-full-image]"
        : "[data-edit]";
    if (targetPage !== r.state.page) {
      r.state.page = targetPage;
      renderTable(r);
    }

    const targetRows = [...tbody.querySelectorAll("tr")].filter((row) =>
      row.querySelector("[data-edit]"),
    );
    const targetRow = targetRows[Math.min(targetIndex, targetRows.length - 1)];
    (targetRow?.querySelector(selector) ||
      targetRow?.querySelector("[data-edit]"))?.focus();
  });

  tbody.addEventListener("click", async (e) => {
    const imagePreview = e.target.closest("[data-full-image]");
    if (imagePreview) {
      openImageViewer(imagePreview.dataset.fullImage);
      return;
    }

    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      const id = Number(editBtn.dataset.edit);
      const item = r.state.items.find((it) => it.id === id);
      if (item) openEditModal(r, item);
      return;
    }

    const btn = e.target.closest("[data-delete]");
    if (!btn) return;
    const id = btn.dataset.delete;
    const label = btn.dataset.label || `#${id}`;
    if (!confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    btn.disabled = true;
    btn.textContent = "Menghapus...";
    try {
      await apiFetch(`${r.endpoint}/${id}`, { method: "DELETE" });
      loadList(r, { force: true, preservePage: true });
    } catch (err) {
      alert(`Gagal menghapus: ${err.message}`);
      btn.disabled = false;
      btn.textContent = "🗑️ Hapus";
    }
  });
});

function showResult(key, message, type) {
  const container = document.getElementById(`result-${key}`);
  container.innerHTML = `<div class="result-${type}" style="padding:8px; margin-top:8px; border-radius:4px; font-size:12px; ${type === "success" ? "background:rgba(34,197,94,0.1); color:#16a34a;" : "background:rgba(239,68,68,0.1); color:#ef4444;"}">${esc(message)}</div>`;
  setTimeout(() => {
    container.innerHTML = "";
  }, 5000);
}

async function loadList(r, { force = false, preservePage = false } = {}) {
  if (r.state.loading) return;
  if (r.state.loaded && !force) {
    renderTable(r);
    return;
  }

  const tbody = document.getElementById(`tbody-${r.key}`);
  const colspan = r.columns.length + 2;
  r.state.loading = true;
  tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">Memuat...</td></tr>`;

  try {
    const path = r.endpoint + (r.listAll ? "?all=1" : "");
    const items = await apiFetch(path);
    r.state.items = items;
    r.state.loaded = true;
    if (!preservePage) r.state.page = 1;
    document.getElementById(`count-${r.key}`).textContent = items.length
      ? `(${items.length})`
      : "";
    renderTable(r);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">❌ Gagal memuat: ${esc(err.message)}</td></tr>`;
  } finally {
    r.state.loading = false;
  }
}

function renderTable(r) {
  const tbody = document.getElementById(`tbody-${r.key}`);
  const colspan = r.columns.length + 2;
  const paginationEl = document.getElementById(`pagination-${r.key}`);
  const paginfoEl = document.getElementById(`paginfo-${r.key}`);

  const q = r.state.search;
  r.state.filtered = q
    ? r.state.items.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(q),
      )
    : r.state.items;

  const direction = r.state.sortDirection === "desc" ? -1 : 1;
  const sortField = r.fields.find((f) => f.name === r.state.sortKey);
  const numericSort =
    r.state.sortKey === "id" ||
    sortField?.type === "number" ||
    sortField?.name === "price" ||
    sortField?.name === "price2";
  r.state.filtered = [...r.state.filtered].sort((left, right) => {
    const leftValue = left[r.state.sortKey];
    const rightValue = right[r.state.sortKey];
    if (leftValue == null || leftValue === "")
      return rightValue == null || rightValue === "" ? 0 : 1;
    if (rightValue == null || rightValue === "") return -1;

    const leftNumber = Number(String(leftValue).replace(/[^\d-]/g, ""));
    const rightNumber = Number(String(rightValue).replace(/[^\d-]/g, ""));
    if (
      numericSort &&
      Number.isFinite(leftNumber) &&
      Number.isFinite(rightNumber)
    ) {
      return (leftNumber - rightNumber) * direction;
    }
    return (
      String(leftValue).localeCompare(String(rightValue), "id", {
        numeric: true,
        sensitivity: "base",
      }) * direction
    );
  });

  const totalItems = r.state.filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  r.state.page = Math.min(Math.max(1, r.state.page), totalPages);

  if (!totalItems) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">${q ? "Tidak ada hasil pencarian." : "Belum ada data."}</td></tr>`;
    paginationEl.hidden = true;
    return;
  }

  const start = (r.state.page - 1) * PAGE_SIZE;
  const pageItems = r.state.filtered.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = pageItems
    .map(
      (item) => `
    <tr class="${isRowExpired(item) ? "expired-row" : ""}">
      <td class="col-id" data-label="ID">${esc(item.id)}</td>
      ${r.columns.map((c) => `<td data-label="${esc(c.label)}">${c.render(item)}</td>`).join("")}
      <td class="col-actions" data-label="Aksi">
        <button type="button" class="btn btn-action btn-edit" data-edit="${item.id}" aria-label="Edit ${escAttr(item.name || item.title || item.text || "#" + item.id)}">
          <span aria-hidden="true">✏️</span><span>Edit</span>
        </button>
        <button type="button" class="btn btn-action btn-delete" data-delete="${item.id}" data-label="${escAttr(item.name || item.title || item.text || "#" + item.id)}" aria-label="Hapus ${escAttr(item.name || item.title || item.text || "#" + item.id)}">
          <span aria-hidden="true">🗑️</span><span>Delete</span>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");

  paginationEl.hidden = false;
  paginfoEl.textContent = `Halaman ${r.state.page} / ${totalPages} • ${start + 1}–${Math.min(start + PAGE_SIZE, totalItems)} dari ${totalItems}${q ? ` (disaring dari ${r.state.items.length})` : ""}`;
  document.querySelector(`[data-page-first="${r.key}"]`).disabled =
    r.state.page <= 1;
  document.querySelector(`[data-page-prev="${r.key}"]`).disabled =
    r.state.page <= 1;
  document.querySelector(`[data-page-next="${r.key}"]`).disabled =
    r.state.page >= totalPages;
  document.querySelector(`[data-page-last="${r.key}"]`).disabled =
    r.state.page >= totalPages;
}

// ── Initial load ──
const apiStatus = document.getElementById("apiStatus");
function setApiStatus(isConnected) {
  apiStatus.textContent = isConnected
    ? "✅ API Terhubung"
    : "❌ API Tidak Tersambung";
  apiStatus.style.color = isConnected ? "#22c55e" : "#ef4444";
}

fetch(`${workerUrl}/health`)
  .then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  })
  .then(() => setApiStatus(true))
  .catch(() => setApiStatus(false));

loadList(RESOURCES[0]);
