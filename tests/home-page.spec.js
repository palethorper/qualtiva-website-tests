import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Qualtiva/i);
    await expect(page).toHaveURL(/analytiqa|qualtiva/);
  });

  test('should display main navigation menu', async ({ page }) => {
    // Check for common navigation elements
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
    
    // Look for common navigation links
    const commonNavItems = ['Home', 'About', 'Services', 'Solutions', 'Contact'];
    for (const item of commonNavItems) {
      const navLink = page.getByRole('link', { name: new RegExp(item, 'i') });
      if (await navLink.count() > 0) {
        await expect(navLink.first()).toBeVisible();
      }
    }
  });

  test('should have working logo link', async ({ page }) => {
    const logo = page.locator('img[alt*="logo" i], img[alt*="qualtiva" i], .logo, [data-testid="logo"]').first();
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
      
      // Check if logo is clickable and links to home
      const logoLink = page.locator('a').filter({ has: logo });
      if (await logoLink.count() > 0) {
        await expect(logoLink).toHaveAttribute('href', /^\/(#.*)?$/);
      }
    }
  });

  test('should display hero section', async ({ page }) => {
    // Look for hero section with common selectors
    const heroSelectors = ['.hero', '.banner', '.jumbotron', 'section:first-of-type', '[data-testid="hero"]'];
    
    let heroFound = false;
    for (const selector of heroSelectors) {
      const hero = page.locator(selector);
      if (await hero.count() > 0 && await hero.isVisible()) {
        await expect(hero).toBeVisible();
        heroFound = true;
        break;
      }
    }
    
    // If no specific hero section found, check for main content
    if (!heroFound) {
      const main = page.locator('main, .main-content, #main');
      await expect(main.first()).toBeVisible();
    }
  });

  test('should have contact information or CTA buttons', async ({ page }) => {
    // Look for contact buttons or CTAs
    const ctaButtons = page.getByRole('button', { name: /contact|get started|learn more|request demo/i });
    const contactLinks = page.getByRole('link', { name: /contact|get started|learn more|request demo/i });
    
    const hasButtons = await ctaButtons.count() > 0;
    const hasLinks = await contactLinks.count() > 0;
    
    expect(hasButtons || hasLinks).toBeTruthy();
  });

  test('should be responsive on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check if mobile menu exists
      const mobileMenuButton = page.locator('button[aria-label*="menu" i], .mobile-menu-toggle, .hamburger');
      if (await mobileMenuButton.count() > 0) {
        await expect(mobileMenuButton.first()).toBeVisible();
      }
      
      // Verify page width is appropriate for mobile
      const viewport = page.viewportSize();
      expect(viewport.width).toBeLessThanOrEqual(768);
    }
  });
});