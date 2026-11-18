import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ADMIN_SRC = path.join(ROOT_DIR, 'admin', 'src');

test('Admin Dashboard Mobile Responsiveness Test Suite', async (t) => {
  await t.test('1. Global overflow and viewport constraints in admin index.css and AdminLayout.css', () => {
    const indexCss = fs.readFileSync(path.join(ADMIN_SRC, 'index.css'), 'utf8');
    assert.match(indexCss, /overflow-x:\s*hidden/, 'index.css must restrict horizontal overflow on html/body');
    assert.match(indexCss, /max-width:\s*100vw/, 'index.css must constrain max-width to 100vw');

    const layoutCss = fs.readFileSync(path.join(ADMIN_SRC, 'components', 'AdminLayout.css'), 'utf8');
    assert.match(layoutCss, /\.admin-layout\s*\{[\s\S]*?max-width:\s*100vw/, 'AdminLayout must restrict layout width to 100vw');
    assert.match(layoutCss, /\.admin-main\s*\{[\s\S]*?max-width:\s*100%/, 'AdminLayout main container must not stretch page');
    assert.match(layoutCss, /\.admin-main\s*\{[\s\S]*?max-width:\s*100vw/, 'Mobile admin-main must clamp to 100vw');
  });

  await t.test('2. Mobile layout navigation bar and drawer toggle behavior', () => {
    const layoutTsx = fs.readFileSync(path.join(ADMIN_SRC, 'components', 'AdminLayout.tsx'), 'utf8');
    assert.match(layoutTsx, /mobile-topbar/, 'AdminLayout must include mobile topbar');
    assert.match(layoutTsx, /mobile-menu-btn/, 'AdminLayout must include accessible mobile menu button');
    assert.match(layoutTsx, /sidebar-backdrop/, 'AdminLayout must include touch backdrop to close drawer');
  });

  await t.test('3. Dashboard main grid collapses to single column on mobile and tablet', () => {
    const dashboardTsx = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dashboard', 'Dashboard.tsx'), 'utf8');
    assert.match(dashboardTsx, /dashboard-main-grid/, 'Dashboard must use dashboard-main-grid class instead of fixed inline 2fr/1fr');

    const dashboardCss = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dashboard', 'Dashboard.css'), 'utf8');
    assert.match(dashboardCss, /\.dashboard\s+\.dashboard-main-grid\s*\{[\s\S]*?grid-template-columns/, 'dashboard-main-grid must define default 2-col desktop layout');
    assert.match(dashboardCss, /dashboard-main-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/, 'dashboard-main-grid must collapse to 1-col on tablet/mobile screens');
  });

  await t.test('4. Primary and secondary KPI grids collapse gracefully across breakpoints', () => {
    const dashboardCss = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dashboard', 'Dashboard.css'), 'utf8');
    assert.match(dashboardCss, /kpi-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/, 'kpi-grid must collapse to 2 columns on tablet');
    assert.match(dashboardCss, /kpi-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/, 'kpi-grid must collapse to 1 column on mobile phones');

    assert.match(dashboardCss, /secondary-kpi-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/, 'secondary-kpi-grid must collapse to 2 columns on tablet');
    assert.match(dashboardCss, /secondary-kpi-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/, 'secondary-kpi-grid must collapse to 1 column on mobile phones');
  });

  await t.test('5. Recent Live Orders table has responsive scrollable container and mobile header', () => {
    const dashboardTsx = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dashboard', 'Dashboard.tsx'), 'utf8');
    assert.match(dashboardTsx, /dashboard-table-container/, 'Dashboard must wrap table in dashboard-table-container');
    assert.match(dashboardTsx, /dashboard-section-header/, 'Dashboard must use dashboard-section-header');

    const dashboardCss = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dashboard', 'Dashboard.css'), 'utf8');
    assert.match(dashboardCss, /dashboard-table-container\s*\{[\s\S]*?overflow-x:\s*auto/, 'dashboard-table-container must enable horizontal scrolling');
    assert.match(dashboardCss, /dashboard-table-container\s*\{[\s\S]*?-webkit-overflow-scrolling:\s*touch/, 'dashboard-table-container must use smooth touch scrolling');
    assert.match(dashboardCss, /dashboard-table\s*\{[\s\S]*?min-width:\s*600px/, 'dashboard-table must maintain minimum width for column clarity');
  });

  await t.test('6. Dashboard title row and status badge wrap flexibly without overflow', () => {
    const dashboardTsx = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dashboard', 'Dashboard.tsx'), 'utf8');
    assert.match(dashboardTsx, /dashboard-title-row/, 'Dashboard header must use dashboard-title-row');
    assert.match(dashboardTsx, /live-status-badge/, 'Dashboard header must use live-status-badge');

    const dashboardCss = fs.readFileSync(path.join(ADMIN_SRC, 'features', 'dashboard', 'Dashboard.css'), 'utf8');
    assert.match(dashboardCss, /dashboard-title-row\s*\{[\s\S]*?flex-wrap:\s*wrap/, 'dashboard-title-row must wrap on narrow screens');
  });
});
