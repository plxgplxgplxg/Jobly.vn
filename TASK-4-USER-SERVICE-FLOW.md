# Task 4: User Service - Luồng xử lý chi tiết

## Tổng quan

Task 4 implement các chức năng quản lý thông tin người dùng, bao gồm:
- Quản lý profile cá nhân (get, update, upload avatar)
- Quản lý CV (upload, delete, list)
- Quản lý thông tin công ty (create, update, get, upload logo)

### DTO là gì?

**DTO (Data Transfer Object)** trong project này là **TypeScript interfaces** được định nghĩa trong `backend/src/types/user.types.ts`:

```typescript
// File: backend/src/types/user.types.ts

export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  address?: string;
  dateOfBirth?: Date;
  experience?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDTO {
  name?: string;
  address?: string;
  dateOfBirth?: Date;
  experience?: string;
}

export interface CVDTO {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface CompanyDTO {
  id?: string;
  name: string;
  taxCode: string;
  industry: string;
  logoUrl?: string;
  description?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Mục đích của DTO:**
- Định nghĩa cấu trúc dữ liệu trả về cho client
- Type-safe: TypeScript check type khi compile
- Tách biệt internal model structure với external API response
- Dễ maintain và document API

**Cách sử dụng:**
```typescript
// Service return DTO
async getProfile(userId: string): Promise<UserProfileDTO> {
  const user = await UserRepository.findById(userId);
  
  // Map từ Model sang DTO
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    // ... các fields khác
  };
}
```

## Kiến trúc

```
Client Request
    ↓
Routes (user.routes.ts) + Multer Middleware
    ↓
Controller (UserController.ts)
    ↓
Service (UserService.ts)
    ↓
Repository (UserRepository, UploadedCVRepository, CompanyRepository)
    ↓
Model (User, UploadedCV, Company)
    ↓
Database (PostgreSQL)
```

---

## 1. Quản lý Profile

### 1.1 Get Profile

**Endpoint:** `GET /users/profile`

**Luồng xử lý:**

```
1. Client gửi request với JWT token trong header
   Authorization: Bearer <token>

2. Middleware authenticateJWT verify token
   - Decode JWT token
   - Lấy userId từ token payload
   - Gán vào req.user

3. UserController.getProfile()
   - Lấy userId từ req.user
   - Gọi UserService.getProfile(userId)

4. UserService.getProfile()
   - Gọi UserRepository.findById(userId)
   - Repository query database: SELECT * FROM users WHERE id = userId
   - Nếu không tìm thấy → throw Error
   - Map User model sang UserProfileDTO (loại bỏ passwordHash)
   - Return DTO

   Code thực tế:
   ```typescript
   async getProfile(userId: string): Promise<UserProfileDTO> {
     const user = await UserRepository.findById(userId);
     if (!user) {
       throw new Error('Người dùng không tồn tại');
     }

     // Map Model → DTO (chỉ lấy fields cần thiết)
     return {
       id: user.id,
       name: user.name,
       email: user.email,
       phone: user.phone,
       role: user.role,
       status: user.status,
       address: user.address,
       dateOfBirth: user.dateOfBirth,
       experience: user.experience,
       avatarUrl: user.avatarUrl,
       createdAt: user.createdAt,
       updatedAt: user.updatedAt
       // Chú ý: KHÔNG trả về passwordHash
     };
   }
   ```

5. Controller trả response JSON (UserProfileDTO)
   {
     id, name, email, phone, role, status,
     address, dateOfBirth, experience, avatarUrl,
     createdAt, updatedAt
   }
```

**Ví dụ:**
```bash
curl -X GET http://localhost:5001/users/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 1.2 Update Profile

**Endpoint:** `PUT /users/profile`

**Luồng xử lý:**

```
1. Client gửi request với data cần update
   Body: { name, address, dateOfBirth, experience }

2. Middleware authenticateJWT verify token

3. UserController.updateProfile()
   - Lấy userId từ req.user
   - Lấy data từ req.body
   - Gọi UserService.updateProfile(userId, data)

4. UserService.updateProfile()
   - Gọi UserRepository.findById(userId)
   - Nếu không tìm thấy → throw Error
   - Gọi user.update(data) - Sequelize method
   - Repository execute: UPDATE users SET ... WHERE id = userId
   - Gọi lại getProfile(userId) để lấy data mới
   - Return updated profile

5. Controller trả response JSON với profile đã update
```

**Ví dụ:**
```bash
curl -X PUT http://localhost:5001/users/profile \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "address": "Hà Nội",
    "experience": "5 năm kinh nghiệm Backend"
  }'
```

---

### 1.3 Upload Avatar

**Endpoint:** `POST /users/profile/avatar`

**Luồng xử lý:**

```
1. Client gửi multipart/form-data với file
   FormData: { file: <image_file> }

2. Middleware authenticateJWT verify token

3. Multer middleware xử lý file upload
   - Config: memoryStorage (lưu vào RAM trước)
   - Limit: 2MB
   - Parse file từ request
   - Gán vào req.file

4. UserController.uploadAvatar()
   - Check req.file có tồn tại không
   - Nếu không → return error
   - Gọi UserService.uploadAvatar(userId, req.file)

5. UserService.uploadAvatar()
   a. Validate file type
      - Lấy extension: path.extname(file.originalname)
      - Check trong ['.jpg', '.jpeg', '.png']
      - Nếu không hợp lệ → throw Error
   
   b. Validate file size
      - Check file.size <= 2MB
      - Nếu vượt quá → throw Error
   
   c. Lấy user từ database
      - UserRepository.findById(userId)
      - Nếu không tìm thấy → throw Error
   
   d. Xóa avatar cũ (nếu có)
      - Check user.avatarUrl có tồn tại
      - Tạo path: __dirname/../../<avatarUrl>
      - fs.existsSync() → fs.unlinkSync()
   
   e. Lưu avatar mới
      - Tạo thư mục: uploads/avatars (nếu chưa có)
      - Generate filename: userId_timestamp.ext
      - Lưu file: fs.writeFileSync(filePath, file.buffer)
      - Tạo URL: /uploads/avatars/filename
   
   f. Update database
      - user.update({ avatarUrl })
      - Repository execute: UPDATE users SET avatar_url = ... WHERE id = userId
   
   g. Return avatarUrl

6. Controller trả response JSON
   { avatarUrl: "/uploads/avatars/..." }
```

**Ví dụ:**
```bash
curl -X POST http://localhost:5001/users/profile/avatar \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@/path/to/avatar.jpg"
```

---

## 2. Quản lý CV

### 2.1 Upload CV

**Endpoint:** `POST /users/cv/upload`

**Luồng xử lý:**

```
1. Client gửi multipart/form-data với file CV
   FormData: { file: <cv_file> }

2. Middleware authenticateJWT verify token

3. Multer middleware xử lý file upload
   - Config: memoryStorage
   - Limit: 5MB
   - Parse file từ request
   - Gán vào req.file

4. UserController.uploadCV()
   - Check req.file có tồn tại không
   - Gọi UserService.uploadCV(userId, req.file)

5. UserService.uploadCV()
   a. Validate file type
      - Lấy extension: path.extname(file.originalname)
      - Check trong ['.pdf', '.doc', '.docx']
      - Nếu không hợp lệ → throw Error
   
   b. Validate file size
      - Check file.size <= 5MB
      - Nếu vượt quá → throw Error
   
   c. Check giới hạn CV (max 10)
      - UploadedCVRepository.countByUserId(userId)
      - Nếu >= 10 → throw Error "Đã đạt giới hạn 10 CV"
   
   d. Lưu file vào storage
      - Tạo thư mục: uploads/cvs (nếu chưa có)
      - Generate filename: userId_timestamp.ext
      - Lưu file: fs.writeFileSync(filePath, file.buffer)
      - Tạo URL: /uploads/cvs/filename
   
   e. Lưu metadata vào database
      - UploadedCVRepository.create({
          userId,
          fileName: file.originalname,
          fileUrl,
          fileSize: file.size
        })
      - Repository execute: INSERT INTO uploaded_cvs ...
   
   f. Map sang CVDTO và return

6. Controller trả response JSON
   {
     id, userId, fileName, fileUrl, fileSize, uploadedAt
   }
```

**Ví dụ:**
```bash
curl -X POST http://localhost:5001/users/cv/upload \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@/path/to/cv.pdf"
```

---

### 2.2 List CVs

**Endpoint:** `GET /users/cv`

**Luồng xử lý:**

```
1. Client gửi request với JWT token

2. Middleware authenticateJWT verify token

3. UserController.listCVs()
   - Lấy userId từ req.user
   - Gọi UserService.listCVs(userId)

4. UserService.listCVs()
   - Gọi UploadedCVRepository.findByUserId(userId)
   - Repository query:
     SELECT * FROM uploaded_cvs 
     WHERE user_id = userId 
     ORDER BY uploaded_at DESC
   - Map array sang CVDTO[]
   - Return array

5. Controller trả response JSON array
   [
     { id, userId, fileName, fileUrl, fileSize, uploadedAt },
     ...
   ]
```

**Ví dụ:**
```bash
curl -X GET http://localhost:5001/users/cv \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 2.3 Delete CV

**Endpoint:** `DELETE /users/cv/:cvId`

**Luồng xử lý:**

```
1. Client gửi request với cvId trong URL params

2. Middleware authenticateJWT verify token

3. UserController.deleteCV()
   - Lấy userId từ req.user
   - Lấy cvId từ req.params (cast sang string)
   - Gọi UserService.deleteCV(userId, cvId)

4. UserService.deleteCV()
   a. Tìm CV
      - UploadedCVRepository.findByUserIdAndId(userId, cvId)
      - Repository query:
        SELECT * FROM uploaded_cvs 
        WHERE id = cvId AND user_id = userId
      - Nếu không tìm thấy → throw Error "CV không tồn tại"
   
   b. Xóa file từ storage
      - Tạo path: __dirname/../../<cv.fileUrl>
      - Check fs.existsSync()
      - Nếu tồn tại → fs.unlinkSync()
   
   c. Xóa record từ database
      - UploadedCVRepository.delete(cvId)
      - Repository execute: DELETE FROM uploaded_cvs WHERE id = cvId
   
   d. Return true

5. Controller trả response JSON
   { message: "Xóa CV thành công" }
```

**Ví dụ:**
```bash
curl -X DELETE http://localhost:5001/users/cv/uuid-here \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 3. Quản lý Company

### 3.1 Create Company

**Endpoint:** `POST /users/company`

**Luồng xử lý:**

```
1. Client gửi request với company data
   Body: { name, taxCode, industry, description }

2. Middleware authenticateJWT verify token

3. UserController.createCompany()
   - Lấy userId từ req.user
   - Lấy data từ req.body
   - Gọi UserService.createCompany(userId, data)

4. UserService.createCompany()
   a. Validate mã số thuế
      - Regex: /^[0-9]{10}$|^[0-9]{13}$/
      - Check format 10 hoặc 13 chữ số
      - Nếu không hợp lệ → throw Error
   
   b. Check user đã có company chưa
      - CompanyRepository.findByUserId(userId)
      - Repository query: SELECT * FROM companies WHERE user_id = userId
      - Nếu đã có → throw Error "Bạn đã có công ty"
   
   c. Check mã số thuế đã tồn tại chưa
      - CompanyRepository.findByTaxCode(taxCode)
      - Repository query: SELECT * FROM companies WHERE tax_code = taxCode
      - Nếu đã tồn tại → throw Error "Mã số thuế đã được sử dụng"
   
   d. Tạo company
      - CompanyRepository.create({
          name, taxCode, industry, logoUrl, description, userId
        })
      - Repository execute: INSERT INTO companies ...
   
   e. Map sang CompanyDTO và return

5. Controller trả response JSON
   {
     id, name, taxCode, industry, logoUrl, description,
     userId, createdAt, updatedAt
   }
```

**Ví dụ:**
```bash
curl -X POST http://localhost:5001/users/company \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Công ty ABC",
    "taxCode": "0123456789",
    "industry": "Công nghệ thông tin",
    "description": "Công ty phát triển phần mềm"
  }'
```

---

### 3.2 Update Company

**Endpoint:** `PUT /users/company/:companyId`

**Luồng xử lý:**

```
1. Client gửi request với companyId và data cần update
   Body: { name, taxCode, industry, description }

2. Middleware authenticateJWT verify token

3. UserController.updateCompany()
   - Lấy companyId từ req.params (cast sang string)
   - Lấy data từ req.body
   - Gọi UserService.updateCompany(companyId, data)

4. UserService.updateCompany()
   a. Tìm company
      - CompanyRepository.findById(companyId)
      - Repository query: SELECT * FROM companies WHERE id = companyId
      - Nếu không tìm thấy → throw Error
   
   b. Validate mã số thuế (nếu thay đổi)
      - Check data.taxCode !== company.taxCode
      - Nếu thay đổi:
        * Validate format: /^[0-9]{10}$|^[0-9]{13}$/
        * Check trùng: CompanyRepository.findByTaxCode(taxCode)
        * Nếu không hợp lệ → throw Error
   
   c. Update company
      - CompanyRepository.update(companyId, data)
      - Repository execute: UPDATE companies SET ... WHERE id = companyId
   
   d. Lấy lại company đã update
      - Gọi getCompany(companyId)
      - Return CompanyDTO

5. Controller trả response JSON với company đã update
```

**Ví dụ:**
```bash
curl -X PUT http://localhost:5001/users/company/uuid-here \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Công ty ABC Updated",
    "industry": "IT & Software"
  }'
```

---

### 3.3 Get Company

**Endpoint:** `GET /users/company/:companyId`

**Luồng xử lý:**

```
1. Client gửi request với companyId trong URL params

2. Middleware authenticateJWT verify token

3. UserController.getCompany()
   - Lấy companyId từ req.params (cast sang string)
   - Gọi UserService.getCompany(companyId)

4. UserService.getCompany()
   - CompanyRepository.findById(companyId)
   - Repository query: SELECT * FROM companies WHERE id = companyId
   - Nếu không tìm thấy → throw Error
   - Map sang CompanyDTO
   - Return DTO

5. Controller trả response JSON
   {
     id, name, taxCode, industry, logoUrl, description,
     userId, createdAt, updatedAt
   }
```

**Ví dụ:**
```bash
curl -X GET http://localhost:5001/users/company/uuid-here \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 3.4 Upload Company Logo

**Endpoint:** `POST /users/company/:companyId/logo`

**Luồng xử lý:**

```
1. Client gửi multipart/form-data với logo file
   FormData: { file: <logo_file> }

2. Middleware authenticateJWT verify token

3. Multer middleware xử lý file upload
   - Config: memoryStorage
   - Limit: 2MB
   - Parse file từ request
   - Gán vào req.file

4. UserController.uploadLogo()
   - Lấy companyId từ req.params (cast sang string)
   - Check req.file có tồn tại không
   - Gọi UserService.uploadLogo(companyId, req.file)

5. UserService.uploadLogo()
   a. Validate file type
      - Lấy extension: path.extname(file.originalname)
      - Check trong ['.jpg', '.jpeg', '.png']
      - Nếu không hợp lệ → throw Error
   
   b. Validate file size
      - Check file.size <= 2MB
      - Nếu vượt quá → throw Error
   
   c. Tìm company
      - CompanyRepository.findById(companyId)
      - Nếu không tìm thấy → throw Error
   
   d. Xóa logo cũ (nếu có)
      - Check company.logoUrl có tồn tại
      - Tạo path: __dirname/../../<logoUrl>
      - fs.existsSync() → fs.unlinkSync()
   
   e. Lưu logo mới
      - Tạo thư mục: uploads/logos (nếu chưa có)
      - Generate filename: companyId_timestamp.ext
      - Lưu file: fs.writeFileSync(filePath, file.buffer)
      - Tạo URL: /uploads/logos/filename
   
   f. Update database
      - CompanyRepository.update(companyId, { logoUrl })
      - Repository execute: UPDATE companies SET logo_url = ... WHERE id = companyId
   
   g. Return logoUrl

6. Controller trả response JSON
   { logoUrl: "/uploads/logos/..." }
```

**Ví dụ:**
```bash
curl -X POST http://localhost:5001/users/company/uuid-here/logo \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@/path/to/logo.png"
```

---

## 4. Cấu trúc File

```
backend/
├── src/
│   ├── models/
│   │   ├── User.ts              # Sequelize Model - Database entity
│   │   ├── UploadedCV.ts        # Sequelize Model - CV entity
│   │   └── Company.ts           # Sequelize Model - Company entity
│   │
│   ├── repositories/
│   │   ├── UserRepository.ts           # CRUD operations cho User
│   │   ├── UploadedCVRepository.ts     # CRUD operations cho CV
│   │   └── CompanyRepository.ts        # CRUD operations cho Company
│   │
│   ├── services/
│   │   └── UserService.ts       # Business logic, return DTOs
│   │
│   ├── controllers/
│   │   └── UserController.ts    # Handle HTTP requests, send DTOs as JSON
│   │
│   ├── routes/
│   │   └── user.routes.ts       # Define endpoints + Multer config
│   │
│   └── types/
│       └── user.types.ts        # ⭐ DTOs (TypeScript interfaces)
│                                # - UserProfileDTO
│                                # - UpdateProfileDTO
│                                # - CVDTO
│                                # - CompanyDTO
│
└── uploads/                     # File storage
    ├── avatars/                 # User avatars
    ├── cvs/                     # Uploaded CVs
    └── logos/                   # Company logos
```

### Phân biệt Model vs DTO

**Model (Sequelize Model):**
- Đại diện cho database table
- Có methods: save(), update(), destroy()
- Có associations với tables khác
- Chứa tất cả fields trong database

**DTO (TypeScript Interface):**
- Chỉ định nghĩa structure của data
- Không có methods
- Chỉ chứa fields cần thiết cho API response
- Có thể khác với Model (ví dụ: không trả về passwordHash)

**Ví dụ:**
```typescript
// Model User có passwordHash
class User extends Model {
  public passwordHash!: string;  // Không được trả về API
  public name!: string;
  // ...
}

// DTO không có passwordHash (security)
interface UserProfileDTO {
  // passwordHash KHÔNG có ở đây
  name: string;
  email: string;
  // ...
}
```

---

## 5. Validation Rules

### Profile
- **Avatar**: JPG/PNG, max 2MB
- **Name**: required, string
- **Email**: required, unique, email format
- **Phone**: optional, unique
- **Address**: optional, text
- **Experience**: optional, text

### CV
- **File type**: PDF, DOC, DOCX
- **File size**: max 5MB
- **Limit**: max 10 CVs per user

### Company
- **Tax code**: 10 hoặc 13 chữ số, unique
- **Logo**: JPG/PNG, max 2MB
- **Name**: required, string
- **Industry**: required, string
- **Description**: optional, text

---

## 6. Error Handling

Tất cả errors được throw từ Service layer và catch ở Controller layer:

```typescript
try {
  const result = await UserService.someMethod();
  res.json(result);
} catch (error: any) {
  res.status(400).json({ error: error.message });
}
```

**Common errors:**
- `"Người dùng không tồn tại"` - User not found
- `"Định dạng file không hợp lệ..."` - Invalid file type
- `"Kích thước file vượt quá..."` - File size exceeded
- `"Đã đạt giới hạn 10 CV"` - CV limit reached
- `"Mã số thuế phải có 10 hoặc 13 chữ số"` - Invalid tax code format
- `"Mã số thuế đã được sử dụng"` - Tax code already exists
- `"Bạn đã có công ty"` - User already has a company
- `"CV không tồn tại"` - CV not found
- `"Công ty không tồn tại"` - Company not found

---

## 7. Security

### Authentication
- Tất cả endpoints require JWT token
- Token được verify bởi `authenticateJWT` middleware
- UserId được extract từ token payload

### Authorization
- User chỉ có thể:
  - Get/update profile của chính mình
  - Upload/delete CV của chính mình
  - Create/update company của chính mình

### File Upload Security
- Validate file type bằng extension
- Validate file size
- Generate unique filename (userId/companyId + timestamp)
- Store files outside web root
- Serve files qua static middleware

---

## 8. Database Schema

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  address TEXT,
  date_of_birth DATE,
  experience TEXT,
  avatar_url VARCHAR(500),      -- Trường mới
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### uploaded_cvs table
```sql
CREATE TABLE uploaded_cvs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### companies table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tax_code VARCHAR(13) UNIQUE NOT NULL,
  industry VARCHAR(100) NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Testing

### Manual Testing với curl

```bash
# 1. Login để lấy token
TOKEN=$(curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test1234"}' \
  | jq -r '.token')

# 2. Get profile
curl -X GET http://localhost:5001/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Update profile
curl -X PUT http://localhost:5001/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","address":"Hà Nội"}'

# 4. Upload avatar
curl -X POST http://localhost:5001/users/profile/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@avatar.jpg"

# 5. Upload CV
curl -X POST http://localhost:5001/users/cv/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@cv.pdf"

# 6. List CVs
curl -X GET http://localhost:5001/users/cv \
  -H "Authorization: Bearer $TOKEN"

# 7. Create company
curl -X POST http://localhost:5001/users/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"ABC Corp","taxCode":"0123456789","industry":"IT"}'

# 8. Upload company logo
curl -X POST http://localhost:5001/users/company/COMPANY_ID/logo \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@logo.png"
```

---

## 10. Best Practices

### Repository Pattern
- Tách biệt database operations vào Repository layer
- Service layer không trực tiếp access Models
- Dễ dàng test và mock

### DTO Pattern
- Sử dụng DTOs để define response structure
- Không expose internal model structure
- Type-safe với TypeScript

### File Storage
- Lưu files vào local storage (có thể chuyển sang S3 sau)
- Generate unique filenames
- Xóa file cũ khi upload mới
- Validate file type và size

### Error Handling
- Throw errors từ Service layer
- Catch và format errors ở Controller layer
- Return consistent error format: `{ error: string }`

### Security
- Always authenticate requests
- Validate all inputs
- Sanitize file uploads
- Use parameterized queries (Sequelize ORM)
