/**
 * Product Image Presentation System
 * Standardized scale factors, padding, and fallback resolution
 * across all product categories to maintain visual weight and harmony.
 */

export interface ProductImageConfig {
  scaleClass: string;
  hoverScaleClass: string;
  paddingClass: string;
  objectFit: 'contain' | 'cover';
  shadowClass: string;
}

/**
 * Returns balanced styling classes based on category and product characteristics
 * so that products of varying dimensions (tall dispensers, wide booster pumps,
 * small SMPS adapters, slender cartridges) have balanced visual weight.
 */
export function getProductImageConfig(
  categoryId?: string,
  productId?: string,
  variant: 'card' | 'category' | 'spotlight' | 'modal' | 'thumb' = 'card'
): ProductImageConfig {
  // Flagship spotlight (Aqua Touch)
  if (productId === 'AP-WP-061' && variant === 'spotlight') {
    return {
      scaleClass: 'scale-100 sm:scale-105',
      hoverScaleClass: 'group-hover:scale-110',
      paddingClass: 'p-6 sm:p-8',
      objectFit: 'contain',
      shadowClass: 'drop-shadow-[0_16px_32px_rgba(27,31,94,0.12)]',
    };
  }

  // Category specific calibrations
  switch (categoryId) {
    case 'booster-pumps':
      // Booster pumps are compact, wide mechanical units.
      // Scaling up gives them proportional mass alongside larger purifiers.
      return {
        scaleClass: productId === 'AP-PM-023' ? 'scale-115' : 'scale-110',
        hoverScaleClass: 'group-hover:scale-118',
        paddingClass: variant === 'category' ? 'p-6 sm:p-8' : 'p-6 sm:p-7',
        objectFit: 'contain',
        shadowClass: 'drop-shadow-[0_8px_18px_rgba(27,31,94,0.09)]',
      };

    case 'smps-power-units':
      // SMPS adapters are compact electronics.
      // Scaling gives them clear visibility so cables and specifications are distinct.
      return {
        scaleClass: 'scale-115',
        hoverScaleClass: 'group-hover:scale-122',
        paddingClass: variant === 'category' ? 'p-6 sm:p-8' : 'p-6',
        objectFit: 'contain',
        shadowClass: 'drop-shadow-[0_8px_16px_rgba(27,31,94,0.08)]',
      };

    case 'water-treatment-accessories-filters':
      // Spares & filter cartridges (cylinders, membranes, wrenches).
      return {
        scaleClass: 'scale-108',
        hoverScaleClass: 'group-hover:scale-115',
        paddingClass: variant === 'category' ? 'p-6 sm:p-8' : 'p-6 sm:p-7',
        objectFit: 'contain',
        shadowClass: 'drop-shadow-[0_8px_18px_rgba(27,31,94,0.08)]',
      };

    case 'water-dispensers':
      // Tall floor-standing or tabletop dispensers.
      // Balanced vertical headroom ensures tall dispensers don't feel compressed.
      return {
        scaleClass: 'scale-104',
        hoverScaleClass: 'group-hover:scale-110',
        paddingClass: variant === 'category' ? 'p-5 sm:p-7' : 'pt-7 pb-6 px-6',
        objectFit: 'contain',
        shadowClass: 'drop-shadow-[0_10px_20px_rgba(27,31,94,0.09)]',
      };

    case 'ro-water-purifiers':
    default:
      // Standard RO Purifiers (square or 3:4 aspect ratio).
      return {
        scaleClass: 'scale-102',
        hoverScaleClass: 'group-hover:scale-108',
        paddingClass: variant === 'category' ? 'p-6 sm:p-8' : 'pt-8 pb-6 px-7',
        objectFit: 'contain',
        shadowClass: 'drop-shadow-[0_10px_22px_rgba(27,31,94,0.09)]',
      };
  }
}

/**
 * Normalizes image source with fallback logic
 */
export function resolveProductImageSrc(
  rawSrc?: string,
  productId?: string,
  hasError: boolean = false
): string {
  if (hasError) {
    return '/images/aqua-touch.jpg';
  }
  if (productId === 'AP-WP-061') {
    return '/images/aqua-touch.jpg';
  }
  return rawSrc || '/images/aqua-touch.jpg';
}

