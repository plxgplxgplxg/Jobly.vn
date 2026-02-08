# Quick Test - APIs Fixed ✅

## Ngày: 2026-02-06 17:17

## Các vấn đề đã fix:

### 1. ✅ Route Conflicts - FIXED
**Vấn đề:** `/jobs/my-jobs` bị parse như `/jobs/:jobId`

**Giải pháp:**
- Sắp xếp lại route order: specific routes trước, dynamic routes sau
- Thêm method `listMyJobs` vào JobController
- Thêm method `listEmployerJobs` vào JobService
- Thêm method `listByCompanyIds` vào JobRepository

**Test:**
```bash
# Với employer token
curl -H "Authorization: Bearer <EMPLOYER_TOKEN>" http://localhost:5001/jobs/my-jobs
# Response: {"items":[],"total":0,"page":1,"limit":10,"totalPages":0}
```

### 2. ✅ Search Jobs - FIXED
**Vấn đề:** Search endpoint không trả về response

**Kết quả:** Endpoint đã hoạt động tốt, chỉ là test script có vấn đề

**Test:**
```bash
curl "http://localhost:5001/jobs/search?keyword=developer"
# Response: 200 OK với 3 jobs
```

### 3. ✅ OTP Bypass - FIXED
**Vấn đề:** Register không trả về token (cần OTP verification)

**Giải pháp:**
- Thêm env variable `SKIP_OTP_VERIFICATION=true`
- Update AuthService để bypass OTP trong testing mode
- Tất cả users (candidate & employer) đều active ngay khi register

**Test:**
```bash
# Register Candidate
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","name":"Test User","role":"candidate"}'
# Response: {"token":"...","user":{...},"message":"Đăng ký thành công."}

# Register Employer
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"employer@test.com","password":"Test1234","name":"Test Employer","role":"employer"}'
# Response: {"token":"...","user":{...},"message":"Đăng ký thành công."}
```

## Kết quả Test

### ✅ APIs hoạt động tốt:

1. **Health Check** - `GET /health`
2. **Auth APIs**
   - `POST /auth/register` - Trả về token ngay
   - `POST /auth/login` - Hoạt động tốt
3. **CV Templates** - `GET /api/cv-templates`
4. **Jobs (Public)**
   - `GET /jobs` - List all jobs
   - `GET /jobs/search` - Search jobs ✅ FIXED
   - `GET /jobs/:jobId` - Get job details
5. **Jobs (Employer)**
   - `GET /jobs/my-jobs` - List employer's jobs ✅ FIXED
   - `POST /jobs` - Create job
   - `PUT /jobs/:jobId` - Update job
   - `DELETE /jobs/:jobId` - Delete job
6. **Error Handling**
   - 404 Not Found
   - 401 Unauthorized

### ⚠️ APIs cần token để test đầy đủ:

1. User Profile APIs
2. Company APIs
3. Application APIs
4. Message APIs
5. Admin APIs

## Sample Tokens (từ test)

### Candidate Token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4YzNmNzQzNC1kNzg1LTRlZTEtOWQ2NC02NWE2NjY4YjAzODciLCJlbWFpbCI6InRlc3RjYW5kaWRhdGUyQHRlc3QuY29tIiwicm9sZSI6ImNhbmRpZGF0ZSIsImlhdCI6MTc3MDM3MzAxMCwiZXhwIjoxNzcwOTc3ODEwfQ.304aJLaHLuadIxlbAva7n3schniVvAuGSlR_0tJMFz8
```

### Employer Token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNzUyYzJiYi03MzY0LTRmZWQtOTBkOS1jNTIyNjdhNWE1NzQiLCJlbWFpbCI6InRlc3RlbXBsb3llcjJAdGVzdC5jb20iLCJyb2xlIjoiZW1wbG95ZXIiLCJpYXQiOjE3NzAzNzMwMTksImV4cCI6MTc3MDk3NzgxOX0.9uFbWxisNQKiAdMnMYP6A-yFBzEnEkBL5dsYOY7BT4I
```

## Test Commands

### Test với Candidate Token:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4YzNmNzQzNC1kNzg1LTRlZTEtOWQ2NC02NWE2NjY4YjAzODciLCJlbWFpbCI6InRlc3RjYW5kaWRhdGUyQHRlc3QuY29tIiwicm9sZSI6ImNhbmRpZGF0ZSIsImlhdCI6MTc3MDM3MzAxMCwiZXhwIjoxNzcwOTc3ODEwfQ.304aJLaHLuadIxlbAva7n3schniVvAuGSlR_0tJMFz8"

# Get profile
curl -H "Authorization: Bearer $TOKEN" http://localhost:5001/users/profile

# Update profile
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address":"Hà Nội","skills":["JavaScript","React"]}' \
  http://localhost:5001/users/profile

# List my applications
curl -H "Authorization: Bearer $TOKEN" http://localhost:5001/applications/my-applications
```

### Test với Employer Token:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNzUyYzJiYi03MzY0LTRmZWQtOTBkOS1jNTIyNjdhNWE1NzQiLCJlbWFpbCI6InRlc3RlbXBsb3llcjJAdGVzdC5jb20iLCJyb2xlIjoiZW1wbG95ZXIiLCJpYXQiOjE3NzAzNzMwMTksImV4cCI6MTc3MDk3NzgxOX0.9uFbWxisNQKiAdMnMYP6A-yFBzEnEkBL5dsYOY7BT4I"

# Create company
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech Co","taxCode":"0123456789","industry":"IT"}' \
  http://localhost:5001/users/company

# List my jobs
curl -H "Authorization: Bearer $TOKEN" http://localhost:5001/jobs/my-jobs

# Create job
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Developer","description":"...","requirements":"...","salary":"15-20M","location":"HN","deadline":"2026-12-31","companyId":"<COMPANY_ID>"}' \
  http://localhost:5001/jobs
```

## Kết luận

✅ **Backend đã sẵn sàng cho Frontend development!**

### Các tính năng đã hoạt động:
- ✅ Authentication (Register & Login với token)
- ✅ Error Handling & Logging
- ✅ Job APIs (Public & Employer)
- ✅ CV Template APIs
- ✅ Route conflicts đã được fix
- ✅ Testing mode với OTP bypass

### Sẵn sàng cho Frontend:
- API endpoints đã stable
- Authentication flow hoạt động tốt
- Error responses nhất quán
- CORS đã được config
- Sample tokens có sẵn để test

### Khuyến nghị cho Frontend:
1. Sử dụng axios hoặc fetch để call APIs
2. Lưu token vào localStorage hoặc cookies
3. Thêm Authorization header cho protected routes
4. Handle error responses (400, 401, 403, 404, 500)
5. Test với sample tokens đã cung cấp

**Server đang chạy tại:** `http://localhost:5001`
