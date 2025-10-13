# 🚀 Deployment Guide - AI Resume & Portfolio Builder

This guide will walk you through deploying your AI Resume & Portfolio Builder with:
- **Frontend** on GitHub Pages (free static hosting)
- **Backend** on Render or Railway (free Flask hosting)

## 📋 Prerequisites

- GitHub account
- Render account (render.com) OR Railway account (railway.app)
- OpenAI API key
- Git installed locally

## 🔧 Pre-Deployment Setup

### 1. Prepare Your Project Structure

Ensure your project has this structure:
```
AI Resume & Portfolio Builder/
├── frontend/                 # Frontend files for GitHub Pages
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── README.md
├── backend/                  # Backend files for Render/Railway
│   ├── app.py
│   ├── requirements.txt
│   └── README.md
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

### 2. Separate Frontend and Backend

First, let's create separate directories for deployment:

```bash
# Create directories
mkdir frontend backend

# Copy frontend files
cp index.html style.css script.js frontend/
cp README.md frontend/

# Copy backend files  
cp app.py requirements.txt backend/
cp README.md backend/
```

### 3. Update Frontend Configuration

Edit `frontend/script.js` to point to your deployed backend:

```javascript
// Replace this line in script.js
const response = await fetch('/generate', {

// With your deployed backend URL
const response = await fetch('https://your-app-name.onrender.com/generate', {
// OR for Railway:
// const response = await fetch('https://your-app-name.railway.app/generate', {
```

## 🌐 Part 1: Deploy Frontend to GitHub Pages

### Step 1: Create Frontend Repository

1. **Create a new GitHub repository** for frontend:
   - Repository name: `ai-resume-builder-frontend`
   - Make it public
   - Don't initialize with README (we'll add our own)

### Step 2: Push Frontend Code

```bash
# Navigate to frontend directory
cd frontend

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - AI Resume Builder Frontend"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-builder-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Click Settings** tab
3. **Scroll down to Pages** section
4. **Source**: Select "Deploy from a branch"
5. **Branch**: Select "main"
6. **Folder**: Select "/ (root)"
7. **Click Save**

### Step 4: Access Your Frontend

- Your site will be available at: `https://YOUR_USERNAME.github.io/ai-resume-builder-frontend/`
- It may take a few minutes to deploy

## 🖥️ Part 2A: Deploy Backend to Render

### Step 1: Create Backend Repository

1. **Create another GitHub repository** for backend:
   - Repository name: `ai-resume-builder-backend`
   - Make it public

### Step 2: Push Backend Code

```bash
# Navigate to backend directory
cd ../backend

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - AI Resume Builder Backend"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-builder-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub** repository (`ai-resume-builder-backend`)
4. **Configure the service**:
   - **Name**: `ai-resume-builder-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

### Step 4: Add Environment Variables

In Render dashboard:
1. **Go to your service** → **Environment**
2. **Add environment variable**:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `your_openai_api_key_here`
3. **Optional variables**:
   - `OPENAI_MODEL=gpt-3.5-turbo`
   - `MAX_TOKENS=2000`
   - `TEMPERATURE=0.7`

### Step 5: Update Frontend URL

Update `frontend/script.js` with your Render URL:
```javascript
const response = await fetch('https://ai-resume-builder-backend.onrender.com/generate', {
```

## 🚂 Part 2B: Deploy Backend to Railway (Alternative)

### Step 1-2: Same as Render (Create repo and push code)

### Step 3: Deploy on Railway

1. **Go to [railway.app](https://railway.app)** and sign up/login
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select your backend repository**
4. **Railway will auto-detect** it's a Python app

### Step 4: Add Environment Variables

In Railway dashboard:
1. **Go to your project** → **Variables** tab
2. **Add variables**:
   - `OPENAI_API_KEY=your_openai_api_key_here`
   - `PORT=8000` (Railway specific)
3. **Optional**:
   - `OPENAI_MODEL=gpt-3.5-turbo`
   - `MAX_TOKENS=2000`
   - `TEMPERATURE=0.7`

### Step 5: Update Frontend URL

Update `frontend/script.js` with your Railway URL:
```javascript
const response = await fetch('https://your-project-name.railway.app/generate', {
```

## 🔗 Part 3: Connect Frontend to Backend

### Step 1: Update API Endpoints in Frontend

Edit `frontend/script.js` and update ALL API calls:

```javascript
// Update all fetch calls to use your backend URL
const BACKEND_URL = 'https://your-backend-url.onrender.com'; // or railway.app

// Update the generate endpoint
const response = await fetch(`${BACKEND_URL}/generate`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(formData)
});

// Update contact form endpoint (if used)
const response = await fetch(`${BACKEND_URL}/contact`, {
    // ... rest of the code
});
```

### Step 2: Handle CORS (Already configured in app.py)

Your Flask backend already includes CORS support:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # This allows all origins
```

### Step 3: Redeploy Frontend

```bash
# In frontend directory
git add .
git commit -m "Update API endpoints to use deployed backend"
git push origin main
```

GitHub Pages will automatically redeploy your frontend.

## 🧪 Part 4: Testing Your Deployment

### Step 1: Test Backend Directly

Visit your backend health endpoint:
- Render: `https://ai-resume-builder-backend.onrender.com/api/health`
- Railway: `https://your-project-name.railway.app/api/health`

You should see:
```json
{
  "status": "healthy",
  "openai_configured": true,
  "endpoints": {...}
}
```

### Step 2: Test Frontend

1. **Visit your GitHub Pages URL**
2. **Fill out the resume form**
3. **Click "Generate AI Resume"**
4. **Verify the PDF download works**

## 🔧 Troubleshooting

### Common Issues

#### ❌ "Failed to fetch" Error
- **Cause**: CORS or wrong backend URL
- **Solution**: Check your backend URL in `script.js` and ensure CORS is enabled

#### ❌ "OpenAI API key not found"
- **Cause**: Environment variable not set
- **Solution**: Add `OPENAI_API_KEY` in your hosting platform's environment variables

#### ❌ Backend "Application Error"
- **Cause**: Missing dependencies or wrong start command
- **Solution**: Check build logs, ensure `requirements.txt` is correct

#### ❌ Long Response Times
- **Cause**: Free hosting platforms may have cold starts
- **Solution**: This is normal for free tiers - consider upgrading for production

### Backend Debugging

Add this to your `app.py` for debugging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/debug', methods=['GET'])
def debug():
    return jsonify({
        'env_vars': {
            'OPENAI_API_KEY': bool(os.getenv('OPENAI_API_KEY')),
            'PORT': os.getenv('PORT', '5000'),
            'FLASK_ENV': os.getenv('FLASK_ENV', 'production')
        }
    })
```

## 🎯 Production Optimizations

### For Better Performance

1. **Upgrade hosting plans** for faster response times
2. **Add caching** for repeated requests
3. **Implement rate limiting** to prevent abuse
4. **Add analytics** to track usage

### Security Enhancements

1. **Restrict CORS** to your frontend domain only:
```python
from flask_cors import CORS
CORS(app, origins=['https://yourusername.github.io'])
```

2. **Add request validation** and input sanitization
3. **Implement API key usage limits**

## 📱 Custom Domain (Optional)

### For Frontend (GitHub Pages)
1. **Buy a domain** (e.g., `myresumebuilder.com`)
2. **Add CNAME file** to frontend repo with your domain
3. **Configure DNS** to point to GitHub Pages
4. **Enable HTTPS** in repository settings

### For Backend (Render/Railway)
- **Render**: Add custom domain in service settings
- **Railway**: Configure custom domain in project settings

## 🔄 Continuous Deployment

Both GitHub Pages and hosting platforms offer automatic deployment:

- **Frontend**: Auto-deploys on every push to main branch
- **Backend**: Auto-deploys on every push to main branch
- **Enable branch protection** for production safety

## 📊 Monitoring & Analytics

### Track Usage
- **Google Analytics** for frontend traffic
- **Application logs** for backend monitoring
- **Error tracking** with Sentry (optional)

### Performance Monitoring
- **Render/Railway dashboards** for backend metrics
- **GitHub Insights** for repository activity

---

## 🎉 Congratulations!

Your AI Resume & Portfolio Builder is now live! 

**Frontend**: `https://yourusername.github.io/ai-resume-builder-frontend/`
**Backend**: `https://your-app.onrender.com/` or `https://your-app.railway.app/`

### Next Steps:
1. **Share your application** with friends and colleagues
2. **Gather feedback** and iterate
3. **Add new features** like multiple resume templates
4. **Consider monetization** options for advanced features

### Support:
- **GitHub Issues**: Use for bug reports and feature requests
- **Documentation**: Keep README.md updated
- **Community**: Share your project on social media!

Happy deploying! 🚀