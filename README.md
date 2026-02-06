# Qualtiva Solutions Website Test Suite

A comprehensive Playwright test suite for the Qualtiva Solutions website (https://www-dev.analytiqa.cloud/) that covers web build best practices, cross-browser compatibility, and mobile responsiveness.

## 🚀 Features

### Test Coverage
- **Home Page Testing**: Basic functionality, navigation, and content verification
- **Navigation Testing**: Menu functionality, link validation, and user flow
- **Contact Forms**: Form validation, submission testing, and error handling
- **Accessibility Testing**: WCAG compliance, screen reader support, and keyboard navigation
- **Performance Testing**: Load times, resource optimization, and performance budgets
- **Web Build Best Practices**: SEO, security, modern web standards, and responsive design
- **Cross-Browser Compatibility**: Testing across multiple browsers and profiles
- **Mobile Responsiveness**: Touch interactions, responsive design, and mobile-specific features

### Browser Support
- **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: Mobile Chrome, Mobile Safari
- **Tablet Browsers**: iPad
- **Special Profiles**: Low-end device simulation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository or navigate to the test directory:
```bash
cd /path/to/qualtiva-tests
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install-browsers
```

## 🧪 Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

### Specific Test Categories

```bash
# Run mobile-specific tests
npm run test:mobile

# Run desktop browser tests
npm run test:desktop

# Run all browser profiles
npm run test:all-browsers

# Run performance tests only
npm run test:performance

# Run accessibility tests only
npm run test:accessibility

# Run web build best practices tests
npm run test:best-practices

# Run cross-browser compatibility tests
npm run test:cross-browser

# Run mobile responsiveness tests
npm run test:mobile-responsive
```

### CI/CD Integration

```bash
# Run tests for CI/CD with multiple reporters
npm run test:ci
```

## 📊 Test Reports

After running tests, you can view detailed reports:

```bash
# View HTML report
npm run report
```

Reports are generated in multiple formats:
- **HTML Report**: Interactive report with screenshots and traces
- **JSON Report**: Machine-readable test results
- **JUnit Report**: CI/CD integration format

## 🏗️ Test Structure

### Configuration (`playwright.config.js`)
- **8 Browser Profiles**: Chrome, Firefox, Safari, Edge, Mobile Chrome, Mobile Safari, iPad, Low-end Device
- **Enhanced Settings**: Geolocation, permissions, viewport configurations
- **Multiple Reporters**: HTML, JSON, JUnit
- **Global Setup/Teardown**: Environment preparation and cleanup

### Test Files

1. **`home-page.spec.js`**: Basic homepage functionality
2. **`navigation.spec.js`**: Navigation menu and link testing
3. **`contact.spec.js`**: Contact form validation and submission
4. **`accessibility.spec.js`**: WCAG compliance and accessibility features
5. **`performance.spec.js`**: Performance metrics and optimization
6. **`web-build-best-practices.spec.js`**: SEO, security, and modern web standards
7. **`cross-browser-compatibility.spec.js`**: Browser-specific functionality testing
8. **`mobile-responsiveness.spec.js`**: Mobile device and responsive design testing

## 🎯 Test Categories

### Web Build Best Practices
- **SEO Testing**: Meta tags, heading structure, canonical URLs
- **Security Testing**: Security headers, CSP, sensitive information exposure
- **Performance Testing**: Load times, image optimization, JavaScript errors
- **Modern Web Standards**: Semantic HTML, ARIA attributes, CSS features
- **Responsive Design**: Multiple viewport testing, orientation changes

### Cross-Browser Compatibility
- **Core Functionality**: Basic page loading and navigation
- **Browser-Specific Features**: JavaScript and CSS feature support
- **Performance Across Browsers**: Load times and resource handling
- **Mobile Browser Compatibility**: Touch interactions and mobile features
- **Error Handling**: JavaScript errors and network issues

### Mobile Responsiveness
- **Device Compatibility**: iPhone, Android, tablet testing
- **Responsive Design**: Multiple screen sizes and orientations
- **Touch Interactions**: Touch targets, gestures, and mobile navigation
- **Mobile Performance**: Load times and mobile-specific resources
- **Mobile Accessibility**: Screen reader support and keyboard navigation

## 🔧 Customization

### Adding New Tests

1. Create a new test file in the `tests/` directory
2. Follow the existing naming convention: `feature-name.spec.js`
3. Use the established test structure with `test.describe()` blocks
4. Add appropriate assertions and error handling

### Modifying Browser Profiles

Edit `playwright.config.js` to:
- Add new browser profiles
- Modify viewport sizes
- Change launch options
- Adjust timeout settings

### Environment Variables

Set environment variables for different configurations:
```bash
# Run tests against dev environment
BASE_URL=https://www-dev.analytiqa.cloud/ npm test

# Run tests with specific browser
BROWSER=firefox npm test
```

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm ci
    - run: npm run install-browsers
    - run: npm run test:ci
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## 🐛 Troubleshooting

### Common Issues

1. **Browser Installation Issues**:
   ```bash
   npx playwright install --force
   ```

2. **Test Timeout Issues**:
   - Increase timeout in `playwright.config.js`
   - Check network connectivity to the website

3. **Mobile Test Issues**:
   - Ensure mobile viewport is set correctly
   - Check for mobile-specific selectors

4. **Performance Test Failures**:
   - Verify network conditions
   - Check for heavy resources on the website

### Debug Mode

Run tests in debug mode to step through execution:
```bash
npm run test:debug
```

## 📝 Contributing

1. Follow the existing test structure and naming conventions
2. Add appropriate comments and documentation
3. Include both positive and negative test cases
4. Test across multiple browser profiles
5. Update this README when adding new features

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the test reports for specific failures
3. Run tests in debug mode for detailed information
4. Check the Playwright documentation for advanced features

---

**Note**: This test suite assumes that the published content on https://www-dev.analytiqa.cloud/ is correct and focuses on testing functionality, performance, and best practices rather than content validation. 