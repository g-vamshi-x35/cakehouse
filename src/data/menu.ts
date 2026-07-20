export type CakeItem = {
  id: string;
  name: string;
  category: "regular-cakes" | "customized-cakes";
  price500?: number;
  price1000?: number;
  note?: string;
  image?: string;
  featured?: boolean;
};

export type SnackItem = {
  id: string;
  name: string;
  category: "pizza" | "snacks";
  price: number;
  unit?: string;
  image?: string;
};

export const cakeMenu: CakeItem[] = [
  { id: "vanilla", name: "Vanilla Cake", category: "regular-cakes", price500: 290, price1000: 550 },
  { id: "pineapple", name: "Pineapple Cake", category: "regular-cakes", price500: 290, price1000: 590 },
  { id: "butterscotch", name: "Butterscotch Cake", category: "regular-cakes", price500: 290, price1000: 590 },
  { id: "black-forest", name: "Black Forest Cake", category: "regular-cakes", price500: 290, price1000: 590, featured: true },
  { id: "chocolate", name: "Chocolate Cake", category: "regular-cakes", price500: 290, price1000: 590, featured: true },
  { id: "dark-truffle", name: "Dark Truffle Cake", category: "regular-cakes", price500: 450, price1000: 900, featured: true },
  { id: "tutti-frutti", name: "Tutti Frutti Cake", category: "regular-cakes", price500: 290, price1000: 590 },
  { id: "red-velvet", name: "Red Velvet Cake", category: "regular-cakes", price500: 350, price1000: 700, featured: true },
  { id: "kit-kat", name: "Kit Kat Cake", category: "regular-cakes", price500: 550, price1000: 1000 },
  { id: "rasmalai", name: "Rasmalai Cake", category: "regular-cakes", price500: 290, price1000: 590 },
  {
    id: "doll",
    name: "Doll Cake",
    category: "customized-cakes",
    price500: 350,
    price1000: 650,
    note: "Final price depends on design",
    image: "/images/menu/menu-doll-barbie-cake.jpg",
    featured: true,
  },
  {
    id: "car",
    name: "Car Cake",
    category: "customized-cakes",
    price500: 350,
    price1000: 650,
    note: "Final price depends on design",
    image: "/images/menu/menu-car-cake.jpg",
    featured: true,
  },
  {
    id: "doraemon",
    name: "Doraemon Cake",
    category: "customized-cakes",
    price500: 350,
    price1000: 650,
    note: "Final price depends on design",
    image: "/images/menu/menu-doraemon-cake.jpg",
  },
  {
    id: "bento",
    name: "Bento Cake",
    category: "customized-cakes",
    price500: 150,
    note: "Final price depends on design",
    image: "/images/menu/menu-bento-cake.jpg",
  },
];

export const snackMenu: SnackItem[] = [
  { id: "pizza-onion", name: '8" Onion Pizza', category: "pizza", price: 100 },
  { id: "pizza-sweetcorn", name: '8" Sweetcorn Pizza', category: "pizza", price: 120 },
  { id: "pizza-paneer", name: '8" Paneer Pizza', category: "pizza", price: 130 },
  { id: "pizza-mushroom", name: '8" Mushroom Pizza', category: "pizza", price: 130 },
  { id: "pizza-large", name: '12" Large Pizza', category: "pizza", price: 250 },
  { id: "samosa", name: "Samosa", category: "snacks", price: 7 },
  { id: "patties-paneer", name: "Paneer Patties", category: "snacks", price: 25 },
  { id: "patties-mushroom", name: "Mushroom Patties", category: "snacks", price: 25 },
  { id: "patties-aloo", name: "Aloo Patties", category: "snacks", price: 20 },
];

export const menuCategories = [
  { id: "all", label: "All" },
  { id: "regular-cakes", label: "Regular Cakes" },
  { id: "customized-cakes", label: "Customized Cakes" },
  { id: "pizza", label: "Pizza" },
  { id: "snacks", label: "Samosa & Patties" },
] as const;

export type MenuCategoryId = (typeof menuCategories)[number]["id"];

export type AnyMenuItem =
  | (CakeItem & { kind: "cake" })
  | (SnackItem & { kind: "snack" });

export const allMenuItems: AnyMenuItem[] = [
  ...cakeMenu.map((item) => ({ ...item, kind: "cake" as const })),
  ...snackMenu.map((item) => ({ ...item, kind: "snack" as const })),
];

export function getItemsByCategory(category: MenuCategoryId): AnyMenuItem[] {
  if (category === "all") return allMenuItems;
  return allMenuItems.filter((item) => item.category === category);
}

export function getFeaturedItems(): AnyMenuItem[] {
  return allMenuItems.filter((item) => item.kind === "cake" && item.featured);
}

export function displayPrice(item: AnyMenuItem): string {
  if (item.kind === "snack") return `₹${item.price}`;
  if (item.price500 && item.price1000) return `₹${item.price500} / ₹${item.price1000}`;
  if (item.price500) return `₹${item.price500}`;
  return "Ask for price";
}
