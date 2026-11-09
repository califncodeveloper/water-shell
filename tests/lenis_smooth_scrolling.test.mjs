/**
 * Water Shell — Lenis Smooth Scrolling & Navigation Integration Test Suite
 *
 * Verifies:
 * 1. Correct Lenis integration with the existing Framer Motion animation & scrolling setup.
 * 2. Natural scrolling physics, easing functions, and RAF loop synchronization.
 * 3. Prevention of conflicts between Lenis, browser navigation, and React Router.
 * 4. Immediate display of new pages from top section (immediate: true, zero delayed scroll).
 * 5. Disabling of browser automatic scroll restoration (manual restoration).
 * 6. Clean start of scroll reveal animations from the beginning of each page.
 * 7. Support and consistency across all website routes/pages.
 * 8. data-lenis-prevent on modal containers to prevent scroll hijacking.
 * 9. Removal of conflicting native scroll-smooth CSS.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Lenis Smooth Scrolling & Navigation Suite', () => {
  const rootDir = process.cwd();

  it('1. Verifies Lenis dependency is installed in portfolio package.json', () => {
    const pkgPath = path.join(rootDir, 'portfolio', 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'portfolio/package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    assert.ok(pkg.dependencies['lenis'], 'Lenis must be a dependency in portfolio');
    assert.ok(pkg.dependencies['framer-motion'], 'Framer Motion must be installed');
    assert.ok(pkg.dependencies['react-router-dom'], 'React Router must be installed');
  });

  it('2. Verifies conflicting scroll-smooth CSS is removed from index.html', () => {
    const htmlPath = path.join(rootDir, 'portfolio', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf-8');

    // CSS scroll-behavior: smooth fights Lenis RAF loop, causing lag and jitter
    assert.ok(
      !content.includes('class="scroll-smooth"'),
      'index.html must not have class="scroll-smooth" which conflicts with Lenis'
    );
  });

  it('3. Verifies Lenis CSS styles and overrides in portfolio styles/index.css', () => {
    const cssPath = path.join(rootDir, 'portfolio', 'src', 'styles', 'index.css');
    const content = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(content.includes('lenis/dist/lenis.css'), 'Must import Lenis CSS bundle');
    assert.ok(content.includes('html.lenis'), 'Must include html.lenis rules');
    assert.ok(content.includes('.lenis.lenis-smooth'), 'Must include .lenis.lenis-smooth overrides');
    assert.ok(
      content.includes('scroll-behavior: auto !important'),
      'Must enforce scroll-behavior: auto !important to prevent browser conflict'
    );
    assert.ok(
      content.includes('[data-lenis-prevent]'),
      'Must support [data-lenis-prevent] for modal containers'
    );
  });

  it('4. Verifies SmoothScrollProvider architecture & Framer Motion synchronization', () => {
    const providerPath = path.join(rootDir, 'portfolio', 'src', 'providers', 'SmoothScrollProvider.tsx');
    assert.ok(fs.existsSync(providerPath), 'SmoothScrollProvider.tsx must exist');
    const content = fs.readFileSync(providerPath, 'utf-8');

    // Lenis instance creation & smooth physics
    assert.ok(content.includes('new Lenis'), 'Must instantiate Lenis');
    assert.ok(content.includes('smoothWheel: true'), 'Must enable smooth wheel physics');
    assert.ok(content.includes('requestAnimationFrame'), 'Must run Lenis on requestAnimationFrame');

    // Framer Motion & window scroll listener synchronization
    assert.ok(
      content.includes("window.dispatchEvent(new Event('scroll'))"),
      'Must dispatch window scroll events in sync with Lenis RAF loop'
    );
    assert.ok(content.includes("lenis.on('scroll'"), 'Must hook into Lenis scroll events');
  });

  it('5. Verifies immediate top display on page navigation (no retention, no delayed animation)', () => {
    const providerPath = path.join(rootDir, 'portfolio', 'src', 'providers', 'SmoothScrollProvider.tsx');
    const content = fs.readFileSync(providerPath, 'utf-8');

    // Browser manual scroll restoration
    assert.ok(
      content.includes("window.history.scrollRestoration = 'manual'"),
      'Must disable automatic browser scroll restoration to prevent conflicts'
    );

    // Stop momentum from previous page
    assert.ok(content.includes('lenis.stop()'), 'Must halt in-flight momentum immediately on route change');

    // Instant top reset with immediate: true (no unwanted delayed scroll-to-top)
    assert.ok(
      content.includes('lenis.scrollTo(0, { immediate: true })'),
      'Must immediately reset Lenis scroll position to top with immediate: true'
    );
    assert.ok(
      content.includes('window.scrollTo('),
      'Must synchronously reset window scroll coordinates'
    );

    // Next frame resize so scroll reveal animations start correctly from beginning
    assert.ok(content.includes('lenis.start()'), 'Must resume Lenis after DOM paints at top');
    assert.ok(content.includes('lenis.resize()'), 'Must recalculate document geometry on page change');
  });

  it('6. Verifies modal dialogs include data-lenis-prevent to isolate inner scrolling', () => {
    const productModal = fs.readFileSync(
      path.join(rootDir, 'portfolio', 'src', 'components', 'ProductDetailModal.tsx'),
      'utf-8'
    );
    const appModal = fs.readFileSync(
      path.join(rootDir, 'portfolio', 'src', 'components', 'AppDownloadModal.tsx'),
      'utf-8'
    );
    const legalModal = fs.readFileSync(
      path.join(rootDir, 'portfolio', 'src', 'components', 'LegalModals.tsx'),
      'utf-8'
    );

    assert.ok(
      productModal.includes('data-lenis-prevent'),
      'ProductDetailModal must have data-lenis-prevent'
    );
    assert.ok(
      appModal.includes('data-lenis-prevent'),
      'AppDownloadModal must have data-lenis-prevent'
    );
    assert.ok(
      legalModal.includes('data-lenis-prevent'),
      'LegalModals must have data-lenis-prevent'
    );
  });

  it('7. Verifies all website pages and routes are defined in portfolio/src/App.tsx', () => {
    const appPath = path.join(rootDir, 'portfolio', 'src', 'App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');

    // SmoothScrollProvider wraps AppContent
    assert.ok(content.includes('<SmoothScrollProvider>'), 'Must wrap app with SmoothScrollProvider');
    assert.ok(content.includes('<BrowserRouter>'), 'Must wrap app with BrowserRouter');

    // Page routes
    const expectedRoutes = [
      'path="/"',
      'path="/products"',
      'path="/categories"',
      'path="/technology"',
      'path="/about"',
      'path="/why-us"',
      'path="/app"',
      'path="/how-it-works"',
      'path="/support"',
      'path="/faqs"',
      'path="/privacy-policy"',
      'path="/terms"',
      'path="/warranty"',
      'path="*"',
    ];

    for (const route of expectedRoutes) {
      assert.ok(content.includes(route), `App.tsx must define route: ${route}`);
    }
  });

  it('8. Verifies dedicated page components exist and export valid React components', () => {
    const pageFiles = [
      'HomePage.tsx',
      'ProductsPage.tsx',
      'CategoriesPage.tsx',
      'TechnologyPage.tsx',
      'WhyUsPage.tsx',
      'AppShowcasePage.tsx',
      'HowItWorksPage.tsx',
      'SupportPage.tsx',
      'FAQPage.tsx',
      'LegalPage.tsx',
    ];

    for (const file of pageFiles) {
      const fullPath = path.join(rootDir, 'portfolio', 'src', 'pages', file);
      assert.ok(fs.existsSync(fullPath), `Page file ${file} must exist`);
      const content = fs.readFileSync(fullPath, 'utf-8');
      assert.ok(content.includes('export const'), `Page ${file} must export its component`);
    }
  });

  it('9. Verifies Navbar & Footer coordinate between Lenis smooth scrolling and React Router navigation', () => {
    const navbar = fs.readFileSync(
      path.join(rootDir, 'portfolio', 'src', 'components', 'Navbar.tsx'),
      'utf-8'
    );
    const footer = fs.readFileSync(
      path.join(rootDir, 'portfolio', 'src', 'components', 'Footer.tsx'),
      'utf-8'
    );

    // Navbar uses useSmoothScroll and useLocation
    assert.ok(navbar.includes('useSmoothScroll'), 'Navbar must consume useSmoothScroll');
    assert.ok(navbar.includes('useLocation'), 'Navbar must consume useLocation');
    assert.ok(navbar.includes('useNavigate'), 'Navbar must consume useNavigate');
    assert.ok(navbar.includes('scrollTo('), 'Navbar must trigger Lenis scrollTo for anchors');

    // Footer uses useSmoothScroll and Link
    assert.ok(footer.includes('useSmoothScroll'), 'Footer must consume useSmoothScroll');
    assert.ok(footer.includes('Link'), 'Footer must use React Router Link for legal policies');
    assert.ok(footer.includes('scrollTo('), 'Footer must trigger Lenis scrollTo');
  });

  it('10. Verifies admin portal also includes Lenis SmoothScrollProvider and CSS', () => {
    const adminAppPath = path.join(rootDir, 'admin', 'src', 'App.tsx');
    const adminCssPath = path.join(rootDir, 'admin', 'src', 'index.css');
    const adminProviderPath = path.join(rootDir, 'admin', 'src', 'components', 'SmoothScrollProvider.tsx');

    assert.ok(fs.existsSync(adminProviderPath), 'Admin SmoothScrollProvider must exist');

    const appContent = fs.readFileSync(adminAppPath, 'utf-8');
    assert.ok(
      appContent.includes('<SmoothScrollProvider>'),
      'Admin App.tsx must wrap routes with SmoothScrollProvider'
    );

    const cssContent = fs.readFileSync(adminCssPath, 'utf-8');
    assert.ok(
      cssContent.includes('.lenis.lenis-smooth'),
      'Admin index.css must contain Lenis smooth scrolling rules'
    );
  });
});

