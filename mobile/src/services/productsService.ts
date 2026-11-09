/**
 * AquaPure — Products Service
 *
 * Implements offline-first data access:
 * Returns products from local SEED_PRODUCTS if Firestore is unconfigured/empty,
 * and fetches from Firestore 'products' collection when available.
 */

import { collection, getDocs, doc, getDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Product, ProductCategory } from '@/types';
import { SEED_PRODUCTS, CATEGORIES, CategoryInfo, generateCategories } from '@/data/seedProducts';
import { PricingService } from './pricingService';

export class ProductsService {
  /**
   * Fetch all active categories with exact dynamic product counts
   */
  static async getCategories(): Promise<CategoryInfo[]> {
    try {
      const products = await this.getProducts();
      return generateCategories(products);
    } catch {
      return CATEGORIES;
    }
  }

  /**
   * Fetch products with optional filtering by category, search term, and sorting
   */
  static async getProducts(options?: {
    categoryId?: ProductCategory | 'all';
    search?: string;
    sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'name';
    isDealer?: boolean;
  }): Promise<Product[]> {
    let products: Product[] = [];

    try {
      // Attempt to load from Firestore if network and credentials are active
      if (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
        const productsCol = collection(db, 'products');
        const q = query(productsCol, where('active', '==', true));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          products = snapshot.docs
            .map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Product, 'id'>),
            }))
            .filter((p) => p.id !== 'system_delivery_policy' && !p.id.startsWith('system_'));
        }
      }
    } catch {
      // Graceful fallback to offline seed dataset
      products = [];
    }

    // Fall back to seed dataset if Firestore didn't return any items
    if (products.length === 0) {
      products = [...SEED_PRODUCTS];
    }

    // Apply category filtering
    if (options?.categoryId && options.categoryId !== 'all') {
      const catTarget = options.categoryId.toLowerCase();
      products = products.filter((p) => {
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
    }

    // Apply search query filter if present (name, description, specs, product code/id)
    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.specifications.some(
            (s) =>
              s.label.toLowerCase().includes(q) ||
              s.value.toLowerCase().includes(q)
          )
      );
    }

    // Apply sorting
    if (options?.sortBy) {
      const isDealer = Boolean(options?.isDealer);
      switch (options.sortBy) {
        case 'price_asc':
          products.sort(
            (a, b) =>
              PricingService.getEffectiveUnitPrice(a, isDealer) -
              PricingService.getEffectiveUnitPrice(b, isDealer)
          );
          break;
        case 'price_desc':
          products.sort(
            (a, b) =>
              PricingService.getEffectiveUnitPrice(b, isDealer) -
              PricingService.getEffectiveUnitPrice(a, isDealer)
          );
          break;
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'popular':
        default:
          break;
      }
    }

    return products;
  }

  /**
   * Find product by ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      if (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) };
        }
      }
    } catch {
      // Fallback
    }

    const localMatch = SEED_PRODUCTS.find((p) => p.id === id);
    return localMatch ?? null;
  }

  /**
   * Find product by slug
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    const localMatch = SEED_PRODUCTS.find((p) => p.slug === slug);
    return localMatch ?? null;
  }

  /**
   * Seed all 50+ products into Firestore in batches of 500
   */
  static async seedFirestore(): Promise<{ count: number; success: boolean }> {
    try {
      const batch = writeBatch(db);
      for (const prod of SEED_PRODUCTS) {
        const docRef = doc(db, 'products', prod.id);
        batch.set(docRef, prod);
      }
      await batch.commit();
      return { count: SEED_PRODUCTS.length, success: true };
    } catch (err) {
      console.error('Firestore seeding failed:', err);
      return { count: 0, success: false };
    }
  }
}
