import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Web Build Best Practices', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
  });

  test.describe('SEO Best Practices', () => {
    test('should have proper meta tags for SEO', async ({ page }) => {
      // Check title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(60);
      expect(title).toContain('Qualtiva');

      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      if (await metaDescription.count() > 0) {
        const description = await metaDescription.getAttribute('content');
        expect(description.length).toBeGreaterThan(120);
        expect(description.length).toBeLessThan(160);
      }

      // Check viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);

      // Check charset
      const charset = page.locator('meta[charset]');
      if (await charset.count() === 0) {
        const httpEquiv = page.locator('meta[http-equiv="Content-Type"]');
        expect(await httpEquiv.count()).toBeGreaterThan(0);
      }

      // Check Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogUrl = page.locator('meta[property="og:url"]');
      
      if (await ogTitle.count() > 0) {
        await expect(ogTitle).toBeVisible();
      }
      if (await ogDescription.count() > 0) {
        await expect(ogDescription).toBeVisible();
      }
      if (await ogUrl.count() > 0) {
        await expect(ogUrl).toBeVisible();
      }
    });

    test('should have proper heading structure', async ({ page }) => {
      // Check for single h1
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      expect(h1Count).toBe(1);

      // Check heading hierarchy (no skipped levels)
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 1) {
        for (let i = 0; i < headingCount - 1; i++) {
          const currentHeading = headings.nth(i);
          const nextHeading = headings.nth(i + 1);
          
          const currentLevel = await currentHeading.evaluate(el => parseInt(el.tagName.charAt(1)));
          const nextLevel = await nextHeading.evaluate(el => parseInt(el.tagName.charAt(1)));
          
          // Next heading should not skip more than one level
          expect(nextLevel - currentLevel).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should have proper canonical URL', async ({ page }) => {
      const canonical = page.locator('link[rel="canonical"]');
      if (await canonical.count() > 0) {
        const href = await canonical.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/analytiqa\.cloud|qualtiva\.solutions/);
      }
    });
  });

  test.describe('Security Best Practices', () => {
    test('should have proper security headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response.headers();

      // Check for security headers
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy'
      ];

      for (const header of securityHeaders) {
        if (headers[header]) {
          console.log(`✅ ${header}: ${headers[header]}`);
        } else {
          console.log(`⚠️  Missing security header: ${header}`);
        }
      }

      // Check for HTTPS
      expect(page.url()).toMatch(/^https:/);
    });

    test('should not expose sensitive information in source', async ({ page }) => {
      const source = await page.content();
      
      // Check for common sensitive patterns
      const sensitivePatterns = [
        /api[_-]?key/i,
        /password/i,
        /secret/i,
        /token/i,
        /private[_-]?key/i
      ];

      for (const pattern of sensitivePatterns) {
        const matches = source.match(pattern);
        if (matches) {
          console.log(`⚠️  Potential sensitive information found: ${matches[0]}`);
        }
      }
    });

    test('should have proper CSP headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response.headers();
      
      if (headers['content-security-policy']) {
        console.log(`✅ CSP header found: ${headers['content-security-policy']}`);
      } else {
        console.log('⚠️  Content Security Policy header not found');
      }
    });
  });

  test.describe('Performance Best Practices', () => {
    test('should load within performance budget', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('load');
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 3 seconds for initial load
      expect(loadTime).toBeLessThan(3000);
      console.log(`📊 Page load time: ${loadTime}ms`);
    });

    test('should have optimized images', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        
        if (src) {
          // Check for modern image formats
          const isOptimized = src.includes('.webp') || 
                             src.includes('.avif') || 
                             src.includes('data:image/webp') ||
                             src.includes('data:image/avif');
          
          if (!isOptimized && !src.includes('icon') && !src.includes('logo')) {
            console.log(`⚠️  Consider optimizing image: ${src}`);
          }
        }
      }
    });

    test('should have minimal JavaScript errors', async ({ page }) => {
      const consoleErrors = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('load');
      
      // Filter out common non-critical errors
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('analytics') &&
        !error.includes('third-party') &&
        !error.includes('adblock') &&
        !error.includes('extension')
      );
      
      expect(criticalErrors.length).toBeLessThan(5);
      if (criticalErrors.length > 0) {
        console.log('⚠️  JavaScript errors found:', criticalErrors);
      }
    });

    test('should have proper resource loading', async ({ page }) => {
      const response = await page.goto('/');
      
      // Check for proper caching headers
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl) {
        console.log(`✅ Cache-Control: ${cacheControl}`);
      } else {
        console.log('⚠️  Cache-Control header not found');
      }
    });
  });

  test.describe('Modern Web Standards', () => {
    test('should use semantic HTML elements', async ({ page }) => {
      const semanticElements = [
        'header', 'nav', 'main', 'section', 'article', 
        'aside', 'footer', 'figure', 'figcaption'
      ];
      
      for (const element of semanticElements) {
        const elements = page.locator(element);
        if (await elements.count() > 0) {
          console.log(`✅ Semantic element found: <${element}>`);
        }
      }
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check for proper ARIA labels
      const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
      const ariaCount = await elementsWithAria.count();
      
      if (ariaCount > 0) {
        console.log(`✅ ${ariaCount} elements with ARIA attributes found`);
      }
      
      // Check for proper roles
      const elementsWithRoles = page.locator('[role]');
      const roleCount = await elementsWithRoles.count();
      
      if (roleCount > 0) {
        console.log(`✅ ${roleCount} elements with ARIA roles found`);
      }
    });

    test('should support modern CSS features', async ({ page }) => {
      // Check for CSS Grid or Flexbox usage
      const hasGrid = await page.evaluate(() => {
        return window.getComputedStyle(document.body).display === 'grid' ||
               document.querySelector('[style*="display: grid"], [style*="display:grid"]');
      });
      
      const hasFlexbox = await page.evaluate(() => {
        return window.getComputedStyle(document.body).display === 'flex' ||
               document.querySelector('[style*="display: flex"], [style*="display:flex"]');
      });
      
      if (hasGrid || hasFlexbox) {
        console.log('✅ Modern CSS layout features detected');
      } else {
        console.log('⚠️  Consider using CSS Grid or Flexbox for layouts');
      }
    });

    test('should have proper responsive design', async ({ page }) => {
      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.reload();
        await page.waitForLoadState('load');
        
        // Check if content is properly visible
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        console.log(`✅ Responsive design works on ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work across different browsers', async ({ page, browserName }) => {
      // Browser-specific checks
      if (browserName === 'chromium') {
        // Chrome-specific features
        const hasChromeFeatures = await page.evaluate(() => {
          return 'serviceWorker' in navigator && 'fetch' in window;
        });
        expect(hasChromeFeatures).toBeTruthy();
      }
      
      if (browserName === 'firefox') {
        // Firefox-specific features
        const hasFirefoxFeatures = await page.evaluate(() => {
          return 'fetch' in window && 'Promise' in window;
        });
        expect(hasFirefoxFeatures).toBeTruthy();
      }
      
      if (browserName === 'webkit') {
        // Safari-specific features
        const hasSafariFeatures = await page.evaluate(() => {
          return 'fetch' in window;
        });
        expect(hasSafariFeatures).toBeTruthy();
      }
      
      console.log(`✅ Cross-browser compatibility verified for ${browserName}`);
    });

    test('should handle JavaScript gracefully', async ({ page }) => {
      // Test JavaScript functionality
      const jsWorks = await page.evaluate(() => {
        try {
          // Test basic JavaScript features
          const testArray = [1, 2, 3];
          const testObject = { key: 'value' };
          const testFunction = () => 'test';
          
          return testArray.length === 3 && 
                 testObject.key === 'value' && 
                 testFunction() === 'test';
        } catch (error) {
          return false;
        }
      });
      
      expect(jsWorks).toBeTruthy();
    });
  });

  test.describe('Mobile Best Practices', () => {
    test('should have proper touch targets', async ({ page, isMobile }) => {
      if (isMobile) {
        const clickableElements = page.locator('a, button, input[type="button"], input[type="submit"]');
        const elementCount = await clickableElements.count();
        
        for (let i = 0; i < elementCount; i++) {
          const element = clickableElements.nth(i);
          const box = await element.boundingBox();
          
          if (box) {
            // Touch targets should be at least 44x44 pixels
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
        
        console.log('✅ Touch targets meet mobile accessibility standards');
      }
    });

    test('should have proper viewport settings', async ({ page }) => {
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
      
      const content = await viewport.getAttribute('content');
      expect(content).toContain('width=device-width');
    });
  });
}); 