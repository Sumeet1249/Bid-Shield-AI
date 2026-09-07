# 🚀 Deploying BidShield AI to Vercel

This guide will help you deploy BidShield AI to Vercel for live hosting.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended): Install with `npm install -g vercel`
3. **GitHub Repository**: Your code should be pushed to GitHub (already done ✅)

---

## 🎯 Deployment Methods

### Method 1: Deploy via Vercel Website (Easiest) 👍

1. **Go to Vercel Dashboard**
   - Visit: [vercel.com/new](https://vercel.com/new)

2. **Import Your GitHub Repository**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose: `Sumeet1249/Bid-Shield-AI`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: (leave empty)
   - **Output Directory**: `frontend`

4. **Environment Variables** (Optional)
   - Add environment variable:
     - `SECRET_KEY`: `bidshield-ai-production-secret-key-change-me`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://bid-shield-ai-[random].vercel.app`

---

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Navigate to project directory
cd s:/bid-shield-ai-main

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

Follow the CLI prompts:
- **Set up and deploy?** → Y
- **Which scope?** → Your username
- **Link to existing project?** → N
- **Project name?** → bid-shield-ai
- **Directory?** → ./ (current directory)

---

## 🔧 Configuration Files

The following files have been created for Vercel deployment:

### 1. `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/css/(.*)",
      "dest": "frontend/css/$1"
    },
    {
      "src": "/js/(.*)",
      "dest": "frontend/js/$1"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/index.html"
    }
  ]
}
```

### 2. `api/index.py`
Serverless function entry point for the Flask backend.

### 3. `requirements.txt` (root)
Python dependencies for Vercel's Python runtime.

### 4. `.vercelignore`
Files to exclude from deployment.

---

## 🌐 After Deployment

### Your Live URLs
Once deployed, you'll get:
- **Production URL**: `https://bid-shield-ai.vercel.app` (or custom domain)
- **Preview URLs**: Unique URLs for each git branch/commit

### Test Your Deployment
1. Visit your Vercel URL
2. Login with demo credentials:
   - Email: `officer@cpcl.gem.gov.in`
   - Password: `password123`
3. Test the verification pipeline

---

## ⚙️ Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `bidshield.ai`)
4. Follow DNS configuration instructions

---

## 🔄 Automatic Deployments

Once connected to GitHub:
- ✅ Every push to `main` branch → Automatic production deployment
- ✅ Every PR → Preview deployment with unique URL
- ✅ Automatic SSL certificate
- ✅ CDN caching for frontend assets

---

## ⚠️ Important Notes

### Database Limitations
- **SQLite in Vercel**: The database is ephemeral (resets on each deployment)
- **For Production**: Consider using:
  - **PostgreSQL**: Vercel Postgres, Railway, Supabase
  - **MySQL**: PlanetScale
  - **MongoDB**: MongoDB Atlas

### Update Database Configuration
For persistent database, update `backend/app/config.py`:

```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
    
    # For production with PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///bidshield.db'  # Fallback for local dev
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = '/tmp/uploads'  # Vercel uses /tmp for temporary storage
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
```

Then add `DATABASE_URL` environment variable in Vercel dashboard.

---

## 🐛 Troubleshooting

### Issue: API calls fail
**Solution**: Check browser console for CORS errors. The Flask app has CORS enabled, but verify the API URL is correct.

### Issue: Database not persisting
**Solution**: This is expected with SQLite on Vercel. Use an external database for production.

### Issue: Build fails
**Solution**: Check Vercel build logs. Common issues:
- Missing dependencies in `requirements.txt`
- Python version incompatibility
- Import errors

### Issue: Frontend loads but shows errors
**Solution**: 
1. Check if API endpoint is working: `https://your-app.vercel.app/api/health`
2. Verify the `API` constant in `frontend/js/app.js` is using the correct URL

---

## 📊 Vercel Features You Get

- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Automatic HTTPS**: SSL certificate included
- ✅ **Auto Scaling**: Handles traffic spikes
- ✅ **Analytics**: Track page views and performance
- ✅ **Edge Functions**: Fast serverless API
- ✅ **Git Integration**: Auto-deploy on push
- ✅ **Preview Deployments**: Test before production

---

## 💡 Tips for Better Performance

1. **Enable Caching**
   - Add cache headers for static assets
   - Use Vercel's Edge Network

2. **Optimize Images**
   - Use WebP format
   - Enable Vercel Image Optimization

3. **Monitor Performance**
   - Enable Vercel Analytics
   - Track API response times

4. **Environment Variables**
   - Set `FLASK_ENV=production`
   - Add `SECRET_KEY` for security

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## ✅ Deployment Checklist

Before going live:

- [ ] Test all API endpoints
- [ ] Verify frontend loads correctly
- [ ] Test login functionality
- [ ] Test verification pipeline
- [ ] Check responsive design on mobile
- [ ] Configure custom domain (optional)
- [ ] Set up external database (recommended)
- [ ] Add environment variables
- [ ] Enable Vercel Analytics
- [ ] Test with real users

---

**🎉 Your BidShield AI is now ready for the world!**

