#!/bin/bash

# 🚀 AI Resume & Portfolio Builder - Deployment Setup Script
# This script prepares your project for deployment by organizing files

echo "🚀 Setting up AI Resume & Portfolio Builder for deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if required files exist
print_info "Checking required files..."

required_files=("index.html" "style.css" "script.js" "app.py" "requirements.txt")
missing_files=()

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    print_error "Missing required files: ${missing_files[*]}"
    print_info "Please make sure all files are in the project directory."
    exit 1
fi

print_status "All required files found!"

# Create deployment directories
print_info "Creating deployment directories..."

if [[ ! -d "frontend" ]]; then
    mkdir frontend
    print_status "Created frontend directory"
else
    print_warning "Frontend directory already exists"
fi

if [[ ! -d "backend" ]]; then
    mkdir backend
    print_status "Created backend directory"
else
    print_warning "Backend directory already exists"
fi

# Copy frontend files
print_info "Copying frontend files..."
cp index.html style.css script.js frontend/

# Create frontend README
cat > frontend/README.md << 'EOF'
# AI Resume & Portfolio Builder - Frontend

This is the frontend part of the AI Resume & Portfolio Builder, designed to be hosted on GitHub Pages.

## Files
- `index.html` - Main application interface
- `style.css` - Modern, responsive styling
- `script.js` - Frontend logic and API integration

## Deployment
This frontend is configured to work with the backend API. Make sure to update the API endpoints in `script.js` to point to your deployed backend.

## Local Development
Simply open `index.html` in a web browser, but note that API calls will fail without the backend running.

## Features
- Responsive design
- AI-powered resume generation
- PDF download capability
- Real-time form validation
- Professional navy blue theme

Built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance.
EOF

print_status "Frontend files copied and README created"

# Copy backend files
print_info "Copying backend files..."
cp app.py requirements.txt backend/

# Create backend README
cat > backend/README.md << 'EOF'
# AI Resume & Portfolio Builder - Backend

Flask backend API for the AI Resume & Portfolio Builder application.

## Files
- `app.py` - Flask application with OpenAI integration
- `requirements.txt` - Python dependencies

## Environment Variables Required
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `OPENAI_MODEL` - AI model to use (optional, defaults to gpt-3.5-turbo)
- `MAX_TOKENS` - Maximum tokens for AI responses (optional, defaults to 2000)
- `TEMPERATURE` - AI response creativity (optional, defaults to 0.7)

## Endpoints
- `GET /` - Serve main application (redirects to frontend)
- `POST /generate` - Generate AI resume content
- `POST /contact` - Handle contact form submissions
- `GET /api/health` - Health check and system info

## Deployment
Configured for deployment on Render, Railway, or similar Flask hosting platforms.

## Local Development
```bash
pip install -r requirements.txt
export OPENAI_API_KEY="your_key_here"
python app.py
```

The server will start on http://localhost:5000
EOF

print_status "Backend files copied and README created"

# Update script.js with placeholder for backend URL
print_info "Creating deployment version of script.js..."

# Create a deployment version with placeholder
sed 's|/generate|BACKEND_URL_PLACEHOLDER/generate|g; s|/contact|BACKEND_URL_PLACEHOLDER/contact|g' script.js > frontend/script.js.deploy

# Create the regular version for local development
cp script.js frontend/

cat > frontend/update-api-endpoints.md << 'EOF'
# Update API Endpoints for Deployment

After deploying your backend, you need to update the API endpoints in `script.js`.

## Steps:
1. Deploy your backend and get the URL (e.g., https://your-app.onrender.com)
2. Open `script.js` in the frontend directory
3. Replace all instances of:
   - `/generate` with `https://your-backend-url.onrender.com/generate`
   - `/contact` with `https://your-backend-url.onrender.com/contact`

## Example:
```javascript
// Before
const response = await fetch('/generate', {

// After
const response = await fetch('https://ai-resume-builder.onrender.com/generate', {
```

Alternatively, you can define a constant at the top of the file:
```javascript
const BACKEND_URL = 'https://your-backend-url.onrender.com';
const response = await fetch(`${BACKEND_URL}/generate`, {
```
EOF

print_status "API endpoint update instructions created"

# Create .env.example file
cat > backend/.env.example << 'EOF'
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional Configuration (with defaults)
OPENAI_MODEL=gpt-3.5-turbo
MAX_TOKENS=2000
TEMPERATURE=0.7

# Flask Configuration
FLASK_ENV=production
PORT=5000
EOF

print_status "Environment variables example created"

# Create simple deployment checklist
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# 🚀 Deployment Checklist

## Before You Start
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Create GitHub account
- [ ] Create Render account (render.com) OR Railway account (railway.app)

## Frontend Deployment (GitHub Pages)
- [ ] Create GitHub repository for frontend (`ai-resume-builder-frontend`)
- [ ] Push frontend files to repository
- [ ] Enable GitHub Pages in repository settings
- [ ] Test frontend URL: `https://yourusername.github.io/ai-resume-builder-frontend/`

## Backend Deployment (Render/Railway)
- [ ] Create GitHub repository for backend (`ai-resume-builder-backend`)
- [ ] Push backend files to repository
- [ ] Deploy on Render or Railway
- [ ] Add OPENAI_API_KEY environment variable
- [ ] Test backend health endpoint: `/api/health`

## Connect Frontend to Backend
- [ ] Get deployed backend URL
- [ ] Update API endpoints in `frontend/script.js`
- [ ] Commit and push frontend changes
- [ ] Test full application functionality

## Final Testing
- [ ] Fill out resume form
- [ ] Generate AI resume content
- [ ] Test PDF download
- [ ] Test contact form (if implemented)
- [ ] Test on mobile devices

## Optional Enhancements
- [ ] Custom domain setup
- [ ] Analytics integration
- [ ] Error monitoring
- [ ] Performance optimization

## 🎉 Launch!
- [ ] Share your application
- [ ] Gather user feedback
- [ ] Plan future features
EOF

print_status "Deployment checklist created"

# Final summary
echo ""
print_info "🎉 Deployment setup complete!"
echo ""
print_info "Directory structure:"
echo "  📁 frontend/     - Ready for GitHub Pages"
echo "  📁 backend/      - Ready for Render/Railway"
echo "  📄 .gitignore    - Git ignore rules"
echo "  📄 DEPLOYMENT.md - Detailed deployment guide"
echo "  📄 DEPLOYMENT_CHECKLIST.md - Quick checklist"
echo ""
print_warning "Next steps:"
echo "  1. Follow the deployment guide in DEPLOYMENT.md"
echo "  2. Set up your OpenAI API key"
echo "  3. Deploy frontend to GitHub Pages"
echo "  4. Deploy backend to Render or Railway"
echo "  5. Update API endpoints in frontend/script.js"
echo ""
print_status "Happy deploying! 🚀"
EOF