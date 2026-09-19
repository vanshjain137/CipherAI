# ⚡ CipherAI — Cloud AI IDE & Real-Time Execution Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-cipher--ai--kappa.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=white)](https://cipher-ai-kappa.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Render-Online_24%2F7-46e3b7?style=for-the-badge&logo=render&logoColor=white)](https://cipherai-backend.onrender.com/)
[![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_&_Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

> A full-stack, cloud-hosted AI development environment featuring automated LLM code generation via filesystem tool-calling, bi-directional in-browser shell execution, and a credit-based billing system—architected for 24/7 zero-cost hosting on cloud free tiers.


### 🚀 Live Demo

https://github.com/user-attachments/assets/540ae926-8249-4203-a42b-0940a38928e7

🎥 **[Watch the full, real-time 47-second execution demo here](https://github.com/user-attachments/assets/2157b5cf-92d3-4939-ac00-cceb179d3aac)**

---

## 📑 Table of Contents
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
- [Key Technical Implementations & Challenges](#-key-technical-implementations--challenges)
- [Tech Stack](#-tech-stack)
- [API Gateway Routing](#-api-gateway-routing)
- [Environment Configuration](#-environment-configuration)
- [Local Setup & Installation](#-local-setup--installation)

---

## 🏗 System Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │              React Client (Vercel)                     │
               │        [https://cipher-ai-kappa.vercel.app](https://cipher-ai-kappa.vercel.app)              │
               └───────────────────────┬────────────────────────────────┘
                                       │
                    HTTPS REST / Axios │ WSS Upgrade (Socket.io)
                    (withCredentials)  │ 
                                       ▼
               ┌────────────────────────────────────────────────────────┐
               │               Express API Gateway                      │
               │        [https://cipherai-backend.onrender.com](https://cipherai-backend.onrender.com)           │
               │  - trust proxy: 1                                      │
               │  - SameSite=None; Secure Cookie Parsing                │
               │  - http-proxy-middleware (server.on('upgrade'))        │
               └───┬─────────────┬─────────────┬─────────────┬──────────┘
                   │             │             │             │
         ┌─────────┴───┐   ┌─────┴───────┐   ┌─┴──────────┐  │
         │ Auth Module │   │ Project Mod │   │ Billing    │  │
         │ (Firebase + │   │ (Workspace  │   │ (Razorpay  │  │
         │  Redis)     │   │  Metadata)  │   │  Credits)  │  │
         └─────────────┘   └─────────────┘   └────────────┘  │
                                                             │
                  ┌──────────────────────────────────────────┴──────────┐
                  │                                                     │
                  ▼                                                     ▼
         ┌───────────────────┐       Internal HTTP             ┌───────────────────┐
         │     AI Engine     │ ──────────────────────────────> │   File / Terminal  │
         │  (LLM Tool-Calls) │   headers: { "x-user-id" }      │ (FS CRUD & PTY WS)│
         └───────────────────┘                                 └───────────────────┘
```

---

## ✨ Core Features

- **In-Browser Terminal Emulation:** Interactive shell connection streaming bi-directional terminal I/O (`ls`, `pwd`, file manipulation) using Socket.io.
- **Autonomous AI Filesystem Tools:** The AI agent executes structured tools (`createFile`, `createFolder`, `updateFile`, `deleteFile`, `getTree`) directly against the internal workspace backend rather than printing raw unrendered code.
- **Credit-Gated LLM Access:** Integrated Razorpay checkout flow to purchase credit packs (e.g., 500 credits) to gate and meter AI code generation calls.
- **Cross-Domain Session Persistence:** Seamless Google OAuth login flow using Firebase Auth paired with Redis session management, keeping users logged in across page reloads without third-party cookie blocking.
- **Zero-Cost 24/7 Keep-Alive:** Optimized cloud resource utilization by consolidating internal microservices into an Express gateway and leveraging UptimeRobot health checks to eliminate Render's 50-second cold start.

---

## 🛠 Key Technical Implementations & Challenges

### 1. Cross-Domain Cookie Authentication Across Reverse Proxies
* **The Problem:** Hosting the React client on Vercel (`.vercel.app`) and the backend on Render (`.onrender.com`) resulted in browsers blocking session cookies due to cross-site cookie restrictions and Render's TLS-terminating reverse proxy.
* **The Solution:** 
  * Enabled `app.set("trust proxy", 1)` in Express so session cookies correctly register HTTPS protocol headers from Render's load balancer.
  * Configured session cookies with `SameSite: "None"`, `Secure: true`, and `httpOnly: true`.
  * Configured the frontend Axios client with `withCredentials: true` and standardized CORS allowed origins.

### 2. WebSocket Upgrade Proxying Through the API Gateway
* **The Problem:** Standard HTTP reverse proxies drop persistent WebSocket connections, breaking the real-time terminal connection to the isolated terminal module.
* **The Solution:** 
  * Configured `http-proxy-middleware` on the Gateway targeting the internal terminal service with `ws: true`.
  * Hooked into the native Node.js HTTP server upgrade lifecycle via `server.on('upgrade', wsProxy.upgrade)` to cleanly forward `101 Switching Protocols` handshakes directly to the socket server.

### 3. Direct Internal Service-to-Service AI Tool Execution
* **The Problem:** When the AI model triggered file creation tools, requests failed with `Invalid URL` exceptions because internal service configuration variables were misaligned between the runtime environment and Axios clients.
* **The Solution:** 
  * Standardized the internal environment variable contract to `process.env.FILE_SERVICE`.
  * Passed authenticated user identity backend-to-backend via the custom `x-user-id` header, bypassing the public Gateway and eliminating circular network latency.

### 4. Zero-Cost 24/7 Cloud Hosting & Cold-Start Elimination
* **The Problem:** Keeping separate microservices awake 24/7 would require 7 x 744 = 5,208 hours/month, quickly exhausting Render’s 750-hour free tier pool and causing mid-month shutdowns. Letting the server sleep resulted in a 50-second cold start for recruiters.
* **The Solution:** 
  * Consolidated microservices behind a unified Express Gateway instance.
  * Configured an external monitor via UptimeRobot to ping the lightweight `GET /` health endpoint every 5 minutes.
  * Result: 1 service running 24/7 consumes ~744 hours/month (within the 750-hour quota), ensuring instant load times with zero cloud expenditure.

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, TailwindCSS, Axios, Socket.io-client |
| **Backend & Gateway** | Node.js, Express.js, `http-proxy-middleware`, `express-http-proxy` |
| **Real-Time Stream** | Socket.io (WebSocket terminal emulation) |
| **Databases & Cache** | MongoDB (Data persistence), Redis (Session store) |
| **Auth & Billing** | Firebase Authentication, Razorpay SDK |
| **Infrastructure** | Vercel (Frontend), Render (Unified Gateway Backend), UptimeRobot |

---

## 🚦 API Gateway Routing

All incoming traffic is directed to port `8000` (or `process.env.PORT`) and proxied internally:

| Route Path | Target / Handling | Protection | Description |
|---|---|---|---|
| `GET /` | Gateway Local | Public | UptimeRobot health-check endpoint |
| `/socket.io` | `TERMINAL_SERVICE` | Handshake | Bi-directional WebSocket terminal stream |
| `/api/auth` | `AUTH_SERVICE` | Public | Authentication & session initialization |
| `/api/me` | Gateway Local | `protect` | Retrieves current authenticated session user |
| `/api/project` | `PROJECT_SERVICE` | `protect` | Project workspace CRUD operations |
| `/api/file` | `FILE_SERVICE` | `protect` | Filesystem tree & document operations |
| `/api/ai` | `AI_SERVICE` | `protect` | LLM prompt processing & tool execution |
| `/api/payment` | `PAYMENT_SERVICE` | `protect` | Razorpay order generation & verification |

---

## ⚙️ Environment Configuration

### Gateway (`.env`)
```env
PORT=8000
FRONTEND_URL=[https://cipher-ai-kappa.vercel.app](https://cipher-ai-kappa.vercel.app)

# Microservice Target URLs (Internal Render URLs in Production)
AUTH_SERVICE=http://localhost:8001
PROJECT_SERVICE=http://localhost:8002
FILE_SERVICE=http://localhost:8005
AI_SERVICE=http://localhost:8004
PAYMENT_SERVICE=http://localhost:8006
TERMINAL_SERVICE=http://localhost:8005
```

### AI Module (`.env`)
```env
FILE_SERVICE=http://localhost:8005
# LLM API Keys & Model configurations
```

---

## 💻 Local Setup & Installation

### 1. Clone the repository
```bash
git clone [https://github.com/vanshjain137/CipherAI.git](https://github.com/vanshjain137/CipherAI.git)
cd CipherAI
```

### 2. Install dependencies
```bash
# Install Gateway dependencies
cd backend/gateway
npm install

# Install Frontend dependencies
cd ../../frontend
npm install
```

### 3. Run the development environment
```bash
# Run Gateway
cd backend/gateway
npm run dev

# Run Frontend
cd ../../frontend
npm start
```

---

## 👤 Author

**Vansh Jain**
- **Portfolio / Live Demo:** [cipher-ai-kappa.vercel.app](https://cipher-ai-kappa.vercel.app/)
- **GitHub:** [@vanshjain137](https://github.com/vanshjain137)