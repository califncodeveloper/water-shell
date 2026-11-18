import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ADMIN_SRC = path.join(ROOT_DIR, 'admin', 'src');

test('Admin Mobile Cards & Records Visibility Test Suite', async (t) => {
  await t.test('1. OrdersPage renders both desktop table and mobile card list', () => {
    const ordersTsx = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'orders', 'OrdersPage.tsx'), 'utf8');
    assert.match(ordersTsx, /op-table-view/, 'OrdersPage must render op-table-view for desktop screens');
    assert.match(ordersTsx, /op-card-list/, 'OrdersPage must render op-card-list for mobile screens');
    assert.match(ordersTsx, /op-order-card/, 'OrdersPage must render op-order-card items');
    assert.match(ordersTsx, /op-card-badges/, 'OrdersPage mobile card must display status & payment badges');
    assert.match(ordersTsx, /op-card-bottom/, 'OrdersPage mobile card must include bottom total and action trigger');

    const ordersCss = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'orders', 'OrdersPage.css'), 'utf8');
    assert.match(ordersCss, /\.op-card-list\s*\{[\s\S]*?display:\s*flex/, 'OrdersPage.css must display op-card-list on mobile screens');
  });

  await t.test('2. ServicePage renders both desktop table and mobile card list', () => {
    const serviceTsx = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'service', 'ServicePage.tsx'), 'utf8');
    assert.match(serviceTsx, /sp-table-view/, 'ServicePage must render sp-table-view for desktop screens');
    assert.match(serviceTsx, /sp-card-list/, 'ServicePage must render sp-card-list for mobile screens');
    assert.match(serviceTsx, /sp-card\s/, 'ServicePage must render sp-card items');
    assert.match(serviceTsx, /sp-card-slot/, 'ServicePage mobile card must display appointment slot');
    assert.match(serviceTsx, /sp-card-bottom/, 'ServicePage mobile card must include action buttons');

    const serviceCss = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'service', 'ServicePage.css'), 'utf8');
    assert.match(serviceCss, /\.sp-card-list\s*\{[\s\S]*?display:\s*flex/, 'ServicePage.css must display sp-card-list on mobile screens');
  });

  await t.test('3. DealersPage renders both desktop table and mobile card list', () => {
    const dealersTsx = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dealers', 'DealersPage.tsx'), 'utf8');
    assert.match(dealersTsx, /dp-table-view/, 'DealersPage must render dp-table-view for desktop screens');
    assert.match(dealersTsx, /dp-card-list/, 'DealersPage must render dp-card-list for mobile screens');
    assert.match(dealersTsx, /dp-card\s/, 'DealersPage must render dp-card items');
    assert.match(dealersTsx, /dp-card-info/, 'DealersPage mobile card must display contact & business information');
    assert.match(dealersTsx, /dp-actions/, 'DealersPage mobile card must include action buttons');

    const dealersCss = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dealers', 'DealersPage.css'), 'utf8');
    assert.match(dealersCss, /\.dp-card-list\s*\{[\s\S]*?display:\s*flex/, 'DealersPage.css must display dp-card-list on mobile screens');
  });
});
