# SDC Service Desk - Start Both Servers
# Run this script to start backend and frontend servers simultaneously

$repoRoot = $PSScriptRoot
$backendRoot = Join-Path $repoRoot "backend\backend"
$backendPath = Join-Path $backendRoot "backend"
$frontendPath = Join-Path $repoRoot "frontend\frontend"
$pythonExe = Join-Path $backendRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $backendPath)) {
    Write-Host "Backend path not found: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "Frontend path not found: $frontendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $pythonExe)) {
    Write-Host "Python executable not found: $pythonExe" -ForegroundColor Red
    Write-Host "Create the backend virtual environment first." -ForegroundColor Yellow
    exit 1
}

$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCommand) {
    $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
}
if (-not $npmCommand) {
    Write-Host "npm was not found in PATH. Install Node.js and try again." -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SDC Service Desk - Starting Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$useLocalDbHostOverride = $false
$envFilePath = Join-Path $backendPath "backend\.env"
$configuredDbHost = $null
if (Test-Path $envFilePath) {
    $dbHostLine = Get-Content $envFilePath | Where-Object { $_ -match '^DB_HOST=' } | Select-Object -First 1
    if ($dbHostLine) {
        $configuredDbHost = ($dbHostLine -replace '^DB_HOST=', '').Trim()
    }
}

Push-Location $backendPath
$pgConnection = & $pythonExe -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings'); import django; django.setup(); from django.db import connection; connection.ensure_connection(); print('OK')" 2>$null
Pop-Location

if ($pgConnection -match "OK") {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    if ($configuredDbHost -eq "db") {
        Write-Host "⚠️  DB_HOST is 'db' (Docker host). Applying local override DB_HOST=localhost for this session." -ForegroundColor Yellow
        $env:DB_HOST = "localhost"
        $useLocalDbHostOverride = $true

        Push-Location $backendPath
        $pgConnection = & $pythonExe -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings'); import django; django.setup(); from django.db import connection; connection.ensure_connection(); print('OK')" 2>$null
        Pop-Location

        if ($pgConnection -match "OK") {
            Write-Host "✅ PostgreSQL is running (using DB_HOST=localhost override)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Warning: Could not verify PostgreSQL connection even after DB_HOST override" -ForegroundColor Yellow
            Write-Host "   Make sure PostgreSQL is running on localhost:5432" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Warning: Could not verify PostgreSQL connection" -ForegroundColor Yellow
        Write-Host "   Make sure PostgreSQL is running on localhost:5432" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Starting Django backend on http://localhost:8000..." -ForegroundColor Yellow
$bootstrapStatus = $null
Write-Host "Bootstrapping default admin and seed data..." -ForegroundColor Yellow
Push-Location $backendPath
$bootstrapStatus = & $pythonExe manage.py bootstrap_defaults 2>&1
Pop-Location
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Bootstrap command failed. Backend may still start, but initial login/seed data might be missing." -ForegroundColor Yellow
    Write-Host "   Details: $bootstrapStatus" -ForegroundColor Yellow
} else {
    Write-Host "✅ Bootstrap complete (admin + seed data ready)" -ForegroundColor Green
}

if ($useLocalDbHostOverride) {
    Write-Host "Using DB_HOST=localhost override for backend process in this shell session." -ForegroundColor Cyan
}

$backendProcess = Start-Process -FilePath $pythonExe -WorkingDirectory $backendPath -ArgumentList "manage.py", "runserver", "0.0.0.0:8000" -PassThru

Start-Sleep -Seconds 2

Write-Host "Starting Angular frontend on http://localhost:4200..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath $npmCommand.Source -WorkingDirectory $frontendPath -ArgumentList "start" -PassThru

Start-Sleep -Seconds 3
if ($backendProcess.HasExited) {
    Write-Host "⚠️  Backend process exited immediately (PID $($backendProcess.Id))." -ForegroundColor Yellow
}
if ($frontendProcess.HasExited) {
    Write-Host "⚠️  Frontend process exited immediately (PID $($frontendProcess.Id))." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Both servers starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  • Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:8000/api/" -ForegroundColor White
Write-Host "  • Login: admin / 123" -ForegroundColor White
Write-Host ""
Write-Host "Waiting for servers to start (30 seconds)..." -ForegroundColor Yellow

Start-Sleep -Seconds 30

# Try to open frontend in browser
Write-Host "Opening frontend in default browser..." -ForegroundColor Yellow
Start-Process "http://localhost:4200"

Write-Host ""
Write-Host "✅ Setup complete! Check the new PowerShell windows for server logs." -ForegroundColor Green
