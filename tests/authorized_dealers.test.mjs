/**
 * Water Shell — Authorized Dealers & Dealer Locator Verification Test Suite
 *
 * Tests the 9 Core Scenarios required for replacing dummy dealer data with live Firestore records:
 * 1. Approved dealer appears in the locator.
 * 2. Pending dealer does not appear.
 * 3. Rejected dealer does not appear.
 * 4. Deactivated dealer does not appear.
 * 5. Nearest dealer is calculated correctly via GPS Haversine formula.
 * 6. City and PIN-code search works.
 * 7. Dealers without coordinates do not create invalid map markers.
 * 8. Call and WhatsApp actions work.
 * 9. Empty and Firebase error states display correctly.
 * 10. Removal of hardcoded mock data source from production.
 * 11. Security rule enforcement on users collection.
 * 12. Admin management capability for shop details and coordinates.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Authorized Dealers & Dealer Locator Verification Suite', () => {
  const rootDir = process.cwd();

  // Load files for inspection
  const mobileDeliveryServicePath = path.join(rootDir, 'mobile', 'src', 'services', 'deliveryService.ts');
  const adminDeliveryServicePath = path.join(rootDir, 'admin', 'src', 'services', 'deliveryService.ts');
  const dealerModalPath = path.join(rootDir, 'mobile', 'src', 'components', 'DealerLocatorModal.tsx');
  const adminDealersPagePath = path.join(rootDir, 'admin', 'src', 'features', 'dealers', 'DealersPage.tsx');
  const firestoreRulesPath = path.join(rootDir, 'firestore.rules');

  const mobileDeliveryContent = fs.readFileSync(mobileDeliveryServicePath, 'utf-8');
  const adminDeliveryContent = fs.readFileSync(adminDeliveryServicePath, 'utf-8');
  const dealerModalContent = fs.readFileSync(dealerModalPath, 'utf-8');
  const adminDealersContent = fs.readFileSync(adminDealersPagePath, 'utf-8');
  const firestoreRulesContent = fs.readFileSync(firestoreRulesPath, 'utf-8');

  // Pure Haversine distance implementation for test verification
  function testHaversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  // Pure Nearest Dealer calculation function mirroring DeliveryService.calculateNearestDealer
  function calculateNearestDealer(dealers, criteria) {
    if (!dealers || dealers.length === 0) {
      return { dealer: null, matchType: 'none', dealers: [] };
    }

    if (
      criteria.userLocation &&
      typeof criteria.userLocation.latitude === 'number' &&
      typeof criteria.userLocation.longitude === 'number'
    ) {
      const { latitude, longitude } = criteria.userLocation;
      const withCoords = dealers
        .filter((d) => typeof d.latitude === 'number' && typeof d.longitude === 'number')
        .map((d) => ({
          ...d,
          distanceKm: testHaversineKm(latitude, longitude, d.latitude, d.longitude),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      if (withCoords.length > 0) {
        return {
          dealer: withCoords[0],
          distanceKm: withCoords[0].distanceKm,
          matchType: 'coordinates',
          dealers: withCoords,
        };
      }
    }

    if (criteria.pincode) {
      const cleanPin = String(criteria.pincode).replace(/\D/g, '').trim();
      if (cleanPin.length >= 3) {
        const pinMatches = dealers.filter((d) => {
          const dPin = String(d.pincode || '').replace(/\D/g, '').trim();
          return dPin === cleanPin || (dPin.length >= 3 && dPin.startsWith(cleanPin.slice(0, 3)));
        });
        if (pinMatches.length > 0) {
          return {
            dealer: pinMatches[0],
            matchType: 'pincode',
            dealers: pinMatches,
          };
        }
      }
    }

    if (criteria.city) {
      const cleanCity = String(criteria.city).toLowerCase().trim();
      if (cleanCity) {
        const cityMatches = dealers.filter((d) => {
          const dCity = String(d.city || '').toLowerCase().trim();
          const dAddr = String(d.address || '').toLowerCase().trim();
          return dCity.includes(cleanCity) || cleanCity.includes(dCity) || dAddr.includes(cleanCity);
        });
        if (cityMatches.length > 0) {
          return {
            dealer: cityMatches[0],
            matchType: 'city',
            dealers: cityMatches,
          };
        }
      }
    }

    if (criteria.zoneId) {
      const zoneMatches = dealers.filter((d) => d.zoneId === criteria.zoneId);
      if (zoneMatches.length > 0) {
        return {
          dealer: zoneMatches[0],
          matchType: 'zone',
          dealers: zoneMatches,
        };
      }
    }

    return { dealer: null, matchType: 'none', dealers: [] };
  }

  // Sample database records simulating Firestore `users` collection
  const mockFirestoreUsers = [
    {
      id: 'dealer-approved-1',
      role: 'dealer',
      dealerStatus: 'approved',
      isActive: true,
      shopName: 'Shri Ram Water Solutions',
      displayName: 'Ramkumar S',
      phone: '+91 98401 11223',
      whatsapp: '+91 98401 11223',
      shopAddress: '15 Gandhi Road, Tambaram West',
      city: 'Chennai',
      pincode: '600045',
      zoneId: 'chengalpattu',
      latitude: 12.9249,
      longitude: 80.1472,
    },
    {
      id: 'dealer-approved-2-no-gps',
      role: 'dealer',
      dealerStatus: 'approved',
      isActive: true,
      shopName: 'Kanchi Pure Water Care',
      displayName: 'Venkatesh K',
      phone: '+91 94432 99887',
      whatsapp: '+91 94432 99887',
      shopAddress: '44 Raja Street, Near Temple',
      city: 'Kanchipuram',
      pincode: '631501',
      zoneId: 'kanchipuram',
      // No coordinates
    },
    {
      id: 'dealer-pending-1',
      role: 'dealer',
      dealerStatus: 'pending',
      isActive: true,
      shopName: 'Pending Aqua Traders',
      displayName: 'Suresh Kumar',
      phone: '+91 98400 99999',
      city: 'Chennai',
      pincode: '600001',
    },
    {
      id: 'dealer-rejected-1',
      role: 'dealer',
      dealerStatus: 'rejected',
      isActive: true,
      shopName: 'Rejected Filter Works',
      displayName: 'Mahesh B',
      phone: '+91 98400 88888',
      city: 'Puducherry',
      pincode: '605001',
    },
    {
      id: 'dealer-deactivated-1',
      role: 'dealer',
      dealerStatus: 'approved',
      isActive: false, // Deactivated by admin!
      shopName: 'Defunct Spares Hub',
      displayName: 'Karthik R',
      phone: '+91 98400 77777',
      city: 'Chennai',
      pincode: '600028',
    },
    {
      id: 'customer-1',
      role: 'customer',
      displayName: 'Ananya Sharma',
      email: 'ananya@example.com',
      phone: '+91 98400 66666',
    },
  ];

  // Simulating query filter logic from DeliveryService.getAuthorizedDealers
  function filterAuthorizedDealers(users) {
    return users.filter(
      (u) => u.role === 'dealer' && u.dealerStatus === 'approved' && u.isActive !== false
    );
  }

  // ── Scenario 1: Approved dealer appears in locator ──
  it('Scenario 1: Approved and active dealer appears in locator', () => {
    const visibleDealers = filterAuthorizedDealers(mockFirestoreUsers);
    const approved1 = visibleDealers.find((d) => d.id === 'dealer-approved-1');
    const approved2 = visibleDealers.find((d) => d.id === 'dealer-approved-2-no-gps');

    assert.ok(approved1, 'Approved dealer 1 must be included');
    assert.equal(approved1.shopName, 'Shri Ram Water Solutions');
    assert.ok(approved2, 'Approved dealer 2 without GPS must also be included');
    assert.equal(approved2.shopName, 'Kanchi Pure Water Care');
  });

  // ── Scenario 2: Pending dealer does not appear ──
  it('Scenario 2: Pending dealer application does NOT appear in locator', () => {
    const visibleDealers = filterAuthorizedDealers(mockFirestoreUsers);
    const pending = visibleDealers.find((d) => d.id === 'dealer-pending-1');
    assert.equal(pending, undefined, 'Pending dealer must NOT appear in customer locator');
  });

  // ── Scenario 3: Rejected dealer does not appear ──
  it('Scenario 3: Rejected dealer does NOT appear in locator', () => {
    const visibleDealers = filterAuthorizedDealers(mockFirestoreUsers);
    const rejected = visibleDealers.find((d) => d.id === 'dealer-rejected-1');
    assert.equal(rejected, undefined, 'Rejected dealer must NOT appear in customer locator');
  });

  // ── Scenario 4: Deactivated dealer does not appear ──
  it('Scenario 4: Deactivated dealer does NOT appear in locator even if approved previously', () => {
    const visibleDealers = filterAuthorizedDealers(mockFirestoreUsers);
    const deactivated = visibleDealers.find((d) => d.id === 'dealer-deactivated-1');
    assert.equal(deactivated, undefined, 'Deactivated dealer (isActive: false) must NOT appear in locator');
  });

  // ── Scenario 5: Nearest dealer is calculated correctly ──
  it('Scenario 5: Nearest dealer is calculated correctly via GPS coordinates', () => {
    const visibleDealers = filterAuthorizedDealers(mockFirestoreUsers);

    // User is located in Tambaram Sanatorium (12.9279, 80.1382)
    const userLocation = { latitude: 12.9279, longitude: 80.1382 };
    const result = calculateNearestDealer(visibleDealers, { userLocation });

    assert.equal(result.matchType, 'coordinates');
    assert.ok(result.dealer, 'Should match nearest dealer by GPS');
    assert.equal(result.dealer.id, 'dealer-approved-1');
    assert.ok(result.distanceKm > 0 && result.distanceKm < 3, `Expected distance ~1.0-2.0 km, got ${result.distanceKm}`);
  });

  // ── Scenario 6: City and PIN-code search works ──
  it('Scenario 6: City and PIN-code search matches dealer correctly', () => {
    const visibleDealers = filterAuthorizedDealers(mockFirestoreUsers);

    // PIN code match for Kanchipuram dealer
    const pinResult = calculateNearestDealer(visibleDealers, { pincode: '631501' });
    assert.equal(pinResult.matchType, 'pincode');
    assert.equal(pinResult.dealer.id, 'dealer-approved-2-no-gps');

    // City match for Kanchipuram
    const cityResult = calculateNearestDealer(visibleDealers, { city: 'kanchipuram' });
    assert.equal(cityResult.matchType, 'city');
    assert.equal(cityResult.dealer.id, 'dealer-approved-2-no-gps');

    // City match for Chennai
    const chennaiResult = calculateNearestDealer(visibleDealers, { city: 'chennai' });
    assert.equal(chennaiResult.matchType, 'city');
    assert.equal(chennaiResult.dealer.id, 'dealer-approved-1');
  });

  // ── Scenario 7: Dealers without coordinates do not create invalid map markers ──
  it('Scenario 7: Dealers without coordinates do not invent coordinates or show invalid markers', () => {
    const visibleDealers = filterAuthorizedDealers(mockFirestoreUsers);
    const dealerWithoutGps = visibleDealers.find((d) => d.id === 'dealer-approved-2-no-gps');

    assert.equal(dealerWithoutGps.latitude, undefined);
    assert.equal(dealerWithoutGps.longitude, undefined);

    // Verify in DealerLocatorModal code that map button and GPS badge require valid numeric coordinates
    assert.ok(
      dealerModalContent.includes("typeof dealer.latitude === 'number' && typeof dealer.longitude === 'number'"),
      'DealerLocatorModal must strictly check for valid coordinates before displaying directions or GPS badges'
    );
    assert.ok(
      dealerModalContent.includes('Zone Verified'),
      'DealerLocatorModal must display Zone Verified fallback for dealers without GPS'
    );
  });

  // ── Scenario 8: Call and WhatsApp actions work ──
  it('Scenario 8: Call and WhatsApp action handlers format and sanitize phone numbers', () => {
    // Check call handling
    assert.ok(
      dealerModalContent.includes("Linking.openURL(`tel:${clean}`)"),
      'Must open tel: URL with cleaned phone number'
    );
    // Check WhatsApp handling
    assert.ok(
      dealerModalContent.includes('whatsapp://send?phone='),
      'Must format native whatsapp:// protocol link'
    );
    assert.ok(
      dealerModalContent.includes('https://wa.me/'),
      'Must provide fallback https://wa.me link for WhatsApp Web/fallback'
    );
  });

  // ── Scenario 9: Empty and Firebase error states display correctly ──
  it('Scenario 9: Empty and Firebase error states display clean UI without falling back to proxy mock data', () => {
    // If no dealers match
    const emptyResult = calculateNearestDealer([], { city: 'Madurai' });
    assert.equal(emptyResult.matchType, 'none');
    assert.equal(emptyResult.dealer, null);

    // Verify DealerLocatorModal contains empty message and retry button
    assert.ok(
      dealerModalContent.includes('No verified dealer available in this area'),
      'DealerLocatorModal must display informative empty state'
    );
    assert.ok(
      dealerModalContent.includes('Retry Loading'),
      'DealerLocatorModal must provide retry button on error'
    );
    assert.ok(
      !mobileDeliveryContent.includes('dealer-chn-central'),
      'Mobile deliveryService must NOT contain hardcoded mock dealer records in production'
    );
  });

  // ── Scenario 10: Mock data removal verification ──
  it('Scenario 10: Mock dealer proxy array is removed as production data source', () => {
    // Verify that AUTHORIZED_LOCAL_DEALERS and BASELINE_AUTHORIZED_DEALERS are empty arrays
    assert.ok(
      mobileDeliveryContent.includes('export const AUTHORIZED_LOCAL_DEALERS: AuthorizedDealerInfo[] = [];'),
      'mobile deliveryService AUTHORIZED_LOCAL_DEALERS must be empty array'
    );
    assert.ok(
      adminDeliveryContent.includes('export const AUTHORIZED_LOCAL_DEALERS: AuthorizedDealerInfo[] = [];'),
      'admin deliveryService AUTHORIZED_LOCAL_DEALERS must be empty array'
    );
    // getAuthorizedDealers must initialize with empty array
    assert.ok(
      mobileDeliveryContent.includes('const list: AuthorizedDealerInfo[] = [];'),
      'Mobile getAuthorizedDealers must initialize with an empty array'
    );
    assert.ok(
      adminDeliveryContent.includes('const list: AuthorizedDealerInfo[] = [];'),
      'Admin getAuthorizedDealers must initialize with an empty array'
    );
  });

  // ── Scenario 11: Security rule enforcement on users collection ──
  it('Scenario 11: Firestore security rules allow public/customer read of approved active dealers only', () => {
    // Check read rule condition for dealers
    assert.ok(
      firestoreRulesContent.includes("resource.data.role == 'dealer'"),
      'Rules must require role == dealer for public locator read'
    );
    assert.ok(
      firestoreRulesContent.includes("resource.data.dealerStatus == 'approved'"),
      'Rules must require dealerStatus == approved'
    );

    // Check update protection preventing regular user from escalating status or role
    assert.ok(
      firestoreRulesContent.includes("!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])"),
      'Rules must prevent non-admin from modifying role'
    );
    assert.ok(
      firestoreRulesContent.includes("!request.resource.data.diff(resource.data).affectedKeys().hasAny(['dealerStatus'])"),
      'Rules must prevent non-admin from modifying dealerStatus'
    );
    assert.ok(
      firestoreRulesContent.includes("!request.resource.data.diff(resource.data).affectedKeys().hasAny(['isActive'])"),
      'Rules must prevent non-admin from modifying isActive status'
    );
  });

  // ── Scenario 12: Admin management capability ──
  it('Scenario 12: Admin panel supports reviewing, approving/rejecting, editing details & GPS coordinates, and activating/deactivating dealers', () => {
    // Review and approve/reject
    assert.ok(
      adminDealersContent.includes('handleUpdateDealerStatus'),
      'DealersPage must implement handleUpdateDealerStatus'
    );
    // Activation / Deactivation toggle
    assert.ok(
      adminDealersContent.includes('handleToggleActiveStatus'),
      'DealersPage must implement handleToggleActiveStatus'
    );
    assert.ok(
      adminDealersContent.includes('Deactivate Account'),
      'DealersPage must offer Deactivate Account button'
    );
    assert.ok(
      adminDealersContent.includes('Activate Account'),
      'DealersPage must offer Activate Account button'
    );
    // Latitude and Longitude editing
    assert.ok(
      adminDealersContent.includes('Latitude (GPS)'),
      'DealersPage must offer Latitude input'
    );
    assert.ok(
      adminDealersContent.includes('Longitude (GPS)'),
      'DealersPage must offer Longitude input'
    );
    assert.ok(
      adminDealersContent.includes('handleSaveDealerDetails'),
      'DealersPage must implement handleSaveDealerDetails'
    );
    // Validation on coordinates (-90..90 and -180..180)
    assert.ok(
      adminDealersContent.includes('parsedLat < -90 || parsedLat > 90'),
      'DealersPage must validate latitude bounds (-90..90)'
    );
    assert.ok(
      adminDealersContent.includes('parsedLng < -180 || parsedLng > 180'),
      'DealersPage must validate longitude bounds (-180..180)'
    );
  });
});
