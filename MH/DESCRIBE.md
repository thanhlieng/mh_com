# MH Great Sun - Project Description

## Overview

**MH Great Sun** is an enterprise-level logistics and shipping management system built with modern web technologies. It provides comprehensive tools for managing orders, customers, employees, and services with role-based access control and multi-language support.

- **Project Name**: ts-nextjs-tailwind-starter
- **Version**: 0.1.0
- **Type**: Full-stack web application
- **Primary Use**: Logistics/Shipping Management Platform

---

## Technology Stack

### Core Framework

- **Framework**: Next.js v12.1.5
- **Language**: TypeScript 4.6.3
- **React**: v18.0.0
- **Node.js**: 20 (Docker)

### Styling & UI

- **CSS Framework**: Tailwind CSS v3.0.24
- **UI Components**: Ant Design (antd) v4.24.10
- **Icon Library**: Ant Design Icons v4.7.0
- **Preprocessor**: SCSS/Sass v1.51.0

### State Management

- **State Library**: Redux Toolkit v1.8.1
- **React-Redux**: v8.0.1 (bindings)
- **Server State**: React Query v3.38.1

### HTTP & API

- **HTTP Client**: Axios v0.27.2
- **Query Parser**: query-string v8.0.3, qs

### Rich Text & Editors

- **WYSIWYG Editor**: CKEditor 5 Classic v38.0.1
- **React Wrapper**: @ckeditor/ckeditor5-react v6.0.0

### UI Components & Utilities

- **Carousel**: react-slick v0.29.0
- **Infinite Scroll**: react-infinite-scroll-component v6.1.0
- **Progress Bar**: nprogress v0.2.0
- **Icons**: react-icons v4.3.1
- **Menu**: hamburger-react v2.5.0
- **Class Utils**: clsx v1.1.1, tailwind-merge v1.2.1

### Utilities

- **Lodash**: v4.17.21 (utility functions)
- **UUID**: v8.3.2 (unique identifiers)
- **Date/Time**: moment-timezone v0.5.47
- **Fonts**: @fontsource/roboto v4.5.5

### Development Tools

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Testing**: Jest + React Testing Library
- **Git Hooks**: Husky + lint-staged
- **Versioning**: standard-version
- **Commit Linting**: commitlint
- **SVG Handling**: SVGR webpack loader

### Deployment & DevOps

- **Container**: Docker (multi-stage build, Node 20 Alpine)
- **Process Manager**: PM2
- **Deployment**: Vercel ready
- **Build Output**: Standalone Next.js application

---

## Project Structure

```
F:\work\mhcom\MH\
├── src/                          # Source code
│   ├── components/               # Reusable React components (35+ directories)
│   ├── container/                # Page-level feature components (45+ containers)
│   ├── pages/                    # Next.js routes and API endpoints
│   ├── services/                 # API service layer for data fetching
│   ├── layout/                   # Layout wrappers (5+ layouts)
│   ├── store/                    # Redux store and state management
│   ├── hook/                     # Custom React hooks
│   ├── routes/                   # Route protection and guards
│   ├── utils/                    # Utility functions and helpers
│   ├── types/                    # TypeScript type definitions
│   ├── styles/                   # Global and component styles
│   ├── lib/                      # Library utilities
│   ├── customer/                 # Customer-specific features
│   └── contants/                 # Application constants
├── public/                       # Static assets
│   ├── favicon/                  # Favicon files
│   ├── fonts/                    # Font files
│   ├── images/                   # Image assets
│   └── svg/                      # SVG files
├── locales/                      # i18n translation files
├── [Configuration Files]
└── [Docker & Deployment Files]
```

---

## Layout System

The application supports multiple layouts for different page types:

| Layout            | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| **HomeLayout**    | Public/home pages and landing pages              |
| **AdminLayout**   | Admin dashboard and administrative functions     |
| **ManagerLayout** | Manager dashboard and management features        |
| **BlankLayout**   | Minimal layout for error pages and special views |
| **NewLayout**     | Alternative layout option                        |

---

## Key Features & Containers

### Admin Features (45+ Containers)

- **Employee Management**: Create, update, delete employee records
- **Customer Management**: Manage customer profiles and information
- **History Tracking**: System history and audit logs
- **Role & Permission Management**: Access control configuration

### Booking & Orders

- **Order Creation**: Create and manage shipping orders
- **Manifest Management**: Handle shipment manifests
- **Pickup Assignment**: Assign pickups to drivers/staff

### Forms & Data Entry

- **Business Forms**: Company information and details
- **Competence Forms**: Employee competence tracking
- **Network Forms**: Network management
- **Recruitment Forms**: Recruitment process management
- **Ideology Forms**: Company ideology/culture documentation

### Services Management

- **Express Delivery**: Fast delivery service management
- **Air Cargo**: Air freight handling
- **Forwarding**: Cargo forwarding services
- **Conditional Goods**: Special/hazardous goods handling

### Reports & Analytics

- **Statistical Reports**: Customer statistics and trends
- **Revenue Reports**: Financial analysis
- **Service Reports**: Service usage and performance
- **POD Reports**: Proof of Delivery reports

### Support & Tracking

- **Customer Support**: Support request management
- **Request Handling**: Customer request processing
- **Tracking**: Real-time shipment tracking

---

## Configuration Files

### Build & Runtime Configuration

| File                   | Purpose                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **package.json**       | Project metadata, dependencies, npm scripts                                         |
| **tsconfig.json**      | TypeScript compiler options with path aliases (`@/*` → `src/*`, `~/*` → `public/*`) |
| **next.config.js**     | Next.js configuration (SVGR loader, i18n, standalone output)                        |
| **tailwind.config.js** | Tailwind CSS customization (colors, animations, breakpoints)                        |
| **postcss.config.js**  | PostCSS plugins configuration                                                       |
| **jest.config.js**     | Jest testing configuration                                                          |
| **jest.setup.js**      | Jest environment setup                                                              |

### Code Quality

| File                     | Purpose                       |
| ------------------------ | ----------------------------- |
| **.eslintrc.js**         | ESLint rules and plugins      |
| **.prettierrc.js**       | Code formatting rules         |
| **commitlint.config.js** | Conventional commit standards |

### Deployment & DevOps

| File                    | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| **Dockerfile**          | Docker containerization (Node 20 Alpine, multi-stage build) |
| **ecosystem.config.js** | PM2 process manager configuration                           |
| **vercel.json**         | Vercel deployment configuration                             |
| **next-sitemap.js**     | XML sitemap generation                                      |

### Internationalization

| File        | Purpose                      |
| ----------- | ---------------------------- |
| **i18n.js** | next-translate configuration |

---

## Internationalization (i18n)

- **Supported Languages**: Vietnamese (vi), English (en)
- **Default Locale**: Vietnamese
- **Library**: next-translate v1.4.0
- **Translation Namespaces**: 'common', 'booking'
- **Configuration**: Manual locale switching (auto-detection disabled)
- **Storage Location**: `/locales` directory

---

## Design System

### Tailwind CSS Customization

**Color Scheme:**

- **Primary**: Yellow (#efbd2b)
- **Secondary**: Blue (#1464a9)
- **Dark**: #222222

**Responsive Breakpoints:**

- `xs`: 0-639px (Mobile)
- `sm`: 640px-1024px (Tablet)
- `md`: 1025px+ (Desktop)

**Custom Animations:**

- Flicker effect
- Shimmer effect

**Typography:**

- **Primary Font**: Inter

---

## Development Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server (port 3000) |
| `npm run start:dev`    | Start development server (port 8000) |
| `npm run build`        | Build for production                 |
| `npm run start`        | Start production server (port 8000)  |
| `npm run lint`         | Run ESLint checks                    |
| `npm run lint:fix`     | Fix linting issues and format code   |
| `npm run lint:strict`  | Strict linting (no warnings allowed) |
| `npm run typecheck`    | TypeScript type checking             |
| `npm run test`         | Run tests once                       |
| `npm run test:watch`   | Run tests in watch mode              |
| `npm run format`       | Format all files with Prettier       |
| `npm run format:check` | Check formatting without changes     |
| `npm run release`      | Create version release               |
| `npm run push-release` | Push release to main branch          |

---

## Code Quality & Standards

### Linting & Formatting

- **ESLint**: Comprehensive code linting with TypeScript support
- **Prettier**: Automatic code formatting
- **Pre-commit Hooks**: Husky integration with lint-staged

### TypeScript

- **Strict Mode**: Fully enabled
- **Path Aliases**:
  - `@/` → `./src/*`
  - `~/` → `./public/*`

### Commit Standards

- **Convention**: Conventional commits
- **Allowed Types**: feat, fix, docs, chore, style, refactor, ci, test, perf, revert, vercel
- **Enforcement**: commitlint with Husky

### Testing

- **Framework**: Jest
- **React Testing**: React Testing Library
- **Test Patterns**: Unit tests for utilities and components

---

## Docker & Deployment

### Docker Build

- **Multi-stage Build**: Optimized for production
- **Base Image**: Node 20 Alpine
- **Build Stage**: Compilation and dependency installation
- **Runtime Stage**: Minimal production image
- **Output**: Standalone Next.js application
- **Port**: 3000 (exposed)

### Deployment Options

1. **Vercel**: Native support with vercel.json configuration
2. **Docker**: Containerized deployment
3. **PM2**: Process manager for Node.js applications

### Environment

- **Standalone Output**: Self-contained deployment bundle
- **Cache Headers**: Configured via vercel.json

---

## Getting Started

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev          # port 3000
npm run start:dev    # port 8000
```

### Building

```bash
# Type check
npm run typecheck

# Lint code
npm run lint:fix

# Build for production
npm run build

# Start production server
npm run start
```

### Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch
```

### Docker Deployment

```bash
# Build Docker image
docker build -t mh-great-sun .

# Run container
docker run -p 3000:3000 mh-great-sun
```

---

## Key Dependencies Summary

| Category               | Libraries                                 |
| ---------------------- | ----------------------------------------- |
| **Frontend Framework** | Next.js, React, React DOM                 |
| **State Management**   | Redux Toolkit, React Redux, React Query   |
| **UI Components**      | Ant Design, Ant Design Icons, React Icons |
| **Styling**            | Tailwind CSS, SCSS                        |
| **HTTP Client**        | Axios                                     |
| **Editors**            | CKEditor 5                                |
| **Rich Components**    | react-slick, infinite-scroll, nprogress   |
| **Utilities**          | lodash, uuid, moment-timezone             |
| **Dev Tools**          | ESLint, Prettier, Jest, Husky             |
| **Type Checking**      | TypeScript                                |

---

## Project Highlights

✓ **Enterprise-Ready**: Production-grade logistics management system
✓ **Type-Safe**: Full TypeScript with strict mode enabled
✓ **Responsive Design**: Mobile, tablet, and desktop support
✓ **Multi-Language**: Vietnamese and English support
✓ **Role-Based Access**: Comprehensive permission management
✓ **Modern Stack**: Next.js 12, React 18, Tailwind CSS
✓ **Containerized**: Docker support for easy deployment
✓ **Well-Configured**: ESLint, Prettier, Husky for code quality
✓ **Scalable Architecture**: Modular component and container structure
✓ **Rich Features**: Advanced forms, reports, tracking, and analytics

---

## Notes

- The application is designed specifically for a logistics and shipping management company (MH Great Sun)
- It includes complex admin dashboards and management interfaces
- The codebase follows modern React and TypeScript best practices
- Strong emphasis on code quality with linting, formatting, and testing
- Ready for deployment on Vercel or Docker-based infrastructure
