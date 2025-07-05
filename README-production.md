# Production Deployment Guide for Tusul Backend

This guide provides instructions for deploying the Tusul Backend application to a production server.

## Server Information
- IP Address: 167.71.194.1
- Port: 5000

## Prerequisites
- Node.js (v18 or later)
- MySQL (v8.0 or later)
- PM2 (for process management)
- Git

## Deployment Options

### Option 1: Manual Deployment

1. **Clone the repository on the production server**
   ```bash
   git clone <repository-url>
   cd tusul_back
   ```

2. **Configure the production environment**
   - Update the `.env.production` file with your actual database credentials and JWT secret
   - Make sure the MySQL database is running and accessible

3. **Run the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   This script will:
   - Pull the latest code
   - Install dependencies
   - Set up the production environment
   - Generate the Prisma client
   - Run database migrations
   - Build the application
   - Start or restart the application using PM2

4. **Verify the deployment**
   - The application should be running on http://167.71.194.1:5000
   - Check the logs for any errors: `pm2 logs tusul-backend`

### Option 2: Docker Deployment

1. **Clone the repository on the production server**
   ```bash
   git clone <repository-url>
   cd tusul_back
   ```

2. **Configure the production environment**
   - Update the environment variables in `docker-compose.yml` with your actual database credentials and JWT secret

3. **Build and start the containers**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

5. **Verify the deployment**
   - The application should be running on http://167.71.194.1:5000
   - Check the logs for any errors: `docker-compose logs app`

## Database Migrations

The application uses Prisma for database migrations. The migrations are stored in the `prisma/migrations` directory.

To run migrations manually:
```bash
npx prisma migrate deploy
```

To create a new migration:
```bash
npx prisma migrate dev --name <migration-name>
```

## Troubleshooting

### Database Connection Issues
- Verify that the MySQL server is running
- Check the DATABASE_URL in the .env file
- Ensure the database user has the necessary permissions

### Application Not Starting
- Check the logs: `pm2 logs tusul-backend` or `docker-compose logs app`
- Verify that all environment variables are set correctly
- Make sure the build process completed successfully

## Monitoring and Maintenance

### Using PM2
- View running processes: `pm2 list`
- View logs: `pm2 logs tusul-backend`
- Restart the application: `pm2 restart tusul-backend`
- Stop the application: `pm2 stop tusul-backend`

### Using Docker
- View running containers: `docker-compose ps`
- View logs: `docker-compose logs app`
- Restart the application: `docker-compose restart app`
- Stop the application: `docker-compose down`

## Backup and Restore

### Database Backup
```bash
mysqldump -u root -p tourism_db > backup.sql
```

### Database Restore
```bash
mysql -u root -p tourism_db < backup.sql
```