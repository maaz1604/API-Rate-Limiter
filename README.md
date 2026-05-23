# API Rate Limiter System (with API Key, Daily Limits & Email Notifications)

This project implements a robust **API Rate Limiting System** that restricts API usage based on user subscription plans (`basic`, `pro`, `premium`). It features **API key generation**, **daily usage tracking**, **email alerts at 90% and 100% usage**, and **CSV reporting via cron job**.

---

## 📌 Key Features

- 🔐 **API Key Generation** for each user.
- 🔑 **JWT Authentication** with login/register endpoints.
- 👮 **Role-based access** for admin-only routes.
- 📊 **Daily API Usage Tracking** per user via MongoDB.
- ⚠️ **Automatic Email Warning** at 90% usage.
- ⛔ **Limit Reached Email** and block at 100% usage.
- 📬 **Daily CSV Usage Report** emailed to admin at 8 AM.
- 🔁 **Usage Reset** every midnight via scheduled cron.
- 🔁 **API Key Regeneration** (admin only).
- 🧾 **User Dashboard (Admin Route)** with daily usage summary.

---

## 🧰 Tech Stack

| Layer       | Tech/Tool                 |
| ----------- | ------------------------- |
| Backend     | Node.js, Express.js       |
| Database    | MongoDB (Mongoose ODM)    |
| Email       | Nodemailer + Gmail OAuth2 |
| Auth        | JSON Web Token (JWT)       |
| Scheduler   | node-cron                 |
| Data Format | json2csv (CSV generation) |
| Security    | Hashed API Keys (SHA-256) |

---

## 🧪 API Routes and Usage (Postman Guide)

### 1. Create User (with API Key)

`POST /api/users`

```
{
  "name": "Maaz",
  "email": "maaz@example.com",
  "password": "your-password",
  "plan": "basic"
}
```

This endpoint returns both the API key and a JWT token. The user whose email matches `ADMIN_EMAIL` in `.env` is created with the `admin` role.

### 1b. Login

`POST /api/auth/login`

```json
{
  "email": "maaz@example.com",
  "password": "your-password"
}
```

Use the returned JWT as `Authorization: Bearer <token>` for protected routes.

### 2. Regenerate API Key (Admin)

`PUT /api/admin/users/:id/apikey` <br>
Response will contain a new raw API key (shown once only).

### 3. Rate-Limited Test API Route

`GET /api/data` <br>
Header:

```makefile
x-api-key: YOUR_API_KEY_HERE
```

### 4. Admin Dashboard

`GET /api/admin/dashboard` <br>
📊 Returns all users with today’s usage.

Requires `Authorization: Bearer <token>` with the `admin` role.

### 5. Update User Details

`PUT /api/users/:id`

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

`scripts/dailyReport.js` <br>
Runs every day at 8 AM (via separate cron or manually) to: <br>
📤 Generate CSV of daily usage <br>
📧 Email it to ADMIN_EMAIL defined in .env

### .env Configuration

Create a `.env` file:

```ini
PORT=3000
MONGO_URI=mongodb+srv://your-db-uri
EMAIL_USER=youremail@gmail.com
CLIENT_ID=your-google-oauth-client-id
CLIENT_SECRET=your-google-oauth-client-secret
REFRESH_TOKEN=your-google-oauth-refresh-token
ADMIN_EMAIL=admin@example.com
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
```

---

### Future Implementations

- 🔒 JWT-based authentication + role-based access.

- 📈 Analytics dashboard with charts (React/Next.js).

- 📬 Admin alerts for users hitting limits.

- 🧪 API testing dashboard (Postman clone UI).

- 📁 Download logs & reports from dashboard.
# API Rate Limiter

Lightweight API rate-limiting service with per-user API keys, daily usage tracking, email alerts, and an admin dashboard.

What it provides
- API key generation (hashed, shown once)
- Daily request counting and plan-based limits (`basic`, `pro`, `premium`)
- Email warnings at 90% and block at 100% (Gmail OAuth2 via Nodemailer)
- JWT-based user authentication and role-based (admin) access
- Daily CSV usage report emailed to admin

Tech stack
- Node.js + Express
- MongoDB (Mongoose)
- Nodemailer (Gmail OAuth2)
- JWT (`jsonwebtoken`) and password hashing (`bcryptjs`)

Quick start
1. Create a `.env` file 

```ini
PORT=3000
MONGO_URI=mongodb+srv://<your-cluster>/<db>
EMAIL_USER=youremail@gmail.com
CLIENT_ID=<google-oauth-client-id>
CLIENT_SECRET=<google-oauth-client-secret>
REFRESH_TOKEN=<google-oauth-refresh-token>
ADMIN_EMAIL=admin@example.com
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
```

2. Install dependencies:

```bash
npm install
```

3. Run in development:

```bash
npm run dev
```

Useful scripts
- `npm run dev` — start server with `nodemon`.
- `node index.js` — run scheduled tasks (resets + report cron).
- `node src/scripts/sendCsvReport.js` — send daily CSV manually.

API overview
- `POST /api/users` — create user (returns raw API key and JWT). Body: `{ name, email, password, plan }`.
- `POST /api/auth/login` — login, returns JWT. Body: `{ email, password }`.
- `GET /api/data` — protected by API key header `x-api-key`. Rate-limited.
- `GET /api/admin/dashboard` — admin-only, requires `Authorization: Bearer <token>`.
- `PUT /api/admin/users/:id/apikey` — regenerate user's API key (admin only).

Auth and roles
- New users whose email equals `ADMIN_EMAIL` in `.env` are created with `admin` role.
- Use returned JWT as `Authorization: Bearer <token>` for protected endpoints.
- API key auth (header `x-api-key`) remains in place for the main data route; JWT is used for user management and admin endpoints.

Email
- The project uses Gmail OAuth2. Provide `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`, and `EMAIL_USER`.
- See `src/utils/email.js` for transporter configuration.

Database
- Mongoose models live in `src/models` (`User`, `Usage`, `Subscription`).

Testing admin access (Postman)
1. Register an admin (email matching `ADMIN_EMAIL`) or promote a user in the DB.
2. Login: `POST /api/auth/login` → copy `token`.
3. Call: `GET /api/admin/dashboard` with header `Authorization: Bearer <token>`.

