#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8001"

# Generate a random email for testing
TEST_EMAIL="test_shift_$(date +%s)@example.com"

echo "Starting shift endpoints test..."

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/docs" > /dev/null; then
    echo -e "${RED}Error: Server is not running. Please start the server first.${NC}"
    echo "Run: poetry run uvicorn app.main:app --reload --port 8001"
    exit 1
fi

# Register a test user
echo "Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register/" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test User\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"testpassword123\",
        \"userType\": \"Radiologist\"
    }")

echo "Registration response: $REGISTER_RESPONSE"

# Extract user ID from registration response
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo -e "${RED}Failed to get user ID from registration response${NC}"
    exit 1
fi

# Login to get access token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login/" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_EMAIL\",
        \"password\": \"testpassword123\"
    }")

echo "Login response: $LOGIN_RESPONSE"

# Extract access token from login response
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo -e "${RED}Failed to get access token${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully logged in${NC}"

# Test GET /api/shifts/
echo "Testing GET /api/shifts/"
GET_SHIFTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/shifts/" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully retrieved shifts${NC}"
    echo "Response: $GET_SHIFTS_RESPONSE"
else
    echo -e "${RED}Failed to retrieve shifts${NC}"
    exit 1
fi

# Test POST /api/shifts/
echo "Testing POST /api/shifts/"
POST_SHIFT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shifts/" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"radiologistID\": $USER_ID,
        \"location\": 2,
        \"startTime\": \"2024-04-21T09:00:00Z\",
        \"endTime\": \"2024-04-21T17:00:00Z\",
        \"specializationRequired\": \"General Radiology\"
    }")

echo "Create shift response: $POST_SHIFT_RESPONSE"

# Extract shift ID from response
SHIFT_ID=$(echo "$POST_SHIFT_RESPONSE" | jq -r '.id')
if [ -z "$SHIFT_ID" ] || [ "$SHIFT_ID" = "null" ]; then
    echo -e "${RED}Failed to create shift${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully created shift${NC}"

# Test GET /api/shifts/{shift_id}
echo "Testing GET /api/shifts/$SHIFT_ID"
GET_SHIFT_RESPONSE=$(curl -s -X GET "$BASE_URL/api/shifts/$SHIFT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully retrieved shift${NC}"
    echo "Response: $GET_SHIFT_RESPONSE"
else
    echo -e "${RED}Failed to retrieve shift${NC}"
    exit 1
fi

# Test PUT /api/shifts/{shift_id}
echo "Testing PUT /api/shifts/$SHIFT_ID"
PUT_SHIFT_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/shifts/$SHIFT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"specializationRequired\": \"Emergency Radiology\"
    }")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully updated shift${NC}"
    echo "Response: $PUT_SHIFT_RESPONSE"
else
    echo -e "${RED}Failed to update shift${NC}"
    exit 1
fi

# Test DELETE /api/shifts/{shift_id}
echo "Testing DELETE /api/shifts/$SHIFT_ID"
DELETE_SHIFT_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/shifts/$SHIFT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully deleted shift${NC}"
    echo "Response: $DELETE_SHIFT_RESPONSE"
else
    echo -e "${RED}Failed to delete shift${NC}"
    exit 1
fi

echo -e "${GREEN}All shift endpoint tests completed successfully!${NC}" 