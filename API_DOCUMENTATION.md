# 📚 Roster Monster API Documentation

This document provides comprehensive documentation for the Roster Monster API endpoints, authentication, and usage examples.

## 🔗 Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "role": "admin"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "institution_id": "hospital-001",
  "role": "staff"
}
```

## 👥 Staff Management

### Get All Staff
```http
GET /api/v1/staff
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "role_id": 1,
    "group_id": 1,
    "fte_clinical": 0.8,
    "fte_research": 0.2,
    "fte_admin": 0.0,
    "active": true,
    "user": {
      "id": 1,
      "email": "doctor@hospital.com",
      "role": "staff"
    }
  }
]
```

### Create Staff Member
```http
POST /api/v1/staff
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newstaff@hospital.com",
  "role_id": 1,
  "group_id": 1,
  "fte_clinical": 1.0,
  "fte_research": 0.0,
  "fte_admin": 0.0
}
```

### Update Staff Member
```http
PUT /api/v1/staff/{staff_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "fte_clinical": 0.9,
  "fte_research": 0.1
}
```

### Delete Staff Member
```http
DELETE /api/v1/staff/{staff_id}
Authorization: Bearer <token>
```

## 🏥 Role Management

### Get All Roles
```http
GET /api/v1/staff/roles
Authorization: Bearer <token>
```

### Create Role
```http
POST /api/v1/staff/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Senior Nurse",
  "description": "Senior nursing staff with additional responsibilities"
}
```

## 📅 Roster Management

### Get Rosters
```http
GET /api/v1/rosters
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `location_id`: Filter by location
- `staff_id`: Filter by staff member

### Create Roster
```http
POST /api/v1/rosters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Week 1 Roster",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "location_id": 1,
  "shifts": [
    {
      "date": "2024-01-01",
      "start_time": "08:00",
      "end_time": "16:00",
      "staff_ids": [1, 2, 3],
      "shift_type": "day"
    }
  ]
}
```

### Generate Roster
```http
POST /api/v1/rosters/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "location_id": 1,
  "template_id": 1
}
```

## 🏢 Location Management

### Get All Locations
```http
GET /api/v1/locations
Authorization: Bearer <token>
```

### Create Location
```http
POST /api/v1/locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Emergency Department",
  "type": "clinical",
  "description": "24/7 emergency care unit"
}
```

## 🏖️ Leave Management

### Get Leave Requests
```http
GET /api/v1/leave-requests
Authorization: Bearer <token>
```

### Create Leave Request
```http
POST /api/v1/leave-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "staff_id": 1,
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "leave_type": "annual",
  "reason": "Family vacation"
}
```

### Approve/Reject Leave Request
```http
PUT /api/v1/leave-requests/{request_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "comments": "Approved for family vacation"
}
```

## 📊 FTE Management

### Get FTE Assignments
```http
GET /api/v1/fte
Authorization: Bearer <token>
```

### Update FTE Assignment
```http
PUT /api/v1/fte/{staff_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "fte_clinical": 0.8,
  "fte_research": 0.2,
  "fte_admin": 0.0
}
```

## 📈 Reports

### Workforce Report
```http
GET /api/v1/reports/workforce
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `location_id`: Filter by location
- `format`: Response format (json, csv, pdf)

### Roster Coverage Report
```http
GET /api/v1/reports/coverage
Authorization: Bearer <token>
```

## 🔧 Template Management

### Get Templates
```http
GET /api/v1/templates
Authorization: Bearer <token>
```

### Create Template
```http
POST /api/v1/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Standard Week Template",
  "description": "Standard 7-day roster template",
  "location_id": 1,
  "requirements": [
    {
      "day_of_week": 1,
      "time_slot": "08:00-16:00",
      "role_id": 1,
      "min_staff": 3,
      "max_staff": 5
    }
  ]
}
```

## 📱 WebSocket Endpoints

### Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/roster-updates');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Roster update:', data);
};
```

## 🚨 Error Handling

The API uses standard HTTP status codes and returns error details in JSON format:

```json
{
  "detail": "Error message description",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Common Error Codes

- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Invalid or missing authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `422` - Unprocessable Entity: Validation error
- `500` - Internal Server Error: Server error

## 📝 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Report endpoints**: 10 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Store JWT tokens securely**
3. **Implement proper input validation**
4. **Use strong passwords**
5. **Regularly rotate API keys**
6. **Monitor API usage and logs**

## 📋 Pagination

List endpoints support pagination:

```http
GET /api/v1/staff?page=1&size=20&sort=name
```

**Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 20,
  "pages": 5
}
```

## 🔍 Filtering and Search

Many endpoints support filtering and search:

```http
GET /api/v1/staff?search=doctor&role=clinical&active=true
```

## 📊 Response Formats

The API supports multiple response formats:

- **JSON** (default): `Accept: application/json`
- **CSV**: `Accept: text/csv`
- **PDF**: `Accept: application/pdf` (for reports)

## 🧪 Testing

Use the interactive API documentation at `/docs` for testing endpoints directly in your browser.

## 📞 Support

For API support and questions:
- **Documentation**: Check this file and `/docs`
- **Issues**: Report via GitHub Issues
- **Email**: api-support@rostermonster.com

---

**Last Updated**: January 2024  
**API Version**: 1.0.0
