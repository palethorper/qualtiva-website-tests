import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Contact', () => {
  test('should find and test contact page', async ({ page }) => {
    await page.goto('/');
    
    // Look for contact link
    const contactLink = page.getByRole('link', { name: /contact/i });
    
    if (await contactLink.count() > 0) {
      await contactLink.first().click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on contact page
      expect(page.url()).toMatch(/contact/i);
      
      // Look for contact form
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        await expect(form).toBeVisible();
        
        // Check for common form fields
        const nameField = page.locator('input[name*="name" i], input[placeholder*="name" i], input[id*="name" i]');
        const emailField = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');
        const messageField = page.locator('textarea, input[name*="message" i], input[placeholder*="message" i]');
        
        if (await nameField.count() > 0) await expect(nameField.first()).toBeVisible();
        if (await emailField.count() > 0) await expect(emailField.first()).toBeVisible();
        if (await messageField.count() > 0) await expect(messageField.first()).toBeVisible();
      }
      
      // Look for contact information
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const phonePattern = /[\+]?[1-9][\d\s\-\(\)\.]{7,15}/;
      
      const pageText = await page.textContent('body');
      const hasEmail = emailPattern.test(pageText);
      const hasPhone = phonePattern.test(pageText);
      
      // At least one contact method should be present
      expect(hasEmail || hasPhone || await form.count() > 0).toBeTruthy();
    }
  });

  test('should validate contact form submission', async ({ page }) => {
    await page.goto('/');
    
    const contactLink = page.getByRole('link', { name: /contact/i });
    if (await contactLink.count() > 0) {
      await contactLink.first().click();
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        // Try to submit empty form to test validation
        const submitButton = form.locator('button[type="submit"], input[type="submit"], button:has-text("send"), button:has-text("submit")');
        
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          
          // Wait a moment for validation messages
          await page.waitForTimeout(1000);
          
          // Form should still be visible (not submitted with empty fields)
          await expect(form).toBeVisible();
        }
      }
    }
  });
});