@echo off
REM AI Resume & Portfolio Builder Server Startup Script for Windows
REM Usage: start-server.bat [port]

title AI Resume & Portfolio Builder Server

REM Default port
set DEFAULT_PORT=5001
if "%1"=="" (set PORT=%DEFAULT_PORT%) else (set PORT=%1)

echo.
echo 🚀 Starting AI Resume & Portfolio Builder...
echo Server Port: %PORT%
echo Server URL: http://localhost:%PORT%
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if requirements are installed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing required packages...
    pip install -r requirements.txt
)

REM Set environment variables
set FLASK_ENV=development

REM Check for OpenAI API key
if "%OPENAI_API_KEY%"=="" (
    echo ⚠️  OpenAI API key not set. The app will use fallback content generation.
    echo    To enable AI features, set your API key:
    echo    set OPENAI_API_KEY=your_api_key_here
    echo.
)

echo ✅ Starting server...
echo    Open your browser and go to: http://localhost:%PORT%
echo    Press Ctrl+C to stop the server
echo.

REM Start the Flask server
python app.py

pause