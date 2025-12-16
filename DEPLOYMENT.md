# Deployment Guide

This guide covers deployment options for the Tempo Web API.

## Prerequisites

- Node.js 20+ installed
- npm 10+ installed
- Access to deployment platform

## Environment Variables

Before deploying, ensure you have these environment variables configured:

```bash
# Required
BETTER_AUTH_SECRET=<generate-a-secure-random-string-min-32-chars>
BETTER_AUTH_URL=<your-production-url>
DATABASE_PATH=file:./tempo.db

# Optional
CORS_ORIGIN=<your-expo-app-url>
```

### Generate Secure Secret

```bash
# Generate a secure 32+ character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform as it's created by the Next.js team.

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   vercel
   ```

3. **Or Deploy via GitHub Integration**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

4. **Configure Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all required variables
   - Redeploy

**Note:** For SQLite on Vercel, consider using Turso (serverless SQLite) or migrate to PostgreSQL for production.

### Option 2: Railway

Railway provides easy deployment with persistent storage.

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure Environment Variables**
   ```bash
   railway variables set BETTER_AUTH_SECRET=<your-secret>
   railway variables set BETTER_AUTH_URL=<your-url>
   ```

### Option 3: Docker

Build and run the application in a Docker container.

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     tempo-web:
       build: .
       ports:
         - "3000:3000"
       environment:
         - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
         - BETTER_AUTH_URL=${BETTER_AUTH_URL}
         - DATABASE_PATH=/data/tempo.db
         - CORS_ORIGIN=${CORS_ORIGIN}
       volumes:
         - ./data:/data
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

### Option 4: Traditional VPS (Ubuntu/Debian)

Deploy to a VPS like DigitalOcean, Linode, or AWS EC2.

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd tempo-web
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   nano .env.local
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Use PM2 for Process Management**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "tempo-web" -- start
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Database Considerations

### SQLite (Development/Small Scale)

- Good for development and small deployments
- File-based, no separate database server needed
- Limitations with concurrent writes

### Production Database Options

For production, consider migrating to:

1. **PostgreSQL** - Most popular choice
2. **MySQL** - Good alternative
3. **Turso** - Serverless SQLite (https://turso.tech)

#### Migration to PostgreSQL

1. Install PostgreSQL adapter:
   ```bash
   npm install pg drizzle-orm
   ```

2. Update `drizzle.config.ts`:
   ```typescript
   import { defineConfig } from "drizzle-kit";
   
   export default defineConfig({
     schema: "./lib/db/schema.ts",
     out: "./drizzle",
     dialect: "postgresql",
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   });
   ```

3. Update `lib/db/index.ts`:
   ```typescript
   import { drizzle } from "drizzle-orm/postgres-js";
   import postgres from "postgres";
   import * as schema from "./schema";
   
   const connectionString = process.env.DATABASE_URL!;
   const client = postgres(connectionString);
   export const db = drizzle(client, { schema });
   ```

4. Regenerate migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database is initialized (`npm run db:push`)
- [ ] CORS_ORIGIN matches your Expo app URL
- [ ] BETTER_AUTH_URL matches your production URL
- [ ] BETTER_AUTH_SECRET is secure and random
- [ ] SSL/HTTPS is configured
- [ ] Health check endpoint works: `GET /api/health`
- [ ] Test authentication flow from Expo app
- [ ] Monitor logs for errors
- [ ] Set up database backups

## Monitoring & Maintenance

### Health Checks

Monitor the health endpoint:
```bash
curl https://your-domain.com/api/health
```

### Logs

- **Vercel**: Check deployment logs in dashboard
- **PM2**: `pm2 logs tempo-web`
- **Docker**: `docker-compose logs -f`

### Database Backups

For SQLite:
```bash
# Backup
cp tempo.db tempo.db.backup-$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp tempo.db "$BACKUP_DIR/tempo.db.$DATE"
# Keep only last 7 days
find $BACKUP_DIR -name "tempo.db.*" -mtime +7 -delete
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check DATABASE_PATH is correct
   - Ensure database file has write permissions
   - Run `npm run db:push` to initialize

2. **CORS errors from Expo app**
   - Verify CORS_ORIGIN matches your Expo URL
   - Check middleware.ts configuration
   - Ensure credentials are included in requests

3. **Authentication not working**
   - Check BETTER_AUTH_SECRET is set
   - Verify BETTER_AUTH_URL matches deployment URL
   - Check cookies are being sent/received

4. **Build errors**
   - Clear `.next` folder: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version is 20+

## Support

For issues or questions:
- Check [API.md](./API.md) for API documentation
- Check [README.md](./README.md) for setup instructions
- Review Better Auth docs: https://www.better-auth.com/docs
