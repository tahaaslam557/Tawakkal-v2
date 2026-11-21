/* ==========================================================================
   TAWAKKAL — Cart page
   Quantity / weight / remove controls are handled by the shared delegated
   handlers in main.js (data-line-* attributes); this file only renders.
   ========================================================================== */

(function () {
  "use strict";
  const { qs, esc, money, formatWeight, lineWeightSelect, qtyStepper, toast } = window.TK;
  const CFG = window.TK_CONFIG;
  const Cart = window.TKCart;
  const mount = qs("[data-cart-page]");

  function render() {
    const items = Cart.items();
    if (!items.length) {
      mount.innerHTML = `
        <div class="tk-form-card">
          <div class="tk-empty">
            <div class="tk-empty__icon"><i class="bi bi-basket"></i></div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any seafood yet. Explore today's selection to get started.</p>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <a href="shop.html" class="btn btn-tk">Continue Shopping</a>
              <a href="index.html#bestsellers" class="btn btn-tk-ghost">See Bestsellers</a>
            </div>
          </div>
        </div>`;
      return;
    }

    const sub = Cart.subtotal();
    const fee = Cart.deliveryFee(sub);
    const thr = CFG.delivery.freeDeliveryThreshold;
    const demo = CFG.delivery.isDemo ? ' <span class="demo-tag">demo</span>' : "";

    mount.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="cart-table">
            <div class="cart-table__head" aria-hidden="true"><span>Product</span><span>Weight</span><span>Quantity</span><span>Total</span><span></span></div>
            ${items
              .map(
                (l) => `
              <div class="cart-row">
                <div class="cart-row__product">
                  <a href="product-details.html?id=${l.product.id}"><img src="${l.product.image}" alt="${esc(l.product.name)}" width="84" height="84" loading="lazy"></a>
                  <div class="min-w-0">
                    <a class="cart-row__name" href="product-details.html?id=${l.product.id}">${esc(l.product.name)}</a>
                    <span class="cart-row__unit">${money(l.product.pricePerKg)}/KG · ${money(l.unitPrice)} per ${formatWeight(l.weight)} pack</span>
                  </div>
                </div>
                <div class="cart-row__weight"><span class="cart-mlabel">Weight</span>${lineWeightSelect(l)}</div>
                <div class="cart-row__qty">${qtyStepper(l)}</div>
                <div class="cart-row__total">${money(l.lineTotal)}<small>${formatWeight(l.weight * l.qty)} total</small></div>
                <div class="cart-row__remove"><button type="button" class="tk-link-btn" data-line-remove="${esc(l.key)}" aria-label="Remove ${esc(l.product.name)} from cart"><i class="bi bi-x-circle"></i></button></div>
              </div>`
              )
              .join("")}
          </div>
          <div class="d-flex flex-wrap justify-content-between gap-2 mt-3">
            <a href="shop.html" class="btn btn-tk-ghost"><i class="bi bi-arrow-left"></i> Continue Shopping</a>
            <button type="button" class="btn btn-tk-ghost" data-clear-cart><i class="bi bi-trash3"></i> Clear Cart</button>
          </div>
        </div>
        <div class="col-lg-4">
          <aside class="summary-card" aria-labelledby="summary-title">
            <h2 id="summary-title">Order Summary</h2>
            ${thr > 0 ? `<div class="tk-freebar"><div class="tk-freebar__text">${sub >= thr ? '<i class="bi bi-check2-circle"></i> You qualify for free delivery' : `Add <strong>${money(thr - sub)}</strong> more for free delivery`}${demo}</div><div class="tk-freebar__track"><span style="width:${Math.min(100, (sub / thr) * 100)}%"></span></div></div>` : ""}
            <div class="tk-sum-row"><span>Subtotal (${Cart.count()} item${Cart.count() === 1 ? "" : "s"})</span><strong>${money(sub)}</strong></div>
            <div class="tk-sum-row tk-sum-row--muted"><span>Delivery${demo}</span><span>${fee ? money(fee) : "Free"}</span></div>
            <div class="tk-sum-row tk-sum-row--total"><span>Total</span><span>${money(sub + fee)}</span></div>
            <a href="checkout.html" class="btn btn-tk btn-tk--lg mt-4">Proceed to Checkout <i class="bi bi-arrow-right"></i></a>
            <p class="summary-note"><i class="bi bi-info-circle"></i> Prices are demo prices. Final weight of natural products may vary slightly.</p>
          </aside>
        </div>
      </div>`;
  }

  mount.addEventListener("click", (e) => {
    if (!e.target.closest("[data-clear-cart]")) return;
    const backup = Cart.items().map((l) => ({ id: l.id, weight: l.weight, qty: l.qty }));
    Cart.clear();
    toast("Cart cleared", { type: "info", action: { label: "Undo", onClick: () => backup.forEach((l) => Cart.add(l.id, l.weight, l.qty)) } });
  });

  Cart.onChange(render);
  render();
})();
