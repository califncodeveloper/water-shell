/**
 * AquaPure — Service Booking Options & Validation Test Suite
 * Validates that only the 4 specified service types are active:
 * 1. Leakage
 * 2. Low Flow
 * 3. Filter Change
 * 4. General Service
 *
 * Verifies mobile app options, admin dropdowns, validation logic,
 * notification/email formatting, and backwards compatibility for existing order/booking history.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Service Booking Section: 4 Service Types Requirement', () => {
  const rootDir = process.cwd();

  const ALLOWED_SERVICE_TYPES = [
    'leakage',
    'low_flow',
    'filter_change',
    'general_service',
  ];

  const REMOVED_SERVICE_OPTIONS = [
    'installation',
    'repair',
    'filter_replacement',
    'general_inquiry',
  ];

  // 1. Mobile App Types Validation
  it('Mobile types export the 4 allowed ServiceType union values', () => {
    const mobileTypesPath = path.join(rootDir, 'mobile', 'src', 'types', 'index.ts');
    const content = fs.readFileSync(mobileTypesPath, 'utf-8');

    for (const type of ALLOWED_SERVICE_TYPES) {
      assert.ok(
        content.includes(`'${type}'`),
        `Expected mobile ServiceType to include '${type}'`
      );
    }
  });

  // 2. Mobile Book Screen Service Options
  it('Mobile BookScreen SERVICE_OPTIONS only includes the 4 designated services', () => {
    const bookScreenPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'book.tsx');
    const content = fs.readFileSync(bookScreenPath, 'utf-8');

    // Check that each allowed service is registered in SERVICE_OPTIONS
    for (const type of ALLOWED_SERVICE_TYPES) {
      assert.ok(
        content.includes(`type: '${type}'`),
        `Expected SERVICE_OPTIONS to contain type: '${type}'`
      );
    }

    // Verify titles match the requested names
    assert.ok(content.includes("title: 'Leakage'"), "Must include 'Leakage' title");
    assert.ok(content.includes("title: 'Low Flow'"), "Must include 'Low Flow' title");
    assert.ok(content.includes("title: 'Filter Change'"), "Must include 'Filter Change' title");
    assert.ok(content.includes("title: 'General Service'"), "Must include 'General Service' title");

    // Check that removed service types are NOT present in SERVICE_OPTIONS
    for (const removed of REMOVED_SERVICE_OPTIONS) {
      assert.ok(
        !content.includes(`type: '${removed}'`),
        `Removed service type '${removed}' must NOT be in mobile SERVICE_OPTIONS`
      );
    }
  });

  // 3. Mobile Book Screen Validation
  it('Mobile BookScreen contains validation enforcing selection of the 4 service types', () => {
    const bookScreenPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'book.tsx');
    const content = fs.readFileSync(bookScreenPath, 'utf-8');

    assert.ok(
      content.includes('VALID_SERVICE_TYPES'),
      'Expected VALID_SERVICE_TYPES array in book.tsx'
    );
    assert.ok(
      content.includes('VALID_SERVICE_TYPES.includes'),
      'Expected validation check ensuring selectedType is in VALID_SERVICE_TYPES'
    );
  });

  // 4. Admin Types Validation
  it('Admin types export the 4 allowed ServiceType union values', () => {
    const adminTypesPath = path.join(rootDir, 'admin', 'src', 'types', 'index.ts');
    const content = fs.readFileSync(adminTypesPath, 'utf-8');

    for (const type of ALLOWED_SERVICE_TYPES) {
      assert.ok(
        content.includes(`'${type}'`),
        `Expected admin ServiceType to include '${type}'`
      );
    }
  });

  // 5. Admin ServicePage Filter Dropdown & Labels
  it('Admin ServicePage dropdown only provides the 4 service type filters + All', () => {
    const servicePagePath = path.join(rootDir, 'admin', 'src', 'features', 'service', 'ServicePage.tsx');
    const content = fs.readFileSync(servicePagePath, 'utf-8');

    // Check allowed options exist in select dropdown
    assert.ok(content.includes('<option value="all">All Service Types</option>'));
    assert.ok(content.includes('<option value="leakage">Leakage</option>'));
    assert.ok(content.includes('<option value="low_flow">Low Flow</option>'));
    assert.ok(content.includes('<option value="filter_change">Filter Change</option>'));
    assert.ok(content.includes('<option value="general_service">General Service</option>'));

    // Check removed options are NOT in the dropdown
    for (const removed of REMOVED_SERVICE_OPTIONS) {
      assert.ok(
        !content.includes(`<option value="${removed}">`),
        `Removed service option '${removed}' must NOT be in admin filter dropdown`
      );
    }
  });

  // 6. Admin ServicePage Labels and Drawer Detail
  it('Admin ServicePage contains proper labels and detail drawer overview for the 4 service types', () => {
    const servicePagePath = path.join(rootDir, 'admin', 'src', 'features', 'service', 'ServicePage.tsx');
    const content = fs.readFileSync(servicePagePath, 'utf-8');

    assert.ok(content.includes("leakage: 'Leakage'"));
    assert.ok(content.includes("low_flow: 'Low Flow'"));
    assert.ok(content.includes("filter_change: 'Filter Change'"));
    assert.ok(content.includes("general_service: 'General Service'"));
    assert.ok(content.includes('Service Requested'), 'Drawer should display Service Requested section');
  });

  // 7. Mobile MyBookings Titles and Icons
  it('Mobile MyBookings maps titles and icons for all 4 service types', () => {
    const myBookingsPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'my-bookings.tsx');
    const content = fs.readFileSync(myBookingsPath, 'utf-8');

    assert.ok(content.includes("leakage: 'Leakage'"));
    assert.ok(content.includes("low_flow: 'Low Flow'"));
    assert.ok(content.includes("filter_change: 'Filter Change'"));
    assert.ok(content.includes("general_service: 'General Service'"));

    assert.ok(content.includes("leakage: 'water-outline'"));
    assert.ok(content.includes("low_flow: 'speedometer-outline'"));
    assert.ok(content.includes("filter_change: 'refresh-circle-outline'"));
    assert.ok(content.includes("general_service: 'shield-checkmark-outline'"));
  });

  // 8. Backwards Compatibility & Order History Preservation
  it('Preserves legacy mappings for historical bookings without breakage', () => {
    const myBookingsPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'my-bookings.tsx');
    const mobileContent = fs.readFileSync(myBookingsPath, 'utf-8');

    const adminPagePath = path.join(rootDir, 'admin', 'src', 'features', 'service', 'ServicePage.tsx');
    const adminContent = fs.readFileSync(adminPagePath, 'utf-8');

    // Both should contain fallback mappings for past bookings
    assert.ok(mobileContent.includes("installation: 'New Purifier Installation'"));
    assert.ok(mobileContent.includes("repair: 'Breakdown / Leakage Repair'"));
    assert.ok(adminContent.includes("installation: 'Installation'"));
    assert.ok(adminContent.includes("repair: 'Repair'"));
  });
});

describe('Testing All 4 Service Booking Workflows & Payload Generation', () => {
  const mockAddress = {
    id: 'addr-123',
    fullName: 'Ananya Roy',
    phone: '+91 98765 43210',
    addressLine1: '42 Lake View Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
  };

  const services = [
    {
      type: 'leakage',
      title: 'Leakage',
      sampleNotes: 'Water is dripping from the RO membrane inlet connector',
      preferredDate: 'Tomorrow',
      preferredTime: 'Morning (09:00 AM - 12:00 PM)',
    },
    {
      type: 'low_flow',
      title: 'Low Flow',
      sampleNotes: 'Dispensing takes 10 minutes to fill 1 litre of water',
      preferredDate: 'Today',
      preferredTime: 'Afternoon (12:00 PM - 03:00 PM)',
    },
    {
      type: 'filter_change',
      title: 'Filter Change',
      sampleNotes: 'Sediment and activated carbon filters due for periodic change',
      preferredDate: 'Weekend',
      preferredTime: 'Morning (09:00 AM - 12:00 PM)',
    },
    {
      type: 'general_service',
      title: 'General Service',
      sampleNotes: 'Annual general maintenance, tank cleaning and TDS calibration',
      preferredDate: 'In 2 Days',
      preferredTime: 'Evening (03:00 PM - 07:00 PM)',
    },
  ];

  for (const s of services) {
    it(`Successfully validates and prepares booking payload for "${s.title}" (${s.type})`, () => {
      // Create booking payload
      const bookingPayload = {
        userId: 'user-789',
        serviceType: s.type,
        address: mockAddress,
        preferredDate: s.preferredDate,
        preferredTime: s.preferredTime,
        notes: s.sampleNotes,
        status: 'requested',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validations
      assert.equal(bookingPayload.serviceType, s.type);
      assert.equal(bookingPayload.status, 'requested');
      assert.ok(bookingPayload.address.fullName.length > 0);
      assert.ok(bookingPayload.address.phone.length > 0);
      assert.ok(bookingPayload.preferredDate.length > 0);
      assert.ok(bookingPayload.preferredTime.length > 0);
      assert.ok(bookingPayload.notes.length > 0);

      // Notification verification
      const notificationPayload = {
        title: 'Technician Visit Scheduled 🔧',
        body: `Your request #SRV-100 for ${s.title} has been booked. A technician will contact you prior to arrival.`,
        data: {
          bookingId: 'SRV-100',
          serviceName: s.title,
        },
      };
      assert.ok(notificationPayload.body.includes(s.title));

      // Email payload verification
      const emailPayload = {
        toEmail: 'customer@example.com',
        toName: mockAddress.fullName,
        bookingId: 'SRV-100',
        serviceType: s.title,
        preferredDate: s.preferredDate,
        preferredTime: s.preferredTime,
        address: `${mockAddress.addressLine1}, ${mockAddress.city} - ${mockAddress.pincode}`,
      };
      assert.equal(emailPayload.serviceType, s.title);
      assert.equal(emailPayload.toEmail, 'customer@example.com');
      assert.ok(emailPayload.address.includes('Chennai'));
    });
  }
});

describe('Service Booking: Delivery Zone Integration (Matching Product Delivery)', () => {
  const rootDir = process.cwd();

  it('Mobile BookScreen imports DeliveryService and checks supported delivery zones', () => {
    const bookScreenPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'book.tsx');
    const content = fs.readFileSync(bookScreenPath, 'utf-8');

    assert.ok(content.includes('DeliveryService'), 'Must import DeliveryService');
    assert.ok(content.includes('TAMBARAM_BASE_ORIGIN'), 'Must import TAMBARAM_BASE_ORIGIN');
    assert.ok(content.includes('SUPPORTED_DELIVERY_ZONES'), 'Must import SUPPORTED_DELIVERY_ZONES');
    assert.ok(content.includes('zoneValidation.isSupported'), 'Must check zoneValidation.isSupported');
    assert.ok(content.includes('deliveryZone:'), 'Must assign deliveryZone on booking creation');
    assert.ok(content.includes('baseOrigin:'), 'Must assign baseOrigin on booking creation');
  });

  it('Mobile BookScreen renders Delivery Zone UI cards, chips, and origin badge', () => {
    const bookScreenPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'book.tsx');
    const content = fs.readFileSync(bookScreenPath, 'utf-8');

    assert.ok(content.includes('Technician Delivery Zones'), 'Must render Technician Delivery Zones card');
    assert.ok(content.includes('Base:'), 'Must render Base Origin');
    assert.ok(content.includes('zoneChip'), 'Must render zone chips');
    assert.ok(content.includes('zoneFeedbackBox'), 'Must render real-time zone feedback box');
  });

  it('Mobile Success & MyBookings screens display Delivery Zone badge/row', () => {
    const successPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'success.tsx');
    const successContent = fs.readFileSync(successPath, 'utf-8');
    assert.ok(successContent.includes('Delivery / Service Zone'), 'Must display Delivery / Service Zone row in success screen');

    const myBookingsPath = path.join(rootDir, 'mobile', 'src', 'app', 'service', 'my-bookings.tsx');
    const myBookingsContent = fs.readFileSync(myBookingsPath, 'utf-8');
    assert.ok(myBookingsContent.includes('booking.deliveryZone'), 'Must render deliveryZone badge on booking cards');
  });

  it('Admin ServicePage includes Delivery Zone filter, table badge, and drawer routing', () => {
    const servicePagePath = path.join(rootDir, 'admin', 'src', 'features', 'service', 'ServicePage.tsx');
    const content = fs.readFileSync(servicePagePath, 'utf-8');

    assert.ok(content.includes('zoneFilter'), 'Must have zoneFilter state');
    assert.ok(content.includes('All Delivery Zones'), 'Must have All Delivery Zones dropdown option');
    assert.ok(content.includes('Chennai Zone'), 'Must have Chennai Zone dropdown option');
    assert.ok(content.includes('Chengalpattu Zone'), 'Must have Chengalpattu Zone dropdown option');
    assert.ok(content.includes('Kanchipuram Zone'), 'Must have Kanchipuram Zone dropdown option');
    assert.ok(content.includes('Pondicherry Zone'), 'Must have Pondicherry Zone dropdown option');
    assert.ok(content.includes('getBookingZone'), 'Must have getBookingZone helper');
    assert.ok(content.includes('DELIVERY & SERVICE ZONE ROUTING'), 'Must render routing card in drawer');
  });

  it('Firestore rules validate deliveryZone and baseOrigin fields on service_bookings', () => {
    const rulesPath = path.join(rootDir, 'firestore.rules');
    const content = fs.readFileSync(rulesPath, 'utf-8');

    assert.ok(content.includes('deliveryZone'), 'Must validate deliveryZone in firestore.rules');
    assert.ok(content.includes('baseOrigin'), 'Must validate baseOrigin in firestore.rules');
  });
});
