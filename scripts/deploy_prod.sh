#!/bin/bash

# Roster Monster Production Deployment Script
# This script deploys the Roster Monster application to production

set -e  # Exit on any error

echo "🚀 Deploying Roster Monster to Production..."

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

# Configuration
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
DOMAIN=${DOMAIN:-"your-domain.com"}
SSL_EMAIL=${SSL_EMAIL:-"admin@your-domain.com"}

# Check if running as root
check_permissions() {
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root for security reasons."
        exit 1
    fi
}

# Check system requirements
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
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        print_error ".env file not found. Please create it from env.example and configure it."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Create backup
create_backup() {
    print_status "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker ps | grep -q mysql; then
        print_status "Backing up database..."
        docker exec mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD:-rootpassword}" "${MYSQL_DATABASE:-voxirad}" > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup uploads and media
    if [ -d "uploads" ]; then
        cp -r uploads "$BACKUP_DIR/"
    fi
    
    if [ -d "media" ]; then
        cp -r media "$BACKUP_DIR/"
    fi
    
    # Backup logs
    if [ -d "logs" ]; then
        cp -r logs "$BACKUP_DIR/"
    fi
    
    print_success "Backup created at $BACKUP_DIR"
}

# Build and deploy
deploy_application() {
    print_status "Building and deploying application..."
    
    # Pull latest images
    print_status "Pulling latest images..."
    docker-compose pull
    
    # Build custom images
    print_status "Building application images..."
    docker-compose build --no-cache
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down
    
    # Start new containers
    print_status "Starting new containers..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec backend alembic upgrade head
    
    print_success "Application deployed successfully!"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    if [ "$DOMAIN" != "your-domain.com" ]; then
        print_status "Setting up SSL certificate..."
        
        # Install certbot if not installed
        if ! command -v certbot &> /dev/null; then
            print_status "Installing certbot..."
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-nginx
        fi
        
        # Obtain SSL certificate
        print_status "Obtaining SSL certificate for $DOMAIN..."
        sudo certbot --nginx -d "$DOMAIN" --email "$SSL_EMAIL" --agree-tos --non-interactive
        
        print_success "SSL certificate configured!"
    else
        print_warning "Domain not configured. Skipping SSL setup."
    fi
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create log rotation configuration
    sudo tee /etc/logrotate.d/roster-monster > /dev/null <<EOF
/var/log/roster-monster/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose restart backend frontend
    endscript
}
EOF
    
    # Setup systemd service for auto-restart
    sudo tee /etc/systemd/system/roster-monster.service > /dev/null <<EOF
[Unit]
Description=Roster Monster Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable roster-monster.service
    
    print_success "Monitoring and auto-restart configured!"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Some containers are not running!"
        docker-compose ps
        exit 1
    fi
    
    # Check API health
    if command -v curl &> /dev/null; then
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            print_success "API health check passed!"
        else
            print_warning "API health check failed. Check logs for details."
        fi
    fi
    
    print_success "Health check completed!"
}

# Cleanup old images
cleanup() {
    print_status "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    find backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    print_success "Cleanup completed!"
}

# Main deployment function
main() {
    echo "Starting Roster Monster production deployment..."
    echo "================================================"
    
    check_permissions
    check_requirements
    create_backup
    deploy_application
    setup_ssl
    setup_monitoring
    health_check
    cleanup
    
    echo ""
    echo "================================================"
    print_success "🎉 Production deployment complete!"
    echo ""
    echo "Application is now running at:"
    if [ "$DOMAIN" != "your-domain.com" ]; then
        echo "   - https://$DOMAIN"
    else
        echo "   - http://localhost"
    fi
    echo "   - API: http://localhost:8000"
    echo "   - API Docs: http://localhost:8000/docs"
    echo ""
    echo "Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Restart: docker-compose restart"
    echo "   - Stop: docker-compose down"
    echo "   - Update: ./scripts/deploy_prod.sh"
    echo ""
    print_warning "Remember to:"
    echo "   1. Configure your domain and SSL"
    echo "   2. Set up proper backups"
    echo "   3. Monitor application logs"
    echo "   4. Update firewall rules if needed"
}

# Run main function
main "$@"
