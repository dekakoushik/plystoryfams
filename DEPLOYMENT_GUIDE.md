# Fixed Asset Management System (FAMS) - Dockploy & Docker Deployment Guide

This guide provides step-by-step instructions to deploy the dockerised **Plystory Fixed Asset Management System (FAMS)** using **Dockploy** or standard Docker on your server.

---

## 1. Project Architecture & Docker Overview

The project is built with:
- **Multi-stage Dockerfile**: Compiles the frontend application using Node.js and serves it via an optimized production Express server with real SMTP dispatching.
- **Port**: Container listens on port `3000` (configurable via `PORT` environment variable).
- **Healthcheck**: Built-in `/health` endpoint for container orchestration.
- **Docker Compose**: Pre-configured `docker-compose.yml` with labels for Dockploy Traefik reverse-proxy auto-routing.

---

## 2. Push to Your GitHub Repository

The local repository is initialized and committed on the `main` branch. Follow these steps to push to GitHub:

### Step 2.1: Create a New Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new).
2. Name the repository (e.g., `plystory-fams` or `Fixed-Asset-Management-System`).
3. Set visibility to **Private** or **Public**.
4. Leave **"Initialize this repository with a README" unchecked**.

### Step 2.2: Add Remote and Push
Run the following commands in your terminal:

```bash
cd D:\Dev\FAMS

# Add your GitHub repository as the origin remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# Push the main branch
git push -u origin main
```

---

## 3. Deploying in Dockploy (Step-by-Step)

Dockploy makes deployment seamless via its web dashboard:

### Step 3.1: Connect GitHub in Dockploy
1. Log in to your **Dockploy Dashboard** (`http://YOUR_SERVER_IP:3000` or your Dockploy domain).
2. Navigate to **Settings** > **GitHub / Git Providers**.
3. Link your GitHub account or generate a Personal Access Token (PAT) with repo access.

### Step 3.2: Create a New Project & Application
1. In Dockploy, click **Projects** > **Create Project** (Name: `Plystory FAMS`).
2. Click **Create Service / Application**.
3. Select **GitHub** as the source provider.
4. Choose your repository: `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME`.
5. Branch: `main`.

### Step 3.3: Configure Build Type & Port
- **Build Type**: Select **Dockerfile** or **Docker Compose**
  - If selecting **Dockerfile**:
    - **Dockerfile Path**: `./Dockerfile` or `./frontend/Dockerfile`
    - **Context Path**: `./frontend`
  - If selecting **Docker Compose**:
    - Select **docker-compose.yml**
- **Container Port**: `3000`

### Step 3.4: Set Environment Variables (Optional)
In the **Environment** tab in Dockploy, add:
| Variable | Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Application port |
| `NODE_ENV` | `production` | Production environment |

### Step 3.5: Configure Domain & SSL
1. Under the **Domains** tab in Dockploy:
2. Click **Add Domain**.
3. Enter your domain/subdomain (e.g., `fams.yourcompany.com`).
4. Enable **HTTPS / Let's Encrypt SSL** toggle.
5. Ensure your DNS `A Record` for `fams.yourcompany.com` points to your VPS / Server IP address.

### Step 3.6: Deploy & Verify
1. Click **Deploy**.
2. Dockploy will pull the repository, run the multi-stage Docker build, and start the container with automatic SSL termination.
3. Once the health check passes, your system will be live at `https://fams.yourcompany.com`!

---

## 4. Alternative: Deploying via Docker Compose CLI

If you want to run the container directly on any Linux server:

```bash
# Clone the repository on your server
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Build and start the container in detached mode
docker compose up -d --build

# Check logs
docker compose logs -f

# Verify container is running and healthy
docker ps
```

Access the system at `http://YOUR_SERVER_IP:3000`.

---

## 5. System Credentials & Initial Access

- **Default Super Admin Login:**
  - **Email / Username**: `ithelpdesk@plystory.com`
  - **Password**: `Kdeka@2602`
- **SMTP Gateway**: Configure via the **SMTP Mail Config** module on the sidebar for automated custody handover receipts and maintenance notices.
