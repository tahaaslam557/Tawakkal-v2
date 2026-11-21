# TAWAKKAL Fresh Fish Website — Session Handoff

> Read this first when resuming. Last updated: 2026-11-21.

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

## Status: BUILD COMPLETE, final QA partly done

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

## NEXT STEPS (where we left off)
1. **Mobile (375px) and tablet (768px) QA was started but interrupted.** Re-run it:
   - Serve the site: `python -m http.server 5520 --bind 127.0.0.1` (from the project root)
   - Check every page for horizontal overflow, the off-canvas menu, the cart drawer, the shop filters off-canvas,
     the stacked cart rows and the checkout form. Fix anything broken in `css/responsive.css`.
   - The headless test driver was in the session scratchpad (`cdp.mjs`, a CDP driver using Node 22's built-in WebSocket
     and Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`). It may have been cleared, so recreate it if needed.
2. Optional polish: check that the reveal animations don't leave blank gaps, and review the tablet hero layout.
3. Waiting on the owner for real data: phone, WhatsApp, email, address, hours, map URL, social links and bank details
   (all in `js/config.js`); real prices and photos (`js/products.js`); real reviews; real policies.

## Conventions
- Keep demo content clearly labelled. Use the `.demo-tag`, `.notice` and `.tk-placeholder` classes for this.
- Add new products only in `js/products.js`. Category counts, search and related products update automatically.
- Shared helpers are exposed as `window.TK` (`money`, `formatWeight`, `productCard`, `toast`, `validateForm`, …).
- Do not alter `assets/images/logo.jpeg`. `Logo.jpeg` in the root is the original as supplied.
