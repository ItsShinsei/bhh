/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Admin Dashboard Logic
   Data-driven: one RESOURCES config drives the
   forms, tables, and add/delete behaviour for
   every D1 table. To add a new manageable table,
   add one entry to RESOURCES — nothing else to
   touch in this file.
   ═══════════════════════════════════════════ */

import { API_BASE, driveThumb } from './config.js';

const workerUrl = API_BASE.replace(/\/api$/, '');

// ── Image upload config ──
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

// Uploads a File to the Worker's R2-backed /api/upload route.
// Returns the public R2 URL on success, throws on failure.
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload gagal (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.url;
}

// ── Resource configuration ──
// fields  → drives the "add new" form
// columns → drives the data table (render(item) returns HTML string)
// listAll → append ?all=1 so expired items still show up for admin
const RESOURCES = [
  {
    key: 'domestik', label: 'Domestik', endpoint: '/api/domestik', listAll: true,
    fields: [
      { name: 'province', label: 'Provinsi', type: 'text', required: true },
      { name: 'city', label: 'Kota', type: 'text', required: true },
      { name: 'name', label: 'Nama Paket', type: 'text', required: true },
      { name: 'duration', label: 'Durasi', type: 'text' },
      { name: 'price', label: 'Harga', type: 'text' },
      { name: 'price2', label: 'Harga Coret (opsional)', type: 'text' },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'image_url', label: 'Gambar', type: 'image' },
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'whatsapp_msg', label: 'WhatsApp Msg', type: 'text' },
      { name: 'expires', label: 'Kadaluarsa (opsional)', type: 'date' },
    ],
    columns: [
      { label: 'Gambar', render: i => thumbCell(i.image_url) },
      { label: 'Nama', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Lokasi', render: i => esc([i.city, i.province].filter(Boolean).join(', ')) },
      { label: 'Harga', render: i => esc(i.price || '-') },
      { label: 'Expires', render: i => expiresCell(i.expires) },
    ],
  },
  {
    key: 'inter', label: 'Inter', endpoint: '/api/inter', listAll: true,
    fields: [
      { name: 'country', label: 'Negara', type: 'text', required: true },
      { name: 'city', label: 'Kota', type: 'text', required: true },
      { name: 'name', label: 'Nama Paket', type: 'text', required: true },
      { name: 'duration', label: 'Durasi', type: 'text' },
      { name: 'price', label: 'Harga', type: 'text' },
      { name: 'price2', label: 'Harga Coret (opsional)', type: 'text' },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'image_url', label: 'Gambar', type: 'image' },
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'whatsapp_msg', label: 'WhatsApp Msg', type: 'text' },
      { name: 'expires', label: 'Kadaluarsa (opsional)', type: 'date' },
    ],
    columns: [
      { label: 'Gambar', render: i => thumbCell(i.image_url) },
      { label: 'Nama', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Lokasi', render: i => esc([i.city, i.country].filter(Boolean).join(', ')) },
      { label: 'Harga', render: i => esc(i.price || '-') },
      { label: 'Expires', render: i => expiresCell(i.expires) },
    ],
  },
  {
    key: 'cruise', label: 'Cruise', endpoint: '/api/cruise', listAll: true,
    fields: [
      { name: 'route', label: 'Rute', type: 'text', required: true },
      { name: 'name', label: 'Nama Paket', type: 'text', required: true },
      { name: 'duration', label: 'Durasi', type: 'text' },
      { name: 'price', label: 'Harga', type: 'text' },
      { name: 'price2', label: 'Harga Coret (opsional)', type: 'text' },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'image_url', label: 'Gambar', type: 'image' },
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'whatsapp_msg', label: 'WhatsApp Msg', type: 'text' },
      { name: 'expires', label: 'Kadaluarsa (opsional)', type: 'date' },
    ],
    columns: [
      { label: 'Gambar', render: i => thumbCell(i.image_url) },
      { label: 'Nama', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Rute', render: i => esc(i.route || '-') },
      { label: 'Harga', render: i => esc(i.price || '-') },
      { label: 'Expires', render: i => expiresCell(i.expires) },
    ],
  },
  {
    key: 'umroh', label: 'Umroh', endpoint: '/api/umroh', listAll: true,
    fields: [
      { name: 'package_type', label: 'Tipe', type: 'select', required: true, options: ['Reguler', 'Plus', 'Premium'] },
      { name: 'name', label: 'Nama Paket', type: 'text', required: true },
      { name: 'duration', label: 'Durasi', type: 'text' },
      { name: 'price', label: 'Harga', type: 'text' },
      { name: 'price2', label: 'Harga Coret (opsional)', type: 'text' },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'image_url', label: 'Gambar', type: 'image' },
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'whatsapp_msg', label: 'WhatsApp Msg', type: 'text' },
      { name: 'expires', label: 'Kadaluarsa (opsional)', type: 'date' },
    ],
    columns: [
      { label: 'Gambar', render: i => thumbCell(i.image_url) },
      { label: 'Nama', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Tipe', render: i => esc(i.package_type || '-') },
      { label: 'Harga', render: i => esc(i.price || '-') },
      { label: 'Expires', render: i => expiresCell(i.expires) },
    ],
  },
  {
    key: 'offers', label: 'Promo', endpoint: '/api/offers', listAll: true,
    fields: [
      { name: 'name', label: 'Nama Promo', type: 'text', required: true },
      { name: 'description', label: 'Deskripsi', type: 'textarea' },
      { name: 'image_url', label: 'Gambar', type: 'image' },
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'whatsapp_msg', label: 'WhatsApp Msg', type: 'text' },
      { name: 'expires', label: 'Kadaluarsa (opsional)', type: 'date' },
    ],
    columns: [
      { label: 'Gambar', render: i => thumbCell(i.image_url) },
      { label: 'Nama', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Badge', render: i => esc(i.badge || '-') },
      { label: 'Expires', render: i => expiresCell(i.expires) },
    ],
  },
  {
    key: 'reviews', label: 'Ulasan', endpoint: '/api/reviews', listAll: false,
    fields: [
      { name: 'name', label: 'Nama Pelanggan', type: 'text', required: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, required: true },
      { name: 'text', label: 'Ulasan', type: 'textarea', required: true },
      { name: 'photo_url', label: 'Photo URL (opsional)', type: 'text' },
    ],
    columns: [
      { label: 'Nama', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Rating', render: i => '⭐'.repeat(Number(i.rating) || 0) },
      { label: 'Ulasan', render: i => `<span class="cell-truncate" title="${escAttr(i.text)}">${esc(i.text || '')}</span>` },
    ],
  },
  {
    key: 'gallery', label: 'Galeri', endpoint: '/api/gallery', listAll: false,
    fields: [
      { name: 'title', label: 'Judul', type: 'text', required: true },
      { name: 'category', label: 'Kategori', type: 'select', required: true, options: ['domestik', 'inter', 'cruise', 'umroh'] },
      { name: 'image_url', label: 'Gambar', type: 'image', required: true },
    ],
    columns: [
      { label: 'Gambar', render: i => thumbCell(i.image_url) },
      { label: 'Judul', render: i => `<strong>${esc(i.title)}</strong>` },
      { label: 'Kategori', render: i => esc(i.category || '-') },
    ],
  },
];

// ── Helpers ──
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escAttr(s) { return esc(s).replace(/\n/g, ' '); }

function thumbCell(url) {
  const src = driveThumb(url, 'w200');
  if (!src) return `<span class="list-state" style="padding:0;">—</span>`;
  return `<img class="thumb" src="${esc(src)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`;
}

function expiresCell(expires) {
  if (!expires) return '-';
  const d = new Date(expires);
  const expired = !isNaN(d) && d < new Date(new Date().toDateString());
  return `${esc(expires)}${expired ? '<span class="badge-expired">Kadaluarsa</span>' : ''}`;
}

function isRowExpired(item) {
  if (!item.expires) return false;
  const d = new Date(item.expires);
  return !isNaN(d) && d < new Date(new Date().toDateString());
}

// ── API helper ──
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Build tabs ──
const tabsEl = document.getElementById('adminTabs');
const mainEl = document.getElementById('adminMain');

RESOURCES.forEach((r, idx) => {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'admin-tab' + (idx === 0 ? ' active' : '');
  tab.dataset.key = r.key;
  tab.innerHTML = `${esc(r.label)} <span class="count" id="count-${r.key}"></span>`;
  tab.addEventListener('click', () => activateTab(r.key));
  tabsEl.appendChild(tab);
});

function activateTab(key) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.key === key));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.dataset.key === key));
}

// ── Build panels ──
RESOURCES.forEach(r => {
  const panel = document.createElement('section');
  panel.className = 'admin-panel';
  panel.dataset.key = r.key;

  const formFieldsHtml = r.fields.map(f => {
    const req = f.required ? 'required' : '';
    let control;
    if (f.type === 'textarea') {
      control = `<textarea name="${f.name}" ${req}></textarea>`;
    } else if (f.type === 'select') {
      const opts = f.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
      control = `<select name="${f.name}" ${req}>${opts}</select>`;
    } else if (f.type === 'number') {
      control = `<input type="number" name="${f.name}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} ${req}>`;
    } else if (f.type === 'image') {
      control = `
        <input type="file" name="${f.name}" accept="image/*" data-image-input>
        <div class="form-hint">Maks 5MB · JPG, PNG, atau WebP</div>
        <div class="image-preview" data-image-preview></div>
      `;
    } else {
      control = `<input type="${f.type}" name="${f.name}" ${req}>`;
    }
    return `<div class="form-group"><label>${esc(f.label)}</label>${control}</div>`;
  }).join('');

  panel.innerHTML = `
    <div class="panel-grid">
      <div class="panel-form-col">
        <div class="admin-card">
          <h2>Tambah ${esc(r.label)}</h2>
          <form id="form-${r.key}">
            ${formFieldsHtml}
            <button type="submit" class="btn btn-primary">Tambah ${esc(r.label)}</button>
          </form>
          <div id="result-${r.key}" class="results-small"></div>
        </div>
      </div>
      <div class="panel-list-col">
        <div class="admin-card">
          <div class="list-header">
            <h2>Data ${esc(r.label)}</h2>
            <button type="button" class="btn btn-outline btn-sm" data-refresh="${r.key}">🔄 Refresh</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>
                <th>ID</th>
                ${r.columns.map(c => `<th>${esc(c.label)}</th>`).join('')}
                <th></th>
              </tr></thead>
              <tbody id="tbody-${r.key}">
                <tr><td colspan="${r.columns.length + 2}" class="list-state">Memuat...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  mainEl.appendChild(panel);
});
mainEl.querySelector('.admin-panel').classList.add('active');

// ── Wire up forms + refresh buttons + delete (delegated) ──
RESOURCES.forEach(r => {
  const form = document.getElementById(`form-${r.key}`);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;

    const data = {};
    try {
      for (const f of r.fields) {
        if (f.type === 'image') {
          const fileInput = form.elements[f.name];
          const file = fileInput.files[0];

          if (!file) {
            if (f.required) throw new Error(`${f.label} wajib diisi.`);
            continue;
          }
          if (!file.type.startsWith('image/')) {
            throw new Error(`${f.label}: file harus berupa gambar.`);
          }
          if (file.size > MAX_IMAGE_BYTES) {
            throw new Error(`${f.label}: ukuran maksimal 5MB.`);
          }

          submitBtn.textContent = 'Mengunggah gambar...';
          data[f.name] = await uploadImage(file);
          continue;
        }

        let v = form.elements[f.name].value;
        if (typeof v === 'string') v = v.trim();
        if (f.type === 'number' && v !== '') v = Number(v);
        if (v !== '') data[f.name] = v;
      }

      submitBtn.textContent = 'Menyimpan...';
      const result = await apiFetch(r.endpoint, { method: 'POST', body: data });
      showResult(r.key, `✅ ${r.label} ditambahkan (ID: ${result.id})`, 'success');
      form.reset();
      form.querySelectorAll('[data-image-preview]').forEach(el => el.innerHTML = '');
      loadList(r);
    } catch (err) {
      showResult(r.key, `❌ Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  // Live thumbnail preview when an admin picks a file, before upload happens
  form.querySelectorAll('[data-image-input]').forEach(input => {
    input.addEventListener('change', () => {
      const preview = input.closest('.form-group').querySelector('[data-image-preview]');
      const file = input.files[0];
      preview.innerHTML = '';
      if (!file) return;
      if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) return; // errors surface on submit
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);
      preview.appendChild(img);
    });
  });

  document.querySelector(`[data-refresh="${r.key}"]`).addEventListener('click', () => loadList(r));

  document.getElementById(`tbody-${r.key}`).addEventListener('click', async e => {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const id = btn.dataset.delete;
    const label = btn.dataset.label || `#${id}`;
    if (!confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    btn.disabled = true;
    btn.textContent = 'Menghapus...';
    try {
      await apiFetch(`${r.endpoint}/${id}`, { method: 'DELETE' });
      loadList(r);
    } catch (err) {
      alert(`Gagal menghapus: ${err.message}`);
      btn.disabled = false;
      btn.textContent = '🗑️ Hapus';
    }
  });
});

function showResult(key, message, type) {
  const container = document.getElementById(`result-${key}`);
  container.innerHTML = `<div class="result-${type}" style="padding:8px; margin-top:8px; border-radius:4px; font-size:12px; ${type === 'success' ? 'background:rgba(34,197,94,0.1); color:#16a34a;' : 'background:rgba(239,68,68,0.1); color:#ef4444;'}">${esc(message)}</div>`;
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

async function loadList(r) {
  const tbody = document.getElementById(`tbody-${r.key}`);
  const colspan = r.columns.length + 2;
  try {
    const path = r.endpoint + (r.listAll ? '?all=1' : '');
    const items = await apiFetch(path);
    document.getElementById(`count-${r.key}`).textContent = items.length ? `(${items.length})` : '';
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">Belum ada data.</td></tr>`;
      return;
    }
    tbody.innerHTML = items.map(item => `
      <tr class="${isRowExpired(item) ? 'expired-row' : ''}">
        <td class="col-id">${esc(item.id)}</td>
        ${r.columns.map(c => `<td>${c.render(item)}</td>`).join('')}
        <td class="col-actions">
          <button type="button" class="btn btn-danger" data-delete="${item.id}" data-label="${escAttr(item.name || item.title || item.text || ('#' + item.id))}">🗑️ Hapus</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">❌ Gagal memuat: ${esc(err.message)}</td></tr>`;
  }
}

// ── Initial load ──
const apiStatus = document.getElementById('apiStatus');
function setApiStatus(isConnected) {
  apiStatus.textContent = isConnected ? '✅ API Terhubung' : '❌ API Tidak Tersambung';
  apiStatus.style.color = isConnected ? '#22c55e' : '#ef4444';
}

fetch(`${workerUrl}/health`)
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => setApiStatus(true))
  .catch(() => setApiStatus(false));

RESOURCES.forEach(loadList);