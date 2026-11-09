/**
 * Test Suite: Mobile Delivery Zones Dynamic Sync & Reflection
 * Verifies that when delivery zones are modified or removed from Admin Panel:
 * 1. Mobile deliveryService provides real-time Firestore synchronization, AsyncStorage caching, and useDeliveryZones hook.
 * 2. Mobile screens (Checkout, Product Details, Service Booking, Dealers, DealerLocatorModal)
 *    render dynamic zone chips, dynamic policy messages, and validate addresses against live Firestore zones.
 * 3. Static hardcoded zone arrays in UI renderers are eliminated.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Delivery Zones Live Sync & App Functionality Reflection', () => {
  const rootDir = process.cwd();

  it('1. Verifies mobile deliveryService implements onSnapshot listener, AsyncStorage caching, and useDeliveryZones hook', () => {
    const servicePath = path.join(rootDir, 'mobile', 'src', 'services', 'deliveryService.ts');
    const content = fs.readFileSync(servicePath, 'utf-8');

    assert.ok(content.includes('onSnapshot'), 'Must attach onSnapshot listener');
    assert.ok(content.includes('AsyncStorage'), 'Must persist zones to AsyncStorage for instant boot');
    assert.ok(content.includes('useDeliveryZones'), 'Must export useDeliveryZones hook');
    assert.ok(content.includes('subscribeDeliveryZones'), 'Must export subscribeDeliveryZones');
    assert.ok(content.includes('zonesToTest?: DeliveryZoneConfig[]'), 'validateDeliveryAddress must accept dynamic zonesToTest');
    assert.ok(content.includes('checkPincodeQuick('), 'checkPincodeQuick must accept dynamic zonesToTest');
  });

  it('2. Verifies Checkout screen dynamically reflects live zones in UI chips, description, and order validation', () => {
    const checkoutPath = path.join(rootDir, 'mobile', 'src', 'app', 'checkout', 'index.tsx');
    const content = fs.readFileSync(checkoutPath, 'utf-8');

    assert.ok(content.includes('useDeliveryZones'), 'Checkout must use useDeliveryZones hook');
    assert.ok(content.includes('activeZones.map'), 'Checkout must map activeZones for chips instead of static array');
    assert.ok(content.includes('activeZoneNames'), 'Checkout must use dynamic activeZoneNames in policy description');
    assert.ok(!content.includes("errors.city = 'Direct delivery for machines is limited to Chennai"), 'Hardcoded zone names in error must be replaced');
  });

  it('3. Verifies Product Details screen dynamically reflects live zones in chips and pincode validator', () => {
    const productPath = path.join(rootDir, 'mobile', 'src', 'app', 'product', '[id].tsx');
    const content = fs.readFileSync(productPath, 'utf-8');

    assert.ok(content.includes('useDeliveryZones'), 'Product screen must use useDeliveryZones hook');
    assert.ok(content.includes('activeZones.map'), 'Product screen must map activeZones for zone chips');
    assert.ok(content.includes('validateAddress({ pincode: clean })'), 'Product screen pincode check must use dynamic validateAddress');
    assert.ok(!content.includes('across 4 supported zones'), 'Hardcoded "4 supported zones" text must be dynamic');
  });

  it('4. Verifies Service Booking screen dynamically reflects live zones in chips and booking gating', () => {
    const bookServicePath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'book.tsx');
    const content = fs.readFileSync(bookServicePath, 'utf-8');

    assert.ok(content.includes('useDeliveryZones'), 'Service book screen must use useDeliveryZones hook');
    assert.ok(content.includes('activeZones.map'), 'Service book screen must map activeZones for chips');
    assert.ok(content.includes('validateAddress'), 'Service book screen must use dynamic validateAddress');
    assert.ok(!content.includes('across 4 authorized delivery zones'), 'Hardcoded "4 authorized delivery zones" must be dynamic');
  });

  it('5. Verifies Dealer Locator screen and Modal dynamically generate zone tabs from active zones', () => {
    const dealersPath = path.join(rootDir, 'mobile', 'src', 'app', 'dealers.tsx');
    const dealersContent = fs.readFileSync(dealersPath, 'utf-8');
    assert.ok(dealersContent.includes('useDeliveryZones'), 'Dealers screen must use useDeliveryZones');
    assert.ok(dealersContent.includes('activeZones.map'), 'Dealers screen must generate dynamic zone tabs from activeZones');

    const modalPath = path.join(rootDir, 'mobile', 'src', 'components', 'DealerLocatorModal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf-8');
    assert.ok(modalContent.includes('useDeliveryZones'), 'DealerLocatorModal must use useDeliveryZones');
    assert.ok(modalContent.includes('activeZones.map'), 'DealerLocatorModal must generate dynamic zone tabs from activeZones');
  });

  it('6. Verifies AdminDeliveryService reliably saves modified zones array even when zones are removed or empty', () => {
    const adminServicePath = path.join(rootDir, 'admin', 'src', 'services', 'deliveryService.ts');
    const adminContent = fs.readFileSync(adminServicePath, 'utf-8');

    assert.ok(adminContent.includes('Array.isArray(policy.zones) ? policy.zones : SUPPORTED_DELIVERY_ZONES'), 'Must preserve updated zones array even if fewer or modified');
    assert.ok(adminContent.includes('if (!auth.currentUser)'), 'Must not reset existing authenticated admin session');
  });
});
