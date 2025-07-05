# Production Setup for Tusul Backend

## Overview of Changes Made

To prepare the Tusul Backend application for deployment to the production server at IP 167.71.194.1, the following changes have been made:

1. **Created a production environment file (.env.production)**
   - Set up with secure database credentials
   - Configured for the production server IP (167.71.194.1)
   - Added secure JWT settings

2. **Updated docker-compose.yml for production**
   - Added the HOST environment variable with the production IP
   - Updated database credentials to use more secure values
   - Ensured consistency between the app and MySQL service configurations

3. **Created a deployment script (deploy.sh)**
   - Automates the deployment process
   - Handles code updates, dependency installation, and database migrations
   - Manages application startup using PM2

4. **Created detailed deployment documentation (README-production.md)**
   - Provides step-by-step instructions for both manual and Docker-based deployment
   - Includes troubleshooting tips and maintenance procedures
   - Covers database backup and restore procedures

## Next Steps for Deployment

To deploy the application to the production server at IP 167.71.194.1, follow these steps:

1. **Transfer the updated files to the production server**
   - .env.production
   - docker-compose.yml
   - deploy.sh
   - README-production.md

2. **Choose a deployment method**
   - For manual deployment: Follow the instructions in the "Option 1: Manual Deployment" section of README-production.md
   - For Docker-based deployment: Follow the instructions in the "Option 2: Docker Deployment" section of README-production.md

3. **Important security considerations**
   - Replace the placeholder passwords and JWT secret with actual secure values
   - Restrict access to the MySQL database port (3306) to only the application server
   - Set up HTTPS using a reverse proxy like Nginx or use a load balancer with SSL termination
   - Implement regular database backups

4. **Post-deployment verification**
   - Verify that the application is running correctly at http://167.71.194.1:5000
   - Check that database migrations have been applied successfully
   - Test the API endpoints to ensure they're working as expected

## Database Migration Notes

The application uses Prisma for database migrations. The migrations are stored in the `prisma/migrations` directory.

When deploying to production, use the following command to apply all pending migrations:

```bash
npx prisma migrate deploy
```

This command will apply any migrations that haven't been applied yet to the production database, ensuring that the database schema is up to date.

## Monitoring and Maintenance

Refer to the "Monitoring and Maintenance" section of README-production.md for instructions on how to:
- Monitor the application using PM2 or Docker
- View logs
- Restart or stop the application
- Perform database backups and restores