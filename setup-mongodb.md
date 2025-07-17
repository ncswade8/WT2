# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/atlas/database
2. Click "Start Free" and sign up
3. Choose the FREE tier (M0)

## Step 2: Create Database
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to you
5. Click "Create"

## Step 3: Create Database User
1. In left menu, click "Database Access"
2. Click "Add New Database User"
3. Set username: `user-tracker-admin`
4. Set password: `your-secure-password`
5. Select "Read and write to any database"
6. Click "Add User"

## Step 4: Allow Your IP
1. In left menu, click "Network Access"
2. Click "Add IP Address"
3. Click "Add Current IP Address"
4. Click "Confirm"

## Step 5: Get Connection String
1. In left menu, click "Clusters"
2. Click "Connect" button
3. Choose "Connect your application"
4. Copy the connection string

## Step 6: Update Your .env File
Create or edit `.env` file in your project root:

```env
PORT=5000
MONGODB_URI=mongodb+srv://user-tracker-admin:your-secure-password@cluster0.xxxxx.mongodb.net/user-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
```

**Replace:**
- `your-secure-password` with the password you set
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

## Step 7: Restart Your Server
```bash
npm run dev
```

You should see: "Connected to MongoDB" instead of "In-Memory (Testing Mode)"

## Step 8: Test Data Persistence
1. Register a user at http://localhost:3000
2. Check MongoDB Atlas dashboard
3. Go to "Browse Collections" in your cluster
4. You'll see a `user-tracker` database with `users` and `registrationtrackings` collections

## View Data in MongoDB Atlas
1. In Atlas dashboard, click your cluster
2. Click "Browse Collections"
3. Navigate to `user-tracker` database
4. View `users` collection to see registered users
5. View `registrationtrackings` collection to see activity logs 