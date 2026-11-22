# RateNest — Store Rating Management Frontend

React + Vite frontend for the Store Rating Management System coding challenge.

## 1. Requirements
- Node.js 18+
- The Express/MySQL backend running locally
- Backend API available at `http://localhost:3000`

## 2. Install and run

```bash
cd store-rating-frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

If your backend uses another port, edit `.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

Restart Vite after changing `.env`.

## 3. Included screens

- Login and normal-user registration
- Role-aware navigation for ADMIN, USER, OWNER
- Admin dashboard counts
- Admin user list, role filter, search, add user
- Admin store list, search, add store
- Normal user store discovery/search and create/update rating
- Store owner average rating and customer rating list
- Update password
- Client-side validation matching the challenge: name 20–60 characters, address up to 400, password 8–16 with uppercase and special character, email format
- Loading, empty, and API error states

## 4. API contract used

The frontend calls these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/signup` | Normal user signup |
| POST | `/auth/login` | Login |
| PUT | `/auth/password` | Update password |
| GET | `/admin/dashboard` | Admin counts |
| GET | `/admin/users` | List/search/filter users |
| POST | `/admin/users` | Create user |
| GET | `/admin/users/:id` | User details (available for detail expansion) |
| GET | `/admin/stores` | Admin store list |
| POST | `/admin/stores` | Create store |
| GET | `/stores` | Store list for normal users |
| GET | `/stores/owner/dashboard` | Owner rating dashboard |
| POST | `/ratings` | Create/update rating |

The request payloads assumed:
- Login: `{ "email", "password" }`
- Signup: `{ "name", "email", "address", "password" }`
- Admin user: `{ "name", "email", "address", "password", "role" }`
- Store: `{ "name", "email", "address", "owner_id" }`
- Rating: `{ "store_id", "rating" }`
- Password update: `{ "currentPassword", "newPassword" }`

The API helper accepts common response list shapes (`[]`, `{data: []}`, `{users: []}`, `{stores: []}`) and common token fields (`token`, `accessToken`, `access_token`).

## 5. Important backend compatibility notes

This frontend is integrated to the route names and payloads described in the project setup conversation. Backend response/request field names can differ depending on the exact controller implementation. If an endpoint uses a different payload (for example `storeId` instead of `store_id`, or `oldPassword` instead of `currentPassword`), update the relevant call in `src/services/api.js` or the submit handler.

The backend must allow CORS from the Vite development origin. In Express, `app.use(cors())` is sufficient for local development.

For the password update, the UI currently sends `{ currentPassword, newPassword }`. Confirm that this matches your controller.

## 6. Troubleshooting

- **Network error:** confirm backend is running on port 5001 and `.env` has the correct API URL.
- **403/401:** confirm login returned a JWT and protected backend routes accept `Authorization: Bearer <token>`.
- **404:** compare route paths in `src/services/api.js` with your Express route files.
- **Empty lists:** inspect the JSON returned by the endpoint; the app supports common list wrappers. Adjust `unwrapList` if your API uses another wrapper.
- **Store owner not shown:** create the owner user first and use their numeric user ID when creating the store.

## 7. Build

```bash
npm run build
```

The production output is generated in `dist/`.
