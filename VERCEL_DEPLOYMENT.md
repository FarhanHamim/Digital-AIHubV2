# Vercel Deployment Guide

This guide will help you deploy the UNDP Digital & AI Hub frontend to Vercel.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account
- Your code pushed to a repository
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your Supabase project URL and anon key

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Sign Up / Sign In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Sign in with your GitHub/GitLab/Bitbucket account (recommended)

### 3. Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Import your Git repository
3. Vercel will automatically detect it's a Vite project

### 4. Configure Project Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Add Environment Variables

In the Vercel project settings, go to **Settings** → **Environment Variables** and add:

#### Required Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Optional Variables (if you have Firebase config):

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

**Important**: 
- Add these for **Production**, **Preview**, and **Development** environments
- Click "Save" after adding each variable

### 6. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-3 minutes)
3. Your site will be live at `https://your-project.vercel.app`

### 7. Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to your main/master branch
- **Preview**: Every pull request gets its own preview URL

## Environment Variables Management

### Adding Variables via Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add variable name and value
3. Select environments (Production, Preview, Development)
4. Click **Save**

### Adding Variables via Vercel CLI:
```bash
vercel env add VITE_SUPABASE_URL
# Enter the value when prompted
```

## Troubleshooting

### Build Fails

1. **Check Build Logs**: Go to your deployment → "View Function Logs"
2. **Common Issues**:
   - Missing environment variables
   - Build command errors
   - Dependency installation issues

### Environment Variables Not Working

- Make sure variables start with `VITE_` prefix
- Redeploy after adding new variables
- Check that variables are added to the correct environment (Production/Preview)

### Routing Issues (404 on refresh)

- The `vercel.json` file handles this with rewrites
- If issues persist, check that `vercel.json` is in the root directory

### Build Timeout

- Vercel free tier: 45 seconds build timeout
- If your build takes longer, consider optimizing dependencies

## Updating Your Deployment

Simply push to your repository:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Start a new build
3. Deploy the updated version

## Vercel CLI (Optional)

Install Vercel CLI for local testing:
```bash
npm i -g vercel
```

Deploy from command line:
```bash
vercel
```

## Performance Tips

1. **Enable Edge Caching**: Already configured in `vercel.json`
2. **Optimize Images**: Use Vercel's Image Optimization
3. **Enable Analytics**: Go to Settings → Analytics (free tier available)

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Quick Checklist

- [ ] Code pushed to Git repository
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added
- [ ] Build settings verified
- [ ] First deployment successful
- [ ] Custom domain configured (optional)
