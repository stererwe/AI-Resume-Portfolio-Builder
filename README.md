# 🤖 AI Resume & Portfolio Builder

A modern web application that leverages artificial intelligence to create professional resumes, skill highlights, cover letters, and portfolio bios. Built with Flask backend and vanilla JavaScript frontend, powered by OpenAI's GPT models.

![AI Resume Builder](https://img.shields.io/badge/AI-Powered-blue) ![Flask](https://img.shields.io/badge/Flask-3.0.0-green) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5--turbo-orange) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

- **🎯 AI-Powered Content Generation**
  - Professional resume summaries
  - Categorized skill highlights
  - Compelling cover letter paragraphs
  - Engaging portfolio bios

- **🎨 Modern Web Interface**
  - Responsive design for all devices
  - Clean, professional UI with navy blue theme
  - Real-time form validation
  - Smooth animations and transitions

- **🚀 Smart Technology**
  - OpenAI GPT-3.5-turbo/GPT-4 integration
  - Fallback content generation when AI unavailable
  - ATS-friendly resume formatting
  - Comprehensive error handling

- **📱 User Experience**
  - Step-by-step form sections
  - Loading states and progress indicators
  - Downloadable resume content
  - Mobile-friendly interface

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Integration**: OpenAI API (GPT-3.5-turbo/GPT-4)
- **Styling**: Custom CSS with modern design patterns
- **Server**: Gunicorn (Production)

## 📋 Prerequisites

- Python 3.8 or higher
- OpenAI API key (optional but recommended for AI features)
- Modern web browser

## 🚀 Quick Start

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd "AI Resume & Portfolio Builder"
```

Or download and extract the project files to a folder named "AI Resume & Portfolio Builder".

### 2. Set Up Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- Flask-CORS (cross-origin support)
- OpenAI (AI integration)
- Requests (HTTP client)
- Gunicorn (production server)
- Other supporting packages

### 4. Configure OpenAI API Key

#### Option A: Environment Variable (Recommended)
```bash
export OPENAI_API_KEY="your_api_key_here"
```

#### Option B: Create .env File
Create a `.env` file in the project root:
```
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
MAX_TOKENS=2000
TEMPERATURE=0.7
```

#### How to Get OpenAI API Key:
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Go to API Keys section
4. Create a new API key
5. Copy and use the key in your environment

### 5. Run the Application

#### 🎯 Easy Ways to Start the Server:

**Option 1: Use the convenience scripts (Recommended)**

```bash
# On macOS/Linux:
./start-server.sh

# On Windows:
start-server.bat

# Or use the Python runner (works on all platforms):
python3 run-server.py
```

**Option 2: Manual startup**

```bash
# If port 5000 is busy (common on macOS), use a different port:
PORT=5001 python3 app.py

# Or the standard way:
python3 app.py
```

The application will start and automatically find an available port (usually `http://localhost:5001` on macOS)

You should see output like:
```
🚀 AI Resume & Portfolio Builder Server Starting...

Server will be available at: http://localhost:5000
Debug mode: True
OpenAI API configured: True
OpenAI Model: gpt-3.5-turbo

Available Endpoints:
• GET  /                 → Main application
• POST /generate         → Generate AI content (NEW)
• POST /generate-resume  → Legacy resume generation  
• POST /contact          → Contact form
• GET  /api/health       → Health check
```

## 📖 How to Use

### 1. Open the Application
Navigate to `http://localhost:5000` in your web browser.

### 2. Fill Out the Resume Form
The form is organized into 6 sections:

#### **Section 1: Personal Information**
- Full Name (required)
- Email Address (required)
- Phone Number
- Location

#### **Section 2: Career Objective**
- Career Objective (your goals and aspirations)
- Target Job Title (required)

#### **Section 3: Professional Experience**
- Work Experience (company names, roles, achievements)
- Use bullet points and specific metrics when possible

#### **Section 4: Skills & Expertise**
- Technical & Soft Skills (required)
- Separate skills with commas
- Include both technical and soft skills

#### **Section 5: Education**
- Educational Background
- Include degree, institution, graduation year
- Add relevant coursework or honors

#### **Section 6: Key Achievements**
- Notable Achievements
- Awards, certifications, recognitions
- Use specific numbers and metrics

### 3. Generate Your Content
Click the **"Generate AI Resume"** button to create:
- Complete formatted resume
- Professional summary section
- Organized skill highlights
- Cover letter paragraph
- Portfolio bio text

### 4. Review and Download
- Review the generated content
- Use the "Edit Resume" button to make changes
- Click "Download PDF" to save your resume
- Copy individual sections for use elsewhere

## 🎨 Customization

### Changing AI Models
Set environment variables to customize AI behavior:
```bash
export OPENAI_MODEL="gpt-4"           # Use GPT-4 instead of GPT-3.5-turbo
export MAX_TOKENS="3000"              # Increase output length
export TEMPERATURE="0.5"              # Make output more focused
```

### Color Scheme
The application uses a professional navy blue theme. To customize:
1. Edit `style.css`
2. Modify the CSS custom properties in the `:root` section
3. Update color variables like `--navy-blue`, `--navy-light`, etc.

## 🔧 API Endpoints

### Main Application
- `GET /` - Serve the main application

### AI Content Generation
- `POST /generate` - Generate comprehensive AI content
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "jobTitle": "Software Engineer",
    "skills": "JavaScript, Python, React",
    "experience": "5 years of web development...",
    "education": "BS Computer Science...",
    "achievements": "Led team of 5 developers..."
  }
  ```

### Utility Endpoints
- `POST /contact` - Submit contact form
- `GET /api/health` - Health check and system info

## 🚨 Troubleshooting

### Common Issues

#### "OpenAI API key not found" Warning
- **Cause**: OPENAI_API_KEY environment variable not set
- **Solution**: Set the API key using `export OPENAI_API_KEY="your_key"`
- **Note**: App will still work with fallback content generation

#### "Failed to fetch" Error
- **Cause**: Flask server not running or wrong URL
- **Solution**: Ensure Flask app is running on `http://localhost:5000`

#### Form Validation Errors
- **Cause**: Missing required fields
- **Solution**: Fill in all fields marked with red asterisk (*)

#### Slow Response Times
- **Cause**: OpenAI API latency or rate limiting
- **Solution**: Wait a moment and try again, or consider upgrading API plan

### Development Mode
Run with debug mode for detailed error messages:
```bash
export FLASK_ENV=development
python app.py
```

## 📁 Project Structure

```
AI Resume & Portfolio Builder/
├── app.py                 # Flask backend server
├── index.html            # Main application interface
├── style.css             # Styling and responsive design
├── script.js             # Frontend JavaScript logic
├── requirements.txt      # Python dependencies
└── README.md            # This documentation
```

## 🌟 Features in Detail

### AI-Powered Content Generation
- **Resume Summary**: Professional 3-4 sentence overview
- **Skill Highlights**: Categorized and optimized skill presentation
- **Cover Letter**: Compelling opening paragraph for job applications
- **Portfolio Bio**: Third-person professional biography

### Professional Design
- Modern navy blue and white color scheme
- Responsive layout for desktop, tablet, and mobile
- Smooth animations and hover effects
- Accessibility-compliant design

### Smart Form Validation
- Real-time field validation
- Clear error messages with guidance
- Required field indicators
- Email format checking

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome! 

## 📄 License

This project is for educational and personal use.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all dependencies are installed correctly
3. Verify your OpenAI API key is set properly
4. Check the Flask server logs for detailed error messages

---

**Built with ❤️ using Flask, OpenAI, and modern web technologies**

*Last updated: January 2024*