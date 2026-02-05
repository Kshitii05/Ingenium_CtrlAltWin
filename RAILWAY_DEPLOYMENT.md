# 🚂 Railway Deployment Guide for Ingenium Platform

This guide will help you deploy the Ingenium platform (React + Node.js + MySQL) on Railway.

## Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app)
- Your code pushed to a GitHub repository

---

## Step 1: Push Code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2: Create Railway Project

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub repositories
5. Select your Ingenium repository

---

## Step 3: Add MySQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Railway will create a MySQL instance
4. Click on the MySQL service to see connection details
5. Note these variables (Railway provides them automatically):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

---

## Step 4: Deploy Backend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Configure the service:
   - **Service Name**: `ingenium-backend`
   - **Root Directory**: `backend`
   - **Build Command**: (leave default)
   - **Start Command**: `npm start`

### Add Environment Variables:

Click on the backend service → **"Variables"** tab → Add these:

```env
NODE_ENV=production
PORT=5000

# Database (use Railway's provided variables)
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google AI API (for Medical Chatbot)
GOOGLE_API_KEY=your-google-gemini-api-key

# Frontend URL (will update after frontend deployment)
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
```

4. Click **"Settings"** → Enable **"Public Networking"**
5. Copy your backend URL (e.g., `https://ingenium-backend-production.up.railway.app`)

---

## Step 5: Run Database Setup

1. Click on backend service → **"Settings"** → **"Environment"**
2. Go to **"Settings"** → **"Deploy"** → Click the 3 dots → **"One-Off Shell"**
3. Run:
   ```bash
   npm run db:setup
   ```
4. This will create all necessary database tables

---

## Step 6: Deploy Frontend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Configure the service:
   - **Service Name**: `ingenium-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -p $PORT`

### Add Environment Variables:

Click on the frontend service → **"Variables"** tab:

```env
REACT_APP_API_URL=https://YOUR-BACKEND-URL.up.railway.app/api
```

Replace `YOUR-BACKEND-URL` with the backend URL from Step 4.

4. Click **"Settings"** → Enable **"Public Networking"**
5. Copy your frontend URL (e.g., `https://ingenium-frontend-production.up.railway.app`)

---

## Step 7: Update Backend CORS

1. Go back to the **backend service** → **"Variables"**
2. Update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://YOUR-FRONTEND-URL.up.railway.app
   ```
3. Backend will automatically redeploy

---

## Step 8: Verify Deployment

1. Open your frontend URL in a browser
2. Try logging in as different user types
3. Test file uploads and key features
4. Check backend logs for any errors:
   - Click backend service → **"Deployments"** → **"View Logs"**

---

## Important Notes

### File Uploads
- Railway's ephemeral filesystem means uploaded files will be lost on redeploy
- **Solution**: Integrate cloud storage (AWS S3, Cloudinary) for production
- Add this to your backend:
  ```bash
  npm install aws-sdk multer-s3
  ```

### Database Backups
- Railway provides automatic backups on paid plans
- Alternatively, set up scheduled exports

### Environment Variables
- Never commit `.env` files to GitHub
- Use `.env.example` as a template
- Add sensitive values only in Railway dashboard

### Custom Domain (Optional)
1. Go to frontend service → **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Add your domain and configure DNS

---

## Troubleshooting

### Backend won't start:
- Check logs: Backend service → **"Deployments"** → **"View Logs"**
- Verify all environment variables are set
- Ensure database connection variables are correct

### Frontend shows API errors:
- Verify `REACT_APP_API_URL` is correct in frontend variables
- Check CORS settings in backend
- Ensure backend is deployed and running

### Database connection failed:
- Verify MySQL service is running
- Check database variables are correctly referenced: `${{MySQL.MYSQLHOST}}`
- Try restarting backend service

### File uploads fail:
- Check upload directories exist (backend creates them automatically)
- Consider implementing AWS S3 for persistent storage

---

## Cost Estimation

Railway provides **$5 free credit per month** for hobby projects:
- MySQL Database: ~$1-2/month
- Backend Service: ~$2-3/month
- Frontend Service: ~$1-2/month

**Total**: ~$4-7/month (covered by free tier initially)

---

## Alternative: Use Railway Template

Railway also supports one-click deployment templates. You can create a `railway.json` or `railway.toml` file for faster deployment.

---

## Support

For issues with Railway deployment:
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Your repository

---

**Congratulations! Your Ingenium platform is now live on Railway! 🎉**
