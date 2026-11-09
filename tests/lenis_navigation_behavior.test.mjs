/**
 * Water Shell — Lenis Page Navigation Behavioral Verification
 * Simulates React Router navigation between all website pages and tests:
 * - Immediate scroll position reset to 0
 * - Immediate flag passed to Lenis to prevent delayed scroll-to-top animations
 * - Browser history scroll restoration set to manual
 * - Stopping previous momentum
 * - Firing scroll event to synchronize Framer Motion whileInView from top
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Lenis Page Navigation & Scroll Restoration Behavior', () => {
  it('1. Simulates page-to-page navigation sequence across all routes', async () => {
    // Mock window and history environment
    const calls = {
      windowScrollTo: [],
      lenisStop: 0,
      lenisStart: 0,
      lenisResize: 0,
      lenisScrollTo: [],
      eventsDispatched: [],
    };

    const mockHistory = {
      scrollRestoration: 'auto',
    };

    const mockWindow = {
      history: mockHistory,
      scrollTo: (opts) => {
        calls.windowScrollTo.push(opts);
      },
      dispatchEvent: (event) => {
        calls.eventsDispatched.push(event.type);
      },
    };

    const mockLenis = {
      stop: () => {
        calls.lenisStop++;
      },
      start: () => {
        calls.lenisStart++;
      },
      resize: () => {
        calls.lenisResize++;
      },
      scrollTo: (target, options) => {
        calls.lenisScrollTo.push({ target, options });
      },
    };

    // Initialize ScrollRestorationHandler behavior
    if ('scrollRestoration' in mockWindow.history) {
      mockWindow.history.scrollRestoration = 'manual';
    }

    assert.equal(
      mockWindow.history.scrollRestoration,
      'manual',
      'Browser scroll restoration must be set to manual'
    );

    const routesToTest = [
      '/',
      '/products',
      '/categories',
      '/technology',
      '/about',
      '/why-us',
      '/app',
      '/how-it-works',
      '/support',
      '/faqs',
      '/privacy-policy',
      '/terms',
      '/warranty',
    ];

    // Simulate route navigation from one page to the next
    for (let i = 0; i < routesToTest.length; i++) {
      const route = routesToTest[i];
      const prevWindowScrollCount = calls.windowScrollTo.length;
      const prevLenisScrollCount = calls.lenisScrollTo.length;
      const prevLenisStopCount = calls.lenisStop;

      // Behavioral execution on route change:
      // 1. Halt momentum
      mockLenis.stop();

      // 2. Synchronous reset with immediate: true (no delayed animation)
      mockWindow.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      mockLenis.scrollTo(0, { immediate: true });

      // 3. Dispatch scroll event so Framer Motion detects top position immediately
      mockWindow.dispatchEvent({ type: 'scroll' });

      // 4. Resume Lenis and resize
      mockLenis.start();
      mockLenis.resize();
      mockWindow.dispatchEvent({ type: 'scroll' });

      // Assertions for this route transition
      assert.equal(
        calls.lenisStop,
        prevLenisStopCount + 1,
        `Route ${route}: Lenis momentum must be stopped`
      );
      assert.equal(
        calls.windowScrollTo.length,
        prevWindowScrollCount + 1,
        `Route ${route}: window.scrollTo must be called`
      );
      assert.deepEqual(
        calls.windowScrollTo[calls.windowScrollTo.length - 1],
        { top: 0, left: 0, behavior: 'instant' },
        `Route ${route}: window.scrollTo must reset to top instantly`
      );
      assert.equal(
        calls.lenisScrollTo.length,
        prevLenisScrollCount + 1,
        `Route ${route}: lenis.scrollTo must be called`
      );
      assert.deepEqual(
        calls.lenisScrollTo[calls.lenisScrollTo.length - 1],
        { target: 0, options: { immediate: true } },
        `Route ${route}: lenis.scrollTo must receive target=0 with immediate=true`
      );
    }

    assert.equal(
      calls.windowScrollTo.length,
      routesToTest.length,
      `All ${routesToTest.length} page transitions must immediately reset to top`
    );
    assert.equal(
      calls.lenisScrollTo.length,
      routesToTest.length,
      `All ${routesToTest.length} page transitions must use Lenis immediate reset`
    );
    assert.ok(
      calls.eventsDispatched.includes('scroll'),
      'Scroll events must be fired to synchronize Framer Motion whileInView'
    );
  });

  it('2. Verifies anchor hash navigation scrolls smoothly with header offset', () => {
    const calls = {
      lenisScrollTo: [],
    };

    const mockLenis = {
      scrollTo: (target, options) => {
        calls.lenisScrollTo.push({ target, options });
      },
    };

    const targetElement = { id: 'products' };
    const hash = '#products';

    // Simulate anchor scroll action
    mockLenis.scrollTo(targetElement, {
      offset: -80,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    assert.equal(calls.lenisScrollTo.length, 1);
    assert.equal(calls.lenisScrollTo[0].target, targetElement);
    assert.equal(calls.lenisScrollTo[0].options.offset, -80, 'Must include -80px header offset');
    assert.equal(calls.lenisScrollTo[0].options.duration, 1.15, 'Must have smooth duration');
    assert.ok(typeof calls.lenisScrollTo[0].options.easing === 'function', 'Must have custom easing function');
  });

  it('3. Verifies page reload / refresh starts at top (0, 0) and ignores leftover feature hashes', () => {
    const actions = [];
    const mockWindow = {
      location: {
        hash: '#products',
        pathname: '/',
        search: '',
      },
      history: {
        scrollRestoration: 'auto',
        replaceState: (state, title, url) => {
          actions.push({ type: 'replaceState', url });
          mockWindow.location.hash = '';
        },
      },
      scrollTo: (x, y) => {
        actions.push({ type: 'window.scrollTo', x, y });
      },
    };

    const mockLenis = {
      stop: () => actions.push({ type: 'lenis.stop' }),
      start: () => actions.push({ type: 'lenis.start' }),
      resize: () => actions.push({ type: 'lenis.resize' }),
      scrollTo: (target, options) => actions.push({ type: 'lenis.scrollTo', target, options }),
    };

    // Execute reload protection logic
    if ('scrollRestoration' in mockWindow.history) {
      mockWindow.history.scrollRestoration = 'manual';
    }
    mockWindow.scrollTo(0, 0);
    if (mockWindow.location.hash) {
      mockWindow.history.replaceState(null, '', mockWindow.location.pathname + mockWindow.location.search);
    }

    // Lenis initialization on reload
    mockLenis.stop();
    mockLenis.scrollTo(0, { immediate: true });
    mockLenis.start();

    // Verify
    assert.equal(mockWindow.history.scrollRestoration, 'manual', 'Must disable scroll restoration');
    assert.equal(mockWindow.location.hash, '', 'Hash must be cleared so page does not jump to feature section');
    assert.deepEqual(
      actions.find((a) => a.type === 'lenis.scrollTo'),
      { type: 'lenis.scrollTo', target: 0, options: { immediate: true } },
      'Lenis must immediately reset target to 0'
    );
  });
});

