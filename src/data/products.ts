// Rich product catalog used as the seed source for Supabase (scripts/seed-products.ts)
// and as an offline fallback so the site keeps working before/without a DB connection.
// See src/lib/data/products.ts for the data-access layer that picks between the two.

export type WeightOption = {
  label: string;
  price: number | null; // null => "Custom", ask for a quote
};

export const menuCategories = [
  { id: "all", label: "All" },
  { id: "regular-cakes", label: "Regular Cakes" },
  { id: "customized-cakes", label: "Customized Cakes" },
  { id: "pizza", label: "Pizza" },
  { id: "snacks", label: "Samosa & Patties" },
] as const;

export type MenuCategoryId = (typeof menuCategories)[number]["id"];

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
};

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
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 550),
    flavours: ["Vanilla"],
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
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Pineapple"],
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
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Butterscotch"],
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
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Black Forest"],
    featured: true,
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
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Chocolate"],
    featured: true,
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
    images: [],
    price: 450,
    weightOptions: weightOptionsFrom(450, 900),
    flavours: ["Dark Chocolate"],
    featured: true,
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
    images: [],
    price: 350,
    weightOptions: weightOptionsFrom(350, 700),
    flavours: ["Red Velvet"],
    featured: true,
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
    images: [],
    price: 290,
    weightOptions: weightOptionsFrom(290, 590),
    flavours: ["Rasmalai"],
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
    images: [],
    price: 150,
    flavours: CAKE_FLAVOURS,
    note: "Final price depends on design",
  },
  { id: "pizza-onion", slug: "onion-pizza", name: '8" Onion Pizza', type: "snack", category: "pizza", description: "Classic thin-crust pizza loaded with onions and mozzarella.", images: [], price: 100 },
  { id: "pizza-sweetcorn", slug: "sweetcorn-pizza", name: '8" Sweetcorn Pizza', type: "snack", category: "pizza", description: "Cheesy pizza topped with sweet corn kernels.", images: [], price: 120 },
  { id: "pizza-paneer", slug: "paneer-pizza", name: '8" Paneer Pizza', type: "snack", category: "pizza", description: "Loaded with soft paneer cubes and mozzarella.", images: [], price: 130 },
  { id: "pizza-mushroom", slug: "mushroom-pizza", name: '8" Mushroom Pizza', type: "snack", category: "pizza", description: "Fresh mushrooms over a cheesy tomato base.", images: [], price: 130 },
  { id: "pizza-large", slug: "large-pizza", name: '12" Large Pizza', type: "snack", category: "pizza", description: "Our large 12-inch pizza — great for sharing.", images: [], price: 250 },
  { id: "samosa", slug: "samosa", name: "Samosa", type: "snack", category: "snacks", description: "Crispy, golden and spiced — a teatime favourite.", images: [], price: 7 },
  { id: "patties-paneer", slug: "paneer-patties", name: "Paneer Patties", type: "snack", category: "snacks", description: "Flaky pastry filled with a spiced paneer stuffing.", images: [], price: 25 },
  { id: "patties-mushroom", slug: "mushroom-patties", name: "Mushroom Patties", type: "snack", category: "snacks", description: "Flaky pastry filled with a savoury mushroom stuffing.", images: [], price: 25 },
  { id: "patties-aloo", slug: "aloo-patties", name: "Aloo Patties", type: "snack", category: "snacks", description: "Flaky pastry filled with spiced mashed potato.", images: [], price: 20 },
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

export function displayProductPrice(product: Product): string {
  if (product.weightOptions && product.weightOptions.length > 0) {
    const priced = product.weightOptions.filter((w) => w.price != null);
    if (priced.length >= 2) return `₹${priced[0].price} / ₹${priced[1].price}`;
    if (priced.length === 1) return `₹${priced[0].price}`;
  }
  return `₹${product.price}`;
}
