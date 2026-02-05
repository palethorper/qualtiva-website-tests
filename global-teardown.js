const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up temporary files
    const tempFiles = ['global-state.json'];
    for (const file of tempFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️  Cleaned up ${file}`);
      }
    }
    
    // Create a summary report
    const summary = {
      testRun: new Date().toISOString(),
      project: 'Qualtiva Solutions Website Tests',
      browsers: [
        'chromium',
        'firefox', 
        'webkit',
        'Mobile Chrome',
        'Mobile Safari',
        'iPad',
        'Edge',
        'Low-end Device'
      ],
      totalBrowsers: 8,
      testCategories: [
        'Home Page',
        'Navigation',
        'Contact Forms',
        'Accessibility',
        'Performance',
        'Web Build Best Practices',
        'Cross-browser Compatibility',
        'Mobile Responsiveness'
      ]
    };
    
    // Save summary to file
    fs.writeFileSync(
      'test-results/summary.json', 
      JSON.stringify(summary, null, 2)
    );
    
    console.log('✅ Global teardown completed successfully');
    console.log('📊 Test summary saved to test-results/summary.json');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error.message);
  }
}

module.exports = globalTeardown; 