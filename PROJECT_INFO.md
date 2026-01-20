# MH Logistics System

A comprehensive logistics and shipping management system built for handling shipments, tracking, invoicing, and customer management.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Deployment Guide](#deployment-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

**MH Logistics System** is a full-stack web application designed to manage logistics operations including:
- Shipment booking and tracking
- Invoice and billing management
- Customer and company management
- Financial statistics and reporting
- Real-time tracking integration (AfterShip)
- Multi-language support (Vietnamese/English)

### Business Purpose
- **Logistics Management**: Track shipments from pickup to delivery
- **Financial Control**: Manage invoices, payments, and financial reports
- **Customer Relations**: Handle customer accounts and service contracts
- **Operational Efficiency**: Automate manifest generation and POD handling
- **Data Analytics**: Generate comprehensive reports and statistics

## 🛠 Tech Stack

### Frontend (MH)
- **Framework**: Next.js 12 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Ant Design
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Internationalization**: next-translate (vi/en)
- **Build Tool**: Next.js + Webpack

### Backend (MH-api)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL 15 with TypeORM
- **Authentication**: JWT with bcrypt
- **File Storage**: Local/Cloud Storage (multi-provider)
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer + SMTP
- **Excel Processing**: ExcelJS + node-xlsx
- **PDF Generation**: Puppeteer + Muhammara
- **External APIs**: AfterShip tracking

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Traefik v2 with auto-SSL
- **Database**: PostgreSQL 15 with persistent volumes
- **Static Storage**: Local Nginx + Docker volumes
- **SSL/TLS**: Let's Encrypt via Traefik
- **Logging**: Centralized logs with log rotation

## ✨ Features

### Core Features
- 🚚 **Shipment Management**: Create, track, and manage shipments
- 📍 **Real-time Tracking**: Integration with AfterShip API
- 💰 **Financial Management**: Invoicing, payments, and accounting
- 🏢 **Customer Management**: Individual and business customer accounts
- 📊 **Reporting**: Comprehensive financial and operational reports
- 📱 **Multi-language**: Vietnamese and English support

### Technical Features
- 🔐 **Authentication & Authorization**: Role-based access control
- 📁 **File Management**: Multi-provider storage (Local/Cloud)
- 📊 **Data Export**: Excel/CSV export for all data
- 📧 **Email Notifications**: Automated email notifications
- 🔍 **Search & Filtering**: Advanced search across all modules
- 📈 **Dashboard**: Real-time statistics and KPIs

### Developer Features
- 📖 **API Documentation**: Auto-generated Swagger docs
- 🧪 **Testing**: Unit and integration tests
- 📝 **Type Safety**: Full TypeScript implementation
- 🔄 **Hot Reload**: Development with hot module replacement
- 🐳 **Docker Ready**: Containerized development and production

## 📁 Project Structure

```
MH project/
├── MH/                          # Frontend (Next.js)
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/              # Next.js pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Redux store
│   │   └── utils/             # Utility functions
│   ├── public/                 # Static assets
│   ├── locales/               # i18n files
│   ├── Dockerfile             # Frontend container
│   ├── package.json           # Frontend dependencies
│   └── next.config.js         # Next.js configuration
├── MH-api/                     # Backend (NestJS)
│   ├── src/
│   │   ├── modules/           # Business modules
│   │   │   ├── bookings/      # Shipment booking
│   │   │   ├── customers/     # Customer management
│   │   │   ├── invoices/      # Invoice management
│   │   │   ├── finance-statistical/  # Financial reports
│   │   │   ├── trackings/     # Shipment tracking
│   │   │   ├── file-storage/  # File management
│   │   │   └── postcode-data/ # Postcode data
│   │   ├── common/           # Shared utilities
│   │   ├── configs/          # Configuration files
│   │   └── main.ts           # Application entry point
│   ├── Dockerfile           # Backend container
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── data/                      # Local data files
├── uploads/                   # User uploaded files
├── logs/                      # Application logs
├── traefik/                   # Traefik configuration
├── nginx-static.conf           # Nginx static files config
├── docker-compose.yml         # Docker orchestration
├── .env.production           # Production environment
└── README.md                 # This file
```

## 🏠 Local Development Setup

### Prerequisites
- **Node.js**: 18.x or higher
- **npm** or **yarn**: Package manager
- **PostgreSQL**: 13.x or higher (or use Docker)
- **Docker**: Optional but recommended
- **Git**: Version control

### 1. Clone Repository
```bash
git clone <repository-url>
cd "MH project"
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.production .env

# Edit environment variables
nano .env
```

### 3. Database Setup (Option A: Docker - Recommended)
```bash
# Start PostgreSQL using Docker
docker run --name mh-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mh_database -p 5432:5432 -d postgres:15
```

### 4. Database Setup (Option B: Local Installation)
```bash
# Install PostgreSQL locally
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb mh_database
sudo -u postgres createuser --interactive
```

### 5. Backend Setup
```bash
cd MH-api

# Install dependencies
npm install

# Environment configuration
cp .env .env.local
# Edit .env.local with your local settings

# Run database migrations
npm run db:run

# Start development server
npm run start:dev
```

### 6. Frontend Setup
```bash
cd ../MH

# Install dependencies
npm install

# Environment configuration
cp .env.development .env.local
# Edit .env.local with API URL

# Start development server
npm run dev
```

### 7. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **API Documentation**: http://localhost:3002/api
- **Database**: localhost:5432

## 🔧 Environment Configuration

### Frontend Environment (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend Environment (.env.local)
```bash
# Application
NODE_ENV=development
APP_PORT=3002
WEB_URL=http://localhost:3002

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=mh_database
DB_USER=your_username
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Storage (Local)
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./uploads
LOCAL_STORAGE_URL=http://localhost:3002/uploads

# External APIs
AFTERSHIP_SECRET_KEY=your_aftership_key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
```

### Production Environment Variables
See [DEPLOYMENT.md](DEPLOYMENT.md) for complete production configuration.

## 📚 API Documentation

### Swagger Documentation
Access at: `http://localhost:3002/api` (development) or `https://yourdomain.com/api` (production)

### Main API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

#### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/import-booking-by-excel` - Import bookings from Excel
- `GET /api/bookings/generate-excel-booking` - Export bookings to Excel

#### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/generate-excel-customer` - Export customers to Excel

#### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/statistics` - Get invoice statistics

#### Trackings
- `GET /api/trackings/:trackingNumber` - Get tracking information
- `POST /api/trackings` - Add tracking to shipment

#### File Storage
- `POST /api/file-storage/upload` - Upload file
- `DELETE /api/file-storage/:key` - Delete file
- `GET /api/file-storage/config` - Get storage configuration

### API Usage Examples

#### Login Request
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Create Booking
```bash
curl -X POST http://localhost:3002/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverName": "John Doe",
    "receiverAddress": "123 Main St",
    "receiverPhone": "+1234567890",
    "weight": 2.5,
    "description": "Electronics"
  }'
```

## 🗄 Database Setup

### Database Schema
The system uses PostgreSQL with TypeORM ORM. Main entities:

#### Core Tables
- `bookings` - Shipment bookings
- `booking_details` - Booking line items
- `customers` - Customer information
- `invoices` - Invoice data
- `invoice_details` - Invoice line items
- `trackings` - Shipment tracking
- `users` - System users
- `roles` - User roles and permissions

### Migration Commands
```bash
# Generate new migration
npm run db:gen migration_name

# Run migrations
npm run db:run

# Rollback migration
npm run db:rollback
```

### Database Seeds
```bash
# Create sample users
npm run seed:user

# Create sample companies
npm run seed:company

# Create sample categories
npm run seed:category
```

## 🚀 Deployment Guide

### Quick Deployment (Recommended)
```bash
# 1. Copy files to server
scp -r "MH project/" user@your-server:/home/user/mh-logistics/

# 2. Deploy
ssh user@your-server
cd mh-logistics
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

#### 1. Server Requirements
- **OS**: Ubuntu 20.04/22.04
- **RAM**: 4GB minimum
- **Storage**: 20GB minimum
- **Domain**: For SSL certificates
- **Ports**: 80, 443 open

#### 2. Install Docker
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

#### 3. Configure Environment
```bash
# Copy and edit environment
cp .env.production .env
nano .env

# Required variables:
# DOMAIN=yourdomain.com
# DB_USER=mh_user
# DB_PASS=secure_password
# JWT_SECRET=your_jwt_secret
```

#### 4. Deploy with Docker
```bash
# Create required directories
mkdir -p logs traefik/letsencrypt data uploads

# Start services
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:run
```

#### 5. Access Application
- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Swagger**: https://yourdomain.com/api
- **Traefik Dashboard**: http://yourdomain.com:8080

### Production Environment Variables
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed configuration.

## 🧪 Testing

### Backend Tests
```bash
cd MH-api

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Frontend Tests
```bash
cd MH

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Manual Testing
1. **Test API endpoints** with Postman or curl
2. **Test file uploads** through the UI
3. **Test Excel export** functionality
4. **Test authentication** flow
5. **Test database migrations**

## 🔍 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U your_user -d mh_database
```

#### Docker Issues
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs api
docker-compose logs frontend
docker-compose logs db

# Restart services
docker-compose restart
```

#### Port Conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep :3002
sudo netstat -tulpn | grep :3000

# Kill processes if needed
sudo kill -9 <PID>
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./uploads
sudo chmod -R 755 ./uploads
```

### Performance Issues
```bash
# Check system resources
docker stats
free -h
df -h

# Optimize database
docker-compose exec api npm run db:run
```

### SSL Certificate Issues
```bash
# Check Traefik logs
docker-compose logs traefik

# Restart certificate generation
docker-compose restart traefik
```

## 📞 Support

### Documentation
- [Deployment Guide](DEPLOYMENT.md)
- [Postcode Data Management](POSTCODE_DATA.md)
- [File Storage Configuration](FILE_STORAGE.md)

### Getting Help
1. **Check logs**: `docker-compose logs -f`
2. **Review documentation**: Check relevant .md files
3. **Test locally**: Reproduce issue in development
4. **Environment check**: Verify all variables are set

### Best Practices
- **Regular Backups**: Backup database and uploads
- **Monitor Performance**: Use docker stats and logs
- **Security Updates**: Keep Docker images updated
- **Testing**: Always test in staging first

## 📈 Roadmap

### Upcoming Features
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-warehouse support
- [ ] API rate limiting
- [ ] Audit logging
- [ ] Automated backup system

### Technical Improvements
- [ ] GraphQL API
- [ ] Redis caching
- [ ] Microservices architecture
- [ ] Real-time notifications (WebSocket)

---

**Developed with ❤️ for the logistics industry**

*Last updated: January 2026*