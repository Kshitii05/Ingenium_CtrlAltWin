# Ingenium Setup Script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Ingenium Application Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
try {
    $mysqlVersion = & mysql --version 2>$null
    if ($mysqlVersion) {
        Write-Host "MySQL is installed: $mysqlVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "MySQL not found in PATH. Please install MySQL 8.0+ first." -ForegroundColor Red
    Write-Host "  Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Database Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get MySQL credentials
Write-Host "Please enter your MySQL credentials:" -ForegroundColor Yellow
$dbUser = Read-Host "MySQL Username (default: root)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "root"
}

$dbPassword = Read-Host "MySQL Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# Create database
Write-Host ""
Write-Host "Creating database 'ingenium_db'..." -ForegroundColor Yellow

$createDbQuery = "CREATE DATABASE IF NOT EXISTS ingenium_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    & mysql -u $dbUser -p"$dbPasswordPlain" -e $createDbQuery 2>$null
    Write-Host "Database created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to create database. Please check your credentials." -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Update .env file
Write-Host ""
Write-Host "Updating backend/.env file..." -ForegroundColor Yellow

$envPath = "backend\.env"
$envContent = Get-Content $envPath -Raw

# Update DB_USER
$envContent = $envContent -replace 'DB_USER=.*', "DB_USER=$dbUser"

# Update DB_PASSWORD
$dbPasswordEscaped = $dbPasswordPlain -replace '\\', '\\\\'
$envContent = $envContent -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$dbPasswordEscaped"

# Write back to file
Set-Content -Path $envPath -Value $envContent -NoNewline
Write-Host "Environment file updated!" -ForegroundColor Green

# Optional: Configure email for OTP
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Email Configuration (Optional)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email is required for OTP verification in Medical Account creation." -ForegroundColor Yellow
Write-Host "You can skip this now and configure later in backend/.env" -ForegroundColor Yellow
Write-Host ""

$configureEmail = Read-Host "Configure email now? (y/N)"
if ($configureEmail -eq 'y' -or $configureEmail -eq 'Y') {
    $emailUser = Read-Host "Gmail address"
    $emailPassword = Read-Host "Gmail App Password" -AsSecureString
    $emailPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPassword))
    
    # Update email configuration
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace 'EMAIL_USER=.*', "EMAIL_USER=$emailUser"
    $envContent = $envContent -replace 'EMAIL_PASSWORD=.*', "EMAIL_PASSWORD=$emailPasswordPlain"
    Set-Content -Path $envPath -Value $envContent -NoNewline
    
    Write-Host "Email configuration updated!" -ForegroundColor Green
} else {
    Write-Host "Skipping email configuration. Medical account creation will not work until configured." -ForegroundColor Yellow
}

# Initialize database with tables and sample data
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Database Initialization" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Initializing database tables and sample data..." -ForegroundColor Yellow

Set-Location backend
try {
    npm run db:setup
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database initialized successfully!" -ForegroundColor Green
    } else {
        throw "Database setup failed"
    }
} catch {
    Write-Host "Database initialization failed." -ForegroundColor Red
    Write-Host "  You can try manually with: cd backend; npm run db:setup" -ForegroundColor Yellow
}
Set-Location ..

# Final instructions
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start the application:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Open your browser:" -ForegroundColor White
Write-Host "     Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "     Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. Demo credentials (see SETUP_GUIDE.md):" -ForegroundColor White
Write-Host "     Hospital: hospital@example.com / password123" -ForegroundColor Yellow
Write-Host "     Government: officer@gov.in / password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed documentation, see:" -ForegroundColor White
Write-Host "  - SETUP_GUIDE.md - Setup and usage guide" -ForegroundColor Yellow
Write-Host "  - ARCHITECTURE.md - System architecture" -ForegroundColor Yellow
Write-Host "  - FILE_STRUCTURE.md - File descriptions" -ForegroundColor Yellow
Write-Host ""
