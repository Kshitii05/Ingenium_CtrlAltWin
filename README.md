# JanSetu - Privacy-Centric Digital Identity Platform

> **Note**: This repository is PUBLIC. IEEE AUSB ([IEEE-Ahmedabad-University-SB-Official](https://github.com/IEEE-Ahmedabad-University-SB-Official)) has been added as a contributor.

A comprehensive multi-entity digital identity web application focused on privacy-controlled healthcare data management, farmer services, and government verification systems.

---

## 📋 Project Overview

JanSetu is a privacy-centric digital identity platform that enables secure data sharing between citizens, hospitals, and government entities. The platform provides granular access control, time-bound permissions, and comprehensive audit logging for all data access operations.

### Key Features

#### 🏥 Medical Module (Primary)
- **Patient-Hospital System**: Secure medical record management
- **Granular Access Control**: Patients control what data hospitals can access
- **Time-Bound Permissions**: Access expires automatically after set duration
- **Document Management**: Upload, categorize, and share medical documents
- **Audit Logging**: Immutable logs of all data access and modifications
- **Hospital Registration**: HFR ID-based hospital authentication

#### 🌾 Farmer Module
- **KYC-Based Registration**: Secure farmer identification system
- **Agricultural Services**: Land records, crop management, and subsidies
- **Document Verification**: Upload and manage agricultural documents
- **Application Tracking**: Submit and monitor applications

#### 👤 User Module
- **Multi-Service Access**: Single login for medical and farmer services
- **Unified Dashboard**: Manage all services from one place
- **OTP Verification**: Secure account creation and sensitive operations
- **Privacy First**: Complete control over personal data sharing

---

## 🚀 Future Scope

#### 🏛️ Government Module (Coming Soon)
- **Multi-Department Access**: Health, Agriculture, Revenue, Welfare
- **Application Review**: Verify and process citizen applications
- **Role-Based Access**: Officer, Senior Officer, Admin roles
- **Audit Trail**: Complete transparency of government actions
- **Government Integration**: Direct integration with farmer and medical services

#### 🌐 Multi-Language Support
- **Language Switching**: Support for multiple regional languages (Hindi, Gujarati, etc.)
- **Accessibility**: Help users who are not fluent in English, especially farmers in rural areas
- **Dynamic Translation**: Real-time interface language switching
- **Localized Content**: Forms, instructions, and notifications in user's preferred language

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.x - Modern UI library with functional components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Context API** - State management
- **CSS3** - Custom styling with modular CSS

### Backend
- **Node.js** 18.x - JavaScript runtime
- **Express.js** 4.x - Web application framework
- **MySQL** 8.x - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Stateless authentication
- **bcryptjs** - Password hashing

### Security
- JWT-based authentication with role-based access control
- Password hashing with bcrypt (salt rounds: 10)
- OTP verification for sensitive operations
- Time-bound access permissions with automatic expiration
- Immutable audit logs for compliance
- No hardcoded secrets in repository ✅

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.x or higher
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Ingenium_CtrlAltWin.git
cd Ingenium_CtrlAltWin
```

### Step 2: Install Dependencies

#### Install all dependencies (backend + frontend):
```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Create `.env` file with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ingenium_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (Change this to a random secure string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS Origin
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Setup Database

```bash
# Make sure MySQL is running, then create the database
mysql -u root -p
```

In MySQL console:
```sql
CREATE DATABASE ingenium_db;
EXIT;
```

Run database setup script:
```bash
cd backend
node scripts/setupDatabase.js
```

### Step 5: Start the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Option 2: Run Both Concurrently (from root directory)
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🔐 Test Login Credentials

### User Account
- **Email**: kshiti@okicici
- **Password**: 12345
- **Medical ID**: MED-USR-19A73EC2

### Hospital Account
- **HFR ID**: 12345
- **Password**: 12345 (same as HFR ID)
- **Hospital Name**: Spandan

### Farmer Account (via KYC Registration)
- Register a new farmer through the Farmer KYC portal
- **Login**: Use email and auto-generated KYC ID as password
- **Format**: FRM-XX-2026-XXXXXX

> **Note**: Government module credentials will be available in future releases.

---

## 📁 Project Structure

```
Ingenium_CtrlAltWin/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection config
│   ├── controllers/
│   │   ├── authController.js    # User authentication
│   │   ├── medicalController.js # Medical records management
│   │   ├── hospitalController.js # Hospital operations
│   │   ├── farmerController.js   # Farmer services
│   │   └── governmentController.js # Gov operations
│   ├── middleware/
│   │   └── auth.js              # JWT & role-based auth
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── MedicalAccount.js    # Medical account model
│   │   ├── Hospital.js          # Hospital model
│   │   ├── FarmerAccount.js     # Farmer model
│   │   └── ...                  # Other models
│   ├── routes/
│   │   ├── auth/                # Auth routes
│   │   ├── medical/             # Medical routes
│   │   └── farmer/              # Farmer routes
│   ├── scripts/
│   │   └── setupDatabase.js     # Database setup script
│   ├── utils/
│   │   ├── jwt.js               # JWT utilities
│   │   └── otp.js               # OTP generation
│   ├── server.js                # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global auth state
│   │   ├── pages/
│   │   │   ├── User/            # User pages
│   │   │   ├── Medical/         # Medical pages
│   │   │   ├── Hospital/        # Hospital pages
│   │   │   ├── Farmer/          # Farmer pages
│   │   │   └── Government/      # Government pages
│   │   ├── utils/
│   │   │   └── api.js           # Axios config
│   │   ├── App.js               # Main app component
│   │   └── index.js             # Entry point
│   └── package.json
├── README.md
└── package.json
```

---

## 🔧 Basic Error Handling

### Common Issues & Solutions

#### 1. Database Connection Error
**Error**: `Cannot connect to database`
**Solution**: 
- Ensure MySQL is running: `mysql -u root -p`
- Verify credentials in `.env` file
- Check if database exists: `SHOW DATABASES;`

#### 2. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`
**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

#### 3. JWT Token Invalid
**Error**: `Access denied. No token provided.`
**Solution**: 
- Clear browser localStorage
- Login again to get new token

#### 4. CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**: 
- Ensure backend `CORS_ORIGIN` in `.env` matches frontend URL
- Default should be `http://localhost:3000`

#### 5. File Upload Error
**Error**: `Failed to upload file`
**Solution**:
- Check `uploads/medical-files` directory exists in backend
- Verify file size is under 10MB
- Ensure file type is allowed (PDF, DOC, DOCX, JPG, PNG)

---

## 🔒 Security Confirmation

✅ **No secrets or credentials are hardcoded in this repository**

All sensitive information must be configured through environment variables:
- Database credentials
- JWT secret keys
- API keys
- Passwords

The `.env` file is listed in `.gitignore` and should NEVER be committed to the repository.

---

## 🧪 Testing

### Manual Testing Steps

1. **User Registration & Login**
   - Register new user account
   - Login with credentials

2. **Medical Record Management**
   - Create medical account
   - Upload documents
   - Grant hospital access
   - Verify access expiration

3. **Hospital Access**
   - Register hospital with HFR ID
   - Login and query patient
   - Download patient documents
   - Upload hospital records

4. **Farmer Services**
   - Complete KYC registration
   - Login with KYC ID
   - Submit applications
   - View application status

> **Note**: Government dashboard testing will be available in future releases.

---

## 📝 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - OTP verification

### Medical Endpoints
- `POST /medical/create` - Create medical account
- `GET /medical/profile` - Get medical profile
- `POST /medical/access/grant` - Grant hospital access
- `GET /medical/access/active` - Get active access list
- `POST /medical/files` - Upload medical file

### Hospital Endpoints
- `POST /hospital/register` - Register hospital
- `POST /hospital/login` - Hospital login
- `POST /hospital/query-patient` - Query patient data
- `GET /hospital/patient-docs/:patient_id` - Get patient documents
- `POST /hospital/upload-doc/:patient_id` - Upload document for patient

### Farmer Endpoints
- `POST /farmer/kyc/register` - KYC registration
- `POST /farmer/kyc/login` - Farmer login
- `GET /farmer/profile` - Get farmer profile
- `POST /farmer/applications` - Submit application

> **Note**: Government API endpoints will be added in future releases.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Contributors

- IEEE Ahmedabad University SB ([IEEE-Ahmedabad-University-SB-Official](https://github.com/IEEE-Ahmedabad-University-SB-Official))
- Kshitii05 (Team leader - Kshiti Bhavsar)
- AnanyaGupta181005 (Team member - Ananya Gupta)
- suhani-lakhera (Team member - Suhani Lakhera)

---


