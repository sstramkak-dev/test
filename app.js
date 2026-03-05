// ══════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════
let currentRole        = 'admin';
let currentPage        = 'dashboard';
let currentCustomerTab = 'newCustomer';
let currentSettingsTab = 'permission';
let currentSaleTab     = 'dailySale';

let itemCatalogue   = [];
let saleRecords     = [];
let newSaleItems    = [];
let newCustomers    = [];
let topUpList       = [];
let terminationList = [];
let staffList       = [];
let kpiList         = [];
let kpiValueMode    = 'unit';
let kpiTypeSelected = '';

// ── Constants ─────────────────────────────────────────────
const TAB_PERM = {
  permission:      ['admin'],
  kpi:             ['admin','supervisor'],
  promotionSetting:['admin']
};
const TAB_LBL = {
  permission:'Permission',
  kpi:'KPI Setting',
  promotionSetting:'Promotion'
};
const PROD_COL = {
  'Smart@Home' :'pill-blue',
  'Smart Fiber+':'pill-purple',
  'M2M'        :'pill-orange',
  'Smart Laor 6':'pill-yellow',
  'Smart Laor 10$':'pill-green'
};
const NC_COL = {
  'New Lead'    :'pill-yellow',
  'Hot Prospect':'pill-orange',
  'Closed'      :'pill-green'
};
const AV_CYC = ['','blue','orange','purple'];

// ── DOM Helpers ───────────────────────────────────────────
const g    = id       => document.getElementById(id);
const rv   = id       => g(id).value;
const rt   = id       => g(id).value.trim();
const $    = (s,c=document) => c.querySelector(s);
const $$   = (s,c=document) => [...c.querySelectorAll(s)];
const today = ()      => new Date().toLocaleDateString();
const ini   = n       => n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const pad   = i       => String(i+1).padStart(2,'0');

// ══════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════
function navigateTo(page, btn) {
  $$('.nav-item').forEach(e => e.classList.remove('active'));
  $$('.page').forEach(p => p.classList.remove('active'));
  $$('.submenu').forEach(s => s.classList.remove('open'));
  $$('.nav-item.has-submenu').forEach(b => b.classList.remove('open'));
  $$('.submenu-item').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  g('page-'+page).classList.add('active');
  g('pageTitle').textContent = {
    dashboard   :'Dashboard',
    promotionPage:'Promotion',
    deposit     :'Deposit'
  }[page] || page;
  currentPage = page;
}

function toggleSubmenu(id, btn) {
  const sub = g(id);
  const isOpen = sub.classList.contains('open');
  $$('.submenu').forEach(s => s.classList.remove('open'));
  $$('.nav-item.has-submenu').forEach(b => b.classList.remove('open'));
  if(!isOpen) {
    sub.classList.add('open');
    btn.classList.add('open');
    $$('.nav-item').forEach(e => e.classList.remove('active'));
    btn.classList.add('active');
  }
}

// ── Sale nav ──────────────────────────────────────────────
function openSaleTab(tab, submenuBtn) {
  $$('.page').forEach(p => p.classList.remove('active'));
  g('page-sale').classList.add('active');
  $$('.submenu-item').forEach(e => e.classList.remove('active'));
  if(submenuBtn) submenuBtn.classList.add('active');
  $$('.nav-item').forEach(e => e.classList.remove('active'));
  g('saleNavBtn').classList.add('active','open');
  g('saleSubmenu').classList.add('open');
  switchSaleTab(tab);
  currentPage = 'sale';
}

function switchSaleTab(tab) {
  currentSaleTab = tab;
  $$('#page-sale .tab-btn').forEach(b => b.classList.remove('active'));
  $$('#page-sale .tab-content').forEach(t => t.classList.remove('active'));
  g('stab-'+tab+'-btn').classList.add('active');
  g('stab-'+tab).classList.add('active');
  g('pageTitle').textContent = 'Sale — Daily Sale';
}

// ── Customer nav ──────────────────────────────────────────
function openCustomerTab(tab, submenuBtn) {
  $$('.page').forEach(p => p.classList.remove('active'));
  g('page-customer').classList.add('active');
  $$('.submenu-item').forEach(e => e.classList.remove('active'));
  if(submenuBtn) submenuBtn.classList.add('active');
  $$('.nav-item').forEach(e => e.classList.remove('active'));
  g('customerNavBtn').classList.add('active','open');
  g('customerSubmenu').classList.add('open');
  switchCustomerTab(tab);
  currentPage = 'customer';
}

function switchCustomerTab(tab) {
  currentCustomerTab = tab;
  $$('#page-customer .tab-btn').forEach(b => b.classList.remove('active'));
  $$('#page-customer .tab-content').forEach(t => t.classList.remove('active'));
  g('ctab-'+tab+'-btn').classList.add('active');
  g('ctab-'+tab).classList.add('active');
  g('pageTitle').textContent = {
    newCustomer :'Customer — New Customer',
    topUp       :'Customer — Top Up',
    termination :'Customer — Termination'
  }[tab] || tab;
}

// ── Settings nav ──────────────────────────────────────────
function openSettingsTab(tab, submenuBtn) {
  $$('.page').forEach(p => p.classList.remove('active'));
  g('page-settings').classList.add('active');
  $$('.submenu-item').forEach(e => e.classList.remove('active'));
  if(submenuBtn) submenuBtn.classList.add('active');
  $$('.nav-item').forEach(e => e.classList.remove('active'));
  g('settingsNavBtn').classList.add('active','open');
  g('settingsSubmenu').classList.add('open');
  switchSettingsTab(tab);
  currentPage = 'settings';
}

function switchSettingsTab(tab) {
  currentSettingsTab = tab;
  $$('#page-settings .tab-btn').forEach(b => b.classList.remove('active'));
  $$('#page-settings .tab-content').forEach(t => t.classList.remove('active'));
  g('tab-'+tab+'-btn').classList.add('active');
  g('tab-'+tab).classList.add('active');
  if(tab !== 'permission' && tab !== 'kpi') renderAccessContent(tab);
  g('pageTitle').textContent = 'Settings — ' + TAB_LBL[tab];
}

function renderAccessContent(tab) {
  const el = g(tab+'-content');
  if(!el) return;
  const ok = TAB_PERM[tab].includes(currentRole);
  el.innerHTML = ok ? '' : `
    <div class="access-denied">
      <i class="fa-solid fa-lock"></i>
      <h3>Access Denied</h3>
      <p>Required: <strong>${TAB_PERM[tab].map(r=>r[0].toUpperCase()+r.slice(1)).join(' or ')}</strong></p>
    </div>`;
}

// ══════════════════════════════════════════════════════════
//  ITEM CATALOGUE
// ══════════════════════════════════════════════════════════
function submitItem(e) {
  e.preventDefault();
  const eid = rt('item-edit-id');
  const d = {
    name    : rt('item-name'),
    price   : rv('item-price'),
    unit    : rt('item-unit'),
    category: rv('item-category'),
    status  : rv('item-status'),
    desc    : rt('item-desc')
  };
  if(eid) {
    const idx = itemCatalogue.findIndex(i => i.id === Number(eid));
    if(idx !== -1) { d.id = Number(eid); itemCatalogue[idx] = d; }
  } else {
    d.id = Date.now();
    itemCatalogue.push(d);
  }
  renderItemChips();
  refreshSaleSelect();
  closeModal('addItem');
}

function renderItemChips() {
  const con    = g('itemChipsContainer');
  const active = itemCatalogue.filter(i => i.status === 'Active');
  if(!active.length) {
    con.innerHTML = `<span class="no-items-hint">
      <i class="fa-solid fa-circle-info"></i>&nbsp;No active items — click
      <strong style="margin:0 3px;">Add Items</strong> to build your catalogue.</span>`;
    return;
  }
  con.innerHTML = active.map(it => `
    <div class="item-chip" onclick="quickAddItem(${it.id})" title="${it.desc||''}">
      <i class="fa-solid fa-tag" style="font-size:11px;color:#1B7D3D;"></i>
      <span>${it.name}</span>
      ${it.price ? `<span class="chip-price">$${Number(it.price).toFixed(2)}</span>` : ''}
      ${it.unit  ? `<span class="chip-unit">${it.unit}</span>` : ''}
    </div>`).join('');
}

function refreshSaleSelect() {
  const sel    = g('sale-item-select');
  const active = itemCatalogue.filter(i => i.status === 'Active');
  sel.innerHTML = '<option value="">— Select an item —</option>' +
    active.map(i =>
      `<option value="${i.id}">${i.name}` +
      `${i.price ? ' — $'+Number(i.price).toFixed(2) : ''}` +
      `${i.unit  ? ' ('+i.unit+')' : ''}</option>`
    ).join('');
}

function quickAddItem(itemId) {
  if(g('modal-newSale').classList.contains('open')) {
    const ex = newSaleItems.find(i => i.itemId === itemId);
    if(ex) ex.qty++;
    else   newSaleItems.push({itemId, qty:1});
    renderSaleItemsList();
  } else {
    openNewSaleModal();
    setTimeout(() => {
      newSaleItems.push({itemId, qty:1});
      renderSaleItemsList();
    }, 60);
  }
}

// ══════════════════════════════════════════════════════════
//  NEW SALE MODAL
// ══════════════════════════════════════════════════════════
function openNewSaleModal(editId) {
  $('#modal-newSale form').reset();
  newSaleItems = [];
  g('sale-date').value = new Date().toISOString().split('T')[0];

  if(editId) {
    const rec = saleRecords.find(s => s.id === editId);
    if(rec) {
      g('sale-edit-id').value = editId;
      g('sale-agent').value   = rec.agent;
      g('sale-branch').value  = rec.branch;
      g('sale-date').value    = rec.dateRaw || '';
      g('sale-note').value    = rec.note;
      newSaleItems = rec.items.map(i => ({...i}));
      g('newSale-title').textContent   = 'Edit Sale';
      g('newSale-sub').textContent     = 'Update sale record';
      g('sale-save-label').textContent = 'Update Sale';
    }
  } else {
    g('sale-edit-id').value = '';
    g('newSale-title').textContent   = 'New Sale';
    g('newSale-sub').textContent     = 'Record a sale for an agent';
    g('sale-save-label').textContent = 'Save Sale';
  }
  refreshSaleSelect();
  renderSaleItemsList();
  g('modal-newSale').classList.add('open');
}

function addItemToSale() {
  const sel    = g('sale-item-select');
  const itemId = Number(sel.value);
  if(!itemId) return;
  const ex = newSaleItems.find(i => i.itemId === itemId);
  if(ex) ex.qty++;
  else   newSaleItems.push({itemId, qty:1});
  sel.value = '';
  renderSaleItemsList();
}

function updateQty(itemId, qty) {
  const en = newSaleItems.find(i => i.itemId === itemId);
  if(en) { en.qty = Math.max(1, Number(qty)||1); recalcTotal(); }
}

function removeFromSale(itemId) {
  newSaleItems = newSaleItems.filter(i => i.itemId !== itemId);
  renderSaleItemsList();
}

function renderSaleItemsList() {
  const con    = g('saleItemsList');
  const noMsg  = g('noItemsMsg');
  const totDiv = g('saleModalTotal');

  if(!newSaleItems.length) {
    con.innerHTML = '';
    con.appendChild(noMsg);
    noMsg.style.display  = 'block';
    totDiv.style.display = 'none';
    return;
  }
  noMsg.style.display  = 'none';
  totDiv.style.display = 'flex';

  con.innerHTML = newSaleItems.map(en => {
    const it = itemCatalogue.find(i => i.id === en.itemId);
    if(!it) return '';
    return `
      <div class="sale-item-row">
        <div class="item-name">${it.name}</div>
        ${it.unit  ? `<span class="item-unit-badge">${it.unit}</span>` : ''}
        ${it.price
          ? `<span class="item-price">$${(Number(it.price)*en.qty).toFixed(2)}</span>`
          : `<span class="item-price" style="color:#ccc;">—</span>`}
        <input class="sale-item-qty" type="number" value="${en.qty}" min="1"
          onchange="updateQty(${en.itemId},this.value)" title="Qty"/>
        <button type="button" class="sale-item-remove" onclick="removeFromSale(${en.itemId})">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>`;
  }).join('');
  recalcTotal();
}

function recalcTotal() {
  let t = 0;
  newSaleItems.forEach(en => {
    const it = itemCatalogue.find(i => i.id === en.itemId);
    if(it && it.price) t += Number(it.price) * en.qty;
  });
  g('saleModalTotalVal').textContent = '$' + t.toFixed(2);
}

function submitSale(e) {
  e.preventDefault();
  const eid     = rt('sale-edit-id');
  const dateRaw = rv('sale-date');
  const d = {
    agent  : rt('sale-agent'),
    branch : rt('sale-branch'),
    dateRaw: dateRaw,
    date   : dateRaw ? new Date(dateRaw).toLocaleDateString() : today(),
    note   : rt('sale-note'),
    items  : newSaleItems.map(i => ({...i}))
  };
  d.total = newSaleItems.reduce((s,en) => {
    const it = itemCatalogue.find(i => i.id === en.itemId);
    return s + (it && it.price ? Number(it.price)*en.qty : 0);
  }, 0);

  if(eid) {
    const idx = saleRecords.findIndex(s => s.id === Number(eid));
    if(idx !== -1) { d.id = Number(eid); saleRecords[idx] = d; }
  } else {
    d.id = Date.now();
    saleRecords.push(d);
  }
  renderSaleTable();
  closeModal('newSale');
}

function renderSaleTable() {
  const tbody = g('saleTableBody');
  const badge = g('saleCountBadge');
  const bar   = g('saleTotalBar');

  if(!saleRecords.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <i class="fa-solid fa-receipt"></i>
      <p>No sales recorded yet. Click <strong>New Sale</strong> to get started.</p>
    </div></td></tr>`;
    badge.style.display = 'none';
    bar.style.display   = 'none';
    return;
  }

  badge.style.display = 'inline-flex';
  badge.textContent   = saleRecords.length + ' record' + (saleRecords.length > 1 ? 's' : '');
  bar.style.display   = 'flex';

  let grand = 0;
  tbody.innerHTML = saleRecords.map((s,i) => {
    grand += s.total || 0;
    const chips = s.items.map(en => {
      const it = itemCatalogue.find(x => x.id === en.itemId);
      return it
        ? `<span class="pill pill-teal" style="margin:1px 2px;font-size:11px;">${it.name}×${en.qty}</span>`
        : '';
    }).join('');
    const qty = s.items.reduce((sum,en) => sum + en.qty, 0);
    return `<tr>
      <td style="color:#aaa;font-size:12px;font-weight:600;">${pad(i)}</td>
      <td>
        <div class="name-cell">
          <div class="avatar ${AV_CYC[i%4]}">${ini(s.agent)}</div>
          <span class="name-text">${s.agent}</span>
        </div>
      </td>
      <td style="color:#555;font-size:13px;">
        <i class="fa-solid fa-building" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${s.branch}
      </td>
      <td style="color:#666;font-size:13px;">${s.date}</td>
      <td style="max-width:200px;">${chips || '<span style="color:#ccc;">—</span>'}</td>
      <td style="color:#555;font-size:13px;text-align:center;">${qty}</td>
      <td style="font-weight:700;color:#1B7D3D;">${s.total ? '$'+s.total.toFixed(2) : '—'}</td>
      <td style="color:#888;font-size:13px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${s.note}">${s.note||'—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit"   onclick="openNewSaleModal(${s.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" onclick="delRec(saleRecords,${s.id},renderSaleTable)" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
  g('grandTotal').textContent = '$' + grand.toFixed(2);
}

// ══════════════════════════════════════════════════════════
//  MODAL HELPERS
// ══════════════════════════════════════════════════════════
function openAddModal(type) {
  const form = $(`#modal-${type} form`);
  form.reset();
  kpiTypeSelected = '';
  kpiValueMode    = 'unit';

  if(type === 'addItem') {
    g('item-edit-id').value = '';
    g('addItem-title').textContent   = 'Add Item';
    g('addItem-sub').textContent     = 'Create a new sale catalogue item';
    g('item-save-label').textContent = 'Save Item';

  } else if(type === 'kpi') {
    g('kpi-edit-id').value = '';
    g('kpi-modal-title').textContent = 'Add KPI';
    g('kpi-modal-sub').textContent   = 'Define a new KPI metric and target';
    g('kpi-save-label').textContent  = 'Save KPI';
    $$('.kpi-chip').forEach(c => c.classList.remove('active'));
    setValueMode('unit');
    g('custom-currency-group').style.display = 'none';

  } else if(type === 'newCustomer') {
    g('nc-edit-id').value = '';
    g('nc-modal-title').textContent = 'Add New Customer';
    g('nc-modal-sub').textContent   = 'Fill in the customer lead details';

  } else if(type === 'topUp') {
    g('tu-edit-id').value = '';
    g('tu-modal-title').textContent = 'Add Top Up';
    g('tu-modal-sub').textContent   = 'Enter top up customer details';

  } else if(type === 'termination') {
    g('tm-edit-id').value = '';
    g('tm-modal-title').textContent = 'Add Termination';
    g('tm-modal-sub').textContent   = 'Record a terminated customer';

  } else if(type === 'addUser') {
    g('au-edit-id').value = '';
    g('au-modal-title').textContent  = 'Add New User';
    g('au-modal-sub').textContent    = 'Create a staff account';
    g('au-save-label').textContent   = 'Save User';
    g('au-password').required        = true;
    g('au-pwd-req').style.display    = 'inline';
    g('au-pwd-hint').style.display   = 'none';
  }
  g('modal-'+type).classList.add('open');
}

function openEditModal(type, id) {
  const form = $(`#modal-${type} form`);
  form.reset();
  kpiTypeSelected = '';

  if(type === 'addItem') {
    const r = itemCatalogue.find(i => i.id === id); if(!r) return;
    g('item-edit-id').value   = id;
    g('item-name').value      = r.name;
    g('item-price').value     = r.price;
    g('item-unit').value      = r.unit;
    g('item-category').value  = r.category;
    g('item-status').value    = r.status;
    g('item-desc').value      = r.desc;
    g('addItem-title').textContent   = 'Edit Item';
    g('addItem-sub').textContent     = 'Update catalogue item';
    g('item-save-label').textContent = 'Update Item';

  } else if(type === 'kpi') {
    const r = kpiList.find(k => k.id === id); if(!r) return;
    g('kpi-edit-id').value  = id;
    g('kpi-name').value     = r.name;
    g('kpi-value').value    = r.value;
    g('kpi-period').value   = r.period;
    g('kpi-status').value   = r.status;
    g('kpi-desc').value     = r.desc;
    g('kpi-modal-title').textContent = 'Edit KPI';
    g('kpi-modal-sub').textContent   = 'Update this KPI metric';
    g('kpi-save-label').textContent  = 'Update KPI';
    kpiTypeSelected = r.type;
    $$('.kpi-chip').forEach(c => c.classList.toggle('active', c.textContent.includes(r.type)));
    setValueMode(r.mode || 'unit');
    if(r.mode === 'unit') {
      g('kpi-unit-label').value = r.unitLabel || '';
    } else {
      g('kpi-currency').value = r.currency || '';
      const ic = r.currency === 'Custom';
      g('custom-currency-group').style.display = ic ? 'flex' : 'none';
      if(ic) g('kpi-custom-currency').value = r.customCurrency || '';
    }

  } else if(type === 'newCustomer') {
    const r = newCustomers.find(c => c.id === id); if(!r) return;
    g('nc-edit-id').value    = id;
    g('nc-agent').value      = r.agent;
    g('nc-branch').value     = r.branch;
    g('nc-name').value       = r.name;
    g('nc-phone').value      = r.phone;
    g('nc-product').value    = r.product;
    g('nc-status').value     = r.status;
    g('nc-remark').value     = r.remark;
    g('nc-modal-title').textContent = 'Edit Customer';
    g('nc-modal-sub').textContent   = 'Update customer details';

  } else if(type === 'topUp') {
    const r = topUpList.find(c => c.id === id); if(!r) return;
    g('tu-edit-id').value    = id;
    g('tu-agent').value      = r.agent;
    g('tu-branch').value     = r.branch;
    g('tu-name').value       = r.name;
    g('tu-phone').value      = r.phone;
    g('tu-product').value    = r.product;
    g('tu-status').value     = r.status;
    g('tu-remark').value     = r.remark;
    g('tu-modal-title').textContent = 'Edit Top Up';
    g('tu-modal-sub').textContent   = 'Update top up record';

  } else if(type === 'termination') {
    const r = terminationList.find(c => c.id === id); if(!r) return;
    g('tm-edit-id').value    = id;
    g('tm-agent').value      = r.agent;
    g('tm-branch').value     = r.branch;
    g('tm-name').value       = r.name;
    g('tm-phone').value      = r.phone;
    g('tm-product').value    = r.product;
    g('tm-remark').value     = r.remark;
    g('tm-modal-title').textContent = 'Edit Termination';
    g('tm-modal-sub').textContent   = 'Update termination record';

  } else if(type === 'addUser') {
    const r = staffList.find(u => u.id === id); if(!r) return;
    g('au-edit-id').value    = id;
    g('au-fullname').value   = r.fullname;
    g('au-username').value   = r.username;
    g('au-role').value       = r.role;
    g('au-status').value     = r.status;
    g('au-branch').value     = r.branch;
    g('au-modal-title').textContent  = 'Edit User';
    g('au-modal-sub').textContent    = 'Update staff account';
    g('au-save-label').textContent   = 'Update User';
    g('au-password').required        = false;
    g('au-pwd-req').style.display    = 'none';
    g('au-pwd-hint').style.display   = 'inline';
  }
  g('modal-'+type).classList.add('open');
}

function closeModal(type)         { g('modal-'+type).classList.remove('open'); }
function handleOverlay(e, type)   { if(e.target === g('modal-'+type)) closeModal(type); }
function togglePwd(iid, eid) {
  const i = g(iid), ic = g(eid);
  if(i.type === 'password') { i.type = 'text';     ic.className = 'fa-regular fa-eye-slash'; }
  else                      { i.type = 'password'; ic.className = 'fa-regular fa-eye'; }
}

// ══════════════════════════════════════════════════════════
//  KPI
// ══════════════════════════════════════════════════════════
function setValueMode(mode) {
  kpiValueMode = mode;
  g('btn-unit').classList.toggle('active', mode === 'unit');
  g('btn-currency').classList.toggle('active', mode === 'currency');
  g('unit-label-group').style.display = mode === 'unit' ? 'flex' : 'none';
  g('currency-group').classList.toggle('visible', mode === 'currency');
}

function selectKpiType(btn, type) {
  $$('.kpi-chip').forEach(c => c.classList.remove('active'));
  if(kpiTypeSelected === type) { kpiTypeSelected = ''; }
  else { btn.classList.add('active'); kpiTypeSelected = type; }
}

g('kpi-currency').addEventListener('change', function() {
  g('custom-currency-group').style.display = this.value === 'Custom' ? 'flex' : 'none';
});

function submitKpi(e) {
  e.preventDefault();
  const eid = rt('kpi-edit-id');
  const cur = rv('kpi-currency');
  const d = {
    name          : rt('kpi-name') || kpiTypeSelected || 'KPI',
    type          : kpiTypeSelected || '—',
    value         : rv('kpi-value'),
    mode          : kpiValueMode,
    unitLabel     : rt('kpi-unit-label'),
    currency      : cur,
    customCurrency: rt('kpi-custom-currency'),
    period        : rv('kpi-period'),
    status        : rv('kpi-status'),
    desc          : rt('kpi-desc')
  };
  if(eid) {
    const idx = kpiList.findIndex(k => k.id === Number(eid));
    if(idx !== -1) { d.id = Number(eid); kpiList[idx] = d; }
  } else {
    d.id = Date.now();
    kpiList.push(d);
  }
  renderKpi();
  closeModal('kpi');
}

function renderKpi() {
  g('kpiSummaryCards').innerHTML = kpiList.slice(0,6).map(k => {
    const du = k.mode === 'currency'
      ? (k.currency === 'Custom' ? k.customCurrency : k.currency)
      : k.unitLabel;
    return `<div class="kpi-summary-card">
      <div class="kpi-card-label">${k.name}</div>
      <div class="kpi-card-value">${k.value||'—'}</div>
      <div class="kpi-card-unit">${du||''} ${k.period ? '· '+k.period : ''}</div>
    </div>`;
  }).join('');

  const tbody = g('kpiTableBody');
  if(!kpiList.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <i class="fa-solid fa-chart-line"></i>
      <p>No KPIs defined yet. Click <strong>Add KPI</strong> to get started.</p>
    </div></td></tr>`;
    return;
  }
  const TP = {
    'Sales':'pill-green','Revenue':'pill-teal','Subscribers':'pill-blue',
    'Retention':'pill-purple','Churn':'pill-red','NPS':'pill-yellow',
    'Custom':'pill-gray','—':'pill-gray'
  };
  const SP = { Active:'pill-green', Inactive:'pill-red', Draft:'pill-yellow' };

  tbody.innerHTML = kpiList.map((k,i) => {
    const du = k.mode === 'currency'
      ? (k.currency === 'Custom' ? `✏️ ${k.customCurrency}` : `💰 ${k.currency}`)
      : (k.unitLabel ? `📏 ${k.unitLabel}` : '—');
    const st = k.status
      ? `<span class="pill ${SP[k.status]||'pill-gray'}">${k.status}</span>`
      : '<span style="color:#ccc;font-size:12px;">—</span>';
    return `<tr>
      <td style="color:#aaa;font-size:12px;font-weight:600;">${pad(i)}</td>
      <td><span class="name-text">${k.name}</span></td>
      <td><span class="pill ${TP[k.type]||'pill-gray'}">${k.type}</span></td>
      <td style="font-weight:600;color:#1B7D3D;">${k.value||'—'}</td>
      <td style="font-size:13px;color:#555;">${du}</td>
      <td>${k.period ? `<span class="pill pill-teal">${k.period}</span>` : '<span style="color:#ccc;font-size:12px;">—</span>'}</td>
      <td style="color:#888;font-size:13px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${k.desc}">${k.desc||'—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit"   onclick="openEditModal('kpi',${k.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" onclick="delRec(kpiList,${k.id},renderKpi)" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  CUSTOMER
// ══════════════════════════════════════════════════════════
function submitNewCustomer(e) {
  e.preventDefault();
  const eid    = rt('nc-edit-id');
  const status = rv('nc-status');
  const d = {
    agent  : rt('nc-agent'),
    branch : rt('nc-branch'),
    name   : rt('nc-name'),
    phone  : rt('nc-phone'),
    product: rv('nc-product'),
    status,
    remark : rt('nc-remark'),
    date   : today()
  };
  if(eid) {
    const idx = newCustomers.findIndex(c => c.id === Number(eid));
    if(idx !== -1) {
      d.id = Number(eid);
      if(status === 'Closed') {
        newCustomers.splice(idx,1);
        topUpList.push({...d, status:'Active'});
        renderTopUp();
      } else {
        newCustomers[idx] = d;
      }
    }
  } else {
    d.id = Date.now();
    if(status === 'Closed') {
      topUpList.push({...d, status:'Active'});
      renderTopUp();
    } else {
      newCustomers.push(d);
    }
  }
  renderNewCustomers();
  closeModal('newCustomer');
}

function submitTopUp(e) {
  e.preventDefault();
  const eid    = rt('tu-edit-id');
  const status = rv('tu-status');
  const d = {
    agent  : rt('tu-agent'),
    branch : rt('tu-branch'),
    name   : rt('tu-name'),
    phone  : rt('tu-phone'),
    product: rv('tu-product'),
    status,
    remark : rt('tu-remark'),
    date   : today()
  };
  if(eid) {
    const idx = topUpList.findIndex(c => c.id === Number(eid));
    if(idx !== -1) {
      d.id = Number(eid);
      if(status === 'Termination') {
        topUpList.splice(idx,1);
        terminationList.push({...d, terminatedOn:today()});
        renderTermination();
      } else {
        topUpList[idx] = d;
      }
    }
  } else {
    d.id = Date.now();
    if(status === 'Termination') {
      terminationList.push({...d, terminatedOn:today()});
      renderTermination();
    } else {
      topUpList.push(d);
    }
  }
  renderTopUp();
  closeModal('topUp');
}

function submitTermination(e) {
  e.preventDefault();
  const eid = rt('tm-edit-id');
  const d = {
    agent      : rt('tm-agent'),
    branch     : rt('tm-branch'),
    name       : rt('tm-name'),
    phone      : rt('tm-phone'),
    product    : rv('tm-product'),
    remark     : rt('tm-remark'),
    terminatedOn: today()
  };
  if(eid) {
    const idx = terminationList.findIndex(c => c.id === Number(eid));
    if(idx !== -1) { d.id = Number(eid); terminationList[idx] = d; }
  } else {
    d.id = Date.now();
    terminationList.push(d);
  }
  renderTermination();
  closeModal('termination');
}

function changeNcStatus(id, st) {
  const idx = newCustomers.findIndex(c => c.id === id);
  if(idx === -1) return;
  const rec = {...newCustomers[idx], status:st};
  if(st === 'Closed') {
    newCustomers.splice(idx,1);
    topUpList.push({...rec, status:'Active'});
    renderTopUp();
  } else {
    newCustomers[idx].status = st;
  }
  renderNewCustomers();
}

function changeTuStatus(id, st) {
  const idx = topUpList.findIndex(c => c.id === id);
  if(idx === -1) return;
  const rec = {...topUpList[idx], status:st};
  if(st === 'Termination') {
    topUpList.splice(idx,1);
    terminationList.push({...rec, terminatedOn:today()});
    renderTermination();
  } else {
    topUpList[idx].status = st;
  }
  renderTopUp();
}

function delRec(list, id, fn) {
  if(!confirm('Delete this record?')) return;
  const idx = list.findIndex(c => c.id === id);
  if(idx !== -1) { list.splice(idx,1); fn(); }
}

// ── Render: New Customers ─────────────────────────────────
function renderNewCustomers() {
  const tbody = g('newCustomerBody');
  if(!newCustomers.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <i class="fa-solid fa-user-plus"></i>
      <p>No customers yet. Click <strong>Add Customer</strong> to get started.</p>
    </div></td></tr>`;
    return;
  }
  tbody.innerHTML = newCustomers.map((c,i) => `
    <tr>
      <td style="color:#aaa;font-size:12px;font-weight:600;">${pad(i)}</td>
      <td>
        <div class="name-cell">
          <div class="avatar ${AV_CYC[i%4]}">${ini(c.name)}</div>
          <span class="name-text">${c.name}</span>
        </div>
      </td>
      <td style="color:#666;font-size:13px;">
        <i class="fa-solid fa-phone" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${c.phone}
      </td>
      <td style="color:#555;font-size:13px;">${c.agent}</td>
      <td style="color:#555;font-size:13px;">
        <i class="fa-solid fa-building" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${c.branch}
      </td>
      <td><span class="pill ${PROD_COL[c.product]||'pill-gray'}">${c.product}</span></td>
      <td>
        <select class="pill ${NC_COL[c.status]||'pill-gray'}"
          onchange="changeNcStatus(${c.id},this.value)"
          style="border:none;cursor:pointer;font-size:11.5px;font-weight:600;padding:3px 8px;
                 border-radius:20px;outline:none;background:inherit;color:inherit;">
          <option ${c.status==='New Lead'     ?'selected':''}>New Lead</option>
          <option ${c.status==='Hot Prospect' ?'selected':''}>Hot Prospect</option>
          <option ${c.status==='Closed'       ?'selected':''}>Closed</option>
        </select>
      </td>
      <td style="color:#888;font-size:13px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${c.remark}">${c.remark||'—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit"   onclick="openEditModal('newCustomer',${c.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" onclick="delRec(newCustomers,${c.id},renderNewCustomers)" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

// ── Render: Top Up ────────────────────────────────────────
function renderTopUp() {
  const tbody = g('topUpBody');
  if(!topUpList.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <i class="fa-solid fa-arrow-up-right-dots"></i>
      <p>No top up records yet.</p>
    </div></td></tr>`;
    return;
  }
  tbody.innerHTML = topUpList.map((c,i) => `
    <tr>
      <td style="color:#aaa;font-size:12px;font-weight:600;">${pad(i)}</td>
      <td>
        <div class="name-cell">
          <div class="avatar ${AV_CYC[i%4]}">${ini(c.name)}</div>
          <span class="name-text">${c.name}</span>
        </div>
      </td>
      <td style="color:#666;font-size:13px;">
        <i class="fa-solid fa-phone" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${c.phone}
      </td>
      <td style="color:#555;font-size:13px;">${c.agent}</td>
      <td style="color:#555;font-size:13px;">
        <i class="fa-solid fa-building" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${c.branch}
      </td>
      <td><span class="pill ${PROD_COL[c.product]||'pill-gray'}">${c.product}</span></td>
      <td>
        <select class="pill ${c.status==='Active'?'pill-green':'pill-red'}"
          onchange="changeTuStatus(${c.id},this.value)"
          style="border:none;cursor:pointer;font-size:11.5px;font-weight:600;padding:3px 8px;
                 border-radius:20px;outline:none;background:inherit;color:inherit;">
          <option ${c.status==='Active'     ?'selected':''}>Active</option>
          <option ${c.status==='Termination'?'selected':''}>Termination</option>
        </select>
      </td>
      <td style="color:#888;font-size:13px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${c.remark}">${c.remark||'—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit"   onclick="openEditModal('topUp',${c.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" onclick="delRec(topUpList,${c.id},renderTopUp)" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

// ── Render: Termination ───────────────────────────────────
function renderTermination() {
  const tbody = g('terminationBody');
  if(!terminationList.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <i class="fa-solid fa-ban"></i>
      <p>No terminated customers yet.</p>
    </div></td></tr>`;
    return;
  }
  tbody.innerHTML = terminationList.map((c,i) => `
    <tr>
      <td style="color:#aaa;font-size:12px;font-weight:600;">${pad(i)}</td>
      <td>
        <div class="name-cell">
          <div class="avatar orange">${ini(c.name)}</div>
          <span class="name-text">${c.name}</span>
        </div>
      </td>
      <td style="color:#666;font-size:13px;">
        <i class="fa-solid fa-phone" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${c.phone}
      </td>
      <td style="color:#555;font-size:13px;">${c.agent}</td>
      <td style="color:#555;font-size:13px;">
        <i class="fa-solid fa-building" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${c.branch}
      </td>
      <td><span class="pill ${PROD_COL[c.product]||'pill-gray'}">${c.product}</span></td>
      <td style="color:#888;font-size:13px;">${c.terminatedOn}</td>
      <td style="color:#888;font-size:13px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${c.remark}">${c.remark||'—'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit"   onclick="openEditModal('termination',${c.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" onclick="delRec(terminationList,${c.id},renderTermination)" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════════
//  STAFF / USER
// ══════════════════════════════════════════════════════════
function submitUser(e) {
  e.preventDefault();
  const eid = rt('au-edit-id');
  const pwd = rv('au-password');
  const d = {
    fullname: rt('au-fullname'),
    username: rt('au-username'),
    role    : rv('au-role'),
    status  : rv('au-status'),
    branch  : rt('au-branch')
  };
  if(eid) {
    const idx = staffList.findIndex(u => u.id === Number(eid));
    if(idx !== -1) {
      d.id       = Number(eid);
      d.password = pwd || staffList[idx].password;
      staffList[idx] = d;
    }
  } else {
    d.id       = Date.now();
    d.password = pwd;
    staffList.push(d);
  }
  renderStaff();
  closeModal('addUser');
}

function renderStaff() {
  const tbody = g('staffTableBody');
  if(!staffList.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <i class="fa-regular fa-user"></i>
      <p>No staff added yet. Click <strong>Add User</strong> to get started.</p>
    </div></td></tr>`;
    return;
  }
  tbody.innerHTML = staffList.map((u,i) => {
    const roleCls  = {Admin:'pill-green', Supervisor:'pill-yellow', User:'pill-blue'}[u.role] || 'pill-gray';
    const roleIcon = {Admin:'fa-user-shield', Supervisor:'fa-user-tie', User:'fa-user'}[u.role] || 'fa-user';
    const stsCls   = u.status === 'Active' ? 'pill-green pill-dot' : 'pill-red pill-dot';
    return `
      <tr>
        <td style="color:#aaa;font-size:12px;font-weight:600;">${pad(i)}</td>
        <td>
          <div class="name-cell">
            <div class="avatar">${ini(u.fullname)}</div>
            <span class="name-text">${u.fullname}</span>
          </div>
        </td>
        <td style="color:#888;font-size:13px;">
          <i class="fa-solid fa-at" style="font-size:11px;color:#ccc;margin-right:3px;"></i>${u.username}
        </td>
        <td>
          <span class="pill ${roleCls}">
            <i class="fa-solid ${roleIcon}" style="font-size:10px;"></i> ${u.role}
          </span>
        </td>
        <td style="color:#555;font-size:13px;">
          <i class="fa-solid fa-building" style="color:#ccc;font-size:11px;margin-right:4px;"></i>${u.branch}
        </td>
        <td><span class="pill ${stsCls}">${u.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit"   onclick="openEditModal('addUser',${u.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete" onclick="delRec(staffList,${u.id},renderStaff)" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  ROLE SWITCHER
// ══════════════════════════════════════════════════════════
function switchRole(role) {
  currentRole = role;
  const map = { admin:'Admin', supervisor:'Supervisor', user:'User' };
  g('userNameDisplay').textContent  = map[role] + ' User';
  g('roleBadgeDisplay').textContent = map[role];
  g('userAvatar').textContent       = map[role].slice(0,2).toUpperCase();
}

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
renderNewCustomers();
renderTopUp();
renderTermination();
renderStaff();
renderKpi();
renderSaleTable();
renderItemChips();
setValueMode('unit');
