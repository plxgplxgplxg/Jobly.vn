#!/bin/bash

# Script test flow Application Service
# Yêu cầu: Đã có candidate, employer, company, job và CV trong database

BASE_URL="http://localhost:5001"

echo "=== Test Application Service Flow ==="
echo ""

# Bước 1: Login as Candidate
echo "1. Login as Candidate..."
CANDIDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "candidate1@test.com",
    "password": "Test1234"
  }')

CANDIDATE_TOKEN=$(echo $CANDIDATE_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$CANDIDATE_TOKEN" ]; then
  echo "❌ Login candidate thất bại"
  echo "Response: $CANDIDATE_RESPONSE"
  exit 1
fi

echo "✅ Login candidate thành công"
echo "Token: ${CANDIDATE_TOKEN:0:20}..."
echo ""

# Bước 2: Login as Employer
echo "2. Login as Employer..."
EMPLOYER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "employer1@company.com",
    "password": "Test1234"
  }')

EMPLOYER_TOKEN=$(echo $EMPLOYER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$EMPLOYER_TOKEN" ]; then
  echo "❌ Login employer thất bại"
  echo "Response: $EMPLOYER_RESPONSE"
  exit 1
fi

echo "✅ Login employer thành công"
echo "Token: ${EMPLOYER_TOKEN:0:20}..."
echo ""

# Bước 3: Get list of jobs
echo "3. Get list of approved jobs..."
JOBS_RESPONSE=$(curl -s "$BASE_URL/jobs?status=approved&limit=1")
JOB_ID=$(echo $JOBS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
  echo "❌ Không tìm thấy job nào"
  echo "Response: $JOBS_RESPONSE"
  exit 1
fi

echo "✅ Tìm thấy job: $JOB_ID"
echo ""

# Bước 4: Get candidate's CVs
echo "4. Get candidate's CVs..."
CVS_RESPONSE=$(curl -s "$BASE_URL/users/cv" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN")

CV_ID=$(echo $CVS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CV_ID" ]; then
  echo "⚠️  Candidate chưa có CV, sẽ dùng mock CV ID"
  CV_ID="00000000-0000-0000-0000-000000000001"
fi

echo "✅ CV ID: $CV_ID"
echo ""

# Bước 5: Create Application
echo "5. Create Application..."
CREATE_APP_RESPONSE=$(curl -s -X POST "$BASE_URL/applications" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"jobId\": \"$JOB_ID\",
    \"cvId\": \"$CV_ID\",
    \"cvType\": \"uploaded\",
    \"coverLetter\": \"Tôi rất quan tâm đến vị trí này.\"
  }")

APPLICATION_ID=$(echo $CREATE_APP_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$APPLICATION_ID" ]; then
  echo "❌ Tạo application thất bại"
  echo "Response: $CREATE_APP_RESPONSE"
  # Không exit, có thể do duplicate
else
  echo "✅ Tạo application thành công: $APPLICATION_ID"
fi
echo ""

# Bước 6: Get Application Details
if [ ! -z "$APPLICATION_ID" ]; then
  echo "6. Get Application Details..."
  APP_DETAILS=$(curl -s "$BASE_URL/applications/$APPLICATION_ID" \
    -H "Authorization: Bearer $CANDIDATE_TOKEN")
  
  APP_STATUS=$(echo $APP_DETAILS | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  echo "✅ Application status: $APP_STATUS"
  echo ""
fi

# Bước 7: List My Applications
echo "7. List My Applications..."
MY_APPS=$(curl -s "$BASE_URL/applications/my-applications?page=1&limit=5" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN")

APPS_COUNT=$(echo $MY_APPS | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo "✅ Tổng số applications: $APPS_COUNT"
echo ""

# Bước 8: List Job Applications (Employer)
echo "8. List Job Applications (Employer)..."
JOB_APPS=$(curl -s "$BASE_URL/applications/jobs/$JOB_ID/applications?page=1&limit=5" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN")

JOB_APPS_COUNT=$(echo $JOB_APPS | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ -z "$JOB_APPS_COUNT" ]; then
  echo "⚠️  Employer không có quyền xem job này hoặc có lỗi"
  echo "Response: $JOB_APPS"
else
  echo "✅ Job có $JOB_APPS_COUNT applications"
fi
echo ""

# Bước 9: Update Application Status (Employer)
if [ ! -z "$APPLICATION_ID" ]; then
  echo "9. Update Application Status to 'reviewing'..."
  UPDATE_STATUS=$(curl -s -X PUT "$BASE_URL/applications/$APPLICATION_ID/status" \
    -H "Authorization: Bearer $EMPLOYER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status": "reviewing"}')
  
  NEW_STATUS=$(echo $UPDATE_STATUS | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  
  if [ "$NEW_STATUS" = "reviewing" ]; then
    echo "✅ Cập nhật status thành công: $NEW_STATUS"
  else
    echo "⚠️  Cập nhật status có vấn đề"
    echo "Response: $UPDATE_STATUS"
  fi
  echo ""
fi

# Bước 10: Try to update application after status changed (should fail)
if [ ! -z "$APPLICATION_ID" ]; then
  echo "10. Try to update application (should fail because status != submitted)..."
  UPDATE_APP=$(curl -s -X PUT "$BASE_URL/applications/$APPLICATION_ID" \
    -H "Authorization: Bearer $CANDIDATE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coverLetter": "Updated letter"}')
  
  ERROR_MSG=$(echo $UPDATE_APP | grep -o '"error":"[^"]*' | cut -d'"' -f4)
  
  if [ ! -z "$ERROR_MSG" ]; then
    echo "✅ Đúng như mong đợi, không thể update: $ERROR_MSG"
  else
    echo "⚠️  Không có lỗi như mong đợi"
  fi
  echo ""
fi

echo "=== Test hoàn tất ==="
