# Deployment Guide

How to deploy updates to the NymAI landing page.

## Prerequisites

- Vercel account (or alternative hosting platform)
- Git repository access
- Environment variables configured (if needed)

## Deployment Options

### Vercel (Recommended)

**Automatic Deployment:**
1. Connect GitHub repository to Vercel
2. Vercel automatically deploys on push to main branch
3. Preview deployments created for pull requests

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables:**
1. Go to Vercel Dashboard → Project Settings
2. Navigate to "Environment Variables"
3. Add variables:
   - `VITE_SUPABASE_URL` (optional, has defaults)
   - `VITE_SUPABASE_ANON_KEY` (optional, has defaults)

**Configuration:**
The `vercel.json` file includes:
- Security headers (CSP, X-Frame-Options, etc.)
- SPA routing configuration
- All necessary security settings

### Netlify

**Via Netlify Dashboard:**
1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy

**Via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Add Headers:**
Create `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; ..."
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### GitHub Pages

**Via GitHub Actions:**
1. Create `.github/workflows/deploy.yml`
2. Configure build and deploy steps
3. Push to trigger deployment

**Manual:**
```bash
npm run build
# Upload dist/ folder contents to GitHub Pages
```

### Other Platforms

The `dist` folder contains static files deployable to:
- **AWS S3 + CloudFront**
- **Google Cloud Storage**
- **Azure Static Web Apps**
- **Any static hosting service**

## Build Process

**Development Build:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
```

Creates optimized files in `dist/` directory:
- Minified JavaScript
- Optimized CSS
- Compressed assets
- Source maps (for debugging)

**Preview Production Build:**
```bash
npm run preview
```

## Post-Deployment Checklist

- [ ] Verify site loads correctly
- [ ] Test OAuth flow with extension
- [ ] Check CSP headers in browser DevTools
- [ ] Verify all links work
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify environment variables are set (if used)

## Rollback

**Vercel:**
- Go to Deployments → Select previous deployment → Promote to Production

**Netlify:**
- Go to Deploys → Select previous deploy → Publish deploy

**GitHub Pages:**
- Revert to previous commit and rebuild

## Monitoring

- Check Vercel/Netlify dashboard for deployment status
- Monitor error logs in hosting platform
- Use browser DevTools to check for CSP violations
- Monitor analytics for user issues

