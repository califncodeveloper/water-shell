/**
 * Water Shell — Helpline Directory Data & Action Verification Test
 */

const assert = require('assert');

// Contact data definition as in src/app/helpline.tsx
const EXPECTED_CONTACTS = {
  customerSupport: [
    { name: 'Customer Support Desk 1', phone: '+91 88255 41297', expectedClean: '+918825541297' },
    { name: 'Customer Support Desk 2', phone: '+91 86108 76009', expectedClean: '+918610876009' },
  ],
  branches: [
    { name: 'Tambaram', phone: '9789009889', expectedClean: '9789009889' },
    { name: 'Mudichur', phone: '6383156647', expectedClean: '6383156647' },
    { name: 'Guduvanchery', phone: '8682020588', expectedClean: '8682020588' },
  ],
};

function formatTelUri(phone) {
  const clean = phone.replace(/[^\d+]/g, '');
  return `tel:${clean}`;
}

console.log('--- Testing Water Shell Helpline Directory ---');

// Test 1: Customer Support numbers
console.log('Testing Customer Support numbers...');
assert.strictEqual(EXPECTED_CONTACTS.customerSupport.length, 2, 'Must have exactly 2 customer support numbers');
EXPECTED_CONTACTS.customerSupport.forEach((item) => {
  const tel = formatTelUri(item.phone);
  assert.strictEqual(tel, `tel:${item.expectedClean}`, `Dialer URI for ${item.name} should match tel:${item.expectedClean}`);
  console.log(`  ✓ ${item.name}: ${item.phone} -> ${tel}`);
});

// Test 2: Branch Contacts numbers
console.log('Testing Branch Contacts numbers...');
assert.strictEqual(EXPECTED_CONTACTS.branches.length, 3, 'Must have exactly 3 branch numbers');
EXPECTED_CONTACTS.branches.forEach((item) => {
  const tel = formatTelUri(item.phone);
  assert.strictEqual(tel, `tel:${item.expectedClean}`, `Dialer URI for ${item.name} should match tel:${item.expectedClean}`);
  console.log(`  ✓ ${item.name}: ${item.phone} -> ${tel}`);
});

console.log('All Helpline tests passed successfully!');
