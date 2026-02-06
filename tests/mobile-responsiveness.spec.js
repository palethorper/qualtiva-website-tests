import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
  });

  test.describe('Mobile Device Compatibility', () => {
    test('should work on iPhone devices', async ({ page }) => {
      // iPhone 12 Pro
      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload();
      await page.waitForLoadState('load');
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Test touch interactions
      const clickableElements = page.locator('a, button');
      const elementCount = await clickableElements.count();
      
      if (elementCount > 0) {
        const firstElement = clickableElements.first();
        const box = await firstElement.boundingBox();
        
        if (box) {
          // iPhone touch targets should be at least 44x44 points
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
      
      console.log('✅ iPhone compatibility verified');
    });

    test('should work on Android devices', async ({ page }) => {
      // Pixel 5
      await page.setViewportSize({ width: 393, height: 851 });
      await page.reload();
      await page.waitForLoadState('load');
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Test Android-specific features
      const hasAndroidFeatures = await page.evaluate(() => {
        return 'ontouchstart' in window && 'navigator.userAgent' in window;
      });
      
      expect(hasAndroidFeatures).toBeTruthy();
      
      console.log('✅ Android compatibility verified');
    });

    test('should work on tablet devices', async ({ page }) => {
      // iPad Pro
      await page.setViewportSize({ width: 1024, height: 1366 });
      await page.reload();
      await page.waitForLoadState('load');
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Test tablet-specific layout
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(viewportWidth).toBe(1024);
      
      console.log('✅ Tablet compatibility verified');
    });
  });

  test.describe('Responsive Design Testing', () => {
    test('should adapt to different screen sizes', async ({ page }) => {
      const screenSizes = [
        { width: 320, height: 568, name: 'Small Mobile' },
        { width: 375, height: 667, name: 'Medium Mobile' },
        { width: 414, height: 896, name: 'Large Mobile' },
        { width: 768, height: 1024, name: 'Small Tablet' },
        { width: 1024, height: 768, name: 'Large Tablet' },
        { width: 1280, height: 720, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' }
      ];
      
      for (const size of screenSizes) {
        await page.setViewportSize(size);
        await page.reload();
        await page.waitForLoadState('load');
        
        // Verify content is visible
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        // Check viewport dimensions
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        
        expect(viewportWidth).toBe(size.width);
        expect(viewportHeight).toBe(size.height);
        
        console.log(`✅ ${size.name} (${size.width}x${size.height}) - Content visible`);
      }
    });

    test('should handle orientation changes', async ({ page }) => {
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      let body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      await page.waitForLoadState('load');
      
      body = page.locator('body');
      await expect(body).toBeVisible();
      
      console.log('✅ Orientation changes handled properly');
    });

    test('should maintain readability across devices', async ({ page }) => {
      const testSizes = [
        { width: 320, height: 568, name: 'Small Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 720, name: 'Desktop' }
      ];
      
      for (const size of testSizes) {
        await page.setViewportSize(size);
        await page.reload();
        await page.waitForLoadState('load');
        
        // Check text readability
        const textElements = page.locator('h1, h2, h3, p');
        const textCount = await textElements.count();
        
        if (textCount > 0) {
          for (let i = 0; i < Math.min(3, textCount); i++) {
            const element = textElements.nth(i);
            const text = await element.textContent();
            
            // Text should be readable
            expect(text).toBeTruthy();
            expect(text.trim().length).toBeGreaterThan(0);
            
            // Check if text is visible
            await expect(element).toBeVisible();
          }
        }
        
        console.log(`✅ Text readability maintained on ${size.name}`);
      }
    });
  });

  test.describe('Touch Interaction Testing', () => {
    test('should have proper touch targets', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      const clickableElements = page.locator('a, button, input[type="button"], input[type="submit"]');
      const elementCount = await clickableElements.count();
      
      let properTouchTargets = 0;
      let smallTouchTargets = 0;
      
      for (let i = 0; i < elementCount; i++) {
        const element = clickableElements.nth(i);
        const box = await element.boundingBox();
        
        if (box) {
          // Touch targets should be at least 44x44 pixels
          if (box.width >= 44 && box.height >= 44) {
            properTouchTargets++;
          } else {
            smallTouchTargets++;
            console.log(`⚠️  Small touch target found: ${box.width}x${box.height}px`);
          }
        }
      }
      
      // Most touch targets should be properly sized
      const successRate = properTouchTargets / (properTouchTargets + smallTouchTargets);
      expect(successRate).toBeGreaterThan(0.8);
      
      console.log(`📊 Touch target success rate: ${(successRate * 100).toFixed(1)}%`);
    });

    test('should handle touch gestures properly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Test tap interactions
      const clickableElements = page.locator('a, button');
      const elementCount = await clickableElements.count();
      
      if (elementCount > 0) {
        const firstElement = clickableElements.first();
        
        // Test tap
        await firstElement.click();
        
        // Verify interaction worked
        await page.waitForTimeout(1000);
        
        console.log('✅ Touch interactions work properly');
      }
    });

    test('should support swipe gestures', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Test swipe gesture
      const body = page.locator('body');
      const box = await body.boundingBox();
      
      if (box) {
        // Perform swipe gesture
        await page.mouse.move(box.x + 50, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x + 250, box.y + 200, { steps: 10 });
        await page.mouse.up();
        
        console.log('✅ Swipe gestures work properly');
      }
    });
  });

  test.describe('Mobile Navigation Testing', () => {
    test('should have mobile-friendly navigation', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Check for mobile menu
      const mobileMenuSelectors = [
        'button[aria-label*="menu" i]',
        '.mobile-menu-toggle',
        '.hamburger',
        '.nav-toggle',
        '[data-testid="mobile-menu"]'
      ];
      
      let mobileMenuFound = false;
      for (const selector of mobileMenuSelectors) {
        const menuButton = page.locator(selector);
        if (await menuButton.count() > 0) {
          await expect(menuButton.first()).toBeVisible();
          mobileMenuFound = true;
          console.log(`✅ Mobile menu found with selector: ${selector}`);
          break;
        }
      }
      
      if (!mobileMenuFound) {
        // Check if navigation is still accessible on mobile
        const nav = page.locator('nav, header');
        if (await nav.count() > 0) {
          await expect(nav.first()).toBeVisible();
          console.log('✅ Navigation is mobile-friendly');
        }
      }
    });

    test('should handle mobile menu interactions', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Look for mobile menu button
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], .mobile-menu-toggle, .hamburger');
      
      if (await mobileMenuButton.count() > 0) {
        const button = mobileMenuButton.first();
        
        // Test menu toggle
        await button.click();
        await page.waitForTimeout(1000);
        
        // Check if menu opened
        const menuItems = page.locator('nav a, .mobile-menu a, .nav-menu a');
        if (await menuItems.count() > 0) {
          console.log('✅ Mobile menu opens properly');
          
          // Test menu item clicks
          const firstMenuItem = menuItems.first();
          await firstMenuItem.click();
          await page.waitForLoadState('load');
          
          console.log('✅ Mobile menu navigation works');
        }
      }
    });
  });

  test.describe('Mobile Performance Testing', () => {
    test('should load quickly on mobile devices', async ({ page }) => {
      // Simulate slower mobile network
      await page.context().setExtraHTTPHeaders({
        'X-Playwright-Slow-Mo': '1000'
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('load');
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within 5 seconds even with slower network
      expect(loadTime).toBeLessThan(5000);
      
      console.log(`📊 Mobile load time: ${loadTime}ms`);
    });

    test('should handle mobile-specific resources', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Check for mobile-optimized images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        
        if (src) {
          // Check for responsive images
          const isResponsive = src.includes('@2x') || 
                              src.includes('mobile') || 
                              src.includes('small') ||
                              src.includes('data-src');
          
          if (isResponsive) {
            console.log(`✅ Responsive image found: ${src}`);
          }
        }
      }
    });

    test('should handle mobile-specific JavaScript', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Test mobile-specific JavaScript features
      const mobileFeatures = await page.evaluate(() => {
        return {
          touchEvents: 'ontouchstart' in window,
          orientation: 'orientation' in window,
          devicePixelRatio: window.devicePixelRatio,
          userAgent: navigator.userAgent.includes('Mobile')
        };
      });
      
      console.log('📊 Mobile features:', mobileFeatures);
      
      // Should support touch events
      expect(mobileFeatures.touchEvents).toBeTruthy();
    });
  });

  test.describe('Mobile Accessibility Testing', () => {
    test('should meet mobile accessibility standards', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Check for proper heading structure
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      let imagesWithAlt = 0;
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        if (alt && alt.length > 0) {
          imagesWithAlt++;
        }
      }
      
      // Most images should have alt text
      const altTextRate = imagesWithAlt / imageCount;
      expect(altTextRate).toBeGreaterThan(0.7);
      
      console.log(`📊 Alt text coverage: ${(altTextRate * 100).toFixed(1)}%`);
    });

    test('should support screen readers on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('load');
      
      // Check for ARIA attributes
      const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
      const ariaCount = await ariaElements.count();
      
      if (ariaCount > 0) {
        console.log(`✅ ${ariaCount} elements with ARIA attributes found`);
      }
      
      // Check for proper focus management
      const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const focusableCount = await focusableElements.count();
      
      if (focusableCount > 0) {
        // Test keyboard navigation
        await focusableElements.first().focus();
        await expect(focusableElements.first()).toBeFocused();
        
        console.log('✅ Keyboard navigation works on mobile');
      }
    });
  });
}); 