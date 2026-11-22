# Auth API Documentation

Built with NestJS, TypeORM (SQLite), JWT, bcrypt.

- **Base URL:** `http://localhost:3000`
- **Swagger UI:** `http://localhost:3000/docs`

## Setup & Run

```bash
npm install
npm run start:dev      # server on port 3000
npm run test:e2e       # automated API tests
```

## Overview

| Method | Endpoint         | Auth   | Description                                   |
|--------|------------------|--------|-----------------------------------------------|
| POST   | `/auth/register` | No     | Create a new user                             |
| POST   | `/auth/login`    | No     | Verify credentials, get JWT                   |
| GET    | `/auth/profile`  | Bearer | Get logged-in user's details                  |
| GET    | `/users`         | Bearer | List users (pagination, search, filter, sort) |

Protected routes need this header: `Authorization: Bearer <access_token>`

---

## 1. Register

`POST /auth/register`

**Request**
```json
{ "name": "Test", "email": "test@mail.com", "password": "123456" }
```

**Validation:** name required, email must be valid, password min 6 characters.

**Response: 201 Created**
```json
{
  "id": 1,
  "name": "Test",
  "email": "test@mail.com",
  "createdAt": "2026-11-22T17:15:29.000Z"
}
```

**Errors**

| Status | When                | Body (message)                                       |
|--------|---------------------|------------------------------------------------------|
| 400    | Invalid / missing fields | `["Valid email is required", "Password must be at least 6 characters"]` |
| 409    | Email already exists | `"Email already registered"`                        |

---

## 2. Login

`POST /auth/login`

**Request**
```json
{ "email": "test@mail.com", "password": "123456" }
```

**Response: 201 Created**
```json
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Token is valid for 1 hour.

**Errors**

| Status | When                          | Body (message)          |
|--------|-------------------------------|-------------------------|
| 400    | Missing / invalid fields      | validation messages     |
| 401    | Wrong email or password       | `"Invalid credentials"` |

---

## 3. Profile (protected)

`GET /auth/profile`

**Header:** `Authorization: Bearer <access_token>`

**Response: 200 OK**
```json
{
  "id": 1,
  "name": "Test",
  "email": "test@mail.com",
  "createdAt": "2026-11-22T17:15:29.000Z"
}
```

**Errors**

| Status | When                      | Body (message)                    |
|--------|---------------------------|-----------------------------------|
| 401    | No token / wrong format   | `"Missing or invalid token"`      |
| 401    | Expired or tampered token | `"Token expired or invalid"`      |

---

## 4. List Users (protected)

`GET /users`

**Query parameters**

| Param          | Type    | Default     | Description                                        |
|----------------|---------|-------------|----------------------------------------------------|
| `page`         | integer | 1           | Page number (min 1)                                |
| `limit`        | integer | 10          | Items per page (1 to 50)                           |
| `search`       | string  | -           | Matches name or email (partial)                    |
| `createdAfter` | date    | -           | Only users created on/after this date (ISO)        |
| `sortBy`       | string  | `createdAt` | One of: `id`, `name`, `email`, `createdAt`         |
| `order`        | string  | `DESC`      | `ASC` or `DESC`                                    |

**Example:** `GET /users?page=1&limit=3&search=ali&sortBy=name&order=ASC`

**Response: 200 OK**
```json
{
  "data": [
    { "id": 3, "name": "Ali", "email": "ali@mail.com", "createdAt": "2026-11-22T17:35:44.000Z" },
    { "id": 7, "name": "Alina", "email": "alina@mail.com", "createdAt": "2026-11-22T17:35:45.000Z" }
  ],
  "meta": { "total": 2, "page": 1, "limit": 3, "totalPages": 1 }
}
```

**Error: 400 Bad Request** (`GET /users?limit=500&sortBy=password`)
```json
{
  "message": [
    "limit must not be greater than 50",
    "sortBy must be one of the following values: id, name, email, createdAt"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Rate Limiting

Max **10 requests per minute** per client. Beyond that the API returns
**429 Too Many Requests** until the window resets.

## Status Codes Used

| Code | Meaning                                  |
|------|------------------------------------------|
| 200  | OK                                       |
| 201  | Created                                  |
| 400  | Validation failed (invalid/missing data) |
| 401  | Missing, invalid or expired token / wrong credentials |
| 409  | Duplicate email                          |
| 429  | Rate limit exceeded                      |

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds), never stored in plain text.
- Password is never returned in any response.
- Login returns the same error for wrong email or wrong password.
- `sortBy` is whitelisted so users cannot sort by sensitive columns.

## Testing

Automated e2e tests (Jest + Supertest) cover: register, duplicate email,
login, wrong password, protected route with/without token, invalid register
data, pagination, invalid query params.

```bash
npm run test:e2e
```