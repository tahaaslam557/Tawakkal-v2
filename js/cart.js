/* ==========================================================================
   TAWAKKAL — Cart store (localStorage)
   --------------------------------------------------------------------------
   A cart line is { id, weight, qty }:
     id     product id from TK_PRODUCTS
     weight weight per pack in KG (e.g. 0.5 = 500 g)
     qty    number of packs
   Line price = pricePerKg × weight × qty
   The same product with different weights is stored as separate lines.
   ========================================================================== */

(function () {
  const STORAGE_KEY = "tawakkal_cart_v1";
  const listeners = new Set();

  const findProduct = (id) => (window.TK_PRODUCTS || []).find((p) => p.id === id);
  const roundKg = (n) => Math.round(n * 1000) / 1000;
  const keyOf = (id, weight) => id + "@" + roundKg(weight);

  function sanitize(lines) {
    if (!Array.isArray(lines)) return [];
    return lines
      .map((l) => ({ id: String(l.id), weight: roundKg(Number(l.weight)), qty: Math.floor(Number(l.qty)) }))
      .filter((l) => findProduct(l.id) && l.weight > 0 && l.weight <= 100 && l.qty > 0 && l.qty <= 99);
  }

  function read() {
    try {
      return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch (e) {
      return [];
    }
  }

  let lines = read();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch (e) {
      /* storage full or disabled — cart still works for this page view */
    }
    emit();
  }

  function emit() {
    listeners.forEach((fn) => {
      try {
        fn(api);
      } catch (e) {
        console.error(e);
      }
    });
  }

  const api = {
    /** Lines enriched with product data & computed totals. */
    items() {
      return lines.map((l) => {
        const product = findProduct(l.id);
        const unitPrice = Math.round(product.pricePerKg * l.weight);
        return { ...l, key: keyOf(l.id, l.weight), product, unitPrice, lineTotal: unitPrice * l.qty };
      });
    },

    add(id, weight, qty = 1) {
      const product = findProduct(id);
      if (!product || !product.inStock) return false;
      weight = roundKg(weight);
      qty = Math.max(1, Math.floor(qty));
      const existing = lines.find((l) => keyOf(l.id, l.weight) === keyOf(id, weight));
      if (existing) existing.qty = Math.min(99, existing.qty + qty);
      else lines.push({ id, weight, qty: Math.min(99, qty) });
      save();
      return true;
    },

    setQty(key, qty) {
      const line = lines.find((l) => keyOf(l.id, l.weight) === key);
      if (!line) return;
      qty = Math.floor(qty);
      if (qty <= 0) return api.remove(key);
      line.qty = Math.min(99, qty);
      save();
    },

    /** Change weight of a line; merges with an existing line of the same weight. */
    setWeight(key, weight) {
      const line = lines.find((l) => keyOf(l.id, l.weight) === key);
      if (!line) return;
      weight = roundKg(weight);
      if (!(weight > 0)) return;
      const target = lines.find((l) => l !== line && keyOf(l.id, l.weight) === keyOf(line.id, weight));
      if (target) {
        target.qty = Math.min(99, target.qty + line.qty);
        lines = lines.filter((l) => l !== line);
      } else {
        line.weight = weight;
      }
      save();
    },

    remove(key) {
      lines = lines.filter((l) => keyOf(l.id, l.weight) !== key);
      save();
    },

    clear() {
      lines = [];
      save();
    },

    count() {
      return lines.reduce((n, l) => n + l.qty, 0);
    },

    subtotal() {
      return api.items().reduce((s, l) => s + l.lineTotal, 0);
    },

    deliveryFee(subtotal = api.subtotal()) {
      const d = (window.TK_CONFIG && window.TK_CONFIG.delivery) || {};
      if (subtotal <= 0) return 0;
      if (d.freeDeliveryThreshold > 0 && subtotal >= d.freeDeliveryThreshold) return 0;
      return Number(d.fee) || 0;
    },

    total() {
      const s = api.subtotal();
      return s + api.deliveryFee(s);
    },

    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  /* Keep tabs in sync */
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      lines = read();
      emit();
    }
  });

  window.TKCart = api;
})();
