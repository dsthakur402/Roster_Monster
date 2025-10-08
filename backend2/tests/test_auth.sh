#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8001"

# Function to print success message
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/docs" > /dev/null; then
    error "Server is not running. Please start the server first."
    exit 1
fi
success "Server is running"

# Register a test user
echo "Testing registration endpoint..."
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -v -X POST "$BASE_URL/api/auth/register/" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test User\",
        \"email\": \"test_auth_${TIMESTAMP}@example.com\",
        \"password\": \"testpassword\",
        \"userType\": \"Radiologist\"
    }" 2>&1)

echo "Registration response:"
echo "$REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q "error"; then
    error "Failed to register test user"
    echo "$REGISTER_RESPONSE"
    exit 1
fi
success "Test user registered successfully"

# Login to get access token
echo "Testing login endpoint..."
# Save verbose output to a separate file
LOGIN_VERBOSE_OUTPUT=$(curl -v -X POST "$BASE_URL/api/auth/login/" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"test_auth_${TIMESTAMP}@example.com\",
        \"password\": \"testpassword\"
    }" 2>&1)

# Extract just the response body for processing
LOGIN_RESPONSE=$(echo "$LOGIN_VERBOSE_OUTPUT" | grep -A1 "^{" | tail -n1)

echo "Login verbose output:"
echo "$LOGIN_VERBOSE_OUTPUT"
echo "Login response:"
echo "$LOGIN_RESPONSE"

if [[ "$LOGIN_RESPONSE" == *"error"* ]]; then
    error "Failed to login"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    error "Failed to get access token"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
success "Login successful"

# Test get current user
echo "Testing get current user endpoint..."
CURRENT_USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CURRENT_USER_RESPONSE" | grep -q "error"; then
    error "Failed to get current user"
    echo "$CURRENT_USER_RESPONSE"
    exit 1
fi
success "Get current user successful"

# Test refresh token
echo "Testing refresh token endpoint..."
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token')
if [ -z "$REFRESH_TOKEN" ] || [ "$REFRESH_TOKEN" = "null" ]; then
    error "No refresh token received"
    exit 1
fi

REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh?refresh_token=$REFRESH_TOKEN")

if echo "$REFRESH_RESPONSE" | grep -q "error"; then
    error "Failed to refresh token"
    echo "$REFRESH_RESPONSE"
    exit 1
fi
success "Token refresh successful"

echo -e "\n${GREEN}All authentication tests completed successfully!${NC}" 