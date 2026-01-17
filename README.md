# Ingenium - Privacy-Centric Digital Identity Platform

A comprehensive multi-login digital identity web application with focus on healthcare data management.

## Features

- **Multi-Entity Login System**: User, Hospital, and Government Entity access
- **Medical Module** (Primary): Patient-Hospital system with privacy controls
- **Farmer Module** (Secondary): Agricultural services and KYC
- **Government Module**: Verification and authority access

## Tech Stack

### Frontend
- React (Functional Components)
- React Router
- Tailwind CSS
- Axios
- Context API

### Backend
- Node.js + Express
- MySQL Database
- Sequelize ORM
- JWT Authentication
- bcrypt for password hashing

## Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` in backend directory
   - Update database credentials

3. Setup database:
```bash
cd backend
npm run db:setup
```

4. Run the application:
```bash
npm run dev
```

## Project Structure

```
Ingenium_CtrlAltWin/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.js
│   └── public/
└── README.md
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- OTP verification for sensitive operations
- Granular access control
- Immutable audit logs
- Time-bound hospital access permissions

## Usage

1. Select entity type (User/Hospital/Government)
2. Login or create account
3. Access respective dashboards and modules
4. Manage permissions and data privacy

## License

MIT
