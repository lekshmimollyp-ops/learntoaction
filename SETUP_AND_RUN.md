# LearnToAction: Setup & Daily Run Guide 🚀

This document covers how to set up the project from scratch and how to run it every day.

---

## ☀️ Daily Start Routine (How to run the app)

To work on the project, you need to run **two** separate terminals.

### 1. Start the Backend (API)
1.  Open a terminal.
2.  Navigate to the api folder:
    ```bash
    cd api
    ```
3.  Start the server:
    ```bash
    npm run start:dev
    ```
    *Wait until you see:* `Nest application successfully started`

### 2. Start the Frontend (Web)
1.  Open a **new** terminal (keep the first one running).
2.  Navigate to the web folder:
    ```bash
    cd web
    ```
3.  Start the website:
    ```bash
    npm run dev
    ```
    *Wait until you see:* `Local: http://localhost:5173 / 5174`

---

## 🔗 Access Links
*   **Teacher/Builder:** [http://localhost:5174/login](http://localhost:5174/login)
    *   *Email:* `admin@learntoaction.com`
    *   *Password:* `password`
*   **Student View (Example):** [http://localhost:5174/w/step-1](http://localhost:5174/w/step-1)
*   **Analytics:** [http://localhost:5174/analytics/step-1](http://localhost:5174/analytics/step-1)

*(Note: The port might be 5173 or 5174 depending on what's free. Check the terminal output.)*

---

## 🛠️ First Time Setup (Fresh Install)

If you are moving this to a new computer, follow these steps:

### 1. Prerequisites
*   **Node.js** (v18 or higher)
*   **PostgreSQL** (Running on port 5432)
*   **VS Code**

### 2. Database Setup
1.  Open `api/prisma/schema.prisma` (or `prisma/schema.prisma`) and check the `url`.
2.  Default is: `postgresql://postgres:password@127.0.0.1:5432/learntoaction`
3.  Create a database named `learntoaction` in your Postgres.

### 3. Install Dependencies
Open a terminal in the root folder and run:

```bash
# Install Backend
cd api
npm install
npx prisma db push  # Creates the database tables
node seed.ts        # (Optional) Creates the Admin user if script exists, otherwise use /register or manual insert

# Install Frontend
cd ../web
npm install
```

---

## ❓ Troubleshooting

**"Port 3000 is already in use"**
*   The backend is already running somewhere. Close other terminals or let it fail (it might try another port, but 3000 is standard).

**"Connection refused (Database)"**
*   Make sure your PostgreSQL service is running. Search "Services" in Windows and look for "postgresql".

**"White Screen on Frontend"**
*   Check the browser console (F12).
*   Ensure the API terminal is running without errors.
