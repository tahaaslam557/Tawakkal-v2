/* ==========================================================================
   TAWAKKAL — Product details page
   Reads ?id= from the URL, renders gallery, weight/quantity selection with
   live price calculation, Add to Cart / Buy Now, info tabs and related items.
   ========================================================================== */

(function () {
  "use strict";
  const { qs, qsa, esc, money, formatWeight, getProduct, getCategory, discountPct, priceBlock, stockBadge, productCard, toast, openCartDrawer, param } = window.TK;
  const CFG = window.TK_CONFIG;
  const Cart = window.TKCart;
  const root = qs("[data-product-root]");

  const id = param("id") || "surmai"; // default demo product
  const p = getProduct(id);

  if (!p) {
    document.title = "Product not found | TAWAKKAL";
    root.innerHTML = `
      <div class="container pd-notfound">
        <div class="tk-empty">
          <div class="tk-empty__icon"><i class="bi bi-question-lg"></i></div>
          <h1 class="h2">Product not found</h1>
          <p>We couldn't find the product you were looking for. It may have been renamed or removed.</p>
          <a href="shop.html" class="btn btn-tk">Browse the Shop</a>
        </div>
      </div>`;
    return;
  }

  /* ---------- SEO ---------- */
  document.title = `Fresh ${p.name} — ${money(p.pricePerKg)}/KG | TAWAKKAL`;
  const md = qs('meta[name="description"]');
  if (md) md.setAttribute("content", `${p.short} Buy fresh ${p.name} by weight online at TAWAKKAL.`);
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.gallery,
    description: p.description,
    brand: { "@type": "Brand", name: CFG.brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: CFG.currency,
      price: p.pricePerKg,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  });
  document.head.appendChild(ld);

  /* ---------- State ---------- */
  const W = CFG.weights;
  const state = { weight: W.options.includes(1) ? 1 : W.options[0], custom: false, qty: 1 };
  const disc = discountPct(p);
  const cats = p.categories.map(getCategory).filter(Boolean);
  const primaryCat = cats[0];

  /* ---------- Markup ---------- */
  root.innerHTML = `
    <div class="pd">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb tk-breadcrumb tk-breadcrumb--light">
            <li class="breadcrumb-item"><a href="index.html">Home</a></li>
            <li class="breadcrumb-item"><a href="shop.html">Shop</a></li>
            ${primaryCat ? `<li class="breadcrumb-item"><a href="shop.html?category=${primaryCat.id}">${esc(primaryCat.name)}</a></li>` : ""}
            <li class="breadcrumb-item active" aria-current="page">${esc(p.name)}</li>
          </ol>
        </nav>
        <div class="row g-4 g-xl-5 mt-1">
          <div class="col-lg-6">
            <div class="pd-gallery">
              <div class="pd-gallery__main" data-zoom title="Hover or tap to zoom">
                <img src="${p.gallery[0]}" alt="Fresh ${esc(p.name)}" width="800" height="800" data-main-img fetchpriority="high">
                <div class="product-card__badges">
                  ${disc ? `<span class="tk-badge tk-badge--sale">Save ${disc}%</span>` : ""}
                  ${p.bestseller ? `<span class="tk-badge tk-badge--best">Bestseller</span>` : ""}
                </div>
              </div>
              <div class="pd-gallery__thumbs" role="group" aria-label="Product images">
                ${p.gallery
                  .map(
                    (src, i) => `<button type="button" class="${i === 0 ? "is-active" : ""}" data-thumb="${src}" aria-label="Show image ${i + 1} of ${p.gallery.length}" aria-pressed="${i === 0}">
                      <img src="${src}" alt="" width="200" height="200" loading="lazy"></button>`
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="pd-info">
              <div class="pd-info__cat">${cats.map((c) => `<a href="shop.html?category=${c.id}">${esc(c.name)}</a>`).join("")}</div>
              <h1>Fresh ${esc(p.name)}</h1>
              <div class="d-flex flex-wrap align-items-center gap-3">
                ${priceBlock(p)}
                <span class="demo-tag">Demo price</span>
              </div>
              <div class="mt-2">${stockBadge(p)}</div>
              <p class="pd-info__lead">${esc(p.description)}</p>

              <div class="pd-box">
                <div class="pd-label" id="weightLabel">Select weight <span>Price is per KG</span></div>
                <div class="pd-weights" role="group" aria-labelledby="weightLabel">
                  ${W.options.map((w) => `<button type="button" class="weight-pill" data-pd-weight="${w}"${p.inStock ? "" : " disabled"}>${formatWeight(w)}</button>`).join("")}
                  ${W.allowCustom ? `<button type="button" class="weight-pill" data-pd-custom${p.inStock ? "" : " disabled"}>Custom</button>` : ""}
                </div>
                ${
                  W.allowCustom
                    ? `<div class="pd-custom" data-custom-wrap>
                        <label for="customWeight" class="form-label mb-0 small">Custom weight</label>
                        <div class="input-group">
                          <input type="number" class="form-control" id="customWeight" min="${W.customMin}" max="${W.customMax}" step="${W.customStep}" value="1.5" inputmode="decimal" aria-describedby="customHelp">
                          <span class="input-group-text">KG</span>
                        </div>
                        <div class="invalid-feedback d-block small" id="customHelp" data-custom-help></div>
                      </div>`
                    : ""
                }

                <div class="pd-total">
                  <div>
                    <div class="pd-label mb-1">Total price</div>
                    <div class="pd-total__calc" data-calc></div>
                  </div>
                  <div class="pd-total__value" data-total aria-live="polite"></div>
                </div>

                <div class="pd-actions">
                  <div class="tk-qty" role="group" aria-label="Quantity">
                    <button type="button" data-q="-1" aria-label="Decrease quantity"><i class="bi bi-dash"></i></button>
                    <input type="number" min="1" max="99" value="1" data-qty aria-label="Quantity" inputmode="numeric">
                    <button type="button" data-q="1" aria-label="Increase quantity"><i class="bi bi-plus"></i></button>
                  </div>
                  <button type="button" class="btn btn-tk" data-pd-add${p.inStock ? "" : " disabled"}><i class="bi bi-bag-plus"></i> Add to Cart</button>
                  <button type="button" class="btn btn-tk-dark" data-pd-buy${p.inStock ? "" : " disabled"}><i class="bi bi-lightning-charge"></i> Buy Now</button>
                </div>
                ${p.inStock ? "" : `<p class="text-danger small fw-semibold mt-3 mb-0"><i class="bi bi-exclamation-circle"></i> This product is currently unavailable. Please check back later or explore related products below.</p>`}
              </div>

              <ul class="pd-meta">
                <li><i class="bi bi-sliders"></i> Sold by weight — pick the amount that suits your recipe.</li>
                <li><i class="bi bi-truck"></i> Delivery charges are shown at checkout. <a href="policies.html#shipping" class="tk-link">Delivery info</a></li>
                <li><i class="bi bi-wallet2"></i> Payment options are shown at checkout.</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="pd-tabs">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-desc" type="button" role="tab" aria-controls="tab-desc" aria-selected="true">Description</button></li>
            <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-info" type="button" role="tab" aria-controls="tab-info" aria-selected="false">Product Information</button></li>
            <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-delivery" type="button" role="tab" aria-controls="tab-delivery" aria-selected="false">Delivery &amp; Storage</button></li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane fade show active" id="tab-desc" role="tabpanel" tabindex="0">
              <h2 class="h3 mb-3">About ${esc(p.name)}</h2>
              <p>${esc(p.description)}</p>
              <p class="mb-0 text-secondary">Product images are representative. The appearance of individual fish may vary naturally in size, shape and colour.</p>
            </div>
            <div class="tab-pane fade" id="tab-info" role="tabpanel" tabindex="0">
              <table class="table pd-table">
                <tbody>
                  <tr><th scope="row">Product</th><td>${esc(p.name)}</td></tr>
                  <tr><th scope="row">Category</th><td>${cats.map((c) => esc(c.name)).join(", ")}</td></tr>
                  ${Object.entries(p.info || {}).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}
                  <tr><th scope="row">Price</th><td>${money(p.pricePerKg)} per KG <span class="demo-tag">Demo</span></td></tr>
                  <tr><th scope="row">Weight options</th><td>${W.options.map(formatWeight).join(", ")}${W.allowCustom ? ` or a custom weight (${formatWeight(W.customMin)} – ${formatWeight(W.customMax)})` : ""}</td></tr>
                  <tr><th scope="row">Availability</th><td>${p.inStock ? "In stock" : "Currently unavailable"} <span class="demo-tag">Demo</span></td></tr>
                </tbody>
              </table>
            </div>
            <div class="tab-pane fade" id="tab-delivery" role="tabpanel" tabindex="0">
              <h2 class="h3 mb-3">Delivery &amp; storage</h2>
              <p>Delivery charges and options are confirmed at checkout. For full details, see our <a href="policies.html#shipping">Shipping &amp; Delivery</a> page.</p>
              <h3 class="h5 mt-4">Storage tips</h3>
              <ul class="mb-0">
                <li>Refrigerate as soon as your order arrives and cook within a day for the best taste.</li>
                <li>For longer storage, freeze in an airtight bag and thaw in the refrigerator before cooking.</li>
                <li>Keep raw seafood separate from ready-to-eat foods.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  /* ---------- Behaviour ---------- */
  const mainImg = qs("[data-main-img]");
  const zoom = qs("[data-zoom]");
  const totalEl = qs("[data-total]");
  const calcEl = qs("[data-calc]");
  const qtyInput = qs("[data-qty]");
  const customWrap = qs("[data-custom-wrap]");
  const customInput = qs("#customWeight");
  const customHelp = qs("[data-custom-help]");

  function customValid() {
    const v = parseFloat(customInput.value);
    const ok = !isNaN(v) && v >= W.customMin && v <= W.customMax && Math.abs(v / W.customStep - Math.round(v / W.customStep)) < 1e-6;
    customInput.classList.toggle("is-invalid", !ok);
    customHelp.textContent = ok ? "" : `Enter ${W.customMin}–${W.customMax} KG in steps of ${W.customStep} KG.`;
    return ok ? v : null;
  }

  function update() {
    qsa("[data-pd-weight]").forEach((b) => {
      const on = !state.custom && parseFloat(b.dataset.pdWeight) === state.weight;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    const cb = qs("[data-pd-custom]");
    if (cb) {
      cb.classList.toggle("is-active", state.custom);
      cb.setAttribute("aria-pressed", state.custom);
      customWrap.classList.toggle("is-open", state.custom);
    }
    const unit = Math.round(p.pricePerKg * state.weight);
    totalEl.textContent = money(unit * state.qty);
    calcEl.textContent = `${formatWeight(state.weight)} × ${state.qty} @ ${money(p.pricePerKg)}/KG`;
    qtyInput.value = state.qty;
  }

  qsa("[data-pd-weight]").forEach((b) =>
    b.addEventListener("click", () => {
      state.custom = false;
      state.weight = parseFloat(b.dataset.pdWeight);
      update();
    })
  );
  const customBtn = qs("[data-pd-custom]");
  if (customBtn) {
    customBtn.addEventListener("click", () => {
      state.custom = true;
      const v = customValid();
      if (v) state.weight = v;
      update();
      customInput.focus();
    });
    customInput.addEventListener("input", () => {
      const v = customValid();
      if (v) { state.weight = v; update(); }
    });
  }

  qsa("[data-q]").forEach((b) =>
    b.addEventListener("click", () => {
      state.qty = Math.max(1, Math.min(99, state.qty + parseInt(b.dataset.q, 10)));
      update();
    })
  );
  qtyInput.addEventListener("change", () => {
    const v = parseInt(qtyInput.value, 10);
    state.qty = isNaN(v) ? 1 : Math.max(1, Math.min(99, v));
    update();
  });

  function addToCart() {
    if (state.custom && !customValid()) {
      customInput.focus();
      return false;
    }
    return Cart.add(p.id, state.weight, state.qty);
  }

  qs("[data-pd-add]").addEventListener("click", () => {
    if (addToCart()) toast(`<strong>${esc(p.name)}</strong> — ${formatWeight(state.weight)} × ${state.qty} added to cart`, { action: { label: "View cart", onClick: openCartDrawer } });
  });
  qs("[data-pd-buy]").addEventListener("click", () => {
    if (addToCart()) location.href = "checkout.html";
  });

  // Gallery
  qsa("[data-thumb]").forEach((b) =>
    b.addEventListener("click", () => {
      qsa("[data-thumb]").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
      mainImg.style.opacity = 0;
      setTimeout(() => { mainImg.src = b.dataset.thumb; mainImg.style.opacity = 1; }, 150);
    })
  );
  zoom.addEventListener("mousemove", (e) => {
    const r = zoom.getBoundingClientRect();
    zoom.style.setProperty("--zx", ((e.clientX - r.left) / r.width) * 100 + "%");
    zoom.style.setProperty("--zy", ((e.clientY - r.top) / r.height) * 100 + "%");
  });
  zoom.addEventListener("mouseenter", () => zoom.classList.add("is-zoom"));
  zoom.addEventListener("mouseleave", () => zoom.classList.remove("is-zoom"));
  zoom.addEventListener("click", () => zoom.classList.toggle("is-zoom"));

  update();

  /* ---------- Related products ---------- */
  const related = window.TK_PRODUCTS.filter((x) => x.id !== p.id && x.categories.some((c) => p.categories.includes(c)))
    .sort((a, b) => b.inStock - a.inStock)
    .slice(0, 4);
  if (related.length) {
    qs("[data-related]").innerHTML = related.map((x) => `<div class="col-12 col-sm-6 col-lg-3">${productCard(x)}</div>`).join("");
    qs("[data-related-section]").hidden = false;
  }
})();
