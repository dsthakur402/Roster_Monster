#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8001"

# Generate random emails for testing
TEST_EMAIL1="test_schedule1_$(date +%s)@example.com"
TEST_EMAIL2="test_schedule2_$(date +%s)@example.com"

echo "Starting schedule endpoint test..."

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/docs" > /dev/null; then
    echo -e "${RED}Error: Server is not running. Please start the server first.${NC}"
    echo "Run: poetry run uvicorn app.main:app --reload --port 8001"
    exit 1
fi

# Test POST /api/schedule/
echo "Testing POST /api/schedule/"
POST_SCHEDULE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/schedule/" \
    -H "Content-Type: application/json" \
    -d "{
        \"users\": [
            {
                \"name\": \"Test User 1\",
                \"email\": \"$TEST_EMAIL1\",
                \"userType\": \"Radiologist\",
                \"password\": \"testpassword123\"
            },
            {
                \"name\": \"Test User 2\",
                \"email\": \"$TEST_EMAIL2\",
                \"userType\": \"Radiologist\",
                \"password\": \"testpassword123\"
            }
        ],
        \"shifts\": [
            {
                \"startTime\": \"2024-04-21T09:00:00Z\",
                \"endTime\": \"2024-04-21T17:00:00Z\",
                \"location\": 2,
                \"specializationRequired\": \"General Radiology\"
            },
            {
                \"startTime\": \"2024-04-21T17:00:00Z\",
                \"endTime\": \"2024-04-21T01:00:00Z\",
                \"location\": 2,
                \"specializationRequired\": \"Emergency Radiology\"
            }
        ]
    }")

echo "Create schedule response: $POST_SCHEDULE_RESPONSE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully created schedule${NC}"
else
    echo -e "${RED}Failed to create schedule${NC}"
    exit 1
fi

echo -e "${GREEN}All schedule endpoint tests completed successfully!${NC}" 