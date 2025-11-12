# Deployment Guide - BAG Address Validation Frontend

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] Backend API endpoints verified
- [ ] CORS configured on backend
- [ ] Build optimized and minified

## Build Process

### 1. Production Build

```bash
npm run build
```

This command:
1. Runs TypeScript compiler (`tsc`)
2. Builds production bundle with Vite
3. Outputs to `dist/` directory

### 2. Verify Build

```bash
npm run preview
```

Test the production build locally before deploying.

## Environment Configuration

### Development
File: `.env.development`
```
VITE_BAG_API_BASE_URL=http://localhost:8000
```

### Production
File: `.env.production`
```
VITE_BAG_API_BASE_URL=https://api.production-domain.com
```

**Important**: Update production URL before building.

## Deployment Options

### Option 1: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `VITE_BAG_API_BASE_URL`

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configure Environment Variables**
   - Netlify dashboard
   - Site settings → Environment variables
   - Add `VITE_BAG_API_BASE_URL`

### Option 3: AWS S3 + CloudFront

1. **Build**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Create CloudFront Distribution**
   - Point to S3 bucket
   - Configure custom domain
   - Enable HTTPS
   - Set cache policies

4. **Invalidate Cache After Deploy**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

### Option 4: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   server {
     listen 80;
     location / {
       root /usr/share/nginx/html;
       try_files $uri /index.html;
     }
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t bag-validation .
   docker run -p 80:80 bag-validation
   ```

## CORS Configuration

Backend must allow frontend origin:

```javascript
// Express example
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
```

## CDN Setup (Optional)

For better performance, serve static assets via CDN:

1. Upload `dist/assets/` to CDN
2. Update asset paths in `index.html`
3. Configure cache headers:
   - JS/CSS: `max-age=31536000` (1 year)
   - HTML: `max-age=0, must-revalidate`

## Caching Strategy

### Static Assets
```
Cache-Control: public, max-age=31536000, immutable
```

### HTML
```
Cache-Control: no-cache, no-store, must-revalidate
```

## Monitoring Setup

### 1. Error Tracking (Sentry)

```bash
npm install @sentry/react
```

Add to `main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### 2. Analytics (Optional)

Add Google Analytics or similar to `index.html`.

## Post-Deployment Validation

### Smoke Tests

1. **Upload Test**
   - Upload valid .xlsx file
   - Verify upload succeeds

2. **Validation Test**
   - Wait for validation to complete
   - Check progress updates

3. **Download Test**
   - Click download button
   - Verify file downloads

4. **Error Test**
   - Upload invalid file (.pdf)
   - Verify error message displays

### Performance Check

1. Run Lighthouse audit
2. Check bundle size: `npm run build -- --report`
3. Verify initial load < 2 seconds
4. Check API response times

## Rollback Procedure

### Vercel/Netlify
1. Go to deployments page
2. Select previous deployment
3. Click "Rollback"

### AWS S3
1. Restore previous version from S3 versioning
2. Invalidate CloudFront cache

### Docker
1. Pull previous image tag
2. Restart container with previous version

## Troubleshooting Deployment Issues

### Build Fails

**Check:**
- Node version (18+ or 20+)
- TypeScript errors: `npm run lint`
- Dependencies installed: `npm install`

### API Connection Fails

**Check:**
- Environment variable set correctly
- CORS configured on backend
- Backend is running and accessible
- Network/firewall not blocking requests

### Assets Not Loading

**Check:**
- Base path configuration in `vite.config.ts`
- Asset paths in build output
- CDN configuration (if using)

## Security Considerations

1. **HTTPS Only**: Always deploy with HTTPS
2. **Environment Variables**: Never commit secrets
3. **CSP Headers**: Configure Content Security Policy
4. **Rate Limiting**: Monitor for abuse
5. **Input Validation**: Client-side validation only for UX

## Maintenance

### Updating Dependencies

```bash
npm outdated
npm update
npm audit fix
```

### Monitoring Logs

- Check backend API logs for errors
- Monitor frontend error tracking (Sentry)
- Review user feedback

## Contact

For deployment issues, contact DevOps team.
