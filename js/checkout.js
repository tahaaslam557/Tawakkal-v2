/* ==========================================================================
   TAWAKKAL — Checkout
   Validates customer details, shows payment methods from config, calculates
   totals and produces an order summary.

   IMPORTANT: This is a frontend demo. Unless `integrations.orderEndpoint`
   is set in js/config.js, NO order is transmitted anywhere. See README.md
   ("Connecting a backend") for how to send orders to a server, WhatsApp or
   a payment gateway.
   ========================================================================== */

(function () {
  "use strict";
  const { qs, qsa, esc, money, formatWeight, validateForm, liveValidate, submitTo, setLoading, toast } = window.TK;
  const CFG = window.TK_CONFIG;
  const Cart = window.TKCart;

  const form = qs("[data-checkout-form]");
  const empty = qs("[data-checkout-empty]");
  const payWrap = qs("[data-payment-options]");
  const payError = qs("[data-payment-error]");
  let orderPlaced = false;

  /* ---------- City: free text or configured list ---------- */
  const cities = CFG.delivery.serviceCities || [];
  if (cities.length) {
    const field = qs("[data-city-field]");
    field.innerHTML = `
      <label for="coCity" class="form-label">City <span class="req">*</span></label>
      <select class="form-select" id="coCity" name="city" required>
        <option value="">Select your city</option>
        ${cities.map((c) => `<option>${esc(c)}</option>`).join("")}
      </select>
      <div class="invalid-feedback">Please select a city we deliver to.</div>`;
  }

  /* ---------- Payment methods ---------- */
  const P = CFG.payment;
  const methods = [];
  if (P.cashOnDelivery && P.cashOnDelivery.enabled)
    methods.push({ id: "cod", icon: "bi-cash-coin", title: "Cash on Delivery", text: "Pay in cash when your order arrives." });
  if (P.bankTransfer && P.bankTransfer.enabled)
    methods.push({ id: "bank", icon: "bi-bank", title: "Bank Transfer", text: "Transfer the total to our bank account. Order details will be confirmed after payment." });

  const bankRow = (label, v) => `<dt>${label}</dt><dd>${v ? esc(v) : '<span class="tk-placeholder">To be added</span>'}</dd>`;
  payWrap.innerHTML = methods.length
    ? methods
        .map(
          (m, i) => `
        <label class="pay-option">
          <input type="radio" name="payment" value="${m.id}" required ${i === 0 ? "checked" : ""}>
          <span class="pay-option__box">
            <i class="bi ${m.icon}" aria-hidden="true"></i>
            <span><strong>${m.title}</strong><small>${m.text}</small></span>
            <span class="pay-option__radio" aria-hidden="true"></span>
          </span>
        </label>
        ${
          m.id === "bank"
            ? `<div class="bank-details" data-bank-details>
                <strong>Bank account details</strong>
                <dl>${bankRow("Bank", P.bankTransfer.bankName)}${bankRow("Account title", P.bankTransfer.accountTitle)}${bankRow("Account no.", P.bankTransfer.accountNumber)}${bankRow("IBAN", P.bankTransfer.iban)}</dl>
              </div>`
            : ""
        }`
        )
        .join("")
    : `<div class="notice"><i class="bi bi-exclamation-circle"></i><span>No payment methods are configured yet. Enable them in <code>js/config.js</code>.</span></div>`;

  function syncPayment() {
    const sel = qs('input[name="payment"]:checked');
    const bank = qs("[data-bank-details]");
    if (bank) bank.classList.toggle("is-open", !!sel && sel.value === "bank");
    payError.hidden = !!sel || !methods.length;
  }
  payWrap.addEventListener("change", syncPayment);
  syncPayment();

  /* ---------- Summary ---------- */
  function renderSummary() {
    const items = Cart.items();
    if (!items.length && !orderPlaced) {
      form.hidden = true;
      empty.hidden = false;
      return;
    }
    if (!items.length) return;
    form.hidden = false;
    empty.hidden = true;
    qs("[data-co-items]").innerHTML = items.map(itemRow).join("");
    qs("[data-co-totals]").innerHTML = totalsHtml(Cart.subtotal());
  }

  const itemRow = (l) => `
    <li class="co-item">
      <span class="co-item__img"><img src="${l.product.image}" alt="" width="60" height="60" loading="lazy"><span class="co-item__qty">${l.qty}</span></span>
      <span>
        <span class="co-item__name d-block">${esc(l.product.name)}</span>
        <span class="co-item__meta">${formatWeight(l.weight)} × ${l.qty} · ${money(l.product.pricePerKg)}/KG</span>
      </span>
      <span class="co-item__price">${money(l.lineTotal)}</span>
    </li>`;

  function totalsHtml(sub) {
    const fee = Cart.deliveryFee(sub);
    const demo = CFG.delivery.isDemo ? ' <span class="demo-tag">demo</span>' : "";
    const thr = CFG.delivery.freeDeliveryThreshold;
    return `
      <div class="tk-sum-row"><span>Subtotal</span><strong>${money(sub)}</strong></div>
      <div class="tk-sum-row tk-sum-row--muted"><span>Delivery charges${demo}</span><span>${fee ? money(fee) : "Free"}</span></div>
      ${thr > 0 && sub < thr ? `<div class="small text-secondary">Free delivery on orders over ${money(thr)}.</div>` : ""}
      <div class="tk-sum-row tk-sum-row--total"><span>Grand total</span><span>${money(sub + fee)}</span></div>`;
  }

  /* ---------- Submit ---------- */
  liveValidate(form);

  function buildOrder() {
    const data = Object.fromEntries(new FormData(form).entries());
    const items = Cart.items();
    const subtotal = Cart.subtotal();
    const delivery = Cart.deliveryFee(subtotal);
    const ref = "TK-" + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
    return {
      reference: ref,
      createdAt: new Date().toISOString(),
      customer: { fullName: data.fullName.trim(), phone: data.phone.trim(), email: data.email.trim() },
      delivery: { address: data.address.trim(), city: data.city.trim(), area: data.area.trim(), notes: (data.notes || "").trim() },
      paymentMethod: data.payment,
      items: items.map((l) => ({ id: l.id, name: l.product.name, weightKg: l.weight, qty: l.qty, pricePerKg: l.product.pricePerKg, lineTotal: l.lineTotal })),
      subtotal,
      deliveryFee: delivery,
      total: subtotal + delivery,
      currency: CFG.currency,
    };
  }

  function whatsappLink(order) {
    const num = (CFG.contact.whatsapp || "").replace(/\D/g, "");
    if (!num || !CFG.integrations.whatsappOrdering) return "";
    const lines = [
      `New order ${order.reference}`,
      ...order.items.map((i) => `• ${i.name} — ${formatWeight(i.weightKg)} × ${i.qty} = ${money(i.lineTotal)}`),
      `Subtotal: ${money(order.subtotal)}`,
      `Delivery: ${order.deliveryFee ? money(order.deliveryFee) : "Free"}`,
      `Total: ${money(order.total)}`,
      `Payment: ${order.paymentMethod === "bank" ? "Bank Transfer" : "Cash on Delivery"}`,
      `Name: ${order.customer.fullName}`,
      `Phone: ${order.customer.phone}`,
      `Address: ${order.delivery.address}, ${order.delivery.area}, ${order.delivery.city}`,
      order.delivery.notes ? `Notes: ${order.delivery.notes}` : "",
    ].filter(Boolean);
    return `https://wa.me/${num}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  function showConfirmation(order, demo) {
    const wa = whatsappLink(order);
    const body = qs("[data-order-body]");
    body.innerHTML = `
      <div class="text-center">
        <div class="order-success__icon"><i class="bi bi-check2"></i></div>
        <h2 id="orderModalTitle" class="h3 mb-2">${demo ? "Order summary created" : "Thank you for your order!"}</h2>
        <p class="text-secondary mb-2">Reference <span class="order-ref">${order.reference}</span></p>
      </div>
      ${
        demo
          ? `<div class="notice my-3"><i class="bi bi-info-circle"></i><span><strong>Demo mode:</strong> this order has <u>not</u> been sent to TAWAKKAL and no payment was taken. ${wa ? "Use the WhatsApp button below to send it directly." : "Connect an order endpoint or WhatsApp number in <code>js/config.js</code> to receive real orders."}</span></div>`
          : `<p class="text-center">We've received your order and will contact you on <strong>${esc(order.customer.phone)}</strong> to confirm delivery.</p>`
      }
      <ul class="co-items">${order.items
        .map(
          (i) => `<li class="co-item"><span><span class="co-item__name d-block">${esc(i.name)}</span><span class="co-item__meta">${formatWeight(i.weightKg)} × ${i.qty}</span></span><span class="co-item__price">${money(i.lineTotal)}</span></li>`
        )
        .join("")}</ul>
      <div class="tk-sum-row"><span>Subtotal</span><strong>${money(order.subtotal)}</strong></div>
      <div class="tk-sum-row tk-sum-row--muted"><span>Delivery</span><span>${order.deliveryFee ? money(order.deliveryFee) : "Free"}</span></div>
      <div class="tk-sum-row tk-sum-row--total"><span>Total</span><span>${money(order.total)}</span></div>
      <div class="small text-secondary mt-3">
        <strong class="text-dark">Deliver to:</strong> ${esc(order.customer.fullName)}, ${esc(order.delivery.address)}, ${esc(order.delivery.area)}, ${esc(order.delivery.city)}<br>
        <strong class="text-dark">Payment:</strong> ${order.paymentMethod === "bank" ? "Bank Transfer" : "Cash on Delivery"}
      </div>
      <div class="d-grid gap-2 mt-4">
        ${wa ? `<a href="${wa}" target="_blank" rel="noopener" class="btn btn-tk"><i class="bi bi-whatsapp"></i> Send Order on WhatsApp</a>` : ""}
        <a href="shop.html" class="btn ${wa ? "btn-tk-ghost" : "btn-tk"}">Continue Shopping</a>
        <a href="index.html" class="btn btn-tk-ghost">Back to Home</a>
      </div>`;
    bootstrap.Modal.getOrCreateInstance(qs("#orderModal")).show();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ok = validateForm(form);
    syncPayment();
    if (!qs('input[name="payment"]:checked')) {
      payError.hidden = false;
      if (ok) payWrap.scrollIntoView({ block: "center" });
      return;
    }
    if (!ok) {
      toast("Please complete the highlighted fields.", { type: "error" });
      return;
    }
    if (!Cart.items().length) return renderSummary();

    const btn = qs('button[type="submit"]', form);
    const order = buildOrder();
    setLoading(btn, true, "Placing order…");
    try {
      const r = await submitTo(CFG.integrations.orderEndpoint, order);
      orderPlaced = true;
      showConfirmation(order, r.demo);
      Cart.clear();
      form.reset();
      qsa(".is-valid", form).forEach((f) => f.classList.remove("is-valid"));
      form.hidden = true;
      empty.hidden = true;
    } catch (err) {
      toast("We couldn't place your order right now. Please try again or contact us.", { type: "error", delay: 6000 });
    } finally {
      setLoading(btn, false);
    }
  });

  qs("#orderModal").addEventListener("hidden.bs.modal", () => {
    orderPlaced = false;
    renderSummary();
  });

  Cart.onChange(renderSummary);
  renderSummary();
})();
