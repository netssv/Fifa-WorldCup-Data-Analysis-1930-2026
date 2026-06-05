# FIFA World Cup 2026 Simulator — Deployment Guide

## 🖥️ Local Development (Single Device)

```bash
./dev.sh
# Frontend → http://localhost:3000
# API      → http://localhost:8000
```

No extra configuration needed. `.env.local` uses `http://localhost:8000`.

---

## 📱 Local Network (Multiple Devices / Mobile)

The app **automatically detects** the host IP when accessed via a local network address.
No configuration changes required — just make sure ports are open:

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
```

Then access from any device on the same WiFi using your host machine's IP:
```
http://192.168.68.56:3000
```

The frontend will automatically route API calls to `http://192.168.68.56:8000`.

---

## ☁️ Cloud Deployment (Vercel + Railway/Render)

### Architecture
```
[Vercel]  Next.js frontend  →  NEXT_PUBLIC_API_URL
[Railway / Render] FastAPI backend
```

### Step 1 — Deploy the Python API

**Option A: Railway**
```bash
railway init
railway up
# Get your deployment URL e.g. https://fifa-api.railway.app
```

**Option B: Render**
- Create a new Web Service pointing to this repo
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- Get your deployment URL e.g. `https://fifa-api.onrender.com`

### Step 2 — Set environment variables on the API host

| Variable | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (comma-separated if multiple) |

> Example: `ALLOWED_ORIGINS=https://fifa2026.vercel.app,https://custom-domain.com`

### Step 3 — Deploy the Next.js frontend to Vercel

```bash
vercel
```

Set this environment variable in the Vercel dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://fifa-api.railway.app` (your API URL) |

### Step 4 — That's it! ✅

- All devices worldwide can access the app via the Vercel URL.
- The API calls will go to the cloud backend.
- CORS is automatically configured via the `ALLOWED_ORIGINS` env var.

---

## 🔧 Environment Variables Summary

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `.env.local` / Vercel | Backend API base URL |
| `ALLOWED_ORIGINS` | API server / Railway | CORS allowed origins (empty = allow all, for dev) |

---

## 🧪 Testing API Connectivity

```bash
# Local
curl http://localhost:8000/

# Network
curl http://192.168.68.56:8000/

# Cloud
curl https://your-api.railway.app/
```

Expected response:
```json
{"service": "FIFA 2026 Prediction API", "version": "1.0.0", "models_loaded": true}
```
