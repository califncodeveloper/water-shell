/**
 * Water Shell — Dealer Locator Role-Based Access Control Verification Suite
 *
 * Requirements Verified:
 * 1. Dealers must NOT have access to the "View Local Dealers" / "Find Nearest Dealer" functionality.
 * 2. Hide option from dealer accounts (Cart, Checkout, Product Details, Profile).
 * 3. Prevent access through direct navigation (/dealers, /dealer-locator, DealerLocatorModal).
 * 4. Dealers should still be able to browse all products listed in the app and place orders using their approved wholesale pricing.
 * 5. Ensure customers retain full access to the Dealer Locator (GPS calculation, search, zone filtering, contact actions).
 * 6. Preserve all other existing functionality and permissions.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Role-Based Access Control: Dealer Locator Restrictions & Wholesale Retention', () => {
  const rootDir = process.cwd();

  // Load target source files
  const cartScreenPath = path.join(rootDir, 'mobile', 'src', 'app', '(tabs)', 'cart.tsx');
  const checkoutScreenPath = path.join(rootDir, 'mobile', 'src', 'app', 'checkout', 'index.tsx');
  const productScreenPath = path.join(rootDir, 'mobile', 'src', 'app', 'product', '[id].tsx');
  const profileScreenPath = path.join(rootDir, 'mobile', 'src', 'app', '(tabs)', 'profile.tsx');
  const dealersScreenPath = path.join(rootDir, 'mobile', 'src', 'app', 'dealers.tsx');
  const dealerLocatorRoutePath = path.join(rootDir, 'mobile', 'src', 'app', 'dealer-locator.tsx');
  const dealerModalPath = path.join(rootDir, 'mobile', 'src', 'components', 'DealerLocatorModal.tsx');
  const deliveryServicePath = path.join(rootDir, 'mobile', 'src', 'services', 'deliveryService.ts');

  const cartContent = fs.readFileSync(cartScreenPath, 'utf-8');
  const checkoutContent = fs.readFileSync(checkoutScreenPath, 'utf-8');
  const productContent = fs.readFileSync(productScreenPath, 'utf-8');
  const profileContent = fs.readFileSync(profileScreenPath, 'utf-8');
  const dealersContent = fs.readFileSync(dealersScreenPath, 'utf-8');
  const dealerLocatorContent = fs.readFileSync(dealerLocatorRoutePath, 'utf-8');
  const dealerModalContent = fs.readFileSync(dealerModalPath, 'utf-8');
  const deliveryServiceContent = fs.readFileSync(deliveryServicePath, 'utf-8');

  // ── Scenario 1: Cart Screen Hides Dealer Locator from Dealer Accounts ──
  it('Scenario 1: Cart Screen strictly hides "View Authorized Local Dealers" and "Find Nearest Local Dealer" from dealers', () => {
    // Verify isDealerUser state is evaluated in Cart
    assert.ok(
      cartContent.includes("isDealerUser = isDealer || profile?.role === 'dealer'"),
      'Cart must compute isDealerUser from auth store role or isDealer flag'
    );

    // Verify "View Authorized Local Dealers" is guarded by !isDealerUser
    assert.ok(
      cartContent.includes('!isDealerUser &&') && cartContent.includes('View Authorized Local Dealers →'),
      'Cart must strictly guard View Authorized Local Dealers button with !isDealerUser'
    );

    // Verify "Find Nearest Local Dealer" is guarded by !isDealerUser
    assert.ok(
      cartContent.includes('!isDealerUser &&') && cartContent.includes('Find Nearest Local Dealer →'),
      'Cart must strictly guard Find Nearest Local Dealer button with !isDealerUser'
    );

    // Verify DealerLocatorModal is guarded in cart
    assert.ok(
      cartContent.includes('!isDealerUser &&') && cartContent.includes('<DealerLocatorModal'),
      'DealerLocatorModal must not be mounted or shown for dealer accounts in Cart'
    );

    // Verify dealers see wholesale dispatch text instead
    assert.ok(
      cartContent.includes('Wholesale Mixed Order Dispatch') &&
      cartContent.includes('Wholesale Dealer Fulfillment') &&
      cartContent.includes('Wholesale Spares'),
      'Dealers must see clean wholesale B2B fulfillment banners instead of dealer service notices'
    );
  });

  // ── Scenario 2: Checkout Screen Hides Dealer Locator from Dealer Accounts ──
  it('Scenario 2: Checkout Screen strictly hides dealer locator buttons and links from dealers', () => {
    // Verify isDealerUser evaluation
    assert.ok(
      checkoutContent.includes("isDealerUser = isDealer || profile?.role === 'dealer'"),
      'Checkout must compute isDealerUser from auth store'
    );

    // Verify "Dealers →" link in mixed alert is guarded
    assert.ok(
      checkoutContent.includes('!isDealerUser &&') && checkoutContent.includes('Dealers →'),
      'Mixed cart alert Dealers link must be guarded with !isDealerUser'
    );

    // Verify "Find Dealers →" link in accessory alert is guarded
    assert.ok(
      checkoutContent.includes('!isDealerUser &&') && checkoutContent.includes('Find Dealers →'),
      'Accessory alert Find Dealers link must be guarded with !isDealerUser'
    );

    // Verify "View Authorized Local Dealers" button is guarded
    assert.ok(
      checkoutContent.includes('!isDealerUser &&') && checkoutContent.includes('View Authorized Local Dealers'),
      'View Authorized Local Dealers checkout button must be guarded with !isDealerUser'
    );

    // Verify DealerLocatorModal is guarded in checkout
    assert.ok(
      checkoutContent.includes('!isDealerUser &&') && checkoutContent.includes('<DealerLocatorModal'),
      'DealerLocatorModal must not be mounted or rendered for dealer accounts in Checkout'
    );

    // Verify wholesale fulfillment messaging for dealers
    assert.ok(
      checkoutContent.includes('Dealership Address Delivery') &&
      checkoutContent.includes('Wholesale Dealer Fulfillment'),
      'Dealers in checkout must see wholesale dealership delivery info instead of local dealer assignment'
    );
  });

  // ── Scenario 3: Product Screen Hides Dealer Locator from Dealer Accounts ──
  it('Scenario 3: Product Details screen strictly hides "Find & Contact Local Dealer" from dealers', () => {
    // Verify isDealerUser evaluation
    assert.ok(
      productContent.includes("isDealerUser = isDealer || profile?.role === 'dealer'"),
      'Product details must compute isDealerUser'
    );

    // Verify "Find & Contact Local Dealer" is guarded
    assert.ok(
      productContent.includes('!isDealerUser &&') && productContent.includes('Find & Contact Local Dealer'),
      'Find & Contact Local Dealer button must be strictly guarded with !isDealerUser'
    );

    // Verify DealerLocatorModal is guarded in product details
    assert.ok(
      productContent.includes('!isDealerUser &&') && productContent.includes('<DealerLocatorModal'),
      'DealerLocatorModal in product screen must not be rendered for dealer accounts'
    );

    // Verify wholesale dispatch policy badge is displayed for dealers
    assert.ok(
      productContent.includes('B2B WHOLESALE DISPATCH') &&
      productContent.includes('Wholesale Dispatch to Registered Store'),
      'Product details must show B2B Wholesale Dispatch for dealers'
    );
  });

  // ── Scenario 4: Profile Screen Hides Dealer Locator from Dealer Accounts ──
  it('Scenario 4: Profile screen hides "Find Nearest Dealer" from dealer accounts while offering it to customers', () => {
    assert.ok(
      profileContent.includes("isDealerUser = isDealer || profile?.role === 'dealer'"),
      'Profile screen must compute isDealerUser'
    );

    assert.ok(
      profileContent.includes('!isDealerUser &&') && profileContent.includes('Find Nearest Dealer'),
      'Profile screen must show Find Nearest Dealer menu item only for non-dealers (!isDealerUser)'
    );
  });

  // ── Scenario 5: Direct Navigation to /dealers and /dealer-locator is Blocked for Dealers ──
  it('Scenario 5: Direct navigation to /dealers and /dealer-locator route is strictly blocked for dealer accounts', () => {
    // Route alias exists and re-exports DealersScreen
    assert.ok(
      dealerLocatorContent.includes("import DealersScreen from './dealers';") &&
      dealerLocatorContent.includes('export default DealersScreen;'),
      '/dealer-locator route alias must directly forward to DealersScreen with full protection'
    );

    // DealersScreen checks isDealerUser and triggers redirect away
    assert.ok(
      dealersContent.includes("isDealerUser = isDealer || profile?.role === 'dealer'"),
      'DealersScreen must compute isDealerUser from authStore'
    );
    assert.ok(
      dealersContent.includes("router.replace('/(tabs)/categories')"),
      'DealersScreen must redirect dealer accounts to wholesale catalog'
    );

    // DealersScreen renders Access Restricted view with explanatory notice
    assert.ok(
      dealersContent.includes('Access Restricted'),
      'DealersScreen must render Access Restricted header'
    );
    assert.ok(
      dealersContent.includes('Dealer Accounts Cannot Access Dealer Locator'),
      'DealersScreen must display specific reason for dealer access denial'
    );

    // DealersScreen refuses to load or fetch authorized dealers when user is a dealer
    assert.ok(
      dealersContent.includes('if (isDealerUser) {') && dealersContent.includes('setDealers([]);'),
      'DealersScreen must immediately abort data fetching and clear dealers array if caller is a dealer'
    );
  });

  // ── Scenario 6: DealerLocatorModal Returns Null and Clears Data for Dealer Accounts ──
  it('Scenario 6: DealerLocatorModal returns null and auto-closes if dealer account attempts to open it', () => {
    assert.ok(
      dealerModalContent.includes("isDealerUser = isDealer || profile?.role === 'dealer'"),
      'DealerLocatorModal must identify dealer accounts'
    );
    assert.ok(
      dealerModalContent.includes('if (visible && isDealerUser) {') &&
      dealerModalContent.includes('onClose();'),
      'DealerLocatorModal must automatically trigger onClose() if visible for a dealer'
    );
    assert.ok(
      dealerModalContent.includes('if (isDealerUser) {\n    return null;\n  }'),
      'DealerLocatorModal must return null to ensure zero UI or DOM leakage for dealers'
    );
    assert.ok(
      dealerModalContent.includes('if (isDealerUser) {\n      setDealers([]);\n      setLoading(false);\n      return;\n    }'),
      'DealerLocatorModal must not fetch or hold dealer data for dealer users'
    );
  });

  // ── Scenario 7: DeliveryService getAuthorizedDealers Protects Dealer Role ──
  it('Scenario 7: DeliveryService.getAuthorizedDealers returns empty array when called with dealer role', () => {
    assert.ok(
      deliveryServiceContent.includes("if (userRole === 'dealer') {\n      return [];\n    }"),
      'DeliveryService.getAuthorizedDealers must immediately return empty array if userRole is dealer'
    );
  });

  // ── Scenario 8: Customers Retain Full Access to Dealer Locator ──
  it('Scenario 8: Customers and visitors retain full access to Dealer Locator features', () => {
    // Customers can view zone tabs and search
    assert.ok(dealersContent.includes('Search by city, area, or 6-digit PIN...'));
    assert.ok(dealersContent.includes('Use Current GPS Location'));
    assert.ok(dealersContent.includes('ZONE_TABS'));

    // Customers can access direct call, WhatsApp, and directions
    assert.ok(dealersContent.includes('handleCall'));
    assert.ok(dealersContent.includes('handleWhatsApp'));
    assert.ok(dealersContent.includes('handleOpenMap'));

    // Nearest dealer badge
    assert.ok(dealersContent.includes('NEAREST TO YOU'));
  });

  // ── Scenario 9: Dealers Retain Full Access to Browse Products and Wholesale Pricing ──
  it('Scenario 9: Dealers retain full access to browse catalog and place orders using approved wholesale pricing', () => {
    // Product screen still allows dealers to add to cart and buy now
    assert.ok(
      productContent.includes('addItem(product, quantity, isDealerApproved);'),
      'Product screen must pass isDealerApproved to cart'
    );
    assert.ok(
      productContent.includes('if (isDealerApproved) return 500;'),
      'Product screen preserves bulk quantity selection up to 500 for approved dealers'
    );

    // Cart screen preserves wholesale price sync
    assert.ok(
      cartContent.includes('syncDealerPrices(isDealerApproved);'),
      'Cart screen preserves wholesale price synchronization for approved dealers'
    );

    // Checkout screen preserves wholesale dealer pricing
    assert.ok(
      checkoutContent.includes('syncDealerPrices(isDealerApproved);'),
      'Checkout screen preserves wholesale dealer pricing synchronization'
    );
  });
});
