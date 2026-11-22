ScrollConnect Backend (Auth API)

A NestJS REST API with user registration, login (JWT), a protected profile endpoint, and a users list with pagination, search, filtering and sorting.

Tech Stack
NestJS (controllers, services, modules, guards)
TypeORM + SQLite (file database, zero setup)
bcrypt for password hashing
JWT (@nestjs/jwt) for authentication
class-validator for request validation
@nestjs/throttler for rate limiting
Swagger (@nestjs/swagger) for API docs
Jest + Supertest for automated e2e tests
Features
User registration with hashed passwords (never stored in plain text)
Login that verifies credentials and returns a JWT
Protected profile endpoint (Authorization: Bearer <token>)
Request validation with meaningful error messages
Duplicate email detection (409)
Users list with pagination, search, date filter and sorting (sortBy is whitelisted)
Rate limiting (10 requests per minute per client)
Swagger documentation at /docs
Automated e2e tests
Getting Started
1. Install dependencies
bash
npm install
2. Set up environment variables

Copy .env.example to .env and change the secret:

bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
env
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=1h
3. Run the server
bash
npm run start:dev

The API runs at http://localhost:3000. Swagger docs: http://localhost:3000/docs.

The SQLite database file (db.sqlite) is created automatically on first run.

4. Run the tests
bash
npm run test:e2e

Tests use an in-memory database, so your real data is never touched.

API Endpoints
Method	Endpoint	Auth	Description
POST	/auth/register	No	Create a new user
POST	/auth/login	No	Verify credentials and get a JWT
GET	/auth/profile	Bearer	Get the logged-in user's details
GET	/users	Bearer	List users (pagination, search, filter, sort)
Register

POST /auth/register

json
{ "name": "Test", "email": "test@mail.com", "password": "123456" }

Response 201:

json
{ "id": 1, "name": "Test", "email": "test@mail.com", "createdAt": "2026-11-22T17:15:29.000Z" }
Login

POST /auth/login

json
{ "email": "test@mail.com", "password": "123456" }

Response 201:

json
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
Profile

GET /auth/profile with header Authorization: Bearer <access_token>

Response 200:

json
{ "id": 1, "name": "Test", "email": "test@mail.com", "createdAt": "2026-11-22T17:15:29.000Z" }
List users

GET /users with header Authorization: Bearer <access_token>

Query param	Default	Description
page	1	Page number (min 1)
limit	10	Items per page (1 to 50)
search	-	Partial match on name or email
createdAfter	-	Only users created on/after this ISO date
sortBy	createdAt	One of id, name, email, createdAt
order	DESC	ASC or DESC

Example: GET /users?page=1&limit=3&search=ali&sortBy=name&order=ASC

json
{
  "data": [
    { "id": 3, "name": "Ali", "email": "ali@mail.com", "createdAt": "2026-11-22T17:35:44.000Z" }
  ],
  "meta": { "total": 1, "page": 1, "limit": 3, "totalPages": 1 }
}
Status Codes
Code	Meaning
200	OK
201	Created
400	Validation failed (missing or invalid data)
401	Missing/invalid/expired token or wrong credentials
409	Email already registered
429	Too many requests (rate limit exceeded)
Project Structure
src/
├── auth/
│   ├── dto/                 # register.dto.ts, login.dto.ts
│   ├── auth.controller.ts   # /auth routes
│   ├── auth.service.ts      # hashing, login, JWT signing
│   ├── auth.module.ts
│   └── jwt-auth.guard.ts    # protects routes
├── users/
│   ├── dto/query-users.dto.ts
│   ├── user.entity.ts
│   ├── users.controller.ts  # GET /users
│   ├── users.service.ts
│   └── users.module.ts
├── app.module.ts
└── main.ts
test/
└── auth.e2e-spec.ts
Security Notes
Passwords are hashed with bcrypt (10 salt rounds).
Passwords are never returned in any response.
Login returns the same error for a wrong email or a wrong password.
sortBy is whitelisted so clients cannot sort by sensitive columns.
The JWT secret is read from .env, which is git-ignored.
synchronize: true is for development only; use migrations in production.
