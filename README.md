# Loopr Dashboard

Loopr Dashboard is a full-stack financial analytics application for managing and analyzing financial transactions.

Users can create an account, securely log in, view their transactions, search and filter financial data, import transactions from JSON, analyze income and expenses through a dashboard, and export selected transaction data as CSV.

## Features

### Authentication

* User registration and login
* JWT-based authentication
* Protected frontend routes
* Protected backend APIs
* Fetch current logged-in user
* Secure logout

### Dashboard

* Total income
* Total expenses
* Current balance
* Income vs expense overview
* Category-wise transaction analysis
* Financial charts
* Transaction activity overview
* Responsive dashboard layout

### Transaction Management

* View transactions
* Search by transaction details
* Filter by category
* Filter by transaction type
* Filter by transaction status
* Filter by amount range
* Filter by date range
* Sort transaction data
* Pagination
* Transaction status indicators

### JSON Import

* Import transactions from a JSON file
* Validate imported transaction data
* Associate transactions with the logged-in user
* Store imported transactions in MongoDB
* Display imported transactions in the application
* Include imported transactions in dashboard analytics

### CSV Export

* Export transaction data as CSV
* Select which columns to export
* Export data after applying search, filter, and sorting options

### User Interface

* Responsive layout
* Sidebar navigation
* Header navigation
* Loading and error states
* Import success and error messages
* Responsive transaction table
* Responsive charts
* Mobile-friendly design

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* CSS

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcrypt

### Tools

* Visual Studio Code
* npm
* Git
* GitHub

---

## Project Structure

```text
fDashboard/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── transactionController.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Transaction.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── transactionRoutes.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── scripts/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── sample-transactions.json
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
└── README.md
```

---

## Requirements

Make sure the following are installed on your system:

* Node.js
* npm
* MongoDB

Check your Node.js and npm versions:

```bash
node --version
npm --version
```

---

## Backend Setup

Open a terminal and move into the backend directory:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Example configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fDashboard
JWT_SECRET=your_secure_jwt_secret
```

Update the values according to your local MongoDB and application configuration.

Start the backend development server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

You can check whether the backend is running by opening:

```text
http://localhost:5000/api/health
```

---

## Frontend Setup

Open a second terminal and move into the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5174
```

---

## Running the Application

Follow these steps to run the complete application locally:

1. Start MongoDB.
2. Start the backend server.
3. Start the frontend development server.
4. Open `http://localhost:5174` in your browser.
5. Register a new account.
6. Log in with your credentials.
7. Open the dashboard.
8. Import transaction data when required.
9. Search, filter, sort, analyze, and export your transactions.

---

## API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

#### Login

```http
POST /api/auth/login
```

#### Get Current User

```http
GET /api/auth/me
```

Protected requests must include a JWT token in the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Transactions

Transaction endpoints are protected and require authentication.

#### Get Transactions

```http
GET /api/transactions
```

Supported query parameters:

```text
search
category
type
status
minAmount
maxAmount
startDate
endDate
sortBy
sortOrder
page
limit
```

Example:

```http
GET /api/transactions?page=1&limit=10
```

#### Create Transaction

```http
POST /api/transactions
```

#### Import Transactions

```http
POST /api/transactions/import
```

---

## JSON Transaction Import

fDashboard supports importing multiple transactions from a JSON file.

### Example JSON

```json
[
  {
    "date": "2026-09-17",
    "description": "Monthly Revenue",
    "category": "Revenue",
    "amount": 1500,
    "type": "income",
    "status": "completed",
    "account": "Imported JSON"
  },
  {
    "date": "2026-09-17",
    "description": "Office Expense",
    "category": "Expense",
    "amount": 1200.5,
    "type": "expense",
    "status": "completed",
    "account": "Imported JSON"
  }
]
```

A sample file is included in the project:

```text
frontend/public/sample-transactions.json
```

During import, the backend validates the transaction data, associates the records with the authenticated user, and stores valid transactions in MongoDB.

Imported transactions are then available in the transaction list and dashboard analytics.

---

## CSV Export

The application includes a configurable CSV export feature.

Users can:

1. Search and filter transactions.
2. Sort the displayed data.
3. Open the export option.
4. Select the columns they want to include.
5. Download the transaction data as a CSV file.

---

## Dashboard Analytics

The dashboard provides a quick overview of financial activity, including:

* Total income
* Total expenses
* Balance
* Income and expense trends
* Category distribution
* Transaction activity
* Transaction status

---

## Security

The application includes the following security measures:

* Password hashing with bcrypt
* JWT-based authentication
* Protected frontend routes
* Protected backend routes
* User-specific transaction access
* Environment variables for sensitive configuration

The actual `.env` file should never be committed to GitHub.

Only the example configuration file should be committed:

```text
backend/.env.example
```

---

## Build

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

---

## GitHub Repository

[github.com/omkaro2/fDashboard](https://github.com/omkaro2/fDashboard)

---

## Author

**Omkar Dere**

MCA Student | Java Full Stack Developer
