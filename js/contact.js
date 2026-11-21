/* ==========================================================================
   TAWAKKAL — Contact page
   Renders contact details, map and social links from js/config.js.
   Missing details show clearly-marked placeholders (nothing is invented).
   Form validation/submission is handled in main.js (data-contact-form).
   ========================================================================== */

(function () {
  "use strict";
  const { qs, esc, infoOr } = window.TK;
  const CFG = window.TK_CONFIG;
  const c = CFG.contact;

  const cards = [
    {
      icon: "bi-telephone",
      title: "Call us",
      value: c.phone ? `<a href="tel:${esc(c.phone.replace(/\s/g, ""))}">${esc(c.phone)}</a>` : infoOr("", "Phone number to be added"),
    },
    {
      icon: "bi-whatsapp",
      title: "WhatsApp",
      value: c.whatsapp ? `<a href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ""))}" target="_blank" rel="noopener">Chat on WhatsApp</a>` : infoOr("", "WhatsApp number to be added"),
    },
    {
      icon: "bi-envelope",
      title: "Email",
      value: c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : infoOr("", "Email address to be added"),
    },
    {
      icon: "bi-geo-alt",
      title: "Address & hours",
      value: `<p>${infoOr(c.address, "Address to be added")}</p><p class="fw-semibold text-secondary small mt-1">${infoOr(c.hours, "Opening hours to be added")}</p>`,
    },
  ];

  qs("[data-contact-cards]").innerHTML = cards
    .map(
      (k) => `
      <div class="col-sm-6 col-xl-3">
        <div class="contact-card">
          <span class="contact-card__icon"><i class="bi ${k.icon}" aria-hidden="true"></i></span>
          <div><h2>${k.title}</h2>${k.value.startsWith("<p") ? k.value : `<p>${k.value}</p>`}</div>
        </div>
      </div>`
    )
    .join("");

  // Map: real embed if configured, otherwise a styled placeholder
  const map = qs("[data-map]");
  map.innerHTML = c.mapEmbedUrl
    ? `<iframe src="${esc(c.mapEmbedUrl)}" title="TAWAKKAL location on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`
    : `<div class="map-placeholder">
         <div>
           <i class="bi bi-geo-alt-fill" aria-hidden="true"></i>
           <h2>Map coming soon</h2>
           <p>A Google Maps embed will appear here once the business location is added to <code class="text-white">contact.mapEmbedUrl</code> in js/config.js.</p>
         </div>
       </div>`;

  // Social links
  const socials = [
    ["facebook", "Facebook"],
    ["instagram", "Instagram"],
    ["tiktok", "TikTok"],
    ["youtube", "YouTube"],
  ];
  qs("[data-social-row]").innerHTML =
    socials
      .map(([k, label]) =>
        CFG.social[k]
          ? `<a href="${esc(CFG.social[k])}" target="_blank" rel="noopener"><i class="bi bi-${k}"></i> ${label}</a>`
          : `<span class="is-disabled" title="Add the ${label} link in js/config.js"><i class="bi bi-${k}"></i> ${label}</span>`
      )
      .join("") +
    (Object.values(CFG.social).some(Boolean) ? "" : `<p class="small text-secondary w-100 mt-2 mb-0">Social profiles will be linked here soon.</p>`);
})();
