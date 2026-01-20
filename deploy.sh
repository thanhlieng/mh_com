#!/bin/bash

# MH Logistics System Deployment Script
# This script deploys the entire MH system to Ubuntu server

set -e

echo "🚀 Starting MH Logistics System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git docker.io docker-compose

# Start and enable Docker
print_status "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
print_status "Adding user to docker group..."
sudo usermod -aG docker $USER

# Create project directory
PROJECT_DIR="/opt/mh-logistics"
print_status "Creating project directory at $PROJECT_DIR..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Copy project files (assuming script is run from project root)
print_status "Copying project files..."
cp -r "$(pwd)"/* $PROJECT_DIR/
cd $PROJECT_DIR

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs/traefik
mkdir -p traefik/letsencrypt

# Create empty acme.json file with correct permissions
touch traefik/letsencrypt/acme.json
chmod 600 traefik/letsencrypt/acme.json

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f .env.production ]; then
    print_warning "Environment file not found. Please configure .env.production manually."
    print_warning "Edit the following file with your actual values:"
    echo "$PROJECT_DIR/.env.production"
    read -p "Press Enter after configuring the environment file..."
fi

# Get domain configuration
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
if [ ! -z "$DOMAIN_NAME" ]; then
    # Update environment file with domain
    sed -i "s/yourdomain.com/$DOMAIN_NAME/g" .env.production
    sed -i "s/your-email@yourdomain.com/admin@$DOMAIN_NAME/g" .env.production
    
    # Update docker-compose labels with domain
    sed -i "s/\${DOMAIN}/$DOMAIN_NAME/g" docker-compose.yml
    
    print_status "Domain configured: $DOMAIN_NAME"
else
    print_error "Domain name is required for SSL configuration."
    exit 1
fi

# Create external network for Traefik
print_status "Creating Docker network..."
docker network create mh_network 2>/dev/null || true

# Build and start containers (start Traefik first)
print_status "Starting Traefik reverse proxy..."
docker-compose -f docker-compose.yml --env-file .env.production up -d traefik

# Wait for Traefik to start
print_status "Waiting for Traefik to initialize..."
sleep 20

# Build and start other services
print_status "Building and starting application containers..."
docker-compose -f docker-compose.yml --env-file .env.production build --no-cache
docker-compose -f docker-compose.yml --env-file .env.production up -d

# Wait for services to start
print_status "Waiting for all services to start..."
sleep 30

# Check if services are running
print_status "Checking service status..."
docker-compose ps

# Run database migrations
print_status "Running database migrations..."
docker-compose exec api npm run db:run

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/mh-logistics.service > /dev/null <<EOF
[Unit]
Description=MH Logistics System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/docker-compose -f docker-compose.yml --env-file .env.production up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.yml --env-file .env.production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable systemd service
sudo systemctl enable mh-logistics.service
sudo systemctl start mh-logistics.service

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/mh-logistics > /dev/null <<EOF
$PROJECT_DIR/logs/traefik/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f $PROJECT_DIR/docker-compose.yml --env-file $PROJECT_DIR/.env.production restart traefik
    endscript
}
EOF

# Display deployment information
print_status "Deployment completed successfully!"
echo ""
echo "🎉 MH Logistics System is now deployed with Traefik!"
echo ""
echo "📋 Deployment Information:"
echo "   Project Directory: $PROJECT_DIR"
echo "   Traefik Dashboard: http://localhost:8080"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "   Frontend URL: https://$DOMAIN_NAME"
    echo "   Backend API: https://$DOMAIN_NAME/api"
    echo "   Swagger Docs: https://$DOMAIN_NAME/swagger"
    echo "   Traefik Dashboard: http://$DOMAIN_NAME:8080"
else
    echo "   Frontend URL: http://localhost:8000"
    echo "   Backend API: http://localhost:3002"
    echo "   Swagger Docs: http://localhost:3002/api"
fi
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Traefik logs: docker-compose logs -f traefik"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update system: sudo systemctl restart mh-logistics"
echo ""
echo "📁 Important Files:"
echo "   Environment: $PROJECT_DIR/.env.production"
echo "   Traefik Config: $PROJECT_DIR/traefik/letsencrypt/acme.json"
echo "   Docker Compose: $PROJECT_DIR/docker-compose.yml"
echo ""
echo "🌐 SSL Certificates:"
echo "   Traefik automatically manages SSL certificates via Let's Encrypt"
echo "   Certificates stored in: $PROJECT_DIR/traefik/letsencrypt/"
echo ""
print_warning "Please save this information and ensure your domain DNS is properly configured."
print_warning "Don't forget to update your environment variables with actual values!"