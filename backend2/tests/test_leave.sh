#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Base URL for the API
BASE_URL="http://localhost:8001"

# Function to print error messages
print_error() {
    echo -e "${RED}$1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}$1${NC}"
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/docs" > /dev/null; then
    print_error "Error: Server is not running. Please start the server with:"
    print_error "poetry run uvicorn app.main:app --reload --port 8001"
    exit 1
fi

echo "Testing leave endpoints..."

# Register a test user
echo "Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register/" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User",
        "email": "test_leave@example.com",
        "password": "testpassword123",
        "userType": "Radiologist"
    }')

if [[ $REGISTER_RESPONSE == *"error"* ]]; then
    print_error "Registration failed: $REGISTER_RESPONSE"
    exit 1
fi

# Use the correct user ID
USER_ID=20
print_success "Registration successful"

# Login to get access token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login/" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "test_leave@example.com",
        "password": "testpassword123"
    }')

echo "Login response: $LOGIN_RESPONSE"

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
    print_error "Failed to get access token"
    exit 1
fi

print_success "Login successful"

# Test GET /api/leaves/
echo "Testing GET /api/leaves/"
GET_LEAVES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/leaves/" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $GET_LEAVES_RESPONSE == *"error"* ]]; then
    print_error "GET /api/leaves/ failed: $GET_LEAVES_RESPONSE"
    exit 1
fi

print_success "GET /api/leaves/ successful"

# Test POST /api/leaves/
echo "Testing POST /api/leaves/"
CREATE_LEAVE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/leaves/" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"radiologistID\": $USER_ID,
        \"startTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"endTime\": \"$(date -u -d "+1 day" +"%Y-%m-%dT%H:%M:%SZ")\",
        \"remarks\": \"Test leave request\"
    }")

echo "Create leave response: $CREATE_LEAVE_RESPONSE"

LEAVE_ID=$(echo "$CREATE_LEAVE_RESPONSE" | jq -r '.id')
if [ -z "$LEAVE_ID" ] || [ "$LEAVE_ID" == "null" ]; then
    print_error "Failed to get leave ID"
    exit 1
fi

print_success "POST /api/leaves/ successful"

# Test GET /api/leaves/{leave_id}
echo "Testing GET /api/leaves/$LEAVE_ID"
GET_LEAVE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/leaves/$LEAVE_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $GET_LEAVE_RESPONSE == *"error"* ]]; then
    print_error "GET /api/leaves/$LEAVE_ID failed: $GET_LEAVE_RESPONSE"
    exit 1
fi

print_success "GET /api/leaves/$LEAVE_ID successful"

# Test PUT /api/leaves/{leave_id}
echo "Testing PUT /api/leaves/$LEAVE_ID"
UPDATE_LEAVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/leaves/$LEAVE_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "remarks": "Updated test leave request"
    }')

if [[ $UPDATE_LEAVE_RESPONSE == *"error"* ]]; then
    print_error "PUT /api/leaves/$LEAVE_ID failed: $UPDATE_LEAVE_RESPONSE"
    exit 1
fi

print_success "PUT /api/leaves/$LEAVE_ID successful"

print_success "All leave endpoint tests completed successfully!" 