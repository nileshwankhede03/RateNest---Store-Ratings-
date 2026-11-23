# RateNest – Store Rating Management System

A full-stack web application that allows users to rate stores, store owners to monitor customer feedback, and administrators to manage users and stores through a role-based dashboard.

## 🚀 Features

### 1. System Administrator
- View dashboard statistics:
  - Total registered users
  - Total stores
  - Total ratings submitted
- Add new users, administrators, and store owners.
- Add and manage stores.
- View all registered users and stores.
- Search and filter users and stores.
- Sort records in ascending and descending order.
- View user details and ratings submitted by users.

### 2. Normal User
- Register and log in securely.
- Browse and search available stores.
- View store addresses and overall ratings.
- View their own submitted ratings.
- Submit ratings from 1 to 5.
- Update previously submitted ratings.
- Change account password.

### 3. Store Owner
- Log in securely.
- View the average rating of their store.
- View users who have submitted ratings.
- Monitor customer feedback.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- React Router
- Fetch API

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs

**Database**
- MySQL

**Development Tools**
- Visual Studio Code
- Postman
- Git and GitHub
- npm

## 📁 Project Structure

```text
store-rating-system/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── storeController.js
│   │   └── ratingController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── storeRoutes.js
│   │   └── ratingRoutes.js
│   ├── .env
│   ├── server.js
│   └── seedAdmin.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd store-rating-system
```

### 2. Database Setup

Open MySQL and create the database:

```sql
CREATE DATABASE store_rating_db;
```

Create the required tables for users, stores, and ratings according to the database schema used by the backend.

### 3. Backend Setup

Navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
JWT_SECRET=your_secret_key
```

Update the database credentials according to your local MySQL configuration.

Start the backend:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:3000
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the React development server:

```bash
npm run dev
```

The frontend will be available at the URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 🔐 Authentication and Authorization

The application uses JSON Web Tokens (JWT) for authentication.

- Users must log in to access protected features.
- Passwords are hashed using bcryptjs before being stored.
- Role-based authorization restricts access to administrator, normal user, and store owner features.
- Each user can access only the functionality permitted by their role.

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a normal user |
| POST | `/auth/login` | Authenticate user |
| PUT | `/auth/password` | Update password |
| GET | `/admin/dashboard` | Get dashboard statistics |
| GET | `/admin/users` | Get all users |
| POST | `/admin/users` | Create a user |
| GET | `/admin/stores` | Get all stores |
| POST | `/admin/stores` | Create a store |
| GET | `/admin/users/:id` | Get user details |
| GET | `/stores` | Get available stores |
| GET | `/stores/owner/dashboard` | Get owner dashboard |
| POST | `/ratings` | Submit or update a rating |

Protected endpoints require a JWT access token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 Application Validations

- Name must contain between 20 and 60 characters.
- Address must not exceed 400 characters.
- Email addresses must follow a valid email format.
- Passwords must contain 8–16 characters, at least one uppercase letter, and one special character.
- Store ratings must be between 1 and 5.
- A user can submit one rating per store and update that rating later.

## 🧪 Testing

API endpoints can be tested using Postman.

1. Register a normal user.
2. Log in and obtain the JWT token.
3. Use the token to access protected endpoints.
4. Test role-based access.
5. Create stores and users as an administrator.
6. Submit and update store ratings.
7. Verify dashboard statistics and store averages.

## 🔒 Security

- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based access control.
- Protected API routes.
- Server-side input validation.
- Parameterized SQL queries to reduce SQL injection risks.

## 👨‍💻 Author

**Nilesh Wankhede**

---

*RateNest – Making store ratings transparent and helping customers make better decisions.*
