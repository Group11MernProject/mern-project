# Production deployment (DigitalOcean + domain + HTTPS)

This setup runs the React build, Express API, MongoDB, and Caddy on one Ubuntu droplet. Caddy obtains and renews the TLS certificate automatically.

## 1. Create the server and domain

1. Create an Ubuntu 24.04 droplet (2 GB RAM is comfortable for the project).
2. Add an `A` DNS record for the chosen domain (for example, `platepilot.example.com`) pointing to the droplet IP.
3. Install Git and Docker Engine with the Docker Compose plugin.
4. Clone the GitHub repository into `/opt/platepilot`.

## 2. Configure production settings

Copy `.env.example` to `.env` on the droplet. Set at least:

```dotenv
DOMAIN=platepilot.example.com
JWT_SECRET=a-long-cryptographically-random-secret
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=PlatePilot <hello@platepilot.example.com>
ENABLE_DEMO_LOGIN=true
```

The production Compose file passes `GOOGLE_CLIENT_ID` into the React build as `VITE_GOOGLE_CLIENT_ID`, so the same public client ID configures both browser and server verification.

In Google Cloud Console, add `https://platepilot.example.com` to the OAuth client’s **Authorized JavaScript origins**. The client ID is public; never commit the client secret.

## 3. Start and validate

Run `docker compose -f docker-compose.production.yml up -d --build`. Then verify:

- `https://platepilot.example.com`
- `https://platepilot.example.com/api/health`
- `https://platepilot.example.com/api/docs`

## 4. Enable deploy-on-push

Add these GitHub repository secrets:

- `DEPLOY_HOST`: domain or server IP used by SSH
- `DEPLOY_USER`: restricted deployment user
- `DEPLOY_SSH_KEY`: private SSH key accepted by the droplet

The included workflow tests and builds every pull request. A successful push to `main` deploys the newest commit.

## 5. Backups and operations

- Take scheduled DigitalOcean volume or droplet snapshots.
- Back up the `mongo_data` Docker volume before schema changes.
- Keep ports 80, 443, and SSH open; block direct access to MongoDB and port 5000.
- Use `docker compose -f docker-compose.production.yml logs -f app` when diagnosing the server.
