/**
 * Water Shell — 5 Product Categories Verification Suite
 * Native Node.js test runner verifying category structure, products, filters,
 * dealer wholesale pricing, and admin management constraints across the platform.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  SEED_PRODUCTS,
  CATEGORIES,
  CATEGORY_DEFINITIONS,
  generateCategories,
} from '../mobile/src/data/seedProducts.ts';
import { PricingService } from '../mobile/src/services/pricingService.ts';

const EXPECTED_CATEGORIES = [
  { id: 'ro-water-purifiers', name: 'RO Water Purifiers' },
  { id: 'water-dispensers', name: 'Water Dispensers' },
  { id: 'booster-pumps', name: 'Booster Pumps' },
  { id: 'smps-power-units', name: 'SMPS Power Units' },
  { id: 'water-treatment-accessories-filters', name: 'Water Treatment Accessories & Filters' },
];

describe('1. Authoritative 5-Category Structure Enforcement', () => {
  test('CATEGORIES array contains exactly 5 categories', () => {
    assert.equal(
      CATEGORIES.length,
      5,
      `Expected exactly 5 categories, but found ${CATEGORIES.length}`
    );
  });

  test('CATEGORY_DEFINITIONS contains exactly the 5 specified keys', () => {
    const keys = Object.keys(CATEGORY_DEFINITIONS);
    assert.equal(
      keys.length,
      5,
      `Expected exactly 5 category definitions, but found ${keys.length}`
    );

    const expectedIds = EXPECTED_CATEGORIES.map((c) => c.id);
    for (const id of expectedIds) {
      assert.ok(
        CATEGORY_DEFINITIONS[id],
        `Expected category definition for '${id}' was not found`
      );
    }
  });

  test('Category names match exact user requirements', () => {
    for (const exp of EXPECTED_CATEGORIES) {
      const foundInList = CATEGORIES.find((c) => c.id === exp.id);
      assert.ok(foundInList, `Category ${exp.id} missing in CATEGORIES list`);
      assert.equal(
        foundInList.name,
        exp.name,
        `Category name mismatch for ${exp.id}: expected '${exp.name}', got '${foundInList.name}'`
      );

      const foundInDef = CATEGORY_DEFINITIONS[exp.id];
      assert.ok(foundInDef, `Category ${exp.id} missing in CATEGORY_DEFINITIONS`);
      assert.equal(
        foundInDef.name,
        exp.name,
        `Definition name mismatch for ${exp.id}: expected '${exp.name}', got '${foundInDef.name}'`
      );
    }
  });

  test('Outdated, duplicate, or unwanted categories are completely removed from definitions', () => {
    const obsoleteIds = [
      'water-purifiers',
      'water-pumps',
      'filters-cartridges',
      'spare-parts-accessories',
      'bottles-storage',
      'purifiers',
      'dispensers',
      'pumps',
      'filters',
      'membranes',
      'spare-parts',
    ];

    const definedIds = new Set(Object.keys(CATEGORY_DEFINITIONS));
    for (const obsolete of obsoleteIds) {
      assert.equal(
        definedIds.has(obsolete),
        false,
        `Obsolete category '${obsolete}' should NOT exist in active CATEGORY_DEFINITIONS`
      );
    }

    const categoryListIds = CATEGORIES.map((c) => c.id);
    const uniqueIds = new Set(categoryListIds);
    assert.equal(
      uniqueIds.size,
      categoryListIds.length,
      'Duplicate category IDs found in CATEGORIES list'
    );
  });
});

describe('2. Catalog Product Reassignment & Data Integrity', () => {
  test('All catalog products are preserved without loss including new Aqua Touch addition', () => {
    assert.equal(
      SEED_PRODUCTS.length,
      61,
      `Expected all 61 products to be preserved, found ${SEED_PRODUCTS.length}`
    );

    const catalogPath = path.join(__dirname, '..', 'functions', 'catalogData.json');
    const catalogJson = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    assert.equal(catalogJson.length, 61, `catalogData.json must have 61 items, found ${catalogJson.length}`);
  });

  test('Every single product is reassigned to one of the 5 valid categories', () => {
    const validCategoryIds = new Set(EXPECTED_CATEGORIES.map((c) => c.id));
    const validCategoryNames = new Set(EXPECTED_CATEGORIES.map((c) => c.name));

    for (const prod of SEED_PRODUCTS) {
      assert.ok(
        validCategoryIds.has(prod.categoryId),
        `Product ${prod.id} (${prod.name}) has invalid categoryId: '${prod.categoryId}'`
      );
      assert.ok(
        validCategoryNames.has(prod.category),
        `Product ${prod.id} (${prod.name}) has invalid category name: '${prod.category}'`
      );
    }
  });

  test('All 5 categories have at least 1 active product', () => {
    for (const exp of EXPECTED_CATEGORIES) {
      const items = SEED_PRODUCTS.filter((p) => p.categoryId === exp.id);
      assert.ok(
        items.length > 0,
        `Category '${exp.name}' (${exp.id}) has zero products`
      );
    }
  });

  test('All products preserve images, specs, customer pricing, and dealer pricing', () => {
    for (const prod of SEED_PRODUCTS) {
      assert.ok(prod.id, 'Product must have id');
      assert.ok(prod.name, 'Product must have name');
      assert.ok(prod.imageUrl.startsWith('http'), `Product ${prod.id} must have valid image URL`);
      assert.ok(prod.customerPrice > 0, `Product ${prod.id} customerPrice must be > 0`);
      assert.ok(prod.dealerPrice && prod.dealerPrice > 0, `Product ${prod.id} dealerPrice must be > 0`);
      assert.ok(
        prod.dealerPrice < prod.customerPrice,
        `Product ${prod.id} dealerPrice (${prod.dealerPrice}) must be < customerPrice (${prod.customerPrice})`
      );
      assert.ok(prod.specifications.length > 0, `Product ${prod.id} specifications must not be empty`);
    }
  });
});

describe('3. Category Filtering & Search Queries', () => {
  // Category filter simulation matching ProductsService logic
  const filterByCategory = (products, categoryId) => {
    if (!categoryId || categoryId === 'all') return products;
    const catTarget = categoryId.toLowerCase();
    return products.filter((p) => {
      const pCatId = (p.categoryId || '').toLowerCase();
      const pCatName = (p.category || '').toLowerCase();
      return (
        pCatId === catTarget ||
        pCatName === catTarget ||
        ((catTarget === 'ro-water-purifiers' || catTarget === 'water-purifiers' || catTarget === 'purifiers') &&
          (pCatId.includes('purifier') || pCatName.includes('purifier'))) ||
        ((catTarget === 'water-dispensers' || catTarget === 'dispensers') &&
          (pCatId.includes('dispenser') || pCatName.includes('dispenser'))) ||
        ((catTarget === 'booster-pumps' || catTarget === 'water-pumps' || catTarget === 'pumps') &&
          (pCatId.includes('pump') || pCatName.includes('pump'))) ||
        ((catTarget === 'smps-power-units' || catTarget === 'smps' || catTarget === 'power') &&
          (pCatId.includes('smps') || pCatName.includes('smps') || p.name.includes('SMPS'))) ||
        ((catTarget === 'water-treatment-accessories-filters' || catTarget === 'filters' || catTarget === 'filters-cartridges' || catTarget === 'spare-parts' || catTarget === 'spare-parts-accessories' || catTarget === 'bottles' || catTarget === 'bottles-storage') &&
          (pCatId.includes('filter') || pCatName.includes('filter') ||
           pCatId.includes('accessor') || pCatName.includes('accessor') ||
           pCatId.includes('spare') || pCatName.includes('spare') ||
           pCatId.includes('bottle') || pCatName.includes('bottle') ||
           pCatId.includes('cartridge') || p.name.includes('Membrane')))
      );
    });
  };

  test('Category filter returns exact products for each of the 5 categories', () => {
    for (const exp of EXPECTED_CATEGORIES) {
      const filtered = filterByCategory(SEED_PRODUCTS, exp.id);
      assert.ok(filtered.length > 0, `Filtered results for ${exp.id} should not be empty`);
      for (const p of filtered) {
        assert.equal(
          p.categoryId,
          exp.id,
          `Filtered product ${p.id} has wrong categoryId: ${p.categoryId}, expected ${exp.id}`
        );
      }
    }
  });

  test('Smoothly resolves legacy aliases to the correct new categories', () => {
    const purifiers = filterByCategory(SEED_PRODUCTS, 'water-purifiers');
    assert.equal(purifiers.length, 13);
    for (const p of purifiers) {
      assert.equal(p.categoryId, 'ro-water-purifiers');
    }

    const pumps = filterByCategory(SEED_PRODUCTS, 'water-pumps');
    assert.equal(pumps.length, 8);
    for (const p of pumps) {
      assert.equal(p.categoryId, 'booster-pumps');
    }

    const filters = filterByCategory(SEED_PRODUCTS, 'filters-cartridges');
    assert.ok(filters.length >= 12);
    for (const p of filters) {
      assert.equal(p.categoryId, 'water-treatment-accessories-filters');
    }
  });

  test('generateCategories generates exactly 5 categories with correct item counts', () => {
    const generated = generateCategories(SEED_PRODUCTS);
    assert.equal(generated.length, 5);

    const roPurifiers = generated.find((c) => c.id === 'ro-water-purifiers');
    const dispensers = generated.find((c) => c.id === 'water-dispensers');
    const pumps = generated.find((c) => c.id === 'booster-pumps');
    const smps = generated.find((c) => c.id === 'smps-power-units');
    const accessories = generated.find((c) => c.id === 'water-treatment-accessories-filters');

    assert.equal(roPurifiers?.itemCount, 13);
    assert.equal(dispensers?.itemCount, 10);
    assert.equal(pumps?.itemCount, 8);
    assert.equal(smps?.itemCount, 1);
    assert.equal(accessories?.itemCount, 29);
  });
});

describe('4. Dealer Experience & Wholesale Pricing Across All 5 Categories', () => {
  test('Dealers can browse products from all five categories with approved wholesale pricing', () => {
    for (const exp of EXPECTED_CATEGORIES) {
      const items = SEED_PRODUCTS.filter((p) => p.categoryId === exp.id);
      assert.ok(items.length > 0, `No items in category ${exp.name}`);

      for (const prod of items) {
        const pricing = PricingService.getProductPricing(prod, true);
        assert.equal(pricing.isDealerActive, true, `Product ${prod.id} should have dealer pricing active`);
        assert.equal(pricing.effectivePrice, prod.dealerPrice);
        assert.ok(
          pricing.savingsAmount && pricing.savingsAmount > 0,
          `Dealer should receive savings on ${prod.id}`
        );
      }
    }
  });

  test('Regular customers see customer retail price across all five categories', () => {
    for (const exp of EXPECTED_CATEGORIES) {
      const items = SEED_PRODUCTS.filter((p) => p.categoryId === exp.id);
      for (const prod of items) {
        const pricing = PricingService.getProductPricing(prod, false);
        assert.equal(pricing.isDealerActive, false);
        assert.equal(pricing.effectivePrice, prod.customerPrice);
      }
    }
  });
});

describe('5. Delivery Service Machine vs Accessory Categorization', () => {
  const isMachineProduct = (product) => {
    const catId = (product.categoryId || '').toLowerCase().trim();
    const catName = (product.category || '').toLowerCase().trim();
    const name = (product.name || '').toLowerCase().trim();

    if (
      catId === 'ro-water-purifiers' ||
      catId === 'water-purifiers' ||
      catId === 'purifiers' ||
      catId === 'water-dispensers' ||
      catId === 'dispensers'
    ) {
      return true;
    }

    if (
      catName.includes('purifier') ||
      catName.includes('dispenser') ||
      catId.includes('purifier') ||
      catId.includes('dispenser')
    ) {
      return true;
    }

    if (
      catId.includes('pump') ||
      catId.includes('filter') ||
      catId.includes('part') ||
      catId.includes('accessory') ||
      catId.includes('cartridge') ||
      catId.includes('bottle') ||
      catId.includes('membrane') ||
      catId.includes('smps') ||
      catId.includes('power')
    ) {
      return false;
    }

    return false;
  };

  test('RO Water Purifiers and Water Dispensers are classified as Machines (direct delivery)', () => {
    const purifier = SEED_PRODUCTS.find((p) => p.categoryId === 'ro-water-purifiers');
    const dispenser = SEED_PRODUCTS.find((p) => p.categoryId === 'water-dispensers');

    assert.ok(purifier);
    assert.ok(dispenser);

    assert.equal(isMachineProduct(purifier), true);
    assert.equal(isMachineProduct(dispenser), true);
  });

  test('Booster Pumps, SMPS Power Units, and Accessories are classified as Dealer-Serviced', () => {
    const pump = SEED_PRODUCTS.find((p) => p.categoryId === 'booster-pumps');
    const smps = SEED_PRODUCTS.find((p) => p.categoryId === 'smps-power-units');
    const accessory = SEED_PRODUCTS.find((p) => p.categoryId === 'water-treatment-accessories-filters');

    assert.ok(pump);
    assert.ok(smps);
    assert.ok(accessory);

    assert.equal(isMachineProduct(pump), false);
    assert.equal(isMachineProduct(smps), false);
    assert.equal(isMachineProduct(accessory), false);
  });
});

describe('6. Admin Panel Seed Products Sync & Form Options', () => {
  test('Admin seedProducts.ts exactly mirrors mobile seed dataset and definitions', () => {
    const adminSeedPath = path.join(__dirname, '..', 'admin', 'src', 'data', 'seedProducts.ts');
    const adminContent = fs.readFileSync(adminSeedPath, 'utf8');

    for (const exp of EXPECTED_CATEGORIES) {
      assert.ok(
        adminContent.includes(exp.id),
        `Admin seedProducts missing category id ${exp.id}`
      );
      assert.ok(
        adminContent.includes(exp.name),
        `Admin seedProducts missing category name ${exp.name}`
      );
    }

    assert.ok(
      !adminContent.includes("'bottles-storage':"),
      "Admin seedProducts should not contain 'bottles-storage' in CATEGORY_DEFINITIONS"
    );
  });

  test('Admin ProductsPage ProductFormModal enforces the 5 categories on creation and edit', () => {
    const pagePath = path.join(__dirname, '..', 'admin', 'src', 'features', 'products', 'ProductsPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf8');

    // Default categoryId must be ro-water-purifiers
    assert.ok(content.includes("'ro-water-purifiers'"), 'ProductsPage should default to ro-water-purifiers');
    // Dropdown iterates over CATEGORY_LIST derived from CATEGORY_DEFINITIONS
    assert.ok(content.includes('CATEGORY_LIST.map'), 'ProductsPage must map only CATEGORY_LIST in dropdown');
  });
});

describe('7. Official Aqua Touch Product Catalogue Addition & Role Experience', () => {
  const aquaTouch = SEED_PRODUCTS.find((p) => p.name === 'Aqua Touch' || p.id === 'AP-WP-061');

  test('Aqua Touch exists in catalog with correct ID, name, slug, and category', () => {
    assert.ok(aquaTouch, 'Aqua Touch must exist in SEED_PRODUCTS');
    assert.equal(aquaTouch.id, 'AP-WP-061');
    assert.equal(aquaTouch.name, 'Aqua Touch');
    assert.equal(aquaTouch.slug, 'aqua-touch');
    assert.equal(aquaTouch.category, 'RO Water Purifiers');
    assert.equal(aquaTouch.categoryId, 'ro-water-purifiers');
  });

  test('Aqua Touch matches required specifications and features', () => {
    assert.ok(aquaTouch.description.includes('Pure & Safe Water with Smart Touch Controls'));
    assert.equal(aquaTouch.stockStatus, 'in_stock');
    assert.equal(aquaTouch.active, true);

    const specMap = new Map(aquaTouch.specifications.map((s) => [s.label, s.value]));
    assert.ok(specMap.has('Purification Technology'), 'Must include Purification Technology');
    assert.equal(specMap.get('Purification Technology'), 'RO + UV + UF + TDS Control');
    assert.equal(specMap.get('Controls'), 'Smart Touch Controls');
    assert.equal(specMap.get('Water Quality'), 'Crystal Clear Water');
    assert.equal(specMap.get('Warranty'), '1 Year Service Warranty');
  });

  test('Aqua Touch adheres to Firebase Storage configuration URL format', () => {
    assert.ok(
      aquaTouch.imageUrl.includes('water-shell.firebasestorage.app'),
      'Image URL should follow water-shell.firebasestorage.app configuration'
    );
    assert.ok(aquaTouch.imageUrl.includes('aqua-touch.jpg'));
  });

  test('Aqua Touch in Customer View: Displays Retail MRP ₹15,999', () => {
    const customerPricing = PricingService.getProductPricing(aquaTouch, false);
    assert.equal(customerPricing.effectivePrice, 15999);
    assert.equal(customerPricing.isDealerActive, false);
    assert.equal(customerPricing.savingsAmount, 0);
    assert.equal(customerPricing.formattedPrice, '₹15,999');
  });

  test('Aqua Touch in Dealer View: Displays Wholesale Dealer Price ₹9,500 with ₹6,499 Savings', () => {
    const dealerPricing = PricingService.getProductPricing(aquaTouch, true);
    assert.equal(dealerPricing.effectivePrice, 9500);
    assert.equal(dealerPricing.isDealerActive, true);
    assert.equal(dealerPricing.savingsAmount, 15999 - 9500);
    assert.equal(dealerPricing.savingsAmount, 6499);
    assert.equal(dealerPricing.formattedPrice, '₹9,500');
  });

  test('No duplicate records exist for Aqua Touch in catalog', () => {
    const duplicates = SEED_PRODUCTS.filter(
      (p) => p.id === 'AP-WP-061' || p.name.toLowerCase() === 'aqua touch'
    );
    assert.equal(duplicates.length, 1, 'There must be exactly one Aqua Touch record, no duplicates');
  });
});

