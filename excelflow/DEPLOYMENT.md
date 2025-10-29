# ExcelFlow Deployment Guide

Dit document beschrijft hoe je ExcelFlow kunt deployen naar verschillende hosting platforms.

## Pre-deployment Checklist

Voordat je deploy, zorg ervoor dat:

- [ ] Alle tests passen (`npm test`)
- [ ] Production build succesvol is (`npm run build`)
- [ ] Environment variabelen zijn geconfigureerd
- [ ] API base URL is correct voor production
- [ ] Bundle size is acceptabel (< 300KB gzipped per chunk)
- [ ] Lighthouse audit score > 90 (Performance, Accessibility, Best Practices)

## Production Build

```bash
# Create production build
npm run build

# Test production build locally
npm run preview

# Check bundle size
ls -lh dist/assets/

# View bundle analysis
open dist/stats.html
```

## Deployment Platforms

### 1. Vercel (Aanbevolen)

Vercel is het makkelijkste platform voor Vite apps.

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Via Vercel Dashboard

1. Ga naar [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Import je Git repository
4. Vercel detecteert automatisch Vite configuratie
5. Configureer environment variables:
   - `VITE_API_BASE_URL` = `https://api.excelflow.com/api`
6. Deploy!

#### Vercel Configuration

Maak `vercel.json` in project root (optioneel):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### 2. Netlify

Netlify is ook een uitstekende keuze voor static sites.

#### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build en deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Via Netlify Dashboard

1. Ga naar [netlify.com](https://netlify.com)
2. Klik "Add new site" → "Import an existing project"
3. Verbind je Git repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment variables:
   - `VITE_API_BASE_URL` = `https://api.excelflow.com/api`
6. Deploy!

#### Netlify Configuration

Maak `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

### 3. Cloudflare Pages

Cloudflare Pages biedt snelle global CDN en gratis hosting.

#### Via Cloudflare Dashboard

1. Ga naar [pages.cloudflare.com](https://pages.cloudflare.com)
2. Klik "Create a project"
3. Verbind je Git repository
4. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Environment variables:
   - `VITE_API_BASE_URL` = `https://api.excelflow.com/api`
   - `NODE_VERSION` = `18`
6. Deploy!

#### Cloudflare Pages Functions (optioneel)

Voor custom headers, maak `functions/_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
```

---

### 4. AWS S3 + CloudFront

Voor enterprise deployments met volledige controle.

#### Prerequisites

- AWS account
- AWS CLI installed en geconfigureerd
- S3 bucket aangemaakt
- CloudFront distributie aangemaakt

#### Build en Upload

```bash
# Build production
npm run build

# Sync naar S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

#### CloudFront Settings

- **Origin:** S3 bucket website endpoint
- **Default Root Object:** `index.html`
- **Error Pages:**
  - 404 → `/index.html` (200) - voor SPA routing
  - 403 → `/index.html` (200)
- **Caching:**
  - `index.html`: No cache
  - `/assets/*`: Cache 1 year

---

## Environment Variables

### Required Variables

```bash
VITE_API_BASE_URL=https://api.excelflow.com/api
```

### Optional Variables

```bash
# Maximum file size (default: 10MB)
VITE_MAX_FILE_SIZE_MB=10

# Polling interval (default: 2500ms)
VITE_POLLING_INTERVAL_MS=2500

# Upload timeout (default: 30000ms)
VITE_UPLOAD_TIMEOUT_MS=30000

# Sentry DSN for error monitoring
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Setting Variables per Platform

**Vercel:**
- Dashboard → Project Settings → Environment Variables

**Netlify:**
- Dashboard → Site Settings → Environment Variables

**Cloudflare:**
- Dashboard → Workers & Pages → Your Project → Settings → Environment Variables

---

## Security Headers

Aanbevolen security headers voor production:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.excelflow.com;
```

## Custom Domain

### DNS Configuration

Voor alle platforms:

1. Voeg A record of CNAME toe in je DNS provider
2. Wacht op DNS propagation (max 48 uur)
3. Configureer SSL certificaat (automatisch bij de meeste platforms)

**Vercel:**
- Dashboard → Project → Settings → Domains → Add Domain

**Netlify:**
- Dashboard → Domain Settings → Custom Domains → Add Custom Domain

**Cloudflare:**
- Automatic via Cloudflare DNS

## Post-Deployment Verification

Controleer na deployment:

### 1. Functionality

- [ ] Upload werkt (file picker en drag-drop)
- [ ] Progress tracking werkt
- [ ] Download werkt
- [ ] Error handling werkt

### 2. Performance

```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com --view
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

### 3. Security

- [ ] HTTPS is enforced
- [ ] Security headers aanwezig
- [ ] Content Security Policy geconfigureerd
- [ ] API calls gebruiken HTTPS

### 4. Browser Testing

Test op:
- Chrome (desktop en mobile)
- Firefox (desktop)
- Safari (desktop en iOS)
- Edge (desktop)

## Monitoring

### Error Monitoring (optioneel)

**Sentry Setup:**

```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
```

### Analytics (optioneel)

**Vercel Analytics:**
- Automatisch ingebouwd, geen code changes nodig

**Google Analytics:**

```typescript
// src/main.tsx
if (import.meta.env.PROD) {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
}
```

## Continuous Deployment

### Git-based Deployment

Alle platforms ondersteunen automatische deployment bij git push:

1. Verbind je repository (GitHub, GitLab, Bitbucket)
2. Kies production branch (meestal `main` of `master`)
3. Elke push naar deze branch triggert automatische build en deploy

### Deployment Previews

**Vercel en Netlify:**
- Automatische preview URLs voor Pull Requests
- Test changes voor merge naar production

## Rollback

### Vercel

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Netlify

Dashboard → Deploys → Click deployment → "Publish deploy"

### Manual Rollback

Alle platforms bewaren oude deployments, rollback via dashboard.

## Troubleshooting

### Build Failures

```bash
# Clear cache en rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

- Check variabele naam start met `VITE_`
- Herstart development server na wijziging
- Rebuild voor production

### 404 Errors on Refresh

Configureer fallback naar `index.html` voor SPA routing.

### Slow Initial Load

- Check bundle size in `dist/stats.html`
- Optimize code splitting
- Enable compression (Brotli/Gzip)

## Support

Voor deployment problemen:
- Check platform status pages
- Raadpleeg platform documentation
- Open support ticket bij hosting provider

---

**Last Updated:** October 2025
