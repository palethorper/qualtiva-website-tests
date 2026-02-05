import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'https://dev.analytiqa.cloud',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Enhanced viewport settings for better testing
    viewport: { width: 1280, height: 720 },
    // Add geolocation for location-based features
    geolocation: { longitude: -122.4194, latitude: 37.7749 },
    // Add permissions for notifications, camera, etc.
    permissions: ['geolocation', 'notifications'],
    // Add user agent for consistent testing
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Add specific Chrome flags for testing
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage'
          ]
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Add Firefox-specific settings
        launchOptions: {
          args: ['-width', '1280', '-height', '720']
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Add Safari-specific settings
        launchOptions: {
          args: ['--disable-web-security']
        }
      },
    },
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Add mobile-specific settings
        launchOptions: {
          args: ['--disable-web-security', '--disable-dev-shm-usage']
        }
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // Add iOS-specific settings
        launchOptions: {
          args: ['--disable-web-security']
        }
      },
    },
    // Tablet browsers
    {
      name: 'iPad',
      use: { 
        ...devices['iPad Pro 11 landscape'],
        // Add tablet-specific settings
        launchOptions: {
          args: ['--disable-web-security']
        }
      },
    },
    // Additional browser profiles for comprehensive testing
    {
      name: 'Edge',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'msedge',
        // Add Edge-specific settings
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },
    // Low-end device simulation
    {
      name: 'Low-end Device',
      use: { 
        ...devices['Desktop Chrome'],
        // Simulate slower device
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-dev-shm-usage'
          ]
        },
        // Slower network conditions
        contextOptions: {
          extraHTTPHeaders: {
            'X-Playwright-Slow-Mo': '1000'
          }
        }
      },
    },
  ],
  // Global timeout settings
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  // Output directory for test artifacts
  outputDir: 'test-results/',
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),
});