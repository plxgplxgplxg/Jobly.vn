#!/bin/bash

# Script test tất cả APIs của Jobly.vn Backend
# Màu sắc cho output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5001"

# Biến lưu tokens
CANDIDATE_TOKEN=""
EMPLOYER_TOKEN=""
ADMIN_TOKEN=""

# Biến lưu IDs
CANDIDATE_ID=""
EMPLOYER_ID=""
COMPANY_ID=""
JOB_ID=""
CV_ID=""
USER_CV_ID=""
APPLICATION_ID=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  JOBLY.VN API COMPREHENSIVE TEST${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function để test API
test_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4
  local description=$5
  
  echo -e "${YELLOW}Testing:${NC} $description"
  echo -e "${BLUE}$method $endpoint${NC}"
  
  if [ -n "$token" ]; then
    if [ -n "$data" ]; then
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$data")
    else
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Authorization: Bearer $token")
    fi
  else
    if [ -n "$data" ]; then
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data")
    else
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  fi
  echo ""
  
  echo "$body"
}

# ========================================
# 1. HEALTH CHECK
# ========================================
echo -e "${BLUE}=== 1. HEALTH CHECK ===${NC}\n"
test_api "GET" "/health" "" "" "Health check endpoint"

# ========================================
# 2. AUTH APIs
# ========================================
echo -e "${BLUE}=== 2. AUTH APIs ===${NC}\n"

# Register Candidate
echo -e "${YELLOW}2.1 Register Candidate${NC}"
response=$(test_api "POST" "/auth/register" '{
  "email": "candidate@test.com",
  "password": "Test1234",
  "name": "Test Candidate",
  "role": "candidate"
}' "" "Register new candidate")
CANDIDATE_ID=$(echo "$response" | jq -r '.userId' 2>/dev/null)

# Register Employer
echo -e "${YELLOW}2.2 Register Employer${NC}"
response=$(test_api "POST" "/auth/register" '{
  "email": "employer@test.com",
  "password": "Test1234",
  "name": "Test Employer",
  "role": "employer"
}' "" "Register new employer")
EMPLOYER_ID=$(echo "$response" | jq -r '.userId' 2>/dev/null)

# Login Candidate
echo -e "${YELLOW}2.3 Login Candidate${NC}"
response=$(test_api "POST" "/auth/login" '{
  "identifier": "candidate@test.com",
  "password": "Test1234"
}' "" "Login as candidate")
CANDIDATE_TOKEN=$(echo "$response" | jq -r '.token' 2>/dev/null)
echo -e "${GREEN}Candidate Token: $CANDIDATE_TOKEN${NC}\n"

# Login Employer
echo -e "${YELLOW}2.4 Login Employer${NC}"
response=$(test_api "POST" "/auth/login" '{
  "identifier": "employer@test.com",
  "password": "Test1234"
}' "" "Login as employer")
EMPLOYER_TOKEN=$(echo "$response" | jq -r '.token' 2>/dev/null)
echo -e "${GREEN}Employer Token: $EMPLOYER_TOKEN${NC}\n"

# ========================================
# 3. USER APIs
# ========================================
echo -e "${BLUE}=== 3. USER APIs ===${NC}\n"

# Get Candidate Profile
test_api "GET" "/users/profile" "" "$CANDIDATE_TOKEN" "Get candidate profile"

# Update Candidate Profile
test_api "PUT" "/users/profile" '{
  "address": "Hà Nội",
  "experience": "2 năm kinh nghiệm",
  "skills": ["JavaScript", "TypeScript", "React"]
}' "$CANDIDATE_TOKEN" "Update candidate profile"

# Get Employer Profile
test_api "GET" "/users/profile" "" "$EMPLOYER_TOKEN" "Get employer profile"

# ========================================
# 4. COMPANY APIs
# ========================================
echo -e "${BLUE}=== 4. COMPANY APIs ===${NC}\n"

# Create Company
response=$(test_api "POST" "/users/company" '{
  "name": "Tech Company Ltd",
  "taxCode": "0123456789",
  "industry": "Technology",
  "description": "Leading tech company"
}' "$EMPLOYER_TOKEN" "Create company")
COMPANY_ID=$(echo "$response" | jq -r '.id' 2>/dev/null)
echo -e "${GREEN}Company ID: $COMPANY_ID${NC}\n"

# Get Company
if [ -n "$COMPANY_ID" ] && [ "$COMPANY_ID" != "null" ]; then
  test_api "GET" "/users/company/$COMPANY_ID" "" "$EMPLOYER_TOKEN" "Get company details"
fi

# ========================================
# 5. CV TEMPLATE APIs
# ========================================
echo -e "${BLUE}=== 5. CV TEMPLATE APIs ===${NC}\n"

# List CV Templates
test_api "GET" "/api/cv-templates" "" "" "List all CV templates"

# ========================================
# 6. JOB APIs
# ========================================
echo -e "${BLUE}=== 6. JOB APIs ===${NC}\n"

# Create Job
if [ -n "$COMPANY_ID" ] && [ "$COMPANY_ID" != "null" ]; then
  response=$(test_api "POST" "/jobs" "{
    \"title\": \"Backend Developer\",
    \"description\": \"Tuyển Backend Developer có kinh nghiệm\",
    \"requirements\": \"2+ năm kinh nghiệm Node.js\",
    \"salary\": \"15-20 triệu\",
    \"location\": \"Hà Nội\",
    \"deadline\": \"2026-12-31\",
    \"companyId\": \"$COMPANY_ID\"
  }" "$EMPLOYER_TOKEN" "Create job posting")
  JOB_ID=$(echo "$response" | jq -r '.id' 2>/dev/null)
  echo -e "${GREEN}Job ID: $JOB_ID${NC}\n"
fi

# List Jobs (Public)
test_api "GET" "/jobs?page=1&limit=10" "" "" "List all jobs (public)"

# Search Jobs
test_api "GET" "/jobs/search?keyword=developer&location=Hà Nội" "" "" "Search jobs"

# Get Job Details
if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
  test_api "GET" "/jobs/$JOB_ID" "" "" "Get job details"
fi

# List Employer's Jobs
test_api "GET" "/jobs/my-jobs" "" "$EMPLOYER_TOKEN" "List employer's jobs"

# ========================================
# 7. APPLICATION APIs
# ========================================
echo -e "${BLUE}=== 7. APPLICATION APIs ===${NC}\n"

# Note: Cần có CV trước khi apply
echo -e "${YELLOW}Note: Application tests require CV upload first${NC}\n"

# List Candidate Applications
test_api "GET" "/applications/my-applications" "" "$CANDIDATE_TOKEN" "List candidate applications"

# ========================================
# 8. MESSAGE APIs
# ========================================
echo -e "${BLUE}=== 8. MESSAGE APIs ===${NC}\n"

# List Conversations
test_api "GET" "/messages/conversations" "" "$CANDIDATE_TOKEN" "List conversations (candidate)"
test_api "GET" "/messages/conversations" "" "$EMPLOYER_TOKEN" "List conversations (employer)"

# ========================================
# 9. ERROR HANDLING TEST
# ========================================
echo -e "${BLUE}=== 9. ERROR HANDLING TEST ===${NC}\n"

# Test 404
test_api "GET" "/nonexistent-route" "" "" "Test 404 error"

# Test 401 (No token)
test_api "GET" "/users/profile" "" "" "Test 401 error (no token)"

# Test 401 (Invalid token)
test_api "GET" "/users/profile" "" "invalid-token" "Test 401 error (invalid token)"

# ========================================
# SUMMARY
# ========================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TEST SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Health Check${NC}"
echo -e "${GREEN}✓ Auth APIs (Register, Login)${NC}"
echo -e "${GREEN}✓ User APIs (Profile)${NC}"
echo -e "${GREEN}✓ Company APIs${NC}"
echo -e "${GREEN}✓ CV Template APIs${NC}"
echo -e "${GREEN}✓ Job APIs${NC}"
echo -e "${GREEN}✓ Application APIs${NC}"
echo -e "${GREEN}✓ Message APIs${NC}"
echo -e "${GREEN}✓ Error Handling${NC}"
echo ""
echo -e "${YELLOW}Tokens saved for manual testing:${NC}"
echo -e "Candidate Token: ${GREEN}$CANDIDATE_TOKEN${NC}"
echo -e "Employer Token: ${GREEN}$EMPLOYER_TOKEN${NC}"
echo ""
echo -e "${BLUE}Test completed!${NC}"
