#!/bin/bash

# MH Logistics System Update Script
# This script updates the application with minimal downtime

set -e

echo "🔄 Starting MH Logistics System Update..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Project directory
PROJECT_DIR="/opt/mh-logistics"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

# Backup current version
print_status "Creating backup..."
BACKUP_DIR="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r . $BACKUP_DIR/

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    print_status "Pulling latest changes from git..."
    git pull origin main
fi

# Update environment file if needed
print_status "Checking environment configuration..."
if [ ! -f .env.production ]; then
    print_warning "Environment file missing. Please configure .env.production"
    exit 1
fi

# Rebuild and restart services with zero downtime
print_status "Updating services..."

# Build new images
docker-compose -f docker-compose.yml --env-file .env.production build

# Restart services one by one to minimize downtime
print_status "Restarting backend API..."
docker-compose -f docker-compose.yml --env-file .env.production up -d --no-deps api

# Wait for API to be ready
print_status "Waiting for API to be ready..."
sleep 15

# Check API health (check through Traefik)
DOMAIN=$(grep DOMAIN .env.production | cut -d'=' -f2)
if [ ! -z "$DOMAIN" ]; then
    API_URL="https://$DOMAIN/api"
else
    API_URL="http://localhost:3002"
fi

if curl -f $API_URL > /dev/null 2>&1; then
    print_status "API is healthy"
else
    print_error "API health check failed"
    print_status "Rolling back..."
    docker-compose -f docker-compose.yml --env-file .env.production down
    # Restore from backup if needed
    exit 1
fi

# Restart frontend
print_status "Restarting frontend..."
docker-compose -f docker-compose.yml --env-file .env.production up -d --no-deps frontend

# Keep Traefik running (no need to restart unless config changes)
print_status "Traefik proxy continues running"

# Run database migrations if needed
print_status "Running database migrations..."
docker-compose -f docker-compose.yml --env-file .env.production exec -T api npm run db:run

# Clean up old images
print_status "Cleaning up old Docker images..."
docker image prune -f

# Display status
print_status "Update completed successfully!"
echo ""
echo "📋 Update Information:"
echo "   Backup Location: $BACKUP_DIR"
echo "   Services Status:"
docker-compose ps

# Show recent logs
print_status "Recent application logs:"
docker-compose logs --tail=20