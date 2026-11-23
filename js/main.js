/* ==========================================================================
   TAWAKKAL — Shared site script
   Renders header/footer/cart drawer/search, product cards, toasts,
   form validation, scroll effects, and homepage sections.
   Load order: bootstrap → config.js → products.js → cart.js → main.js → page script
   ========================================================================== */

(function () {
  "use strict";

  const CFG = window.TK_CONFIG;
  const PRODUCTS = window.TK_PRODUCTS;
  const CATEGORIES = window.TK_CATEGORIES;
  const Cart = window.TKCart;
  const page = document.body.dataset.page || "";

  /* ----------------------------------------------------------------------
     Utilities
     ---------------------------------------------------------------------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const money = (n) => CFG.currency + " " + Math.round(n).toLocaleString("en-PK");

  const formatWeight = (kg) => {
    kg = Math.round(kg * 1000) / 1000;
    return kg < 1 ? Math.round(kg * 1000) + " g" : (Number.isInteger(kg) ? kg : kg.toFixed(2).replace(/0+$/, "")) + " KG";
  };

  const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
  const discountPct = (p) => (p.oldPricePerKg > p.pricePerKg ? Math.round((1 - p.pricePerKg / p.oldPricePerKg) * 100) : 0);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const param = (name) => new URLSearchParams(location.search).get(name);

  /** Show a configured value, or a clearly-marked placeholder. */
  const infoOr = (value, label) => (value ? esc(value) : `<span class="tk-placeholder" title="Add this in js/config.js">${esc(label)}</span>`);

  /* ----------------------------------------------------------------------
     Toasts
     ---------------------------------------------------------------------- */
  function toast(message, opts = {}) {
    let wrap = qs(".tk-toasts");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "tk-toasts";
      wrap.setAttribute("aria-live", "polite");
      wrap.setAttribute("aria-atomic", "false");
      document.body.appendChild(wrap);
    }
    const type = opts.type || "success";
    const icon = { success: "bi-check-circle-fill", info: "bi-info-circle-fill", error: "bi-exclamation-triangle-fill" }[type];
    const el = document.createElement("div");
    el.className = `toast tk-toast tk-toast--${type}`;
    el.setAttribute("role", type === "error" ? "alert" : "status");
    el.innerHTML = `
      <div class="d-flex align-items-start gap-2">
        <i class="bi ${icon} tk-toast__icon" aria-hidden="true"></i>
        <div class="flex-grow-1">
          <div class="tk-toast__msg">${message}</div>
          ${opts.action ? `<button type="button" class="tk-toast__action">${esc(opts.action.label)}</button>` : ""}
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    wrap.appendChild(el);
    if (opts.action) qs(".tk-toast__action", el).addEventListener("click", () => { opts.action.onClick(); bootstrap.Toast.getOrCreateInstance(el).hide(); });
    const t = new bootstrap.Toast(el, { delay: opts.delay || 3200 });
    el.addEventListener("hidden.bs.toast", () => el.remove());
    t.show();
  }

  /* ----------------------------------------------------------------------
     Header, footer, drawers
     ---------------------------------------------------------------------- */
  const NAV = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "shop", label: "Shop", href: "shop.html" },
    { id: "categories", label: "Categories", href: "index.html#categories", dropdown: true },
    { id: "about", label: "About Us", href: "about.html" },
    { id: "contact", label: "Contact", href: "contact.html" },
  ];

  function renderHeader() {
    const mount = qs("#site-header");
    if (!mount) return;
    const links = NAV.map((n) => {
      const active = n.id === page ? " active" : "";
      const aria = n.id === page ? ' aria-current="page"' : "";
      if (n.dropdown) {
        return `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle${active}" href="${n.href}" role="button" data-bs-toggle="dropdown" aria-expanded="false">${n.label}</a>
          <ul class="dropdown-menu tk-dropdown">
            ${CATEGORIES.map((c) => `<li><a class="dropdown-item" href="shop.html?category=${c.id}">${esc(c.name)}</a></li>`).join("")}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item fw-semibold" href="shop.html">All products <i class="bi bi-arrow-right"></i></a></li>
          </ul>
        </li>`;
      }
      return `<li class="nav-item"><a class="nav-link${active}" href="${n.href}"${aria}>${n.label}</a></li>`;
    }).join("");

    mount.innerHTML = `
      <div class="announce-bar">
        <div class="container d-flex align-items-center justify-content-center gap-2">
          <i class="bi bi-truck" aria-hidden="true"></i>
          <span>Fresh Seafood Delivered to Your Doorstep!</span>
          <a href="shop.html" class="announce-bar__link d-none d-sm-inline">Shop now <i class="bi bi-arrow-right-short"></i></a>
        </div>
      </div>
      <nav class="navbar navbar-expand-lg tk-navbar" aria-label="Main navigation">
        <div class="container">
          <a class="navbar-brand tk-brand" href="index.html" aria-label="TAWAKKAL home">
            <img src="${CFG.brand.logo}" alt="TAWAKKAL logo" width="56" height="56">
            <span class="tk-brand__text">TAWAKKAL<small>Fresh Fish &amp; Seafood</small></span>
          </a>
          <div class="tk-nav-actions order-lg-last">
            <button class="tk-icon-btn" type="button" data-bs-toggle="modal" data-bs-target="#searchModal" aria-label="Search products">
              <i class="bi bi-search" aria-hidden="true"></i>
            </button>
            <button class="tk-icon-btn tk-cart-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#cartDrawer" aria-controls="cartDrawer" aria-label="Open cart">
              <i class="bi bi-bag" aria-hidden="true"></i>
              <span class="tk-cart-count" data-cart-count>0</span>
            </button>
            <a href="shop.html" class="btn btn-tk btn-tk--sm d-none d-md-inline-flex">Shop Now</a>
            <button class="tk-icon-btn d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mainMenu" aria-controls="mainMenu" aria-label="Open menu">
              <i class="bi bi-list" aria-hidden="true"></i>
            </button>
          </div>
          <div class="offcanvas offcanvas-end tk-menu" tabindex="-1" id="mainMenu" aria-labelledby="mainMenuLabel">
            <div class="offcanvas-header">
              <img src="${CFG.brand.logo}" alt="" width="48" height="48" class="rounded-3">
              <h2 class="offcanvas-title visually-hidden" id="mainMenuLabel">Menu</h2>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close menu"></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav mx-lg-auto">${links}</ul>
              <a href="shop.html" class="btn btn-tk w-100 mt-4 d-lg-none">Shop Fresh Fish</a>
            </div>
          </div>
        </div>
      </nav>`;
  }

  function renderFooter() {
    const mount = qs("#site-footer");
    if (!mount) return;
    const c = CFG.contact;
    const socials = [
      ["facebook", "Facebook"],
      ["instagram", "Instagram"],
      ["tiktok", "TikTok"],
      ["youtube", "YouTube"],
    ]
      .map(([k, label]) =>
        CFG.social[k]
          ? `<a href="${esc(CFG.social[k])}" target="_blank" rel="noopener" aria-label="${label}"><i class="bi bi-${k}"></i></a>`
          : `<span class="is-disabled" title="${label} link coming soon — add it in js/config.js" aria-label="${label} (coming soon)"><i class="bi bi-${k}"></i></span>`
      )
      .join("");

    mount.innerHTML = `
      <footer class="tk-footer">
        <div class="tk-footer__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z"></path></svg>
        </div>
        <div class="container">
          <div class="row g-5">
            <div class="col-lg-4">
              <a href="index.html" class="tk-footer__brand" aria-label="TAWAKKAL home">
                <img src="${CFG.brand.logo}" alt="TAWAKKAL logo" width="88" height="88" loading="lazy">
              </a>
              <p class="tk-footer__about">${esc(CFG.brand.description)}</p>
              <div class="tk-social">${socials}</div>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <h2 class="tk-footer__title">Quick Links</h2>
              <ul class="tk-footer__links">
                <li><a href="index.html">Home</a></li>
                <li><a href="shop.html">Shop</a></li>
                <li><a href="index.html#categories">Categories</a></li>
                <li><a href="about.html">About Us</a></li>
                <li><a href="contact.html">Contact</a></li>
              </ul>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <h2 class="tk-footer__title">Support</h2>
              <ul class="tk-footer__links">
                <li><a href="cart.html">Your Cart</a></li>
                <li><a href="checkout.html">Checkout</a></li>
                <li><a href="policies.html#faq">FAQs</a></li>
                <li><a href="policies.html#shipping">Shipping &amp; Delivery</a></li>
                <li><a href="policies.html#returns">Returns &amp; Refunds</a></li>
                <li><a href="policies.html#privacy">Privacy Policy</a></li>
                <li><a href="policies.html#terms">Terms of Service</a></li>
              </ul>
            </div>
            <div class="col-md-4 col-lg-4">
              <h2 class="tk-footer__title">Get in Touch</h2>
              <ul class="tk-footer__contact">
                <li><i class="bi bi-telephone"></i>${c.phone ? `<a href="tel:${esc(c.phone.replace(/\s/g, ""))}">${esc(c.phone)}</a>` : infoOr("", "Phone number — add in config")}</li>
                <li><i class="bi bi-envelope"></i>${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : infoOr("", "Email address — add in config")}</li>
                <li><i class="bi bi-geo-alt"></i>${infoOr(c.address, "Business address — add in config")}</li>
                <li><i class="bi bi-clock"></i>${infoOr(c.hours, "Opening hours — add in config")}</li>
              </ul>
            </div>
          </div>
          <div class="tk-footer__bottom">
            <p class="mb-0">&copy; ${new Date().getFullYear()} ${esc(CFG.brand.name)}. All rights reserved.</p>
            <p class="mb-0 tk-footer__note"><i class="bi bi-info-circle"></i> Demo storefront: prices, stock and reviews shown are sample content.</p>
          </div>
        </div>
      </footer>
      <button type="button" class="tk-to-top" aria-label="Back to top"><i class="bi bi-arrow-up"></i></button>`;

    qs(".tk-to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" }));
  }

  function renderShell() {
    const shell = document.createElement("div");
    shell.innerHTML = `
      <div class="offcanvas offcanvas-end tk-drawer" tabindex="-1" id="cartDrawer" aria-labelledby="cartDrawerLabel">
        <div class="offcanvas-header">
          <h2 class="offcanvas-title" id="cartDrawerLabel"><i class="bi bi-bag"></i> Your Cart <span class="tk-drawer__count" data-cart-count-text></span></h2>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close cart"></button>
        </div>
        <div class="offcanvas-body" data-drawer-body></div>
        <div class="tk-drawer__footer" data-drawer-footer></div>
      </div>

      <div class="modal fade tk-search" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title visually-hidden" id="searchModalLabel">Search products</h2>
              <form class="tk-search__form w-100" role="search" action="shop.html" method="get">
                <i class="bi bi-search" aria-hidden="true"></i>
                <label for="globalSearch" class="visually-hidden">Search fish and seafood</label>
                <input id="globalSearch" name="q" type="search" class="form-control" placeholder="Search fish, prawns, fillets…" autocomplete="off">
              </form>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close search"></button>
            </div>
            <div class="modal-body">
              <div class="tk-search__results" data-search-results></div>
            </div>
          </div>
        </div>
      </div>`;
    while (shell.firstElementChild) document.body.appendChild(shell.firstElementChild);
  }

  /* ----------------------------------------------------------------------
     Cart UI (count badges + drawer)
     ---------------------------------------------------------------------- */
  function weightOptionsFor(currentKg) {
    const opts = CFG.weights.options.slice();
    if (!opts.some((w) => Math.abs(w - currentKg) < 1e-9)) opts.push(currentKg);
    return opts.sort((a, b) => a - b);
  }

  function lineWeightSelect(line, cls = "") {
    return `
      <select class="form-select form-select-sm tk-weight-select ${cls}" data-line-weight="${esc(line.key)}" aria-label="Weight for ${esc(line.product.name)}">
        ${weightOptionsFor(line.weight).map((w) => `<option value="${w}"${Math.abs(w - line.weight) < 1e-9 ? " selected" : ""}>${formatWeight(w)}</option>`).join("")}
      </select>`;
  }

  function qtyStepper(line, size = "") {
    return `
      <div class="tk-qty ${size}" role="group" aria-label="Quantity for ${esc(line.product.name)}">
        <button type="button" data-line-dec="${esc(line.key)}" aria-label="Decrease quantity"><i class="bi bi-dash"></i></button>
        <input type="number" min="1" max="99" value="${line.qty}" data-line-qty="${esc(line.key)}" aria-label="Quantity" inputmode="numeric">
        <button type="button" data-line-inc="${esc(line.key)}" aria-label="Increase quantity"><i class="bi bi-plus"></i></button>
      </div>`;
  }

  let lastCount = null;
  function renderCartUI() {
    const count = Cart.count();
    qsa("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.classList.toggle("is-empty", count === 0);
      if (lastCount !== null && count > lastCount) {
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }
    });
    lastCount = count;
    qsa("[data-cart-count-text]").forEach((el) => (el.textContent = count ? `(${count})` : ""));
    const body = qs("[data-drawer-body]");
    const footer = qs("[data-drawer-footer]");
    if (!body) return;
    const items = Cart.items();
    if (!items.length) {
      body.innerHTML = `
        <div class="tk-empty">
          <div class="tk-empty__icon"><i class="bi bi-basket"></i></div>
          <h3>Your cart is empty</h3>
          <p>Browse today's selection and add your favourite fish and seafood.</p>
          <a href="shop.html" class="btn btn-tk">Start Shopping</a>
        </div>`;
      footer.innerHTML = "";
      footer.hidden = true;
      return;
    }
    body.innerHTML = `<ul class="tk-drawer__list">${items
      .map(
        (l) => `
        <li class="tk-drawer__item">
          <a href="product-details.html?id=${l.product.id}" class="tk-drawer__thumb"><img src="${l.product.image}" alt="${esc(l.product.name)}" width="72" height="72" loading="lazy"></a>
          <div class="tk-drawer__info">
            <div class="d-flex justify-content-between gap-2">
              <a href="product-details.html?id=${l.product.id}" class="tk-drawer__name">${esc(l.product.name)}</a>
              <button type="button" class="tk-link-btn" data-line-remove="${esc(l.key)}" aria-label="Remove ${esc(l.product.name)}"><i class="bi bi-trash3"></i></button>
            </div>
            <div class="tk-drawer__meta">${money(l.product.pricePerKg)}/KG</div>
            <div class="d-flex align-items-center justify-content-between gap-2 mt-2">
              ${lineWeightSelect(l)}
              ${qtyStepper(l, "tk-qty--sm")}
            </div>
            <div class="tk-drawer__line">${formatWeight(l.weight)} × ${l.qty} = <strong>${money(l.lineTotal)}</strong></div>
          </div>
        </li>`
      )
      .join("")}</ul>`;
    const sub = Cart.subtotal();
    const fee = Cart.deliveryFee(sub);
    const thr = CFG.delivery.freeDeliveryThreshold;
    footer.hidden = false;
    footer.innerHTML = `
      ${thr > 0 ? `<div class="tk-freebar"><div class="tk-freebar__text">${sub >= thr ? '<i class="bi bi-check2-circle"></i> You qualify for free delivery' : `Add <strong>${money(thr - sub)}</strong> more for free delivery`}${CFG.delivery.isDemo ? ' <span class="demo-tag">demo</span>' : ""}</div><div class="tk-freebar__track"><span style="width:${Math.min(100, (sub / thr) * 100)}%"></span></div></div>` : ""}
      <div class="tk-sum-row"><span>Subtotal</span><strong>${money(sub)}</strong></div>
      <div class="tk-sum-row tk-sum-row--muted"><span>Delivery ${CFG.delivery.isDemo ? '<span class="demo-tag">demo</span>' : ""}</span><span>${fee ? money(fee) : "Free"}</span></div>
      <div class="d-grid gap-2 mt-3">
        <a href="checkout.html" class="btn btn-tk">Proceed to Checkout <i class="bi bi-arrow-right"></i></a>
        <a href="cart.html" class="btn btn-tk-ghost">View Full Cart</a>
      </div>`;
  }

  /** Delegated handlers for any cart line controls on the page (drawer + cart page). */
  function bindCartLineControls() {
    document.addEventListener("click", (e) => {
      const inc = e.target.closest("[data-line-inc]");
      const dec = e.target.closest("[data-line-dec]");
      const rem = e.target.closest("[data-line-remove]");
      if (inc || dec) {
        const key = (inc || dec).getAttribute(inc ? "data-line-inc" : "data-line-dec");
        const line = Cart.items().find((l) => l.key === key);
        if (!line) return;
        if (dec && line.qty === 1) {
          Cart.remove(key);
          toast(`${esc(line.product.name)} removed from cart`, { type: "info" });
        } else Cart.setQty(key, line.qty + (inc ? 1 : -1));
      }
      if (rem) {
        const key = rem.getAttribute("data-line-remove");
        const line = Cart.items().find((l) => l.key === key);
        Cart.remove(key);
        if (line) toast(`${esc(line.product.name)} removed from cart`, { type: "info", action: { label: "Undo", onClick: () => Cart.add(line.id, line.weight, line.qty) } });
      }
    });
    document.addEventListener("change", (e) => {
      const q = e.target.closest("[data-line-qty]");
      const w = e.target.closest("[data-line-weight]");
      if (q) {
        const v = parseInt(q.value, 10);
        Cart.setQty(q.getAttribute("data-line-qty"), isNaN(v) ? 1 : Math.max(1, Math.min(99, v)));
      }
      if (w) Cart.setWeight(w.getAttribute("data-line-weight"), parseFloat(w.value));
    });
  }

  function openCartDrawer() {
    const el = qs("#cartDrawer");
    if (el) bootstrap.Offcanvas.getOrCreateInstance(el).show();
  }

  /* ----------------------------------------------------------------------
     Product cards
     ---------------------------------------------------------------------- */
  function priceBlock(p) {
    return `
      <div class="tk-price">
        <span class="tk-price__now">${money(p.pricePerKg)}</span><span class="tk-price__per">/ KG</span>
        ${p.oldPricePerKg > p.pricePerKg ? `<del class="tk-price__old">${money(p.oldPricePerKg)}</del>` : ""}
      </div>`;
  }

  function stockBadge(p) {
    return p.inStock
      ? `<span class="tk-stock tk-stock--in"><i class="bi bi-circle-fill"></i> In stock</span>`
      : `<span class="tk-stock tk-stock--out"><i class="bi bi-circle-fill"></i> Currently unavailable</span>`;
  }

  let cardSeq = 0;
  function productCard(p, opts = {}) {
    const defW = 1;
    const disc = discountPct(p);
    const cat = getCategory(p.categories[0]);
    const headingTag = opts.headingTag || "h3";
    const W = CFG.weights;
    const dis = p.inStock ? "" : " disabled";
    const uid = p.id + "-" + ++cardSeq;
    return `
      <article class="product-card${p.inStock ? "" : " is-out"}" data-product-card data-id="${p.id}" data-weight="${defW}">
        <div class="product-card__media">
          <a href="product-details.html?id=${p.id}" tabindex="-1" aria-hidden="true">
            <img src="${p.image}" alt="Fresh ${esc(p.name)}" width="400" height="400" loading="lazy" decoding="async">
          </a>
          <div class="product-card__badges">
            ${disc ? `<span class="tk-badge tk-badge--sale">-${disc}%</span>` : ""}
            ${p.bestseller ? `<span class="tk-badge tk-badge--best">Bestseller</span>` : ""}
          </div>
          <a class="product-card__quick" href="product-details.html?id=${p.id}" aria-label="View ${esc(p.name)} details"><i class="bi bi-arrow-up-right"></i></a>
        </div>
        <div class="product-card__body">
          <div class="product-card__top">
            <span class="product-card__cat">${esc(cat ? cat.name : "")}</span>
            ${stockBadge(p)}
          </div>
          <${headingTag} class="product-card__title"><a href="product-details.html?id=${p.id}">${esc(p.name)}</a></${headingTag}>
          <p class="product-card__desc">${esc(p.short)}</p>
          <div class="product-card__pricing">
            ${priceBlock(p)}
            <span class="demo-tag" title="Sample price for demonstration">Demo price</span>
          </div>
          <div class="weight-pills${W.allowCustom ? " weight-pills--custom" : ""}" role="group" aria-label="Choose weight for ${esc(p.name)}">
            ${W.options
              .map((w) => `<button type="button" class="weight-pill${w === defW ? " is-active" : ""}" data-weight-option="${w}" aria-pressed="${w === defW}"${dis}>${formatWeight(w)}</button>`)
              .join("")}
            ${W.allowCustom ? `<button type="button" class="weight-pill" data-weight-custom aria-pressed="false"${dis}>Custom</button>` : ""}
          </div>
          ${
            W.allowCustom
              ? `<div class="card-custom" data-card-custom-wrap hidden>
                  <label class="visually-hidden" for="cw-${uid}">Custom weight in KG for ${esc(p.name)}</label>
                  <div class="card-custom__field">
                    <input type="number" id="cw-${uid}" class="form-control" data-card-custom min="${W.customMin}" max="${W.customMax}" step="${W.customStep}" value="1.5" inputmode="decimal">
                    <span>KG</span>
                  </div>
                  <small class="card-custom__help" data-card-custom-help>${formatWeight(W.customMin)} – ${formatWeight(W.customMax)}, steps of ${formatWeight(W.customStep)}</small>
                </div>`
              : ""
          }
          <div class="product-card__foot">
            <div class="product-card__total">
              <small>Total</small>
              <strong data-card-total>${money(p.pricePerKg * defW)}</strong>
              <span class="product-card__calc" data-card-calc>for ${formatWeight(defW)}</span>
            </div>
            <div class="product-card__actions">
              <button type="button" class="btn btn-tk btn-tk--sm" data-add-to-cart${dis}>
                <i class="bi bi-bag-plus"></i> ${p.inStock ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      </article>`;
  }

  /** Validate the custom-weight input on a card; returns the weight in KG or null. */
  function cardCustomWeight(card) {
    const W = CFG.weights;
    const input = qs("[data-card-custom]", card);
    const v = parseFloat(input.value);
    const ok = !isNaN(v) && v >= W.customMin && v <= W.customMax && Math.abs(v / W.customStep - Math.round(v / W.customStep)) < 1e-6;
    input.classList.toggle("is-invalid", !ok);
    qs("[data-card-custom-help]", card).classList.toggle("is-error", !ok);
    return ok ? v : null;
  }

  function updateCard(card) {
    const p = getProduct(card.dataset.id);
    const w = parseFloat(card.dataset.weight);
    qs("[data-card-total]", card).textContent = money(Math.round(p.pricePerKg * w));
    qs("[data-card-calc]", card).textContent = `for ${formatWeight(w)}`;
  }

  function setCardWeight(card, activeBtn, weight) {
    qsa("[data-weight-option], [data-weight-custom]", card).forEach((b) => {
      const on = b === activeBtn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    const isCustom = activeBtn.hasAttribute("data-weight-custom");
    const wrap = qs("[data-card-custom-wrap]", card);
    if (wrap) wrap.hidden = !isCustom;
    card.dataset.custom = isCustom ? "1" : "";
    if (weight) card.dataset.weight = weight;
    updateCard(card);
  }

  function bindProductCards() {
    document.addEventListener("click", (e) => {
      const card = e.target.closest("[data-product-card]");
      if (!card) return;

      const pill = e.target.closest("[data-weight-option]");
      if (pill) return setCardWeight(card, pill, parseFloat(pill.dataset.weightOption));

      const custom = e.target.closest("[data-weight-custom]");
      if (custom) {
        setCardWeight(card, custom, cardCustomWeight(card));
        qs("[data-card-custom]", card).focus();
        return;
      }

      const add = e.target.closest("[data-add-to-cart]");
      if (add) {
        const p = getProduct(card.dataset.id);
        if (card.dataset.custom && !cardCustomWeight(card)) {
          qs("[data-card-custom]", card).focus();
          toast("Please enter a valid custom weight.", { type: "error" });
          return;
        }
        const w = parseFloat(card.dataset.weight);
        if (Cart.add(p.id, w, 1)) {
          add.classList.add("is-added");
          setTimeout(() => add.classList.remove("is-added"), 900);
          toast(`<strong>${esc(p.name)}</strong> (${formatWeight(w)}) added to cart`, { action: { label: "View cart", onClick: openCartDrawer } });
        }
      }
    });

    document.addEventListener("input", (e) => {
      const input = e.target.closest("[data-card-custom]");
      if (!input) return;
      const card = input.closest("[data-product-card]");
      const v = cardCustomWeight(card);
      if (v) {
        card.dataset.weight = v;
        updateCard(card);
      }
    });

  }

  /* ----------------------------------------------------------------------
     Search
     ---------------------------------------------------------------------- */
  function searchProducts(term) {
    const t = term.trim().toLowerCase();
    if (!t) return [];
    return PRODUCTS.filter((p) => {
      const hay = [p.name, p.short, ...p.categories.map((c) => (getCategory(c) || {}).name)].join(" ").toLowerCase();
      return t.split(/\s+/).every((w) => hay.includes(w));
    });
  }

  function bindSearch() {
    const modal = qs("#searchModal");
    const input = qs("#globalSearch");
    const out = qs("[data-search-results]");
    if (!modal) return;
    const suggestions = () => `
      <p class="tk-search__label">Popular searches</p>
      <div class="tk-search__chips">${["Surmai", "Prawns", "Pomfret", "Fillet", "Rohu"].map((s) => `<button type="button" class="tk-chip" data-search-chip="${s}">${s}</button>`).join("")}</div>
      <p class="tk-search__label mt-4">Browse categories</p>
      <div class="tk-search__chips">${CATEGORIES.map((c) => `<a class="tk-chip" href="shop.html?category=${c.id}">${esc(c.name)}</a>`).join("")}</div>`;
    const render = () => {
      const term = input.value;
      if (!term.trim()) return (out.innerHTML = suggestions());
      const res = searchProducts(term);
      out.innerHTML = res.length
        ? `<p class="tk-search__label">${res.length} result${res.length > 1 ? "s" : ""}</p><ul class="tk-search__list">${res
            .slice(0, 8)
            .map(
              (p) => `<li><a href="product-details.html?id=${p.id}"><img src="${p.image}" alt="" width="56" height="56" loading="lazy"><span><strong>${esc(p.name)}</strong><small>${esc(p.short)}</small></span><em>${money(p.pricePerKg)}/KG</em></a></li>`
            )
            .join("")}</ul>${res.length > 8 ? `<a class="tk-link" href="shop.html?q=${encodeURIComponent(term)}">See all results <i class="bi bi-arrow-right"></i></a>` : ""}`
        : `<div class="tk-search__none"><i class="bi bi-emoji-neutral"></i><p>No products match “${esc(term)}”. Try another name or browse the categories.</p></div>${suggestions()}`;
    };
    input.addEventListener("input", render);
    out.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-search-chip]");
      if (chip) {
        input.value = chip.dataset.searchChip;
        render();
        input.focus();
      }
    });
    modal.addEventListener("shown.bs.modal", () => input.focus());
    modal.addEventListener("show.bs.modal", render);
  }

  /* ----------------------------------------------------------------------
     Forms: validation + submission
     ---------------------------------------------------------------------- */
  const VALIDATORS = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    phone: (v) => /^\+?[0-9]{10,14}$/.test(v.replace(/[\s()-]/g, "")),
    name: (v) => v.trim().length >= 2 && /^[\p{L}\s.'-]+$/u.test(v.trim()),
  };

  function validateField(field) {
    const v = (field.value || "").trim();
    let ok = true;
    if (field.type === "radio") {
      const group = qsa(`input[name="${field.name}"]`, field.form);
      ok = !field.required || group.some((r) => r.checked);
      group.forEach((r) => r.classList.toggle("is-invalid", !ok));
      return ok;
    }
    if (field.required && !v) ok = false;
    else if (v && field.dataset.validate && VALIDATORS[field.dataset.validate]) ok = VALIDATORS[field.dataset.validate](v);
    else if (v && field.type === "email") ok = VALIDATORS.email(v);
    if (ok && v && field.minLength > 0 && v.length < field.minLength) ok = false;
    if (field.type === "checkbox" && field.required) ok = field.checked;
    field.classList.toggle("is-invalid", !ok);
    field.classList.toggle("is-valid", ok && !!v && field.type !== "checkbox");
    field.setAttribute("aria-invalid", String(!ok));
    return ok;
  }

  function validateForm(form) {
    const fields = qsa("input, select, textarea", form).filter((f) => !f.disabled && f.type !== "hidden" && f.type !== "submit" && f.offsetParent !== null);
    let first = null;
    fields.forEach((f) => {
      if (!validateField(f) && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  function liveValidate(form) {
    form.addEventListener("blur", (e) => { if (e.target.matches("input, select, textarea") && e.target.value) validateField(e.target); }, true);
    form.addEventListener("input", (e) => { if (e.target.classList.contains("is-invalid")) validateField(e.target); });
    form.addEventListener("change", (e) => { if (e.target.matches("input[type=radio], input[type=checkbox], select")) validateField(e.target); });
  }

  /** POST JSON to an endpoint if configured; otherwise resolve as a demo submission. */
  async function submitTo(endpoint, data) {
    if (!endpoint) return { demo: true };
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error("Request failed with status " + res.status);
    return { demo: false };
  }

  function setLoading(btn, on, label) {
    if (!btn) return;
    if (on) {
      btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label || "Sending…"}`;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.label;
    }
  }

  function bindNewsletter() {
    qsa("[data-newsletter-form]").forEach((form) => {
      liveValidate(form);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateForm(form)) return;
        const btn = qs("button[type=submit]", form);
        const email = qs("input[type=email]", form).value.trim();
        setLoading(btn, true, "Subscribing…");
        try {
          const r = await submitTo(CFG.integrations.newsletterEndpoint, { email });
          form.reset();
          qsa(".is-valid", form).forEach((f) => f.classList.remove("is-valid"));
          toast(r.demo ? "Thanks! <small class='d-block opacity-75'>Demo mode: your email was validated but not stored. Connect a newsletter service in js/config.js.</small>" : "Thanks for subscribing to TAWAKKAL updates!", { delay: 5000 });
        } catch (err) {
          toast("Sorry, we couldn't subscribe you right now. Please try again.", { type: "error" });
        } finally {
          setLoading(btn, false);
        }
      });
    });
  }

  function bindContactForm() {
    const form = qs("[data-contact-form]");
    if (!form) return;
    liveValidate(form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const btn = qs("button[type=submit]", form);
      const data = Object.fromEntries(new FormData(form).entries());
      setLoading(btn, true);
      try {
        const r = await submitTo(CFG.integrations.contactEndpoint, data);
        form.reset();
        qsa(".is-valid", form).forEach((f) => f.classList.remove("is-valid"));
        const status = qs("[data-contact-status]");
        status.hidden = false;
        status.innerHTML = r.demo
          ? `<i class="bi bi-info-circle"></i> <div><strong>Message validated (demo mode).</strong> This form is not yet connected to an inbox, so your message was not sent. Set <code>integrations.contactEndpoint</code> in <code>js/config.js</code> to receive messages.</div>`
          : `<i class="bi bi-check-circle"></i> <div><strong>Thank you!</strong> Your message has been sent. We'll get back to you soon.</div>`;
        status.className = "tk-form-status " + (r.demo ? "is-demo" : "is-success");
        status.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      } catch (err) {
        toast("Sorry, your message could not be sent. Please try again later.", { type: "error" });
      } finally {
        setLoading(btn, false);
      }
    });
  }

  /* ----------------------------------------------------------------------
     Scroll effects
     ---------------------------------------------------------------------- */
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function bindScrollEffects() {
    const header = qs("#site-header");
    const toTop = qs(".tk-to-top");
    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 40);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Reveal-on-scroll
    const els = qsa(".reveal");
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      els.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("is-visible");
              io.unobserve(en.target);
            }
          }),
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      els.forEach((el) => io.observe(el));
    }

    // Smooth scroll for same-page anchors (accounts for sticky header via CSS scroll-padding)
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      const target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      history.replaceState(null, "", a.getAttribute("href"));
    });
  }

  /** Observe dynamically injected .reveal elements. */
  function revealIn(root) {
    qsa(".reveal", root).forEach((el) => el.classList.add("is-visible"));
  }

  /* ----------------------------------------------------------------------
     Homepage sections
     ---------------------------------------------------------------------- */
  function renderHome() {
    const catGrid = qs("[data-category-grid]");
    if (catGrid) {
      catGrid.innerHTML = CATEGORIES.map((c, i) => {
        const n = PRODUCTS.filter((p) => p.categories.includes(c.id)).length;
        return `
        <div class="col-6 col-lg-4">
          <a class="category-card reveal" style="--d:${i * 70}ms" href="shop.html?category=${c.id}">
            <img src="${c.image}" alt="${esc(c.name)} at TAWAKKAL" width="700" height="840" loading="lazy" decoding="async">
            <div class="category-card__body">
              <span class="category-card__count">${n} product${n === 1 ? "" : "s"}</span>
              <h3>${esc(c.name)}</h3>
              <p>${esc(c.description)}</p>
              <span class="category-card__cta">Explore <i class="bi bi-arrow-right"></i></span>
            </div>
          </a>
        </div>`;
      }).join("");
    }
    const best = qs("[data-bestsellers]");
    if (best) {
      best.innerHTML = PRODUCTS.filter((p) => p.bestseller)
        .slice(0, 8)
        .map((p) => `<div class="col-12 col-sm-6 col-lg-4 col-xl-3">${productCard(p)}</div>`)
        .join("");
    }
  }

  /* ----------------------------------------------------------------------
     Public API for page scripts
     ---------------------------------------------------------------------- */
  window.TK = {
    esc, money, formatWeight, getProduct, getCategory, discountPct, qs, qsa, param, infoOr,
    toast, productCard, priceBlock, stockBadge, lineWeightSelect, qtyStepper, openCartDrawer,
    searchProducts, validateForm, validateField, liveValidate, submitTo, setLoading, revealIn, prefersReducedMotion,
  };

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */
  renderHeader();
  renderFooter();
  renderShell();
  if (page === "home") renderHome();
  bindProductCards();
  bindCartLineControls();
  bindSearch();
  bindNewsletter();
  bindContactForm();
  bindScrollEffects();
  renderCartUI();
  Cart.onChange(renderCartUI);
})();
