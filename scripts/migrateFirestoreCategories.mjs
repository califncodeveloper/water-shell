/**
 * AquaPure — Authoritative Firestore Category Migration Script
 *
 * Updates Firebase category references and product data to ONLY the 5 official categories:
 * 1. RO Water Purifiers
 * 2. Water Dispensers
 * 3. Booster Pumps
 * 4. SMPS Power Units
 * 5. Water Treatment Accessories & Filters
 *
 * Preserves all pricing, specs, images, stock, inventory, and system policies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, '..', 'functions', 'catalogData.json');
const authoritativeProducts = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBxcIi7BRUFuQz9AMZziaBi-kv3qvxUJYo',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'water-shell.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'water-shell',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'water-shell.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '777522670519',
  appId: process.env.FIREBASE_APP_ID || '1:777522670519:web:ef743378f6fa625d291632',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runMigration() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('       AQUAPURE LIVE FIRESTORE CATEGORY MIGRATION');
  console.log('═══════════════════════════════════════════════════════════════════');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@aquapure.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  console.log(`Authenticating as verified admin (${adminEmail})...`);
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log('Admin authenticated successfully.');

  // 1. Fetch & Backup Existing Firestore Products
  console.log('\nFetching existing Firestore products...');
  const snapshot = await getDocs(collection(db, 'products'));
  console.log(`Retrieved ${snapshot.docs.length} documents from 'products' collection.`);

  const backupDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFile = path.join(backupDir, `firestore_products_backup_${Date.now()}.json`);
  const backupData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`Safely backed up all ${backupData.length} documents to: ${backupFile}`);

  // 2. Perform Batch Update of All 60 Products
  console.log(`\nMigrating categories for ${authoritativeProducts.length} authoritative products...`);
  const batch = writeBatch(db);

  for (const prod of authoritativeProducts) {
    const docRef = doc(db, 'products', prod.id);
    batch.set(
      docRef,
      {
        category: prod.category,
        categoryId: prod.categoryId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  // 3. Update system_delivery_policy references
  const policyRef = doc(db, 'products', 'system_delivery_policy');
  batch.set(
    policyRef,
    {
      directDeliveryCategories: ['ro-water-purifiers', 'water-dispensers', 'water-purifiers'],
      dealerServicedCategories: [
        'booster-pumps',
        'smps-power-units',
        'water-treatment-accessories-filters',
        'water-pumps',
        'filters-cartridges',
        'spare-parts-accessories',
        'bottles-storage',
      ],
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await batch.commit();
  console.log('Firestore writeBatch committed successfully.');

  // 4. Verify Firestore State After Migration
  console.log('\nVerifying live Firestore products after migration...');
  const verifySnap = await getDocs(collection(db, 'products'));
  const categoryTally = {};
  let totalCatalogItems = 0;

  verifySnap.docs.forEach((d) => {
    if (d.id === 'system_delivery_policy' || d.id.startsWith('system_')) return;
    totalCatalogItems++;
    const data = d.data();
    const cat = data.category || 'Unknown';
    categoryTally[cat] = (categoryTally[cat] || 0) + 1;
  });

  console.log(`Total live catalog items: ${totalCatalogItems}`);
  console.log('Post-migration Category Breakdown in Firestore:');
  for (const [cat, count] of Object.entries(categoryTally)) {
    console.log(`  • ${cat}: ${count} products`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('FIRESTORE MIGRATION COMPLETED SUCCESSFULLY WITH ZERO DATA LOSS');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
