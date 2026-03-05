/* ═══════════════════════════════════════════════════════
   SMART 5G DASHBOARD — app.js  (COMPLETE - no truncation)
═══════════════════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────────────────
let currentRole        = 'admin';
let currentPage        = 'dashboard';
let currentSaleTab     = 'dailySale';
let currentCustomerTab = 'newCustomer';
let currentSettingsTab = 'permission';
let currentReportView  = 'table';
let filteredSales      = [];
let itemGroupSelected  = 'unit';
let kpiValueMode       = 'unit';
let kpiTypeSelected    = '';

let itemCatalogue   = [];
let saleRecords     = [];
let newCustomers    = [];
let topUpList       = [];
let terminationList = [];
let staffList       = [];
let kpiList         = [];

let _cTrend = null, _cMix = null, _cAgent = null, _cGrowth = null;

// ─── CONSTANTS ───────────────────────────────────────────
const TAB_PERM = {
  permission: ['admin'],
  kpi: ['admin', 'supervisor'],
  promotionSetting: ['admin']
};
const TAB_LBL = {
  permission: 'Permission', kpi: 'KPI Setting', promotionSetting: 'Promotion'
};
const PROD_COL = {
  'Smart@Home': 'pill-blue', 'Smart Fiber+': 'pill-purple',
  'M2M': 'pill-orange', 'Smart Laor 6': 'pill-yellow', 'Smart Laor 10$': 'pill-green'
};
const NC_COL = {
  'New Lead': 'pill-yellow', 'Hot Prospect': 'pill-orange', 'Closed': 'pill-green'
};
const AV_COLORS = ['', 'blue', 'orange', 'purple', 'teal'];
const CHART_PAL = [
  '#1B7D3D', '#1a56db', '#e65100', '#7b1fa2', '#00796b',
  '#b86e00', '#c0392b', '#0d5bcc', '#00838f', '#558b2f'
];
const KNOWN_CURS  = ['$', 'KHR', '฿', 'S$', '€', '£', '¥'];
const KNOWN_UNITS = ['SIM','Line','Port','Connection','Activation','GB','TB','Mbps','Gbps',
                     'Day','Month','Year','pcs','Box','Set','Pack','Bundle'];

// ─── HELPERS ─────────────────────────────────────────────
const g   = id  => document.getElementById(id);
const rv  = id  => g(id) ? g(id).value : '';
const rt  = id  => g(id) ? g(id).value.trim() : '';
const $$  = (s, c=document) => [...c.querySelectorAll(s)];
const uid = ()  => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const ini = n   => (n||'?').split(' ').map(w => w[0]||'').join('').toUpperCase().slice(0, 2) || '??';
const fmtMoney  = (v, sym) => (sym||'$') + Number(v||0).toFixed(2);
const esc       = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function ymOf(d)   { return d ? String(d).slice(0, 7) : ''; }
function ymNow()   { const n=new Date(); return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0'); }
function ymPrev()  { const n=new Date(); n.setDate(1); n.setMonth(n.getMonth()-1); return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0'); }
function ymLabel(s){ if(!s) return ''; const [y,m]=s.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+y.slice(2); }
function last7Months(){
  const arr=[], n=new Date();
  for(let i=6;i>=0;i--){ const d=new Date(n.getFullYear(),n.getMonth()-i,1); arr.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')); }
  return arr;
}
function pctChange(cur, prev){ if(!prev) return cur>0?100:0; return Math.round((cur-prev)/prev*100); }
function setTrend(id, cur, prev){
  const el=g(id); if(!el) return;
  const p=pctChange(cur,prev);
  el.className='dash-kpi-trend '+(p>0?'up':p<0?'down':'flat');
  el.textContent=p>0?'▲ '+p+'%':p<0?'▼ '+Math.abs(p)+'%':'— 0%';
}
function destroyChart(c){ if(c){try{c.destroy();}catch(e){}} return null; }
function clearCanvas(id, msg){
  const c=g(id); if(!c) return;
  const ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle='#ccc'; ctx.font='13px Inter';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(msg||'No data yet', c.offsetWidth/2||150, c.offsetHeight/2||110);
}

// ═══════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════
function navigateTo(page, btn){
  $$('.nav-item').forEach(e=>e.classList.remove('active'));
  $$('.page').forEach(p=>p.classList.remove('active'));
  $$('.submenu').forEach(s=>s.classList.remove('open'));
  $$('.nav-item.has-submenu').forEach(b=>b.classList.remove('open'));
  $$('.submenu-item').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active');
  const pg=g('page-'+page); if(pg) pg.classList.add('active');
  g('pageTitle').textContent = {dashboard:'Dashboard',promotionPage:'Promotion',deposit:'Deposit'}[page]||page;
  currentPage=page;
  if(page==='dashboard') renderDashboard();
}
function toggleSubmenu(id, btn){
  const sub=g(id), open=sub.classList.contains('open');
  $$('.submenu').forEach(s=>s.classList.remove('open'));
  $$('.nav-item.has-submenu').forEach(b=>b.classList.remove('open'));
  if(!open){
    sub.classList.add('open'); btn.classList.add('open');
    $$('.nav-item').forEach(e=>e.classList.remove('active'));
    btn.classList.add('active');
  }
}
function openSaleTab(tab, btn){
  $$('.page').forEach(p=>p.classList.remove('active'));
  g('page-sale').classList.add('active');
  $$('.submenu-item').forEach(e=>e.classList.remove('active'));
  $$('.nav-item').forEach(e=>e.classList.remove('active'));
  if(btn) btn.classList.add('active');
  g('saleNavBtn').classList.add('active','open');
  g('saleSubmenu').classList.add('open');
  switchSaleTab(tab); currentPage='sale';
}
function switchSaleTab(tab){
  currentSaleTab=tab;
  $$('#page-sale .tab-btn').forEach(b=>b.classList.remove('active'));
  $$('#page-sale .tab-content').forEach(t=>t.classList.remove('active'));
  const tb=g('stab-'+tab+'-btn'), tc=g('stab-'+tab);
  if(tb) tb.classList.add('active'); if(tc) tc.classList.add('active');
  g('pageTitle').textContent='Sale — Daily Sale';
}
function openCustomerTab(tab, btn){
  $$('.page').forEach(p=>p.classList.remove('active'));
  g('page-customer').classList.add('active');
  $$('.submenu-item').forEach(e=>e.classList.remove('active'));
  $$('.nav-item').forEach(e=>e.classList.remove('active'));
  if(btn) btn.classList.add('active');
  g('customerNavBtn').classList.add('active','open');
  g('customerSubmenu').classList.add('open');
  switchCustomerTab(tab); currentPage='customer';
}
function switchCustomerTab(tab){
  currentCustomerTab=tab;
  $$('#page-customer .tab-btn').forEach(b=>b.classList.remove('active'));
  $$('#page-customer .tab-content').forEach(t=>t.classList.remove('active'));
  const tb=g('ctab-'+tab+'-btn'), tc=g('ctab-'+tab);
  if(tb) tb.classList.add('active'); if(tc) tc.classList.add('active');
  g('pageTitle').textContent = {newCustomer:'Customer — New Customer',topUp:'Customer — Top Up',termination:'Customer — Termination'}[tab]||tab;
}
function openSettingsTab(tab, btn){
  $$('.page').forEach(p=>p.classList.remove('active'));
  g('page-settings').classList.add('active');
  $$('.submenu-item').forEach(e=>e.classList.remove('active'));
  $$('.nav-item').forEach(e=>e.classList.remove('active'));
  if(btn) btn.classList.add('active');
  g('settingsNavBtn').classList.add('active','open');
  g('settingsSubmenu').classList.add('open');
  switchSettingsTab(tab); currentPage='settings';
}
function switchSettingsTab(tab){
  currentSettingsTab=tab;
  $$('#page-settings .tab-btn').forEach(b=>b.classList.remove('active'));
  $$('#page-settings .tab-content').forEach(t=>t.classList.remove('active'));
  const tb=g('tab-'+tab+'-btn'), tc=g('tab-'+tab);
  if(tb) tb.classList.add('active'); if(tc) tc.classList.add('active');
  if(tab==='permission') renderStaffTable();
  else if(tab==='kpi') renderKpiTable();
  else renderAccessContent(tab);
  g('pageTitle').textContent='Settings — '+(TAB_LBL[tab]||tab);
}
function renderAccessContent(tab){
  const el=g(tab+'-content'); if(!el) return;
  const ok=(TAB_PERM[tab]||[]).includes(currentRole);
  el.innerHTML=ok
    ?`<div style="padding:24px;color:#aaa;font-size:13px;">Promotion settings content here.</div>`
    :`<div class="access-denied"><i class="fa-solid fa-lock"></i><h3>Access Denied</h3>
       <p>Required: <strong>${(TAB_PERM[tab]||[]).map(r=>r[0].toUpperCase()+r.slice(1)).join(' or ')}</strong></p></div>`;
}

// ═══════════════════════════════════════════════════════
// ROLE SWITCHER
// ═══════════════════════════════════════════════════════
function switchRole(role){
  currentRole=role;
  const labels={admin:'Admin',supervisor:'Supervisor',user:'User'};
  const names ={admin:'Admin User',supervisor:'Supervisor',user:'User'};
  const inits ={admin:'AU',supervisor:'SU',user:'US'};
  g('roleBadgeDisplay').textContent = labels[role]||role;
  g('userNameDisplay').textContent  = names[role]||role;
  g('userAvatar').textContent       = inits[role]||'U';
  if(['permission','kpi','promotionSetting'].includes(currentSettingsTab)) renderAccessContent(currentSettingsTab);
}

// ═══════════════════════════════════════════════════════
// MODAL HELPERS
// ═══════════════════════════════════════════════════════
function openModal(id){ const el=g('modal-'+id); if(el){el.classList.add('open'); document.body.style.overflow='hidden';} }
function closeModal(id){ const el=g('modal-'+id); if(el){el.classList.remove('open'); document.body.style.overflow='';} }
function handleOverlay(e, id){ if(e.target===g('modal-'+id)) closeModal(id); }
function openAddModal(type){
  if(type==='addItem')        openItemModal();
  else if(type==='newCustomer')   openCustomerModal('newCustomer');
  else if(type==='topUp')         openCustomerModal('topUp');
  else if(type==='termination')   openCustomerModal('termination');
  else if(type==='kpi')           openKpiModal();
  else if(type==='addUser')       openUserModal();
}
function togglePwd(inputId, eyeId){
  const inp=g(inputId), eye=g(eyeId); if(!inp||!eye) return;
  if(inp.type==='password'){inp.type='text'; eye.className='fa-regular fa-eye-slash';}
  else{inp.type='password'; eye.className='fa-regular fa-eye';}
}

// ═══════════════════════════════════════════════════════
// ITEM CATALOGUE
// ═══════════════════════════════════════════════════════
function openItemModal(item){
  g('item-edit-id').value   = item ? item.id : '';
  g('item-name').value      = item ? item.name : '';
  g('item-shortcut').value  = item ? item.shortcut : '';
  g('item-price').value     = item ? (item.price||'') : '';
  g('item-desc').value      = item ? (item.desc||'') : '';
  g('item-category').value  = item ? (item.category||'') : '';
  g('item-status').value    = item ? (item.status||'Active') : 'Active';
  const grp = item ? item.group : 'unit';
  g('item-group').value     = grp; itemGroupSelected=grp;
  g('grpBtn-unit').className   = 'group-btn'+(grp==='unit'?' active':'');
  g('grpBtn-dollar').className = 'group-btn'+(grp==='dollar'?' active dollar-active':'');
  const cur=item?item.currency:'$';
  if(KNOWN_CURS.includes(cur)){g('item-currency').value=cur; g('item-custom-currency-group').style.display='none';}
  else{g('item-currency').value='custom'; g('item-custom-currency').value=cur||''; g('item-custom-currency-group').style.display='';}
  const unt=item?item.unit:'';
  if(!unt||KNOWN_UNITS.includes(unt)){g('item-unit').value=unt||''; g('item-custom-unit-group').style.display='none';}
  else{g('item-unit').value='custom'; g('item-custom-unit').value=unt; g('item-custom-unit-group').style.display='';}
  g('addItem-title').textContent = item ? 'Edit Item' : 'Add Item';
  g('addItem-sub').textContent   = item ? 'Update this catalogue item' : 'Create a new sale catalogue item';
  g('item-save-label').textContent = item ? 'Update Item' : 'Save Item';
  openModal('addItem');
}
function selectItemGroup(grp){
  itemGroupSelected=grp; g('item-group').value=grp;
  g('grpBtn-unit').className   = 'group-btn'+(grp==='unit'?' active':'');
  g('grpBtn-dollar').className = 'group-btn'+(grp==='dollar'?' active dollar-active':'');
}
function toggleCustomCurrency(){
  const v=rv('item-currency');
  g('item-custom-currency-group').style.display=(v==='custom')?'':'none';
}
function toggleCustomUnit(){
  const v=rv('item-unit');
  g('item-custom-unit-group').style.display=(v==='custom')?'':'none';
}
function submitItem(e){
  e.preventDefault();
  const curSel=rv('item-currency'), cur=curSel==='custom'?rt('item-custom-currency'):curSel;
  const untSel=rv('item-unit'),     unt=untSel==='custom'?rt('item-custom-unit'):untSel;
  const id=rt('item-edit-id');
  const obj={
    id:id||uid(), name:rt('item-name'), shortcut:rt('item-shortcut').toUpperCase(),
    group:g('item-group').value, currency:cur||'$', price:parseFloat(rv('item-price'))||0,
    unit:unt, category:rv('item-category'), status:rv('item-status'), desc:rt('item-desc')
  };
  if(id){ const idx=itemCatalogue.findIndex(i=>i.id===id); if(idx>-1) itemCatalogue[idx]=obj; }
  else   { itemCatalogue.push(obj); }
  closeModal('addItem'); renderItemChips(); renderSaleTable(); renderDashboard();
}
function editItem(id){ const it=itemCatalogue.find(i=>i.id===id); if(it) openItemModal(it); }
function deleteItem(id){ if(confirm('Delete this item?')){itemCatalogue=itemCatalogue.filter(i=>i.id!==id); renderItemChips(); renderSaleTable(); renderDashboard();} }
function renderItemChips(){
  const c=g('itemChipsContainer'); if(!c) return;
  const active=itemCatalogue.filter(i=>i.status==='Active');
  if(!active.length){
    c.innerHTML=`<span class="no-items-hint"><i class="fa-solid fa-circle-info"></i>&nbsp;No items yet — click <strong style="margin:0 3px;">Add Items</strong> to build your catalogue.</span>`;
    return;
  }
  c.innerHTML=active.map(it=>{
    const isDollar=it.group==='dollar';
    const priceStr=it.price?` <span class="chip-price">${it.currency||'$'}${it.price}</span>`:'';
    const unitStr =it.unit?` <span class="chip-unit">${it.unit}</span>`:'';
    return `<span class="item-chip${isDollar?' dollar-chip':''}" title="${esc(it.name)} — click to edit" onclick="editItem('${it.id}')">
      ${esc(it.name)}${unitStr}${priceStr}
      <span class="chip-shortcut">${esc(it.shortcut)}</span>
    </span>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// NEW SALE MODAL
// ═══════════════════════════════════════════════════════
function openNewSaleModal(sale){
  g('sale-edit-id').value = sale ? sale.id : '';
  g('sale-agent').value   = sale ? sale.agent : '';
  g('sale-branch').value  = sale ? sale.branch : '';
  g('sale-date').value    = sale ? sale.dateRaw : new Date().toISOString().slice(0,10);
  g('sale-note').value    = sale ? (sale.note||'') : '';
  g('newSale-title').textContent    = sale ? 'Edit Sale' : 'New Sale';
  g('newSale-sub').textContent      = sale ? 'Update this sale record' : 'Record a sale for an agent';
  g('sale-save-label').textContent  = sale ? 'Update Sale' : 'Save Sale';

  // Build unit items grid
  const unitItems   = itemCatalogue.filter(i=>i.status==='Active'&&i.group==='unit');
  const dollarItems = itemCatalogue.filter(i=>i.status==='Active'&&i.group==='dollar');

  const uGrid=g('saleUnitItemsGrid'), dGrid=g('saleDollarItemsGrid');
  const uMsg=g('noUnitItemsMsg'),     dMsg=g('noDollarItemsMsg');

  if(unitItems.length){
    uMsg.style.display='none';
    uGrid.innerHTML=unitItems.map(it=>`
      <div class="sale-item-card">
        <div class="sic-name"><span class="sic-shortcut">${esc(it.shortcut)}</span>${esc(it.name)}</div>
        <div class="sic-sub">${it.unit||'units'}</div>
        <div class="sic-input-wrap">
          <label>Qty</label>
          <input class="sic-input" type="number" min="0" step="1" id="uqty_${it.id}"
            value="${sale&&sale.unitQtys?.[it.id]||''}"
            placeholder="0" oninput="updateSaleModalTotals()"/>
        </div>
      </div>`).join('');
    uGrid.style.display='grid';
  } else {
    uMsg.style.display='flex'; uGrid.innerHTML=''; uGrid.style.display='none';
  }

  if(dollarItems.length){
    dMsg.style.display='none';
    dGrid.innerHTML=dollarItems.map(it=>`
      <div class="sale-item-card dollar-card">
        <div class="sic-name"><span class="sic-shortcut">${esc(it.shortcut)}</span>${esc(it.name)}</div>
        <div class="sic-sub">${it.currency||'$'} amount</div>
        <div class="sic-input-wrap">
          <label>Amt</label>
          <input class="sic-input" type="number" min="0" step="0.01" id="damt_${it.id}"
            value="${sale&&sale.dollarAmts?.[it.id]||''}"
            placeholder="0.00" oninput="updateSaleModalTotals()"/>
        </div>
      </div>`).join('');
    dGrid.style.display='grid';
  } else {
    dMsg.style.display='flex'; dGrid.innerHTML=''; dGrid.style.display='none';
  }

  updateSaleModalTotals();
  openModal('newSale');
}
function updateSaleModalTotals(){
  const unitItems   = itemCatalogue.filter(i=>i.status==='Active'&&i.group==='unit');
  const dollarItems = itemCatalogue.filter(i=>i.status==='Active'&&i.group==='dollar');
  let totalUnits=0, totalRev=0;
  unitItems.forEach(it=>{ totalUnits+=parseFloat(g('uqty_'+it.id)?.value||0)||0; });
  dollarItems.forEach(it=>{ totalRev+=parseFloat(g('damt_'+it.id)?.value||0)||0; });
  const cur = dollarItems[0]?.currency||'$';
  g('modalTotalUnits').textContent   = totalUnits;
  g('modalTotalRevenue').textContent = fmtMoney(totalRev, cur);
}
function submitSale(e){
  e.preventDefault();
  const unitItems   = itemCatalogue.filter(i=>i.status==='Active'&&i.group==='unit');
  const dollarItems = itemCatalogue.filter(i=>i.status==='Active'&&i.group==='dollar');
  const unitQtys={}, dollarAmts={};
  let totalUnits=0, totalRevenue=0;
  unitItems.forEach(it=>{
    const v=parseFloat(g('uqty_'+it.id)?.value||0)||0;
    unitQtys[it.id]=v; totalUnits+=v;
  });
  dollarItems.forEach(it=>{
    const v=parseFloat(g('damt_'+it.id)?.value||0)||0;
    dollarAmts[it.id]=v; totalRevenue+=v;
  });
  const revCur = dollarItems[0]?.currency||'$';
  const dateRaw= rv('sale-date');
  const dateDisp=dateRaw?new Date(dateRaw+'T00:00:00').toLocaleDateString():'';
  const id=rt('sale-edit-id');
  const obj={
    id:id||uid(), agent:rt('sale-agent'), branch:rt('sale-branch'),
    dateRaw, dateDisp, note:rt('sale-note'),
    unitQtys, dollarAmts, totalUnits, totalRevenue, revCur
  };
  if(id){ const idx=saleRecords.findIndex(s=>s.id===id); if(idx>-1) saleRecords[idx]=obj; }
  else   { saleRecords.push(obj); }
  filteredSales=[...saleRecords];
  closeModal('newSale'); renderSaleTable(); renderDashboard();
}
function editSale(id){ const s=saleRecords.find(r=>r.id===id); if(s) openNewSaleModal(s); }
function deleteSale(id){
  if(confirm('Delete this sale record?')){
    saleRecords=saleRecords.filter(s=>s.id!==id);
    filteredSales=filteredSales.filter(s=>s.id!==id);
    renderSaleTable(); renderDashboard();
  }
}

// ═══════════════════════════════════════════════════════
// SALE TABLE / SUMMARY
// ═══════════════════════════════════════════════════════
function applyReportFilters(){
  const from=rv('filter-date-from'), to=rv('filter-date-to');
  const agTxt=rt('filter-agent').toLowerCase(), brTxt=rt('filter-branch').toLowerCase();
  filteredSales=saleRecords.filter(s=>{
    if(from && s.dateRaw < from) return false;
    if(to   && s.dateRaw > to)   return false;
    if(agTxt && !s.agent.toLowerCase().includes(agTxt))  return false;
    if(brTxt && !s.branch.toLowerCase().includes(brTxt)) return false;
    return true;
  });
  renderSaleTable();
}
function clearReportFilters(){
  ['filter-date-from','filter-date-to','filter-agent','filter-branch'].forEach(id=>{if(g(id)) g(id).value='';});
  filteredSales=[...saleRecords]; renderSaleTable();
}
function setReportView(view){
  currentReportView=view;
  g('reportView-table').style.display   = view==='table'?'':'none';
  g('reportView-summary').style.display = view==='summary'?'':'none';
  g('viewBtn-table').classList.toggle('active',   view==='table');
  g('viewBtn-summary').classList.toggle('active', view==='summary');
  renderSaleTable();
}
function renderSaleTable(){
  const data = filteredSales.length||saleRecords.length ? filteredSales : [];
  // KPI
  const totalQty = data.reduce((a,r)=>a+(r.totalUnits||0),0);
  const totalRev = data.reduce((a,r)=>a+(r.totalRevenue||0),0);
  const agents   = new Set(data.map(r=>r.agent)).size;
  const cur      = data.find(r=>r.revCur)?.revCur||'$';
  g('kpi-total-sales').textContent = data.length;
  g('kpi-total-qty').textContent   = totalQty;
  g('kpi-agents').textContent      = agents;
  g('kpi-revenue').textContent     = fmtMoney(totalRev, cur);

  const badge=g('saleCountBadge');
  if(badge){ badge.textContent=data.length+' records'; badge.style.display=data.length?'':'none'; }

  const unitItems   = itemCatalogue.filter(i=>i.group==='unit');
  const dollarItems = itemCatalogue.filter(i=>i.group==='dollar');

  if(currentReportView==='summary'){ renderSummaryView(data, unitItems, dollarItems); return; }

  // --- TABLE VIEW ---
  const thead=g('saleTableHead'), tbody=g('saleTableBody');
  if(!thead||!tbody) return;

  // Build dynamic header
  let hRow1='<tr><th rowspan="2">#</th><th rowspan="2">Agent</th><th rowspan="2">Branch</th><th rowspan="2">Date</th>';
  if(unitItems.length) hRow1+=`<th colspan="${unitItems.length}" class="th-group-unit"><i class="fa-solid fa-hashtag"></i> Unit Group</th>`;
  if(dollarItems.length) hRow1+=`<th colspan="${dollarItems.length}" class="th-group-dollar"><i class="fa-solid fa-dollar-sign"></i> Dollar Group</th>`;
  hRow1+='<th rowspan="2">Revenue</th><th rowspan="2">Note</th><th rowspan="2">Action</th></tr>';
  let hRow2='<tr>';
  unitItems.forEach(it=>  { hRow2+=`<th class="th-unit">${esc(it.shortcut)}</th>`; });
  dollarItems.forEach(it=>{ hRow2+=`<th class="th-dollar">${esc(it.shortcut)}</th>`; });
  hRow2+='</tr>';
  thead.innerHTML=hRow1+hRow2;

  if(!data.length){
    const cols=4+unitItems.length+dollarItems.length+3;
    tbody.innerHTML=`<tr><td colspan="${cols}" class="empty-state"><i class="fa-solid fa-receipt"></i><p>No sales yet — click <strong>New Sale</strong> to add one.</p></td></tr>`;
    g('saleTotalBar').style.display='none'; return;
  }

  tbody.innerHTML=data.map((r,i)=>{
    const avCls=AV_COLORS[i%AV_COLORS.length];
    let cells='';
    unitItems.forEach(it  =>{ cells+=`<td class="td-unit">${r.unitQtys?.[it.id]||'—'}</td>`; });
    dollarItems.forEach(it=>{ const v=r.dollarAmts?.[it.id]; cells+=`<td class="td-dollar">${v?fmtMoney(v,r.revCur):'—'}</td>`; });
    return `<tr>
      <td>${i+1}</td>
      <td><div class="name-cell"><div class="avatar ${avCls}">${ini(r.agent)}</div><span class="name-text">${esc(r.agent)}</span></div></td>
      <td>${esc(r.branch)}</td>
      <td>${esc(r.dateDisp)}</td>
      ${cells}
      <td class="td-revenue">${fmtMoney(r.totalRevenue,r.revCur)}</td>
      <td><span style="font-size:12px;color:#aaa;">${esc(r.note||'—')}</span></td>
      <td><div class="action-btns">
        <button class="action-btn edit"   onclick="editSale('${r.id}')"   title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="action-btn delete" onclick="deleteSale('${r.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');

  // Total bar
  const tbar=g('saleTotalBar'), tgrp=g('totalBarGroups');
  if(tbar&&tgrp){
    tbar.style.display='';
    let html='';
    unitItems.forEach(it=>{
      const tot=data.reduce((a,r)=>a+(r.unitQtys?.[it.id]||0),0);
      html+=`<div class="total-bar-item tbi-unit"><span class="tbi-label">${esc(it.shortcut)}</span><span class="tbi-val">${tot}</span></div>`;
    });
    dollarItems.forEach(it=>{
      const tot=data.reduce((a,r)=>a+(r.dollarAmts?.[it.id]||0),0);
      html+=`<div class="total-bar-item tbi-dollar"><span class="tbi-label">${esc(it.shortcut)}</span><span class="tbi-val">${fmtMoney(tot,cur)}</span></div>`;
    });
    html+=`<div class="total-bar-item tbi-dollar"><span class="tbi-label">Total Rev</span><span class="tbi-val">${fmtMoney(totalRev,cur)}</span></div>`;
    tgrp.innerHTML=html;
  }
}
function renderSummaryView(data, unitItems, dollarItems){
  const grid=g('summaryGrid'); if(!grid) return;
  if(!data.length){ grid.innerHTML=`<div class="empty-state"><i class="fa-solid fa-chart-bar"></i><p>No data to summarise.</p></div>`; return; }
  const agentMap={};
  data.forEach(r=>{
    if(!agentMap[r.agent]) agentMap[r.agent]={agent:r.agent,branch:r.branch,records:[],totalUnits:0,totalRev:0,revCur:r.revCur};
    agentMap[r.agent].records.push(r);
    agentMap[r.agent].totalUnits  += r.totalUnits||0;
    agentMap[r.agent].totalRev    += r.totalRevenue||0;
  });
  grid.innerHTML=Object.values(agentMap).map((a,i)=>{
    const avCls=AV_COLORS[i%AV_COLORS.length];
    let uRows='', dRows='';
    unitItems.forEach(it=>{
      const tot=a.records.reduce((s,r)=>s+(r.unitQtys?.[it.id]||0),0);
      if(tot) uRows+=`<div class="summary-item-row"><span class="summary-item-name"><i class="fa-solid fa-hashtag" style="font-size:10px;color:#aaa;"></i>${esc(it.name)}</span>
        <div class="summary-item-right"><span class="summary-item-qty">${it.unit||'units'}</span><span class="summary-item-val unit-val">${tot}</span></div></div>`;
    });
    dollarItems.forEach(it=>{
      const tot=a.records.reduce((s,r)=>s+(r.dollarAmts?.[it.id]||0),0);
      if(tot) dRows+=`<div class="summary-item-row"><span class="summary-item-name"><i class="fa-solid fa-dollar-sign" style="font-size:10px;color:#aaa;"></i>${esc(it.name)}</span>
        <div class="summary-item-right"><span class="summary-item-val dollar-val">${fmtMoney(tot,a.revCur)}</span></div></div>`;
    });
    return `<div class="summary-card">
      <div class="summary-card-header">
        <div class="agent-name"><div class="avatar ${avCls}">${ini(a.agent)}</div>${esc(a.agent)}</div>
        <div class="summary-totals">
          <span class="st-unit">${a.totalUnits} units</span>
          <span class="st-dollar">${fmtMoney(a.totalRev,a.revCur)}</span>
        </div>
      </div>
      <div class="summary-card-body">
        ${uRows?`<span class="summary-group-label unit-label">Unit Group</span>${uRows}`:''}
        ${dRows?`<span class="summary-group-label dollar-label">Dollar Group</span>${dRows}`:''}
        ${(!uRows&&!dRows)?'<p style="color:#ccc;font-size:12px;">No item data recorded.</p>':''}
      </div>
      <div class="summary-card-footer">
        <span class="foot-label">${esc(a.branch)}</span>
        <span class="foot-val">${a.records.length} sale(s)</span>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function renderDashboard(){
  // populate branch filter
  const branches=[...new Set(saleRecords.map(s=>s.branch).filter(Boolean))].sort();
  const sel=g('dashBranchFilter');
  const saved=sel?sel.value:'';
  if(sel){
    sel.innerHTML='<option value="">All Branches</option>'+branches.map(b=>`<option value="${esc(b)}"${b===saved?' selected':''}>${esc(b)}</option>`).join('');
  }
  const branchF=sel?sel.value:'';
  const records=branchF?saleRecords.filter(s=>s.branch===branchF):saleRecords;

  const now=ymNow(), prev=ymPrev();
  const thisMon=records.filter(s=>ymOf(s.dateRaw)===now);
  const lastMon=records.filter(s=>ymOf(s.dateRaw)===prev);

  const tSales=thisMon.length,  lSales=lastMon.length;
  const tUnits=thisMon.reduce((a,r)=>a+(r.totalUnits||0),0);
  const lUnits=lastMon.reduce((a,r)=>a+(r.totalUnits||0),0);
  const tRev  =thisMon.reduce((a,r)=>a+(r.totalRevenue||0),0);
  const lRev  =lastMon.reduce((a,r)=>a+(r.totalRevenue||0),0);
  const tAg   =new Set(thisMon.map(r=>r.agent)).size;
  const lAg   =new Set(lastMon.map(r=>r.agent)).size;
  const cur   =thisMon.find(r=>r.revCur)?.revCur||'$';

  g('dash-total-sales').textContent   = tSales;
  g('dash-total-units').textContent   = tUnits;
  g('dash-total-revenue').textContent = fmtMoney(tRev,cur);
  g('dash-total-agents').textContent  = tAg;
  setTrend('dash-sales-trend',   tSales, lSales);
  setTrend('dash-units-trend',   tUnits, lUnits);
  setTrend('dash-revenue-trend', tRev,   lRev);
  setTrend('dash-agents-trend',  tAg,    lAg);

  const months=last7Months();
  const uByM = months.map(m=>records.filter(s=>ymOf(s.dateRaw)===m).reduce((a,r)=>a+(r.totalUnits||0),0));
  const rByM = months.map(m=>records.filter(s=>ymOf(s.dateRaw)===m).reduce((a,r)=>a+(r.totalRevenue||0),0));
  const mlbls = months.map(ymLabel);

  // Chart 1: Monthly Trend (line)
  _cTrend=destroyChart(_cTrend);
  _cTrend=new Chart(g('chartMonthlyTrend'),{
    type:'line',
    data:{labels:mlbls,datasets:[
      {label:'Units',   data:uByM, borderColor:'#1B7D3D', backgroundColor:'rgba(27,125,61,.09)', tension:.4, fill:true, pointBackgroundColor:'#1B7D3D', pointRadius:4, yAxisID:'y'},
      {label:'Revenue', data:rByM, borderColor:'#e65100', backgroundColor:'rgba(230,81,0,.07)',  tension:.4, fill:true, pointBackgroundColor:'#e65100', pointRadius:4, yAxisID:'y2'}
    ]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}}},
      scales:{
        y: {beginAtZero:true,ticks:{font:{size:10}},grid:{color:'#f5f5f5'},title:{display:true,text:'Units',font:{size:10}}},
        y2:{beginAtZero:true,position:'right',ticks:{font:{size:10}},grid:{drawOnChartArea:false},title:{display:true,text:'Revenue',font:{size:10}}}
      }}
  });

  // Chart 2: Item Mix (doughnut)
  _cMix=destroyChart(_cMix);
  const uItems=itemCatalogue.filter(i=>i.status==='Active'&&i.group==='unit');
  const mixData=uItems.map(it=>thisMon.reduce((a,r)=>a+(r.unitQtys?.[it.id]||0),0));
  if(uItems.length && mixData.some(v=>v>0)){
    _cMix=new Chart(g('chartItemMix'),{
      type:'doughnut',
      data:{labels:uItems.map(i=>i.shortcut||i.name),datasets:[{data:mixData,backgroundColor:CHART_PAL,borderWidth:2,borderColor:'#fff'}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'60%',
        plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:12}}}}
    });
  } else { clearCanvas('chartItemMix','No unit data this month'); }

  // Chart 3: Agent Performance (bar)
  _cAgent=destroyChart(_cAgent);
  const agMap={};
  thisMon.forEach(r=>{ agMap[r.agent]=(agMap[r.agent]||0)+(r.totalUnits||0); });
  const agEntries=Object.entries(agMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(agEntries.length){
    _cAgent=new Chart(g('chartAgentPerf'),{
      type:'bar',
      data:{labels:agEntries.map(a=>a[0]),datasets:[{label:'Units',data:agEntries.map(a=>a[1]),backgroundColor:CHART_PAL[0],borderRadius:6}]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',
        plugins:{legend:{display:false}},
        scales:{x:{beginAtZero:true,ticks:{font:{size:10}}},y:{ticks:{font:{size:10}}}}}
    });
  } else { clearCanvas('chartAgentPerf','No data this month'); }

  // Chart 4: Growth vs Last Month (grouped bar per item)
  _cGrowth=destroyChart(_cGrowth);
  const allItems=[...itemCatalogue.filter(i=>i.status==='Active')];
  if(allItems.length){
    const gLabels=allItems.map(i=>i.shortcut||i.name);
    const gThis=allItems.map(it=>{
      if(it.group==='unit') return thisMon.reduce((a,r)=>a+(r.unitQtys?.[it.id]||0),0);
      return thisMon.reduce((a,r)=>a+(r.dollarAmts?.[it.id]||0),0);
    });
    const gPrev=allItems.map(it=>{
      if(it.group==='unit') return lastMon.reduce((a,r)=>a+(r.unitQtys?.[it.id]||0),0);
      return lastMon.reduce((a,r)=>a+(r.dollarAmts?.[it.id]||0),0);
    });
    _cGrowth=new Chart(g('chartGrowth'),{
      type:'bar',
      data:{labels:gLabels,datasets:[
        {label:'This Month', data:gThis, backgroundColor:'#1B7D3D', borderRadius:5},
        {label:'Last Month', data:gPrev, backgroundColor:'#a5d6a7', borderRadius:5}
      ]},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}}},
        scales:{x:{ticks:{font:{size:10}}},y:{beginAtZero:true,ticks:{font:{size:10}}}}}
    });
  } else { clearCanvas('chartGrowth','Add items & sales to see growth'); }

  // Branch summary table
  const branchTbl=g('dashBranchTable'); if(!branchTbl) return;
  const bMap={};
  records.forEach(r=>{
    if(!bMap[r.branch]) bMap[r.branch]={branch:r.branch,sales:0,units:0,rev:0,agents:new Set(),cur:r.revCur};
    if(ymOf(r.dateRaw)===now){
      bMap[r.branch].sales++; bMap[r.branch].units+=r.totalUnits||0;
      bMap[r.branch].rev+=r.totalRevenue||0; bMap[r.branch].agents.add(r.agent);
    }
  });
  const bPrev={};
  records.filter(r=>ymOf(r.dateRaw)===prev).forEach(r=>{
    if(!bPrev[r.branch]) bPrev[r.branch]={units:0};
    bPrev[r.branch].units+=(r.totalUnits||0);
  });
  const bEntries=Object.values(bMap);
  if(!bEntries.length){
    branchTbl.innerHTML=`<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-building"></i><p>No branch data yet.</p></td></tr>`; return;
  }
  branchTbl.innerHTML=bEntries.map((b,i)=>{
    const lUnitsB=(bPrev[b.branch]?.units)||0;
    const p=pctChange(b.units,lUnitsB);
    const trendCls=p>0?'pill-green':p<0?'pill-red':'pill-gray';
    const trendLbl=p>0?'▲ '+p+'%':p<0?'▼ '+Math.abs(p)+'%':'— 0%';
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${esc(b.branch)}</strong></td>
      <td>${b.sales}</td>
      <td>${b.units}</td>
      <td>${fmtMoney(b.rev,b.cur)}</td>
      <td>${b.agents.size}</td>
      <td><span class="pill ${trendCls}">${trendLbl}</span></td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// CUSTOMER — NEW CUSTOMER
// ═══════════════════════════════════════════════════════
function openCustomerModal(type, item){
  if(type==='newCustomer'){
    g('nc-edit-id').value   = item?item.id:'';
    g('nc-agent').value     = item?item.agent:'';
    g('nc-branch').value    = item?item.branch:'';
    g('nc-name').value      = item?item.name:'';
    g('nc-phone').value     = item?item.phone:'';
    g('nc-product').value   = item?item.product:'';
    g('nc-status').value    = item?item.status:'';
    g('nc-remark').value    = item?item.remark:'';
    g('nc-modal-title').textContent = item?'Edit Customer':'Add New Customer';
    g('nc-modal-sub').textContent   = item?'Update customer lead details':'Fill in the customer lead details';
    openModal('newCustomer');
  } else if(type==='topUp'){
    g('tu-edit-id').value   = item?item.id:'';
    g('tu-agent').value     = item?item.agent:'';
    g('tu-branch').value    = item?item.branch:'';
    g('tu-name').value      = item?item.name:'';
    g('tu-phone').value     = item?item.phone:'';
    g('tu-product').value   = item?item.product:'';
    g('tu-status').value    = item?item.status:'';
    g('tu-remark').value    = item?item.remark:'';
    g('tu-modal-title').textContent = item?'Edit Top Up':'Add Top Up';
    openModal('topUp');
  } else if(type==='termination'){
    g('tm-edit-id').value   = item?item.id:'';
    g('tm-agent').value     = item?item.agent:'';
    g('tm-branch').value    = item?item.branch:'';
    g('tm-name').value      = item?item.name:'';
    g('tm-phone').value     = item?item.phone:'';
    g('tm-product').value   = item?item.product:'';
    g('tm-remark').value    = item?item.remark:'';
    g('tm-modal-title').textContent = item?'Edit Termination':'Add Termination';
    openModal('termination');
  }
}
function submitNewCustomer(e){
  e.preventDefault();
  const id=rt('nc-edit-id');
  const obj={id:id||uid(),agent:rt('nc-agent'),branch:rt('nc-branch'),name:rt('nc-name'),phone:rt('nc-phone'),product:rv('nc-product'),status:rv('nc-status'),remark:rt('nc-remark')};
  if(id){const idx=newCustomers.findIndex(c=>c.id===id);if(idx>-1)newCustomers[idx]=obj;}else newCustomers.push(obj);
  closeModal('newCustomer'); renderNewCustomerTable();
}
function editNewCustomer(id){const c=newCustomers.find(x=>x.id===id);if(c)openCustomerModal('newCustomer',c);}
function deleteNewCustomer(id){if(confirm('Delete this customer?')){newCustomers=newCustomers.filter(c=>c.id!==id);renderNewCustomerTable();}}
function renderNewCustomerTable(){
  const tb=g('newCustomerBody'); if(!tb) return;
  if(!newCustomers.length){tb.innerHTML=`<tr><td colspan="9" class="empty-state"><i class="fa-solid fa-user-plus"></i><p>No customers yet.</p></td></tr>`;return;}
  tb.innerHTML=newCustomers.map((c,i)=>`<tr>
    <td>${i+1}</td>
    <td><div class="name-cell"><div class="avatar ${AV_COLORS[i%AV_COLORS.length]}">${ini(c.name)}</div><span class="name-text">${esc(c.name)}</span></div></td>
    <td>${esc(c.phone)}</td><td>${esc(c.agent)}</td><td>${esc(c.branch)}</td>
    <td><span class="pill ${PROD_COL[c.product]||'pill-gray'}">${esc(c.product)}</span></td>
    <td><span class="pill ${NC_COL[c.status]||'pill-gray'} pill-dot">${esc(c.status)}</span></td>
    <td><span style="font-size:12px;color:#aaa;">${esc(c.remark||'—')}</span></td>
    <td><div class="action-btns">
      <button class="action-btn edit"   onclick="editNewCustomer('${c.id}')"   title="Edit"><i class="fa-solid fa-pen"></i></button>
      <button class="action-btn delete" onclick="deleteNewCustomer('${c.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div></td>
  </tr>`).join('');
}

// ─── TOP UP ───────────────────────────────────────────
function submitTopUp(e){
  e.preventDefault();
  const id=rt('tu-edit-id');
  const obj={id:id||uid(),agent:rt('tu-agent'),branch:rt('tu-branch'),name:rt('tu-name'),phone:rt('tu-phone'),product:rv('tu-product'),status:rv('tu-status'),remark:rt('tu-remark')};
  if(id){const idx=topUpList.findIndex(c=>c.id===id);if(idx>-1)topUpList[idx]=obj;}else topUpList.push(obj);
  closeModal('topUp'); renderTopUpTable();
}
function editTopUp(id){const c=topUpList.find(x=>x.id===id);if(c)openCustomerModal('topUp',c);}
function deleteTopUp(id){if(confirm('Delete this record?')){topUpList=topUpList.filter(c=>c.id!==id);renderTopUpTable();}}
function renderTopUpTable(){
  const tb=g('topUpBody'); if(!tb) return;
  if(!topUpList.length){tb.innerHTML=`<tr><td colspan="9" class="empty-state"><i class="fa-solid fa-arrow-up-right-dots"></i><p>No top up records yet.</p></td></tr>`;return;}
  const stCls={'Active':'pill-green','Termination':'pill-red'};
  tb.innerHTML=topUpList.map((c,i)=>`<tr>
    <td>${i+1}</td>
    <td><div class="name-cell"><div class="avatar ${AV_COLORS[i%AV_COLORS.length]}">${ini(c.name)}</div><span class="name-text">${esc(c.name)}</span></div></td>
    <td>${esc(c.phone)}</td><td>${esc(c.agent)}</td><td>${esc(c.branch)}</td>
    <td><span class="pill ${PROD_COL[c.product]||'pill-gray'}">${esc(c.product)}</span></td>
    <td><span class="pill ${stCls[c.status]||'pill-gray'} pill-dot">${esc(c.status)}</span></td>
    <td><span style="font-size:12px;color:#aaa;">${esc(c.remark||'—')}</span></td>
    <td><div class="action-btns">
      <button class="action-btn edit"   onclick="editTopUp('${c.id}')"   title="Edit"><i class="fa-solid fa-pen"></i></button>
      <button class="action-btn delete" onclick="deleteTopUp('${c.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div></td>
  </tr>`).join('');
}

// ─── TERMINATION ─────────────────────────────────────
function submitTermination(e){
  e.preventDefault();
  const id=rt('tm-edit-id');
  const obj={id:id||uid(),agent:rt('tm-agent'),branch:rt('tm-branch'),name:rt('tm-name'),phone:rt('tm-phone'),product:rv('tm-product'),remark:rt('tm-remark'),date:new Date().toLocaleDateString()};
  if(id){const idx=terminationList.findIndex(c=>c.id===id);if(idx>-1)terminationList[idx]=obj;}else terminationList.push(obj);
  closeModal('termination'); renderTerminationTable();
}
function editTermination(id){const c=terminationList.find(x=>x.id===id);if(c)openCustomerModal('termination',c);}
function deleteTermination(id){if(confirm('Delete this record?')){terminationList=terminationList.filter(c=>c.id!==id);renderTerminationTable();}}
function renderTerminationTable(){
  const tb=g('terminationBody'); if(!tb) return;
  if(!terminationList.length){tb.innerHTML=`<tr><td colspan="9" class="empty-state"><i class="fa-solid fa-ban"></i><p>No termination records yet.</p></td></tr>`;return;}
  tb.innerHTML=terminationList.map((c,i)=>`<tr>
    <td>${i+1}</td>
    <td><div class="name-cell"><div class="avatar ${AV_COLORS[i%AV_COLORS.length]}">${ini(c.name)}</div><span class="name-text">${esc(c.name)}</span></div></td>
    <td>${esc(c.phone)}</td><td>${esc(c.agent)}</td><td>${esc(c.branch)}</td>
    <td><span class="pill ${PROD_COL[c.product]||'pill-gray'}">${esc(c.product)}</span></td>
    <td><span style="font-size:12px;color:#888;">${esc(c.date||'—')}</span></td>
    <td><span style="font-size:12px;color:#aaa;">${esc(c.remark||'—')}</span></td>
    <td><div class="action-btns">
      <button class="action-btn edit"   onclick="editTermination('${c.id}')"   title="Edit"><i class="fa-solid fa-pen"></i></button>
      <button class="action-btn delete" onclick="deleteTermination('${c.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div></td>
  </tr>`).join('');
}

// ════════════════════════════════════════��══════════════
// STAFF / USER MANAGEMENT
// ═══════════════════════════════════════════════════════
function openUserModal(user){
  g('au-edit-id').value       = user?user.id:'';
  g('au-fullname').value      = user?user.fullname:'';
  g('au-username').value      = user?user.username:'';
  g('au-password').value      = '';
  g('au-role').value          = user?user.role:'';
  g('au-status').value        = user?user.status:'';
  g('au-branch').value        = user?user.branch:'';
  g('au-pwd-req').style.display  = user?'none':'';
  g('au-pwd-hint').style.display = user?'':'none';
  g('au-modal-title').textContent = user?'Edit User':'Add New User';
  g('au-modal-sub').textContent   = user?'Update staff account':'Create a staff account';
  g('au-save-label').textContent  = user?'Update User':'Save User';
  openModal('addUser');
}
function submitUser(e){
  e.preventDefault();
  const id=rt('au-edit-id');
  const obj={id:id||uid(),fullname:rt('au-fullname'),username:rt('au-username'),role:rv('au-role'),status:rv('au-status'),branch:rt('au-branch')};
  if(id){const idx=staffList.findIndex(s=>s.id===id);if(idx>-1)staffList[idx]=obj;}else staffList.push(obj);
  closeModal('addUser'); renderStaffTable();
}
function editUser(id){const u=staffList.find(s=>s.id===id);if(u)openUserModal(u);}
function deleteUser(id){if(confirm('Delete this user?')){staffList=staffList.filter(s=>s.id!==id);renderStaffTable();}}
function renderStaffTable(){
  const tb=g('staffTableBody'); if(!tb) return;
  if(!staffList.length){tb.innerHTML=`<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-users"></i><p>No staff yet — click <strong>Add User</strong>.</p></td></tr>`;return;}
  const roleCls={Admin:'pill-purple',Supervisor:'pill-blue',User:'pill-green'};
  const stCls  ={Active:'pill-green',Inactive:'pill-gray'};
  tb.innerHTML=staffList.map((u,i)=>`<tr>
    <td>${i+1}</td>
    <td><div class="name-cell"><div class="avatar ${AV_COLORS[i%AV_COLORS.length]}">${ini(u.fullname)}</div><span class="name-text">${esc(u.fullname)}</span></div></td>
    <td><span style="font-size:12px;color:#666;">@${esc(u.username)}</span></td>
    <td><span class="pill ${roleCls[u.role]||'pill-gray'}">${esc(u.role)}</span></td>
    <td>${esc(u.branch)}</td>
    <td><span class="pill ${stCls[u.status]||'pill-gray'} pill-dot">${esc(u.status)}</span></td>
    <td><div class="action-btns">
      <button class="action-btn edit"   onclick="editUser('${u.id}')"   title="Edit"><i class="fa-solid fa-pen"></i></button>
      <button class="action-btn delete" onclick="deleteUser('${u.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div></td>
  </tr>`).join('');
}

// ═══════════════════════════════════════════════════════
// KPI
// ═══════════════════════════════════════════════════════
function openKpiModal(item){
  g('kpi-edit-id').value     = item?item.id:'';
  g('kpi-name').value        = item?item.name:'';
  g('kpi-value').value       = item?item.value:'';
  g('kpi-unit-label').value  = item?item.unitLabel:'';
  g('kpi-period').value      = item?item.period:'';
  g('kpi-status').value      = item?item.kpiStatus:'';
  g('kpi-desc').value        = item?item.desc:'';
  kpiTypeSelected            = item?item.kpiType:'';
  $$('.kpi-chip').forEach(c=>{ c.classList.toggle('active', c.textContent.trim().includes(kpiTypeSelected)&&kpiTypeSelected!==''); });
  kpiValueMode = item?item.valueMode:'unit';
  setValueMode(kpiValueMode);
  if(item&&item.currency) g('kpi-currency').value=item.currency;
  if(item&&item.customCurrency) g('kpi-custom-currency').value=item.customCurrency;
  g('kpi-modal-title').textContent = item?'Edit KPI':'Add KPI';
  g('kpi-modal-sub').textContent   = item?'Update this KPI':'Define a new KPI metric';
  g('kpi-save-label').textContent  = item?'Update KPI':'Save KPI';
  openModal('kpi');
}
function selectKpiType(el, type){
  kpiTypeSelected=type;
  $$('.kpi-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
}
function setValueMode(mode){
  kpiValueMode=mode;
  g('btn-unit').classList.toggle('active',     mode==='unit');
  g('btn-currency').classList.toggle('active', mode==='currency');
  g('unit-label-group').style.display     = mode==='unit'?'':'none';
  g('currency-group').classList.toggle('visible', mode==='currency');
}
function submitKpi(e){
  e.preventDefault();
  const id=rt('kpi-edit-id');
  const curVal=rv('kpi-currency'), ccVal=rt('kpi-custom-currency');
  const obj={
    id:id||uid(), name:rt('kpi-name'), kpiType:kpiTypeSelected, value:parseFloat(rv('kpi-value'))||0,
    valueMode:kpiValueMode, unitLabel:rt('kpi-unit-label'),
    currency:curVal, customCurrency:ccVal,
    period:rv('kpi-period'), kpiStatus:rv('kpi-status'), desc:rt('kpi-desc')
  };
  if(id){const idx=kpiList.findIndex(k=>k.id===id);if(idx>-1)kpiList[idx]=obj;}else kpiList.push(obj);
  closeModal('kpi'); renderKpiTable();
}
function editKpi(id){const k=kpiList.find(x=>x.id===id);if(k)openKpiModal(k);}
function deleteKpi(id){if(confirm('Delete this KPI?')){kpiList=kpiList.filter(k=>k.id!==id);renderKpiTable();}}
function renderKpiTable(){
  const tb=g('kpiTableBody'); if(!tb) return;
  const sc=g('kpiSummaryCards');
  if(sc){
    if(!kpiList.length){sc.innerHTML='';} 
    else {
      sc.innerHTML=kpiList.slice(0,4).map(k=>{
        const sym=k.valueMode==='currency'?(k.currency==='Custom'?k.customCurrency:k.currency)||'$':'';
        const val=k.valueMode==='currency'?fmtMoney(k.value,sym):k.value;
        return `<div class="kpi-summary-card">
          <div class="kpi-card-label">${esc(k.kpiType||'KPI')}</div>
          <div class="kpi-card-value">${val}</div>
          <div class="kpi-card-unit">${esc(k.name)}</div>
        </div>`;
      }).join('');
    }
  }
  if(!kpiList.length){tb.innerHTML=`<tr><td colspan="8" class="empty-state"><i class="fa-solid fa-chart-line"></i><p>No KPIs yet — click <strong>Add KPI</strong>.</p></td></tr>`;return;}
  const pCls={Active:'pill-green',Inactive:'pill-gray',Draft:'pill-yellow'};
  tb.innerHTML=kpiList.map((k,i)=>{
    const sym=k.valueMode==='currency'?(k.currency==='Custom'?k.customCurrency:k.currency)||'$':'';
    const val=k.valueMode==='currency'?fmtMoney(k.value,sym):(k.value+(k.unitLabel?' '+k.unitLabel:''));
    const unitCur=k.valueMode==='currency'?(k.currency==='Custom'?k.customCurrency:k.currency)||'$':(k.unitLabel||'—');
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${esc(k.name)}</strong></td>
      <td>${k.kpiType?`<span class="pill pill-blue">${esc(k.kpiType)}</span>`:'—'}</td>
      <td><strong>${val}</strong></td>
      <td>${esc(unitCur)}</td>
      <td>${k.period?`<span class="pill pill-teal">${esc(k.period)}</span>`:'—'}</td>
      <td><span style="font-size:12px;color:#aaa;">${esc(k.desc||'—')}</span></td>
      <td><div class="action-btns">
        <button class="action-btn edit"   onclick="editKpi('${k.id}')"   title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="action-btn delete" onclick="deleteKpi('${k.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', ()=>{
  filteredSales=[...saleRecords];
  renderItemChips();
  renderSaleTable();
  renderDashboard();
  renderNewCustomerTable();
  renderTopUpTable();
  renderTerminationTable();
  renderStaffTable();
  renderKpiTable();
  // set today as default sale date
  const sd=g('sale-date');
  if(sd) sd.value=new Date().toISOString().slice(0,10);
});
