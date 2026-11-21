/* ==========================================================================
   TAWAKKAL — Product & category data (DEMO DATA)
   --------------------------------------------------------------------------
   All prices are DEMO prices in PKR per KG. Replace them with real prices.
   Images are representative stock photos — replace with photos of your own
   products in assets/images/products/ for accuracy.

   Product fields
     id            unique slug (used in URLs: product-details.html?id=...)
     name          display name
     categories    array of category ids (see TK_CATEGORIES below)
     pricePerKg    current price per KG (number, PKR)
     oldPricePerKg optional previous price per KG (shows as strikethrough)
     inStock       true / false — set from your real stock
     bestseller    true shows the product in the homepage "Bestsellers" grid
     image         main image
     gallery       extra images for the product page
     short         one-line summary for cards
     description   longer text for the product page
     info          key/value pairs for the "Product information" table
   ========================================================================== */

window.TK_CATEGORIES = [
  {
    id: "fresh-fish",
    name: "Fresh Fish",
    description: "Everyday favourites for curries, frying and family meals.",
    image: "assets/images/categories/fresh-fish.jpg",
  },
  {
    id: "premium-fish",
    name: "Premium Fish",
    description: "Prized cuts and species for special occasions.",
    image: "assets/images/categories/premium-fish.jpg",
  },
  {
    id: "whole-fish",
    name: "Whole Fish",
    description: "Whole fish you can have cleaned and cut your way.",
    image: "assets/images/categories/whole-fish.jpg",
  },
  {
    id: "fish-fillets",
    name: "Fish Fillets",
    description: "Ready-to-cook fillets and slices with less prep.",
    image: "assets/images/categories/fish-fillets.jpg",
  },
  {
    id: "prawns-shrimp",
    name: "Prawns & Shrimp",
    description: "Sweet, versatile prawns for karahi, grills and pasta.",
    image: "assets/images/categories/prawns-shrimp.jpg",
  },
  {
    id: "seafood-specials",
    name: "Seafood Specials",
    description: "Crab, lobster, clams and mixed seafood selections.",
    image: "assets/images/categories/seafood-specials.jpg",
  },
];

(function () {
  const P = "assets/images/products/";
  const g = (slug) => [P + slug + ".jpg", P + slug + "-2.jpg", P + slug + "-3.jpg"];

  window.TK_PRODUCTS = [
    {
      id: "rohu",
      name: "Rohu",
      categories: ["fresh-fish", "whole-fish"],
      pricePerKg: 750,
      oldPricePerKg: 850,
      inStock: true,
      bestseller: true,
      image: P + "rohu.jpg",
      gallery: g("rohu"),
      short: "A much-loved freshwater fish for curries and fried fish.",
      description:
        "Rohu is a popular freshwater fish with mild, slightly sweet flesh. It holds its shape well in curries and is a favourite for crisp, masala-coated fried fish.",
      info: { Type: "Freshwater fish", "Sold as": "Whole / cut pieces", "Best for": "Curry, frying, baking" },
    },
    {
      id: "surmai",
      name: "Surmai (Kingfish)",
      categories: ["premium-fish", "fish-fillets"],
      pricePerKg: 1800,
      oldPricePerKg: 2000,
      inStock: true,
      bestseller: true,
      image: P + "surmai.jpg",
      gallery: g("surmai"),
      short: "Firm, meaty steaks with rich flavour — ideal for frying.",
      description:
        "Surmai (kingfish) is known for its firm texture and rich flavour. Steak cuts are perfect for tawa fry, grilling and spicy coastal-style curries.",
      info: { Type: "Marine fish", "Sold as": "Steaks / whole", "Best for": "Tawa fry, grill, curry" },
    },
    {
      id: "pomfret",
      name: "Pomfret",
      categories: ["premium-fish", "whole-fish"],
      pricePerKg: 2200,
      inStock: true,
      bestseller: true,
      image: P + "pomfret.jpg",
      gallery: g("pomfret"),
      short: "Delicate, buttery fish that is wonderful fried whole.",
      description:
        "Pomfret has soft, delicate flesh and few bones, making it a family favourite. Fry it whole, stuff it with green masala, or steam it with lemon and herbs.",
      info: { Type: "Marine fish", "Sold as": "Whole", "Best for": "Whole fry, steaming, grill" },
    },
    {
      id: "red-snapper",
      name: "Red Snapper",
      categories: ["premium-fish", "whole-fish"],
      pricePerKg: 1900,
      oldPricePerKg: 2100,
      inStock: true,
      bestseller: true,
      image: P + "red-snapper.jpg",
      gallery: g("red-snapper"),
      short: "Striking red fish with sweet, flaky white meat.",
      description:
        "Red snapper offers sweet, lean white meat that flakes beautifully. Excellent baked whole, grilled with herbs or cooked in a light tomato curry.",
      info: { Type: "Marine fish", "Sold as": "Whole / fillet", "Best for": "Baking, grilling, curry" },
    },
    {
      id: "prawns",
      name: "Prawns",
      categories: ["prawns-shrimp"],
      pricePerKg: 2400,
      inStock: true,
      bestseller: true,
      image: P + "prawns.jpg",
      gallery: g("prawns"),
      short: "Sweet, juicy prawns for karahi, biryani and grills.",
      description:
        "Versatile prawns with a naturally sweet taste. Use them in prawn karahi, biryani, garlic butter prawns or a quick stir-fry.",
      info: { Type: "Shellfish", "Sold as": "Whole / cleaned", "Best for": "Karahi, biryani, grill" },
    },
    {
      id: "tuna",
      name: "Tuna",
      categories: ["premium-fish", "fish-fillets"],
      pricePerKg: 1600,
      inStock: true,
      bestseller: true,
      image: P + "tuna.jpg",
      gallery: g("tuna"),
      short: "Deep-red, meaty fish for searing and steaks.",
      description:
        "Tuna has dense, meaty flesh that is best cooked quickly. Sear steaks on high heat, grill them, or cube them for kebabs and salads.",
      info: { Type: "Marine fish", "Sold as": "Steaks / loin", "Best for": "Searing, grill, salads" },
    },
    {
      id: "tilapia",
      name: "Tilapia",
      categories: ["fresh-fish", "whole-fish"],
      pricePerKg: 650,
      inStock: true,
      bestseller: true,
      image: P + "tilapia.jpg",
      gallery: g("tilapia"),
      short: "Mild, budget-friendly fish for everyday cooking.",
      description:
        "Tilapia has a mild taste and tender texture, so it takes on marinades well. A great everyday choice for frying, baking and fish curries.",
      info: { Type: "Freshwater fish", "Sold as": "Whole / fillet", "Best for": "Frying, baking, curry" },
    },
    {
      id: "catfish",
      name: "Catfish",
      categories: ["fresh-fish", "whole-fish"],
      pricePerKg: 700,
      oldPricePerKg: 780,
      inStock: true,
      bestseller: true,
      image: P + "catfish.jpg",
      gallery: g("catfish"),
      short: "Tender, moist flesh that suits spicy masalas.",
      description:
        "Catfish has soft, moist flesh with a gentle flavour. It works beautifully in spicy masala curries, pakoras and pan-fried dishes.",
      info: { Type: "Freshwater fish", "Sold as": "Cut pieces", "Best for": "Curry, pakora, pan fry" },
    },
    {
      id: "boneless-fillet",
      name: "Boneless Fish Fillet",
      categories: ["fish-fillets", "fresh-fish"],
      pricePerKg: 1500,
      inStock: true,
      bestseller: false,
      image: P + "boneless-fillet.jpg",
      gallery: g("boneless-fillet"),
      short: "Clean, boneless fillets — ready for fingers and fries.",
      description:
        "Convenient boneless fillets that go straight into the pan. Perfect for fish fingers, fish & chips, grilled fillets and kids' meals.",
      info: { Type: "Fillet", "Sold as": "Boneless fillet", "Best for": "Fish fingers, grill, pan fry" },
    },
    {
      id: "salmon-fillet",
      name: "Salmon Fillet",
      categories: ["fish-fillets", "premium-fish"],
      pricePerKg: 5200,
      inStock: true,
      bestseller: false,
      image: P + "salmon-fillet.jpg",
      gallery: g("salmon-fillet"),
      short: "Rich, buttery fillet portions for roasting or pan-searing.",
      description:
        "Salmon fillet has a rich, buttery taste and silky texture. Pan-sear skin-side down, roast with lemon and herbs, or bake with a honey-garlic glaze.",
      info: { Type: "Fillet", "Sold as": "Fillet portions", "Best for": "Pan-sear, roast, bake" },
    },
    {
      id: "salmon-slices",
      name: "Salmon Slices",
      categories: ["fish-fillets", "seafood-specials"],
      pricePerKg: 5600,
      inStock: true,
      bestseller: false,
      image: P + "salmon-slices.jpg",
      gallery: g("salmon-slices"),
      short: "Neatly sliced salmon for platters and quick meals.",
      description:
        "Thin, even salmon slices for quick-cook recipes and elegant platters. Pair with lemon, dill and a light dressing.",
      info: { Type: "Sliced fillet", "Sold as": "Slices", "Best for": "Platters, quick sear, salads" },
    },
    {
      id: "jumbo-prawns",
      name: "Jumbo Prawns",
      categories: ["prawns-shrimp", "premium-fish"],
      pricePerKg: 3200,
      inStock: true,
      bestseller: false,
      image: P + "jumbo-prawns.jpg",
      gallery: g("jumbo-prawns"),
      short: "Large, meaty prawns that steal the show on the grill.",
      description:
        "Big, meaty prawns made for the grill or barbecue. Butterfly them with garlic butter or skewer them with a tikka marinade.",
      info: { Type: "Shellfish", "Sold as": "Whole", "Best for": "Grill, BBQ, butter garlic" },
    },
    {
      id: "lobster",
      name: "Lobster",
      categories: ["seafood-specials", "premium-fish"],
      pricePerKg: 6500,
      inStock: true,
      bestseller: false,
      image: P + "lobster.jpg",
      gallery: g("lobster"),
      short: "A true celebration seafood — sweet and luxurious.",
      description:
        "Lobster offers sweet, tender meat for special occasions. Steam or grill it and serve with lemon butter for an unforgettable meal.",
      info: { Type: "Shellfish", "Sold as": "Whole", "Best for": "Steaming, grilling" },
    },
    {
      id: "crab",
      name: "Crab",
      categories: ["seafood-specials"],
      pricePerKg: 1800,
      inStock: true,
      bestseller: false,
      image: P + "crab.jpg",
      gallery: g("crab"),
      short: "Flavourful crab for masala, soups and pepper fry.",
      description:
        "Crab brings deep, sweet seafood flavour to any dish. Cook it in a spicy masala, a black pepper fry or a comforting crab soup.",
      info: { Type: "Shellfish", "Sold as": "Whole", "Best for": "Masala, pepper fry, soup" },
    },
    {
      id: "clams",
      name: "Clams",
      categories: ["seafood-specials"],
      pricePerKg: 1200,
      inStock: false,
      bestseller: false,
      image: P + "clams.jpg",
      gallery: g("clams"),
      short: "Briny clams for pasta, broths and steamed dishes.",
      description:
        "Clams add a fresh, briny taste to pasta, broths and steamed dishes. Steam with garlic, chilli and herbs for a simple, delicious meal.",
      info: { Type: "Shellfish", "Sold as": "Whole (live)", "Best for": "Pasta, broth, steaming" },
    },
    {
      id: "seafood-mix",
      name: "Seafood Selection Box",
      categories: ["seafood-specials"],
      pricePerKg: 2800,
      inStock: true,
      bestseller: false,
      image: P + "seafood-mix.jpg",
      gallery: g("seafood-mix"),
      short: "A mixed selection of fish and shellfish for sharing.",
      description:
        "A mixed selection of fish and shellfish — ideal for a seafood platter, paella or a weekend barbecue with family and friends.",
      info: { Type: "Mixed selection", "Sold as": "Assorted", "Best for": "Platters, paella, BBQ" },
    },
  ];
})();
