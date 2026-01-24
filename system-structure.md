# Multi-Docker-Compose System Architecture with Traefik

## Overview

This document describes the system architecture for deploying two separate applications on a single server using Docker Compose, Traefik as a reverse proxy, and domain-based routing.

## System Structure

```
Server
├── docker-compose-1.yml (Existing Application)
│   ├── traefik (shared)
│   ├── frontend-1
│   └── backend-1
├── docker-compose-2.yml (MH Project - This Project)
│   ├── frontend-mh
│   └── backend-mh
└── traefik-shared.yml (Optional: Shared Traefik)
```

## Architecture Components

### 1. Traefik Reverse Proxy (Shared)
- **Purpose**: Load balancing and SSL termination
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Dashboard**: Port 8080 (internal access only)
- **Configuration**: Dynamic routing via Docker labels

### 2. Application 1 (Existing)
- **Domain**: `domain1.com`
- **Frontend**: React/Next.js application
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL (separate or shared)

### 3. Application 2 (MH Project)
- **Domain**: `domain2.com` (e.g., `mhcom.com`)
- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Backend**: NestJS with TypeScript, TypeORM
- **Database**: PostgreSQL

## Network Architecture

### Docker Networks
```
proxy-network (shared)
├── traefik
├── app1-frontend
├── app1-backend
├── app2-frontend (mh-frontend)
└── app2-backend (mh-backend)
```

### Communication Flow
```
Internet → Traefik → Frontend (domain-specific)
                    ↓
                Backend (internal)
                    ↓
                Database
```

## Domain Routing Configuration

### Traefik Router Rules

#### Application 1 (Existing)
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.app1-frontend.rule=Host(`domain1.com`)"
  - "traefik.http.routers.app1-frontend.entrypoints=web"
  - "traefik.http.services.app1-frontend.loadbalancer.server.port=3000"
```

#### Application 2 (MH Project)
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.mh-frontend.rule=Host(`mhcom.com`)"
  - "traefik.http.routers.mh-frontend.entrypoints=web"
  - "traefik.http.services.mh-frontend.loadbalancer.server.port=3000"
```

## Docker Compose Configuration

### Shared Traefik Setup
```yaml
# traefik-shared.yml
version: "3.8"

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=proxy"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/acme.json:/acme.json
    networks:
      - proxy

networks:
  proxy:
    external: true
```

### MH Project Docker Compose
```yaml
# docker-compose-mh.yml
version: "3.8"

services:
  backend-mh:
    build: ./MH-api
    environment:
      DATABASE_URL: postgresql://user:password@postgres-mh:5432/mhcom_db
      NODE_ENV: production
    volumes:
      - ./uploads:/usr/src/app/uploads
    networks:
      - proxy
      - mh-internal
    depends_on:
      - postgres-mh

  frontend-mh:
    build: ./MH
    depends_on:
      - backend-mh
    environment:
      NEXT_PUBLIC_API_URL: http://backend-mh:3000
      NODE_ENV: production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mh-frontend.rule=Host(`mhcom.com`)"
      - "traefik.http.services.mh-frontend.loadbalancer.server.port=3000"
      - "traefik.http.routers.mh-frontend.entrypoints=web"
      - "traefik.http.middlewares.mh-frontend-https.redirectscheme.scheme=https"
      - "traefik.http.routers.mh-frontend-secure.rule=Host(`mhcom.com`)"
      - "traefik.http.routers.mh-frontend-secure.entrypoints=websecure"
      - "traefik.http.routers.mh-frontend-secure.tls=true"
    networks:
      - proxy

  postgres-mh:
    image: postgres:15
    environment:
      POSTGRES_DB: mhcom_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_mh_data:/var/lib/postgresql/data
    networks:
      - mh-internal

volumes:
  postgres_mh_data:

networks:
  proxy:
    external: true
  mh-internal:
    driver: bridge
```

## Frontend to Backend Proxy Configuration

### MH Project Frontend Configuration
```javascript
// MH/next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend-mh:3000/api/:path*',
      },
    ];
  },
};
```

### Environment Variables
```bash
# MH/.env.production
NEXT_PUBLIC_API_URL=http://backend-mh:3000
NODE_ENV=production
```

## Deployment Steps

### 1. Create Shared Network
```bash
docker network create proxy
```

### 2. Deploy Shared Traefik
```bash
docker-compose -f traefik-shared.yml up -d
```

### 3. Deploy Existing Application
```bash
docker-compose -f docker-compose-1.yml up -d
```

### 4. Deploy MH Project
```bash
docker-compose -f docker-compose-mh.yml up -d
```

## SSL Certificate Management

### Let's Encrypt Configuration
```yaml
# Add to Traefik service
labels:
  - "traefik.http.routers.mh-frontend-secure.tls.certresolver=letsencrypt"
  
command:
  - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
  - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
  - "--certificatesresolvers.letsencrypt.acme.email=admin@mhcom.com"
  - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
```

## Security Considerations

### 1. Network Isolation
- Backend services only accessible via internal network
- Frontend services exposed through Traefik only
- Database isolated in application-specific networks

### 2. Environment Variables
- Sensitive data stored in Docker secrets or .env files
- No hardcoded credentials in docker-compose files

### 3. Access Control
- Traefik dashboard restricted to internal IP
- API rate limiting configured per domain
- CORS policies configured for each frontend

## Monitoring and Logging

### 1. Traefik Dashboard
- URL: `http://server-ip:8080`
- Monitor routing, health checks, and request metrics

### 2. Application Logs
- Centralized logging via Docker logging drivers
- Separate log files for each application

### 3. Health Checks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Backup Strategy

### 1. Database Backups
```bash
# Automated backup script
docker exec postgres-mh pg_dump -U user mhcom_db > backup_$(date +%Y%m%d).sql
```

### 2. Volume Backups
- Upload volumes mounted to cloud storage
- Regular snapshots of persistent data

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure no port conflicts between applications
2. **Network Connectivity**: Verify containers can communicate across networks
3. **DNS Resolution**: Check domain DNS points to server IP
4. **SSL Certificates**: Monitor certificate expiration and renewal

### Debug Commands
```bash
# Check container status
docker ps -a

# Check network connectivity
docker network ls
docker network inspect proxy

# View logs
docker-compose -f docker-compose-mh.yml logs -f
```

## Scaling Considerations

### Horizontal Scaling
- Multiple frontend instances behind load balancer
- Database read replicas for improved performance
- Redis cache for session management

### Resource Management
- Memory and CPU limits per container
- Auto-scaling based on traffic patterns
- Cost optimization for shared resources

## Migration Path

### From Single to Multi-Application
1. Set up shared Traefik instance
2. Create external networks
3. Update existing docker-compose files
4. Migrate applications one by one
5. Update DNS and SSL certificates

This architecture provides a scalable, secure, and maintainable solution for hosting multiple applications on a single server while maintaining isolation and proper resource management.