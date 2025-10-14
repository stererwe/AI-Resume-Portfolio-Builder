#!/usr/bin/env python3
"""
AI Resume & Portfolio Builder Server Runner
Simple script to start the Flask server with automatic port detection
"""

import os
import sys
import subprocess
import socket
import webbrowser
from pathlib import Path

def is_port_available(port):
    """Check if a port is available"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return True
        except socket.error:
            return False

def find_available_port(start_port=5001, max_attempts=10):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        if is_port_available(port):
            return port
    return None

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    
    print("🚀 AI Resume & Portfolio Builder Server Runner")
    print("=" * 50)
    
    # Change to the project directory
    os.chdir(script_dir)
    
    # Check if app.py exists
    if not (script_dir / 'app.py').exists():
        print("❌ Error: app.py not found in the current directory")
        input("Press Enter to exit...")
        return
    
    # Find an available port
    port = find_available_port()
    if not port:
        print("❌ Error: Could not find an available port")
        input("Press Enter to exit...")
        return
    
    # Set environment variables
    os.environ['PORT'] = str(port)
    os.environ['FLASK_ENV'] = 'development'
    
    server_url = f"http://localhost:{port}"
    
    print(f"📍 Project Directory: {script_dir}")
    print(f"🌐 Server URL: {server_url}")
    print(f"🔧 Port: {port}")
    
    # Check for OpenAI API key
    if not os.environ.get('OPENAI_API_KEY'):
        print("\n⚠️  OpenAI API key not set. The app will use fallback content generation.")
        print("   To enable AI features, set the OPENAI_API_KEY environment variable.")
    
    print(f"\n✅ Starting server on port {port}...")
    print("   The browser will open automatically in a few seconds.")
    print("   Press Ctrl+C in this window to stop the server")
    print("-" * 50)
    
    try:
        # Start the Flask server in a subprocess
        process = subprocess.Popen([sys.executable, 'app.py'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.STDOUT,
                                 text=True,
                                 bufsize=1,
                                 universal_newlines=True)
        
        # Wait a bit for the server to start
        import time
        time.sleep(2)
        
        # Open the browser
        print(f"🌐 Opening {server_url} in your default browser...")
        webbrowser.open(server_url)
        
        # Stream the output
        for line in process.stdout:
            print(line.rstrip())
            
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down server...")
        process.terminate()
        process.wait()
        
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        
    finally:
        input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()