<#
.SYNOPSIS
    Post test results (JUnit/NUnit XML) to QA server via HTTP API.

.DESCRIPTION
    Posts XML test result files to a QA ingestion endpoint. Supports filtering by file age,
    adding tags, and setting team/project/application/environment metadata via custom headers.
    
    Requires environment variables:
    - AQA_USER: Username for API authentication
    - AQA_PASSWORD: Password for API authentication
    - AQA_ENDPOINT: Full endpoint URL (e.g., https://my-analytiqa.hostname.com/in-http)

.PARAMETER ResultsDir
    Directory containing XML result files. Default: ./test-results

.PARAMETER FileFilter
    File pattern to match (e.g., '*results.xml', '*junit*.xml', '*pester*.xml'). Default: *results*.xml

.PARAMETER ResultFormat
    Result format for Test-Engine-Result-Format header (e.g., 'junit', 'nunit', 'pester'). Default: junit

.PARAMETER Engine
    Test engine name (e.g., 'pester', 'selenium', 'playwright'). Default: pester

.PARAMETER Hours
    Only process files modified within the last N hours. Default: 72

.PARAMETER Tags
    Comma-separated list of tags to add. Default: empty

.PARAMETER Team
    Team name for aqa-team header. Default: empty

.PARAMETER Project
    Project name for aqa-project header. Default: empty

.PARAMETER Application
    Application name for aqa-application header. Default: empty

.PARAMETER Product
    Product name for aqa-product header. Default: empty

.PARAMETER Environment
    Environment name for aqa-environment header. Default: empty

.EXAMPLE
    .\aqa-post-results.ps1 -ResultsDir ./test-results -ResultFormat pester -Team MyTeam -Project MyProject

.EXAMPLE
    .\aqa-post-results.ps1 -ResultFormat junit -Engine selenium -Tags "regression,smoke" -Hours 24

#>

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "Directory containing test result XML files")]
    [string]$ResultsDir = "./test-results",
    
    [Parameter(HelpMessage = "File pattern to match")]
    [Alias("f")]
    [string]$FileFilter = "*results.xml",
    
    [Parameter(HelpMessage = "Result format for Test-Engine-Result-Format header")]
    [string]$ResultFormat = "junit",
    
    [Parameter(HelpMessage = "Test engine name")]
    [Alias("e")]
    [string]$Engine = "selenium",
    
    [Parameter(HelpMessage = "Only process files modified in the last N hours")]
    [Alias("t")]
    [int]$Hours = 72,
    
    [Parameter(HelpMessage = "Comma-separated list of tags")]
    [Alias("l")]
    [string]$Tags = "",
    
    [Parameter(HelpMessage = "Team name")]
    [string]$Team = "",
    
    [Parameter(HelpMessage = "Project name")]
    [string]$Project = "",
    
    [Parameter(HelpMessage = "Application name")]
    [string]$Application = "",
    
    [Parameter(HelpMessage = "Product name")]
    [string]$Product = "",
    
    [Parameter(HelpMessage = "Environment name")]
    [string]$Environment = ""
)

$ErrorActionPreference = 'Stop'

# Check required environment variables
$requiredEnvVars = @('AQA_USER', 'AQA_PASSWORD', 'AQA_ENDPOINT')
$missing = @()

foreach ($var in $requiredEnvVars) {
    if (-not (Test-Path "env:$var")) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Error "Missing required environment variables: $($missing -join ', ')"
    exit 1
}

$aqaUser = $env:AQA_USER
$aqaPassword = $env:AQA_PASSWORD
$aqaEndpoint = $env:AQA_ENDPOINT

# Validate results directory
if (-not (Test-Path $ResultsDir -PathType Container)) {
    Write-Error "Results directory not found: $ResultsDir"
    exit 1
}

# Calculate cutoff time
$cutoffTime = (Get-Date).AddHours(-$Hours)

Write-Host "Send to $aqaEndpoint" -ForegroundColor Cyan
Write-Host "Using file pattern: $FileFilter" -ForegroundColor Gray
Write-Host "Using test engine: $Engine" -ForegroundColor Gray
Write-Host "Using tags: $Tags" -ForegroundColor Gray
Write-Host "Processing files modified after: $($cutoffTime.ToString('yyyy-MM-dd HH:mm:ss')) ($Hours hours ago)" -ForegroundColor Gray
Write-Host ""

# Find matching XML files
$pattern = Join-Path $ResultsDir $FileFilter
$files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue

if (-not $files) {
    Write-Warning "No files found matching pattern: $pattern"
    exit 0
}

# Process each file
foreach ($file in $files) {

    # Check file age
    if ($file.LastWriteTime -lt $cutoffTime) {
        Write-Host "Skipping $($file.Name) (modified: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')))" -ForegroundColor DarkGray
        continue
    }
    
    Write-Host "Posting file: $($file.Name)" -ForegroundColor Yellow
    
    # Prepare headers
    $headers = @{
        'Content-Type' = 'application/xml'
        'Test-Engine-Result-Format' = $ResultFormat
        'Test-Engine' = $Engine
        'Tags' = $Tags
        'aqa-team' = $Team
        'aqa-project' = $Project
        'aqa-application' = $Application
        'aqa-product' = $Product
        'aqa-environment' = $Environment
    }
    
    # Create credential
    $securePassword = ConvertTo-SecureString $aqaPassword -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($aqaUser, $securePassword)
    
    # Use endpoint URL directly
    $url = $aqaEndpoint
    
    # Debug output (without sensitive data)
    Write-Host "Debug - Endpoint: $url" -ForegroundColor DarkGray
    Write-Host "Debug - User: $aqaUser" -ForegroundColor DarkGray
    Write-Host "Debug - Headers: $($headers | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
    
    try {
        # Read file content
        $body = Get-Content $file.FullName -Raw
        
        # Build request parameters
        $requestParams = @{
            Uri = $url
            Method = 'Post'
            Headers = $headers
            Body = $body
            Credential = $credential
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        
        # Add SkipCertificateCheck for PowerShell 7+
        if ($PSVersionTable.PSVersion.Major -ge 7) {
            $requestParams['SkipCertificateCheck'] = $true
        }
        
        # Post to server
        $response = Invoke-WebRequest @requestParams
        
        $statusCode = $response.StatusCode
        $responseBody = $response.Content
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "Successfully posted: $($file.Name) (HTTP $statusCode)" -ForegroundColor Green
            if ($responseBody) {
                Write-Host "Response: $responseBody" -ForegroundColor Gray
            }
        } else {
            Write-Host "Unexpected status: $($file.Name) (HTTP $statusCode)" -ForegroundColor Yellow
            if ($responseBody) {
                Write-Host "Response: $responseBody" -ForegroundColor Gray
            }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Failed to post $($file.Name) (HTTP $statusCode)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "404 Error - Possible issues:" -ForegroundColor Yellow
            Write-Host "  - Endpoint URL may be incorrect: $url" -ForegroundColor Yellow
            Write-Host "  - Server may not be running on $aqaEndpoint" -ForegroundColor Yellow
            Write-Host "  - Authentication may be required" -ForegroundColor Yellow
            Write-Host "  - Check if the server expects a different endpoint path" -ForegroundColor Yellow
        }
    }
    
    Write-Host "---" -ForegroundColor DarkGray
}

Write-Host "Done." -ForegroundColor Green
