# Golinx — Backend

GraphQL API built to power a real-time social network with high interaction volume, optimized queries, and WebSocket-based subscriptions.

**Frontend repo → [golink-frontend](https://github.com/PaulTorres1417/golink-frontend)**

---

## Tech Stack

- Node.js
- Express
- Apollo Server
- GraphQL
- PostgreSQL
- DataLoader

---

## Core Features

- GraphQL API (queries, mutations, subscriptions)
- Authentication with JWT + OAuth2 (Google, GitHub)
- Real-time subscriptions (notifications, live counters)
- DataLoader to eliminate the N+1 query problem
- Optimized queries with PostgreSQL indexes

---

## Getting Started

### Prerequisites

- Node.js v22
- PostgreSQL v14+
- Frontend → [golink-frontend](https://github.com/PaulTorres1417/golink-frontend)

---

### Installation

```bash
# Clone the backend repo
git clone https://github.com/PaulTorres1417/golinx-backend
cd golinx-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/golinx

# Auth
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Media
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
RESEND_API_KEY=your_resend_api_key
```
