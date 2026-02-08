#!/bin/bash

# Script test Admin Service flow
# Yêu cầu: jq (JSON processor)

BASE_URL="http://localhost:5001"
ADMIN_EMAIL="admin@jobly.vn"
ADMIN_PASSWORD="Admin123"

echo "=========================================="
echo "JOBLY ADMIN SERVICE TEST FLOW"
echo "=========================================="
echo ""

# Bước 1: Login với admin account
echo "1. Đăng nhập với admin account..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$ADMIN_TOKEN" == "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Login thất bại!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login thành công!"
echo "Token: ${ADMIN_TOKEN:0:20}..."
echo ""

# Bước 2: List users
echo "2. Lấy danh sách users..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

USERS_COUNT=$(echo $USERS_RESPONSE | jq -r '.total')
echo "✅ Tổng số users: $USERS_COUNT"
echo ""

# Bước 3: List pending jobs
echo "3. Lấy danh sách jobs chờ duyệt..."
PENDING_JOBS=$(curl -s -X GET "$BASE_URL/admin/jobs/pending?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

PENDING_COUNT=$(echo $PENDING_JOBS | jq -r '.total')
echo "✅ Số jobs chờ duyệt: $PENDING_COUNT"

if [ "$PENDING_COUNT" != "0" ] && [ "$PENDING_COUNT" != "null" ]; then
  FIRST_JOB_ID=$(echo $PENDING_JOBS | jq -r '.items[0].id')
  echo "Job ID đầu tiên: $FIRST_JOB_ID"
  
  # Bước 4: Approve job
  echo ""
  echo "4. Duyệt job đầu tiên..."
  APPROVE_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/jobs/$FIRST_JOB_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  APPROVED_STATUS=$(echo $APPROVE_RESPONSE | jq -r '.status')
  if [ "$APPROVED_STATUS" == "approved" ]; then
    echo "✅ Duyệt job thành công!"
  else
    echo "❌ Duyệt job thất bại!"
    echo "Response: $APPROVE_RESPONSE"
  fi
else
  echo "ℹ️  Không có job nào chờ duyệt"
fi
echo ""

# Bước 5: List CV templates
echo "5. Lấy danh sách CV templates..."
TEMPLATES_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/cv-templates?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TEMPLATES_COUNT=$(echo $TEMPLATES_RESPONSE | jq -r '.total')
echo "✅ Tổng số templates: $TEMPLATES_COUNT"
echo ""

# Bước 6: Get statistics
echo "6. Lấy thống kê hệ thống..."
DATE_FROM="2024-01-01"
DATE_TO="2024-12-31"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/statistics?dateFrom=$DATE_FROM&dateTo=$DATE_TO" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

TOTAL_USERS=$(echo $STATS_RESPONSE | jq -r '.totalUsers')
TOTAL_JOBS=$(echo $STATS_RESPONSE | jq -r '.totalJobs')
TOTAL_APPLICATIONS=$(echo $STATS_RESPONSE | jq -r '.totalApplications')

echo "✅ Thống kê:"
echo "   - Tổng users: $TOTAL_USERS"
echo "   - Tổng jobs: $TOTAL_JOBS"
echo "   - Tổng applications: $TOTAL_APPLICATIONS"
echo ""

# Bước 7: Export report
echo "7. Xuất báo cáo users (Excel)..."
REPORT_FILE="report_users_$(date +%s).xlsx"
curl -s -X GET "$BASE_URL/admin/reports/export?type=users&dateFrom=$DATE_FROM&dateTo=$DATE_TO&format=excel" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o "$REPORT_FILE"

if [ -f "$REPORT_FILE" ]; then
  FILE_SIZE=$(wc -c < "$REPORT_FILE")
  if [ "$FILE_SIZE" -gt 100 ]; then
    echo "✅ Xuất báo cáo thành công: $REPORT_FILE (${FILE_SIZE} bytes)"
  else
    echo "❌ File báo cáo quá nhỏ, có thể có lỗi"
    cat "$REPORT_FILE"
  fi
else
  echo "❌ Không tạo được file báo cáo"
fi
echo ""

echo "=========================================="
echo "HOÀN THÀNH TEST FLOW"
echo "=========================================="
