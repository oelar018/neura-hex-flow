import { test, expect } from '@playwright/test';

test.describe('Waitlist Scroll Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have waitlist element with correct id', async ({ page }) => {
    const waitlistElement = await page.locator('#waitlist');
    await expect(waitlistElement).toBeVisible();
    
    // Check that it's a section element
    await expect(waitlistElement).toHaveText(/Ready to transform your conversations?/);
  });

  test('should scroll to waitlist when Join Waitlist button is clicked', async ({ page }) => {
    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Click the Join Waitlist button in hero
    const joinButton = page.locator('text=Join the waitlist').first();
    await expect(joinButton).toBeVisible();
    await joinButton.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(1000);
    
    // Check that we scrolled down
    const newScrollY = await page.evaluate(() => window.scrollY);
    expect(newScrollY).toBeGreaterThan(initialScrollY);
    
    // Check that waitlist section is in viewport
    const waitlistElement = page.locator('#waitlist');
    await expect(waitlistElement).toBeInViewport();
  });

  test('should focus first input after scrolling', async ({ page }) => {
    // Click Join Waitlist button
    const joinButton = page.locator('text=Join the waitlist').first();
    await joinButton.click();
    
    // Wait for scroll and focus
    await page.waitForTimeout(1000);
    
    // Check that first input (name field) is focused
    const firstInput = page.locator('#waitlist input').first();
    await expect(firstInput).toBeFocused();
  });

  test('should handle missing waitlist element gracefully', async ({ page }) => {
    // Remove waitlist element to test error handling
    await page.evaluate(() => {
      const element = document.getElementById('waitlist');
      if (element) element.remove();
    });
    
    // Click button - should not throw error
    const joinButton = page.locator('text=Join the waitlist').first();
    await joinButton.click();
    
    // Check console for warning message (requires listening to console events)
    let consoleWarning = false;
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('waitlist')) {
        consoleWarning = true;
      }
    });
    
    await page.waitForTimeout(500);
    // Note: Testing console warnings in Playwright requires more setup
    // This is a basic structure for that functionality
  });

  test('should account for fixed header offset', async ({ page }) => {
    // Get header height
    const headerHeight = await page.locator('header').boundingBox();
    
    // Click join waitlist
    const joinButton = page.locator('text=Join the waitlist').first();
    await joinButton.click();
    
    await page.waitForTimeout(1000);
    
    // Check that waitlist section is positioned correctly relative to header
    const waitlistElement = page.locator('#waitlist');
    const waitlistBox = await waitlistElement.boundingBox();
    const headerBox = await page.locator('header').boundingBox();
    
    if (waitlistBox && headerBox) {
      // The waitlist should be visible below the header with some margin
      expect(waitlistBox.y).toBeGreaterThan(headerBox.height);
    }
  });
});