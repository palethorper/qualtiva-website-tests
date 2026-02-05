# https://playwright.dev/docs/test-cli
# https://playwright.dev/docs/test-reporters


$targetDir = ".\junit-results"
# Create the folder if it doesn't already exist
if (-Not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
}

# Set the environment variable
$env:PLAYWRIGHT_JUNIT_OUTPUT_DIR = $targetDir
$env:PLAYWRIGHT_JUNIT_OUTPUT_NAME = "junit-$(Get-Date -Format 'yyyyMMdd-HHmmss').xml"

# --project=chromium 
#   --reporter=junit
npx playwright test --project=chromium --quiet
