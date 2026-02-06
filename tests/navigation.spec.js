import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to all main pages without errors', async ({ page }) => {
    // Get all navigation links
    const navLinks = page.locator('nav a, header a').filter({ hasText: /^(?!.*@).*$/ }); // Exclude email links
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 10); i++) { // Limit to first 10 links
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
          const linkText = await link.textContent();
          console.log(`Testing navigation to: ${linkText} (${href})`);
          
          // Handle external links differently
          if (href.startsWith('http') && !href.includes('analytiqa.cloud') && !href.includes('qualtiva.solutions')) {
            // For external links, just verify they exist
            await expect(link).toBeVisible();
          } else {
            // For internal links, navigate and verify
            await link.click();
            await page.waitForLoadState('networkidle');
            
            // Verify we're not on an error page
            const pageContent = await page.textContent('body');
            expect(pageContent).not.toMatch(/404|not found|page not found/i);
            
            // Go back to home for next iteration
            await page.goto('/');
          }
        }
      }
    }
  });

  test('should handle mobile navigation menu', async ({ page, isMobile }) => {
    if (isMobile) {
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], .mobile-menu-toggle, .hamburger, .menu-button');
      
      if (await mobileMenuButton.count() > 0) {
        const menuButton = mobileMenuButton.first();
        await expect(menuButton).toBeVisible();
        
        // Click to open menu
        await menuButton.click();
        
        // Verify menu opened (common patterns)
        const mobileMenu = page.locator('.mobile-menu, .mobile-nav, nav[aria-expanded="true"], .menu-open');
        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu.first()).toBeVisible();
          
          // Click again to close
          await menuButton.click();
        }
      }
    }
  });
});
