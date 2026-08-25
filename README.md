# AI Revenue Recovery Agent Platform

This is the foundational architecture for a production-ready MERN application supporting an Agentic AI Revenue Recovery System.

## Features Included

- Node.js & Express.js Backend
- MongoDB Atlas Integration with Mongoose
- JWT Authentication & bcrypt Password Hashing
- Role-Based Access Control (RBAC) - `user` and `admin` roles
- React 19 Frontend with Vite
- Tailwind CSS Styling (Modern SaaS Aesthetic)
- Complete Authentication Flow (Register, Login, Protected Dashboard)
- Axios for API requests

## Getting Started

### 1. Setup Backend

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Update the `MONGODB_URI` in your `.env` file with your MongoDB Atlas connection string.

Start the backend server:
```bash
npm run dev
```

### 2. Setup Frontend

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 3. Usage

- Visit `http://localhost:5173` in your browser.
- Create a new account or log in.
- View the protected dashboard once authenticated.
