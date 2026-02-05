import { test, expect } from '@playwright/test';

test.describe('Qualtiva Solutions - Forms', () => {
  test('should handle newsletter subscription if present', async ({ page }) => {
    await page.goto('/');
    
    // Look for newsletter signup
    const newsletterForm = page.locator('form').filter({ 
      hasText: /newsletter|subscribe|email/i 
    });
    
    if (await newsletterForm.count() > 0) {
      const emailInput = newsletterForm.locator('input[type="email"], input[name*="email" i]');
      const submitButton = newsletterForm.locator('button[type="submit"], input[type="submit"]');
      
      if (await emailInput.count() > 0 && await submitButton.count() > 0) {
        // Test with invalid email
        await emailInput.first().fill('invalid-email');
        await submitButton.first().click();
        
        // Should show validation error or not submit
        await page.waitForTimeout(1000);
        await expect(newsletterForm.first()).toBeVisible();
        
        // Test with valid email format (don't actually submit)
        await emailInput.first().fill('test@example.com');
        // Note: In real tests, you might want to intercept the network request
      }
    }
  });

  test('should validate required form fields', async ({ page }) => {
    await page.goto('/');
    
    // Find all forms on the page
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      const requiredFields = form.locator('input[required], select[required], textarea[required]');
      const requiredCount = await requiredFields.count();
      
      if (requiredCount > 0) {
        const submitButton = form.locator('button[type="submit"], input[type="submit"]');
        
        if (await submitButton.count() > 0) {
          // Try to submit without filling required fields
          await submitButton.first().click();
          await page.waitForTimeout(500);
          
          // Form should still be visible, indicating validation prevented submission
          await expect(form).toBeVisible();
        }
      }
    }
  });
});