/**
 * Water Shell — Centralized Pricing Service
 * Single source of truth for all pricing calculations, currency formatting,
 * and dealer wholesale vs retail pricing resolution across the app.
 */

import { Product } from '@/types';

export interface ProductPricingInfo {
  /** The final price to charge and display for the active user */
  effectivePrice: number;
  /** Formatted INR currency string of effectivePrice, e.g. "₹14,999" */
  formattedPrice: string;
  /** True strictly when user is an approved dealer AND product has a valid dealerPrice */
  isDealerActive: boolean;
  /** Raw dealer price if set, or null */
  dealerPrice: number | null;
  /** Formatted dealer price, or null if not applicable */
  formattedDealerPrice: string | null;
  /** Standard customer retail price */
  customerPrice: number;
  /** Formatted customer retail price */
  formattedCustomerPrice: string;
  /**
   * Whether to show retail MRP & strikethrough.
   * STRICTLY FALSE for approved dealers (hides retail MRP completely).
   */
  showRetailMRP: boolean;
  /** Price difference between retail customer price and dealer price */
  savingsAmount: number;
  /** Percentage discount of dealer price vs customer price */
  savingsPercent: number;
  /** Formatted savings amount string or null */
  formattedSavings: string | null;
  /** Tag / badge label to display next to the price (e.g. "Dealer Wholesale") */
  wholesaleBadgeText: string | null;
  /** Explanatory tax / terms subtext */
  taxNote: string;
}

export class PricingService {
  /**
   * Format any numeric amount as standard Indian Rupee currency string (e.g. ₹14,999)
   */
  static formatPrice(amount: number | null | undefined): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  }

  /**
   * Calculate authoritative pricing information for a product based on dealer approval status.
   *
   * Rules:
   * 1. Approved dealers strictly receive dealerPrice if available.
   * 2. Retail MRP and customer pricing are COMPLETELY HIDDEN from approved dealers.
   * 3. Regular customers always receive standard customerPrice.
   * 4. Safe fallbacks for missing or unseeded properties.
   */
  static getProductPricing(
    product: Product | { customerPrice: number; dealerPrice?: number | null; price?: number },
    isDealerApproved: boolean = false
  ): ProductPricingInfo {
    const customerPrice = product?.customerPrice ?? product?.price ?? 0;
    const dealerPrice =
      typeof product?.dealerPrice === 'number' && product.dealerPrice > 0
        ? product.dealerPrice
        : null;

    const isDealerActive = Boolean(isDealerApproved && dealerPrice !== null);
    const effectivePrice = isDealerActive ? dealerPrice! : customerPrice;

    const formattedPrice = this.formatPrice(effectivePrice);
    const formattedCustomerPrice = this.formatPrice(customerPrice);
    const formattedDealerPrice = dealerPrice !== null ? this.formatPrice(dealerPrice) : null;

    // Approved dealers NEVER see retail MRP / strikethroughs
    const showRetailMRP = !isDealerActive;

    // Calculate wholesale savings metadata
    const hasSavings = isDealerActive && customerPrice > dealerPrice!;
    const savingsAmount = hasSavings ? customerPrice - dealerPrice! : 0;
    const savingsPercent = hasSavings ? Math.round((savingsAmount / customerPrice) * 100) : 0;
    const formattedSavings = hasSavings ? this.formatPrice(savingsAmount) : null;

    const wholesaleBadgeText = isDealerActive ? 'Dealer Wholesale' : null;
    const taxNote = isDealerActive
      ? 'Wholesale B2B pricing • GST & official warranty included'
      : 'Inclusive of all taxes & standard installation';

    return {
      effectivePrice,
      formattedPrice,
      isDealerActive,
      dealerPrice,
      formattedDealerPrice,
      customerPrice,
      formattedCustomerPrice,
      showRetailMRP,
      savingsAmount,
      savingsPercent,
      formattedSavings,
      wholesaleBadgeText,
      taxNote,
    };
  }

  /**
   * Resolve unit price for an item in cart or checkout.
   */
  static getEffectiveUnitPrice(
    product: Product | { customerPrice: number; dealerPrice?: number | null; price?: number },
    isDealerApproved: boolean = false
  ): number {
    if (isDealerApproved && typeof product?.dealerPrice === 'number' && product.dealerPrice > 0) {
      return product.dealerPrice;
    }
    return product?.customerPrice ?? product?.price ?? 0;
  }
}
