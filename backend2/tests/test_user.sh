#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URL
BASE_URL="http://localhost:8000"

# Generate a random email
EMAIL="test_$(date +%s)@example.com"

echo "Testing User Endpoints..."
echo "Using email: $EMAIL"

# 1. Register a test user (we need this for authentication)
echo -e "\n${GREEN}1. Creating a test user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"test123\",
    \"userType\": \"Admin\"
  }")

echo "Response: $REGISTER_RESPONSE"

if [[ $REGISTER_RESPONSE == *"id"* ]]; then
  USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.id')
  echo "✅ Test user created successfully"
  echo "User ID: $USER_ID"
else
  echo -e "${RED}❌ Failed to create test user${NC}"
  echo "Error: $REGISTER_RESPONSE"
  exit 1
fi

# 2. Login to get access token
echo -e "\n${GREEN}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$EMAIL\",
    \"password\": \"test123\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [[ $ACCESS_TOKEN != "null" && $ACCESS_TOKEN != "" ]]; then
  echo "✅ Login successful"
  echo "Access token: ${ACCESS_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "Error: $LOGIN_RESPONSE"
  exit 1
fi

# 3. Get all users
echo -e "\n${GREEN}3. Testing GET /api/user/...${NC}"
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $USERS_RESPONSE"

if [[ $USERS_RESPONSE == *"["* ]]; then
  echo "✅ Get users successful"
else
  echo -e "${RED}❌ Get users failed${NC}"
  echo "Error: $USERS_RESPONSE"
  exit 1
fi

# 4. Get specific user
echo -e "\n${GREEN}4. Testing GET /api/user/$USER_ID...${NC}"
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $USER_RESPONSE"

if [[ $USER_RESPONSE == *"id"* ]]; then
  echo "✅ Get user successful"
else
  echo -e "${RED}❌ Get user failed${NC}"
  echo "Error: $USER_RESPONSE"
  exit 1
fi

# 5. Update user
echo -e "\n${GREEN}5. Testing PUT /api/user/$USER_ID...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/user/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Updated Test User\",
    \"email\": \"$EMAIL\",
    \"userType\": \"Admin\"
  }")

echo "Response: $UPDATE_RESPONSE"

if [[ $UPDATE_RESPONSE == *"id"* ]]; then
  echo "✅ Update user successful"
else
  echo -e "${RED}❌ Update user failed${NC}"
  echo "Error: $UPDATE_RESPONSE"
  exit 1
fi

# 6. Create user attributes
echo -e "\n${GREEN}6. Testing POST /api/user/$USER_ID/attributes...${NC}"
CREATE_ATTR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/$USER_ID/attributes" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID,
    \"maxShiftsPerWeek\": 5,
    \"maxNightShifts\": 2,
    \"maxConsecutiveNightShifts\": 2,
    \"maxConsecutiveDayShifts\": 3,
    \"minRestBetweenShifts\": 12
  }")

echo "Response: $CREATE_ATTR_RESPONSE"

if [[ $CREATE_ATTR_RESPONSE == *"id"* ]]; then
  echo "✅ Create user attributes successful"
else
  echo -e "${RED}❌ Create user attributes failed${NC}"
  echo "Error: $CREATE_ATTR_RESPONSE"
  exit 1
fi

# 7. Get user attributes
echo -e "\n${GREEN}7. Testing GET /api/user/$USER_ID/attributes...${NC}"
GET_ATTR_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/$USER_ID/attributes" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $GET_ATTR_RESPONSE"

if [[ $GET_ATTR_RESPONSE == *"id"* ]]; then
  echo "✅ Get user attributes successful"
else
  echo -e "${RED}❌ Get user attributes failed${NC}"
  echo "Error: $GET_ATTR_RESPONSE"
  exit 1
fi

# 8. Update user attributes
echo -e "\n${GREEN}8. Testing PUT /api/user/$USER_ID/attributes...${NC}"
UPDATE_ATTR_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/user/$USER_ID/attributes" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID,
    \"maxShiftsPerWeek\": 6,
    \"maxNightShifts\": 3,
    \"maxConsecutiveNightShifts\": 2,
    \"maxConsecutiveDayShifts\": 4,
    \"minRestBetweenShifts\": 10
  }")

echo "Response: $UPDATE_ATTR_RESPONSE"

if [[ $UPDATE_ATTR_RESPONSE == *"id"* ]]; then
  echo "✅ Update user attributes successful"
else
  echo -e "${RED}❌ Update user attributes failed${NC}"
  echo "Error: $UPDATE_ATTR_RESPONSE"
  exit 1
fi

# 9. Delete user (cleanup)
echo -e "\n${GREEN}9. Testing DELETE /api/user/$USER_ID...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/user/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $DELETE_RESPONSE"

if [[ $DELETE_RESPONSE == "" || $DELETE_RESPONSE == "{}" ]]; then
  echo "✅ Delete user successful"
else
  echo -e "${RED}❌ Delete user failed${NC}"
  echo "Error: $DELETE_RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}All user endpoint tests completed successfully!${NC}" 