# SDC Service Desk - Start Both Servers
# Run this script to start backend and frontend servers simultaneously

$backendPath = "c:\Users\banke\Desktop\Modified\backend\backend\backend"
$frontendPath = "c:\Users\banke\Desktop\Modified\frontend\frontend"
$pythonExe = "C:\Users\banke\Desktop\Modified\backend\backend\.venv\Scripts\python.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SDC Service Desk - Starting Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$pgConnection = & $pythonExe -c "from django.db import connection; connection.ensure_connection(); print('OK')" 2>$null

if ($pgConnection -match "OK") {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Could not verify PostgreSQL connection" -ForegroundColor Yellow
    Write-Host "   Make sure PostgreSQL is running on localhost:5432" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Django backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '$pythonExe' manage.py runserver 0.0.0.0:8000; Read-Host 'Press Enter to close'"

Start-Sleep -Seconds 2

Write-Host "Starting Angular frontend on http://localhost:4200..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start; Read-Host 'Press Enter to close'"

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
