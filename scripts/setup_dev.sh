#!/bin/bash

# Roster Monster Development Setup Script
# This script sets up the development environment for the Roster Monster project

set -e  # Exit on any error

echo "🏥 Setting up Roster Monster Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p media
    mkdir -p backend/logs
    mkdir -p frontend/logs
    
    print_success "Directories created!"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_warning "Created .env file from template. Please update it with your configuration."
        print_warning "IMPORTANT: Change the SECRET_KEY and other sensitive values!"
    else
        print_success ".env file already exists."
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install Poetry if not installed
    if ! command -v poetry &> /dev/null; then
        print_status "Installing Poetry..."
        curl -sSL https://install.python-poetry.org | python3 -
        export PATH="$HOME/.local/bin:$PATH"
    fi
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    poetry install
    
    cd ..
    print_success "Backend setup complete!"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    cd ..
    print_success "Frontend setup complete!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start MySQL container
    print_status "Starting MySQL container..."
    docker-compose up -d mysql
    
    # Wait for MySQL to be ready
    print_status "Waiting for MySQL to be ready..."
    sleep 10
    
    # Run migrations
    print_status "Running database migrations..."
    cd backend
    poetry run alembic upgrade head
    cd ..
    
    print_success "Database setup complete!"
}

# Create initial admin user
create_admin_user() {
    print_status "Creating initial admin user..."
    
    cd backend
    poetry run python -c "
from app.database import get_db
from app.models import User
from app.utils import hash
from sqlalchemy.orm import Session

db = next(get_db())
admin_user = User(
    email='admin@rostermonster.com',
    password=hash('admin123'),
    institution_id='default',
    role='admin'
)
db.add(admin_user)
db.commit()
print('Admin user created: admin@rostermonster.com / admin123')
"
    cd ..
    
    print_success "Admin user created!"
}

# Main setup function
main() {
    echo "Starting Roster Monster development setup..."
    echo "=============================================="
    
    check_requirements
    create_directories
    setup_environment
    setup_backend
    setup_frontend
    setup_database
    create_admin_user
    
    echo ""
    echo "=============================================="
    print_success "🎉 Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with your configuration"
    echo "2. Start the development servers:"
    echo "   - Backend: cd backend && poetry run uvicorn app.main:app --reload"
    echo "   - Frontend: cd frontend && npm run dev"
    echo "   - Or use Docker: docker-compose -f docker-compose.dev.yml up"
    echo ""
    echo "3. Access the application:"
    echo "   - Frontend: http://localhost:5173"
    echo "   - Backend API: http://localhost:8000"
    echo "   - API Docs: http://localhost:8000/docs"
    echo ""
    echo "Default admin credentials:"
    echo "   - Email: admin@rostermonster.com"
    echo "   - Password: admin123"
    echo ""
    print_warning "Remember to change the default admin password!"
}

# Run main function
main "$@"
