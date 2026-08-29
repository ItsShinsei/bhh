/* ═══════════════════════════════════════════
   Bee Happy Holiday v2 — Admin Dashboard Logic
   Data-driven RESOURCES config drives forms,
   tables, and add/edit/delete for every D1 table.
   Mobile-first: lazy tab loading, pagination,
   search, and card-style rows on small screens.
   ═══════════════════════════════════════════ */

import { API_BASE, driveThumb } from './config.js';

const workerUrl = API_BASE.replace(/\/api$/, '');
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const PAGE_SIZE = 15;

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

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Resource configuration ──
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
  },
  {
    key: 'reviews', label: 'Ulasan', endpoint: '/api/reviews', listAll: false,
    fields: [
      { name: 'name', label: 'Nama Pelanggan', type: 'text', required: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, required: true },
      { name: 'text', label: 'Ulasan', type: 'textarea', required: true },
      { name: 'photo_url', label: 'Photo URL (opsional)', type: 'text' },
    ],
  },
  {
    key: 'gallery', label: 'Galeri', endpoint: '/api/gallery', listAll: false,
    fields: [
      { name: 'title', label: 'Judul', type: 'text', required: true },
      { name: 'category', label: 'Kategori', type: 'select', required: true, options: ['domestik', 'inter', 'cruise', 'umroh'] },
      { name: 'image_url', label: 'Gambar', type: 'image', required: true },
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

function isImageField(f) {
  return f.type === 'image' || f.name === 'photo_url';
}

// Builds table columns from `fields` — every field is visible except raw
// image URLs, which render as a thumbnail instead.
function buildColumns(fields) {
  const cols = [];
  const imgField = fields.find(isImageField);
  if (imgField) cols.push({ label: 'Gambar', render: i => thumbCell(i[imgField.name]) });
  fields.forEach(f => {
    if (isImageField(f)) return;
    if (f.name === 'expires') { cols.push({ label: f.label, render: i => expiresCell(i.expires) }); return; }
    if (f.name === 'rating')  { cols.push({ label: f.label, render: i => '⭐'.repeat(Number(i.rating) || 0) }); return; }
    if (f.name === 'name' || f.name === 'title') {
      cols.push({ label: f.label, render: i => `<strong>${esc(i[f.name] || '')}</strong>` }); return;
    }
    if (f.type === 'textarea' || f.name === 'whatsapp_msg') {
      cols.push({ label: f.label, render: i => `<span class="cell-truncate" title="${escAttr(i[f.name])}">${esc(i[f.name] || '')}</span>` }); return;
    }
    cols.push({ label: f.label, render: i => esc(i[f.name] || '-') });
  });
  return cols;
}

RESOURCES.forEach(r => {
  r.columns = buildColumns(r.fields);
  // Per-resource UI state: lazy-loaded items, pagination, search
  r.state = { items: [], filtered: [], page: 1, search: '', loaded: false, loading: false };
});

function fieldsHtml(fields) {
  return fields.map(f => {
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
}

function wireImagePreviews(form) {
  form.querySelectorAll('[data-image-input]').forEach(input => {
    input.addEventListener('change', () => {
      const preview = input.closest('.form-group').querySelector('[data-image-preview]');
      const file = input.files[0];
      preview.innerHTML = '';
      if (!file) return;
      if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) return;
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);
      preview.appendChild(img);
    });
  });
}

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
  const r = RESOURCES.find(x => x.key === key);
  if (r && !r.state.loaded && !r.state.loading) loadList(r);
}

// ── Build panels ──
RESOURCES.forEach(r => {
  const panel = document.createElement('section');
  panel.className = 'admin-panel';
  panel.dataset.key = r.key;

  panel.innerHTML = `
    <div class="panel-grid">
      <div class="panel-form-col">
        <div class="admin-card">
          <h2>Tambah ${esc(r.label)}</h2>
          <form id="form-${r.key}">
            ${fieldsHtml(r.fields)}
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
          <div class="list-search">
            <input type="search" placeholder="Cari ${esc(r.label).toLowerCase()}..." data-search="${r.key}" inputmode="search">
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>
                <th>ID</th>
                ${r.columns.map(c => `<th>${esc(c.label)}</th>`).join('')}
                <th></th>
              </tr></thead>
              <tbody id="tbody-${r.key}">
                <tr><td colspan="${r.columns.length + 2}" class="list-state">Buka tab ini untuk memuat data.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-controls" id="pagination-${r.key}" hidden>
            <span class="pagination-info" id="paginfo-${r.key}"></span>
            <div class="pagination-btns">
              <button type="button" class="btn btn-outline btn-sm" data-page-prev="${r.key}">‹ Prev</button>
              <button type="button" class="btn btn-outline btn-sm" data-page-next="${r.key}">Next ›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  mainEl.appendChild(panel);
});
mainEl.querySelector('.admin-panel').classList.add('active');

// ── Edit modal ──
const editModal = document.createElement('div');
editModal.className = 'modal-overlay';
editModal.innerHTML = `
  <div class="modal-box">
    <button type="button" class="modal-close" aria-label="Tutup">&times;</button>
    <h2 id="editModalTitle">Edit</h2>
    <form id="editForm"></form>
    <div id="editResult" class="results-small"></div>
  </div>
`;
document.body.appendChild(editModal);

function closeEditModal() {
  editModal.classList.remove('open');
  document.getElementById('editForm').innerHTML = '';
  document.getElementById('editResult').innerHTML = '';
}
editModal.querySelector('.modal-close').addEventListener('click', closeEditModal);
editModal.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && editModal.classList.contains('open')) closeEditModal(); });

function openEditModal(r, item) {
  document.getElementById('editModalTitle').textContent = `Edit ${r.label}`;
  const form = document.getElementById('editForm');
  form.innerHTML = fieldsHtml(r.fields) + `<button type="submit" class="btn btn-primary">Simpan Perubahan</button>`;

  r.fields.forEach(f => {
    if (f.type === 'image') return;
    const el = form.elements[f.name];
    if (el) el.value = item[f.name] ?? '';
  });

  const imgField = r.fields.find(f => f.type === 'image');
  if (imgField) {
    const current = item[imgField.name];
    const preview = form.querySelector('[data-image-preview]');
    if (preview && current) preview.innerHTML = `<img src="${esc(driveThumb(current, 'w200'))}" alt="">`;
  }

  wireImagePreviews(form);

  form.onsubmit = async e => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;

    const data = {};
    try {
      for (const f of r.fields) {
        if (f.type === 'image') {
          const file = form.elements[f.name].files[0];
          if (file) {
            if (!file.type.startsWith('image/')) throw new Error(`${f.label}: file harus berupa gambar.`);
            if (file.size > MAX_IMAGE_BYTES) throw new Error(`${f.label}: ukuran maksimal 5MB.`);
            submitBtn.textContent = 'Mengunggah gambar...';
            data[f.name] = await uploadImage(file);
          }
          continue;
        }
        let v = form.elements[f.name].value;
        if (typeof v === 'string') v = v.trim();
        if (f.type === 'number' && v !== '') v = Number(v);
        data[f.name] = v;
      }

      submitBtn.textContent = 'Menyimpan...';
      await apiFetch(`${r.endpoint}/${item.id}`, { method: 'PUT', body: data });
      closeEditModal();
      loadList(r, { force: true });
    } catch (err) {
      document.getElementById('editResult').innerHTML =
        `<div class="result-error" style="padding:8px; border-radius:4px; font-size:12px; background:rgba(239,68,68,0.1); color:#ef4444;">❌ Error: ${esc(err.message)}</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  };

  editModal.classList.add('open');
}

// ── Wire up add forms, search, pagination, refresh, edit/delete ──
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
          if (!file.type.startsWith('image/')) throw new Error(`${f.label}: file harus berupa gambar.`);
          if (file.size > MAX_IMAGE_BYTES) throw new Error(`${f.label}: ukuran maksimal 5MB.`);
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
      loadList(r, { force: true });
    } catch (err) {
      showResult(r.key, `❌ Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  wireImagePreviews(form);

  document.querySelector(`[data-refresh="${r.key}"]`).addEventListener('click', () => loadList(r, { force: true }));

  const searchInput = document.querySelector(`[data-search="${r.key}"]`);
  searchInput.addEventListener('input', debounce(() => {
    r.state.search = searchInput.value.trim().toLowerCase();
    r.state.page = 1;
    renderTable(r);
  }, 250));

  document.querySelector(`[data-page-prev="${r.key}"]`).addEventListener('click', () => {
    if (r.state.page > 1) { r.state.page--; renderTable(r); }
  });
  document.querySelector(`[data-page-next="${r.key}"]`).addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(r.state.filtered.length / PAGE_SIZE));
    if (r.state.page < totalPages) { r.state.page++; renderTable(r); }
  });

  document.getElementById(`tbody-${r.key}`).addEventListener('click', async e => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      const id = Number(editBtn.dataset.edit);
      const item = r.state.items.find(it => it.id === id);
      if (item) openEditModal(r, item);
      return;
    }

    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const id = btn.dataset.delete;
    const label = btn.dataset.label || `#${id}`;
    if (!confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    btn.disabled = true;
    btn.textContent = 'Menghapus...';
    try {
      await apiFetch(`${r.endpoint}/${id}`, { method: 'DELETE' });
      loadList(r, { force: true });
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

// Fetches a resource's full list (once per tab visit, or when forced) and renders it.
async function loadList(r, { force = false } = {}) {
  if (r.state.loading) return;
  if (r.state.loaded && !force) { renderTable(r); return; }

  const tbody = document.getElementById(`tbody-${r.key}`);
  const colspan = r.columns.length + 2;
  r.state.loading = true;
  tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">Memuat...</td></tr>`;

  try {
    const path = r.endpoint + (r.listAll ? '?all=1' : '');
    const items = await apiFetch(path);
    r.state.items = items;
    r.state.loaded = true;
    r.state.page = 1;
    document.getElementById(`count-${r.key}`).textContent = items.length ? `(${items.length})` : '';
    renderTable(r);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">❌ Gagal memuat: ${esc(err.message)}</td></tr>`;
  } finally {
    r.state.loading = false;
  }
}

// Applies search + pagination to already-loaded items and renders the current page.
function renderTable(r) {
  const tbody = document.getElementById(`tbody-${r.key}`);
  const colspan = r.columns.length + 2;
  const paginationEl = document.getElementById(`pagination-${r.key}`);
  const paginfoEl = document.getElementById(`paginfo-${r.key}`);

  const q = r.state.search;
  r.state.filtered = q
    ? r.state.items.filter(item => JSON.stringify(item).toLowerCase().includes(q))
    : r.state.items;

  const totalItems = r.state.filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  r.state.page = Math.min(Math.max(1, r.state.page), totalPages);

  if (!totalItems) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="list-state">${q ? 'Tidak ada hasil pencarian.' : 'Belum ada data.'}</td></tr>`;
    paginationEl.hidden = true;
    return;
  }

  const start = (r.state.page - 1) * PAGE_SIZE;
  const pageItems = r.state.filtered.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = pageItems.map(item => `
    <tr class="${isRowExpired(item) ? 'expired-row' : ''}">
      <td class="col-id" data-label="ID">${esc(item.id)}</td>
      ${r.columns.map(c => `<td data-label="${esc(c.label)}">${c.render(item)}</td>`).join('')}
      <td class="col-actions" data-label="">
        <button type="button" class="btn btn-outline btn-sm" data-edit="${item.id}" title="Edit">✏️</button>
<button type="button" class="btn btn-danger" data-delete="${item.id}" data-label="${escAttr(item.name || item.title || item.text || ('#' + item.id))}" title="Hapus">🗑️</button>
      </td>
    </tr>
  `).join('');

  paginationEl.hidden = false;
  paginfoEl.textContent = `${start + 1}–${Math.min(start + PAGE_SIZE, totalItems)} dari ${totalItems}${q ? ` (disaring dari ${r.state.items.length})` : ''}`;
  document.querySelector(`[data-page-prev="${r.key}"]`).disabled = r.state.page <= 1;
  document.querySelector(`[data-page-next="${r.key}"]`).disabled = r.state.page >= totalPages;
}

// ── Initial load: health check + only the active (first) tab ──
const apiStatus = document.getElementById('apiStatus');
function setApiStatus(isConnected) {
  apiStatus.textContent = isConnected ? '✅ API Terhubung' : '❌ API Tidak Tersambung';
  apiStatus.style.color = isConnected ? '#22c55e' : '#ef4444';
}

fetch(`${workerUrl}/health`)
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => setApiStatus(true))
  .catch(() => setApiStatus(false));

loadList(RESOURCES[0]);