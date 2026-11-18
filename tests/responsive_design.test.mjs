import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PORTFOLIO_SRC = path.join(ROOT_DIR, 'portfolio', 'src');

test('Responsive Design & Mobile Optimization Test Suite', async (t) => {
  await t.test('1. Global overflow protection and viewport setup in CSS and App wrapper', () => {
    const cssPath = path.join(PORTFOLIO_SRC, 'styles', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Ensure overflow-x is hidden and max-width is constrained
    assert.match(cssContent, /overflow-x:\s*hidden/, 'index.css must declare overflow-x: hidden on html, body');
    assert.match(cssContent, /max-width:\s*100vw/, 'index.css must limit max-width to 100vw');

    const appPath = path.join(PORTFOLIO_SRC, 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');
    assert.match(appContent, /overflow-x-hidden/, 'App.tsx root wrapper must include overflow-x-hidden');
  });

  await t.test('2. Mobile-friendly navigation with responsive drawer, touch targets and no CTA collisions', () => {
    const navbarPath = path.join(PORTFOLIO_SRC, 'components', 'Navbar.tsx');
    const navbarContent = fs.readFileSync(navbarPath, 'utf8');

    // Check mobile hamburger trigger button and label
    assert.match(navbarContent, /aria-label="Toggle Navigation Menu"/i, 'Navbar must provide accessible mobile menu toggle');
    assert.match(navbarContent, /mobileMenuOpen/, 'Navbar must track mobile menu drawer state');

    // Check tablet/desktop CTA layout does not have duplicate button overlap
    assert.doesNotMatch(navbarContent, /md:flex lg:hidden items-center gap-2/, 'Navbar should not duplicate desktop CTAs on tablet');

    // Check mobile drawer handles scrolling and close on navigation
    assert.match(navbarContent, /overflow-y-auto/, 'Mobile menu drawer must allow inner vertical scroll on short screens');
    assert.match(navbarContent, /setMobileMenuOpen\(false\)/, 'Mobile menu drawer must close upon selecting route or pressing Escape');
  });

  await t.test('3. Mobile Image Positioning Rule: AboutSection renders image between title and description on mobile, side-by-side on desktop', () => {
    const aboutPath = path.join(PORTFOLIO_SRC, 'sections', 'AboutSection.tsx');
    const aboutContent = fs.readFileSync(aboutPath, 'utf8');

    // Desktop original layout preserved (left column)
    assert.match(aboutContent, /hidden lg:block lg:col-span-5/, 'AboutSection must preserve original desktop layout in 5-col side column');

    // Mobile: visual story card positioned between title and description
    assert.match(aboutContent, /block lg:hidden my-6/, 'AboutSection must render visual story card on mobile');

    // Confirm that the mobile image div appears after the <h2> title and before the <p> description
    const titleIndex = aboutContent.indexOf('<h2 className="text-2xl sm:text-3xl lg:text-4xl');
    const mobileImageIndex = aboutContent.indexOf('block lg:hidden my-6');
    const descIndex = aboutContent.indexOf('At Water Shell, we recognize that water purification');

    assert.ok(titleIndex !== -1, 'Title <h2> must exist');
    assert.ok(mobileImageIndex !== -1, 'Mobile image card must exist');
    assert.ok(descIndex !== -1, 'Description <p> must exist');
    assert.ok(
      titleIndex < mobileImageIndex && mobileImageIndex < descIndex,
      'On mobile, the visual image card must be positioned between the section title and description'
    );
  });

  await t.test('4. Mobile Image Positioning Rule: FeaturedProductsSection renders Aqua Touch stage between title and description on mobile, right column on desktop', () => {
    const featuredPath = path.join(PORTFOLIO_SRC, 'sections', 'FeaturedProductsSection.tsx');
    const featuredContent = fs.readFileSync(featuredPath, 'utf8');

    // Desktop original layout preserved (right column)
    assert.match(featuredContent, /hidden lg:flex lg:col-span-5/, 'FeaturedProductsSection must preserve original desktop layout in right column');

    // Mobile: stage image positioned between title and description
    assert.match(featuredContent, /flex lg:hidden justify-center my-6/, 'FeaturedProductsSection must render Aqua Touch stage on mobile');

    // Confirm that the mobile stage appears after the spotlight title and before the description
    const spotlightTitleIndex = featuredContent.indexOf('Aqua Touch Smart RO Purifier');
    const mobileStageIndex = featuredContent.indexOf('flex lg:hidden justify-center my-6');
    const spotlightDescIndex = featuredContent.indexOf('{aquaTouch.description}');

    assert.ok(spotlightTitleIndex !== -1, 'Spotlight title must exist');
    assert.ok(mobileStageIndex !== -1, 'Mobile spotlight stage must exist');
    assert.ok(spotlightDescIndex !== -1, 'Spotlight description must exist');
    assert.ok(
      spotlightTitleIndex < mobileStageIndex && mobileStageIndex < spotlightDescIndex,
      'On mobile, the spotlight product stage must be positioned between the title and description'
    );
  });

  await t.test('5. Mobile Image Positioning Rule: AppShowcaseSection renders phone mockup between title and description on mobile, right column on desktop', () => {
    const appSectionPath = path.join(PORTFOLIO_SRC, 'sections', 'AppShowcaseSection.tsx');
    const appSectionContent = fs.readFileSync(appSectionPath, 'utf8');

    // Desktop original layout preserved (right column)
    assert.match(appSectionContent, /hidden lg:flex lg:col-span-5 flex-col items-center/, 'AppShowcaseSection must preserve original desktop layout in 5-col right column');

    // Mobile: phone device mockup positioned between section title and description
    assert.match(appSectionContent, /block lg:hidden my-8/, 'AppShowcaseSection must render phone mockup on mobile');

    const appTitleIndex = appSectionContent.indexOf('The Water Shell Mobile App');
    const mobileMockupIndex = appSectionContent.indexOf('block lg:hidden my-8');
    const appDescIndex = appSectionContent.indexOf('Water purification at your fingertips');

    assert.ok(appTitleIndex !== -1, 'App showcase title must exist');
    assert.ok(mobileMockupIndex !== -1, 'Mobile phone mockup must exist');
    assert.ok(appDescIndex !== -1, 'App showcase description must exist');
    assert.ok(
      appTitleIndex < mobileMockupIndex && mobileMockupIndex < appDescIndex,
      'On mobile, the phone mockup must be positioned between the section title and description'
    );
  });

  await t.test('6. Mobile Image Positioning Rule: ProductDetailModal renders product stage between title and description on mobile, 2-column on desktop', () => {
    const modalPath = path.join(PORTFOLIO_SRC, 'components', 'ProductDetailModal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf8');

    // Desktop preserves 2-column layout
    assert.match(modalContent, /grid grid-cols-1 md:grid-cols-2/, 'ProductDetailModal must provide responsive grid layout');

    // Mobile: product header is placed above the image stage, while desktop header is inside column 2
    assert.match(modalContent, /block md:hidden space-y-1/, 'ProductDetailModal must render mobile product header above stage');
    assert.match(modalContent, /hidden md:block space-y-1/, 'ProductDetailModal must render desktop product header inside side column');

    const mobileHeaderIndex = modalContent.indexOf('block md:hidden space-y-1');
    const imageStageIndex = modalContent.indexOf('<ProductImageStage');
    const descIndex = modalContent.indexOf('{product.description}');

    assert.ok(mobileHeaderIndex !== -1, 'Mobile header must exist in modal');
    assert.ok(imageStageIndex !== -1, 'ProductImageStage must exist in modal');
    assert.ok(descIndex !== -1, 'Product description must exist in modal');
    assert.ok(
      mobileHeaderIndex < imageStageIndex && imageStageIndex < descIndex,
      'In ProductDetailModal on mobile, the product image stage must be positioned between the mobile title and description'
    );
  });

  await t.test('7. HeroSection explicitly retains its hero composition and does not alter image position', () => {
    const heroPath = path.join(PORTFOLIO_SRC, 'sections', 'HeroSection.tsx');
    const heroContent = fs.readFileSync(heroPath, 'utf8');

    // As per user rule: "Do not apply this image positioning rule to hero sections. Preserve the original desktop layouts."
    // Hero maintains its 2-column grid layout with flagship preview
    assert.match(heroContent, /grid grid-cols-1 lg:grid-cols-12/, 'HeroSection preserves its responsive grid structure');
    assert.match(heroContent, /lg:col-span-7/, 'HeroSection preserves copy column');
    assert.match(heroContent, /lg:col-span-5/, 'HeroSection preserves visual stage preview column');
  });

  await t.test('8. Responsive typography, button stacking, and modal height constraints across mobile breakpoints', () => {
    const heroPath = path.join(PORTFOLIO_SRC, 'sections', 'HeroSection.tsx');
    const heroContent = fs.readFileSync(heroPath, 'utf8');
    assert.match(heroContent, /text-3xl sm:text-5xl lg:text-6xl/, 'Hero typography scales from mobile (text-3xl) to desktop (text-6xl)');
    assert.match(heroContent, /flex-col sm:flex-row/, 'Hero CTA buttons stack vertically on mobile and horizontally on tablet/desktop');

    const downloadModalPath = path.join(PORTFOLIO_SRC, 'components', 'AppDownloadModal.tsx');
    const downloadModalContent = fs.readFileSync(downloadModalPath, 'utf8');
    assert.match(downloadModalContent, /max-h-\[90vh\]/, 'AppDownloadModal is constrained to 90vh on mobile');
    assert.match(downloadModalContent, /overflow-y-auto/, 'AppDownloadModal content area enables smooth scrolling');

    const legalModalPath = path.join(PORTFOLIO_SRC, 'components', 'LegalModals.tsx');
    const legalModalContent = fs.readFileSync(legalModalPath, 'utf8');
    assert.match(legalModalContent, /max-h-\[85vh\]/, 'LegalModals are constrained to 85vh on mobile');
  });
});
