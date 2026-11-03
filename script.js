/* ==========================================================
   LA ALBA · Comportamiento de la carta
   - Render desde data.js
   - Búsqueda + filtro por base
   - Pestañas con scroll-spy
   - Favoritos (localStorage) y panel "Mi selección"
   - Tema claro/oscuro, animaciones de entrada, volver arriba
   ========================================================== */
(() => {
  'use strict';

  const { spirits, categories } = window.MENU_DATA;

  const KEY_FAVS = 'laalba:favs';
  const KEY_THEME = 'laalba:theme';
  const MAX_QTY = 99;

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* modo privado */ }
    }
  };

  /* ---------- Datos aplanados ---------- */
  const items = [];
  const byId = new Map();
  categories.forEach((cat) => {
    cat.items.forEach((it) => {
      const item = {
        ...it,
        id: `${cat.id}-${slug(it.name)}`,
        cat: cat.id,
        search: norm(`${it.name} ${it.desc}`)
      };
      items.push(item);
      byId.set(item.id, item);
    });
  });

  /* ---------- Estado ---------- */
  // favs: Map<id, cantidad>. Se guarda como objeto { id: cantidad }.
  // Compatibilidad: valores antiguos en array de ids se cargan con cantidad 1.
  function loadFavs() {
    const raw = store.get(KEY_FAVS, []);
    const favs = new Map();
    if (Array.isArray(raw)) {
      raw.forEach((id) => { if (byId.has(id)) favs.set(id, 1); });
    } else if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([id, qty]) => {
        const n = Math.floor(Number(qty));
        if (byId.has(id) && n > 0) favs.set(id, Math.min(MAX_QTY, n));
      });
    }
    return favs;
  }

  const state = {
    query: '',
    spirit: 'all',
    favs: loadFavs(),
    qrOpen: false
  };

  const qtyOf = (id) => state.favs.get(id) || 0;

  /* ---------- Referencias DOM ---------- */
  const el = {
    menu: $('#menu'),
    tabs: $('#tabs'),
    chips: $('#chips'),
    search: $('#search'),
    searchClear: $('#searchClear'),
    empty: $('#empty'),
    resetBtn: $('#resetBtn'),
    status: $('#status'),
    toolbar: $('#toolbar'),
    themeBtn: $('#themeBtn'),
    themeIcon: $('#themeIcon'),
    favBtn: $('#favBtn'),
    favCount: $('#favCount'),
    drawer: $('#drawer'),
    overlay: $('#overlay'),
    drawerClose: $('#drawerClose'),
    drawerList: $('#drawerList'),
    drawerEmpty: $('#drawerEmpty'),
    drawerFoot: $('#drawerFoot'),
    drawerTotal: $('#drawerTotal'),
    qrBtn: $('#qrBtn'),
    qrPanel: $('#qrPanel'),
    qrBox: $('#qrBox'),
    qrTotal: $('#qrTotal'),
    clearBtn: $('#clearBtn'),
    toTop: $('#toTop'),
    toast: $('#toast')
  };

  /* ---------- Render: carta ---------- */
  function itemHTML(it, index) {
    const qty = qtyOf(it.id);
    const on = qty > 0;
    return `
      <li class="item reveal" data-id="${it.id}" style="--i:${index % 8}">
        <span class="item__icon" aria-hidden="true">${it.icon}</span>
        <div class="item__body">
          <div class="item__line">
            <h3 class="item__name">${esc(it.name)}</h3>
            <span class="item__dots" aria-hidden="true"></span>
            <span class="item__price">${money.format(it.price)}</span>
          </div>
          <p class="item__desc">${esc(it.desc)}</p>
        </div>
        <button class="fav" type="button" data-fav="${it.id}"
                aria-pressed="${on}"
                aria-label="${on ? `Quitar ${esc(it.name)} de mi selección` : `Añadir ${esc(it.name)} a mi selección`}">
          <span class="fav__heart" aria-hidden="true">${on ? '♥' : '♡'}</span>
          <span class="fav__qty" aria-hidden="true"${qty > 1 ? '' : ' hidden'}>${qty > 1 ? qty : ''}</span>
        </button>
      </li>`;
  }

  function renderMenu() {
    el.menu.innerHTML = categories.map((cat) => `
      <section class="category category--${cat.variant}" id="${cat.id}" aria-labelledby="${cat.id}-title">
        <h2 class="ribbon" id="${cat.id}-title"><span>${esc(cat.title)}</span></h2>
        <ul class="items">
          ${cat.items.map((_, i) => itemHTML(byId.get(`${cat.id}-${slug(cat.items[i].name)}`), i)).join('')}
        </ul>
      </section>`).join('');
  }

  function renderTabs() {
    el.tabs.innerHTML = categories
      .map((cat) => `<a class="tab" href="#${cat.id}" data-tab="${cat.id}">${esc(cat.short)}</a>`)
      .join('');
  }

  function renderChips() {
    const all = [{ id: 'all', label: 'Todos' }, ...spirits];
    el.chips.innerHTML = all
      .map((s) => `<button class="chip" type="button" data-spirit="${s.id}" aria-pressed="${s.id === state.spirit}">${esc(s.label)}</button>`)
      .join('');
  }

  /* ---------- Filtros ---------- */
  function applyFilters() {
    const q = norm(state.query);
    let total = 0;

    $$('.category').forEach((section) => {
      let visible = 0;
      $$('.item', section).forEach((li) => {
        const it = byId.get(li.dataset.id);
        const okSpirit = state.spirit === 'all' || it.base === state.spirit;
        const okQuery = !q || it.search.includes(q);
        const show = okSpirit && okQuery;
        li.hidden = !show;
        if (show) visible++;
      });
      section.hidden = visible === 0;
      const tab = $(`[data-tab="${section.id}"]`, el.tabs);
      if (tab) tab.hidden = visible === 0;
      total += visible;
    });

    el.empty.hidden = total !== 0;
    el.searchClear.hidden = !state.query;
    el.status.textContent = total === 0
      ? 'Sin resultados'
      : `${total} ${total === 1 ? 'bebida' : 'bebidas'} en la carta`;

    observeReveal();
  }

  function resetFilters() {
    state.query = '';
    state.spirit = 'all';
    el.search.value = '';
    $$('.chip', el.chips).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.spirit === 'all')));
    applyFilters();
  }

  /* ---------- Animación de entrada ---------- */
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            revealObserver.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    : null;

  function observeReveal() {
    $$('.reveal:not(.is-visible)').forEach((node) => {
      if (revealObserver) revealObserver.observe(node);
      else node.classList.add('is-visible');
    });
  }

  /* ---------- Scroll-spy de pestañas ---------- */
  function setupScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$('.tab', el.tabs).forEach((t) => {
          const active = t.dataset.tab === e.target.id;
          t.classList.toggle('is-active', active);
          if (active) {
            t.setAttribute('aria-current', 'true');
            t.scrollIntoView({ block: 'nearest', inline: 'center' });
          } else {
            t.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.category').forEach((s) => spy.observe(s));
  }

  function syncToolbarHeight() {
    const set = () => document.documentElement.style.setProperty('--toolbar-h', `${el.toolbar.offsetHeight}px`);
    set();
    if ('ResizeObserver' in window) new ResizeObserver(set).observe(el.toolbar);
    else window.addEventListener('resize', set);
  }

  /* ---------- Favoritos ---------- */
  function saveFavs() { store.set(KEY_FAVS, Object.fromEntries(state.favs)); }

  function syncFavButtons(id) {
    const qty = qtyOf(id);
    const name = byId.get(id)?.name ?? '';
    $$(`[data-fav="${id}"]`).forEach((btn) => {
      btn.setAttribute('aria-pressed', String(qty > 0));
      btn.setAttribute('aria-label', qty > 0
        ? `Quitar ${name} de mi selección (${qty} ${qty === 1 ? 'unidad' : 'unidades'})`
        : `Añadir ${name} a mi selección`);
      const heart = $('.fav__heart', btn);
      const badge = $('.fav__qty', btn);
      if (heart) heart.textContent = qty > 0 ? '♥' : '♡';
      if (badge) {
        badge.textContent = qty > 1 ? qty : '';
        badge.hidden = qty <= 1;
      }
    });
  }

  function setQty(id, qty) {
    const next = Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));
    if (next === 0) state.favs.delete(id);
    else state.favs.set(id, next);
    saveFavs();
    syncFavButtons(id);
  }

  function toggleFav(id) {
    const wasChosen = qtyOf(id) > 0;
    setQty(id, wasChosen ? 0 : 1);

    if (!wasChosen) {
      const btn = $(`.item [data-fav="${id}"]`);
      if (btn) {
        btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
      }
    }
    updateFavUI(true);
  }

  function updateFavUI(bump = false, keepFocus = null) {
    const chosen = [...state.favs].map(([id, qty]) => ({ ...byId.get(id), qty }));
    const units = chosen.reduce((sum, it) => sum + it.qty, 0);

    el.favCount.textContent = units;
    el.favCount.hidden = units === 0;
    if (bump && units) {
      el.favCount.classList.remove('bump'); void el.favCount.offsetWidth; el.favCount.classList.add('bump');
    }
    el.favBtn.setAttribute('aria-label', units
      ? `Abrir mi selección (${units} ${units === 1 ? 'bebida' : 'bebidas'})`
      : 'Abrir mi selección');

    el.drawerList.innerHTML = chosen.map((it) => `
      <li>
        <span aria-hidden="true">${it.icon}</span>
        <span class="d-name">${esc(it.name)}<small>${esc(it.desc)}${it.qty > 1 ? ` · ${money.format(it.price)}/ud.` : ''}</small></span>
        <span class="d-stepper" role="group" aria-label="Cantidad de ${esc(it.name)}">
          <button class="d-step" type="button" data-dec="${it.id}" aria-label="Quitar una unidad de ${esc(it.name)}">−</button>
          <span class="d-qty" aria-live="polite">${it.qty}</span>
          <button class="d-step" type="button" data-inc="${it.id}" aria-label="Añadir otra unidad de ${esc(it.name)}"${it.qty >= MAX_QTY ? ' disabled' : ''}>+</button>
        </span>
        <span class="d-price">${money.format(it.price * it.qty)}</span>
        <button class="d-remove" type="button" data-remove="${it.id}" aria-label="Quitar ${esc(it.name)} de la lista">×</button>
      </li>`).join('');

    const total = chosen.reduce((sum, it) => sum + it.price * it.qty, 0);
    el.drawerTotal.textContent = money.format(total);
    el.drawerEmpty.hidden = chosen.length > 0;
    el.drawerFoot.hidden = chosen.length === 0;

    // El QR refleja siempre el pedido actual; si se vacía, volvemos a la lista.
    if (chosen.length === 0) setQROpen(false);
    else if (state.qrOpen) renderQR();

    // El HTML se regenera: devolvemos el foco al control equivalente.
    if (keepFocus) {
      const target = keepFocus.removed ? null : $(`[data-${keepFocus.action}="${keepFocus.id}"]`, el.drawerList);
      (target || el.drawerClose).focus();
    }
  }

  /* ---------- Panel lateral ---------- */
  let lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    el.overlay.hidden = false;
    el.drawer.inert = false;
    requestAnimationFrame(() => {
      el.overlay.classList.add('is-open');
      el.drawer.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    el.drawerClose.focus();
  }

  function closeDrawer() {
    el.overlay.classList.remove('is-open');
    el.drawer.classList.remove('is-open');
    el.drawer.inert = true;
    setQROpen(false);
    document.body.style.overflow = '';
    setTimeout(() => { el.overlay.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('is-show'), 2200);
  }

  /* ---------- QR del pedido ---------- */
  function chosenItems() {
    return [...state.favs].map(([id, qty]) => ({ ...byId.get(id), qty }));
  }

  function orderText() {
    const chosen = chosenItems();
    const units = chosen.reduce((s, it) => s + it.qty, 0);
    const total = chosen.reduce((s, it) => s + it.price * it.qty, 0);
    return [
      'PEDIDO · LA ALBA',
      ...chosen.map((it) => `${it.qty} × ${it.name} — ${money.format(it.price * it.qty)}`),
      `${units} ${units === 1 ? 'bebida' : 'bebidas'} · Total aprox.: ${money.format(total)}`
    ].join('\n');
  }

  function renderQR() {
    const chosen = chosenItems();
    const units = chosen.reduce((s, it) => s + it.qty, 0);
    const total = chosen.reduce((s, it) => s + it.price * it.qty, 0);

    el.qrTotal.textContent = `${units} ${units === 1 ? 'bebida' : 'bebidas'} · ${money.format(total)}`;
    el.qrBox.setAttribute('aria-label',
      `Código QR del pedido: ${chosen.map((it) => `${it.qty} ${it.name}`).join(', ')}. Total aproximado ${money.format(total)}.`);

    if (!window.qrcode) {
      el.qrBox.textContent = 'No se pudo generar el QR.';
      return;
    }
    // La librería codifica Latin-1 por defecto; los nombres llevan tildes y ×.
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'] || qrcode.stringToBytes;
    try {
      const qr = qrcode(0, 'M');
      qr.addData(orderText());
      qr.make();
      el.qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    } catch {
      el.qrBox.textContent = 'El pedido es demasiado largo para un QR.';
    }
  }

  function setQROpen(open) {
    const next = Boolean(open) && state.favs.size > 0;
    state.qrOpen = next;
    el.drawer.classList.toggle('is-qr', next);
    el.qrPanel.hidden = !next;
    el.qrBtn.setAttribute('aria-expanded', String(next));
    el.qrBtn.textContent = next ? 'Volver a la lista' : 'Mostrar QR';
    if (next) renderQR();
  }

  /* ---------- Tema ---------- */
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return document.documentElement.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
  }

  function applyTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    el.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#121722' : '#efdcb5');
    if (persist) store.set(KEY_THEME, theme);
  }

  /* ---------- Eventos ---------- */
  function bindEvents() {
    el.search.addEventListener('input', (e) => {
      state.query = e.target.value;
      applyFilters();
    });

    el.searchClear.addEventListener('click', () => {
      state.query = '';
      el.search.value = '';
      el.search.focus();
      applyFilters();
    });

    el.chips.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-spirit]');
      if (!chip) return;
      state.spirit = chip.dataset.spirit;
      $$('.chip', el.chips).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      applyFilters();
    });

    el.resetBtn.addEventListener('click', resetFilters);

    el.menu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-fav]');
      if (btn) toggleFav(btn.dataset.fav);
    });

    el.themeBtn.addEventListener('click', () => {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });

    prefersDark.addEventListener('change', () => {
      if (!store.get(KEY_THEME, null)) applyTheme(prefersDark.matches ? 'dark' : 'light', false);
    });

    el.favBtn.addEventListener('click', openDrawer);
    el.drawerClose.addEventListener('click', closeDrawer);
    el.overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.drawer.classList.contains('is-open')) closeDrawer();
    });

    el.drawerList.addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      const rem = e.target.closest('[data-remove]');
      const id = inc?.dataset.inc || dec?.dataset.dec || rem?.dataset.remove;
      if (!id) return;

      if (rem || (dec && qtyOf(id) <= 1)) {
        setQty(id, 0);
        updateFavUI(false, { removed: true });
        return;
      }

      if (inc) setQty(id, qtyOf(id) + 1);
      else setQty(id, qtyOf(id) - 1);
      updateFavUI(false, { id, action: inc ? 'inc' : 'dec' });
    });

    el.qrBtn.addEventListener('click', () => setQROpen(!state.qrOpen));
    el.clearBtn.addEventListener('click', () => {
      const ids = [...state.favs.keys()];
      state.favs.clear();
      saveFavs();
      ids.forEach(syncFavButtons);
      updateFavUI();
      toast('Selección vaciada');
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        el.toTop.hidden = window.scrollY < 700;
        ticking = false;
      });
    }, { passive: true });

    el.toTop.addEventListener('click', () => window.scrollTo({ top: 0 }));
  }

  /* ---------- Inicio ---------- */
  function init() {
    const savedTheme = store.get(KEY_THEME, null);
    applyTheme(savedTheme || (prefersDark.matches ? 'dark' : 'light'), false);

    renderTabs();
    renderChips();
    renderMenu();
    updateFavUI();
    bindEvents();
    syncToolbarHeight();
    setupScrollSpy();
    applyFilters();
  }

  init();
})();
