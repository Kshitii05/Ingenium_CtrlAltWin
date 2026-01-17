# Medical Module - Quick Start Guide

## ✅ Status: FULLY FUNCTIONAL
The medical registration issue has been **completely resolved**. All systems are operational.

## Backend Setup

### 1. Start the Server
```bash
cd backend
node server.js
```

You should see:
```
✅ Database connection established successfully
✅ Database synchronized
🚀 Server running on port 5000
```

## API Endpoints

### 1. Register User (Required First)
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "aadhaar_number": "123456789012",
  "dob": "1990-01-15",
  "gender": "Male",
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "email": "user@example.com", ... }
}
```

### 2. Create Medical Account
```http
POST http://localhost:5000/api/medical/create-account
Authorization: Bearer <user_token_from_step_1>
Content-Type: application/json

{
  "medical_email": "medical@example.com",
  "medical_password": "medicalPass123",
  "blood_group": "O+",
  "gender": "Male",
  "date_of_birth": "1990-01-15",
  "phone_number": "9876543210",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "9876543211",
  "emergency_contact_relation": "spouse"
}
```

**Response:**
```json
{
  "message": "Medical account created successfully",
  "medicalAccount": {
    "id": 1,
    "medical_id": "MED-USR-A1B2C3D4",  ← Auto-generated!
    "medical_email": "medical@example.com",
    "blood_group": "O+",
    "gender": "Male",
    ...
  }
}
```

### 3. Medical Login
```http
POST http://localhost:5000/api/medical/login
Content-Type: application/json

{
  "medical_email": "medical@example.com",
  "medical_password": "medicalPass123"
}
```

**Response:**
```json
{
  "message": "Medical login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "medicalAccount": {
    "medical_id": "MED-USR-A1B2C3D4",
    "medical_email": "medical@example.com",
    ...
  }
}
```

## Frontend Usage

### Navigate to Medical Module
```
http://localhost:3000/  → Select "Medical User"
```

### Create Medical Account
1. First register/login as regular user
2. Click "Create Medical Account"
3. Fill in the form
4. Medical ID is **automatically generated** - no need to provide it
5. Submit and login with medical credentials

## Testing with PowerShell

```powershell
# Quick test script
$time = (Get-Date -Format "HHmmss")

# 1. Register user
$user = Invoke-RestMethod "http://localhost:5000/api/auth/register" -Method Post -Body (@{
  email = "user$time@test.com"
  password = "pass123"
  name = "Test User"
  aadhaar_number = "$time"
  dob = "1990-01-01"
  gender = "Male"
  phone = "9876543210"
} | ConvertTo-Json) -ContentType "application/json"

# 2. Create medical account
$medical = Invoke-RestMethod "http://localhost:5000/api/medical/create-account" -Method Post -Body (@{
  medical_email = "med$time@test.com"
  medical_password = "medpass"
  blood_group = "AB+"
  gender = "Male"
  date_of_birth = "1990-01-01"
  phone_number = "9876543210"
  emergency_contact_name = "Emergency Contact"
  emergency_contact_phone = "9876543211"
  emergency_contact_relation = "spouse"
} | ConvertTo-Json) -ContentType "application/json" -Headers @{
  Authorization = "Bearer $($user.token)"
}

Write-Host "Medical ID: $($medical.medicalAccount.medical_id)"
```

## Common Issues & Solutions

### ❌ "medical_id cannot be null"
**Status:** FIXED ✅  
**Solution:** Already implemented in MedicalAccount.js using `beforeValidate` hook

### ❌ "Cannot connect to server"
**Solution:** 
```bash
cd backend
node server.js
```

### ❌ "Database connection failed"
**Solution:** Check MySQL is running and credentials in backend/config/database.js

### ❌ "Token expired"
**Solution:** Login again to get new token (tokens expire after 7 days)

## Database Verification

Check if medical account was created:
```sql
USE ingenium_db;
SELECT medical_id, medical_email, blood_group, gender, is_active 
FROM medical_accounts 
ORDER BY created_at DESC 
LIMIT 10;
```

Expected result:
```
+------------------+-------------------------+-------------+--------+-----------+
| medical_id       | medical_email           | blood_group | gender | is_active |
+------------------+-------------------------+-------------+--------+-----------+
| MED-USR-A1B2C3D4 | medical@example.com     | O+          | Male   |         1 |
+------------------+-------------------------+-------------+--------+-----------+
```

## Key Features

✅ Auto-generated Medical IDs (format: MED-USR-XXXXXXXX)  
✅ Separate medical and user authentication  
✅ Secure password hashing with bcrypt  
✅ Complete medical profile management  
✅ Hospital access control system  
✅ Medical records and bills tracking  
✅ Audit logging for all actions  
✅ Emergency contact management  

## Next Steps

1. **Frontend:** Start React app (`cd frontend; npm start`)
2. **Test:** Navigate to http://localhost:3000
3. **Create:** Register user → Create medical account → Login with medical credentials
4. **Verify:** Check database for new medical_id entry

## Support

If you encounter any issues:
1. Check backend terminal for error logs
2. Verify database is running: `mysql -u root -p`
3. Review [MEDICAL_REGISTRATION_FIX.md](./MEDICAL_REGISTRATION_FIX.md) for details
4. Check browser console for frontend errors

---
**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
