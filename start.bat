@echo off
echo Starting User Registration Tracker...
echo.

echo Installing backend dependencies...
npm install

echo.
echo Installing frontend dependencies...
cd client
npm install
cd ..

echo.
echo Creating environment file...
if not exist .env (
    copy env.example .env
    echo Environment file created. Please edit .env with your configuration.
)

echo.
echo Starting the application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

start cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start cmd /k "cd client && npm start"

echo.
echo Application is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul 