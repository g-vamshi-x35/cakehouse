// Rich product catalog used as the seed source for Supabase (scripts/seed-products.ts)
// and as an offline fallback so the site keeps working before/without a DB connection.
// See src/lib/data/products.ts for the data-access layer that picks between the two.

export type WeightOption = {
  label: string;
  price: number | null; // null => "Custom", ask for a quote
  compareAtPrice?: number; // set to show a struck-through "was" price next to a discount
};

export const menuCategories = [
  { id: "all", label: "All" },
  { id: "regular-cakes", label: "Regular Cakes" },
  { id: "customized-cakes", label: "Customized Cakes" },
  { id: "pizza", label: "Pizza" },
  { id: "snacks", label: "Samosa & Patties" },
] as const;

export type MenuCategoryId = (typeof menuCategories)[number]["id"];

// Full requested browse taxonomy, kept as a lookup table of id -> label.
// Only tags actually present on at least one real product are ever shown
// in the UI (see getActiveBrowseTags) — the rest are here so new real
// products can be tagged into them later with zero UI work.
export const BROWSE_TAGS: Record<string, string> = {
  "chocolate-cakes": "Chocolate Cakes",
  "fruit-cakes": "Fruit Cakes",
  "kids-cakes": "Kids Cakes",
  "wedding-cakes": "Wedding Cakes",
  "anniversary-cakes": "Anniversary Cakes",
  "birthday-cakes": "Birthday Cakes",
  "theme-cakes": "Theme Cakes",
  "cartoon-cakes": "Cartoon Cakes",
  "designer-cakes": "Designer Cakes",
  "tier-cakes": "Tier Cakes",
  "heart-cakes": "Heart Cakes",
  "eggless-cakes": "Eggless Cakes",
  "cup-cakes": "Cup Cakes",
  "jar-cakes": "Jar Cakes",
  pastries: "Pastries",
  "cheese-cakes": "Cheese Cakes",
  brownies: "Brownies",
  "bento-cakes": "Bento Cakes",
  "mini-cakes": "Mini Cakes",
  "festival-cakes": "Festival Cakes",
  "seasonal-cakes": "Seasonal Cakes",
  "dry-cakes": "Dry Cakes",
  cookies: "Cookies",
  donuts: "Donuts",
  muffins: "Muffins",
  croissants: "Croissants",
  puffs: "Puffs",
  "veg-patties": "Veg Patties",
  "paneer-patties": "Paneer Patties",
  "mushroom-patties": "Mushroom Patties",
  "aloo-patties": "Aloo Patties",
  "veg-burger": "Veg Burger",
  "cheese-burger": "Cheese Burger",
  "french-fries": "French Fries",
  "garlic-bread": "Garlic Bread",
  sandwich: "Sandwich",
  rolls: "Rolls",
  "cold-coffee": "Cold Coffee",
  "hot-coffee": "Hot Coffee",
  tea: "Tea",
  milkshake: "Milkshake",
  mojito: "Mojito",
  "cool-drinks": "Cool Drinks",
  "ice-cream": "Ice Cream",
  candles: "Candles",
  "birthday-accessories": "Birthday Accessories",
  "party-decorations": "Party Decorations",
  "gift-hampers": "Gift Hampers",
  "new-arrivals": "New Arrivals",
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  type: "cake" | "snack";
  category: "regular-cakes" | "customized-cakes" | "pizza" | "snacks";
  description: string;
  ingredients?: string;
  images: string[];
  price: number; // base/display price (snacks) or starting price (cakes)
  weightOptions?: WeightOption[];
  flavours?: string[];
  note?: string;
  featured?: boolean;
  avgRating?: number;
  reviewCount?: number;
  available?: boolean; // defaults to true when omitted
  tags?: string[]; // secondary browse categories — keys of BROWSE_TAGS
  // Custom-cake-only descriptive fields (customized-cakes category)
  designType?: string;
  theme?: string;
  minWeight?: string;
  recommendedWeight?: string;
  creamType?: string;
};

// Shared across every cake — the site is 100% eggless & vegetarian, always.
export const SHELF_LIFE = "Best enjoyed within 24 hours; keeps well refrigerated for up to 3 days.";
export const STORAGE_INSTRUCTIONS =
  "Refrigerate immediately on arrival. Bring to room temperature for 20–30 minutes before serving for the best taste and texture.";

export function servingSizeFor(weightLabel: string): string {
  const table: Record<string, string> = {
    "0.5 kg": "Serves 4–6",
    "1 kg": "Serves 8–10",
    "2 kg": "Serves 18–20",
  };
  return table[weightLabel] ?? "Varies by size";
}

const CAKE_FLAVOURS = [
  "Vanilla",
  "Chocolate",
  "Butterscotch",
  "Black Forest",
  "Red Velvet",
  "Pineapple",
];

function weightOptionsFrom(price500?: number, price1000?: number): WeightOption[] | undefined {
  if (!price500) return undefined;
  const options: WeightOption[] = [{ label: "0.5 kg", price: price500 }];
  if (price1000) {
    options.push({ label: "1 kg", price: price1000 });
    options.push({ label: "2 kg", price: Math.round(price1000 * 1.9) });
  }
  options.push({ label: "Custom", price: null });
  return options;
}

const EGGLESS_NOTE =
  "100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.";

export const products: Product[] = [
  {
    id: "vanilla",
    slug: "vanilla-cake",
    name: "Vanilla Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "A timeless classic — soft, moist vanilla sponge layered with light vanilla cream. Simple, comforting and always a crowd-pleaser.",
    ingredients: `Refined flour, sugar, fresh cream, vegetable oil, vanilla essence, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/vanilla-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 550),
    flavours: ["Vanilla"],
    tags: ["birthday-cakes", "eggless-cakes"],
  },
  {
    id: "mini-vanilla",
    slug: "mini-vanilla-cake",
    name: "Mini Vanilla Cake",
    type: "cake",
    category: "regular-cakes",
    description: "A single-serve mini version of our classic vanilla cake — soft sponge with light vanilla cream, perfect for a small treat.",
    ingredients: `Refined flour, sugar, fresh cream, vegetable oil, vanilla essence, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 120,
    flavours: ["Vanilla"],
    tags: ["mini-cakes", "eggless-cakes"],
  },
  {
    id: "pineapple",
    slug: "pineapple-cake",
    name: "Pineapple Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Fresh pineapple chunks folded into a soft vanilla sponge, finished with a light whipped cream and pineapple glaze.",
    ingredients: `Refined flour, fresh cream, pineapple compote, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/pineapple-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Pineapple"],
    tags: ["fruit-cakes", "eggless-cakes"],
  },
  {
    id: "mini-pineapple",
    slug: "mini-pineapple-cake",
    name: "Mini Pineapple Cake",
    type: "cake",
    category: "regular-cakes",
    description: "A single-serve mini pineapple cake — fresh pineapple folded into soft sponge with light whipped cream.",
    ingredients: `Refined flour, fresh cream, pineapple compote, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 120,
    flavours: ["Pineapple"],
    tags: ["mini-cakes", "eggless-cakes"],
  },
  {
    id: "butterscotch",
    slug: "butterscotch-cake",
    name: "Butterscotch Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Caramelised butterscotch sponge layered with praline crunch and butterscotch cream — rich, nutty and irresistible.",
    ingredients: `Refined flour, butterscotch praline, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/butterscotch-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Butterscotch"],
    tags: ["birthday-cakes", "eggless-cakes"],
  },
  {
    id: "black-forest",
    slug: "black-forest-cake",
    name: "Black Forest Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "The bestseller — chocolate sponge soaked lightly, layered with whipped cream, cherries and chocolate shavings.",
    ingredients: `Refined flour, cocoa, fresh cream, cherries, chocolate shavings, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/black-forest-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Black Forest"],
    featured: true,
    tags: ["birthday-cakes", "eggless-cakes"],
  },
  {
    id: "mini-black-forest",
    slug: "mini-black-forest-cake",
    name: "Mini Black Forest Cake",
    type: "cake",
    category: "regular-cakes",
    description: "A single-serve mini Black Forest cake — chocolate sponge, whipped cream, cherries and chocolate shavings.",
    ingredients: `Refined flour, cocoa, fresh cream, cherries, chocolate shavings, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 130,
    flavours: ["Black Forest"],
    tags: ["mini-cakes", "eggless-cakes"],
  },
  {
    id: "chocolate",
    slug: "chocolate-cake",
    name: "Chocolate Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "A deep, indulgent chocolate sponge layered with silky chocolate ganache — made for true chocolate lovers.",
    ingredients: `Refined flour, cocoa, chocolate ganache, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/chocolate-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Chocolate"],
    featured: true,
    tags: ["birthday-cakes", "chocolate-cakes", "eggless-cakes"],
  },
  {
    id: "mini-chocolate",
    slug: "mini-chocolate-cake",
    name: "Mini Chocolate Cake",
    type: "cake",
    category: "regular-cakes",
    description: "A single-serve mini chocolate cake — deep chocolate sponge layered with silky chocolate ganache.",
    ingredients: `Refined flour, cocoa, chocolate ganache, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 120,
    flavours: ["Chocolate"],
    tags: ["mini-cakes", "eggless-cakes"],
  },
  {
    id: "mini-choc-bento",
    slug: "mini-chocolate-bento",
    name: "Mini Chocolate Bento",
    type: "cake",
    category: "regular-cakes",
    description: "A cute personal-size chocolate bento cake in a box — perfect for a small celebration or a sweet gift.",
    ingredients: `Refined flour, cocoa, chocolate ganache, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 150,
    flavours: ["Chocolate"],
    tags: ["bento-cakes", "mini-cakes", "eggless-cakes"],
  },
  {
    id: "dark-truffle",
    slug: "dark-truffle-cake",
    name: "Dark Truffle Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Decadent dark chocolate sponge enrobed in glossy truffle ganache — for the serious chocolate connoisseur.",
    ingredients: `Refined flour, dark cocoa, truffle ganache, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/dark-truffle-cake/1.jpg"],
    price: 450,
    weightOptions: weightOptionsFrom(450, 900),
    flavours: ["Dark Chocolate"],
    featured: true,
    tags: ["chocolate-cakes", "eggless-cakes"],
  },
  {
    id: "tutti-frutti",
    slug: "tutti-frutti-cake",
    name: "Tutti Frutti Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Soft vanilla sponge studded with colourful candied tutti frutti bits, finished with a fresh fruit topping — a fun, fruity favourite.",
    ingredients: `Refined flour, tutti frutti, fresh cream, seasonal fruit, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/menu/menu-fruit-cake.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Tutti Frutti"],
    tags: ["fruit-cakes", "eggless-cakes"],
  },
  {
    id: "red-velvet",
    slug: "red-velvet-cake",
    name: "Red Velvet Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Silky red velvet sponge layered with cream cheese frosting — elegant, smooth and beautifully balanced.",
    ingredients: `Refined flour, cocoa, cream cheese frosting, fresh cream, sugar, vegetable oil, food colour, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/red-velvet-cake/1.jpg"],
    price: 350,
    weightOptions: weightOptionsFrom(350, 700),
    flavours: ["Red Velvet"],
    featured: true,
    tags: ["birthday-cakes", "wedding-cakes", "anniversary-cakes", "designer-cakes", "eggless-cakes"],
  },
  {
    id: "mini-red-velvet",
    slug: "mini-red-velvet-cake",
    name: "Mini Red Velvet Cake",
    type: "cake",
    category: "regular-cakes",
    description: "A single-serve mini red velvet cake — silky red velvet sponge with cream cheese frosting.",
    ingredients: `Refined flour, cocoa, cream cheese frosting, fresh cream, sugar, vegetable oil, food colour, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 150,
    flavours: ["Red Velvet"],
    tags: ["mini-cakes", "eggless-cakes"],
  },
  {
    id: "mini-redvelvet-bento",
    slug: "mini-red-velvet-bento",
    name: "Mini Red Velvet Bento",
    type: "cake",
    category: "regular-cakes",
    description: "A cute personal-size red velvet bento cake in a box — silky sponge with cream cheese frosting.",
    ingredients: `Refined flour, cocoa, cream cheese frosting, fresh cream, sugar, vegetable oil, food colour, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 170,
    flavours: ["Red Velvet"],
    tags: ["bento-cakes", "mini-cakes", "eggless-cakes"],
  },
  {
    id: "kit-kat",
    slug: "kit-kat-cake",
    name: "Kit Kat Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Chocolate sponge wrapped in a ring of Kit Kat fingers, piled high with chocolates and drizzled ganache.",
    ingredients: `Refined flour, cocoa, chocolate ganache, wafer chocolates, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 550,
    weightOptions: weightOptionsFrom(550, 1000),
    flavours: ["Chocolate"],
    tags: ["birthday-cakes", "chocolate-cakes", "eggless-cakes"],
  },
  {
    id: "rasmalai",
    slug: "rasmalai-cake",
    name: "Rasmalai Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "A fusion favourite — soft sponge soaked in rasmalai milk, layered with malai cream and chopped pistachios.",
    ingredients: `Refined flour, milk, rasmalai, fresh cream, pistachios, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/rasmalai-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Rasmalai"],
    tags: ["fruit-cakes", "festival-cakes", "eggless-cakes"],
  },
  {
    id: "doll",
    slug: "doll-cake",
    name: "Doll Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "A show-stopping princess doll cake — soft sponge skirt piped by hand with detailed cream rosettes and a doll of your choice.",
    ingredients: `Refined flour, fresh cream, fondant/cream detailing, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE} Final design & price depend on complexity.`,
    images: ["/images/menu/menu-doll-barbie-cake.jpg"],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    featured: true,
    designType: "Semi-fondant with hand-piped cream detailing",
    theme: "Princess / Doll",
    minWeight: "1 kg",
    recommendedWeight: "2 kg (for the full skirt effect)",
    creamType: "Fresh whipped cream",
    tags: ["kids-cakes", "theme-cakes", "eggless-cakes"],
  },
  {
    id: "car",
    slug: "car-cake",
    name: "Car Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "A fun 3D car-shaped cake, hand-sculpted and piped in cream — perfect for a little one's birthday.",
    ingredients: `Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE} Final design & price depend on complexity.`,
    images: ["/images/menu/menu-car-cake.jpg"],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    featured: true,
    designType: "3D hand-sculpted with cream piping",
    theme: "Vehicle / Car",
    minWeight: "1 kg",
    recommendedWeight: "1.5–2 kg (for a well-proportioned shape)",
    creamType: "Fresh whipped cream",
    tags: ["kids-cakes", "theme-cakes", "eggless-cakes"],
  },
  {
    id: "doraemon",
    slug: "doraemon-cake",
    name: "Doraemon Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "Everyone's favourite robot cat, hand-piped in cream on a soft sponge base — a guaranteed smile at any kids' party.",
    ingredients: `Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE} Final design & price depend on complexity.`,
    images: ["/images/menu/menu-doraemon-cake.jpg"],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    designType: "Cream-piped character design",
    theme: "Cartoon / Kids",
    minWeight: "1 kg",
    recommendedWeight: "1.5 kg",
    creamType: "Fresh whipped cream",
    tags: ["kids-cakes", "theme-cakes", "cartoon-cakes", "eggless-cakes"],
  },
  {
    id: "bento",
    slug: "bento-cake",
    name: "Bento Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "A cute mini personal-size cake in a box, perfect for a small celebration, a sweet gift, or just because.",
    ingredients: `Refined flour, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/bento-cake/1.jpg"],
    price: 150,
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    designType: "Mini personal-size cake, presented in a box",
    theme: "Custom (any small design)",
    minWeight: "0.15 kg",
    recommendedWeight: "0.15–0.25 kg per box",
    creamType: "Fresh whipped cream",
    tags: ["bento-cakes", "eggless-cakes"],
  },
  {
    id: "mini-oreo-bento",
    slug: "mini-oreo-bento",
    name: "Mini Oreo Bento",
    type: "cake",
    category: "regular-cakes",
    description: "A cute personal-size Oreo bento cake in a box — chocolate sponge loaded with crushed Oreo-style cookies and cream.",
    ingredients: `Refined flour, cocoa, chocolate sandwich cookies, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 160,
    flavours: ["Oreo"],
    tags: ["bento-cakes", "mini-cakes", "eggless-cakes"],
  },
  {
    id: "cheesecake",
    slug: "cheesecake",
    name: "Cheesecake",
    type: "cake",
    category: "regular-cakes",
    description:
      "A rich, creamy baked cheesecake on a buttery biscuit base — smooth, dense and indulgent in every bite.",
    ingredients: `Refined flour, cream cheese, fresh cream, biscuit crumb, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/cheesecake/1.jpg"],
    price: 450,
    weightOptions: weightOptionsFrom(450, 900),
    flavours: ["Classic", "Blueberry", "Strawberry"],
    tags: ["wedding-cakes", "anniversary-cakes", "designer-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "choco-chip",
    slug: "choco-chip-cake",
    name: "Choco Chip Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Soft vanilla-chocolate sponge studded with chocolate chips throughout, finished with a light cream frosting.",
    ingredients: `Refined flour, chocolate chips, fresh cream, cocoa, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Chocolate Chip"],
    tags: ["chocolate-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "chocolate-truffle",
    slug: "chocolate-truffle-cake",
    name: "Chocolate Truffle Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Moist chocolate sponge layered with silky chocolate truffle cream and a glossy ganache finish.",
    ingredients: `Refined flour, cocoa, chocolate truffle cream, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/chocolate-truffle-cake/1.jpg"],
    price: 400,
    weightOptions: weightOptionsFrom(400, 800),
    flavours: ["Chocolate Truffle"],
    tags: ["chocolate-cakes", "wedding-cakes", "anniversary-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "coffee-cake",
    slug: "coffee-cake",
    name: "Coffee Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Soft coffee-infused sponge layered with light coffee cream — subtly sweet with a gentle coffee kick.",
    ingredients: `Refined flour, coffee decoction, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/coffee-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Coffee"],
    tags: ["chocolate-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "dry-fruit-cake",
    slug: "dry-fruit-cake",
    name: "Dry Fruit Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Rich sponge loaded with almonds, cashews, raisins and dates — a wholesome, nutty favourite.",
    ingredients: `Refined flour, mixed dry fruits (almonds, cashews, raisins, dates), fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/dry-fruit-cake/1.jpg"],
    price: 450,
    weightOptions: weightOptionsFrom(450, 900),
    flavours: ["Dry Fruit"],
    tags: ["fruit-cakes", "festival-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "ferrero-rocher",
    slug: "ferrero-rocher-cake",
    name: "Ferrero Rocher Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Decadent hazelnut-chocolate sponge topped with Ferrero-style chocolate hazelnut balls and rich ganache.",
    ingredients: `Refined flour, cocoa, hazelnut praline, chocolate ganache, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 550,
    weightOptions: weightOptionsFrom(550, 1000),
    flavours: ["Ferrero Rocher"],
    tags: ["chocolate-cakes", "wedding-cakes", "anniversary-cakes", "designer-cakes", "festival-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "kesar-pista",
    slug: "kesar-pista-cake",
    name: "Kesar Pista Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Fragrant saffron sponge layered with pistachio cream — a festive, aromatic favourite.",
    ingredients: `Refined flour, saffron, pistachios, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/kesar-pista-cake/1.jpg"],
    price: 450,
    weightOptions: weightOptionsFrom(450, 900),
    flavours: ["Kesar Pista"],
    tags: ["fruit-cakes", "festival-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "mango-cake",
    slug: "mango-cake",
    name: "Mango Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Fresh mango pulp folded into a soft vanilla sponge with mango cream — a seasonal favourite.",
    ingredients: `Refined flour, mango pulp, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/mango-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Mango"],
    tags: ["fruit-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "mixed-fruit-cake",
    slug: "mixed-fruit-cake",
    name: "Mixed Fruit Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Soft sponge loaded with a colourful mix of fresh seasonal fruits and light whipped cream.",
    ingredients: `Refined flour, mixed seasonal fruits, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Mixed Fruit"],
    tags: ["fruit-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "oreo-cake",
    slug: "oreo-cake",
    name: "Oreo Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Chocolate sponge loaded with crushed Oreo-style cookies and cream, finished with cookie crumble on top.",
    ingredients: `Refined flour, cocoa, chocolate sandwich cookies, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 350,
    weightOptions: weightOptionsFrom(350, 700),
    flavours: ["Oreo"],
    tags: ["birthday-cakes", "chocolate-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "strawberry-cake",
    slug: "strawberry-cake",
    name: "Strawberry Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "Soft vanilla sponge layered with fresh strawberry compote and light whipped cream.",
    ingredients: `Refined flour, strawberry compote, fresh cream, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/strawberry-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Strawberry"],
    tags: ["fruit-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "white-forest",
    slug: "white-forest-cake",
    name: "White Forest Cake",
    type: "cake",
    category: "regular-cakes",
    description:
      "The classic Black Forest, reimagined in white — vanilla sponge, whipped cream, cherries and white chocolate shavings.",
    ingredients: `Refined flour, fresh cream, cherries, white chocolate shavings, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: ["/images/products/cakes/white-forest-cake/1.jpg"],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["White Forest"],
    tags: ["birthday-cakes", "wedding-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "car-bike",
    slug: "car-bike-cake",
    name: "Car Bike Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "A fun 3D bike-shaped cake, hand-sculpted and piped in cream — a joyful centerpiece for any little rider's birthday.",
    ingredients: `Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE} Final design & price depend on complexity.`,
    images: [],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    designType: "3D hand-sculpted with cream piping",
    theme: "Vehicle / Bike",
    minWeight: "1 kg",
    recommendedWeight: "1.5–2 kg (for a well-proportioned shape)",
    creamType: "Fresh whipped cream",
    tags: ["kids-cakes", "theme-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "cartoon-cake",
    slug: "cartoon-cake",
    name: "Cartoon Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "Your child's favourite cartoon character, hand-piped in cream on a soft sponge base — tell us the character and we'll bring it to life.",
    ingredients: `Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE} Final design & price depend on complexity.`,
    images: [],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    designType: "Cream-piped character design",
    theme: "Cartoon / Kids (tell us the character)",
    minWeight: "1 kg",
    recommendedWeight: "1.5 kg",
    creamType: "Fresh whipped cream",
    tags: ["kids-cakes", "cartoon-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "photo-cake",
    slug: "photo-cake",
    name: "Photo Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "An edible print of your favourite photo on a soft cream cake — a personal, memorable centerpiece for any celebration. Send us your photo on WhatsApp when ordering.",
    ingredients: `Refined flour, fresh cream, edible photo print, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE}`,
    images: [],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Send your photo on WhatsApp after ordering",
    designType: "Edible photo print on cream cake",
    theme: "Custom photo",
    minWeight: "0.5 kg",
    recommendedWeight: "1 kg",
    creamType: "Fresh whipped cream",
    tags: ["birthday-cakes", "anniversary-cakes", "theme-cakes", "designer-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "princess-cake",
    slug: "princess-cake",
    name: "Princess Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "A dreamy princess-themed cake with hand-piped cream detailing and a princess figure of your choice.",
    ingredients: `Refined flour, fresh cream, fondant/cream detailing, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE} Final design & price depend on complexity.`,
    images: [],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    designType: "Semi-fondant with hand-piped cream detailing",
    theme: "Princess",
    minWeight: "1 kg",
    recommendedWeight: "2 kg (for the full skirt effect)",
    creamType: "Fresh whipped cream",
    tags: ["kids-cakes", "theme-cakes", "cartoon-cakes", "eggless-cakes", "new-arrivals"],
  },
  {
    id: "spiderman-cake",
    slug: "spiderman-cake",
    name: "Spider-Man Cake",
    type: "cake",
    category: "customized-cakes",
    description:
      "A web-slinging superhero cake, hand-piped in cream — a favourite for action-hero-loving kids.",
    ingredients: `Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. ${EGGLESS_NOTE} Final design & price depend on complexity.`,
    images: [],
    price: 350,
    weightOptions: weightOptionsFrom(350, 650),
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
    designType: "Cream-piped character design",
    theme: "Superhero / Cartoon",
    minWeight: "1 kg",
    recommendedWeight: "1.5 kg",
    creamType: "Fresh whipped cream",
    tags: ["kids-cakes", "theme-cakes", "cartoon-cakes", "eggless-cakes", "new-arrivals"],
  },
  { id: "pizza-margherita", slug: "margherita-pizza", name: "Margherita Pizza", type: "snack", category: "pizza", description: "Classic pizza with tomato sauce, mozzarella and basil.", images: [], price: 110 },
  { id: "pizza-cheese", slug: "cheese-pizza", name: "Cheese Pizza", type: "snack", category: "pizza", description: "Loaded with extra mozzarella cheese.", images: [], price: 120 },
  { id: "pizza-veg", slug: "veg-pizza", name: "Veg Pizza", type: "snack", category: "pizza", description: "Topped with a colourful mix of fresh vegetables.", images: [], price: 130 },
  { id: "pizza-farm-fresh", slug: "farm-fresh-pizza", name: "Farm Fresh Pizza", type: "snack", category: "pizza", description: "Loaded with garden-fresh vegetable toppings.", images: [], price: 150 },
  { id: "pizza-cheese-burst", slug: "cheese-burst-pizza", name: "Cheese Burst Pizza", type: "snack", category: "pizza", description: "Stuffed-crust pizza with a molten cheese burst.", images: [], price: 180 },
  { id: "pizza-onion", slug: "onion-pizza", name: '8" Onion Pizza', type: "snack", category: "pizza", description: "Classic thin-crust pizza loaded with onions and mozzarella.", images: [], price: 100 },
  { id: "pizza-sweetcorn", slug: "sweetcorn-pizza", name: '8" Sweetcorn Pizza', type: "snack", category: "pizza", description: "Cheesy pizza topped with sweet corn kernels.", images: [], price: 120 },
  { id: "pizza-paneer", slug: "paneer-pizza", name: '8" Paneer Pizza', type: "snack", category: "pizza", description: "Loaded with soft paneer cubes and mozzarella.", images: [], price: 130 },
  { id: "pizza-mushroom", slug: "mushroom-pizza", name: '8" Mushroom Pizza', type: "snack", category: "pizza", description: "Fresh mushrooms over a cheesy tomato base.", images: [], price: 130 },
  { id: "pizza-large", slug: "large-pizza", name: '12" Large Pizza', type: "snack", category: "pizza", description: "Our large 12-inch pizza — great for sharing.", images: [], price: 250 },
  { id: "samosa", slug: "samosa", name: "Samosa", type: "snack", category: "snacks", description: "Crispy, golden and spiced — a teatime favourite.", images: [], price: 7 },
  { id: "veg-patties", slug: "veg-patties", name: "Veg Patties", type: "snack", category: "snacks", description: "Flaky pastry filled with a spiced mixed-vegetable stuffing.", images: [], price: 20, tags: ["veg-patties"] },
  { id: "patties-paneer", slug: "paneer-patties", name: "Paneer Patties", type: "snack", category: "snacks", description: "Flaky pastry filled with a spiced paneer stuffing.", images: [], price: 25, tags: ["veg-patties", "paneer-patties"] },
  { id: "patties-mushroom", slug: "mushroom-patties", name: "Mushroom Patties", type: "snack", category: "snacks", description: "Flaky pastry filled with a savoury mushroom stuffing.", images: [], price: 25, tags: ["veg-patties", "mushroom-patties"] },
  { id: "patties-aloo", slug: "aloo-patties", name: "Aloo Patties", type: "snack", category: "snacks", description: "Flaky pastry filled with spiced mashed potato.", images: [], price: 20, tags: ["veg-patties", "aloo-patties"] },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getSimilarProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

// Only tags that actually match ≥1 product currently in the catalog —
// keeps the browse-by-type filter honest instead of listing dozens of
// categories that lead to "no products found."
export function getActiveBrowseTags(items: Product[]): { id: string; label: string }[] {
  const seen = new Set<string>();
  for (const p of items) {
    for (const t of p.tags ?? []) seen.add(t);
  }
  return Object.entries(BROWSE_TAGS)
    .filter(([id]) => seen.has(id))
    .map(([id, label]) => ({ id, label }));
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Matches on name, category label, flavours, description, and tags. Also
// checks a punctuation/space-stripped form of both query and haystack so
// "kitkat" finds "Kit Kat Cake" and "8 onion pizza" finds '8" Onion Pizza'.
export function searchProducts(items: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const qCompact = normalize(query);

  return items.filter((p) => {
    const categoryLabel = menuCategories.find((c) => c.id === p.category)?.label ?? "";
    const tagLabels = (p.tags ?? []).map((t) => BROWSE_TAGS[t] ?? t);
    const haystack = [p.name, categoryLabel, p.description, ...(p.flavours ?? []), ...tagLabels]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(q)) return true;
    return normalize(haystack).includes(qCompact);
  });
}

// Shows a single starting price (e.g. "From ₹290") rather than a
// "₹290 / ₹590" pair — that pair was two different weights (0.5kg vs 1kg),
// not a before/after price, and read too easily as a fake discount.
export function displayProductPrice(product: Product): string {
  if (product.weightOptions && product.weightOptions.length > 0) {
    const priced = product.weightOptions.filter((w) => w.price != null);
    if (priced.length >= 2) return `From ₹${priced[0].price}`;
    if (priced.length === 1) return `₹${priced[0].price}`;
  }
  return `₹${product.price}`;
}

export type PriceDisplay =
  | { kind: "range"; text: string }
  | { kind: "discount"; price: number; compareAtPrice: number };

// Cards show a "sale" style price (current price + struck-through original)
// only when the first priced weight option actually has a compareAtPrice
// set — otherwise falls back to the normal weight-tier price display.
export function getPriceDisplay(product: Product): PriceDisplay {
  const priced = product.weightOptions?.filter((w) => w.price != null) ?? [];
  const first = priced[0];
  if (first?.price != null && first.compareAtPrice && first.compareAtPrice > first.price) {
    return { kind: "discount", price: first.price, compareAtPrice: first.compareAtPrice };
  }
  return { kind: "range", text: displayProductPrice(product) };
}
