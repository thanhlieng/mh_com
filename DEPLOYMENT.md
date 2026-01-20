# MH Logistics System - Traefik Deployment Guide

## Overview
This guide will help you deploy the MH Logistics System to your Ubuntu server using Traefik as the reverse proxy with automatic SSL certificate management.

## Prerequisites
- Ubuntu 20.04 or 22.04 server
- Domain name pointing to your server (A record)
- At least 4GB RAM and 2 CPU cores
- sudo privileges
- Ports 80, 443, and 8080 open

## Traefik Benefits
- **Automatic SSL**: Free Let's Encrypt certificates
- **Zero Configuration**: Service discovery via Docker labels
- **Dashboard**: Web UI for monitoring
- **Load Balancing**: Built-in load balancing
- **Middleware**: Request routing and manipulation

## Quick Deployment

### 1. Upload Files to Server
```bash
# Copy project files to server
scp -r /path/to/MH\ project/ user@your-server:/home/user/mh-logistics/

# SSH into server
ssh user@your-server
cd mh-logistics
```

### 2. Run Deployment Script
```bash
# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### 3. Configure Environment
Edit the environment file with your actual values:
```bash
nano /opt/mh-logistics/.env.production
```

**Important variables to update:**
- `DOMAIN` - Your domain (e.g., yourdomain.com)
- `LETSENCRYPT_EMAIL` - Email for SSL certificates
- `WEB_URL` - Your domain with https://
- `DB_USER` and `DB_PASS` - Database credentials
- `JWT_SECRET` - Generate a strong secret
- `AWS_*` - Your AWS S3 credentials
- `AFTERSHIP_SECRET_KEY` - Your AfterShip API key

### 4. Restart Services
```bash
cd /opt/mh-logistics
docker-compose down
docker-compose up -d
```

## Service URLs After Deployment

- **Frontend**: `https://yourdomain.com`
- **Backend API**: `https://yourdomain.com/api`
- **Swagger Documentation**: `https://yourdomain.com/swagger`
- **Traefik Dashboard**: `http://yourdomain.com:8080`

## Manual Deployment Steps

### 1. Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git docker.io docker-compose
```

### 2. Setup Docker
```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3. Create Project Directory
```bash
sudo mkdir -p /opt/mh-logistics
sudo chown $USER:$USER /opt/mh-logistics
```

### 4. Configure Environment
```bash
# Copy and edit environment file
cp .env.production .env
nano .env
```

**Required environment variables:**
```bash
DOMAIN=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
WEB_URL=https://yourdomain.com
DB_USER=mh_user
DB_PASS=your_secure_password
JWT_SECRET=your_jwt_secret_key
# ... other variables
```

### 5. Create Traefik Directories
```bash
mkdir -p traefik/letsencrypt logs/traefik
touch traefik/letsencrypt/acme.json
chmod 600 traefik/letsencrypt/acme.json
```

### 6. Deploy Services
```bash
# Create Docker network
docker network create mh_network

# Start Traefik first
docker-compose up -d traefik

# Build and start other services
docker-compose build --no-cache
docker-compose up -d

# Run database migrations
docker-compose exec api npm run db:run
```

## Service Management

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f traefik
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart api
docker-compose restart traefik
```

### Update Application
```bash
# Use the update script (zero downtime)
./update.sh

# Or manual update
git pull origin main
docker-compose build
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

## Traefik Dashboard

Access the Traefik dashboard at: `http://yourdomain.com:8080`

The dashboard provides:
- Real-time service monitoring
- Request metrics
- Router and service configuration
- SSL certificate status

## SSL Certificate Management

Traefik automatically handles:
- Certificate generation via Let's Encrypt
- Certificate renewal
- HTTPS redirection from HTTP
- Certificate storage in `traefik/letsencrypt/acme.json`

### Certificate Storage
Certificates are stored in: `traefik/letsencrypt/acme.json`

### Manual Certificate Renewal
```bash
# Traefik auto-renews certificates, but you can force renewal
docker-compose restart traefik
```

## Routing Configuration

The routing is configured via Docker labels in `docker-compose.yml`:

### Frontend Route
```yaml
labels:
  - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
  - "traefik.http.routers.frontend.entrypoints=websecure"
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

### API Route
```yaml
labels:
  - "traefik.http.routers.api.rule=Host(`yourdomain.com`) && (PathPrefix(`/api`) || PathPrefix(`/swagger`))"
  - "traefik.http.routers.api.tls.certresolver=letsencrypt"
  - "traefik.http.middlewares.api-stripprefix.stripprefix.prefixes=/api"
```

## Troubleshooting

### Traefik Issues
```bash
# Check Traefik logs
docker-compose logs traefik

# Check dashboard access
curl http://localhost:8080/dashboard/

# Verify SSL certificates
cat traefik/letsencrypt/acme.json | jq .
```

### SSL Certificate Issues
```bash
# Check certificate status
docker-compose exec traefik ls -la /letsencrypt/

# Force certificate renewal
rm traefik/letsencrypt/acme.json
touch traefik/letsencrypt/acme.json
chmod 600 traefik/letsencrypt/acme.json
docker-compose restart traefik
```

### Database Connection Issues
```bash
# Check database container
docker-compose logs db

# Test database connection
docker-compose exec api npm run typeorm migration:run
```

### Service Discovery Issues
```bash
# Check Docker network
docker network ls
docker network inspect mh_network

# Verify service labels
docker-compose exec api env | grep TRAEFIK
```

## Security Recommendations

1. **Firewall**: Configure UFW
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # Optional: for Traefik dashboard
sudo ufw enable
```

2. **Traefik Dashboard Security**: For production, consider:
   - IP whitelisting
   - Basic authentication
   - Dashboard authentication middleware

3. **Database Security**: Use strong passwords

4. **Regular Updates**: Keep Docker images updated

## Monitoring

### Health Checks
```bash
# Frontend health
curl https://yourdomain.com

# API health
curl https://yourdomain.com/api

# Traefik health
curl http://localhost:8080/ping
```

### Log Monitoring
```bash
# Real-time logs
docker-compose logs -f --tail=100

# Setup log rotation
sudo logrotate -f /etc/logrotate.d/mh-logistics
```

## Advanced Configuration

### Custom Middleware
Add custom middleware in `docker-compose.yml`:

```yaml
labels:
  # Rate limiting
  - "traefik.http.middlewares.ratelimit.ratelimit.average=100"
  - "traefik.http.middlewares.ratelimit.ratelimit.burst=200"
  - "traefik.http.routers.frontend.middlewares=ratelimit"
  
  # Security headers
  - "traefik.http.middlewares.security.headers.stsSeconds=31536000"
  - "traefik.http.routers.frontend.middlewares=security"
```

### Multiple Domains
For multiple domains, add additional routers:

```yaml
labels:
  - "traefik.http.routers.frontend-main.rule=Host(`yourdomain.com`)"
  - "traefik.http.routers.frontend-alt.rule=Host(`www.yourdomain.com`)"
```

## Support

For issues:
1. Check Traefik dashboard: `http://yourdomain.com:8080`
2. Review logs: `docker-compose logs`
3. Verify environment variables
4. Check SSL certificates in `traefik/letsencrypt/acme.json`
5. Ensure all services are running: `docker-compose ps`