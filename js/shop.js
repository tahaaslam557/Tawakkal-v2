/* ==========================================================================
   TAWAKKAL — Shop page: search, category & price filters, sorting,
   grid/list view and "Load More" pagination. State is mirrored to the URL
   (?category=…&q=…&sort=…) so filtered views can be shared/bookmarked.
   ========================================================================== */

(function () {
  "use strict";
  const { qs, qsa, esc, money, productCard, getCategory, discountPct, param } = window.TK;
  const PRODUCTS = window.TK_PRODUCTS;
  const CATEGORIES = window.TK_CATEGORIES;
  const PAGE_SIZE = 9;
  const VIEW_KEY = "tawakkal_shop_view";

  const prices = PRODUCTS.map((p) => p.pricePerKg);
  const FLOOR = Math.floor(Math.min(...prices) / 100) * 100;
  const CEIL = Math.ceil(Math.max(...prices) / 100) * 100;
  const PRESETS = [
    { label: "Under 1,000", min: FLOOR, max: 1000 },
    { label: "1,000 – 2,500", min: 1000, max: 2500 },
    { label: "2,500+", min: 2500, max: CEIL },
  ];

  const state = {
    q: param("q") || "",
    cats: new Set((param("category") || "").split(",").filter((c) => getCategory(c))),
    min: FLOOR,
    max: CEIL,
    inStock: false,
    sort: param("sort") || "featured",
    view: localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid",
    shown: PAGE_SIZE,
  };

  const el = {
    grid: qs("[data-products-grid]"),
    empty: qs("[data-shop-empty]"),
    count: qs("[data-result-count]"),
    countBtn: qs("[data-result-count-btn]"),
    chips: qs("[data-active-filters]"),
    catList: qs("[data-cat-list]"),
    search: qs("#shopSearch"),
    min: qs("#priceMin"),
    max: qs("#priceMax"),
    range: qs("#priceRange"),
    presets: qs("[data-price-presets]"),
    stock: qs("#inStockOnly"),
    sort: qs("#sortBy"),
    loadWrap: qs("[data-load-more-wrap]"),
    loadBtn: qs("[data-load-more]"),
    loadStatus: qs("[data-load-status]"),
    loadProgress: qs("[data-load-progress]"),
    title: qs("[data-shop-title]"),
    sub: qs("[data-shop-sub]"),
    crumb: qs("[data-crumb]"),
  };

  /* ---------- Build static filter UI ---------- */
  el.catList.innerHTML = CATEGORIES.map((c) => {
    const n = PRODUCTS.filter((p) => p.categories.includes(c.id)).length;
    return `<li><label><input class="form-check-input" type="checkbox" value="${c.id}" data-cat> ${esc(c.name)} <span class="count">${n}</span></label></li>`;
  }).join("");
  el.presets.innerHTML = PRESETS.map((p, i) => `<button type="button" class="tk-chip" data-preset="${i}">${p.label}</button>`).join("");
  [el.min, el.max].forEach((i) => { i.min = FLOOR; i.max = CEIL; });
  el.range.min = FLOOR;
  el.range.max = CEIL;

  function syncControls() {
    el.search.value = state.q;
    qsa("[data-cat]").forEach((c) => (c.checked = state.cats.has(c.value)));
    el.min.value = state.min;
    el.max.value = state.max;
    el.range.value = state.max;
    el.stock.checked = state.inStock;
    el.sort.value = state.sort;
    qsa("[data-preset]").forEach((b) => {
      const p = PRESETS[b.dataset.preset];
      b.classList.toggle("is-active", p.min === state.min && p.max === state.max);
    });
    qsa("[data-view]").forEach((b) => {
      const on = b.dataset.view === state.view;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
  }

  /* ---------- Filtering & sorting ---------- */
  function filtered() {
    const terms = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = PRODUCTS.filter((p) => {
      if (state.cats.size && !p.categories.some((c) => state.cats.has(c))) return false;
      if (p.pricePerKg < state.min || p.pricePerKg > state.max) return false;
      if (state.inStock && !p.inStock) return false;
      if (terms.length) {
        const hay = [p.name, p.short, p.description, ...p.categories.map((c) => getCategory(c).name)].join(" ").toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    const by = {
      "price-asc": (a, b) => a.pricePerKg - b.pricePerKg,
      "price-desc": (a, b) => b.pricePerKg - a.pricePerKg,
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      "name-desc": (a, b) => b.name.localeCompare(a.name),
      discount: (a, b) => discountPct(b) - discountPct(a),
      featured: (a, b) => (b.bestseller - a.bestseller) || (b.inStock - a.inStock),
    }[state.sort] || (() => 0);
    return list.slice().sort(by);
  }

  /* ---------- Render ---------- */
  function render() {
    const list = filtered();
    const visible = list.slice(0, state.shown);

    el.grid.classList.toggle("is-list", state.view === "list");
    const colCls = "col-12 col-sm-6 col-xl-4";
    el.grid.innerHTML = visible.map((p) => `<div class="${colCls}">${productCard(p, { headingTag: "h2" })}</div>`).join("");
    el.empty.hidden = list.length > 0;

    const total = PRODUCTS.length;
    el.count.innerHTML = list.length
      ? `Showing <span>${visible.length}</span> of <span>${list.length}</span> product${list.length === 1 ? "" : "s"}${list.length < total ? ` <small class="text-secondary fw-semibold">(filtered from ${total})</small>` : ""}`
      : "No matching products";
    el.countBtn.textContent = list.length;

    const remaining = list.length - visible.length;
    el.loadWrap.hidden = remaining <= 0;
    if (remaining > 0) {
      el.loadStatus.textContent = `You've viewed ${visible.length} of ${list.length} products`;
      el.loadProgress.style.width = (visible.length / list.length) * 100 + "%";
      el.loadBtn.textContent = `Load ${Math.min(PAGE_SIZE, remaining)} More`;
    }

    // Header copy for a single category
    if (state.cats.size === 1) {
      const c = getCategory([...state.cats][0]);
      el.title.textContent = c.name;
      el.sub.textContent = c.description;
      el.crumb.innerHTML = `<a href="shop.html">Shop</a>`;
      el.crumb.classList.remove("active");
      el.crumb.removeAttribute("aria-current");
      if (!qs("[data-crumb-cat]")) el.crumb.insertAdjacentHTML("afterend", `<li class="breadcrumb-item active" aria-current="page" data-crumb-cat></li>`);
      qs("[data-crumb-cat]").textContent = c.name;
      document.title = `${c.name} | Shop | TAWAKKAL`;
    } else {
      el.title.textContent = "Shop Fresh Seafood";
      el.sub.textContent = "Choose from fresh fish, fillets, prawns and seafood specials. Select your weight and add to cart.";
      el.crumb.textContent = "Shop";
      el.crumb.classList.add("active");
      el.crumb.setAttribute("aria-current", "page");
      const extra = qs("[data-crumb-cat]");
      if (extra) extra.remove();
      document.title = "Shop Fresh Fish & Seafood Online | TAWAKKAL";
    }

    renderChips();
    syncControls();
    syncUrl();
  }

  function renderChips() {
    const chips = [];
    if (state.q) chips.push(`<button type="button" class="tk-chip" data-clear="q">“${esc(state.q)}” <i class="bi bi-x"></i></button>`);
    state.cats.forEach((c) => chips.push(`<button type="button" class="tk-chip" data-clear="cat" data-value="${c}">${esc(getCategory(c).name)} <i class="bi bi-x"></i></button>`));
    if (state.min !== FLOOR || state.max !== CEIL) chips.push(`<button type="button" class="tk-chip" data-clear="price">${money(state.min)} – ${money(state.max)} <i class="bi bi-x"></i></button>`);
    if (state.inStock) chips.push(`<button type="button" class="tk-chip" data-clear="stock">In stock <i class="bi bi-x"></i></button>`);
    if (chips.length > 1) chips.push(`<button type="button" class="tk-chip tk-chip--clear" data-reset-filters>Clear all</button>`);
    el.chips.innerHTML = chips.join("");
  }

  function syncUrl() {
    const u = new URL(location.href);
    const set = (k, v) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
    set("q", state.q.trim());
    set("category", [...state.cats].join(","));
    set("sort", state.sort !== "featured" ? state.sort : "");
    history.replaceState(null, "", u.pathname + u.search + u.hash);
  }

  const update = () => { state.shown = PAGE_SIZE; render(); };

  function resetAll() {
    Object.assign(state, { q: "", cats: new Set(), min: FLOOR, max: CEIL, inStock: false, sort: "featured" });
    update();
  }

  /* ---------- Events ---------- */
  let searchTimer;
  el.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = el.search.value; update(); }, 200);
  });
  el.catList.addEventListener("change", (e) => {
    if (!e.target.matches("[data-cat]")) return;
    e.target.checked ? state.cats.add(e.target.value) : state.cats.delete(e.target.value);
    update();
  });
  const clampPrice = (v, fallback) => {
    v = parseInt(v, 10);
    return isNaN(v) ? fallback : Math.max(FLOOR, Math.min(CEIL, v));
  };
  el.min.addEventListener("change", () => {
    state.min = clampPrice(el.min.value, FLOOR);
    if (state.min > state.max) state.max = state.min;
    update();
  });
  el.max.addEventListener("change", () => {
    state.max = clampPrice(el.max.value, CEIL);
    if (state.max < state.min) state.min = state.max;
    update();
  });
  el.range.addEventListener("input", () => {
    state.max = Math.max(state.min, parseInt(el.range.value, 10));
    el.max.value = state.max;
  });
  el.range.addEventListener("change", update);
  el.presets.addEventListener("click", (e) => {
    const b = e.target.closest("[data-preset]");
    if (!b) return;
    const p = PRESETS[b.dataset.preset];
    const active = p.min === state.min && p.max === state.max;
    state.min = active ? FLOOR : p.min;
    state.max = active ? CEIL : p.max;
    update();
  });
  el.stock.addEventListener("change", () => { state.inStock = el.stock.checked; update(); });
  el.sort.addEventListener("change", () => { state.sort = el.sort.value; update(); });

  qsa("[data-view]").forEach((b) =>
    b.addEventListener("click", () => {
      state.view = b.dataset.view;
      try { localStorage.setItem(VIEW_KEY, state.view); } catch (e) {}
      render();
    })
  );

  el.loadBtn.addEventListener("click", () => {
    const before = state.shown;
    state.shown += PAGE_SIZE;
    render();
    const firstNew = el.grid.children[before];
    if (firstNew) { const link = qs(".product-card__title a", firstNew); if (link) link.focus({ preventScroll: true }); }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-reset-filters]")) return resetAll();
    const chip = e.target.closest("[data-clear]");
    if (!chip) return;
    const k = chip.dataset.clear;
    if (k === "q") state.q = "";
    if (k === "cat") state.cats.delete(chip.dataset.value);
    if (k === "price") { state.min = FLOOR; state.max = CEIL; }
    if (k === "stock") state.inStock = false;
    update();
  });

  render();
})();
