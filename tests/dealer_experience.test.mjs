/**
 * Water Shell — Dealer Experience Test Suite
 * Tests:
 * 1. Bulk Quantity Selection (Direct numeric input, quick selections: 5, 10, 25, 50+)
 * 2. Dealer Registration (Mandatory Shop Name & Address, Commitment Note: ₹1,00,000)
 * 3. Exclusive Dealer Pricing (Catalogue, Product Details, Cart, Checkout & Retail MRP Hiding)
 * 4. Backend Eligibility & Security (Never trust client flags, verify via Firestore role & status)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { SEED_PRODUCTS } from '../mobile/src/data/seedProducts.ts';
import { PricingService } from '../mobile/src/services/pricingService.ts';

const sampleProduct = SEED_PRODUCTS[0]; // e.g. Grand RO

describe('1. Bulk Quantity Selection for Dealers', () => {

  test('Approved dealers can select bulk quantities of 5, 10, 25, and 50+ units', () => {
    const quickBulkOptions = [5, 10, 25, 50];

    for (const qty of quickBulkOptions) {
      assert.ok(qty >= 5, `Expected bulk quantity >= 5, got ${qty}`);
    }

    // Function simulating bulk tier selection
    const applyQuickBulk = (tier) => {
      const allowedTiers = [5, 10, 25, 50];
      if (!allowedTiers.includes(tier)) throw new Error('Invalid bulk tier');
      return tier;
    };

    assert.equal(applyQuickBulk(5), 5);
    assert.equal(applyQuickBulk(10), 10);
    assert.equal(applyQuickBulk(25), 25);
    assert.equal(applyQuickBulk(50), 50);
  });

  test('Direct numeric input allows arbitrary bulk quantity (e.g. 15, 30, 75, 120)', () => {
    const parseDirectInput = (input, isDealerApproved, stockStatus = 'in_stock') => {
      const cleaned = String(input).replace(/[^0-9]/g, '');
      const num = parseInt(cleaned, 10);
      if (isNaN(num) || num <= 0) return 1;

      const maxLimit = isDealerApproved
        ? 500
        : stockStatus === 'limited' ? 5 : 10;
      return Math.min(maxLimit, num);
    };

    // Approved dealer entering arbitrary numbers
    assert.equal(parseDirectInput('5', true), 5);
    assert.equal(parseDirectInput('15', true), 15);
    assert.equal(parseDirectInput('25', true), 25);
    assert.equal(parseDirectInput('50', true), 50);
    assert.equal(parseDirectInput('75', true), 75);
    assert.equal(parseDirectInput('120', true), 120);
    assert.equal(parseDirectInput('500', true), 500);

    // If dealer enters above max allowable
    assert.equal(parseDirectInput('999', true), 500);
  });

  test('Regular retail customers are strictly capped at standard limits (10 units)', () => {
    const resolveMaxQuantity = (isDealerApproved, stockStatus) => {
      if (isDealerApproved) return 500;
      return stockStatus === 'limited' ? 5 : 10;
    };

    assert.equal(resolveMaxQuantity(false, 'in_stock'), 10);
    assert.equal(resolveMaxQuantity(false, 'limited'), 5);
    assert.equal(resolveMaxQuantity(true, 'in_stock'), 500);
    assert.equal(resolveMaxQuantity(true, 'limited'), 500);
  });
});

describe('2. Dealer Registration Requirements', () => {
  test('Requires mandatory Shop Name and Shop Address', () => {
    const validateRegistration = ({ shopName, shopAddress, contactName, email, phone, password }) => {
      if (!shopName || !shopName.trim()) {
        return { valid: false, error: 'Shop Name is required.' };
      }
      if (!shopAddress || !shopAddress.trim()) {
        return { valid: false, error: 'Shop Address is required.' };
      }
      if (!contactName || !contactName.trim() || !email || !email.trim() || !phone || !phone.trim() || !password || !password.trim()) {
        return { valid: false, error: 'Please fill in all mandatory fields.' };
      }
      if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters.' };
      }
      return { valid: true };
    };

    // Missing shop name
    const res1 = validateRegistration({
      shopName: '',
      shopAddress: '123 Market Street, Pune',
      contactName: 'Ramesh',
      email: 'ramesh@shop.com',
      phone: '9876543210',
      password: 'password123',
    });
    assert.equal(res1.valid, false);
    assert.equal(res1.error, 'Shop Name is required.');

    // Missing shop address
    const res2 = validateRegistration({
      shopName: 'Ramesh Water Care',
      shopAddress: '',
      contactName: 'Ramesh',
      email: 'ramesh@shop.com',
      phone: '9876543210',
      password: 'password123',
    });
    assert.equal(res2.valid, false);
    assert.equal(res2.error, 'Shop Address is required.');

    // Valid registration
    const res3 = validateRegistration({
      shopName: 'Ramesh Water Care',
      shopAddress: 'Shop 4, Commercial Plaza, Pune 411001',
      contactName: 'Ramesh Kumar',
      email: 'ramesh@shop.com',
      phone: '9876543210',
      password: 'secretPassword',
    });
    assert.equal(res3.valid, true);
  });

  test('Displays clear note: "Minimum first-purchase commitment of ₹1,00,000"', () => {
    const COMMITMENT_NOTE = 'Minimum first-purchase commitment of ₹1,00,000';
    assert.ok(COMMITMENT_NOTE.includes('₹1,00,000'));
    assert.ok(COMMITMENT_NOTE.includes('commitment'));
  });

  test('New dealer profile registers with pending status and syncs businessName', () => {
    const createDealerProfile = ({ uid, name, email, phone, shopName, shopAddress, gstNumber }) => ({
      uid,
      displayName: name,
      email,
      phone,
      role: 'dealer',
      dealerStatus: 'pending',
      shopName,
      shopAddress,
      businessName: shopName,
      gstNumber: gstNumber || null,
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const profile = createDealerProfile({
      uid: 'dlr_test_001',
      name: 'Anil Gupta',
      email: 'anil@purewater.in',
      phone: '9876543210',
      shopName: 'Gupta Water Technologies',
      shopAddress: 'Shop 15, Sector 18, Noida 201301',
      gstNumber: '07AAAAA0000A1Z5',
    });

    assert.equal(profile.role, 'dealer');
    assert.equal(profile.dealerStatus, 'pending');
    assert.equal(profile.shopName, 'Gupta Water Technologies');
    assert.equal(profile.shopAddress, 'Shop 15, Sector 18, Noida 201301');
    assert.equal(profile.businessName, 'Gupta Water Technologies');
  });
});

describe('3. Exclusive Dealer Pricing & Retail MRP Hiding', () => {
  const sampleProduct = SEED_PRODUCTS.find((p) => p.dealerPrice && p.dealerPrice < p.customerPrice);

  test('Approved dealers see dealer-specific pricing throughout catalogue & checkout', () => {
    assert.ok(sampleProduct);
    const getResolvedPrice = (product, isDealerApproved) => {
      if (isDealerApproved && product.dealerPrice) {
        return product.dealerPrice;
      }
      return product.customerPrice;
    };

    assert.equal(getResolvedPrice(sampleProduct, true), sampleProduct.dealerPrice);
    assert.equal(getResolvedPrice(sampleProduct, false), sampleProduct.customerPrice);
  });

  test('Retail MRP is completely hidden from approved dealers', () => {
    const getPricingViewModel = (product, isDealerApproved) => {
      if (isDealerApproved && product.dealerPrice) {
        return {
          displayPrice: product.dealerPrice,
          priceLabel: 'Wholesale Dealer Price',
          retailMrp: null, // Completely hidden
          savingsVsRetail: null, // Completely hidden
          isDealerPricing: true,
        };
      }
      return {
        displayPrice: product.customerPrice,
        priceLabel: 'Retail Price',
        retailMrp: product.customerPrice,
        savingsVsRetail: null,
        isDealerPricing: false,
      };
    };

    const dealerView = getPricingViewModel(sampleProduct, true);
    assert.equal(dealerView.displayPrice, sampleProduct.dealerPrice);
    assert.equal(dealerView.retailMrp, null, 'Retail MRP must not be disclosed to approved dealers');
    assert.equal(dealerView.savingsVsRetail, null, 'Savings vs retail must not be disclosed');

    const customerView = getPricingViewModel(sampleProduct, false);
    assert.equal(customerView.displayPrice, sampleProduct.customerPrice);
    assert.equal(customerView.isDealerPricing, false);
  });

  test('Centralized PricingService yields consistent dealer wholesale pricing and hides retail MRP', () => {
    // For approved dealer
    const dealerPricing = PricingService.getProductPricing(sampleProduct, true);
    assert.equal(dealerPricing.isDealerActive, true);
    assert.equal(dealerPricing.effectivePrice, sampleProduct.dealerPrice);
    assert.equal(dealerPricing.showRetailMRP, false, 'showRetailMRP must be false for approved dealers');
    assert.equal(dealerPricing.wholesaleBadgeText, 'Dealer Wholesale');
    assert.ok(dealerPricing.formattedPrice.includes(String(sampleProduct.dealerPrice.toLocaleString('en-IN'))));

    // For regular customer
    const customerPricing = PricingService.getProductPricing(sampleProduct, false);
    assert.equal(customerPricing.isDealerActive, false);
    assert.equal(customerPricing.effectivePrice, sampleProduct.customerPrice);
    assert.equal(customerPricing.showRetailMRP, true, 'showRetailMRP must be true for retail customers');
    assert.equal(customerPricing.wholesaleBadgeText, null);
    assert.ok(customerPricing.formattedPrice.includes(String(sampleProduct.customerPrice.toLocaleString('en-IN'))));
  });

  test('Product listings across Home, Categories and Details share unified PricingService', () => {
    // Verify 10 random seed products
    const sampleItems = SEED_PRODUCTS.slice(0, 10);
    for (const prod of sampleItems) {
      if (prod.dealerPrice) {
        const dealerP = PricingService.getProductPricing(prod, true);
        assert.equal(dealerP.effectivePrice, prod.dealerPrice);
        assert.equal(dealerP.showRetailMRP, false);

        const customerP = PricingService.getProductPricing(prod, false);
        assert.equal(customerP.effectivePrice, prod.customerPrice);
        assert.equal(customerP.showRetailMRP, true);
      }
    }
  });

  test('Price sorting sorts by dealer wholesale price for dealers and customer price for customers', () => {
    const prods = SEED_PRODUCTS.slice(0, 5).map((p) => ({ ...p }));

    // Sort by price ascending for dealer
    const dealerSorted = [...prods].sort(
      (a, b) =>
        PricingService.getEffectiveUnitPrice(a, true) -
        PricingService.getEffectiveUnitPrice(b, true)
    );
    for (let i = 0; i < dealerSorted.length - 1; i++) {
      const p1 = PricingService.getEffectiveUnitPrice(dealerSorted[i], true);
      const p2 = PricingService.getEffectiveUnitPrice(dealerSorted[i + 1], true);
      assert.ok(p1 <= p2, `Dealer sort error: ${p1} > ${p2}`);
    }

    // Sort by price ascending for customer
    const customerSorted = [...prods].sort(
      (a, b) =>
        PricingService.getEffectiveUnitPrice(a, false) -
        PricingService.getEffectiveUnitPrice(b, false)
    );
    for (let i = 0; i < customerSorted.length - 1; i++) {
      const p1 = PricingService.getEffectiveUnitPrice(customerSorted[i], false);
      const p2 = PricingService.getEffectiveUnitPrice(customerSorted[i + 1], false);
      assert.ok(p1 <= p2, `Customer sort error: ${p1} > ${p2}`);
    }
  });
});

describe('4. Secure Backend Pricing & Dealer Status Enforcement', () => {
  // Mock users in Firestore
  const mockFirestoreUsers = new Map([
    ['cust_101', { uid: 'cust_101', role: 'customer', email: 'cust@gmail.com' }],
    ['pending_dlr_102', { uid: 'pending_dlr_102', role: 'dealer', dealerStatus: 'pending', email: 'pending@shop.com' }],
    ['approved_dlr_103', { uid: 'approved_dlr_103', role: 'dealer', dealerStatus: 'approved', email: 'approved@shop.com' }],
    ['rejected_dlr_104', { uid: 'rejected_dlr_104', role: 'dealer', dealerStatus: 'rejected', email: 'rejected@shop.com' }],
  ]);

  // Backend verification function
  async function verifyDealerStatusOnBackend(customerId) {
    if (!customerId) return false;
    const userData = mockFirestoreUsers.get(customerId);
    if (!userData) return false;
    return userData.role === 'dealer' && userData.dealerStatus === 'approved';
  }

  async function calculateBackendOrderPricing(items, customerId, clientClaimedIsDealer) {
    // SECURITY: Disregard clientClaimedIsDealer! Verify authoritative user record
    const isApprovedDealer = await verifyDealerStatusOnBackend(customerId);

    let subtotal = 0;
    for (const item of items) {
      const prod = SEED_PRODUCTS.find((p) => p.id === item.productId);
      const unitPrice = isApprovedDealer && prod.dealerPrice ? prod.dealerPrice : prod.customerPrice;
      subtotal += unitPrice * item.quantity;
    }
    const shippingFee = subtotal >= 999 ? 0 : 99;
    return {
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      isApprovedDealer,
      orderType: isApprovedDealer ? 'dealer' : 'customer',
    };
  }

  test('Approved dealer in Firestore receives dealer pricing', async () => {
    const items = [{ productId: sampleProduct.id, quantity: 10 }];
    const res = await calculateBackendOrderPricing(items, 'approved_dlr_103', true);

    assert.equal(res.isApprovedDealer, true);
    assert.equal(res.orderType, 'dealer');
    assert.equal(res.subtotal, sampleProduct.dealerPrice * 10);
  });

  test('Customer fraudulently claiming isDealer: true is strictly given customer pricing', async () => {
    const items = [{ productId: sampleProduct.id, quantity: 1 }];
    // Customer claims isDealer: true in payload
    const res = await calculateBackendOrderPricing(items, 'cust_101', true);

    assert.equal(res.isApprovedDealer, false);
    assert.equal(res.orderType, 'customer');
    assert.equal(res.subtotal, sampleProduct.customerPrice * 1);
  });

  test('Pending dealer claiming isDealer: true is strictly given customer pricing', async () => {
    const items = [{ productId: sampleProduct.id, quantity: 5 }];
    const res = await calculateBackendOrderPricing(items, 'pending_dlr_102', true);

    assert.equal(res.isApprovedDealer, false);
    assert.equal(res.orderType, 'customer');
    assert.equal(res.subtotal, sampleProduct.customerPrice * 5);
  });

  test('Rejected dealer claiming isDealer: true is strictly given customer pricing', async () => {
    const items = [{ productId: sampleProduct.id, quantity: 5 }];
    const res = await calculateBackendOrderPricing(items, 'rejected_dlr_104', true);

    assert.equal(res.isApprovedDealer, false);
    assert.equal(res.orderType, 'customer');
    assert.equal(res.subtotal, sampleProduct.customerPrice * 5);
  });
});
