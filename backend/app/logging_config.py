"""
Logging configuration for the Roster Monster API.
"""
import logging
import sys
from datetime import datetime
from typing import Dict, Any
from fastapi import Request, Response
from fastapi.routing import APIRoute
import time

class CustomAPIRoute(APIRoute):
    """Custom API route that logs requests and responses."""
    
    def get_route_handler(self):
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            # Log request
            start_time = time.time()
            logger = logging.getLogger("api")
            
            logger.info(
                f"Request: {request.method} {request.url.path} - "
                f"Client: {request.client.host if request.client else 'unknown'}"
            )
            
            # Process request
            response = await original_route_handler(request)
            
            # Log response
            process_time = time.time() - start_time
            logger.info(
                f"Response: {response.status_code} - "
                f"Process time: {process_time:.4f}s"
            )
            
            return response

        return custom_route_handler

def setup_logging(debug: bool = False) -> None:
    """Set up logging configuration."""
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Set up root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if debug else logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if debug else logging.INFO)
    console_handler.setFormatter(simple_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler for errors
    error_handler = logging.FileHandler('logs/error.log')
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(error_handler)
    
    # File handler for general logs
    info_handler = logging.FileHandler('logs/app.log')
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(info_handler)
    
    # API-specific logger
    api_logger = logging.getLogger("api")
    api_handler = logging.FileHandler('logs/api.log')
    api_handler.setLevel(logging.INFO)
    api_handler.setFormatter(detailed_formatter)
    api_logger.addHandler(api_handler)
    
    # Security logger
    security_logger = logging.getLogger("security")
    security_handler = logging.FileHandler('logs/security.log')
    security_handler.setLevel(logging.WARNING)
    security_handler.setFormatter(detailed_formatter)
    security_logger.addHandler(security_handler)
    
    # Database logger
    db_logger = logging.getLogger("database")
    db_handler = logging.FileHandler('logs/database.log')
    db_handler.setLevel(logging.INFO)
    db_handler.setFormatter(detailed_formatter)
    db_logger.addHandler(db_handler)

def log_security_event(event_type: str, details: Dict[str, Any], user_id: str = None) -> None:
    """Log security-related events."""
    logger = logging.getLogger("security")
    
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "details": details
    }
    
    logger.warning(f"Security Event: {log_data}")

def log_api_error(error: Exception, request: Request = None) -> None:
    """Log API errors with context."""
    logger = logging.getLogger("api")
    
    error_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "error_type": type(error).__name__,
        "error_message": str(error),
        "request_path": request.url.path if request else None,
        "request_method": request.method if request else None,
    }
    
    logger.error(f"API Error: {error_data}")

def log_database_operation(operation: str, table: str, record_id: str = None) -> None:
    """Log database operations."""
    logger = logging.getLogger("database")
    
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "operation": operation,
        "table": table,
        "record_id": record_id
    }
    
    logger.info(f"Database Operation: {log_data}")
