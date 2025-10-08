# 🏥 Roster Monster

A comprehensive workforce management and scheduling platform designed for healthcare institutions, hospitals, and organizations that require complex staff rostering and shift management.

![Roster Monster](https://img.shields.io/badge/Status-Active-brightgreen)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-blue)
![React](https://img.shields.io/badge/Frontend-React-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC-blue)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![Docker](https://img.shields.io/badge/Containerized-Docker-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Smart Roster Generation**: AI-powered automatic roster creation with intelligent staff allocation
- **Multi-Location Support**: Manage staff across different departments and locations
- **Shift Management**: Comprehensive shift scheduling with various shift types and patterns
- **Staff Management**: Complete staff profiles with roles, qualifications, and availability
- **Leave Management**: Integrated leave request system with approval workflows
- **FTE (Full-Time Equivalent) Tracking**: Monitor and manage staff capacity and workload

### 🔧 Advanced Features
- **Template-Based Scheduling**: Create reusable roster templates for consistent scheduling
- **Real-time Updates**: Live roster updates with WebSocket support
- **Role-Based Access Control**: Secure access management with different user roles
- **Holiday Integration**: Automatic holiday detection and scheduling adjustments
- **Availability Tracking**: Monitor staff availability and preferences
- **Reporting & Analytics**: Comprehensive reporting for workforce insights
- **Subscription Management**: Built-in subscription and payment processing

### 🎨 User Experience
- **Modern UI/UX**: Clean, intuitive interface built with React and Tailwind CSS
- **Responsive Design**: Fully responsive design for desktop and mobile devices
- **Drag & Drop Interface**: Easy roster management with drag-and-drop functionality
- **Calendar Integration**: Visual calendar interface for schedule management
- **Real-time Notifications**: Instant updates and notifications

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: MySQL 8.0 with SQLAlchemy ORM
- **Authentication**: JWT with OAuth2
- **Caching**: Redis for session management
- **AI Integration**: OpenAI API for intelligent roster generation
- **File Storage**: MinIO for document and file management
- **Migration**: Alembic for database migrations

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Process Management**: Gunicorn (Python WSGI)
- **Environment**: Poetry for Python dependency management
- **Package Manager**: npm/yarn for frontend dependencies

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (MySQL)       │
│   Port: 80      │    │   Port: 8000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Redis         │    │   MinIO         │
│   (Reverse      │    │   (Cache)       │    │   (File Storage)│
│   Proxy)        │    │   Port: 6379    │    │   Port: 9000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (18+) and **npm** (9+)
- **Python** (3.12+) and **Poetry** (1.6+)
- **Git** (2.30+)

## 🚀 Installation

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/roster-monster.git
   cd roster-monster
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Installation

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   poetry install
   ```

3. **Set up database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE roster_monster;"
   
   # Run migrations
   poetry run alembic upgrade head
   ```

4. **Start the backend server**
   ```bash
   poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_HOSTNAME=localhost
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_PORT=3306
DATABASE_NAME=roster_monster

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=1

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key

# MinIO Configuration (for file storage)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
```

### Database Configuration

The application uses MySQL with the following key tables:
- `users` - User accounts and authentication
- `staff` - Staff member profiles
- `roles` - Staff roles and permissions
- `locations` - Department and location management
- `rosters` - Roster schedules and assignments
- `leave_requests` - Leave management
- `templates` - Reusable roster templates

## 📖 Usage

### Getting Started

1. **Create an Account**: Sign up with your email and institution details
2. **Set Up Your Organization**: Configure departments, locations, and staff roles
3. **Add Staff Members**: Create staff profiles with their roles and availability
4. **Create Roster Templates**: Set up reusable scheduling templates
5. **Generate Rosters**: Use the AI-powered roster generation or manual scheduling
6. **Manage Leave**: Handle leave requests and approvals
7. **Monitor FTE**: Track staff capacity and workload distribution

### Key Features Guide

#### Roster Management
- Create and manage staff schedules across multiple locations
- Use drag-and-drop interface for easy schedule adjustments
- Generate automatic rosters based on staff availability and requirements
- Export schedules to various formats

#### Staff Management
- Maintain comprehensive staff profiles
- Track qualifications, certifications, and preferences
- Manage staff groups and departments
- Monitor staff availability and workload

#### Leave Management
- Submit and approve leave requests
- Track leave balances and types
- Integrate leave data with roster generation
- Generate leave reports and analytics

## 📚 API Documentation

The API documentation is automatically generated and available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/staff` - Retrieve staff members
- `POST /api/v1/rosters` - Create new roster
- `GET /api/v1/rosters/{id}` - Get roster details
- `PUT /api/v1/rosters/{id}` - Update roster
- `POST /api/v1/leave-requests` - Submit leave request
- `GET /api/v1/reports/workforce` - Generate workforce reports

## 🛠 Development

### Development Setup

1. **Clone and install dependencies** (as shown in Installation)
2. **Set up development environment**
   ```bash
   # Backend
   cd backend
   poetry install --with dev
   
   # Frontend
   cd frontend
   npm install
   ```

3. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && poetry run uvicorn app.main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

### Code Structure

```
roster-monster/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes and endpoints
│   │   ├── core/          # Core functionality
│   │   ├── models/        # Database models
│   │   ├── routers/       # Route handlers
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── alembic/           # Database migrations
│   └── tests/             # Test files
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utility functions
│   └── public/            # Static assets
└── docker-compose.yml     # Docker configuration
```

### Testing

```bash
# Backend tests
cd backend
poetry run pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
poetry run black .
poetry run isort .
poetry run flake8

# Frontend linting
cd frontend
npm run lint
npm run lint:fix
```

## 🚀 Deployment

### Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.yml build
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Set up reverse proxy** (Nginx)
   ```bash
   # Configure Nginx for production
   sudo cp nginx.conf /etc/nginx/sites-available/roster-monster
   sudo ln -s /etc/nginx/sites-available/roster-monster /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Environment-Specific Configuration

- **Development**: Use `docker-compose.dev.yml`
- **Production**: Use `docker-compose.yml`
- **Staging**: Create `docker-compose.staging.yml`

### Monitoring and Logging

- Application logs are available via Docker logs
- Database monitoring through MySQL performance schema
- Redis monitoring via Redis CLI
- Health checks available at `/health` endpoint

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed documentation
- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/your-username/roster-monster/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/your-username/roster-monster/discussions) for community support
- **Email**: Contact us at support@rostermonster.com

## 🙏 Acknowledgments

- Built with ❤️ for healthcare professionals
- Special thanks to the open-source community
- Inspired by the need for better workforce management in healthcare

---

**Made with ❤️ by the Roster Monster Team**