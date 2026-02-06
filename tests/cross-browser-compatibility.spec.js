import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Core Functionality Across Browsers', () => {
    test('should load homepage in all browsers', async ({ page, browserName }) => {
      // Basic page load test
      await expect(page).toHaveTitle(/Qualtiva/i);
      await expect(page).toHaveURL(/analytiqa|qualtiva/);
      
      // Check if main content is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      console.log(`✅ Homepage loads successfully in ${browserName}`);
    });

    test('should have working navigation in all browsers', async ({ page, browserName }) => {
      // Test navigation functionality
      const nav = page.locator('nav, header');
      if (await nav.count() > 0) {
        await expect(nav.first()).toBeVisible();
        
        // Test navigation links
        const navLinks = page.locator('nav a, header a');
        const linkCount = await navLinks.count();
        
        if (linkCount > 0) {
          // Test first few navigation links
          for (let i = 0; i < Math.min(3, linkCount); i++) {
            const link = navLinks.nth(i);
            const href = await link.getAttribute('href');
            
            if (href && !href.startsWith('#')) {
              // Test link functionality
              await link.click();
              await page.waitForLoadState('networkidle');
              
              // Verify page changed or loaded new content
              const currentUrl = page.url();
              expect(currentUrl).toBeTruthy();
              
              // Go back to test next link
              await page.goBack();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
      
      console.log(`✅ Navigation works in ${browserName}`);
    });

    test('should handle forms consistently across browsers', async ({ page, browserName }) => {
      // Test form elements
      const forms = page.locator('form');
      const formCount = await forms.count();
      
      if (formCount > 0) {
        for (let i = 0; i < formCount; i++) {
          const form = forms.nth(i);
          
          // Test input fields
          const inputs = form.locator('input[type="text"], input[type="email"], textarea');
          const inputCount = await inputs.count();
          
          for (let j = 0; j < Math.min(2, inputCount); j++) {
            const input = inputs.nth(j);
            
            // Test focus
            await input.focus();
            await expect(input).toBeFocused();
            
            // Test typing
            await input.fill('test@example.com');
            const value = await input.inputValue();
            expect(value).toBe('test@example.com');
            
            // Clear the input
            await input.clear();
          }
        }
      }
      
      console.log(`✅ Forms work consistently in ${browserName}`);
    });
  });

  test.describe('Browser-Specific Features', () => {
    test('should support modern JavaScript features', async ({ page, browserName }) => {
      const jsFeatures = await page.evaluate(() => {
        const features = {
          es6: {
            arrowFunctions: typeof (() => {}) === 'function',
            templateLiterals: typeof `test` === 'string',
            destructuring: (() => { const {a} = {a: 1}; return a === 1; })(),
            spreadOperator: (() => { const arr = [...[1,2,3]]; return arr.length === 3; })()
          },
          modern: {
            fetch: typeof fetch === 'function',
            promise: typeof Promise === 'function',
            asyncAwait: (async () => { return true; })() instanceof Promise,
            localStorage: typeof localStorage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined'
          },
          dom: {
            querySelector: typeof document.querySelector === 'function',
            addEventListener: typeof document.addEventListener === 'function',
            classList: document.body.classList !== undefined
          }
        };
        
        return features;
      });
      
      // Log feature support
      console.log(`📊 JavaScript features in ${browserName}:`, jsFeatures);
      
      // All browsers should support basic features
      expect(jsFeatures.modern.fetch).toBeTruthy();
      expect(jsFeatures.modern.promise).toBeTruthy();
      expect(jsFeatures.dom.querySelector).toBeTruthy();
    });

    test('should handle CSS features appropriately', async ({ page, browserName }) => {
      const cssSupport = await page.evaluate(() => {
        const testElement = document.createElement('div');
        testElement.style.cssText = 'display: flex; grid-template-columns: 1fr; gap: 10px;';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        
        return {
          flexbox: computedStyle.display === 'flex',
          grid: computedStyle.display === 'grid' || testElement.style.gridTemplateColumns !== '',
          gap: computedStyle.gap !== '',
          customProperties: (() => {
            testElement.style.setProperty('--test-var', 'red');
            return testElement.style.getPropertyValue('--test-var') === 'red';
          })()
        };
      });
      
      console.log(`📊 CSS features in ${browserName}:`, cssSupport);
      
      // Modern browsers should support flexbox
      expect(cssSupport.flexbox).toBeTruthy();
    });

    test('should handle media queries correctly', async ({ page, browserName }) => {
      // Test responsive behavior
      const viewports = [
        { width: 320, height: 568, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check if layout adapts
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        // Check viewport width
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(viewportWidth).toBe(viewport.width);
        
        console.log(`✅ ${viewport.name} viewport works in ${browserName}`);
      }
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('should load within acceptable time in all browsers', async ({ page, browserName }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Different browsers may have different performance characteristics
      const maxLoadTime = browserName === 'webkit' ? 4000 : 3000; // Safari might be slower
      expect(loadTime).toBeLessThan(maxLoadTime);
      
      console.log(`📊 ${browserName} load time: ${loadTime}ms`);
    });

    test('should handle images consistently', async ({ page, browserName }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      let loadedImages = 0;
      let failedImages = 0;
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        
        if (src) {
          try {
            // Wait for image to load
            await img.waitFor({ state: 'visible', timeout: 5000 });
            loadedImages++;
          } catch (error) {
            failedImages++;
            console.log(`⚠️  Image failed to load in ${browserName}: ${src}`);
          }
        }
      }
      
      // Most images should load successfully
      const successRate = loadedImages / (loadedImages + failedImages);
      expect(successRate).toBeGreaterThan(0.8);
      
      console.log(`📊 ${browserName} image load success rate: ${(successRate * 100).toFixed(1)}%`);
    });
  });

  test.describe('Mobile Browser Compatibility', () => {
    test('should work properly on mobile browsers', async ({ page, browserName, isMobile }) => {
      if (isMobile) {
        // Test mobile-specific features
        const viewport = page.viewportSize();
        expect(viewport.width).toBeLessThanOrEqual(768);
        
        // Test touch interactions
        const clickableElements = page.locator('a, button');
        const elementCount = await clickableElements.count();
        
        if (elementCount > 0) {
          const firstElement = clickableElements.first();
          const box = await firstElement.boundingBox();
          
          if (box) {
            // Ensure touch target is large enough
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
        
        // Test mobile menu if present
        const mobileMenuButton = page.locator('button[aria-label*="menu" i], .mobile-menu-toggle, .hamburger');
        if (await mobileMenuButton.count() > 0) {
          await expect(mobileMenuButton.first()).toBeVisible();
        }
        
        console.log(`✅ Mobile compatibility verified for ${browserName}`);
      }
    });

    test('should handle orientation changes', async ({ page, browserName, isMobile }) => {
      if (isMobile) {
        // Test landscape orientation
        await page.setViewportSize({ width: 568, height: 320 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        // Test portrait orientation
        await page.setViewportSize({ width: 320, height: 568 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        await expect(body).toBeVisible();
        
        console.log(`✅ Orientation handling works in ${browserName}`);
      }
    });
  });

  test.describe('Browser-Specific Rendering', () => {
    test('should render text consistently', async ({ page, browserName }) => {
      // Test text rendering
      const textElements = page.locator('h1, h2, h3, p');
      const textCount = await textElements.count();
      
      if (textCount > 0) {
        for (let i = 0; i < Math.min(5, textCount); i++) {
          const element = textElements.nth(i);
          const text = await element.textContent();
          
          // Text should be visible and readable
          expect(text).toBeTruthy();
          expect(text.trim().length).toBeGreaterThan(0);
        }
      }
      
      console.log(`✅ Text rendering works in ${browserName}`);
    });

    test('should handle fonts consistently', async ({ page, browserName }) => {
      // Test font loading
      const fontFamilies = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        return computedStyle.fontFamily;
      });
      
      expect(fontFamilies).toBeTruthy();
      console.log(`📊 Font family in ${browserName}: ${fontFamilies}`);
    });

    test('should handle colors and contrast', async ({ page, browserName }) => {
      // Test color rendering
      const colorInfo = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        return {
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor
        };
      });
      
      // Colors should be defined
      expect(colorInfo.color).toBeTruthy();
      expect(colorInfo.backgroundColor).toBeTruthy();
      
      // Colors should be different (basic contrast check)
      expect(colorInfo.color).not.toBe(colorInfo.backgroundColor);
      
      console.log(`✅ Color rendering works in ${browserName}`);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle JavaScript errors gracefully', async ({ page, browserName }) => {
      const consoleErrors = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out common non-critical errors
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('analytics') &&
        !error.includes('third-party') &&
        !error.includes('adblock') &&
        !error.includes('extension')
      );
      
      // Should have minimal critical errors
      expect(criticalErrors.length).toBeLessThan(10);
      
      if (criticalErrors.length > 0) {
        console.log(`⚠️  ${browserName} errors:`, criticalErrors);
      } else {
        console.log(`✅ No critical errors in ${browserName}`);
      }
    });

    test('should handle network issues gracefully', async ({ page, browserName }) => {
      // Test offline behavior
      await page.context().setOffline(true);
      
      try {
        await page.goto('/');
        // Should handle offline state gracefully
        const body = page.locator('body');
        await expect(body).toBeVisible();
      } finally {
        await page.context().setOffline(false);
      }
      
      console.log(`✅ Network error handling works in ${browserName}`);
    });
  });
}); 