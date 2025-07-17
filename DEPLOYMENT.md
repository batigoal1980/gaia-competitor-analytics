# Deployment Guide

## Overview
This application consists of:
- **Frontend**: React + Vite (runs on port 3000)
- **Backend**: Express.js server (runs on port 5001)
- **Database**: MongoDB

## Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard**:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://your-app.railway.app`)

### Backend Deployment (Railway)

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Connect your GitHub repository**

3. **Deploy the backend**:
   - Railway will automatically detect your Node.js app
   - Set environment variables:
     - `PORT`: 5001
     - `MONGODB_URI`: Your MongoDB connection string

4. **Update Vercel configuration**:
   - Replace `https://your-backend-url.com` in `vercel.json` with your Railway URL

## Option 2: Netlify (Frontend) + Render (Backend)

### Frontend Deployment (Netlify)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repository

3. **Set environment variables**:
   - `VITE_API_BASE_URL`: Your backend URL

### Backend Deployment (Render)

1. **Create Render account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `node server.cjs`

3. **Set environment variables**:
   - `PORT`: 5001
   - `MONGODB_URI`: Your MongoDB connection string

## Option 3: Full Stack Deployment (Railway)

1. **Deploy both frontend and backend to Railway**:
   - Create two services in Railway
   - Frontend service: Build command `npm run build`, start command `npm run preview`
   - Backend service: Start command `node server.cjs`

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend
```
PORT=5001
MONGODB_URI=mongodb://your-mongodb-connection-string
```

## Post-Deployment Checklist

1. ✅ Frontend is accessible
2. ✅ Backend API endpoints are working
3. ✅ Database connection is established
4. ✅ CORS is properly configured
5. ✅ Environment variables are set correctly

## Troubleshooting

### Common Issues:
- **CORS errors**: Ensure backend CORS is configured for your frontend domain
- **API 404 errors**: Check that API routes are properly configured
- **Database connection**: Verify MongoDB connection string and network access

### Debug Commands:
```bash
# Test backend locally
npm run server

# Test frontend build
npm run build
npm run preview

# Check environment variables
echo $VITE_API_BASE_URL
``` 