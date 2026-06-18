import { getCollection } from 'astro:content';
import { productHref, type CategoryCard } from './catalog';

// Order categories sensibly (weighbridges first), then by title, so the grids
// and menu read well regardless of how many products exist.
const CATEGORY_ORDER: Record<string, number> = { weighbridge: 0, system: 1, scale: 2 };

function toCard(p: { id: string; data: any }): CategoryCard {
  return {
    title: p.data.title,
    href: productHref(p.data.category, p.id),
    blurb: p.data.shortDescription,
    image: p.data.heroImage,
    imageAlt: p.data.title,
  };
}

function order(a: { data: any }, b: { data: any }): number {
  const ca = CATEGORY_ORDER[a.data.category] ?? 9;
  const cb = CATEGORY_ORDER[b.data.category] ?? 9;
  return ca - cb || String(a.data.title).localeCompare(String(b.data.title));
}

/**
 * Every published (non-draft) product as a card — used to drive the homepage
 * grid, the /products/ page, and the Products menu so new products added in the
 * CMS appear automatically.
 */
export async function getProductCards(): Promise<CategoryCard[]> {
  const products = await getCollection('products', ({ data }) => !data.draft);
  return products.sort(order).map(toCard);
}

/** Published weighbridge products only — for the /weighbridges/ hub. */
export async function getWeighbridgeCards(): Promise<CategoryCard[]> {
  const products = await getCollection(
    'products',
    ({ data }) => !data.draft && data.category === 'weighbridge'
  );
  return products.sort(order).map(toCard);
}
