# Giải thích Async/Await/Promise trong JavaScript/TypeScript

## Đoạn code cần giải thích

```typescript
async getProfile(userId: string): Promise<UserProfileDTO> {
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    // ...
  };
}
```

---

## 1. Promise là gì?

**Promise** là một object đại diện cho một giá trị có thể chưa có ngay bây giờ, nhưng sẽ có trong tương lai (hoặc có thể thất bại).

### Ví dụ đời thường:
Bạn đặt món ăn ở nhà hàng:
- Nhà hàng đưa bạn một **cái chuông** (Promise)
- Bạn có thể làm việc khác trong lúc chờ (không bị block)
- Khi món ăn sẵn sàng, chuông reo → bạn nhận món ăn (Promise resolved)
- Hoặc nhà hàng báo hết nguyên liệu → bạn không có món ăn (Promise rejected)

### Trong lập trình:

```javascript
// Ví dụ 1: Promise cơ bản
const promise = new Promise((resolve, reject) => {
  // Giả lập query database (mất 2 giây)
  setTimeout(() => {
    const user = { id: 1, name: 'John' };
    resolve(user);  // Thành công → trả về user
    // reject('Lỗi database');  // Thất bại → trả về lỗi
  }, 2000);
});

// Sử dụng Promise với .then() và .catch()
promise
  .then(user => {
    console.log('Nhận được user:', user);
  })
  .catch(error => {
    console.log('Lỗi:', error);
  });
```

**3 trạng thái của Promise:**
1. **Pending** (đang chờ): Promise vừa được tạo, chưa có kết quả
2. **Fulfilled** (thành công): Promise hoàn thành, có kết quả
3. **Rejected** (thất bại): Promise thất bại, có lỗi

---

## 2. Async/Await là gì?

**Async/Await** là cú pháp giúp viết code bất đồng bộ (asynchronous) trông giống code đồng bộ (synchronous), dễ đọc hơn.

### So sánh cách viết:

#### Cách cũ: Dùng .then()
```javascript
function getProfile(userId) {
  return UserRepository.findById(userId)
    .then(user => {
      if (!user) {
        throw new Error('Không tìm thấy user');
      }
      return {
        id: user.id,
        name: user.name
      };
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}
```

#### Cách mới: Dùng async/await
```javascript
async function getProfile(userId) {
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new Error('Không tìm thấy user');
  }
  return {
    id: user.id,
    name: user.name
  };
}
```

**Dễ đọc hơn nhiều phải không?** 😊

---

## 3. Giải thích từng dòng code

```typescript
async getProfile(userId: string): Promise<UserProfileDTO> {
```

### `async`
- Đánh dấu function này là **asynchronous** (bất đồng bộ)
- Function này sẽ **tự động return một Promise**
- Bên trong function có thể dùng `await`

**Ví dụ:**
```javascript
// Function bình thường
function sayHello() {
  return 'Hello';
}
console.log(sayHello());  // Output: "Hello"

// Function async
async function sayHelloAsync() {
  return 'Hello';
}
console.log(sayHelloAsync());  // Output: Promise { 'Hello' }
```

### `: Promise<UserProfileDTO>`
- Khai báo kiểu trả về (TypeScript)
- Function này return một **Promise**
- Khi Promise resolve (thành công), nó sẽ trả về object kiểu `UserProfileDTO`

**Tương đương:**
```typescript
// Cách 1: Dùng async (tự động wrap trong Promise)
async getProfile(userId: string): Promise<UserProfileDTO> {
  return { id: '1', name: 'John', ... };
}

// Cách 2: Return Promise thủ công
getProfile(userId: string): Promise<UserProfileDTO> {
  return new Promise((resolve) => {
    resolve({ id: '1', name: 'John', ... });
  });
}
```

---

```typescript
const user = await UserRepository.findById(userId);
```

### `await`
- **Chờ** Promise hoàn thành rồi mới chạy tiếp
- Lấy **giá trị** từ Promise (không phải Promise object)
- Chỉ dùng được trong `async` function

**Ví dụ so sánh:**

```javascript
// KHÔNG dùng await → nhận Promise object
async function example1() {
  const promise = UserRepository.findById('123');
  console.log(promise);  // Output: Promise { <pending> }
  // Không thể dùng promise.name vì nó là Promise, không phải User
}

// Dùng await → nhận User object
async function example2() {
  const user = await UserRepository.findById('123');
  console.log(user);  // Output: { id: '123', name: 'John', ... }
  console.log(user.name);  // Output: "John" ✅
}
```

### `UserRepository.findById(userId)`
- Đây là một function **async** (return Promise)
- Nó query database để tìm user
- Database query mất thời gian → phải dùng Promise

**Bên trong UserRepository:**
```typescript
class UserRepository {
  async findById(id: string): Promise<User | null> {
    // Sequelize query database (bất đồng bộ)
    return await User.findByPk(id);
  }
}
```

---

```typescript
if (!user) {
  throw new Error('Người dùng không tồn tại');
}
```

### `throw new Error()`
- Ném ra một lỗi (exception)
- Trong async function, throw Error sẽ **reject Promise**
- Lỗi này sẽ được catch ở nơi gọi function

**Ví dụ:**
```javascript
async function getProfile(userId) {
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new Error('Không tìm thấy');  // Promise rejected
  }
  return user;
}

// Nơi gọi function
try {
  const profile = await getProfile('123');
  console.log(profile);
} catch (error) {
  console.error(error.message);  // Output: "Không tìm thấy"
}
```

---

```typescript
return {
  id: user.id,
  name: user.name,
  email: user.email,
  // ...
};
```

### `return` trong async function
- Return giá trị → Promise resolve với giá trị đó
- Giá trị này sẽ được wrap trong Promise tự động

**Ví dụ:**
```javascript
async function getProfile() {
  return { id: '1', name: 'John' };
}

// Tương đương với:
function getProfile() {
  return Promise.resolve({ id: '1', name: 'John' });
}

// Khi gọi:
const profile = await getProfile();
console.log(profile);  // { id: '1', name: 'John' }
```

---

## 4. Luồng thực thi chi tiết

```typescript
async getProfile(userId: string): Promise<UserProfileDTO> {
  // Bước 1: Gọi UserRepository.findById()
  const user = await UserRepository.findById(userId);
  
  // Bước 2: Chờ database query hoàn thành
  // (trong lúc này, code KHÔNG bị block, có thể xử lý request khác)
  
  // Bước 3: Khi query xong, nhận kết quả vào biến user
  
  // Bước 4: Kiểm tra user có tồn tại không
  if (!user) {
    throw new Error('Người dùng không tồn tại');
    // → Promise rejected, dừng function
  }
  
  // Bước 5: Map User model sang DTO
  return {
    id: user.id,
    name: user.name,
    // ...
  };
  // → Promise resolved với object này
}
```

### Timeline thực tế:

```
t=0ms:   Gọi getProfile('123')
t=1ms:   Gọi UserRepository.findById('123')
t=2ms:   Gửi query đến PostgreSQL
         ⏸️  await → function tạm dừng (nhưng không block server)
         
         [Server có thể xử lý request khác trong lúc này]
         
t=50ms:  PostgreSQL trả về kết quả
t=51ms:  await nhận kết quả, function tiếp tục
t=52ms:  Check if (!user)
t=53ms:  Return DTO object
t=54ms:  Promise resolved
```

---

## 5. Cách gọi async function

### Trong Controller (cũng là async):

```typescript
class UserController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      
      // Gọi async function với await
      const profile = await UserService.getProfile(userId);
      
      // Khi đến đây, profile đã có giá trị
      res.json(profile);
      
    } catch (error: any) {
      // Catch lỗi từ throw Error() trong Service
      res.status(400).json({ error: error.message });
    }
  }
}
```

### Nếu không dùng await:

```typescript
// ❌ SAI - Không dùng await
const profile = UserService.getProfile(userId);
res.json(profile);  // Lỗi! profile là Promise, không phải object

// ✅ ĐÚNG - Dùng await
const profile = await UserService.getProfile(userId);
res.json(profile);  // OK! profile là object
```

---

## 6. Tại sao phải dùng async/await?

### Vấn đề: Database query mất thời gian

```javascript
// ❌ Code đồng bộ (không thể dùng với database)
function getProfile(userId) {
  const user = database.query('SELECT * FROM users WHERE id = ?', userId);
  // Phải CHỜ database trả về (block toàn bộ server) ❌
  return user;
}
```

### Giải pháp: Async/await

```javascript
// ✅ Code bất đồng bộ (không block server)
async function getProfile(userId) {
  const user = await database.query('SELECT * FROM users WHERE id = ?', userId);
  // Trong lúc chờ, server có thể xử lý request khác ✅
  return user;
}
```

---

## 7. Ví dụ thực tế đầy đủ

```typescript
// ========== Repository ==========
class UserRepository {
  // Return Promise<User | null>
  async findById(id: string): Promise<User | null> {
    // Sequelize query (bất đồng bộ)
    return await User.findByPk(id);
  }
}

// ========== Service ==========
class UserService {
  // Return Promise<UserProfileDTO>
  async getProfile(userId: string): Promise<UserProfileDTO> {
    // Chờ repository query xong
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    
    // Return object (tự động wrap trong Promise)
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }
}

// ========== Controller ==========
class UserController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      
      // Chờ service xử lý xong
      const profile = await UserService.getProfile(userId);
      
      // Trả response
      res.json(profile);
      
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

// ========== Client gọi API ==========
// GET /users/profile
// Response: { id: '123', name: 'John', email: 'john@example.com' }
```

---

## 8. Tóm tắt

| Khái niệm | Giải thích | Ví dụ |
|-----------|-----------|-------|
| **Promise** | Object đại diện cho giá trị trong tương lai | `new Promise((resolve, reject) => {...})` |
| **async** | Đánh dấu function bất đồng bộ, tự động return Promise | `async function getUser() {...}` |
| **await** | Chờ Promise hoàn thành, lấy giá trị | `const user = await getUser()` |
| **throw Error** | Ném lỗi → Promise rejected | `throw new Error('Lỗi')` |
| **try/catch** | Bắt lỗi từ async function | `try { await getUser() } catch(e) {}` |

### Quy tắc vàng:

1. ✅ Function có `async` → có thể dùng `await` bên trong
2. ✅ Dùng `await` trước Promise → nhận giá trị
3. ✅ Không dùng `await` → nhận Promise object
4. ✅ `throw Error` trong async function → Promise rejected
5. ✅ `return value` trong async function → Promise resolved

---

## 9. Bài tập thực hành

### Bài 1: Viết lại không dùng async/await

```typescript
// Code gốc (dùng async/await)
async function getProfile(userId: string) {
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new Error('Không tìm thấy');
  }
  return { id: user.id, name: user.name };
}

// Viết lại dùng .then() và .catch()
function getProfile(userId: string) {
  return UserRepository.findById(userId)
    .then(user => {
      if (!user) {
        throw new Error('Không tìm thấy');
      }
      return { id: user.id, name: user.name };
    });
}
```

### Bài 2: Gọi nhiều async functions

```typescript
// ❌ Chậm - Chờ từng cái (3 giây)
async function getUserData(userId: string) {
  const user = await getUser(userId);        // 1 giây
  const posts = await getPosts(userId);      // 1 giây
  const comments = await getComments(userId); // 1 giây
  return { user, posts, comments };
}

// ✅ Nhanh - Chạy song song (1 giây)
async function getUserData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    getUser(userId),
    getPosts(userId),
    getComments(userId)
  ]);
  return { user, posts, comments };
}
```

---

## 10. Lỗi thường gặp

### Lỗi 1: Quên await

```typescript
// ❌ SAI
async function getProfile(userId: string) {
  const user = UserRepository.findById(userId);  // Quên await
  console.log(user.name);  // Lỗi! user là Promise
}

// ✅ ĐÚNG
async function getProfile(userId: string) {
  const user = await UserRepository.findById(userId);
  console.log(user.name);  // OK!
}
```

### Lỗi 2: Dùng await ngoài async function

```typescript
// ❌ SAI
function getProfile(userId: string) {
  const user = await UserRepository.findById(userId);  // Lỗi!
}

// ✅ ĐÚNG
async function getProfile(userId: string) {
  const user = await UserRepository.findById(userId);
}
```

### Lỗi 3: Không catch error

```typescript
// ❌ SAI - Lỗi không được xử lý
async function getProfile(userId: string) {
  const user = await UserRepository.findById(userId);
  return user;
}

// ✅ ĐÚNG - Có xử lý lỗi
async function getProfile(userId: string) {
  try {
    const user = await UserRepository.findById(userId);
    return user;
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
}
```

---

Hy vọng giải thích này giúp bạn hiểu rõ về async/await/Promise! 🚀
