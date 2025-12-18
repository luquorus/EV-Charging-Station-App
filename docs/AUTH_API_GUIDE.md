# 🔐 Auth API Guide

## Setup

### 1. Seed Admin User

```powershell
cd C:\Users\luquo\2025.1\GR2\ev_app
node scripts/seed_admin.js
```

**Default credentials:**
- Email: `admin@example.com`
- Password: `Admin123!`
- Role: `ADMIN`

Hoặc set trong `.env`:
```
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FULL_NAME=Your Name
```

---

## API Endpoints

### 1. Register (Optional - có thể chỉ admin tạo user)

**POST** `/api/v1/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "User Name",
  "role": "USER"  // Optional: ADMIN | EDITOR | USER (default: USER)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "675...",
      "email": "user@example.com",
      "role": "USER",
      "fullName": "User Name",
      "status": "ACTIVE",
      "createdAt": "...",
      "updatedAt": "..."
    }
  },
  "meta": { "timestamp": "..." }
}
```

---

### 2. Login

**POST** `/api/v1/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "675...",
      "email": "admin@example.com",
      "role": "ADMIN",
      "fullName": "Admin User",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "meta": { "timestamp": "..." }
}
```

**Note:** Refresh token được set trong **HttpOnly cookie** (`refreshToken`) cho web admin panel.

---

### 3. Refresh Access Token

**POST** `/api/v1/auth/refresh`

**Request (Web - từ cookie):**
```json
{}
```
Cookie `refreshToken` tự động gửi kèm.

**Request (Mobile - từ body):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "meta": { "timestamp": "..." }
}
```

**Token Rotation:** Refresh token cũ bị revoke, trả về refresh token mới.

---

### 4. Logout

**POST** `/api/v1/auth/logout`

**Request:** Tương tự refresh (cookie hoặc body)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "meta": { "timestamp": "..." }
}
```

---

## Test với curl

### Register
```powershell
curl -X POST "http://localhost:3000/api/v1/auth/register" `
  -H "Content-Type: application/json" `
  -d "{""email"":""test@example.com"",""password"":""Test123!"",""fullName"":""Test User""}"
```

### Login
```powershell
curl -X POST "http://localhost:3000/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d "{""email"":""admin@example.com"",""password"":""Admin123!""}" `
  -c cookies.txt
```

**Lưu cookie:** `-c cookies.txt` để lưu refresh token cookie.

### Refresh (dùng cookie)
```powershell
curl -X POST "http://localhost:3000/api/v1/auth/refresh" `
  -b cookies.txt
```

### Refresh (dùng body - cho mobile)
```powershell
curl -X POST "http://localhost:3000/api/v1/auth/refresh" `
  -H "Content-Type: application/json" `
  -d "{""refreshToken"":""YOUR_REFRESH_TOKEN""}"
```

### Logout
```powershell
curl -X POST "http://localhost:3000/api/v1/auth/logout" `
  -b cookies.txt
```

---

## Protected Routes

Để bảo vệ route, dùng middleware:

```js
const { authMiddleware } = require('./src/presentation/middleware/authMiddleware');
const { requireRole } = require('./src/presentation/middleware/roleMiddleware');

// Require authentication
router.get('/protected', authMiddleware, controller.handler);

// Require ADMIN role
router.post('/admin-only', authMiddleware, requireRole('ADMIN'), controller.handler);

// Require ADMIN or EDITOR
router.put('/edit', authMiddleware, requireRole('ADMIN', 'EDITOR'), controller.handler);
```

**Request header:**
```
Authorization: Bearer <accessToken>
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Invalid email or password",
    "details": []
  },
  "meta": { "timestamp": "..." }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied. Required role: ADMIN",
    "details": []
  },
  "meta": { "timestamp": "..." }
}
```

---

## Database Collections

### `users`
```js
{
  _id: ObjectId,
  email: String (unique, indexed),
  passwordHash: String,
  role: "ADMIN" | "EDITOR" | "USER",
  fullName: String?,
  status: "ACTIVE" | "DISABLED",
  createdAt: Date,
  updatedAt: Date
}
```

### `refresh_tokens`
```js
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  tokenHash: String (indexed),  // SHA256 hash của refresh token
  createdAt: Date,
  expiresAt: Date,
  revokedAt: Date?,
  replacedByTokenId: ObjectId?
}
```

---

## Security Notes

1. **Password:** Hashed với PBKDF2 (10000 iterations, SHA-512)
2. **JWT:** Signed với HMAC-SHA256
3. **Refresh Token:** Stored as hash trong DB, không lưu plain token
4. **Token Rotation:** Mỗi lần refresh → revoke token cũ, tạo token mới
5. **HttpOnly Cookie:** Refresh token trong cookie không thể truy cập từ JavaScript (XSS protection)

