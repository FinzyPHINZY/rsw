# RSW Deployment Runbook

Single VPS running Nginx + Next.js + PostgreSQL. All commands run on the server
unless noted. Replace `rsw.example` with your domain.

## 1. Provision
- VPS (Hetzner or Contabo). Minimum 2 vCPU / 4 GB RAM; preferred 4 vCPU / 8 GB.
- Ubuntu 22.04+. Create a non-root user `rsw`.

## 2. Install runtimes
- Node.js 22 LTS, `corepack enable` (provides pnpm), PostgreSQL 16, Nginx, Certbot.

## 3. Database
```
sudo -u postgres psql -c "CREATE USER rsw WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE rsw OWNER rsw;"
```

## 4. App
```
sudo -u rsw git clone <repo> /home/rsw/rsw
cd /home/rsw/rsw
sudo mkdir -p /etc/rsw && sudo cp .env.production.example /etc/rsw/rsw.env
sudo nano /etc/rsw/rsw.env   # set real DATABASE_URL, AUTH_SECRET (openssl rand -base64 32), SITE_URL
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm build
```

## 5. Service
```
sudo cp deploy/rsw.service /etc/systemd/system/rsw.service
sudo systemctl daemon-reload
sudo systemctl enable --now rsw
sudo systemctl status rsw
```

## 6. Nginx + TLS
```
sudo cp deploy/nginx.conf /etc/nginx/sites-available/rsw
sudo ln -s /etc/nginx/sites-available/rsw /etc/nginx/sites-enabled/rsw
sudo mkdir -p /var/cache/nginx/rsw
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d rsw.example -d www.rsw.example
```

## 7. Updates
```
cd /home/rsw/rsw && ./deploy.sh
```

## 8. Rollback
```
git checkout <previous-tag-or-sha>
./deploy.sh
```

## Notes
- Validate before deploying: `bash -n deploy/deploy.sh` and `sudo nginx -t`.
- Alternative to systemd: PM2 (`pnpm add -g pm2 && pm2 start "pnpm start" --name rsw && pm2 save`).
- Uploads are stored on local disk under `public/uploads/` (back this up).
