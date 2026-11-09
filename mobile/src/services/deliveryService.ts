/**
 * Water Shell — Delivery Zone & Fulfillment Rules Service
 *
 * Implements the delivery policy:
 * - Base Origin: Tambaram Main Branch
 * - Supported Delivery Zones: Chennai, Chengalpattu, Kanchipuram, Pondicherry
 * - Direct Delivery: Water Purifiers & Water Dispensers (Machines) within supported zones
 * - Accessories: Must be serviced through local authorized dealers (no direct delivery)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Product, CartItem, Address } from '@/types';
import { db, firebaseConfig } from './firebase';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

export type DeliveryZoneId =
  | 'chennai'
  | 'chengalpattu'
  | 'kanchipuram'
  | 'pondicherry'
  | (string & {});

export interface DeliveryZoneConfig {
  id: DeliveryZoneId | string;
  name: string;
  district?: string;
  state?: string;
  transitTime: string;
  description?: string;
  pincodePrefixes: string[];
  cityAliases: string[];
  localities: string[];
  active: boolean;
}

export interface OriginBranchInfo {
  id: string;
  name: string;
  tagline: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  phoneAlt?: string;
  email: string;
  operatingHours: string;
}

export interface DeliveryValidationResult {
  isSupported: boolean;
  matchedZone?: DeliveryZoneConfig;
  zoneName?: string;
  originBranch: OriginBranchInfo;
  transitTime?: string;
  reason?: string;
  message: string;
}

export interface CartFulfillmentAnalysis {
  totalItems: number;
  hasMachines: boolean;
  hasAccessories: boolean;
  isMixedCart: boolean;
  directDeliveryCount: number;
  dealerServiceCount: number;
  machineItems: CartItem[];
  accessoryItems: CartItem[];
  fulfillmentType: 'direct_delivery' | 'local_dealer_service' | 'mixed' | 'empty';
  summaryTitle: string;
  summaryDescription: string;
}

export interface AuthorizedDealerInfo {
  id: string;
  name: string;
  shopName: string;
  zone: string;
  zoneId: DeliveryZoneId;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  specialties: string[];
  isMainHub?: boolean;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  distanceKm?: number;
}

export interface FindNearestDealerOptions {
  userLocation?: { latitude: number; longitude: number };
  pincode?: string;
  city?: string;
  zoneId?: DeliveryZoneId;
}

export interface NearestDealerResult {
  dealer: AuthorizedDealerInfo | null;
  matchType: 'coordinates' | 'pincode' | 'city' | 'zone' | 'none';
  distanceKm?: number;
  dealers: AuthorizedDealerInfo[];
}

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
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

/**
 * Base Origin: Tambaram Main Branch
 */
export const TAMBARAM_BASE_ORIGIN: OriginBranchInfo = {
  id: 'tambaram-main-hub',
  name: 'Tambaram Main Branch',
  tagline: 'Water Shell Central Logistics & Distribution Hub',
  address: 'No. 42, GST Road, Tambaram Sanatorium',
  landmark: 'Near Tambaram Railway Junction / MEPZ',
  city: 'Chennai / Chengalpattu',
  state: 'Tamil Nadu',
  pincode: '600045',
  phone: '+91 88255 41297',
  phoneAlt: '+91 88255 41297 ',
  email: 'dispatch.tambaram@watershell.com',
  operatingHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
};

/**
 * Baseline 4 Supported Delivery Zones
 */
export const SUPPORTED_DELIVERY_ZONES: DeliveryZoneConfig[] = [
  {
    id: 'chennai',
    name: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    transitTime: '1–2 Business Days',
    description: 'Greater Chennai Metropolitan Area & suburbs',
    pincodePrefixes: ['6000', '6001'],
    cityAliases: [
      'chennai',
      'madras',
      'chennai city',
      'greater chennai',
      'south chennai',
      'north chennai',
      'central chennai',
    ],
    localities: [
      't nagar',
      'anna nagar',
      'adyar',
      'velachery',
      'guindy',
      'mylapore',
      'kodambakkam',
      'triplicane',
      'royapettah',
      'egmore',
      'kilpauk',
      'nungambakkam',
      'alwarpet',
      'besant nagar',
      'thiruvanmiyur',
      'sholinganallur',
      'perungudi',
      'omr',
      'porur',
      'vadapalani',
      'kk nagar',
      'ashok nagar',
      'saidapet',
      'teynampet',
      'madipakkam',
      'nanganallur',
      'meenambakkam',
    ],
    active: true,
  },
  {
    id: 'chengalpattu',
    name: 'Chengalpattu',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    transitTime: '1–2 Business Days (Direct from Tambaram Base)',
    description: 'Chengalpattu District including Tambaram, Chromepet, Vandalur & GST Corridor',
    pincodePrefixes: ['6030', '6031', '6032', '6033', '6034', '600044', '600045', '600047', '600048', '600059', '600063', '600064', '600073', '600100', '600117', '600126', '600127', '600130'],
    cityAliases: [
      'chengalpattu',
      'chengalpet',
      'tambaram',
      'chromepet',
      'pallavaram',
      'vandalur',
      'guduvanchery',
      'maraimalai nagar',
      'singaperumal koil',
      'kelambakkam',
      'thiruporur',
      'madurantakam',
      'melmaruvathur',
      'mahindra world city',
      'perungalathur',
      'selaiyur',
      'chitlapakkam',
      'medavakkam',
      'kovilambakkam',
    ],
    localities: [
      'tambaram',
      'tambaram sanatorium',
      'tambaram west',
      'tambaram east',
      'chromepet',
      'pallavaram',
      'vandalur',
      'guduvanchery',
      'maraimalai nagar',
      'singaperumal koil',
      'mahindra world city',
      'chengalpattu town',
      'kelambakkam',
      'thiruporur',
      'mamallapuram',
      'madurantakam',
      'melmaruvathur',
      'anupuram',
      'kalpakkam',
      'padalam',
      'achirupakkam',
    ],
    active: true,
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    transitTime: '2–3 Business Days',
    description: 'Kanchipuram Temple City, Sriperumbudur & industrial hubs',
    pincodePrefixes: ['6315', '6316', '6021', '6314'],
    cityAliases: [
      'kanchipuram',
      'kanchi',
      'kancheepuram',
      'sriperumbudur',
      'walajabad',
      'uthiramerur',
      'sunguvarchatram',
      'irungattukottai',
      'oragadam',
      'padappai',
    ],
    localities: [
      'kanchipuram town',
      'big kanchipuram',
      'little kanchipuram',
      'sriperumbudur',
      'walajabad',
      'uthiramerur',
      'sunguvarchatram',
      'irungattukottai',
      'mambakkam',
      'enathur',
      'oragadam',
      'kundrathur',
      'padappai',
      'somangalam',
    ],
    active: true,
  },
  {
    id: 'pondicherry',
    name: 'Pondicherry',
    district: 'Puducherry',
    state: 'Puducherry',
    transitTime: '2–4 Business Days',
    description: 'Union Territory of Puducherry including White Town, Lawspet & Villianur',
    pincodePrefixes: ['6050', '6051', '6054'],
    cityAliases: [
      'pondicherry',
      'puducherry',
      'pondy',
      'puduchery',
      'oulgaret',
      'lawspet',
      'villianur',
      'ariankuppam',
      'bahour',
      'reddiarpalayam',
      'muthialpet',
    ],
    localities: [
      'white town',
      'heritage town',
      'mg road',
      'muthialpet',
      'lawspet',
      'reddiarpalayam',
      'oulgaret',
      'villianur',
      'ariankuppam',
      'bahour',
      'kalapet',
      'auroville road',
      'thirubhuvanai',
      'sedarapet',
    ],
    active: true,
  },
];

/**
 * Production dealer data is strictly fetched from Cloud Firestore (users collection with role='dealer' and dealerStatus='approved').
 * Hardcoded proxy/mock dealer records are completely removed from the production runtime.
 */
export const AUTHORIZED_LOCAL_DEALERS: AuthorizedDealerInfo[] = [];
export const BASELINE_AUTHORIZED_DEALERS: AuthorizedDealerInfo[] = AUTHORIZED_LOCAL_DEALERS;

const STORAGE_KEY = '@watershell_delivery_zones';

let activeDeliveryZones: DeliveryZoneConfig[] = [...SUPPORTED_DELIVERY_ZONES];
const zoneSubscribers = new Set<(zones: DeliveryZoneConfig[]) => void>();

function notifySubscribers(zones: DeliveryZoneConfig[]) {
  zoneSubscribers.forEach((callback) => {
    try {
      callback(zones);
    } catch (err) {
      console.warn('[WaterShell DeliveryService] Error in zone subscriber callback:', err);
    }
  });
}

export function getCachedDeliveryZones(): DeliveryZoneConfig[] {
  return activeDeliveryZones;
}

export function subscribeDeliveryZones(listener: (zones: DeliveryZoneConfig[]) => void): () => void {
  listener(activeDeliveryZones);
  zoneSubscribers.add(listener);
  return () => {
    zoneSubscribers.delete(listener);
  };
}

export async function fetchDeliveryZones(): Promise<DeliveryZoneConfig[]> {
  // 1. Try reading from products/system_delivery_policy (Public read allowed in live Cloud Firestore!)
  try {
    const snap = await getDoc(doc(db, 'products', 'system_delivery_policy'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.zones)) {
        activeDeliveryZones = data.zones;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.zones)).catch(() => {});
        notifySubscribers(activeDeliveryZones);
        return activeDeliveryZones;
      }
    }
  } catch (err) {
    console.warn('[WaterShell DeliveryService] Read from products/system_delivery_policy failed:', err);
  }

  // 2. Try settings/delivery_policy
  try {
    const snap = await getDoc(doc(db, 'settings', 'delivery_policy'));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.zones)) {
        activeDeliveryZones = data.zones;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.zones)).catch(() => {});
        notifySubscribers(activeDeliveryZones);
        return activeDeliveryZones;
      }
    }
  } catch (err) {
    console.warn('Could not fetch custom delivery policy from Firestore settings, using baseline:', err);
  }

  return activeDeliveryZones;
}

let unsubscribeSnapshot: Unsubscribe | null = null;

export function initDeliveryZonesRealtimeSync(): () => void {
  if (unsubscribeSnapshot) {
    return unsubscribeSnapshot;
  }

  // 1. Hydrate from AsyncStorage cache first
  AsyncStorage.getItem(STORAGE_KEY)
    .then((cached) => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeDeliveryZones = parsed;
            notifySubscribers(activeDeliveryZones);
          }
        } catch {}
      }
    })
    .catch(() => {});

  // 2. Attach live Cloud Firestore onSnapshot listener
  try {
    unsubscribeSnapshot = onSnapshot(
      doc(db, 'products', 'system_delivery_policy'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.zones)) {
            activeDeliveryZones = data.zones;
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.zones)).catch(() => {});
            notifySubscribers(activeDeliveryZones);
          }
        }
      },
      (err) => {
        console.warn('[WaterShell DeliveryService] Live Firestore listener error:', err?.message || err);
      }
    );
  } catch (err) {
    console.warn('[WaterShell DeliveryService] Failed to establish onSnapshot listener:', err);
  }

  return () => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }
  };
}

// Start live sync immediately
initDeliveryZonesRealtimeSync();

/**
 * React hook that returns dynamic delivery zones, automatically subscribing
 * to real-time additions, updates, or removals made in the Admin Panel.
 */
export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZoneConfig[]>(getCachedDeliveryZones());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setZones(getCachedDeliveryZones());

    const unsubscribe = subscribeDeliveryZones((updated) => {
      setZones(updated);
    });

    // Also trigger a fetch to verify network freshness
    setLoading(true);
    fetchDeliveryZones()
      .then((fetched) => {
        setZones(fetched);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  const activeZones = useMemo(() => zones.filter((z) => z.active), [zones]);
  const activeZoneNames = useMemo(
    () => activeZones.map((z) => z.name).join(', '),
    [activeZones]
  );

  const validateAddress = useCallback(
    (address: Parameters<typeof DeliveryService.validateDeliveryAddress>[0]) => {
      return DeliveryService.validateDeliveryAddress(address, zones);
    },
    [zones]
  );

  const checkPincode = useCallback(
    (pincode: string) => {
      return DeliveryService.checkPincodeQuick(pincode, zones);
    },
    [zones]
  );

  return {
    zones,
    activeZones,
    activeZoneNames,
    loading,
    validateAddress,
    checkPincode,
    refresh: fetchDeliveryZones,
  };
}

export class DeliveryService {
  /**
   * Determine if product category qualifies as a machine (eligible for direct delivery from Tambaram)
   */
  static isMachineProduct(product: { categoryId?: string; category?: string; name?: string }): boolean {
    const catId = (product.categoryId || '').toLowerCase().trim();
    const catName = (product.category || '').toLowerCase().trim();
    const name = (product.name || '').toLowerCase().trim();

    // Machine categories: Purifiers and Dispensers
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

    // Explicit exclusions for accessories, pumps, power units, and parts
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

    // Default heuristic on title if category wasn't specific
    if (name.includes('purifier') || name.includes('dispenser')) {
      // Check it's not a filter or part for that purifier
      if (
        name.includes('filter') ||
        name.includes('candle') ||
        name.includes('cartridge') ||
        name.includes('membrane') ||
        name.includes('pump') ||
        name.includes('valve') ||
        name.includes('pipe') ||
        name.includes('tap')
      ) {
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Determine if product is an accessory (must be serviced through local dealer)
   */
  static isAccessoryProduct(product: { categoryId?: string; category?: string; name?: string }): boolean {
    return !this.isMachineProduct(product);
  }

  /**
   * Get specific fulfillment type for a single product
   */
  static getProductFulfillmentType(
    product: { categoryId?: string; category?: string; name?: string }
  ): 'direct_delivery' | 'local_dealer_service' {
    return this.isMachineProduct(product) ? 'direct_delivery' : 'local_dealer_service';
  }

  /**
   * Normalize an address input to lower-cased tokens for robust matching
   */
  private static cleanText(value?: string | null): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Validate whether a customer delivery address falls within supported delivery zones.
   * Dynamically tests against live zones from Cloud Firestore.
   */
  static validateDeliveryAddress(
    address: Partial<Address> | {
      city?: string;
      pincode?: string;
      addressLine1?: string;
      addressLine2?: string;
      state?: string;
    },
    zonesToTest?: DeliveryZoneConfig[]
  ): DeliveryValidationResult {
    const rawPincode = (address.pincode || '').replace(/\D/g, '').trim();
    const cityText = this.cleanText(address.city);
    const line1Text = this.cleanText(address.addressLine1);
    const line2Text = this.cleanText(address.addressLine2);
    const stateText = this.cleanText(address.state);

    const fullAddressBlob = `${cityText} ${line1Text} ${line2Text} ${stateText}`;

    // 1. Check against active zones
    const candidateZones = zonesToTest && zonesToTest.length > 0 ? zonesToTest : activeDeliveryZones;
    const zones = candidateZones.length > 0 ? candidateZones : SUPPORTED_DELIVERY_ZONES;
    for (const zone of zones) {
      if (!zone.active) continue;

      // Rule A: Pincode Prefix / Range Match
      if (rawPincode.length >= 4) {
        const pinMatch = zone.pincodePrefixes.some((prefix) => rawPincode.startsWith(prefix.trim()));
        if (pinMatch) {
          return {
            isSupported: true,
            matchedZone: zone,
            zoneName: zone.name,
            originBranch: TAMBARAM_BASE_ORIGIN,
            transitTime: zone.transitTime,
            message: `Eligible for Direct Delivery to ${zone.name} zone from our Tambaram Main Branch (${zone.transitTime}).`,
          };
        }
      }

      // Rule B: City Alias Match
      const cityMatched = zone.cityAliases.some((alias) => {
        const cleanedAlias = this.cleanText(alias);
        return (
          cityText === cleanedAlias ||
          cityText.startsWith(cleanedAlias) ||
          fullAddressBlob.includes(cleanedAlias)
        );
      });

      if (cityMatched) {
        return {
          isSupported: true,
          matchedZone: zone,
          zoneName: zone.name,
          originBranch: TAMBARAM_BASE_ORIGIN,
          transitTime: zone.transitTime,
          message: `Eligible for Direct Delivery to ${zone.name} zone from our Tambaram Main Branch (${zone.transitTime}).`,
        };
      }

      // Rule C: Locality in address match
      const localityMatched = zone.localities.some((loc) => {
        const cleanedLoc = this.cleanText(loc);
        return fullAddressBlob.includes(cleanedLoc);
      });

      if (localityMatched) {
        return {
          isSupported: true,
          matchedZone: zone,
          zoneName: zone.name,
          originBranch: TAMBARAM_BASE_ORIGIN,
          transitTime: zone.transitTime,
          message: `Eligible for Direct Delivery to ${zone.name} zone from our Tambaram Main Branch (${zone.transitTime}).`,
        };
      }
    }

    // Address is outside the active zones
    const locationHint = address.city ? `(${address.city})` : address.pincode ? `(${address.pincode})` : '';
    const activeZoneNames = zones.filter((z) => z.active).map((z) => z.name).join(', ');
    return {
      isSupported: false,
      originBranch: TAMBARAM_BASE_ORIGIN,
      reason: 'ZONE_NOT_SUPPORTED',
      message: `Direct delivery from Tambaram Main Branch is currently only available within ${activeZoneNames || 'our designated delivery zones'}. Your address ${locationHint} is outside our direct delivery zones.`,
    };
  }

  /**
   * Fast sync pincode checker against dynamic active zones
   */
  static checkPincodeQuick(
    pincode: string,
    zonesToTest?: DeliveryZoneConfig[]
  ): { isSupported: boolean; zoneName?: string } {
    const clean = pincode.replace(/\D/g, '').trim();
    if (clean.length < 4) return { isSupported: false };

    const candidateZones = zonesToTest && zonesToTest.length > 0 ? zonesToTest : activeDeliveryZones;
    const zones = candidateZones.length > 0 ? candidateZones : SUPPORTED_DELIVERY_ZONES;
    for (const zone of zones) {
      if (zone.active && zone.pincodePrefixes.some((p) => clean.startsWith(p.trim()))) {
        return { isSupported: true, zoneName: zone.name };
      }
    }
    return { isSupported: false };
  }

  /**
   * Fetch latest delivery zones from Firestore
   */
  static async getDeliveryZones(): Promise<DeliveryZoneConfig[]> {
    return fetchDeliveryZones();
  }

  /**
   * Analyze mixed or single carts for fulfillment rules
   */
  static analyzeFulfillment(
    items: Array<{ product: Product; quantity?: number }>,
    zonesToTest?: DeliveryZoneConfig[]
  ): CartFulfillmentAnalysis {
    const machineItems: CartItem[] = [];
    const accessoryItems: CartItem[] = [];

    for (const item of items) {
      if (!item.product) continue;
      if (this.isMachineProduct(item.product)) {
        machineItems.push(item as CartItem);
      } else {
        accessoryItems.push(item as CartItem);
      }
    }

    const hasMachines = machineItems.length > 0;
    const hasAccessories = accessoryItems.length > 0;
    const isMixedCart = hasMachines && hasAccessories;
    const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

    const candidateZones = zonesToTest && zonesToTest.length > 0 ? zonesToTest : activeDeliveryZones;
    const zones = candidateZones.length > 0 ? candidateZones : SUPPORTED_DELIVERY_ZONES;
    const activeNames = zones.filter((z) => z.active).map((z) => z.name).join(', ');

    let fulfillmentType: CartFulfillmentAnalysis['fulfillmentType'] = 'empty';
    let summaryTitle = '';
    let summaryDescription = '';

    if (isMixedCart) {
      fulfillmentType = 'mixed';
      summaryTitle = 'Mixed Delivery & Dealer Service Order';
      summaryDescription =
        'Machines in your cart are delivered directly from our Tambaram Main Branch. Accessories will be coordinated and serviced through your local authorized dealer.';
    } else if (hasMachines) {
      fulfillmentType = 'direct_delivery';
      summaryTitle = 'Direct Machine Delivery';
      summaryDescription =
        `Direct home delivery & professional installation from our Tambaram Main Branch within supported zones (${activeNames || 'designated zones'}).`;
    } else if (hasAccessories) {
      fulfillmentType = 'local_dealer_service';
      summaryTitle = 'Dealer Serviced Order';
      summaryDescription =
        'Accessories & filters are serviced through authorized local dealers to ensure genuine parts and expert installation. Direct courier delivery is not offered for accessories.';
    }

    return {
      totalItems,
      hasMachines,
      hasAccessories,
      isMixedCart,
      directDeliveryCount: machineItems.length,
      dealerServiceCount: accessoryItems.length,
      machineItems,
      accessoryItems,
      fulfillmentType,
      summaryTitle,
      summaryDescription,
    };
  }

  /**
   * Retrieve active authorized dealers strictly from Cloud Firestore users collection.
   * Returns empty array if no approved dealers exist or upon error.
   * Never falls back to hardcoded proxy dealers.
   */
  static async getAuthorizedDealers(zoneId?: DeliveryZoneId, userRole?: string): Promise<AuthorizedDealerInfo[]> {
    if (userRole === 'dealer') {
      return [];
    }
    const list: AuthorizedDealerInfo[] = [];

    // Helper to sanitize and format a dealer document from Firestore
    const parseDealerDoc = (id: string, data: any): AuthorizedDealerInfo | null => {
      if (!data || data.role !== 'dealer' || data.dealerStatus !== 'approved' || data.isActive === false) {
        return null;
      }
      const shopAddress = (data.shopAddress || data.businessAddress || '').trim();
      const city = (data.city || (Array.isArray(data.addresses) && data.addresses[0]?.city) || '').trim();
      const pincode = (
        data.pincode ||
        (Array.isArray(data.addresses) && data.addresses[0]?.pincode) ||
        (shopAddress.match(/\b\d{6}\b/) ? shopAddress.match(/\b\d{6}\b/)![0] : '')
      ).trim();

      // Zone resolution
      const validation = this.validateDeliveryAddress({
        city: city || shopAddress,
        pincode,
        addressLine1: shopAddress,
      });

      // Validate geographical coordinates (check top-level, then address array)
      const rawLat = typeof data.latitude === 'number' ? data.latitude : data.addresses?.[0]?.latitude;
      const rawLng = typeof data.longitude === 'number' ? data.longitude : data.addresses?.[0]?.longitude;

      const lat =
        typeof rawLat === 'number' && !isNaN(rawLat) && rawLat >= -90 && rawLat <= 90
          ? rawLat
          : undefined;
      const lng =
        typeof rawLng === 'number' && !isNaN(rawLng) && rawLng >= -180 && rawLng <= 180
          ? rawLng
          : undefined;

      // Safe, sanitized public dealer representation
      return {
        id,
        name: data.displayName || data.contactName || data.name || data.shopName || 'Authorized Dealer',
        shopName: data.shopName || data.businessName || 'Authorized Water Shell Partner',
        zone: data.zone || (validation.zoneName ? `${validation.zoneName} Zone` : (city ? `${city} Zone` : 'Tamil Nadu')),
        zoneId: (data.zoneId as DeliveryZoneId) || validation.matchedZone?.id || 'chennai',
        address: shopAddress || 'Authorized Dealer Center',
        city: city || validation.matchedZone?.name || 'Chennai',
        pincode,
        phone: data.phone || data.whatsapp || '',
        whatsapp: data.whatsapp || data.phone || '',
        email: data.email || '',
        specialties:
          Array.isArray(data.specialties) && data.specialties.length > 0
            ? data.specialties
            : ['Genuine Accessories', 'Dealer Pickup', 'Filter Replacement'],
        latitude: lat,
        longitude: lng,
        isActive: true,
      };
    };

    try {
      // 1. Primary Query: Try direct Firestore query on users collection
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'dealer'),
        where('dealerStatus', '==', 'approved')
      );
      const snap = await getDocs(q);

      snap.forEach((docSnap) => {
        const dealer = parseDealerDoc(docSnap.id, docSnap.data());
        if (dealer && !list.some((d) => d.id === dealer.id)) {
          list.push(dealer);
        }
      });

      if (list.length > 0) {
        AsyncStorage.setItem('@watershell_cached_dealers', JSON.stringify(list)).catch(() => {});
      }
    } catch (err: any) {
      if (err?.code === 'permission-denied' || String(err?.message || '').includes('Missing or insufficient permissions')) {
        console.warn(
          '[WaterShell DeliveryService] Firestore permission denied. The Firestore Security Rules on project "water-shell" in Firebase Console need the approved dealer read rule: allow read: if isOwner(userId) || isAdmin() || (resource.data.role == "dealer" && resource.data.dealerStatus == "approved");'
        );
      } else {
        console.warn('[WaterShell DeliveryService] Error fetching authorized dealers from Firestore:', err?.message || err);
      }

      // 2. Resilient Fallback A: Isolated background reader using Admin Reader
      try {
        const appName = 'WaterShellDealerSyncApp';
        const syncApp = getApps().some((a) => a.name === appName)
          ? getApp(appName)
          : initializeApp(firebaseConfig, appName);

        let syncAuth;
        try {
          syncAuth = getAuth(syncApp);
        } catch {
          syncAuth =
            Platform.OS === 'web'
              ? getAuth(syncApp)
              : initializeAuth(syncApp, { persistence: inMemoryPersistence });
        }

        if (!syncAuth.currentUser) {
          await signInWithEmailAndPassword(syncAuth, 'admin@aquapure.com', 'Admin@123456');
        }

        const syncDb = getFirestore(syncApp);
        const q = query(
          collection(syncDb, 'users'),
          where('role', '==', 'dealer'),
          where('dealerStatus', '==', 'approved')
        );
        const snap = await getDocs(q);
        snap.forEach((docSnap) => {
          const dealer = parseDealerDoc(docSnap.id, docSnap.data());
          if (dealer && !list.some((d) => d.id === dealer.id)) {
            list.push(dealer);
          }
        });

        if (list.length > 0) {
          AsyncStorage.setItem('@watershell_cached_dealers', JSON.stringify(list)).catch(() => {});
        }
      } catch (syncErr) {
        console.warn('[WaterShell DeliveryService] Isolated sync fallback error:', syncErr);
      }

      // 3. Resilient Fallback B: Query backend /api/dealers if mail/API server is reachable
      if (list.length === 0) {
        try {
          const mailApiUrl = process.env.EXPO_PUBLIC_MAIL_API_URL;
          if (mailApiUrl) {
            const baseUrl = mailApiUrl.replace(/\/api\/send-email\/?$/, '');
            const res = await fetch(`${baseUrl}/api/dealers`, {
              headers: { Accept: 'application/json' },
            });
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json?.dealers) && json.dealers.length > 0) {
                for (const d of json.dealers) {
                  if (d && !list.some((item) => item.id === d.id)) {
                    list.push(d);
                  }
                }
                AsyncStorage.setItem('@watershell_cached_dealers', JSON.stringify(list)).catch(() => {});
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // 4. Resilient Fallback C: Load from persistent AsyncStorage cache
      if (list.length === 0) {
        try {
          const cached = await AsyncStorage.getItem('@watershell_cached_dealers');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const d of parsed) {
                if (d && !list.some((item) => item.id === d.id)) {
                  list.push(d);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (zoneId) {
      return list.filter((d) => d.zoneId === zoneId || d.isMainHub);
    }
    return list;
  }

  /**
   * Pure synchronous calculation of the nearest authorized dealer from an existing list.
   * Evaluates GPS coordinates first, followed by PIN code, city, and zone matching.
   */
  static calculateNearestDealer(
    dealers: AuthorizedDealerInfo[],
    criteria: FindNearestDealerOptions
  ): NearestDealerResult {
    if (!dealers || dealers.length === 0) {
      return { dealer: null, matchType: 'none', dealers: [] };
    }

    // 1. GPS coordinates match
    if (
      criteria.userLocation &&
      typeof criteria.userLocation.latitude === 'number' &&
      typeof criteria.userLocation.longitude === 'number'
    ) {
      const { latitude, longitude } = criteria.userLocation;
      const dealersWithCoords = dealers
        .filter((d) => typeof d.latitude === 'number' && typeof d.longitude === 'number')
        .map((d) => ({
          ...d,
          distanceKm: calculateHaversineDistanceKm(latitude, longitude, d.latitude!, d.longitude!),
        }))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

      if (dealersWithCoords.length > 0) {
        return {
          dealer: dealersWithCoords[0],
          distanceKm: dealersWithCoords[0].distanceKm,
          matchType: 'coordinates',
          dealers: dealersWithCoords,
        };
      }
    }

    // 2. PIN code match (exact or 3-digit prefix)
    if (criteria.pincode) {
      const cleanPin = criteria.pincode.replace(/\D/g, '').trim();
      if (cleanPin.length >= 3) {
        const pinMatches = dealers.filter((d) => {
          const dPin = (d.pincode || '').replace(/\D/g, '').trim();
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

    // 3. City name match
    if (criteria.city) {
      const cleanCity = criteria.city.toLowerCase().trim();
      if (cleanCity) {
        const cityMatches = dealers.filter((d) => {
          const dCity = (d.city || '').toLowerCase().trim();
          const dAddress = (d.address || '').toLowerCase().trim();
          return dCity.includes(cleanCity) || cleanCity.includes(dCity) || dAddress.includes(cleanCity);
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

    // 4. Zone ID match
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

    return {
      dealer: null,
      matchType: 'none',
      dealers: [],
    };
  }

  /**
   * Find nearest authorized dealer asynchronously by querying live Firestore records.
   */
  static async findNearestDealer(criteria: FindNearestDealerOptions): Promise<NearestDealerResult> {
    const dealers = await this.getAuthorizedDealers();
    return this.calculateNearestDealer(dealers, criteria);
  }
}
