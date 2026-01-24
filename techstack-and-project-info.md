# MH Project - Tech Stack and Information

## Technology Stack Summary

The "MH project" is a full-stack web application consisting of two main components: a frontend application (`MH`) and a backend API (`MH-api`). The project uses modern JavaScript/TypeScript technologies with a focus on scalability, code quality, and deployment efficiency. Below is a detailed breakdown based on the analyzed configuration files (e.g., `package.json`, `tsconfig.json`, and other key files) and directory structure.

### Programming Languages
- **TypeScript**: Primary language for both frontend and backend, configured via `tsconfig.json` in each subdirectory. Provides type safety and modern JavaScript features.
- **JavaScript**: Used in configuration files (e.g., `next.config.js`, `tailwind.config.js`, `jest.config.js`) and some runtime scripts.

### Frameworks and Libraries
#### Frontend (MH)
- **Next.js** (^12.1.5): React-based framework for server-side rendering (SSR), static site generation (SSG), and API routes. Includes internationalization support via `next-translate`.
- **React** (^18.0.0): Core UI library with hooks and components.
- **Ant Design** (^4.24.10): UI component library for consistent design (e.g., icons from `@ant-design/icons`).
- **Tailwind CSS** (^3.0.24): Utility-first CSS framework for styling, with PostCSS configuration.
- **Redux Toolkit** (@reduxjs/toolkit ^1.8.1): State management for complex app state.
- **React Query** (^3.38.1): Data fetching and caching library for API interactions.
- **Axios** (^0.27.2): HTTP client for API requests.
- **Sass/SCSS** (^1.51.0): CSS preprocessor for advanced styling.
- **CKEditor** (@ckeditor/ckeditor5-build-classic ^38.0.1): Rich text editor integration.
- **React Slick** (^0.29.0) & **Slick Carousel**: Carousel/slider components.
- **React Infinite Scroll**: For handling large lists with lazy loading.
- **Moment.js** (^0.5.47) & **Day.js**: Date/time manipulation (note: Moment is used in frontend, Day.js in backend).
- **Lodash** (^4.17.21): Utility library for functional programming.
- **UUID** (^8.3.2): For generating unique identifiers.
- **Query String** (^8.0.3): URL query parsing.
- Other utilities: `clsx` (conditional CSS classes), `nprogress` (loading indicators), `hamburger-react` (menu components).

#### Backend (MH-api)
- **NestJS** (^8.0.0): Node.js framework for building scalable server-side applications with modular architecture (modules, controllers, services).
- **TypeORM** (^0.3.20): ORM for database interactions, configured for PostgreSQL (via `pg` ^8.14.1).
- **JWT & Passport**: Authentication via `@nestjs/jwt` (^8.0.0), `passport-jwt` (^4.0.0), and `passport` (^0.5.2).
- **Swagger** (@nestjs/swagger ^5.2.1): API documentation generation.
- **Class Validator** (^0.13.2) & **Class Transformer** (^0.5.1): Data validation and transformation.
- **Axios** (^1.2.2): HTTP client for external API calls.
- **Bcrypt** (^5.0.1): Password hashing.
- **Winston** (^3.7.2) & **Winston Daily Rotate File**: Logging with file rotation.
- **AWS SDK** (^2.1247.0): Cloud services integration (e.g., S3, etc.).
- **Azure/Microsoft Graph Client** (@microsoft/microsoft-graph-client 3.0.0): Integration with Microsoft services.
- **Puppeteer** (^19.4.1): Headless browser for PDF generation, web scraping, or automated testing.
- **ExcelJS** (^4.4.0) & **xlsx** (^0.18.5): Excel file creation and parsing.
- **Archiver** (^6.0.1): ZIP file handling.
- **IMAP** (^0.8.19) & **Mailcomposer**: Email handling and composition.
- **Muhammara** (^3.5.0): PDF manipulation.
- **New Relic** (^8.14.1): Application performance monitoring.
- **NestJS Schedule** (^1.1.0): Cron job scheduling.
- **NestJS Event Emitter** (^2.0.4): Event-driven architecture.
- **Async Mutex** (^0.4.0): Concurrency control.
- **Reflect Metadata**: For decorators.
- **Remove Accents** (^0.5.0): Text normalization.
- **UUID** (^11.1.0): Unique ID generation.
- **Xmldom** (^0.6.0): XML parsing.
- Other utilities: `lodash` (^4.17.21), `moment` (^2.29.2), `isomorphic-fetch` (^3.0.0), `jsbarcode` (^3.11.5), `node-xlsx` (^0.21.0), `memory-streams` (^0.1.3).

### Build Tools and Development Tools
- **Package Managers**: npm (with `package-lock.json`) and Yarn (with `yarn.lock` in frontend).
- **Build Tools**:
  - Next.js CLI: Handles building, linting, and starting the frontend.
  - Nest CLI: Generates modules, controllers, services; builds and runs the backend.
  - TypeScript Compiler: Transpiles TS to JS, with incremental builds.
- **Testing**:
  - **Jest** (^27.x): Unit and integration testing for both frontend and backend. Includes coverage reporting and watch mode.
  - **Testing Library** (@testing-library/react ^13.1.1, @testing-library/jest-dom ^5.16.4): React testing utilities.
  - **Supertest** (^6.1.3): API endpoint testing for NestJS.
- **Code Quality and Linting**:
  - **ESLint** (^8.x): Linting with TypeScript support, Prettier integration, and custom rules (e.g., unused imports, simple import sorting).
  - **Prettier** (^2.x): Code formatting, with Tailwind plugin for frontend.
  - **Commitlint** (@commitlint/cli ^16.2.3): Enforces conventional commit messages.
  - **Husky** (^7.0.4): Git hooks for pre-commit checks.
  - **Lint-Staged**: Runs linters on staged files.
- **Versioning and Releases**:
  - **Standard-Version** (^9.3.2): Automated changelog and versioning.
- **Other Tools**:
  - **PM2** (ecosystem.config.js): Process manager for production deployment and clustering.
  - **Rimraf**: Cross-platform rm for cleaning builds.
  - **Cross-Env**: Environment variable handling.
  - **Tsconfig Paths**: Path mapping for TypeScript.
  - **SVGR**: SVG to React component conversion.

### Databases
- **PostgreSQL**: Primary database (via `pg` ^8.14.1 in backend). Includes TypeORM migrations (scripts for generate, run, rollback).

### Deployment and Hosting
- **Vercel**: Frontend deployment (via `vercel.json`).
- **PM2**: Process management for both components in production.
- **New Relic**: Monitoring for backend.

### Other Technologies and Integrations
- **Authentication**: JWT-based with Passport.
- **File Handling**: Multer for uploads, Excel/PDF generation, ZIP archiving.
- **Email/IMAP**: For communication features.
- **Cloud Services**: AWS (storage/compute), Azure (Microsoft integrations).
- **Internationalization (i18n)**: Frontend uses `next-translate` with locale files in `locales/`.
- **SEO**: Next.js sitemap generation (`next-sitemap.js`).
- **Monitoring**: New Relic for backend performance.
- **Scheduling**: Cron jobs via NestJS Schedule.
- **Environment Management**: `.env` files for configuration (development, production).

## Project Information
- **Project Name**: "MH project" (with sub-components "ts-nextjs-tailwind-starter" for frontend and "mh-api" for backend).
- **Purpose**: Appears to be a business-oriented web application with user management, company profiles, categories, homepage content, and features like exchange rate handling (inferred from scripts like "ml-exchange-rate"). It supports file uploads, Excel exports, PDF generation, email/IMAP, and integrations with AWS/Azure. The frontend provides a user interface (likely for admins or end-users), while the backend handles API logic, database operations, and background tasks. No detailed README was found in the root or frontend directory, but the backend README is a standard NestJS template with a developer note ("Sohan_dev").
- **Features**:
  - User and company management (seeding scripts).
  - Category and homepage content management.
  - Authentication and authorization.
  - Data export/import (Excel, PDF).
  - Scheduled tasks and event handling.
  - Multi-language support (i18n).
  - Responsive UI with carousels, infinite scroll, and rich text editing.
  - API documentation via Swagger.
  - Logging, monitoring, and automated testing.
- **Dependencies**: Managed via npm/Yarn; includes production and dev dependencies for both components.
- **Version**: Frontend at 0.1.0; Backend at 0.0.1 (private/unlicensed).
- **License**: UNLICENSED (backend); not specified for frontend.

The project is well-structured for scalability, with clear separation of concerns, automated tooling for quality assurance, and support for modern web development practices.