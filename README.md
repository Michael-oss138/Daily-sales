# Daily Sales

Offline-capable sales ledger for Nigerian food vendors. See the project brief for scope.

## Prerequisites
- Node.js 20+ (built with 22) and npm
- MongoDB: local instance or a MongoDB Atlas connection string

## Setup
```bash
cd server && npm install && cp .env.example .env   # then edit .env
cd ../client && npm install
```

## Run
```bash
cd server && npm run dev      # API on http://localhost:4000
cd client && npm run dev      # UI on http://localhost:5173 (proxies /api)
```
Check `http://localhost:4000/api/health` — expect `{"status":"ok","database":"connected",...}`.

## Test
```bash
cd server && npm test
```
