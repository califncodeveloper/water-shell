/**
 * Seed & Fix Authorized Dealers in live Firestore (water-shell)
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxcIi7BRUFuQz9AMZziaBi-kv3qvxUJYo",
  authDomain: "water-shell.firebaseapp.com",
  projectId: "water-shell",
  storageBucket: "water-shell.firebasestorage.app",
  messagingSenderId: "777522670519",
  appId: "1:777522670519:web:ef743378f6fa625d291632",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DEALERS_TO_SYNC = [
  {
    uid: 'dealer_chennai_aquatech',
    displayName: 'AquaTech Water Solutions',
    shopName: 'AquaTech Authorized Sales & Care',
    businessName: 'AquaTech Authorized Sales & Care',
    role: 'dealer',
    dealerStatus: 'approved',
    isActive: true,
    email: 'aquatech.tnagar@watershell.com',
    phone: '+91 44 2434 7711',
    whatsapp: '+91 94441 55220',
    shopAddress: '18/4, Usman Road, Panagal Park, T. Nagar',
    city: 'Chennai',
    pincode: '600017',
    zone: 'Chennai Central Zone',
    zoneId: 'chennai',
    latitude: 13.0418,
    longitude: 80.2341,
    specialties: ['Filter Replacement', 'Spare Parts', 'Booster Pumps', 'Annual Maintenance'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'pmE5YTfmPJgdFWYCbPGz0fYDAr92', // Existing Demo dealer in Chengalpattu
    displayName: 'Demowater Sales & Care',
    shopName: 'Demowater',
    businessName: 'Demowater',
    role: 'dealer',
    dealerStatus: 'approved',
    isActive: true,
    email: 'Demowater@gmail.com',
    phone: '+91 796310975',
    whatsapp: '+91 796310975',
    shopAddress: '6, CN Mahadevan Street, Gokulapuram, Chengalpattu, Tamil Nadu – 603001',
    city: 'Chengalpattu',
    pincode: '603001',
    zone: 'Chengalpattu Zone',
    zoneId: 'chengalpattu',
    latitude: 12.6921,
    longitude: 79.9835,
    specialties: ['Local Dealer Pick-up', 'Replacement Filters', 'UV & UF Cartridges'],
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'dealer_kanchipuram_srikanchi',
    displayName: 'Sri Kanchi Pure Water Hub',
    shopName: 'Sri Kanchi Water Purifier Services',
    businessName: 'Sri Kanchi Water Purifier Services',
    role: 'dealer',
    dealerStatus: 'approved',
    isActive: true,
    email: 'kanchi.spares@watershell.com',
    phone: '+91 44 2722 4433',
    whatsapp: '+91 94432 11998',
    shopAddress: '24, Gandhi Road, Near Bus Terminus, Kanchipuram',
    city: 'Kanchipuram',
    pincode: '631501',
    zone: 'Kanchipuram Zone',
    zoneId: 'kanchipuram',
    latitude: 12.8342,
    longitude: 79.7036,
    specialties: ['Hard Water RO Filters', 'Dealer Counter Pickup', 'Replacement Cartridges'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'dealer_pondicherry_auro',
    displayName: 'Auro Aqua Systems',
    shopName: 'Auro Aqua Tech & Spares',
    businessName: 'Auro Aqua Tech & Spares',
    role: 'dealer',
    dealerStatus: 'approved',
    isActive: true,
    email: 'auro.pondy@watershell.com',
    phone: '+91 413 222 5590',
    whatsapp: '+91 98423 33110',
    shopAddress: '45, Mission Street, Heritage Town, Pondicherry',
    city: 'Pondicherry',
    pincode: '605001',
    zone: 'Pondicherry Zone',
    zoneId: 'pondicherry',
    latitude: 11.9348,
    longitude: 79.8306,
    specialties: ['Coastal Water Purification', 'Genuine Membrane Spares', 'UV Chamber Service'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'GRkgdjh5mQRFZCZLCJ2CU4kTg4p2', // Existing Suresh Patel
    displayName: 'Suresh Patel',
    shopName: 'Apex Water Solutions',
    businessName: 'Apex Water',
    role: 'dealer',
    dealerStatus: 'approved',
    isActive: true,
    email: 'apex@gmail.com',
    phone: '+91 8007610904',
    whatsapp: '+91 8007610904',
    shopAddress: 'Royal complex link road, Pandharpur, Maharashtra – 413304',
    city: 'Pandharpur',
    pincode: '413304',
    zone: 'Chennai Central Zone',
    zoneId: 'chennai',
    latitude: 17.6854,
    longitude: 75.3063,
    specialties: ['Genuine Accessories', 'Dealer Pickup', 'Filter Replacement'],
    updatedAt: new Date().toISOString(),
  }
];

async function syncDealers() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@aquapure.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  console.log(`Authenticating as admin (${adminEmail})...`);
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log('Authenticated! Syncing dealers to Firestore users collection...');

  for (const dealer of DEALERS_TO_SYNC) {
    const userRef = doc(db, 'users', dealer.uid);
    await setDoc(userRef, dealer, { merge: true });
    console.log(`✓ Synced dealer: ${dealer.shopName} (${dealer.uid}) in ${dealer.city}`);
  }

  console.log('All dealers successfully seeded and enriched in Firestore!');
  process.exit(0);
}

syncDealers().catch((err) => {
  console.error('Failed to sync dealers:', err);
  process.exit(1);
});
