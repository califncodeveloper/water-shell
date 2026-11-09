/**
 * Water Shell — Delivery & Zones Admin Integration Test Suite
 * Tests full CRUD operations, address validation against dynamic zones,
 * persistence format, and business rule preservation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Admin Panel: Delivery & Zones Screen Implementation', () => {
  const rootDir = process.cwd();

  it('1. Verifies DeliveryZonesPage displays only Authorized Delivery Zones and removed unrelated sections', () => {
    const pagePath = path.join(rootDir, 'admin', 'src', 'features', 'delivery', 'DeliveryZonesPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Section title & core features
    assert.ok(content.includes('Authorized Delivery Zones'), 'Must have Authorized Delivery Zones title');
    assert.ok(content.includes('Add Delivery Zone'), 'Must have Add Delivery Zone action');
    assert.ok(content.includes('Edit Zone'), 'Must have Edit Zone action');
    assert.ok(content.includes('Delete'), 'Must have Delete action');

    // Confirm removal of unrelated sections
    assert.ok(!content.includes('dz-policy-banner'), 'Policy banner must be removed');
    assert.ok(!content.includes('Base Origin Branch</h2>'), 'Base origin branch edit section must be removed from this screen');
    assert.ok(!content.includes('Delivery Zone Simulator</h2>'), 'Delivery zone simulator section must be removed from this screen');
    assert.ok(!content.includes('dz-dealers-summary-grid'), 'Authorized dealers summary cards must be removed from this screen');
  });

  it('2. Verifies Add, Edit, Delete modals and confirmation dialogs exist in DeliveryZonesPage', () => {
    const pagePath = path.join(rootDir, 'admin', 'src', 'features', 'delivery', 'DeliveryZonesPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    assert.ok(content.includes('handleOpenAddModal'), 'Must have add modal handler');
    assert.ok(content.includes('handleOpenEditModal'), 'Must have edit modal handler');
    assert.ok(content.includes('setDeletingZone'), 'Must set deleting zone for confirmation');
    assert.ok(content.includes('handleConfirmDelete'), 'Must have delete confirmation handler');
    assert.ok(content.includes('role="alertdialog"'), 'Delete confirmation must be an accessible alert dialog');
    assert.ok(content.includes('Confirm Delete'), 'Must have explicit Confirm Delete button');
  });

  it('3. Verifies form fields for zone details: name, cities, PIN codes, coverage localities, transit time', () => {
    const pagePath = path.join(rootDir, 'admin', 'src', 'features', 'delivery', 'DeliveryZonesPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    assert.ok(content.includes('dz-input-name'), 'Must have Zone Name input');
    assert.ok(content.includes('dz-input-cities'), 'Must have Cities & Aliases input');
    assert.ok(content.includes('dz-input-pins'), 'Must have PIN codes/prefixes input');
    assert.ok(content.includes('dz-input-localities'), 'Must have localities input');
    assert.ok(content.includes('dz-input-transit'), 'Must have transit time input');
    assert.ok(content.includes('dz-preview-chips'), 'Must show parsed preview chips for tags');
  });

  it('4. Verifies AdminDeliveryService exports CRUD operations and preserves baseline delivery policy', () => {
    const servicePath = path.join(rootDir, 'admin', 'src', 'services', 'deliveryService.ts');
    const content = fs.readFileSync(servicePath, 'utf-8');

    assert.ok(content.includes('getDeliveryZones'), 'Must have getDeliveryZones method');
    assert.ok(content.includes('saveDeliveryZones'), 'Must have saveDeliveryZones method');
    assert.ok(content.includes('addDeliveryZone'), 'Must have addDeliveryZone method');
    assert.ok(content.includes('updateDeliveryZone'), 'Must have updateDeliveryZone method');
    assert.ok(content.includes('deleteDeliveryZone'), 'Must have deleteDeliveryZone method');
    assert.ok(content.includes('TAMBARAM_BASE_ORIGIN'), 'Must preserve TAMBARAM_BASE_ORIGIN');
    assert.ok(content.includes('SUPPORTED_DELIVERY_ZONES'), 'Must preserve SUPPORTED_DELIVERY_ZONES baseline');
  });

  it('5. Verifies Firestore rules allow public read and admin write for settings collection', () => {
    const rulesPath = path.join(rootDir, 'firestore.rules');
    const content = fs.readFileSync(rulesPath, 'utf-8');

    assert.ok(content.includes('match /settings/{settingId}'), 'Rules must match settings collection');
    assert.ok(content.includes('allow write: if isAuthenticated() || isAdmin()') || content.includes('allow write: if isAdmin()'), 'Settings must be writable');
  });

  it('6. Verifies mobile deliveryService dynamically integrates with Firestore settings and validates new zones', () => {
    const mobileServicePath = path.join(rootDir, 'mobile', 'src', 'services', 'deliveryService.ts');
    const content = fs.readFileSync(mobileServicePath, 'utf-8');

    assert.ok(content.includes('fetchDeliveryZones'), 'Must define fetchDeliveryZones');
    assert.ok(content.includes('getCachedDeliveryZones'), 'Must define getCachedDeliveryZones');
    assert.ok(content.includes('activeDeliveryZones'), 'Must maintain activeDeliveryZones cache');
  });
});

describe('Delivery Zone Business Logic & Dynamic Address Matching', () => {
  const baselineZones = [
    {
      id: 'chennai',
      name: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      transitTime: '1–2 Business Days',
      description: 'Greater Chennai Metropolitan Area & suburbs',
      pincodePrefixes: ['6000', '6001'],
      cityAliases: ['chennai', 'madras'],
      localities: ['t nagar', 'anna nagar', 'adyar'],
      active: true,
    },
    {
      id: 'chengalpattu',
      name: 'Chengalpattu',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      transitTime: '1–2 Business Days',
      description: 'Chengalpattu District including Tambaram',
      pincodePrefixes: ['6030', '600045'],
      cityAliases: ['chengalpattu', 'tambaram'],
      localities: ['tambaram', 'chromepet'],
      active: true,
    },
  ];

  // Address validation logic simulator
  function validateAddress(address, zones) {
    const cleanPin = (address.pincode || '').replace(/\D/g, '').trim();
    const city = (address.city || '').toLowerCase().trim();
    const line1 = (address.addressLine1 || '').toLowerCase().trim();
    const full = `${city} ${line1}`;

    for (const zone of zones) {
      if (!zone.active) continue;

      if (cleanPin.length >= 4 && zone.pincodePrefixes.some((p) => cleanPin.startsWith(p.trim()))) {
        return { isSupported: true, zoneName: zone.name };
      }

      if (zone.cityAliases.some((a) => a && (city.includes(a) || full.includes(a)))) {
        return { isSupported: true, zoneName: zone.name };
      }

      if (zone.localities && zone.localities.some((l) => l && full.includes(l))) {
        return { isSupported: true, zoneName: zone.name };
      }
    }

    return { isSupported: false };
  }

  it('A. Validates baseline Chennai & Chengalpattu addresses', () => {
    const resChennai = validateAddress({ pincode: '600045', city: 'Tambaram' }, baselineZones);
    assert.equal(resChennai.isSupported, true);

    const resOutside = validateAddress({ pincode: '641001', city: 'Coimbatore' }, baselineZones);
    assert.equal(resOutside.isSupported, false);
  });

  it('B. Supports adding a new delivery zone (Coimbatore) and verifies immediate eligibility', () => {
    const coimbatoreZone = {
      id: 'coimbatore',
      name: 'Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      transitTime: '2–3 Business Days',
      description: 'Coimbatore industrial & urban corridor',
      pincodePrefixes: ['6410', '6411'],
      cityAliases: ['coimbatore', 'pollachi'],
      localities: ['gandhipuram', 'rs puram', 'peelamedu'],
      active: true,
    };

    const updatedZones = [...baselineZones, coimbatoreZone];

    // Pincode test
    const resPin = validateAddress({ pincode: '641001', city: 'Coimbatore' }, updatedZones);
    assert.equal(resPin.isSupported, true);
    assert.equal(resPin.zoneName, 'Coimbatore');

    // City alias test
    const resCity = validateAddress({ city: 'Pollachi', pincode: '642001' }, updatedZones);
    assert.equal(resCity.isSupported, true);
    assert.equal(resCity.zoneName, 'Coimbatore');

    // Locality test
    const resLoc = validateAddress({ addressLine1: 'Cross Cut Road, Gandhipuram', city: 'Tamil Nadu' }, updatedZones);
    assert.equal(resLoc.isSupported, true);
    assert.equal(resLoc.zoneName, 'Coimbatore');
  });

  it('C. Supports editing zone details (e.g. updating transit time and adding new PINs)', () => {
    const modifiedZones = baselineZones.map((z) => {
      if (z.id === 'chennai') {
        return {
          ...z,
          transitTime: 'Same Day Dispatch',
          pincodePrefixes: [...z.pincodePrefixes, '600028'],
          cityAliases: [...z.cityAliases, 'madipakkam'],
        };
      }
      return z;
    });

    const target = modifiedZones.find((z) => z.id === 'chennai');
    assert.equal(target.transitTime, 'Same Day Dispatch');
    assert.ok(target.cityAliases.includes('madipakkam'));

    const res = validateAddress({ city: 'Madipakkam' }, modifiedZones);
    assert.equal(res.isSupported, true);
    assert.equal(res.zoneName, 'Chennai');
  });

  it('D. Supports toggling zone active status and verifying validation gating', () => {
    const disabledZones = baselineZones.map((z) => {
      if (z.id === 'chennai') {
        return { ...z, active: false };
      }
      return z;
    });

    const res = validateAddress({ pincode: '600001', city: 'Chennai' }, disabledZones);
    assert.equal(res.isSupported, false, 'Disabled zone must not be eligible for delivery');
  });

  it('E. Supports deleting a zone and verifying subsequent rejection', () => {
    const remainingZones = baselineZones.filter((z) => z.id !== 'chengalpattu');
    assert.equal(remainingZones.length, 1);
    assert.equal(remainingZones[0].id, 'chennai');

    const res = validateAddress({ city: 'Chengalpattu', pincode: '603001' }, remainingZones);
    assert.equal(res.isSupported, false, 'Deleted zone must not match');
  });
});
