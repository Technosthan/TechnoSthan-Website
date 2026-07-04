#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm install --include=dev
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Starting server..."
cd backend
npm start
