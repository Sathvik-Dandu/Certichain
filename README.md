# CertiChain 🛡️

CertiChain is a blockchain-based certificate validation system featuring a secure React frontend and a robust Node.js/Express backend.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js**: (Version 16 or higher recommended) - [Download](https://nodejs.org/)
- **Git**: [Download](https://git-scm.com/)
- **MongoDB**: (Local or Atlas Connection String)

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/Sathvik-Dandu/Certichain.git
cd CertiChain
```

### 2. Backend Setup

Navigate to the backend folder, install dependencies, and configure the environment.

```bash
cd backend
npm install
```

**Configuration (.env)**
Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Blockchain (Optional for local UI testing, required for verification)
BLOCKCHAIN_RPC_URL=your_rpc_url
BLOCKCHAIN_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=your_contract_address
# Frontend URL for CORS
FRONTEND_BASE_URL=http://localhost:5173
```

**Run Backend**
```bash
npm run dev
```
*The backend server will start on http://localhost:5000*

### 3. Frontend Setup

Open a new terminal, navigate to the frontend folder, and install dependencies.

```bash
cd frontend
npm install
```

**Configuration (.env)**
Create a `.env` file in the `frontend/` directory (or set in Vercel Environment Variables):

```env
# MUST include /api at the end
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Run Frontend**
```bash
npm run dev
```
*The frontend application will start on http://localhost:5173*

## 🛠️ Project Structure

- **frontend/**: React application with Vite.
- **backend/**: Express.js server with MongoDB.
- **smart-contract/**: Blockchain related files.

## 📦 Key Libraries

- **Frontend**: React, Vite, Axios, Framer Motion, Chart.js, Ethers.js.
- **Backend**: Express, Mongoose, JWT, BCrypt, Multer, Cookie-Parser.

## ✅ Running the App

Once both terminals are running (`npm run dev` in both folders):
1. Open your browser and go to `http://localhost:5173`.
2. You should see the CertiChain landing page.
