# Production Deployment Script
Write-Host "🚀 Starting Production Deployment..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found. Please initialize git first:" -ForegroundColor Red
    Write-Host "git init" -ForegroundColor Yellow
    Write-Host "git add ." -ForegroundColor Yellow
    Write-Host "git commit -m 'Initial commit'" -ForegroundColor Yellow
    exit 1
}

# Build the React app
Write-Host "📦 Building React application..." -ForegroundColor Yellow
cd client
npm run build
cd ..

# Check if build was successful
if (-not (Test-Path "client/build")) {
    Write-Host "❌ Build failed. Please check for errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Display deployment options
Write-Host "`n🎯 Choose your deployment platform:" -ForegroundColor Cyan
Write-Host "1. Heroku (Recommended - Free tier available)" -ForegroundColor White
Write-Host "2. Railway (Great alternative)" -ForegroundColor White
Write-Host "3. Render (Another good option)" -ForegroundColor White
Write-Host "4. Manual deployment instructions" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-4)"

if ($choice -eq "1") {
    Write-Host "`n📋 Heroku Deployment Steps:" -ForegroundColor Green
    Write-Host "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    Write-Host "2. Login: heroku login" -ForegroundColor Yellow
    Write-Host "3. Create app: heroku create your-app-name" -ForegroundColor Yellow
    Write-Host "4. Set environment variables:" -ForegroundColor Yellow
    Write-Host "   heroku config:set NODE_ENV=production" -ForegroundColor Gray
    Write-Host "   heroku config:set MONGODB_URI='your-mongodb-atlas-uri'" -ForegroundColor Gray
    Write-Host "   heroku config:set JWT_SECRET='d61b32ac86c7656d14e8fb76639c7b695feb5de2cd4dda04e3dee31ebce0f87fa02cf58ec833ad37e17910c8fef4ad409367e2c961afb9620385a1a83e1754ca'" -ForegroundColor Gray
    Write-Host "5. Deploy: git push heroku main" -ForegroundColor Yellow
    Write-Host "6. Open: heroku open" -ForegroundColor Yellow
}
elseif ($choice -eq "2") {
    Write-Host "`n📋 Railway Deployment Steps:" -ForegroundColor Green
    Write-Host "1. Create Railway account: https://railway.app/" -ForegroundColor Yellow
    Write-Host "2. Install Railway CLI: npm i -g @railway/cli" -ForegroundColor Yellow
    Write-Host "3. Login: railway login" -ForegroundColor Yellow
    Write-Host "4. Initialize: railway init" -ForegroundColor Yellow
    Write-Host "5. Set environment variables in Railway dashboard:" -ForegroundColor Yellow
    Write-Host "   NODE_ENV=production" -ForegroundColor Gray
    Write-Host "   MONGODB_URI=your-mongodb-atlas-uri" -ForegroundColor Gray
    Write-Host "   JWT_SECRET=d61b32ac86c7656d14e8fb76639c7b695feb5de2cd4dda04e3dee31ebce0f87fa02cf58ec833ad37e17910c8fef4ad409367e2c961afb9620385a1a83e1754ca" -ForegroundColor Gray
    Write-Host "6. Deploy: railway up" -ForegroundColor Yellow
}
elseif ($choice -eq "3") {
    Write-Host "`n📋 Render Deployment Steps:" -ForegroundColor Green
    Write-Host "1. Create Render account: https://render.com/" -ForegroundColor Yellow
    Write-Host "2. Connect your GitHub repository" -ForegroundColor Yellow
    Write-Host "3. Create new Web Service" -ForegroundColor Yellow
    Write-Host "4. Configure:" -ForegroundColor Yellow
    Write-Host "   Build Command: npm run install-client && npm run build" -ForegroundColor Gray
    Write-Host "   Start Command: npm start" -ForegroundColor Gray
    Write-Host "5. Set environment variables:" -ForegroundColor Yellow
    Write-Host "   NODE_ENV=production" -ForegroundColor Gray
    Write-Host "   MONGODB_URI=your-mongodb-atlas-uri" -ForegroundColor Gray
    Write-Host "   JWT_SECRET=d61b32ac86c7656d14e8fb76639c7b695feb5de2cd4dda04e3dee31ebce0f87fa02cf58ec833ad37e17910c8fef4ad409367e2c961afb9620385a1a83e1754ca" -ForegroundColor Gray
}
elseif ($choice -eq "4") {
    Write-Host "`n📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Green
}
else {
    Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
}

Write-Host "`n🔐 Security Note:" -ForegroundColor Red
Write-Host "Make sure to update your MongoDB URI with the correct password!" -ForegroundColor Yellow
Write-Host "Current URI in env.example has a placeholder password." -ForegroundColor Yellow

Write-Host "`n✅ Your application is ready for deployment!" -ForegroundColor Green
Write-Host "📁 Build files are in: client/build/" -ForegroundColor Cyan
Write-Host "📋 See DEPLOYMENT.md for complete instructions" -ForegroundColor Cyan 