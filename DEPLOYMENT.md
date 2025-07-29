# 🚀 Production Deployment Guide

## Option 1: Deploy to Heroku (Recommended)

### Prerequisites
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Create a [Heroku account](https://signup.heroku.com/)

### Step 1: Prepare Your Application

1. **Update MongoDB URI** (if needed):
   - Replace `<Y8kWb95MKqWuiIDL>` with your actual MongoDB password
   - Or create a new MongoDB Atlas cluster

2. **Generate a secure JWT secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Step 2: Deploy to Heroku

1. **Login to Heroku**:
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
   heroku config:set JWT_SECRET="your-secure-jwt-secret"
   ```

4. **Deploy your application**:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push heroku main
   ```

5. **Open your app**:
   ```bash
   heroku open
   ```

## Option 2: Deploy to Railway

### Prerequisites
1. Create a [Railway account](https://railway.app/)
2. Install Railway CLI: `npm i -g @railway/cli`

### Deployment Steps

1. **Login to Railway**:
   ```bash
   railway login
   ```

2. **Initialize Railway project**:
   ```bash
   railway init
   ```

3. **Set environment variables** in Railway dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI=your-mongodb-atlas-uri`
   - `JWT_SECRET=your-secure-jwt-secret`

4. **Deploy**:
   ```bash
   railway up
   ```

## Option 3: Deploy to Render

### Prerequisites
1. Create a [Render account](https://render.com/)

### Deployment Steps

1. **Connect your GitHub repository** to Render
2. **Create a new Web Service**
3. **Configure the service**:
   - Build Command: `npm run install-client && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `NODE_ENV=production`
     - `MONGODB_URI=your-mongodb-atlas-uri`
     - `JWT_SECRET=your-secure-jwt-secret`

## Security Checklist ✅

Before deploying, ensure:

- [ ] JWT_SECRET is a secure random string
- [ ] MongoDB Atlas is properly configured
- [ ] All environment variables are set
- [ ] No sensitive data in code
- [ ] HTTPS is enabled (automatic on most platforms)

## Post-Deployment

1. **Test your application**:
   - Register a new user
   - Login functionality
   - Water quality record creation

2. **Monitor your app**:
   - Check logs for errors
   - Monitor database connections
   - Set up alerts if needed

## Troubleshooting

### Common Issues:

1. **Build fails**: Check if all dependencies are in package.json
2. **Database connection fails**: Verify MongoDB URI and network access
3. **Static files not served**: Ensure NODE_ENV=production is set
4. **CORS errors**: Check if frontend and backend are on same domain

### Useful Commands:

```bash
# View Heroku logs
heroku logs --tail

# View Railway logs
railway logs

# Restart Heroku app
heroku restart

# Check environment variables
heroku config
```

## Environment Variables Reference

```bash
# Required
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secure-random-string

# Optional
PORT=5000 (auto-set by platform)
```

## Next Steps

After successful deployment:

1. **Set up a custom domain** (optional)
2. **Configure SSL certificates** (automatic on most platforms)
3. **Set up monitoring and logging**
4. **Create backup strategies**
5. **Set up CI/CD pipeline** for automatic deployments 