const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting global setup for Qualtiva Solutions tests...');
  
  // Create a browser instance for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Verify the website is accessible
    console.log('📡 Checking website accessibility...');
    await page.goto('https://dev.analytiqa.cloud');
    await page.waitForLoadState('networkidle');
    
    // Basic health check
    const title = await page.title();
    console.log(`✅ Website loaded successfully. Title: ${title}`);
    
    // Store any global data that might be needed across tests
    const globalData = {
      baseUrl: 'https://dev.analytiqa.cloud',
      lastCheck: new Date().toISOString(),
      title: title
    };
    
    // Save global data for tests to use
    await context.storageState({ path: 'global-state.json' });
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup; 