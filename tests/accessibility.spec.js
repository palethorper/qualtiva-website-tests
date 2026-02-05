import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1 tag
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Should have exactly one h1
    
    // Verify h1 has content
    const h1Text = await h1.textContent();
    expect(h1Text.trim().length).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      // Skip decorative images or icons
      if (src && !src.includes('icon') && !src.includes('decoration')) {
        expect(alt).toBeTruthy();
        expect(alt.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have keyboard navigation support', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation through focusable elements
    const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const count = await focusableElements.count();
    
    if (count > 0) {
      // Focus first element
      await focusableElements.first().focus();
      await expect(focusableElements.first()).toBeFocused();
      
      // Tab through a few elements
      for (let i = 0; i < Math.min(3, count - 1); i++) {
        await page.keyboard.press('Tab');
        // Verify focus moved (general check)
        const activeElement = page.locator(':focus');
        await expect(activeElement).toBeVisible();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic check - in a real scenario, you'd use specialized tools
    // Check that text is not the same color as background
    const textColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).color;
    });
    
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    expect(textColor).not.toBe(backgroundColor);
  });
});