#!/bin/bash

# Deployment script for Tusul Backend on production server (167.71.194.1)
# This script should be run on the production server

# Exit on error
set -e

echo "Starting deployment process for Tusul Backend..."

# 1. Update the code from repository
echo "Updating code from repository..."
git pull

# 2. Install dependencies
echo "Installing dependencies..."
npm ci

# 3. Copy production environment file
echo "Setting up production environment..."
cp .env.production .env

# 4. Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# 5. Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 6. Build the application
echo "Building the application..."
npm run build

# 7. Restart the application (assuming PM2 is used for process management)
echo "Restarting the application..."
if pm2 list | grep -q "tusul-backend"; then
  pm2 restart tusul-backend
else
  pm2 start dist/server.js --name tusul-backend
fi

echo "Deployment completed successfully!"
echo "The application is now running on http://167.71.194.1:5000"
echo ""
echo "Note: Make sure to update the .env.production file with your actual database credentials and JWT secret before deployment."
echo "If you're using Docker, use 'docker-compose up -d' instead of this script."