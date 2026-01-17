# 🎯 Ingenium - Privacy-Centric Digital Identity Platform

## 📋 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Configure Database

1. Create MySQL database:
```sql
CREATE DATABASE ingenium_db;
```

2. Update backend/.env file with your database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ingenium_db
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### Step 3: Setup Database Tables

```bash
cd backend
npm run db:setup
```

This will:
- Create all necessary tables
- Set up relationships
- Create sample data:
  - Government Officer: officer@gov.in / password123
  - Hospital: hospital@example.com / password123

### Step 4: Run the Application

Option 1 - Run both frontend and backend together (from root):
```bash
npm run dev
```

Option 2 - Run separately:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 🔐 Demo Credentials

### User Account
1. Go to User Login
2. Register a new account with:
   - Aadhaar: Any 12-digit number
   - Fill in personal details
   - Email and password

### Hospital Account
- Email: hospital@example.com
- Password: password123

### Government Account
- Email: officer@gov.in
- Password: password123

---

## 🎯 User Flow

### For Citizens (User)

1. **Initial Registration**
   - Select "User" on home screen
   - Register with Aadhaar and personal details
   - Login to User Dashboard

2. **Medical Module**
   - From User Dashboard, select "Medical Services"
   - Create Medical Account (OTP verification)
   - Login to Medical Dashboard
   - Update medical profile
   - Grant hospital access
   - View medical records & bills
   - Check audit logs

3. **Farmer Module**
   - From User Dashboard, select "Farmer Services"
   - Create Farmer Account
   - Submit applications for subsidies/loans
   - Track application status

### For Hospitals

1. Register hospital or login
2. View patients who granted access
3. View patient details (based on granted scope)
4. Upload medical records (if permission granted)
5. Create medical bills

### For Government

1. Login with government credentials
2. View farmer applications
3. Review and update application status
4. Add official replies

---

## 🏗️ Architecture

### Backend Structure
```
backend/
├── config/          # Database configuration
├── models/          # Sequelize models
├── controllers/     # Business logic
├── routes/          # API routes
├── middleware/      # Auth & validation
├── utils/           # Helper functions
└── scripts/         # Setup scripts
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── context/     # React Context
│   ├── utils/       # API & helpers
│   └── App.js       # Main app component
```

### Database Schema
- **users** - Core citizen identity
- **medical_accounts** - Medical module accounts
- **hospital_access** - Hospital permissions
- **medical_records** - Patient records
- **medical_bills** - Billing information
- **audit_logs** - Immutable access logs
- **hospitals** - Hospital accounts
- **farmer_accounts** - Farmer module accounts
- **farmer_applications** - Farmer submissions
- **government_users** - Government officers

---

## ✨ Key Features

### Medical Module (Primary)
✅ Separate medical account with OTP verification
✅ Personal medical profile management
✅ Granular hospital access control (scope + permissions + duration)
✅ Immutable medical records
✅ Bills & insurance tracking
✅ Complete audit trail

### Farmer Module
✅ Farmer registration with KYC
✅ Document management
✅ Application submission (subsidies, loans, schemes)
✅ Government review tracking

### Security Features
✅ JWT-based authentication
✅ Password hashing with bcrypt
✅ OTP verification for sensitive operations
✅ Role-based access control
✅ Immutable audit logs
✅ Time-bound access permissions

---

## 🛠️ Technology Stack

### Frontend
- React 18
- React Router v6
- Axios
- Context API
- CSS3

### Backend
- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT
- bcrypt
- nodemailer

---

## 📝 API Endpoints

### Authentication
- POST /api/auth/user/register
- POST /api/auth/user/login
- POST /api/auth/hospital/register
- POST /api/auth/hospital/login
- POST /api/auth/government/login

### Medical Module
- GET /api/medical/account/status
- POST /api/medical/account/initiate
- POST /api/medical/account/create
- POST /api/medical/login
- GET /api/medical/profile
- PUT /api/medical/profile
- POST /api/medical/access/grant
- GET /api/medical/access/active
- PUT /api/medical/access/revoke/:id
- GET /api/medical/records
- GET /api/medical/bills
- GET /api/medical/audit-logs

### Farmer Module
- GET /api/farmer/account/status
- POST /api/farmer/account/create
- GET /api/farmer/profile
- GET /api/farmer/applications
- POST /api/farmer/applications

### Hospital
- GET /api/hospital/dashboard
- GET /api/hospital/patients
- GET /api/hospital/patient/:medical_id
- POST /api/hospital/records/upload
- POST /api/hospital/bills/create

### Government
- GET /api/government/dashboard
- GET /api/government/farmer/applications
- PUT /api/government/farmer/applications/:id
- GET /api/government/medical/:medical_id

---

## 🔧 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in backend/.env
- Verify database exists

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Change port in package.json or use PORT=3001 npm start

### OTP Not Sending
- In development, OTP is logged to console
- Check backend terminal for OTP codes
- For production, configure EMAIL_* variables in .env

---

## 📊 Testing the Application

1. **Register a User**
   - Create user account with Aadhaar

2. **Create Medical Account**
   - Access Medical Services
   - Complete OTP verification
   - Update medical profile

3. **Register a Hospital** (or use demo)
   - Login as hospital

4. **Grant Hospital Access**
   - As user, grant access to hospital
   - Set scope and duration

5. **View Patient Data**
   - As hospital, view patient details

6. **Submit Farmer Application**
   - Create farmer account
   - Submit application

7. **Review as Government**
   - Login as government officer
   - Review and approve/reject applications

---

## 🚀 Production Deployment

1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure proper email service
4. Enable HTTPS
5. Set up proper database backups
6. Configure CORS properly
7. Use environment variables for all secrets

---

## 📄 License

MIT License - Feel free to use for educational purposes

---

## 👥 Support

For issues or questions, please refer to the code documentation or create an issue in the repository.

---

**Built with ❤️ by Team CtrlAltWin**
