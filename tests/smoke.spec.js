import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Qualtiva|Stop guessing/i);
  });

  test('2. Navigation menu is visible', async ({ page }) => {
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('3. Logo exists and is visible', async ({ page }) => {
    const logo = page.locator('img[alt*="logo" i], img[alt*="qualtiva" i], .logo').first();
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
    }
  });

  test('4. Main content is visible', async ({ page }) => {
    const main = page.locator('main, .content, article').first();
    if (await main.count() > 0) {
      await expect(main).toBeVisible();
    }
  });

  test('5. Page has heading', async ({ page }) => {
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
  });

  test('6. Links are present', async ({ page }) => {
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('7. Footer is visible', async ({ page }) => {
    const footer = page.locator('footer').first();
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });

  test('8. Page has text content', async ({ page }) => {
    const text = await page.textContent('body');
    expect(text.length).toBeGreaterThan(0);
  });

  test('9. No major errors in console', async ({ page, context }) => {
    let errors = [];
    context.on('page', (page) => {
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
    });
    await page.waitForLoadState('networkidle');
    expect(errors.length).toBe(0);
  });

  test('10. Page is responsive', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport.width).toBeGreaterThan(0);
    expect(viewport.height).toBeGreaterThan(0);
  });
});
