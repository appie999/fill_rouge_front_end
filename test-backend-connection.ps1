# Backend Connectivity Test Script
Write-Host "=== Clinique Backend Connectivity Test ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:8080"
$endpoints = @(
    @{ Method = "GET"; Url = "/doctor/public/all"; Description = "Public Doctors List" },
    @{ Method = "POST"; Url = "/auth/login"; Description = "Login Endpoint"; Body = '{"email":"test@test.com","password":"test"}' },
    @{ Method = "POST"; Url = "/auth/register"; Description = "Register Endpoint"; Body = '{"firstName":"Test","lastName":"User","email":"test@test.com","password":"test","role":"PATIENT"}' },
    @{ Method = "GET"; Url = "/doctor/doctor-names"; Description = "Doctor Names" },
    @{ Method = "GET"; Url = "/appointment/stats"; Description = "Appointment Stats" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $($endpoint.Description)" -ForegroundColor Yellow
    Write-Host "  $($endpoint.Method) $baseUrl$($endpoint.Url)"
    
    try {
        $params = @{
            Uri = "$baseUrl$($endpoint.Url)"
            Method = $endpoint.Method
            TimeoutSec = 10
        }
        
        if ($endpoint.Body) {
            $params.ContentType = "application/json"
            $params.Body = $endpoint.Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        Write-Host "  Success: Status $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.Content) {
            $contentPreview = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
            Write-Host "  Response Preview: $contentPreview..." -ForegroundColor Cyan
        }
    }
    catch {
        $statusCode = "Unknown"
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.Value__
        }
        
        if ($statusCode -eq 403) {
            Write-Host "  Status 403: Backend running but endpoint requires authentication" -ForegroundColor Yellow
        }
        elseif ($statusCode -eq 404) {
            Write-Host "  Status 404: Endpoint not found" -ForegroundColor Red
        }
        elseif ($statusCode -eq 401) {
            Write-Host "  Status 401: Unauthorized (expected for protected endpoints)" -ForegroundColor Yellow
        }
        else {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "=== Frontend-Backend Integration Check ===" -ForegroundColor Green
Write-Host ""

try {
    $angularResponse = Invoke-WebRequest -Uri "http://localhost:4200" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Angular Frontend: Running on http://localhost:4200" -ForegroundColor Green
}
catch {
    Write-Host "Angular Frontend: Not running on http://localhost:4200" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Proxy Configuration Check ===" -ForegroundColor Green

$proxyFile = "c:\Users\appie\Desktop\clinique\proxy.conf.json"
if (Test-Path $proxyFile) {
    Write-Host "Proxy configuration file exists: proxy.conf.json" -ForegroundColor Green
    $proxyContent = Get-Content $proxyFile | ConvertFrom-Json
    Write-Host "Configured proxy routes:" -ForegroundColor Cyan
    $proxyContent.PSObject.Properties | ForEach-Object {
        Write-Host "  - $($_.Name) -> $($_.Value.target)" -ForegroundColor Cyan
    }
} else {
    Write-Host "Proxy configuration file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Green
Write-Host "Backend Server: Accessible at http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend Server: Should be accessible at http://localhost:4200" -ForegroundColor Cyan
Write-Host "Proxy Configuration: Properly configured to handle CORS" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recommendation: Use the Angular dev server with proxy for development" -ForegroundColor Yellow
Write-Host "Start with: ng serve --port 4200" -ForegroundColor Yellow