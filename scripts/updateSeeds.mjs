import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, '..', 'functions', 'catalogData.json');
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const categoryCounts = {};
for (const p of products) {
  if (p.active !== false) {
    categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
  }
}

function makeFileContent(importType) {
  return `/**
 * AquaPure — Authoritative Synchronized Catalog Products Dataset
 * Covers all 5 categories with authentic water purification specifications and dual customer/dealer pricing (INR).
 */

${importType}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
}

export const CATEGORY_DEFINITIONS: Record<string, { name: string; icon: string; description: string }> = {
  'ro-water-purifiers': {
    name: 'RO Water Purifiers',
    icon: '💧',
    description: 'Advanced domestic & commercial reverse osmosis systems',
  },
  'water-dispensers': {
    name: 'Water Dispensers',
    icon: '🚰',
    description: 'Hot, cold & ambient floor-standing and tabletop dispensers',
  },
  'booster-pumps': {
    name: 'Booster Pumps',
    icon: '⚙️',
    description: 'High-performance RO booster pumps, feed pumps & controllers',
  },
  'smps-power-units': {
    name: 'SMPS Power Units',
    icon: '⚡',
    description: 'Switch-mode power supplies, adapters & surge protection units',
  },
  'water-treatment-accessories-filters': {
    name: 'Water Treatment Accessories & Filters',
    icon: '🔬',
    description: 'Sediment, carbon filters, RO membranes, housings & fittings',
  },
};

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'ro-water-purifiers',
    name: 'RO Water Purifiers',
    description: 'Advanced domestic & commercial reverse osmosis systems',
    icon: '💧',
    itemCount: ${categoryCounts['ro-water-purifiers'] || 0},
  },
  {
    id: 'water-dispensers',
    name: 'Water Dispensers',
    description: 'Hot, cold & ambient floor-standing and tabletop dispensers',
    icon: '🚰',
    itemCount: ${categoryCounts['water-dispensers'] || 0},
  },
  {
    id: 'booster-pumps',
    name: 'Booster Pumps',
    description: 'High-performance RO booster pumps, feed pumps & controllers',
    icon: '⚙️',
    itemCount: ${categoryCounts['booster-pumps'] || 0},
  },
  {
    id: 'smps-power-units',
    name: 'SMPS Power Units',
    description: 'Switch-mode power supplies, adapters & surge protection units',
    icon: '⚡',
    itemCount: ${categoryCounts['smps-power-units'] || 0},
  },
  {
    id: 'water-treatment-accessories-filters',
    name: 'Water Treatment Accessories & Filters',
    description: 'Sediment, carbon filters, RO membranes, housings & fittings',
    icon: '🔬',
    itemCount: ${categoryCounts['water-treatment-accessories-filters'] || 0},
  },
];

/**
 * Dynamically generate category summary with exact active counts from any product array
 */
export function generateCategories(products: Product[]): CategoryInfo[] {
  const categoryMap = new Map<string, CategoryInfo>();

  for (const [id, def] of Object.entries(CATEGORY_DEFINITIONS)) {
    categoryMap.set(id, {
      id: id as ProductCategory,
      name: def.name,
      description: def.description,
      icon: def.icon,
      itemCount: 0,
    });
  }

  for (const prod of products) {
    if (!prod.active) continue;
    let catId = prod.categoryId;
    if (catId === 'water-purifiers' || catId === 'purifiers') catId = 'ro-water-purifiers';
    else if (catId === 'water-pumps' || catId === 'pumps') catId = 'booster-pumps';
    else if (catId === 'dispensers') catId = 'water-dispensers';
    else if (
      catId === 'filters-cartridges' ||
      catId === 'spare-parts-accessories' ||
      catId === 'bottles-storage' ||
      catId === 'filters' ||
      catId === 'spare-parts' ||
      catId === 'membranes'
    ) {
      catId = (prod.name.includes('SMPS') || (prod.category && prod.category.includes('SMPS')))
        ? 'smps-power-units'
        : 'water-treatment-accessories-filters';
    }

    if (categoryMap.has(catId)) {
      categoryMap.get(catId)!.itemCount += 1;
    }
  }

  return Array.from(categoryMap.values()).filter((c) => c.itemCount > 0);
}

export const SEED_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;
}

const mobileSeed = path.join(__dirname, '..', 'mobile', 'src', 'data', 'seedProducts.ts');
const adminSeed = path.join(__dirname, '..', 'admin', 'src', 'data', 'seedProducts.ts');

fs.writeFileSync(mobileSeed, makeFileContent("import { Product, ProductCategory } from '@/types';"), 'utf8');
fs.writeFileSync(adminSeed, makeFileContent("import type { Product, ProductCategory } from '../types';"), 'utf8');
console.log('Successfully wrote mobile & admin seedProducts.ts');
