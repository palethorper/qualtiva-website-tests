#!/bin/bash

# Qualtiva Solutions Website Test Runner
# This script provides easy access to different test configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the test directory."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Function to install browsers
install_browsers() {
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
    print_success "Browsers installed"
}

# Function to run tests
run_tests() {
    local test_type=$1
    local description=$2
    
    print_status "Running $description..."
    if [ -n "$BASE_URL" ]; then
        print_status "Using BASE_URL: $BASE_URL"
    else
        print_status "Using default BASE_URL: https://www-dev.analytiqa.cloud/"
    fi
    local junit_dir="./junit-results"
    mkdir -p "$junit_dir"
    export PLAYWRIGHT_JUNIT_OUTPUT_DIR="$junit_dir"
    export PLAYWRIGHT_JUNIT_OUTPUT_NAME="junit-$(date +%Y%m%d-%H%M%S).xml"
    npm run $test_type
    
    if [ $? -eq 0 ]; then
        print_success "$description completed successfully"
    else
        print_error "$description failed"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Qualtiva Solutions Website Test Runner"
    echo ""
    echo "Usage: $0 [OPTION] [BASE_URL]"
    echo ""
    echo "Options:"
    echo "  all              Run all tests across all browsers"
    echo "  desktop          Run tests on desktop browsers only"
    echo "  mobile           Run tests on mobile browsers only"
    echo "  performance      Run performance tests only"
    echo "  accessibility    Run accessibility tests only"
    echo "  best-practices   Run web build best practices tests only"
    echo "  cross-browser    Run cross-browser compatibility tests only"
    echo "  mobile-responsive Run mobile responsiveness tests only"
    echo "  ci               Run tests with CI reporters (html, junit, json)"
    echo "  codegen          Run Playwright codegen against site"
    echo "  setup            Install dependencies and browsers"
    echo "  report           Show test report"
    echo "  help             Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  BASE_URL         Base URL for tests (default: https://www-dev.analytiqa.cloud/)"
    echo ""
    echo "Examples:"
    echo "  $0 setup         # Install dependencies and browsers"
    echo "  $0 all           # Run all tests against dev site"
    echo "  BASE_URL=https://www.qualtiva.solutions $0 all  # Run tests against prod"
    echo "  $0 all           # Run all tests"
    echo "  $0 mobile        # Run mobile tests only"
    echo "  $0 ci            # Run tests with CI reporters"
    echo "  $0 codegen       # Open Playwright codegen"
    echo "  $0 report        # Show test report"
}

# Main script logic
case "${1:-help}" in
    "setup")
        check_dependencies
        install_dependencies
        install_browsers
        print_success "Setup completed successfully"
        ;;
    "all")
        check_dependencies
        run_tests "test:all-browsers" "All browser tests"
        ;;
    "desktop")
        check_dependencies
        run_tests "test:desktop" "Desktop browser tests"
        ;;
    "mobile")
        check_dependencies
        run_tests "test:mobile" "Mobile browser tests"
        ;;
    "performance")
        check_dependencies
        run_tests "test:performance" "Performance tests"
        ;;
    "accessibility")
        check_dependencies
        run_tests "test:accessibility" "Accessibility tests"
        ;;
    "best-practices")
        check_dependencies
        run_tests "test:best-practices" "Web build best practices tests"
        ;;
    "cross-browser")
        check_dependencies
        run_tests "test:cross-browser" "Cross-browser compatibility tests"
        ;;
    "mobile-responsive")
        check_dependencies
        run_tests "test:mobile-responsive" "Mobile responsiveness tests"
        ;;
    "ci")
        check_dependencies
        print_status "Running tests with CI reporters..."
        if [ -n "$BASE_URL" ]; then
            print_status "Using BASE_URL: $BASE_URL"
        else
            print_status "Using default BASE_URL: https://www-dev.analytiqa.cloud/"
        fi
        junit_dir="./junit-results"
        mkdir -p "$junit_dir"
        export PLAYWRIGHT_JUNIT_OUTPUT_DIR="$junit_dir"
        export PLAYWRIGHT_JUNIT_OUTPUT_NAME="junit-$(date +%Y%m%d-%H%M%S).xml"
        npx playwright test --reporter=html,junit,json
        ;;
    "codegen")
        check_dependencies
        local codegen_url="${BASE_URL:-https://www-dev.analytiqa.cloud/}"
        print_status "Launching Playwright codegen for: $codegen_url"
        npx playwright codegen "$codegen_url"
        ;;
    "report")
        if [ -d "playwright-report" ]; then
            print_status "Opening test report..."
            npm run report
        else
            print_warning "No test report found. Run tests first to generate a report."
        fi
        ;;
    "help"|*)
        show_help
        ;;
esac 