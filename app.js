'use strict';
/* La Gracia de Dios · POS demo — datos de ejemplo, todo en memoria. */

// ---------- Utilidades ----------
const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MIN = 60000;
const pad = n => String(n).padStart(2, '0');
const hhmm = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const mmss = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
const ICONS = {
  cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  list: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h6"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', x: '<path d="M18 6L6 18M6 6l12 12"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  check: '<path d="M20 6L9 17l-5-5"/>'
};
const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- Datos base ----------
const MESAS = 8, FEE = 3000, KITCHEN_GOAL = 12, STAMPS_GOAL = 8;
const PAY = { efectivo: ['💵', 'Efectivo'], tarjeta: ['💳', 'Tarjeta'], transferencia: ['📱', 'Transferencia'] };
const TYPE = { mesa: 'Mesa', llevar: 'Para llevar', domicilio: 'Domicilio' };
const CHANNEL = { mostrador: 'Mostrador', whatsapp: 'WhatsApp', plataforma: 'App de domicilios' };
const ROLES = {
  owner: ['venta', 'cocina', 'pedidos', 'inventario', 'costeo', 'clientes', 'indicadores'],
  cajero: ['venta', 'pedidos', 'clientes'],
  cocina: ['cocina', 'inventario']
};
const SHORT = { inventario: 'Stock', indicadores: 'Datos' };
const VIEWS = {
  venta: ['Venta', 'cart'], cocina: ['Cocina', 'flame'], pedidos: ['Pedidos', 'list'], inventario: ['Inventario', 'box'],
  costeo: ['Costeo', 'tag'], clientes: ['Clientes', 'users'], indicadores: ['Indicadores', 'chart']
};

// ---------- Estado ----------
let S;
function newTicket() { return { type: 'mesa', mesa: null, items: [], customerId: null, redeem: false, d: { name: '', phone: '', address: '', channel: 'whatsapp' } }; }
function seed() {
  const r = rng(7), t0 = Date.now();
  const supplies = SUPPLIES.map(x => ({ ...x }));
  const products = PRODUCTS.map(x => ({ ...x }));
  const customers = [
    { id: 1, name: 'María Ortiz', phone: '3000000001', stamps: 7 },
    { id: 2, name: 'Carlos Pérez', phone: '3000000002', stamps: 8 },
    { id: 3, name: 'Luisa Caballero', phone: '3000000003', stamps: 3 },
    { id: 4, name: 'Andrés Barrios', phone: '3000000004', stamps: 1 },
    { id: 5, name: 'Turista · Hotel Getsemaní', phone: '3000000005', stamps: 2 }
  ];
  const orders = [];
  for (let i = 0; i < 28; i++) {
    const created = t0 - (25 + r() * 295) * MIN;
    const n = 1 + Math.floor(r() * 3), items = [];
    for (let k = 0; k < n; k++) { const p = products[Math.floor(r() * products.length)]; items.push({ pid: p.id, name: p.name, price: p.price, qty: 1 + Math.floor(r() * 2), note: '' }); }
    const tr = r(), type = tr < .5 ? 'mesa' : tr < .8 ? 'llevar' : 'domicilio';
    const channel = type === 'domicilio' ? (r() < .6 ? 'whatsapp' : 'plataforma') : 'mostrador';
    const pr = r(), pay = pr < .5 ? 'efectivo' : pr < .8 ? 'transferencia' : 'tarjeta';
    const fee = type === 'domicilio' ? FEE : 0;
    const total = items.reduce((a, b) => a + b.price * b.qty, 0) + fee;
    const svc = (6 + r() * 10) * MIN;
    orders.push({ id: 0, num: 0, type, mesa: type === 'mesa' ? 1 + Math.floor(r() * MESAS) : null, channel, customer: null, items, fee, total, paid: true, payMethod: pay, status: 'entregado', error: false, t: { created, started: created + 60000, ready: created + svc - 60000, delivered: created + svc } });
  }
  orders.sort((a, b) => a.t.created - b.t.created);
  orders[11].error = true;
  const mk = (type, mesa, items, ago, status) => {
    const created = t0 - ago * MIN; const it = items.map(([pid, qty, note]) => { const p = products.find(x => x.id === pid); return { pid, name: p.name, price: p.price, qty, note: note || '' }; });
    return { id: 0, num: 0, type, mesa, channel: 'mostrador', customer: null, items: it, fee: 0, total: it.reduce((a, b) => a + b.price * b.qty, 0), paid: false, payMethod: null, status, error: false, t: { created, started: status === 'nuevo' ? null : created + 90000, ready: null, delivered: null } };
  };
  orders.push(mk('mesa', 3, [['h2', 2, 'Sin cebolla'], ['b3', 2]], 4, 'preparando'), mk('llevar', null, [['s1', 1], ['f1', 3]], 1.5, 'nuevo'));
  orders.forEach((o, i) => { o.id = i + 1; o.num = i + 1; });
  return {
    role: 'owner', view: 'venta', cat: 'all', q: '', products, supplies, customers, orders, moves: [], surveys: [5, 4, 5, 5, 4, 3, 5, 4, 5, 5, 4, 4, 5, 2, 5, 4, 5, 4],
    nextNum: orders.length + 1, nextCust: 6, target: 65, ticket: newTicket(), pay: null, noteIdx: null, rating: { 1: 0, 2: 0, 3: 0 }, lastOrder: null
  };
}

// ---------- Cálculos ----------
const prod = id => S.products.find(p => p.id === id);
const sup = id => S.supplies.find(s => s.id === id);
const cust = id => S.customers.find(c => c.id === id);
const cost = p => Object.entries(p.r).reduce((a, [k, q]) => a + sup(k).cost * q, 0);
const margin = p => (p.price - cost(p)) / p.price * 100;
const ticketSub = () => S.ticket.items.reduce((a, b) => a + b.price * b.qty, 0);
const ticketFee = () => S.ticket.type === 'domicilio' ? FEE : 0;
const ticketTotal = () => ticketSub() + ticketFee();
const ticketQty = id => S.ticket.items.filter(i => i.pid === id).reduce((a, b) => a + b.qty, 0);
function maxMake(p) { // cuántas unidades más se pueden armar considerando lo ya en el pedido
  const used = {};
  S.ticket.items.forEach(i => { const q = prod(i.pid); Object.entries(q.r).forEach(([k, n]) => used[k] = (used[k] || 0) + n * i.qty); });
  return Math.min(...Object.entries(p.r).map(([k, n]) => Math.floor((sup(k).stock - (used[k] || 0)) / n)));
}
const lowSupplies = () => S.supplies.filter(s => s.stock <= s.min);
const paidOrders = () => S.orders.filter(o => o.paid);
const isLive = o => o.status !== 'entregado';

// ---------- UI base ----------
function toast(msg, kind = '') {
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 3200);
}
function openModal(html, wide) {
  $('#modal-root').innerHTML = `<div class="modal-bd" data-action="backdrop"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  const f = $('#modal-root input:not([type=checkbox]), #modal-root .btn-primary, #modal-root .btn'); if (f) f.focus({ preventScroll: true });
}
const closeModal = () => { $('#modal-root').innerHTML = ''; };
const mHead = t => `<div class="m-head"><h2>${t}</h2><button class="icon-btn no-print" data-action="closeModal" aria-label="Cerrar">${icon('x')}</button></div>`;

function renderNav() {
  const allowed = ROLES[S.role];
  const live = S.orders.filter(isLive).length;
  $('#nav').innerHTML = allowed.map(v => `<button type="button" data-action="nav" data-v="${v}" ${S.view === v ? 'aria-current="page"' : ''}>${icon(VIEWS[v][1])}<span class="l-full">${VIEWS[v][0]}</span><span class="l-short">${SHORT[v] || VIEWS[v][0]}</span>${v === 'cocina' && live ? `<span class="badge">${live}</span>` : ''}</button>`).join('');
  $('#title').textContent = VIEWS[S.view][0];
  const low = lowSupplies();
  const lp = $('#lowpill'); lp.hidden = !low.length;
  lp.innerHTML = low.length ? `⚠ ${low.length}<span class="lbl"> insumo${low.length > 1 ? 's' : ''} bajo mínimo</span>` : ''; lp.title = low.length ? low.map(s => s.name).join(', ') : '';
  $('#role').value = S.role;
}
function render() {
  if (!ROLES[S.role].includes(S.view)) S.view = ROLES[S.role][0];
  renderNav();
  const v = $('#view'); v.className = 'view' + (S.view === 'venta' ? ' pos-view' : '');
  const html = ({ venta: viewPOS, cocina: viewKitchen, pedidos: viewOrders, inventario: viewInventory, costeo: viewCost, clientes: viewClients, indicadores: viewDash })[S.view]();
  v.innerHTML = S.view === 'venta' ? html : `<div class="page">${html}</div>`; v.scrollTop = 0;
  if (S.view === 'venta') { updateGrid(); updateTicket(); }
  tick();
}

// ---------- Venta (POS) ----------
function viewPOS() {
  return `<div class="pos">
    <section class="catalog" aria-label="Catálogo">
      <div class="search">${icon('search')}<label class="sr" for="q">Buscar producto</label><input id="q" type="search" placeholder="Buscar producto…" autocomplete="off" value="${esc(S.q)}"></div>
      <div class="cats" role="group" aria-label="Categorías">${CATS.map(c => `<button class="chip" type="button" data-action="cat" data-c="${c.id}" aria-pressed="${S.cat === c.id}"><span aria-hidden="true">${c.e}</span>${c.name}</button>`).join('')}</div>
      <div class="grid" id="grid"></div>
      <button class="cartbar" id="cartbar" type="button" data-action="sheet" aria-label="Ver pedido actual"><span class="cb-n" id="cbn">0</span><span class="cb-t">Ver pedido</span><b class="num" id="cbtotal"></b></button>
    </section>
    <div class="scrim" data-action="sheet"></div>
    <aside class="ticket" id="ticket" aria-label="Pedido actual"></aside>
  </div>`;
}
function updateGrid() {
  const q = S.q.trim().toLowerCase();
  const list = S.products.filter(p => (S.cat === 'all' || p.cat === S.cat) && p.name.toLowerCase().includes(q));
  $('#grid').innerHTML = list.length ? list.map(p => {
    const mk = maxMake(p), inT = ticketQty(p.id), out = mk < 1;
    const stk = out ? '<span class="stk out">Agotado</span>' : mk <= 5 ? `<span class="stk">Quedan ${mk}</span>` : '';
    return `<button class="prod ${out ? 'out' : ''}" type="button" data-action="add" data-id="${p.id}" ${out ? 'disabled' : ''}>
      ${inT ? `<span class="qty">${inT}</span>` : ''}<span class="emo" style="--tone:${CATS.find(c => c.id === p.cat).tone}" aria-hidden="true">${p.e}</span>
      <span class="nm">${esc(p.name)}</span>${p.d ? `<span class="ds">${esc(p.d)}</span>` : ''}${stk}<span class="pr">${fmt(p.price)}</span></button>`;
  }).join('') : `<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div><b>Sin resultados</b><span>Prueba con otra palabra o categoría.</span></div>`;
}
function updateTicket() {
  const T = S.ticket, c = T.customerId ? cust(T.customerId) : null, busy = new Set(S.orders.filter(o => o.type === 'mesa' && (isLive(o) || !o.paid)).map(o => o.mesa));
  let ctx = '';
  if (T.type === 'mesa') ctx = `<div class="mesas" role="group" aria-label="Mesa">${Array.from({ length: MESAS }, (_, i) => i + 1).map(n => `<button type="button" class="mesa ${busy.has(n) ? 'busy' : ''}" data-action="mesa" data-n="${n}" aria-pressed="${T.mesa === n}">${n}</button>`).join('')}</div><div class="legend">Elige la mesa · las amarillas tienen un pedido activo</div>`;
  else if (T.type === 'domicilio') ctx = `<div class="form2">
      <label class="field">Nombre<input data-input="dname" value="${esc(T.d.name)}" autocomplete="off"></label>
      <label class="field">Teléfono<input data-input="dphone" inputmode="tel" value="${esc(T.d.phone)}" autocomplete="off"></label>
      <label class="field full">Dirección<input data-input="daddr" value="${esc(T.d.address)}" placeholder="Barrio, calle y número" autocomplete="off"></label>
      <label class="field full">Canal del pedido<select data-input="dchan"><option value="whatsapp" ${T.d.channel === 'whatsapp' ? 'selected' : ''}>WhatsApp</option><option value="plataforma" ${T.d.channel === 'plataforma' ? 'selected' : ''}>App de domicilios</option><option value="mostrador" ${T.d.channel === 'mostrador' ? 'selected' : ''}>Llamada / mostrador</option></select></label></div>`;
  const stampsHtml = c ? `<span class="stamps" aria-label="${c.stamps} de ${STAMPS_GOAL} sellos">${Array.from({ length: STAMPS_GOAL }, (_, i) => `<i class="${i < c.stamps ? 'on' : ''}"></i>`).join('')}</span>` : '';
  const reward = c && c.stamps >= STAMPS_GOAL;
  const lines = T.items.length ? T.items.map((it, i) => `<div class="line"><div><div class="ln">${esc(it.name)}</div>${it.note ? `<div class="note">📝 ${esc(it.note)}</div>` : ''}</div><div class="lp num">${it.free ? 'Gratis' : fmt(it.price * it.qty)}</div>
      <div class="ctl">${it.free ? '<span class="status s-green">🎁 Beneficio fidelización</span>' : `<div class="qty-ctl"><button type="button" data-action="dec" data-i="${i}" aria-label="Quitar uno">${icon('minus')}</button><b class="num">${it.qty}</b><button type="button" data-action="inc" data-i="${i}" aria-label="Agregar uno">${icon('plus')}</button></div><button type="button" class="link" data-action="note" data-i="${i}">${it.note ? 'Editar nota' : 'Añadir nota'}</button>`}
      <button type="button" class="icon-btn" style="margin-left:auto" data-action="del" data-i="${i}" aria-label="Eliminar ${esc(it.name)}">${icon('trash')}</button></div></div>`).join('')
    : `<div class="empty"><div class="big">🛒</div><b>Pedido vacío</b><span>Toca un producto para agregarlo.</span></div>`;
  const n = T.items.reduce((a, b) => a + b.qty, 0);
  $('#ticket').innerHTML = `
    <div class="t-head"><button class="icon-btn close-sheet" type="button" data-action="sheet" aria-label="Cerrar pedido">${icon('x')}</button><h2>Pedido nuevo <span class="muted num" style="font-weight:500">· #${String(S.nextNum).padStart(4, '0')}</span></h2>
      <button class="icon-btn" type="button" data-action="clear" aria-label="Vaciar pedido" ${T.items.length ? '' : 'disabled'}>${icon('trash')}</button></div>
    <div class="seg" role="group" aria-label="Tipo de pedido">${Object.entries(TYPE).map(([k, v]) => `<button type="button" data-action="type" data-t="${k}" aria-pressed="${T.type === k}">${k === 'mesa' ? '🍽️' : k === 'llevar' ? '🛍️' : '🛵'} ${v}</button>`).join('')}</div>
    ${ctx ? `<div class="t-ctx">${ctx}</div>` : ''}
    <button type="button" class="cust ${c ? 'has' : ''}" data-action="pickCustomer">${icon('user')}<span style="flex:1"><b style="font-size:13.5px">${c ? esc(c.name) : 'Asociar cliente (fidelización)'}</b>${c ? `<br>${stampsHtml}` : ''}</span>${c ? `<span class="muted" style="font-size:12px">${c.stamps}/${STAMPS_GOAL}</span>` : ''}</button>
    ${reward ? `<div style="padding:8px 18px 0"><button type="button" class="btn btn-accent btn-sm btn-block" data-action="redeem">${T.redeem ? '✓ Beneficio aplicado · quitar' : '🎁 Canjear: jugo natural gratis'}</button></div>` : ''}
    <div class="lines">${lines}</div>
    <div class="totals"><div class="row muted"><span>Subtotal (${n} ${n === 1 ? 'ítem' : 'ítems'})</span><span class="num">${fmt(ticketSub())}</span></div>
      ${ticketFee() ? `<div class="row muted"><span>Domicilio</span><span class="num">${fmt(ticketFee())}</span></div>` : ''}
      <div class="row grand"><span>Total</span><span class="num">${fmt(ticketTotal())}</span></div></div>
    <div class="t-actions"><button class="btn btn-ghost" type="button" data-action="send" ${T.items.length ? '' : 'disabled'}>${icon('flame')} A cocina</button>
      <button class="btn btn-primary" type="button" data-action="checkout" ${T.items.length ? '' : 'disabled'}>Cobrar ${T.items.length ? fmt(ticketTotal()) : ''}</button></div>`;
  const cb = $('#cartbar'); if (cb) { cb.classList.toggle('has', n > 0); $('#cbn').textContent = n; $('#cbtotal').textContent = fmt(ticketTotal()); }
}
function addItem(id) {
  const p = prod(id); if (maxMake(p) < 1) return toast('Sin existencias suficientes de ' + p.name, 'warn');
  const ex = S.ticket.items.find(i => i.pid === id && !i.note && !i.free);
  if (ex) ex.qty++; else S.ticket.items.push({ pid: id, name: p.name, price: p.price, qty: 1, note: '' });
  updateGrid(); updateTicket();
}
function validateTicket() {
  const T = S.ticket;
  if (!T.items.length) return 'Agrega al menos un producto';
  if (T.type === 'mesa' && !T.mesa) return 'Elige el número de mesa';
  if (T.type === 'domicilio' && (!T.d.name.trim() || !T.d.phone.trim() || !T.d.address.trim())) return 'Completa nombre, teléfono y dirección del domicilio';
  return null;
}
function buildDraft() {
  const T = S.ticket, c = T.customerId ? cust(T.customerId) : null;
  return {
    type: T.type, mesa: T.type === 'mesa' ? T.mesa : null, channel: T.type === 'domicilio' ? T.d.channel : 'mostrador',
    customer: T.type === 'domicilio' ? { name: T.d.name.trim(), phone: T.d.phone.trim(), address: T.d.address.trim() } : c ? { name: c.name, phone: c.phone } : null,
    customerId: T.customerId, redeem: T.redeem, items: T.items.map(i => ({ ...i })), fee: ticketFee(), total: ticketTotal(), paid: false, payMethod: null, status: 'nuevo', error: false,
    t: { created: Date.now(), started: null, ready: null, delivered: null }
  };
}
function commitOrder(o) { // registra, descuenta inventario
  o.id = o.num = S.nextNum++; S.orders.push(o);
  o.items.forEach(it => {
    const p = prod(it.pid);
    Object.entries(p.r).forEach(([k, n]) => {
      const s = sup(k), before = s.stock; s.stock = Math.max(0, s.stock - n * it.qty);
      if (before > s.min && s.stock <= s.min) setTimeout(() => toast(`⚠ ${s.name} llegó al mínimo (${s.stock} ${s.unit})`, 'warn'), 600);
    });
  });
  S.ticket = newTicket(); $('.pos')?.classList.remove('open');
}
function settle(o, method, received) {
  o.paid = true; o.payMethod = method; o.received = received; o.paidAt = Date.now();
  const c = o.customerId ? cust(o.customerId) : null;
  if (c) { if (o.redeem) c.stamps = 0; else c.stamps = Math.min(STAMPS_GOAL, c.stamps + 1); }
}

// ---------- Cocina ----------
function viewKitchen() {
  const cols = [['nuevo', '🆕 Nuevos', 'Empezar'], ['preparando', '🔥 En preparación', 'Listo'], ['listo', '✅ Listos para entregar', 'Entregar']];
  const done = S.orders.filter(o => o.status === 'entregado' && o.t.delivered), avg = done.length ? done.reduce((a, o) => a + o.t.delivered - o.t.created, 0) / done.length : 0;
  return `<div class="row-between"><div class="muted">Meta de servicio: <b>${KITCHEN_GOAL} min</b> del pedido a la entrega · Promedio hoy: <b>${(avg / MIN).toFixed(1)} min</b></div></div>
  <div class="kitchen">${cols.map(([st, title, label]) => {
    const list = S.orders.filter(o => o.status === st).sort((a, b) => a.t.created - b.t.created);
    return `<section class="kcol" aria-label="${title}"><h3>${title}<span class="ct">${list.length}</span></h3><div class="kcol-body">${list.length ? list.map(o => `
      <article class="kcard" data-created="${o.t.created}"><header><b>#${String(o.num).padStart(4, '0')}</b><span class="status s-gray">${o.type === 'mesa' ? 'Mesa ' + o.mesa : TYPE[o.type]}</span><span class="timer num" data-since="${o.t.created}" ${st === 'listo' ? 'data-freeze="1"' : ''}>00:00</span></header>
      <ul>${o.items.map(i => `<li><span class="q num">${i.qty}</span><span>${esc(i.name)}${i.note ? `<span class="n">⚠ ${esc(i.note)}</span>` : ''}</span></li>`).join('')}</ul>
      ${o.type === 'domicilio' ? `<div class="kmeta">🛵 ${esc(o.customer?.name || '')} · ${esc(o.customer?.address || '')}</div>` : ''}
      <footer style="margin-top:10px"><button class="btn ${st === 'listo' ? 'btn-green' : 'btn-primary'} btn-block" type="button" data-action="advance" data-id="${o.id}">${label}</button></footer></article>`).join('') : '<div class="empty muted">Sin pedidos aquí</div>'}</div></section>`;
  }).join('')}</div>`;
}
function advance(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return;
  const now = Date.now();
  if (o.status === 'nuevo') { o.status = 'preparando'; o.t.started = now; }
  else if (o.status === 'preparando') { o.status = 'listo'; o.t.ready = now; toast(`Pedido #${o.num} listo para entregar`, 'ok'); }
  else if (o.status === 'listo') { o.status = 'entregado'; o.t.delivered = now; toast(`Pedido #${o.num} entregado en ${((now - o.t.created) / MIN).toFixed(1)} min`, 'ok'); }
  render();
}

// ---------- Pedidos ----------
let orderFilter = 'todos';
function viewOrders() {
  const f = { todos: () => true, cobrar: o => !o.paid, curso: isLive, entregados: o => o.status === 'entregado' }[orderFilter];
  const list = S.orders.filter(f).sort((a, b) => b.t.created - a.t.created).slice(0, 60);
  const cnt = k => S.orders.filter({ todos: () => true, cobrar: o => !o.paid, curso: isLive, entregados: o => o.status === 'entregado' }[k]).length;
  const stCls = { nuevo: 's-blue', preparando: 's-amber', listo: 's-green', entregado: 's-gray' }, stTxt = { nuevo: 'Nuevo', preparando: 'Preparando', listo: 'Listo', entregado: 'Entregado' };
  return `<div class="tabs" role="group" aria-label="Filtro">${[['todos', 'Todos'], ['cobrar', 'Por cobrar'], ['curso', 'En curso'], ['entregados', 'Entregados']].map(([k, n]) => `<button class="chip" type="button" data-action="ofilter" data-f="${k}" aria-pressed="${orderFilter === k}">${n} <span class="muted" style="font-size:12px">${cnt(k)}</span></button>`).join('')}</div>
  <div class="card flush"><div class="tbl-wrap"><table class="rtable"><thead><tr><th>Pedido</th><th>Hora</th><th>Detalle</th><th class="r">Total</th><th>Estado</th><th>Pago</th><th></th></tr></thead><tbody>
  ${list.map(o => `<tr><td data-label="Pedido"><b class="num">#${String(o.num).padStart(4, '0')}</b><div class="muted" style="font-size:12px">${o.type === 'mesa' ? 'Mesa ' + o.mesa : TYPE[o.type]}${o.channel !== 'mostrador' ? ' · ' + CHANNEL[o.channel] : ''}</div></td>
    <td class="num" data-label="Hora">${hhmm(o.t.created)}</td><td data-label="Detalle" class="detail"><span style="font-size:13px">${esc(o.items.map(i => i.qty + '× ' + i.name).join(', '))}</span>${o.error ? ' <span class="status s-red">Error de comanda</span>' : ''}</td>
    <td class="r num" data-label="Total"><b>${fmt(o.total)}</b></td><td data-label="Estado"><span class="status ${stCls[o.status]}">${stTxt[o.status]}</span></td>
    <td data-label="Pago">${o.paid ? `<span class="status s-green">${PAY[o.payMethod][0]} ${PAY[o.payMethod][1]}</span>` : '<span class="status s-red">Por cobrar</span>'}</td>
    <td class="acts">${o.paid ? '' : `<button class="btn btn-primary btn-sm" type="button" data-action="payOrder" data-id="${o.id}">Cobrar</button> `}<button class="btn btn-ghost btn-sm" type="button" data-action="detail" data-id="${o.id}">Ver</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
}

// ---------- Inventario ----------
function viewInventory() {
  const low = lowSupplies(), value = S.supplies.reduce((a, s) => a + s.stock * s.cost, 0);
  return `<div class="kpis"><div class="kpi"><span class="lb">Insumos registrados</span><span class="v">${S.supplies.length}</span></div>
    <div class="kpi"><span class="lb">Bajo el mínimo</span><span class="v" style="color:${low.length ? 'var(--red)' : 'var(--green)'}">${low.length}</span><span class="d muted">${low.length ? low.map(s => s.name.split(' (')[0]).join(', ') : 'Todo en orden'}</span></div>
    <div class="kpi"><span class="lb">Valor del inventario</span><span class="v num">${fmt(value)}</span></div></div>
  <div class="two"><div class="card flush"><div class="tbl-wrap"><table class="rtable"><thead><tr><th>Insumo</th><th>Existencias</th><th>Nivel</th><th>Estado</th><th></th></tr></thead><tbody>
  ${S.supplies.map(s => { const pct = Math.min(100, s.stock / (s.min * 3) * 100), cls = s.stock <= s.min ? 'low' : s.stock <= s.min * 1.5 ? 'mid' : ''; return `<tr><td data-label="Insumo"><b style="font-size:14px">${esc(s.name)}</b><div class="muted" style="font-size:12px">Mínimo: ${s.min} ${s.unit}</div></td>
    <td class="num" data-label="Existencias"><b>${s.stock}</b> ${s.unit}</td><td data-label="Nivel" style="min-width:120px"><div class="bar ${cls}"><span style="width:${pct}%"></span><i class="min" style="left:${100 / 3}%"></i></div></td>
    <td data-label="Estado">${s.stock <= s.min ? '<span class="status s-red">Reponer</span>' : s.stock <= s.min * 1.5 ? '<span class="status s-amber">Atención</span>' : '<span class="status s-green">OK</span>'}</td>
    <td class="acts"><button class="btn btn-ghost btn-sm" type="button" data-action="move" data-id="${s.id}" data-k="in">+ Entrada</button> <button class="btn btn-ghost btn-sm" type="button" data-action="move" data-id="${s.id}" data-k="out">− Salida</button></td></tr>`; }).join('')}
  </tbody></table></div></div>
  <div class="card"><h3>Últimos movimientos</h3>${S.moves.length ? `<div style="display:grid;gap:10px">${S.moves.slice(-8).reverse().map(m => `<div style="display:flex;gap:10px;align-items:center"><span class="status ${m.k === 'in' ? 's-green' : 's-amber'}">${m.k === 'in' ? '+' : '−'}${m.qty}</span><div style="flex:1;font-size:13.5px"><b>${esc(m.name)}</b><div class="muted" style="font-size:12px">${esc(m.note)} · ${hhmm(m.t)}</div></div></div>`).join('')}</div>` : '<div class="empty muted"><div class="big">📋</div>Aún no hay entradas ni salidas registradas.<br>Las ventas descuentan insumos automáticamente.</div>'}</div></div>`;
}

// ---------- Costeo ----------
function viewCost() {
  const rows = S.products.map(p => ({ p, c: cost(p), m: margin(p) }));
  const bad = rows.filter(r => r.m < S.target).length, avg = rows.reduce((a, r) => a + r.m, 0) / rows.length;
  return `<div class="kpis"><div class="kpi"><span class="lb">Margen promedio por plato</span><span class="v">${avg.toFixed(1)}%</span></div>
    <div class="kpi"><span class="lb">Platos bajo el margen objetivo</span><span class="v" style="color:${bad ? 'var(--red)' : 'var(--green)'}">${bad} <span class="muted" style="font-size:15px">de ${rows.length}</span></span></div>
    <div class="kpi"><span class="lb">Margen objetivo</span><div class="slider"><input id="target" type="range" min="40" max="80" step="1" value="${S.target}" aria-label="Margen objetivo"><b class="num" id="targetv" style="font-size:20px">${S.target}%</b></div></div></div>
  <div class="card flush"><div class="tbl-wrap"><table class="rtable"><thead><tr><th>Plato</th><th class="r">Precio</th><th class="r">Costo</th><th>Margen</th><th class="r">Precio sugerido</th><th></th></tr></thead><tbody id="costbody">${costRows()}</tbody></table></div></div>
  <p class="note-p">El costo se calcula con la receta de cada plato (ficha técnica) y el costo unitario de cada insumo. El precio sugerido se redondea a los $500 superiores.</p>`;
}
function costRows() {
  return S.products.map(p => {
    const c = cost(p), m = margin(p), ok = m >= S.target, sug = Math.ceil(c / (1 - S.target / 100) / 500) * 500;
    const recipe = Object.entries(p.r).map(([k, q]) => `${sup(k).name.split(' (')[0]}×${q}`).join(' · ');
    return `<tr><td data-label="Plato"><b style="font-size:14px">${p.e} ${esc(p.name)}</b><div class="sub-recipe">${esc(recipe)}</div></td><td class="r num" data-label="Precio">${fmt(p.price)}</td><td class="r num" data-label="Costo">${fmt(c)}</td>
      <td data-label="Margen" style="min-width:150px"><div style="display:flex;align-items:center;gap:8px"><b class="num" style="width:50px">${m.toFixed(0)}%</b><span class="status ${ok ? 's-green' : m >= S.target - 10 ? 's-amber' : 's-red'}">${ok ? 'Saludable' : 'Revisar precio'}</span></div></td>
      <td class="r num" data-label="Sugerido">${ok ? '<span class="muted">—</span>' : `<b>${fmt(sug)}</b>`}</td><td class="r acts">${ok ? '' : `<button class="btn btn-ghost btn-sm" type="button" data-action="applyPrice" data-id="${p.id}" data-v="${sug}">Aplicar</button>`}</td></tr>`;
  }).join('');
}

// ---------- Clientes ----------
function viewClients() {
  return `<div class="row-between"><div class="muted">Tarjeta digital de <b>${STAMPS_GOAL} sellos</b>: al completarla el cliente recibe un jugo natural gratis. Cada pedido pagado suma un sello.</div><button class="btn btn-primary" type="button" data-action="newCustomer">${icon('plus')} Nuevo cliente</button></div>
  <div class="cgrid">${S.customers.map(c => `<article class="ccard"><div style="display:flex;gap:12px;align-items:center"><div class="av" aria-hidden="true">${esc(c.name[0])}</div><div style="flex:1"><b>${esc(c.name)}</b><div class="muted" style="font-size:13px">📞 ${esc(c.phone)}</div></div>${c.stamps >= STAMPS_GOAL ? '<span class="status s-green">🎁 Beneficio listo</span>' : ''}</div>
    <div class="sellos" aria-label="${c.stamps} de ${STAMPS_GOAL} sellos">${Array.from({ length: STAMPS_GOAL }, (_, i) => `<i class="${i < c.stamps ? 'on' : i === STAMPS_GOAL - 1 ? 'gift' : ''}">${i < c.stamps ? '✓' : i === STAMPS_GOAL - 1 ? '🎁' : ''}</i>`).join('')}</div>
    <div class="muted" style="font-size:12.5px">${c.stamps >= STAMPS_GOAL ? 'Canjéalo en su próxima compra' : `Le faltan ${STAMPS_GOAL - c.stamps} sello${STAMPS_GOAL - c.stamps > 1 ? 's' : ''}`}</div></article>`).join('')}</div>`;
}
function customerForm(from) {
  openModal(`${mHead('Nuevo cliente')}<div class="m-body"><label class="field">Nombre completo<input id="cn" autocomplete="off"></label><label class="field">Teléfono celular<input id="cp" inputmode="tel" autocomplete="off"></label>
    <label class="check"><input type="checkbox" id="cc"><span>El cliente autoriza el tratamiento de sus datos personales para fidelización y comunicaciones, conforme a la Ley 1581 de 2012. <u>Aviso de privacidad</u> disponible en el local.</span></label></div>
    <div class="m-foot"><button class="btn btn-ghost" data-action="closeModal" type="button">Cancelar</button><button class="btn btn-primary" data-action="saveCustomer" data-from="${from || ''}" type="button">Guardar cliente</button></div>`);
}

// ---------- Indicadores ----------
function viewDash() {
  const paid = paidOrders(), sales = paid.reduce((a, o) => a + o.total, 0), n = S.orders.length;
  const done = S.orders.filter(o => o.t.delivered), svc = done.length ? done.reduce((a, o) => a + o.t.delivered - o.t.created, 0) / done.length / MIN : 0;
  const errs = S.orders.filter(o => o.error).length / n * 100, dig = S.orders.filter(o => o.channel !== 'mostrador').length / n * 100;
  const sat = S.surveys.reduce((a, b) => a + b, 0) / S.surveys.length, mg = S.products.reduce((a, p) => a + margin(p), 0) / S.products.length;
  const k = (lb, v, goal, ok) => `<div class="kpi"><span class="lb">${lb}</span><span class="v num">${v}</span><span class="d" style="color:${ok ? 'var(--green)' : 'var(--red)'}">${ok ? '● En meta' : '● Requiere atención'}</span><span class="goal">${goal}</span></div>`;
  const nowH = new Date().getHours(), buckets = Array.from({ length: 6 }, (_, i) => { const h0 = new Date(); h0.setMinutes(0, 0, 0); h0.setHours(nowH - 5 + i); return { l: pad(h0.getHours()) + 'h', a: h0.getTime(), v: 0 }; });
  paid.forEach(o => buckets.forEach(b => { if (o.t.created >= b.a && o.t.created < b.a + 60 * MIN) b.v += o.total; }));
  const mx = Math.max(...buckets.map(b => b.v), 1);
  const by = { efectivo: 0, transferencia: 0, tarjeta: 0 }; paid.forEach(o => by[o.payMethod] += o.total);
  const col = { efectivo: '#0E5A4A', transferencia: '#2B5C9E', tarjeta: '#C8A24E' }, tot = Object.values(by).reduce((a, b) => a + b, 0) || 1;
  let acc = 0; const grad = Object.entries(by).map(([k2, v]) => { const s = acc; acc += v / tot * 100; return `${col[k2]} ${s}% ${acc}%`; }).join(',');
  const qty = {}; S.orders.forEach(o => o.items.forEach(i => { if (!i.free) qty[i.pid] = (qty[i.pid] || 0) + i.qty; }));
  const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5), topMax = top[0]?.[1] || 1;
  return `<div class="kpis">
    <div class="kpi"><span class="lb">Ventas del día</span><span class="v num">${fmt(sales)}</span><span class="goal">${paid.length} pedidos cobrados</span></div>
    ${k('Tiempo pedido → entrega', svc.toFixed(1) + ' min', `Meta: ≤ ${KITCHEN_GOAL} min`, svc <= KITCHEN_GOAL)}
    ${k('Errores por cada 100 comandas', errs.toFixed(1), 'Meta: < 3', errs < 3)}
    ${k('Margen promedio por plato', mg.toFixed(0) + '%', `Meta: ≥ ${S.target}%`, mg >= S.target)}
    ${k('Satisfacción del cliente', sat.toFixed(1) + ' / 5', `${S.surveys.length} encuestas · Meta ≥ 4,2`, sat >= 4.2)}
    ${k('Pedidos por canal digital', dig.toFixed(0) + '%', 'WhatsApp y apps de domicilio · Meta ≥ 20%', dig >= 20)}</div>
  <div class="dash-grid"><div class="card c8"><h3>Ventas por hora (últimas 6 h)</h3><div class="hbars">${buckets.map(b => `<div class="col"><b class="num">${b.v ? Math.round(b.v / 1000) + 'k' : ''}</b><i style="height:${b.v / mx * 100}%"></i><small>${b.l}</small></div>`).join('')}</div></div>
    <div class="card c4"><h3>Medios de pago</h3><div class="donut-wrap"><div class="donut" style="background:conic-gradient(${grad})" role="img" aria-label="Distribución de medios de pago"></div><div class="legend-list">${Object.entries(by).map(([k2, v]) => `<div><i style="background:${col[k2]}"></i>${PAY[k2][1]} <b>${Math.round(v / tot * 100)}%</b></div>`).join('')}</div></div></div>
    <div class="card c8"><h3>Platos más vendidos</h3><div class="rank">${top.map(([id, q], i) => `<div class="r"><span class="rn">${i + 1}</span><span>${prod(id).e} ${esc(prod(id).name)}</span><b class="num">${q} und</b><div class="bar sub"><span style="width:${q / topMax * 100}%;background:var(--accent)"></span></div></div>`).join('')}</div></div>
    <div class="card c4"><h3>Insumos por reponer</h3>${lowSupplies().length ? lowSupplies().map(s => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px"><span>${esc(s.name)}</span><b class="num" style="color:var(--red)">${s.stock}/${s.min}</b></div>`).join('') : '<div class="empty muted">Todo en orden ✅</div>'}</div></div>`;
}

// ---------- Modales de flujo ----------
function summaryHtml(o) {
  return `<div class="summary">${o.items.map(i => `<div class="it"><b class="num">${i.qty}×</b><span style="flex:1">${esc(i.name)}${i.note ? ` <span style="color:var(--amber)">· ${esc(i.note)}</span>` : ''}</span><span class="num">${i.free ? 'Gratis' : fmt(i.price * i.qty)}</span></div>`).join('')}
    ${o.fee ? `<div class="it muted"><b></b><span style="flex:1">Domicilio</span><span class="num">${fmt(o.fee)}</span></div>` : ''}<hr style="border:0;border-top:1px solid var(--line)"><div class="it"><b></b><b style="flex:1">Total</b><b class="num">${fmt(o.total)}</b></div></div>`;
}
function confirmSend() {
  const err = validateTicket(); if (err) return toast(err, 'warn');
  const d = buildDraft(), ctx = d.type === 'mesa' ? 'Mesa ' + d.mesa : TYPE[d.type];
  openModal(`${mHead('Confirmar pedido')}<div class="m-body"><div class="protocol" aria-label="Protocolo de toma de pedidos"><span>1 Saludo</span><span>2 Confirmación</span><span>3 Repetición</span><span style="background:var(--green-soft);color:var(--green)">4 Registro ◀</span><span>5 Cocina</span></div>
    <p class="muted" style="font-size:13.5px">Repite el pedido al cliente antes de enviarlo (${ctx}). Así se reducen los errores de comanda.</p>${summaryHtml(d)}</div>
    <div class="m-foot"><button class="btn btn-ghost" data-action="closeModal" type="button">Corregir</button><button class="btn btn-primary" data-action="doSend" type="button">${icon('check')} Repetido · enviar a cocina</button></div>`);
}
function openPay(o, draft) {
  S.pay = { o, draft, method: 'efectivo', received: 0 }; renderPay();
}
function renderPay() {
  const P = S.pay, o = P.o, cash = P.method === 'efectivo', change = P.received - o.total;
  const quick = [...new Set([o.total, Math.ceil(o.total / 10000) * 10000, 20000, 50000, 100000].filter(v => v >= o.total))].slice(0, 4);
  const content = `${mHead('Cobrar pedido')}<div class="m-body"><div class="bigtotal num">${fmt(o.total)}</div>
    <div class="methods" role="group" aria-label="Medio de pago">${Object.entries(PAY).map(([k, [e, n]]) => `<button class="method" type="button" data-action="method" data-m="${k}" aria-pressed="${P.method === k}"><span class="e">${e}</span>${n}</button>`).join('')}</div>
    ${cash ? `<label class="field">Efectivo recibido<input id="recv" inputmode="numeric" autocomplete="off" value="${P.received || ''}" placeholder="0"></label>
      <div class="quick">${quick.map(v => `<button class="btn btn-ghost btn-sm" type="button" data-action="quick" data-v="${v}">${v === o.total ? 'Exacto' : fmt(v)}</button>`).join('')}</div>
      <div class="change ${change < 0 ? 'bad' : ''}" id="change">${P.received ? (change >= 0 ? 'Devolver ' + fmt(change) : 'Faltan ' + fmt(-change)) : 'Ingresa el valor recibido'}</div>`
      : `<div class="summary" style="text-align:center">${P.method === 'tarjeta' ? 'Pasa la tarjeta por el datáfono y confirma cuando la transacción sea aprobada.' : 'Confirma el comprobante de Nequi / Daviplata / Bancolombia antes de continuar.'}</div>`}</div>
    <div class="m-foot"><button class="btn btn-ghost" data-action="closeModal" type="button">Cancelar</button><button class="btn btn-green" id="confirmPay" data-action="confirmPay" type="button" ${cash && change < 0 || cash && !P.received ? 'disabled' : ''}>${icon('check')} Confirmar pago</button></div>`;
  openModal(content, false);
  if (cash) { const r = $('#recv'); r.focus(); r.setSelectionRange(r.value.length, r.value.length); }
}
function updateChange() {
  const P = S.pay, ch = P.received - P.o.total, el = $('#change'); if (!el) return;
  el.className = 'change' + (ch < 0 ? ' bad' : ''); el.textContent = P.received ? (ch >= 0 ? 'Devolver ' + fmt(ch) : 'Faltan ' + fmt(-ch)) : 'Ingresa el valor recibido';
  $('#confirmPay').disabled = !P.received || ch < 0;
}
function qrSvg(seedN) {
  const r = rng(seedN * 97 + 3), N = 21, cell = 4; let s = '';
  const finder = (x, y) => x < 7 && y < 7 || x > 13 && y < 7 || x < 7 && y > 13;
  const fOn = (x, y) => { const lx = x % 14 > 6 ? x - 14 : x, ly = y > 13 ? y - 14 : y; const a = Math.max(Math.abs(lx - 3), Math.abs(ly - 3)); return a === 3 || a <= 1; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const on = finder(x, y) ? fOn(x, y) : r() > .52; if (on) s += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`; }
  return `<svg class="qr" viewBox="0 0 ${N * cell} ${N * cell}" role="img" aria-label="Código QR de la encuesta de satisfacción" fill="#000">${s}</svg>`;
}
function receipt(o) {
  const c = o.customerId ? cust(o.customerId) : null;
  openModal(`${mHead(o.paid ? '¡Pago exitoso! 🎉' : 'Pedido enviado')}<div class="m-body"><div class="receipt"><div class="c"><b>LA GRACIA DE DIOS</b></div><div class="c">Comidas rápidas con sabor costeño · Cartagena</div><hr>
    <div class="rl"><span>Pedido</span><b>#${String(o.num).padStart(4, '0')}</b></div><div class="rl"><span>Fecha</span><span>${new Date(o.t.created).toLocaleDateString('es-CO')} ${hhmm(o.t.created)}</span></div><div class="rl"><span>Tipo</span><span>${o.type === 'mesa' ? 'Mesa ' + o.mesa : TYPE[o.type]}</span></div><hr>
    ${o.items.map(i => `<div class="rl"><span>${i.qty}× ${esc(i.name)}</span><span>${i.free ? 'GRATIS' : fmt(i.price * i.qty)}</span></div>`).join('')}${o.fee ? `<div class="rl"><span>Domicilio</span><span>${fmt(o.fee)}</span></div>` : ''}<hr>
    <div class="rl"><b>TOTAL</b><b>${fmt(o.total)}</b></div>${o.paid ? `<div class="rl"><span>Pago</span><span>${PAY[o.payMethod][1]}</span></div>${o.payMethod === 'efectivo' && o.received ? `<div class="rl"><span>Recibido / Cambio</span><span>${fmt(o.received)} / ${fmt(o.received - o.total)}</span></div>` : ''}` : '<div class="c"><b>PENDIENTE DE PAGO</b></div>'}
    ${c ? `<hr><div class="c">Sellos de fidelización: ${c.stamps}/${STAMPS_GOAL}${c.stamps >= STAMPS_GOAL ? ' 🎁 ¡Beneficio disponible!' : ''}</div>` : ''}<hr>
    <div class="c">Cuéntanos tu experiencia (3 preguntas)</div>${qrSvg(o.num)}<div class="c">¡Gracias por su visita! Dios le bendiga.</div></div></div>
    <div class="m-foot no-print"><button class="btn btn-ghost" data-action="print" type="button">${icon('print')} Imprimir</button><button class="btn btn-ghost" data-action="survey" type="button">⭐ Simular encuesta</button><button class="btn btn-primary" data-action="closeModal" type="button">Nueva venta</button></div>`);
}
function surveyModal() {
  const q = [['1', '¿Cómo calificas la atención?'], ['2', '¿Qué tal estuvo la comida?'], ['3', '¿Qué tan rápido fue el servicio?']];
  openModal(`${mHead('Encuesta de satisfacción')}<div class="m-body"><p class="muted" style="font-size:13px">Así la vería el cliente al escanear el QR de su recibo.</p>${q.map(([k, t]) => `<div class="q-block"><b>${t}</b><div class="stars" role="group" aria-label="${t}">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-action="star" data-q="${k}" data-n="${n}" class="${S.rating[k] >= n ? 'on' : ''}" aria-label="${n} estrellas">⭐</button>`).join('')}</div></div>`).join('')}</div>
    <div class="m-foot"><button class="btn btn-ghost" data-action="closeModal" type="button">Cerrar</button><button class="btn btn-primary" data-action="sendSurvey" type="button">Enviar respuestas</button></div>`);
}

// ---------- Acciones ----------
const A = {
  nav: el => { S.view = el.dataset.v; render(); },
  cat: el => { S.cat = el.dataset.c; $$('.cats .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.c === S.cat)); updateGrid(); },
  add: el => addItem(el.dataset.id),
  inc: el => { const it = S.ticket.items[+el.dataset.i]; if (maxMake(prod(it.pid)) < 1) return toast('No hay más existencias de ' + it.name, 'warn'); it.qty++; updateGrid(); updateTicket(); },
  dec: el => { const it = S.ticket.items[+el.dataset.i]; if (--it.qty < 1) S.ticket.items.splice(+el.dataset.i, 1); updateGrid(); updateTicket(); },
  del: el => { const it = S.ticket.items[+el.dataset.i]; if (it.free) S.ticket.redeem = false; S.ticket.items.splice(+el.dataset.i, 1); updateGrid(); updateTicket(); },
  clear: () => { S.ticket = newTicket(); updateGrid(); updateTicket(); },
  type: el => { S.ticket.type = el.dataset.t; updateTicket(); },
  mesa: el => { S.ticket.mesa = +el.dataset.n; updateTicket(); },
  sheet: () => $('.pos').classList.toggle('open'),
  note: el => { S.noteIdx = +el.dataset.i; const it = S.ticket.items[S.noteIdx];
    openModal(`${mHead('Nota para cocina')}<div class="m-body"><div style="font-weight:600">${esc(it.name)}</div><div class="chips-wrap">${NOTES.map(n => `<button class="chip" type="button" data-action="noteChip" data-n="${esc(n)}">${n}</button>`).join('')}</div><label class="field">Nota personalizada<input id="notev" value="${esc(it.note)}" maxlength="60" autocomplete="off"></label></div>
    <div class="m-foot"><button class="btn btn-ghost" data-action="closeModal" type="button">Cancelar</button><button class="btn btn-primary" data-action="saveNote" type="button">Guardar nota</button></div>`); },
  noteChip: el => { const i = $('#notev'); i.value = i.value ? i.value + ', ' + el.dataset.n : el.dataset.n; i.focus(); },
  saveNote: () => { const it = S.ticket.items[S.noteIdx], v = $('#notev').value.trim(); it.note = v; if (v && it.qty > 1) { it.qty--; S.ticket.items.splice(S.noteIdx + 1, 0, { ...it, qty: 1, note: v }); S.ticket.items[S.noteIdx].note = ''; } closeModal(); updateGrid(); updateTicket(); },
  pickCustomer: () => {
    openModal(`${mHead('Asociar cliente')}<div class="m-body"><label class="field">Buscar por nombre o teléfono<input id="cq" autocomplete="off"></label><div class="list-pick" id="clist"></div><button class="btn btn-ghost" type="button" data-action="newCustomer" data-from="pos">${icon('plus')} Registrar cliente nuevo</button></div>
    <div class="m-foot">${S.ticket.customerId ? '<button class="btn btn-ghost" data-action="unlinkCustomer" type="button">Quitar cliente</button>' : ''}<button class="btn btn-ghost" data-action="closeModal" type="button">Cerrar</button></div>`); fillCustList('');
  },
  selectCustomer: el => { const c = cust(+el.dataset.id); S.ticket.customerId = c.id; S.ticket.redeem = false; S.ticket.items = S.ticket.items.filter(i => !i.free); if (S.ticket.type === 'domicilio') { S.ticket.d.name = S.ticket.d.name || c.name; S.ticket.d.phone = S.ticket.d.phone || c.phone; } closeModal(); updateGrid(); updateTicket(); },
  unlinkCustomer: () => { S.ticket.customerId = null; S.ticket.redeem = false; S.ticket.items = S.ticket.items.filter(i => !i.free); closeModal(); updateGrid(); updateTicket(); },
  redeem: () => { const T = S.ticket; if (T.redeem) { T.redeem = false; T.items = T.items.filter(i => !i.free); } else { if (maxMake(prod('b1')) < 1) return toast('No hay fruta para el jugo de cortesía', 'warn'); T.redeem = true; T.items.push({ pid: 'b1', name: 'Jugo natural (beneficio)', price: 0, qty: 1, note: '', free: true }); } updateGrid(); updateTicket(); },
  newCustomer: el => customerForm(el.dataset.from),
  saveCustomer: el => {
    const n = $('#cn').value.trim(), p = $('#cp').value.trim();
    if (n.length < 3) return toast('Escribe el nombre del cliente', 'warn'); if (p.replace(/\D/g, '').length < 7) return toast('Teléfono no válido', 'warn'); if (!$('#cc').checked) return toast('Se requiere la autorización de datos (Ley 1581)', 'warn');
    const c = { id: S.nextCust++, name: n, phone: p, stamps: 0 }; S.customers.push(c); toast('Cliente registrado', 'ok');
    if (el.dataset.from === 'pos') { S.ticket.customerId = c.id; closeModal(); updateTicket(); } else { closeModal(); render(); }
  },
  send: () => confirmSend(),
  doSend: () => { const o = buildDraft(); commitOrder(o); closeModal(); updateGrid(); updateTicket(); toast(`Pedido #${o.num} enviado a cocina`, 'ok'); renderNav(); },
  checkout: () => { const err = validateTicket(); if (err) return toast(err, 'warn'); openPay(buildDraft(), true); },
  payOrder: el => openPay(S.orders.find(o => o.id === +el.dataset.id), false),
  method: el => { S.pay.method = el.dataset.m; S.pay.received = 0; renderPay(); },
  quick: el => { S.pay.received = +el.dataset.v; renderPay(); },
  confirmPay: () => {
    const P = S.pay, o = P.o; if (P.draft) { commitOrder(o); }
    settle(o, P.method, P.method === 'efectivo' ? P.received : null); S.pay = null; S.lastOrder = o;
    if (P.draft) { render(); } else if (S.view !== 'venta') render(); else render();
    receipt(o);
  },
  print: () => window.print(),
  survey: () => { S.rating = { 1: 0, 2: 0, 3: 0 }; surveyModal(); },
  star: el => { S.rating[el.dataset.q] = +el.dataset.n; surveyModal(); },
  sendSurvey: () => { const v = Object.values(S.rating); if (v.includes(0)) return toast('Responde las 3 preguntas', 'warn'); S.surveys.push(Math.round(v.reduce((a, b) => a + b, 0) / 3)); closeModal(); toast('¡Gracias! Respuesta registrada en indicadores', 'ok'); },
  advance: el => advance(+el.dataset.id),
  ofilter: el => { orderFilter = el.dataset.f; render(); },
  detail: el => { const o = S.orders.find(x => x.id === +el.dataset.id);
    openModal(`${mHead('Pedido #' + String(o.num).padStart(4, '0'))}<div class="m-body">${summaryHtml(o)}<div class="muted" style="font-size:13px">${o.type === 'mesa' ? 'Mesa ' + o.mesa : TYPE[o.type]} · ${CHANNEL[o.channel]} · ${hhmm(o.t.created)}${o.t.delivered ? ' · Entregado en ' + ((o.t.delivered - o.t.created) / MIN).toFixed(1) + ' min' : ''}${o.customer?.address ? '<br>📍 ' + esc(o.customer.address) : ''}</div></div>
    <div class="m-foot"><button class="btn btn-ghost" data-action="toggleError" data-id="${o.id}" type="button">${o.error ? 'Quitar marca de error' : '⚠ Marcar error de comanda'}</button><button class="btn btn-primary" data-action="closeModal" type="button">Cerrar</button></div>`); },
  toggleError: el => { const o = S.orders.find(x => x.id === +el.dataset.id); o.error = !o.error; closeModal(); render(); toast(o.error ? 'Error de comanda registrado' : 'Marca retirada', o.error ? 'warn' : ''); },
  move: el => { const s = sup(el.dataset.id), k = el.dataset.k;
    openModal(`${mHead(k === 'in' ? 'Registrar entrada' : 'Registrar salida')}<div class="m-body"><div><b>${esc(s.name)}</b><div class="muted" style="font-size:13px">Existencias actuales: ${s.stock} ${s.unit}</div></div>
    <label class="field">Cantidad (${s.unit})<input id="mq" inputmode="numeric" autocomplete="off"></label><label class="field">Motivo<select id="mn">${(k === 'in' ? ['Compra a proveedor', 'Ajuste de inventario'] : ['Merma / vencimiento', 'Consumo del personal', 'Ajuste de inventario']).map(x => `<option>${x}</option>`).join('')}</select></label></div>
    <div class="m-foot"><button class="btn btn-ghost" data-action="closeModal" type="button">Cancelar</button><button class="btn btn-primary" data-action="saveMove" data-id="${s.id}" data-k="${k}" type="button">Guardar</button></div>`); },
  saveMove: el => { const s = sup(el.dataset.id), k = el.dataset.k, q = parseInt($('#mq').value, 10);
    if (!(q > 0)) return toast('Ingresa una cantidad válida', 'warn'); if (k === 'out' && q > s.stock) return toast('La salida supera las existencias', 'warn');
    s.stock += k === 'in' ? q : -q; S.moves.push({ k, qty: q, name: s.name, note: $('#mn').value, t: Date.now() }); closeModal(); render(); toast('Movimiento registrado', 'ok'); },
  applyPrice: el => { prod(el.dataset.id).price = +el.dataset.v; render(); toast('Precio actualizado en el punto de venta', 'ok'); },
  closeModal: () => { closeModal(); },
  backdrop: (el, e) => { if (e.target === el) closeModal(); }
};
function fillCustList(q) {
  q = q.toLowerCase(); const l = S.customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  $('#clist').innerHTML = l.length ? l.map(c => `<button class="pick" type="button" data-action="selectCustomer" data-id="${c.id}"><span class="av" style="width:36px;height:36px;border-radius:50%;background:var(--accent);display:grid;place-items:center;font-weight:700">${esc(c.name[0])}</span><span style="flex:1"><b style="font-size:14px">${esc(c.name)}</b><br><span class="muted" style="font-size:12.5px">${esc(c.phone)}</span></span><span class="status ${c.stamps >= STAMPS_GOAL ? 's-green' : 's-gray'}">${c.stamps >= STAMPS_GOAL ? '🎁 ' : ''}${c.stamps}/${STAMPS_GOAL}</span></button>`).join('') : '<div class="muted" style="text-align:center;padding:14px">Sin coincidencias</div>';
}

// ---------- Eventos ----------
document.addEventListener('click', e => { const el = e.target.closest('[data-action]'); if (el && A[el.dataset.action]) A[el.dataset.action](el, e); });
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') { S.q = t.value; updateGrid(); }
  else if (t.id === 'cq') fillCustList(t.value);
  else if (t.id === 'recv') { S.pay.received = parseInt(t.value.replace(/\D/g, ''), 10) || 0; updateChange(); }
  else if (t.id === 'target') { S.target = +t.value; $('#targetv').textContent = S.target + '%'; $('#costbody').innerHTML = costRows(); }
  else if (t.dataset.input) { const d = S.ticket.d; ({ dname: () => d.name = t.value, dphone: () => d.phone = t.value, daddr: () => d.address = t.value })[t.dataset.input]?.(); }
});
document.addEventListener('change', e => { if (e.target.dataset.input === 'dchan') S.ticket.d.channel = e.target.value; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#modal-root').firstChild) closeModal();
  if (e.key === 'Enter' && e.target.id === 'recv' && !$('#confirmPay').disabled) A.confirmPay();
});
$('#role').addEventListener('change', e => { S.role = e.target.value; S.view = ROLES[S.role][0]; render(); });
$('#lowpill').addEventListener('click', () => { if (ROLES[S.role].includes('inventario')) { S.view = 'inventario'; render(); } else toast('Avisa al propietario para reponer insumos', 'warn'); });
$('#reset').addEventListener('click', () => { S = seed(); orderFilter = 'todos'; closeModal(); render(); toast('Demo reiniciada con los datos de ejemplo'); });

// ---------- Reloj y temporizadores ----------
function tick() {
  $('#clock').textContent = hhmm(Date.now());
  $$('.timer').forEach(t => {
    const ms = Date.now() - +t.dataset.since; t.textContent = mmss(ms);
    const card = t.closest('.kcard'), m = ms / MIN; card.classList.toggle('late', m > KITCHEN_GOAL && !t.dataset.freeze); card.classList.toggle('warn', m > KITCHEN_GOAL * .66 && m <= KITCHEN_GOAL && !t.dataset.freeze);
  });
}
setInterval(tick, 1000);

S = seed();
render();
