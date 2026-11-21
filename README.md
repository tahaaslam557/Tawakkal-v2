# TAWAKKAL — Fresh Fish & Seafood Website

A responsive, multi-page e-commerce **frontend** for TAWAKKAL, built with **HTML5, CSS3, Bootstrap 5, vanilla JavaScript, Bootstrap Icons and Google Fonts**. No frameworks and no build step.

> **This is a frontend prototype.** Prices, stock, reviews and delivery charges are **demo data**, and they are labelled as demo on the site. Orders, contact messages and newsletter sign-ups are validated in the browser but **not sent anywhere** until you connect a backend (see [Connecting a backend](#connecting-a-backend)).

---

## Running the site

The site is plain static files.

**Option 1: open directly.** Double-click `index.html`. Everything works from `file://`, including the cart, which is saved in localStorage.

**Option 2: local server (recommended).** Paths and storage then behave like a real host:

```bash
# Python
python -m http.server 8000
# or Node
npx serve .
```

Then open <http://localhost:8000>.

**Deploying:** upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel, etc.).

An internet connection is needed for Bootstrap, Bootstrap Icons and Google Fonts, which load from CDNs.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Homepage: hero, trust indicators, categories, bestsellers, why-choose, promo, freshness process, demo testimonials, newsletter |
| `shop.html` | Product listing with search, category and price filters, availability toggle, sorting, grid/list view and Load More. Filters are kept in the URL, e.g. `shop.html?category=prawns-shrimp&q=jumbo` |
| `product-details.html?id=surmai` | Gallery with zoom, weight selector (500 g / 1 KG / 2 KG / custom), quantity, live price, Add to Cart, Buy Now, info tabs, related products |
| `cart.html` | Full cart: change weight or quantity, remove, clear (with undo), subtotal, delivery and total |
| `checkout.html` | Validated delivery form, payment method, order summary and a demo confirmation |
| `about.html` | Brand story, mission, quality commitment, why TAWAKKAL, values |
| `contact.html` | Validated contact form, contact cards, map placeholder, social links |
| `policies.html` | Shipping, returns, privacy, terms and FAQs. **Template text, so replace it with your real policies.** |

A slide-out **cart drawer**, a **search** popup, toast notifications and back-to-top are available on every page.

---

## Project structure

```
Tawakkal-v2/
├── index.html, shop.html, product-details.html, cart.html,
│   checkout.html, about.html, contact.html, policies.html
├── Logo.jpeg                  ← original logo as supplied
├── assets/images/
│   ├── logo.jpeg              ← logo used by the site
│   ├── favicon.png, apple-touch-icon.png   (resized from the logo)
│   ├── hero/  banners/  categories/
│   └── products/              ← <id>.jpg plus <id>-2.jpg, <id>-3.jpg gallery views
├── css/
│   ├── style.css              ← design tokens, global components, homepage
│   ├── shop.css               ← shop, product, cart, checkout, about, contact, policies
│   └── responsive.css         ← breakpoint adjustments
└── js/
    ├── config.js              ← ★ business info, delivery, payments, integrations
    ├── products.js            ← ★ products, prices, categories
    ├── cart.js                ← cart store (localStorage)
    ├── main.js                ← header/footer, cart drawer, search, product cards, forms, effects
    ├── shop.js, product.js, cart-page.js, checkout.js, contact.js  ← page scripts
```

Scripts load in this order on every page: Bootstrap → `config.js` → `products.js` → `cart.js` → `main.js` → page script.

---

## Where to update things

### Business information: `js/config.js`
- **`contact`**: phone, WhatsApp, email, address, opening hours, Google Maps embed URL. Empty values show a dashed "to be added" placeholder. **No contact details have been invented.**
- **`social`**: Facebook, Instagram, TikTok and YouTube URLs. Only filled links become clickable.
- **`brand`**: name, tagline, footer description, logo path.

The header, footer, contact page and checkout all read from this file, so you only need to change it once.

### Products and prices: `js/products.js`
Each product has `name`, `categories`, `pricePerKg`, optional `oldPricePerKg` (shown as a strikethrough plus a % badge), `inStock`, `bestseller` (shown on the homepage), `image`, `gallery`, `short`, `description` and `info`.

- To **add a product**, copy an existing entry and give it a unique `id`. It will then appear in the shop, search, related products and category counts automatically.
- To **mark a product sold out**, set `inStock: false`. The Add to Cart buttons are disabled and the product is labelled unavailable.
- **Categories** are defined in `TK_CATEGORIES` at the top of the same file.
- When prices are real, remove the "Demo price" labels: search for `demo-tag` / `Demo price` in `js/main.js` and `js/product.js`, and the `.notice` boxes in `index.html` and `shop.html`.

### Images
- **Logo:** `assets/images/logo.jpeg`. It is used unaltered in the navbar, footer and About page. The favicon and touch icon are resized copies.
- **Products:** put square photos (about 800×800) in `assets/images/products/` and point `image`/`gallery` at them.
- The current photos are **representative stock images** from Unsplash and Pexels (both free for commercial use). They are not species-accurate for every product, so replace them with photos of your own fish when you can.

### Delivery settings: `js/config.js` → `delivery`
- `fee`: flat delivery charge (demo value: PKR 250)
- `freeDeliveryThreshold`: subtotal for free delivery (demo value: PKR 5,000; `0` disables it)
- `serviceCities`: e.g. `["Karachi", "Lahore"]`. Turns the checkout city field into a dropdown.
- `isDemo`: set to `false` to hide the "demo" labels next to delivery charges

### Weights: `js/config.js` → `weights`
The preset options (default `0.5, 1, 2` KG) and the custom-weight limits. Price = price per KG × weight × quantity. For example, 500 g of Surmai at PKR 1,800/KG costs PKR 900.

### Payment methods: `js/config.js` → `payment`
Cash on Delivery and Bank Transfer can each be switched on or off. Fill in the bank details; until then they show "To be added".

---

## Connecting a backend

Three endpoints in `js/config.js` → `integrations` switch the forms from demo mode to live:

| Setting | Receives |
|---|---|
| `orderEndpoint` | Checkout orders, as JSON via `POST` |
| `contactEndpoint` | Contact form messages |
| `newsletterEndpoint` | Newsletter email addresses |

When an endpoint is set, the form sends JSON with `fetch()`. A `2xx` response counts as success; anything else shows an error toast.

**Order payload** (built in `js/checkout.js` → `buildOrder()`):

```json
{
  "reference": "TK-ABC12345",
  "createdAt": "2026-01-01T10:00:00.000Z",
  "customer": { "fullName": "…", "phone": "…", "email": "…" },
  "delivery": { "address": "…", "city": "…", "area": "…", "notes": "…" },
  "paymentMethod": "cod | bank",
  "items": [{ "id": "surmai", "name": "Surmai (Kingfish)", "weightKg": 0.5, "qty": 2, "pricePerKg": 1800, "lineTotal": 1800 }],
  "subtotal": 1800, "deliveryFee": 250, "total": 2050, "currency": "PKR"
}
```

> **Security:** the server must **recalculate prices and totals from its own product database**. Never trust prices sent from the browser.

**Options:**
- **WhatsApp ordering (no server needed):** set `contact.whatsapp` (e.g. `"923001234567"`). The order confirmation will then show a **"Send Order on WhatsApp"** button with the full order pre-filled.
- **Simple form services:** Formspree, Getform or Basin work for the contact and newsletter forms. Paste their endpoint URL.
- **Your own API:** Node/Express, Laravel, Django, Firebase Functions, Supabase Edge Functions, etc. Store orders, send notifications, and later add inventory, accounts and order tracking.
- **Payment gateways** (e.g. JazzCash, Easypaisa, Stripe, PayFast): these need a server to create payment sessions and verify callbacks. Add a new method in `checkout.js`, have your backend create the payment, then redirect the customer.
- **E-commerce platforms:** to move to WooCommerce or Shopify later, replace `products.js` with an API call and reuse the HTML/CSS.

---

## Features checklist

- Sticky, responsive navbar with an off-canvas mobile menu, category dropdown, search, cart count and Shop Now button
- Live product search (popup and shop page), category and price filters, in-stock filter, 6 sort options, grid/list toggle, Load More
- Per-KG pricing with weight pills, custom weight and quantity; totals update instantly
- Cart drawer and cart page: add/remove, quantity, change weight (lines merge when weights match), clear with undo, free-delivery progress bar
- Cart saved in `localStorage` across pages and synced between browser tabs
- Checkout with field validation (name, phone, email, address, city, area, terms), payment methods from config, totals, and an honest demo confirmation
- Contact and newsletter forms with validation and clearly labelled demo mode
- Toasts, back-to-top, smooth scrolling, subtle scroll-reveal animations (turned off for users who prefer reduced motion)
- SEO: a unique title and meta description per page, semantic HTML, alt text, Product JSON-LD on product pages, lazy-loaded images, `noindex` on the cart and checkout pages
- Accessibility: skip link, ARIA labels, keyboard-friendly controls, visible focus states, live regions

Wishlist and customer accounts are deliberately **not included**. They need a backend to be genuinely useful, and the brief asked that no non-functional controls be shown.

---

## Before going live

1. Fill in all contact details, social links, map URL and bank details in `js/config.js`.
2. Replace the demo prices, stock status and product photos in `js/products.js`, then remove the demo labels.
3. Replace the demo testimonials in `index.html` with genuine customer reviews, or remove that section.
4. Rewrite `policies.html` with your real delivery areas, timings, return policy, privacy policy and terms.
5. Connect an order endpoint or WhatsApp number so orders actually reach you.
6. Optionally self-host the fonts and Bootstrap, and add analytics.
