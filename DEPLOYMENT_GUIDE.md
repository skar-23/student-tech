# 🚀 Complete Deployment Guide

## 🎯 Quick Start (Follow these exact steps)

### 1. Add Secrets to GitHub Repository
1. Go to your GitHub repository: `https://github.com/skar-23/student-tech`
2. Click **Settings** → **Secrets and Variables** → **Actions**
3. Click **New repository secret** and add these three secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API |
| `VITE_RESEND_API_KEY` | Your Resend API key | Resend Dashboard → API Keys |

### 2. Merge Feature Branch to Main
Since you're currently on branch `copilot/fix-08d19295-8934-42da-b328-85a8d87acb66`, you need to merge it to `main` to trigger deployment.

**Option A: Using GitHub Web Interface (Easiest)**
1. Go to your repository on GitHub
2. Click **Pull requests** → **New pull request**
3. Set base branch to `main` and compare branch to `copilot/fix-08d19295-8934-42da-b328-85a8d87acb66`
4. Click **Create pull request** → Add title/description → **Create pull request**
5. Click **Merge pull request** → **Confirm merge**

**Option B: Using Command Line**
```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes (in case there are any)
git pull origin main

# 3. Merge your feature branch
git merge copilot/fix-08d19295-8934-42da-b328-85a8d87acb66

# 4. Push to main (this triggers deployment)
git push origin main
```

### 3. Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### 4. Monitor Deployment
1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 2-3 minutes)
4. Your site will be live at: `https://skar-23.github.io/student-tech/`

## 🔍 Troubleshooting

### Build Fails
- Check the Actions tab for error details
- Ensure all three secrets are properly set
- Verify secret names match exactly (case-sensitive)

### Site Not Loading
- Check if GitHub Pages is enabled in Settings
- Wait a few minutes after deployment completes
- Try accessing the site in incognito mode

### Email Not Working
- Verify your Resend API key is correct
- Check Resend dashboard for API usage/errors
- Ensure your domain is verified in Resend (if using custom domain)

## 🔐 Security Warning

**CRITICAL**: Your Resend API key is currently exposed in the client-side code. This means anyone can see it in browser developer tools.

### Immediate Actions:
1. ✅ Rotate your Resend API key after deployment
2. ✅ Monitor usage in Resend dashboard
3. ✅ Set up usage limits/alerts in Resend

### Future Security Improvements:
1. Move email sending to Supabase Edge Functions
2. Use Vercel/Netlify serverless functions
3. Remove `VITE_` prefix from sensitive keys

## 🌐 Alternative Deployment Options

### Vercel (More Secure)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Automatic deployments on push

### Netlify
1. Connect GitHub repo to Netlify
2. Build settings: `npm run build` → `dist`
3. Add environment variables in Netlify dashboard

## 📞 Need Help?

If deployment fails or you encounter issues:
1. Check the Actions tab for detailed error logs
2. Verify all secrets are set correctly
3. Try re-running the failed workflow
4. Check this guide for troubleshooting steps

## ✅ Success Checklist

- [ ] GitHub secrets added (all 3)
- [ ] Feature branch merged to main
- [ ] GitHub Pages enabled
- [ ] Deployment workflow completed
- [ ] Site accessible at GitHub Pages URL
- [ ] Email functionality tested
- [ ] API key rotated for security