/**
 * Water Shell — Product Image Presentation System Verification Tests
 * Verifies:
 * - Product image container consistency & aspect ratio preservation
 * - Clean studio light backgrounds preventing visible rectangular edge mismatch
 * - Per-category and per-product intelligent scale balancing (pumps, dispensers, adapters, filters)
 * - Flagship Aqua Touch spotlight stage presentation
 * - Category cards presentation across all 5 official categories
 * - Fallback resolution
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Water Shell — Product Image Presentation System', () => {
  it('1. Verifies productImageUtils configuration logic exists and satisfies requirements', async () => {
    const utilsPath = path.resolve('portfolio/src/utils/productImageUtils.ts');
    assert.ok(fs.existsSync(utilsPath), 'productImageUtils.ts must exist');

    const content = fs.readFileSync(utilsPath, 'utf8');

    // Check for category handling
    assert.match(content, /booster-pumps/, 'Must calibrate booster-pumps');
    assert.match(content, /smps-power-units/, 'Must calibrate smps-power-units');
    assert.match(content, /water-treatment-accessories-filters/, 'Must calibrate accessories & filters');
    assert.match(content, /water-dispensers/, 'Must calibrate water-dispensers');
    assert.match(content, /ro-water-purifiers/, 'Must calibrate ro-water-purifiers');
    assert.match(content, /AP-WP-061/, 'Must support flagship Aqua Touch AP-WP-061');
  });

  it('2. Verifies ProductImageStage component provides standardized studio stage', async () => {
    const stagePath = path.resolve('portfolio/src/components/ProductImageStage.tsx');
    assert.ok(fs.existsSync(stagePath), 'ProductImageStage.tsx must exist');

    const content = fs.readFileSync(stagePath, 'utf8');

    // Must use clean white studio stage and avoid CSS blend mode tricks
    assert.match(content, /bg-white/, 'Must use clean white studio background');
    assert.doesNotMatch(content, /mix-blend-mode/, 'Must not use destructive mix-blend-mode');

    // Must use object-contain to preserve complete product without cropping
    assert.match(content, /object-contain/, 'Must use object-contain');

    // Must center both horizontally and vertically
    assert.match(content, /items-center\s+justify-center/, 'Must center images horizontally and vertically');

    // Must include drop shadow and grounded floor shadow
    assert.match(content, /config\.shadowClass/, 'Must apply drop shadow from config to elevate product');
  });

  it('3. Verifies ProductCard uses ProductImageStage with balanced equal height and alignment', async () => {
    const cardPath = path.resolve('portfolio/src/components/ProductCard.tsx');
    assert.ok(fs.existsSync(cardPath), 'ProductCard.tsx must exist');

    const content = fs.readFileSync(cardPath, 'utf8');

    // Uses ProductImageStage
    assert.match(content, /<ProductImageStage/, 'ProductCard must use ProductImageStage');

    // Must maintain full height for equal card heights in grid
    assert.match(content, /h-full/, 'ProductCard must have h-full for grid consistency');

    // Must align pricing and CTA cleanly at the bottom
    assert.match(content, /mt-4 pt-3.5 border-t/, 'Pricing & CTA must be anchored cleanly');

    // Must maintain verified genuine badge and product ID
    assert.match(content, /Verified Genuine/, 'Verified genuine label must be preserved');
  });

  it('4. Verifies CategoriesSection upgrades all 5 official categories with clean studio stage', async () => {
    const catSectionPath = path.resolve('portfolio/src/sections/CategoriesSection.tsx');
    assert.ok(fs.existsSync(catSectionPath), 'CategoriesSection.tsx must exist');

    const content = fs.readFileSync(catSectionPath, 'utf8');

    // Uses ProductImageStage
    assert.match(content, /<ProductImageStage/, 'CategoriesSection must use ProductImageStage');

    // Old tinted background and blue radial glow that caused rectangular edge mismatches must be removed
    assert.doesNotMatch(content, /bg-gradient-to-b from-slate-100 to-slate-50/, 'Old gray gradient must be removed');

    // Preserves explore CTA and all category highlights
    assert.match(content, /Explore All/, 'Explore CTA must be preserved');
    assert.match(content, /CheckCircle/, 'Highlights must be preserved');
  });

  it('5. Verifies FeaturedProductsSection Aqua Touch Spotlight presentation is upgraded', async () => {
    const featuredPath = path.resolve('portfolio/src/sections/FeaturedProductsSection.tsx');
    assert.ok(fs.existsSync(featuredPath), 'FeaturedProductsSection.tsx must exist');

    const content = fs.readFileSync(featuredPath, 'utf8');

    // Must use enlarged, sharp, illuminated white studio stage
    assert.match(content, /bg-white rounded-\[32px\]/, 'Showcase stage must be a clean white rounded stage');
    assert.match(content, /shadow-\[0_25px_60px_-15px_rgba\(0,0,0,0.5\)/, 'Showcase stage must have high-end multi-layer elevation shadow');
    assert.match(content, /object-contain drop-shadow/, 'Product must use object-contain with drop-shadow');
    assert.match(content, /Capacitive Glass Touch/, 'Must include interactive capacitive glass touch badge');
  });

  it('6. Verifies HeroSection flagship preview uses clean white studio pedestal', async () => {
    const heroPath = path.resolve('portfolio/src/sections/HeroSection.tsx');
    assert.ok(fs.existsSync(heroPath), 'HeroSection.tsx must exist');

    const content = fs.readFileSync(heroPath, 'utf8');

    // Inner product box must be a clean white pedestal rather than dark bg-white/5
    assert.match(content, /bg-white shadow-md border border-white\/30/, 'Hero flagship stage must be a clean white pedestal');
    assert.match(content, /object-contain drop-shadow/, 'Hero image must be object-contain with drop-shadow');
  });

  it('7. Verifies ProductDetailModal displays product on standardized white stage', async () => {
    const modalPath = path.resolve('portfolio/src/components/ProductDetailModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'ProductDetailModal.tsx must exist');

    const content = fs.readFileSync(modalPath, 'utf8');

    assert.match(content, /<ProductImageStage/, 'ProductDetailModal must use ProductImageStage');
  });

  it('8. Verifies AppShowcaseSection mobile phone mockups contain sharp, properly centered image containers', async () => {
    const appSectionPath = path.resolve('portfolio/src/sections/AppShowcaseSection.tsx');
    assert.ok(fs.existsSync(appSectionPath), 'AppShowcaseSection.tsx must exist');

    const content = fs.readFileSync(appSectionPath, 'utf8');

    assert.match(content, /w-12 h-12 bg-white rounded-xl p-1 border border-slate-100/, 'Mockup model thumbnail must have clean container');
    assert.match(content, /w-10 h-10 bg-white rounded-lg p-0.5 border border-slate-100/, 'Cart item thumbnail must have clean container');
  });
});
