/* ==========================================================================
   TAWAKKAL — Site configuration
   --------------------------------------------------------------------------
   This is the ONE place to edit business details, delivery settings,
   payment options and integrations. Every page reads from this file.

   Values left as empty strings ("") are treated as "not configured yet":
   the site shows a clearly marked placeholder instead of inventing data.
   ========================================================================== */

window.TK_CONFIG = {
  brand: {
    name: "TAWAKKAL",
    tagline: "Freshness You Can Trust",
    description:
      "TAWAKKAL brings fresh fish and seafood from the market to your kitchen — carefully selected, hygienically packed and delivered to your door.",
    logo: "assets/images/logo.jpeg",
  },

  /* ---- Business contact details (leave "" until you have the real value) ---- */
  contact: {
    phone: "",          // e.g. "+92 300 1234567"
    whatsapp: "",       // digits only, international format, e.g. "923001234567"
    email: "",          // e.g. "orders@yourdomain.com"
    address: "",        // e.g. "Shop 12, Fish Market Road, Karachi"
    hours: "",          // e.g. "Mon – Sun, 9:00 AM – 9:00 PM"
    mapEmbedUrl: "",    // Google Maps → Share → Embed a map → copy the src="..." URL
  },

  /* ---- Social links (only filled links become clickable) ---- */
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },

  /* ---- Money & delivery ---- */
  currency: "PKR",
  delivery: {
    fee: 250,                    // DEMO flat delivery charge in PKR
    freeDeliveryThreshold: 5000, // DEMO: orders at/above this subtotal get free delivery. Set 0 to disable.
    serviceCities: [],           // e.g. ["Karachi", "Lahore"]. Empty = free-text city field.
    isDemo: true,                // shows a "demo" label next to delivery charges
  },

  /* ---- Weight options shown on every product (in KG) ---- */
  weights: {
    options: [0.5, 1, 2],
    allowCustom: true,
    customMin: 0.25,
    customMax: 20,
    customStep: 0.25,
  },

  /* ---- Payment methods shown at checkout ---- */
  payment: {
    cashOnDelivery: { enabled: true },
    bankTransfer: {
      enabled: true,
      // Replace these with your real account details before going live.
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      iban: "",
    },
  },

  /* ---- Integrations (frontend demo until these are set) ----
     If an endpoint is set, the form POSTs JSON to it with fetch().
     If empty, the form is validated and a clearly-labelled demo message is shown. */
  integrations: {
    orderEndpoint: "",       // e.g. "https://api.yourdomain.com/orders"
    contactEndpoint: "",     // e.g. Formspree / your backend URL
    newsletterEndpoint: "",  // e.g. Mailchimp / Brevo proxy URL
    whatsappOrdering: true,  // when contact.whatsapp is set, checkout offers "Send order on WhatsApp"
  },
};
