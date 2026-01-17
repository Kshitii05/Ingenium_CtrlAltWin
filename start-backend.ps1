# Quick Start Script for Backend

Write-Host "`n🔄 Restarting Ingenium Backend with New Features..." -ForegroundColor Cyan

# Stop all existing node processes
Write-Host "`n1️⃣ Stopping existing node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Navigate to backend directory
Set-Location "c:\Users\Kshiti\Desktop\CtrlAltWin\Ingenium_CtrlAltWin\backend"

# Start server
Write-Host "`n2️⃣ Starting backend server..." -ForegroundColor Yellow
Write-Host "   Server will run on http://localhost:5000" -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Gray

node server.js
