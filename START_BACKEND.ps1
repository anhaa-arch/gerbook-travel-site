# Backend Server Starter Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GERBOOK TRAVEL - BACKEND SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check MySQL
Write-Host "[1/3] Checking MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq "Running") {
    Write-Host "✓ MySQL is running" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL is NOT running!" -ForegroundColor Red
    Write-Host "Please start MySQL from Services or XAMPP" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check .env file
Write-Host ""
Write-Host "[2/3] Checking .env configuration..." -ForegroundColor Yellow
$envPath = ".\tusul_back\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "JWT_SECRET") {
        Write-Host "✓ JWT_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "✗ JWT_SECRET not found in .env" -ForegroundColor Red
        exit 1
    }
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✓ DATABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "✗ DATABASE_URL not found in .env" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host ""
Write-Host "[3/3] Starting Backend Server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend will start on Port 8000" -ForegroundColor Cyan
Write-Host "  GraphQL: http://localhost:8000/graphql" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location .\tusul_back
npm start

