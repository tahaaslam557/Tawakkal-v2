# TAWAKKAL Fresh Fish Website — Session Handoff

> Read this first when resuming. Last updated: 2026-11-23.

## Project brief
The source brief is `C:\Users\Taha Mindwave\Downloads\TAWAKKAL_Fresh_Fish_Website_Claude_Code_Prompt.pdf`.
It asks for a premium, responsive, multi-page fresh fish e-commerce **frontend** built ONLY with HTML5, CSS3, Bootstrap 5,
vanilla JS, Bootstrap Icons and Google Fonts. No React, Vue or Tailwind.

The brief's hard rules:
- Never invent business info, ratings, reviews or company history.
- Demo prices, stock and reviews must be visibly labelled as demo.
- Every visible control must work. No wishlist or account unless fully functional; both are currently omitted on purpose.

Brand colours: Navy `#071719`, Teal `#102B2B`, Green `#65C936`, Lime `#A3E635`, Light BG `#F5F9F3`, Ocean `#269ACB`.
The logo background is `#041117` (`--tk-ink`). Fonts are Fraunces (display) and Manrope (body).

## Status: BUILD COMPLETE, responsive QA done

### Done
- All pages: `index.html`, `shop.html`, `product-details.html`, `cart.html`, `checkout.html`, `about.html`, `contact.html`, `policies.html`
- CSS: `css/style.css` (tokens, global, homepage), `css/shop.css` (commerce and inner pages), `css/responsive.css`
- JS: `js/config.js` (business info, delivery, payments, endpoints), `js/products.js` (16 demo products, 6 categories),
  `js/cart.js` (localStorage store), `js/main.js` (renders header, footer, cart drawer and search; product cards; forms; effects),
  and page scripts `shop.js`, `product.js`, `cart-page.js`, `checkout.js`, `contact.js`
- Images in `assets/images/`: logo, favicon, hero, banners, categories, products, plus `-2`/`-3` gallery crops.
  These are Unsplash/Pexels stock photos, downloaded and optimized.
- `README.md`: how to run, where to edit content, how to connect a backend or WhatsApp, and a pre-launch checklist
- Header and footer are injected by JS into `#site-header` / `#site-footer`. Business details come from `config.js`.

### Verified (headless Chrome at 1440px)
- No console errors and no horizontal overflow on any page
- 500 g Surmai = PKR 900; quantity, custom weight and invalid custom weight all work
- Cart drawer, cart page, quantity changes and localStorage persistence work
- Shop: category filter, sort, Load More (16 products), search, price + in-stock filter, list view
- Checkout: empty submit flags 7 errors. A valid submit shows the demo confirmation modal and clears the cart.
- Contact form and newsletter validation, and the product "not found" state

### Fixes already applied
- Announcement bar collapse on scroll: now `#site-header.is-scrolled { top:-38px }`
- Card demo-price tag layout
- Fish-fillets category image
- Invalid icons replaced: `bi-leaf` became an inline SVG; `bi-scales` became `bi-sliders`

### Responsive QA (2026-11-23)
- No horizontal overflow on any of the 8 pages at 375px, 768px or 1440px
- **Fixed:** the navbar's `backdrop-filter` was trapping the fixed off-canvas menu inside the navbar, which caused
  400px of sideways scroll below 992px. The navbar is now solid `--tk-ink` with no backdrop-filter.
  Do not add `backdrop-filter`, `transform` or `filter` to `.tk-navbar` or any other ancestor of an `.offcanvas`.
- Checked visually on mobile: hero, trust strip, categories (2 columns), product cards, off-canvas menu, cart drawer,
  filters panel (opens via the Filters button), product page, stacked cart rows, checkout summary
- Polish: the mobile filters panel now has a white background

### Product card controls (updated 2026-11-24)
- Every product card (shop grid/list, homepage bestsellers, related products) has 500 g / 1 KG / 2 KG / **Custom** weight.
  Custom opens a KG input validated against `CFG.weights`. Add to Cart adds **1 pack** of the chosen weight.
- **The owner asked for NO quantity stepper on cards.** Quantity is set on the product page and in the cart.
- The code is `productCard()`, `updateCard()`, `setCardWeight()`, `cardCustomWeight()` and `bindProductCards()` in `js/main.js`,
  with styles in `css/style.css` (`.card-custom`, `.product-card__actions`).

## NEXT STEPS
1. Optional: test on real phones (iOS Safari, Android Chrome) once the site is hosted.
2. Waiting on the owner for real data: phone, WhatsApp, email, address, hours, map URL, social links and bank details
   (all in `js/config.js`); real prices and photos (`js/products.js`); real reviews; real policies.
   The full checklist is under "Before going live" in `README.md`.
3. Optional: connect `integrations.orderEndpoint` or a WhatsApp number so orders actually reach the business.

To QA again: `python -m http.server 5520 --bind 127.0.0.1`, then test in a browser or headless Chrome
(`C:/Program Files/Google/Chrome/Application/chrome.exe`). Note: `[data-bs-target="#filtersPanel"]` also matches the
panel's close button, so target `[data-bs-toggle="offcanvas"][data-bs-target="#filtersPanel"]` to open it.

## Conventions
- Keep demo content clearly labelled. Use the `.demo-tag`, `.notice` and `.tk-placeholder` classes for this.
- Add new products only in `js/products.js`. Category counts, search and related products update automatically.
- Shared helpers are exposed as `window.TK` (`money`, `formatWeight`, `productCard`, `toast`, `validateForm`, …).
- Do not alter `assets/images/logo.jpeg`. `Logo.jpeg` in the root is the original as supplied.
