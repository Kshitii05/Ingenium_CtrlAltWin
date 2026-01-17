# Backend API Testing Script
# Tests all new Medical and Farmer endpoints

$BASE_URL = "http://localhost:5000/api"

Write-Host "`n🧪 Testing New Backend APIs`n" -ForegroundColor Cyan

# Test counters
$passed = 0
$failed = 0

function Test-Endpoint {
    param($Name, $Method, $Url, $Body = $null, $Headers = @{})
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = "$BASE_URL$Url"
            Method = $Method
            ContentType = "application/json"
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host " ✅ PASS" -ForegroundColor Green
        $script:passed++
        return $response
    } catch {
        Write-Host " ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

# ==================== FARMER KYC TESTS ====================
Write-Host "`n📋 Testing Farmer KYC System" -ForegroundColor Yellow

# 1. Get States List
Test-Endpoint "Get Indian States List" "GET" "/farmer/states"

# 2. Farmer KYC Registration
$timestamp = Get-Date -Format "HHmmss"
$farmerData = @{
    full_name = "Test Farmer $timestamp"
    aadhaar = "123456${timestamp}"
    mobile = "98765432${timestamp.Substring(0,2)}"
    email = "farmer${timestamp}@test.com"
    city = "Mumbai"
    state = "Maharashtra"
    land_ownership = "own"
    land_area = 5.5
    village = "Test Village"
    taluka = "Test Taluka"
    district = "Mumbai"
    pincode = "400001"
    crop_type = "Rice"
    bank_account = "1234567890123456"
    bank_ifsc = "HDFC0001234"
    bank_name = "HDFC Bank"
    username = "farmer${timestamp}"
    password = "password123"
}

$farmerReg = Test-Endpoint "Farmer KYC Registration" "POST" "/farmer/kyc-register" $farmerData

if ($farmerReg) {
    Write-Host "   KYC ID: $($farmerReg.kyc_id)" -ForegroundColor Cyan
    
    # 3. Farmer Login
    $farmerLogin = Test-Endpoint "Farmer Login" "POST" "/farmer/login" @{
        username = $farmerData.username
        password = $farmerData.password
    }
    
    if ($farmerLogin) {
        $farmerToken = $farmerLogin.token
        Write-Host "   Token: $($farmerToken.Substring(0,20))..." -ForegroundColor Cyan
        
        # 4. Get Farmer Profile
        Test-Endpoint "Get Farmer Profile" "GET" "/farmer/profile" -Headers @{
            Authorization = "Bearer $farmerToken"
        }
        
        # 5. Update Farmer Profile
        Test-Endpoint "Update Farmer Profile" "PUT" "/farmer/profile" @{
            city = "Pune"
        } -Headers @{
            Authorization = "Bearer $farmerToken"
        }
    }
}

# ==================== MEDICAL FILE TESTS ====================
Write-Host "`n📁 Testing Medical File & Folder System" -ForegroundColor Yellow

# First, create a medical user
$userReg = Test-Endpoint "Register User for Medical" "POST" "/auth/register" @{
    email = "medtest${timestamp}@test.com"
    password = "password123"
    name = "Medical Test User"
    aadhaar_number = "987654${timestamp}"
    dob = "1990-01-01"
    gender = "Male"
    phone = "9876543210"
}

if ($userReg) {
    # Create medical account
    $medAccount = Test-Endpoint "Create Medical Account" "POST" "/medical/create-account" @{
        medical_email = "medaccount${timestamp}@test.com"
        medical_password = "medpass123"
        blood_group = "O+"
        gender = "Male"
        date_of_birth = "1990-01-01"
        phone_number = "9876543210"
        emergency_contact_name = "Emergency Contact"
        emergency_contact_phone = "9876543211"
        emergency_contact_relation = "spouse"
    } -Headers @{
        Authorization = "Bearer $($userReg.token)"
    }
    
    if ($medAccount) {
        # Login as medical user
        $medLogin = Test-Endpoint "Medical Login" "POST" "/medical/login" @{
            medical_email = "medaccount${timestamp}@test.com"
            medical_password = "medpass123"
        }
        
        if ($medLogin) {
            $medToken = $medLogin.token
            Write-Host "   Medical ID: $($medLogin.medicalAccount.medical_id)" -ForegroundColor Cyan
            
            # 6. Create Root Folder
            $folder = Test-Endpoint "Create Folder" "POST" "/medical/folders" @{
                folder_name = "Medical Reports"
            } -Headers @{
                Authorization = "Bearer $medToken"
            }
            
            if ($folder) {
                # 7. Create Subfolder
                $subfolder = Test-Endpoint "Create Subfolder" "POST" "/medical/folders" @{
                    folder_name = "2026"
                    parent_id = $folder.folder.id
                } -Headers @{
                    Authorization = "Bearer $medToken"
                }
                
                # 8. Get Folders
                Test-Endpoint "Get Folder Tree" "GET" "/medical/folders" -Headers @{
                    Authorization = "Bearer $medToken"
                }
                
                # 9. Rename Folder
                Test-Endpoint "Rename Folder" "PUT" "/medical/folders/$($folder.folder.id)" @{
                    new_name = "Updated Reports"
                } -Headers @{
                    Authorization = "Bearer $medToken"
                }
                
                # 10. Get Files
                Test-Endpoint "Get Files" "GET" "/medical/files" -Headers @{
                    Authorization = "Bearer $medToken"
                }
                
                # Note: File upload requires multipart/form-data, skipping in script
                Write-Host "   ⚠ File upload requires multipart/form-data (test manually)" -ForegroundColor Yellow
            }
        }
    }
}

# ==================== RESULTS ====================
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host " TEST RESULTS" -ForegroundColor White
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host " ✅ Passed: $passed" -ForegroundColor Green
Write-Host " ❌ Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n🎉 All tests passed! Backend is ready for frontend integration.`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠ Some tests failed. Check backend logs and fix issues.`n" -ForegroundColor Yellow
}
