#!/bin/bash

echo "Starting User Registration Tracker..."
echo

echo "Installing backend dependencies..."
npm install

echo
echo "Installing frontend dependencies..."
cd client
npm install
cd ..

echo
echo "Creating environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Environment file created. Please edit .env with your configuration."
fi

echo
echo "Starting the application..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo

# Start backend in background
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
cd client && npm start &
FRONTEND_PID=$!

echo
echo "Application is starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
wait 