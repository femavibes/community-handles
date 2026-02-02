# Community Handles Setup Guide

## Local Development Setup

### Prerequisites
- Docker and Docker Compose v2
- Your domain(s) ready

### Quick Start

1. **Start the development environment:**
   ```bash
   cd /root/community-handles
   docker compose up
   ```

   This will:
   - Start a PostgreSQL database
   - Install dependencies
   - Run Prisma migrations
   - Start the Next.js dev server on http://localhost:3000

2. **Access the application:**
   - Open http://localhost:3000 in your browser

### Environment Variables

The `.env` file has been created with local development settings:
- `DATABASE_URL`: Points to the local PostgreSQL container
- `PLAUSIBLE_CUSTOM_DOMAIN`: Optional analytics (leave empty for now)

### Database Management

**View database with Prisma Studio:**
```bash
docker compose exec app pnpm studio
```

**Reset database:**
```bash
docker compose exec app pnpm prisma db push --force-reset
```

**Run migrations:**
```bash
docker compose exec app pnpm prisma db push
```

## Production Deployment (Vercel + Railway)

### 1. Set up Railway Database

1. Go to https://railway.app
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string (starts with `postgresql://`)

### 2. Configure Vercel

1. Go to https://vercel.com
2. Import your GitHub repository: `femavibes/community-handles`
3. Add environment variable:
   - `DATABASE_URL`: Your Railway PostgreSQL connection string
4. Deploy

### 3. Set up Domain

In Vercel Settings > Domains:
1. Add your main domain (e.g., `yourdomain.social`)
2. Add wildcard domain: `*.yourdomain.social`
3. Use **nameservers** (not DNS records) at your registrar

### 4. Initialize Database

After first deployment, run migrations:
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login and link project
vercel login
vercel link

# Run migration
vercel env pull .env.production
pnpm prisma db push
```

## Domains You Mentioned

You can set up multiple community handles, each on its own domain:
- Each domain will have its own community
- Users can get handles like `@username.yourdomain.social`

## Next Steps

1. **Test locally** - Make sure everything works
2. **Choose your primary domain** - Which domain do you want to start with?
3. **Deploy to Vercel** - Follow production steps above
4. **Configure DNS** - Point your domain to Vercel

## Troubleshooting

**Port already in use:**
```bash
docker compose down
docker compose up
```

**Database connection issues:**
```bash
docker compose down -v  # Remove volumes
docker compose up
```

**Need to rebuild:**
```bash
docker compose up --build
```
