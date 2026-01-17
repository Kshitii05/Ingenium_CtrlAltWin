# Fix database constraint issues

Write-Host "Fixing database tables for unique constraint migrations..." -ForegroundColor Cyan
Write-Host ""

# SQL commands to fix the issue
$sqlCommands = @"
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS hospital_access;
DROP TABLE IF EXISTS hospital_accesses;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS farmer_applications;
DROP TABLE IF EXISTS farmer_documents;
DROP TABLE IF EXISTS farmer_accounts;
SET FOREIGN_KEY_CHECKS = 1;
"@

Write-Host "SQL Commands to execute:" -ForegroundColor Yellow
Write-Host $sqlCommands -ForegroundColor Gray
Write-Host ""

# Save to temp file
$tempFile = "$env:TEMP\fix-hospitals.sql"
$sqlCommands | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Saved SQL to: $tempFile" -ForegroundColor Green
Write-Host ""
Write-Host "Please enter your MySQL root password when prompted" -ForegroundColor Yellow
Write-Host ""

# Execute with MySQL
& mysql -u root -p ingenium_db -e "source $tempFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: Tables dropped successfully!" -ForegroundColor Green
    Write-Host "The server will recreate them with the correct schema on startup" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to drop tables. Error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Try running these commands manually in MySQL:" -ForegroundColor Yellow
    Write-Host $sqlCommands -ForegroundColor Gray
}

# Clean up
Remove-Item $tempFile -ErrorAction SilentlyContinue
