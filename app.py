from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os
from datetime import datetime
import logging
import json
from typing import Dict, Any, Optional

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI API configuration
# Make sure to set your OpenAI API key as an environment variable
# export OPENAI_API_KEY="your_api_key_here"
openai.api_key = os.getenv('OPENAI_API_KEY')

if not openai.api_key:
    logger.warning("OpenAI API key not found. Please set OPENAI_API_KEY environment variable.")

# OpenAI model configuration
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
MAX_TOKENS = int(os.getenv('MAX_TOKENS', '2000'))
TEMPERATURE = float(os.getenv('TEMPERATURE', '0.7'))

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/generate', methods=['POST'])
def generate_content():
    """Generate comprehensive resume and portfolio content using OpenAI"""
    try:
        # Get and validate JSON data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'jobTitle']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        logger.info(f"Generating content for {data.get('fullName')} - {data.get('jobTitle')}")
        
        # Check if OpenAI API key is available
        if not openai.api_key:
            logger.warning("Using fallback content generation (no OpenAI API key)")
            return generate_fallback_content(data)
        
        try:
            # Generate all content sections using OpenAI
            content_sections = generate_ai_content(data)
            
            # Combine into full resume
            full_resume = create_full_resume(data, content_sections)
            
            response_data = {
                'success': True,
                'resume': full_resume,
                'resumeSummary': content_sections['resume_summary'],
                'skillHighlights': content_sections['skill_highlights'],
                'coverLetter': content_sections['cover_letter'],
                'portfolioBio': content_sections['portfolio_bio'],
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Successfully generated content for {data.get('fullName')}")
            return jsonify(response_data)
            
        except Exception as openai_error:
            logger.error(f"OpenAI API error: {str(openai_error)}")
            
            # Fallback to template-based generation
            fallback_response = generate_fallback_content(data)
            fallback_data = fallback_response.get_json() if hasattr(fallback_response, 'get_json') else fallback_response[0].get_json()
            fallback_data['message'] = 'Content generated using fallback method due to API issue'
            
            return jsonify(fallback_data)
        
    except Exception as e:
        logger.error(f"Error in generate endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate content. Please try again.'
        }), 500

@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    try:
        # Get data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'jobTitle']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract form data
        full_name = data.get('fullName', '')
        email = data.get('email', '')
        phone = data.get('phone', '')
        location = data.get('location', '')
        job_title = data.get('jobTitle', '')
        experience = data.get('experience', '')
        skills = data.get('skills', '')
        education = data.get('education', '')
        
        # Create prompt for OpenAI
        prompt = f"""
        Create a professional resume for the following person. Format it in a clean, ATS-friendly structure:

        Personal Information:
        - Name: {full_name}
        - Email: {email}
        - Phone: {phone}
        - Location: {location}
        
        Target Job Title: {job_title}
        
        Professional Experience:
        {experience if experience else 'No experience provided'}
        
        Skills:
        {skills if skills else 'No skills provided'}
        
        Education:
        {education if education else 'No education provided'}
        
        Please create a well-formatted, professional resume that highlights the candidate's strengths and is optimized for the target job title. Include:
        1. A compelling professional summary
        2. Organized work experience with bullet points showing achievements
        3. A clean skills section
        4. Properly formatted education section
        5. Use action verbs and quantify achievements where possible
        
        Format the output as clean text with clear section headers and bullet points.
        """
        
        # Check if OpenAI API key is available
        if not openai.api_key:
            # Fallback response when no API key is available
            resume_text = generate_fallback_resume(data)
            return jsonify({
                'success': True,
                'resume': resume_text,
                'message': 'Resume generated using fallback method (OpenAI API key not configured)'
            })
        
        # Generate resume using OpenAI
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional resume writer with expertise in creating ATS-friendly resumes that get candidates interviews."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            resume_text = response.choices[0].message.content.strip()
            
            logger.info(f"Resume generated successfully for {full_name}")
            
            return jsonify({
                'success': True,
                'resume': resume_text
            })
            
        except Exception as openai_error:
            logger.error(f"OpenAI API error: {str(openai_error)}")
            
            # Fallback to template-based resume
            resume_text = generate_fallback_resume(data)
            return jsonify({
                'success': True,
                'resume': resume_text,
                'message': 'Resume generated using fallback method due to API issue'
            })
        
    except Exception as e:
        logger.error(f"Error generating resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate resume. Please try again.'
        }), 500

def generate_ai_content(data: Dict[str, Any]) -> Dict[str, str]:
    """Generate all content sections using OpenAI API"""
    
    # Prepare user context
    user_context = prepare_user_context(data)
    
    content_sections = {}
    
    # Generate resume summary
    content_sections['resume_summary'] = generate_resume_summary(user_context)
    
    # Generate skill highlights
    content_sections['skill_highlights'] = generate_skill_highlights(user_context)
    
    # Generate cover letter
    content_sections['cover_letter'] = generate_cover_letter(user_context)
    
    # Generate portfolio bio
    content_sections['portfolio_bio'] = generate_portfolio_bio(user_context)
    
    return content_sections

def prepare_user_context(data: Dict[str, Any]) -> str:
    """Prepare user context for OpenAI prompts"""
    context_parts = []
    
    context_parts.append(f"Name: {data.get('fullName', '')}")
    context_parts.append(f"Target Job Title: {data.get('jobTitle', '')}")
    
    if data.get('careerObjective'):
        context_parts.append(f"Career Objective: {data.get('careerObjective')}")
    
    if data.get('experience'):
        context_parts.append(f"Professional Experience: {data.get('experience')}")
    
    if data.get('skills'):
        context_parts.append(f"Skills: {data.get('skills')}")
    
    if data.get('education'):
        context_parts.append(f"Education: {data.get('education')}")
    
    if data.get('achievements'):
        context_parts.append(f"Key Achievements: {data.get('achievements')}")
    
    return "\n".join(context_parts)

def call_openai_api(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str:
    """Make a call to OpenAI API with error handling"""
    try:
        response = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=max_tokens,
            temperature=TEMPERATURE,
            top_p=0.9,
            frequency_penalty=0.1,
            presence_penalty=0.1
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"OpenAI API call failed: {str(e)}")
        raise

def generate_resume_summary(user_context: str) -> str:
    """Generate a professional resume summary"""
    system_prompt = """
    You are a professional resume writer with 10+ years of experience. Create a compelling 
    professional summary that highlights the candidate's key strengths, experience, and career objectives. 
    The summary should be 3-4 sentences, ATS-friendly, and tailored to their target role.
    """
    
    user_prompt = f"""
    Based on the following candidate information, write a professional resume summary:
    
    {user_context}
    
    Write a concise, impactful professional summary that would appeal to hiring managers 
    and ATS systems. Focus on quantifiable achievements and relevant skills.
    """
    
    return call_openai_api(system_prompt, user_prompt, 300)

def generate_skill_highlights(user_context: str) -> str:
    """Generate skill highlights section"""
    system_prompt = """
    You are a career counselor specializing in skill assessment and presentation. 
    Create a well-organized skills section that categorizes and highlights the candidate's 
    most relevant abilities for their target role.
    """
    
    user_prompt = f"""
    Based on the following candidate information, create a comprehensive skills section:
    
    {user_context}
    
    Organize skills into relevant categories (e.g., Technical Skills, Soft Skills, 
    Industry-Specific Skills) and highlight the most important ones for their target role. 
    Present in a clear, scannable format.
    """
    
    return call_openai_api(system_prompt, user_prompt, 400)

def generate_cover_letter(user_context: str) -> str:
    """Generate a compelling cover letter paragraph"""
    system_prompt = """
    You are an expert cover letter writer. Create a compelling opening paragraph for a cover letter 
    that immediately grabs the hiring manager's attention and showcases the candidate's 
    most relevant qualifications.
    """
    
    user_prompt = f"""
    Based on the following candidate information, write a powerful cover letter opening paragraph:
    
    {user_context}
    
    The paragraph should be engaging, specific to their target role, and highlight their 
    unique value proposition. Avoid generic statements and focus on concrete achievements 
    and relevant experience.
    """
    
    return call_openai_api(system_prompt, user_prompt, 300)

def generate_portfolio_bio(user_context: str) -> str:
    """Generate a professional portfolio bio"""
    system_prompt = """
    You are a personal branding expert. Create a compelling professional bio for a portfolio 
    or LinkedIn profile that showcases the candidate's expertise, personality, and career journey 
    in an engaging, third-person narrative.
    """
    
    user_prompt = f"""
    Based on the following candidate information, write a professional portfolio bio:
    
    {user_context}
    
    The bio should be written in third person, be engaging and personable while remaining 
    professional, highlight their expertise and achievements, and give readers a sense of 
    who they are as a professional. Keep it concise but impactful (2-3 paragraphs).
    """
    
    return call_openai_api(system_prompt, user_prompt, 500)

def create_full_resume(data: Dict[str, Any], content_sections: Dict[str, str]) -> str:
    """Combine user data and AI-generated content into a full resume"""
    
    full_name = data.get('fullName', '')
    email = data.get('email', '')
    phone = data.get('phone', '')
    location = data.get('location', '')
    
    resume_parts = []
    
    # Header
    resume_parts.append(f"{full_name.upper()}")
    resume_parts.append("=" * len(full_name))
    resume_parts.append("")
    
    # Contact Information
    contact_info = []
    if email:
        contact_info.append(f"Email: {email}")
    if phone:
        contact_info.append(f"Phone: {phone}")
    if location:
        contact_info.append(f"Location: {location}")
    
    if contact_info:
        resume_parts.extend(contact_info)
        resume_parts.append("")
    
    # Professional Summary
    resume_parts.append("PROFESSIONAL SUMMARY")
    resume_parts.append("-" * 20)
    resume_parts.append(content_sections.get('resume_summary', ''))
    resume_parts.append("")
    
    # Skills Section
    resume_parts.append("SKILLS & EXPERTISE")
    resume_parts.append("-" * 18)
    resume_parts.append(content_sections.get('skill_highlights', ''))
    resume_parts.append("")
    
    # Experience Section
    if data.get('experience'):
        resume_parts.append("PROFESSIONAL EXPERIENCE")
        resume_parts.append("-" * 23)
        resume_parts.append(data.get('experience'))
        resume_parts.append("")
    
    # Education Section
    if data.get('education'):
        resume_parts.append("EDUCATION")
        resume_parts.append("-" * 9)
        resume_parts.append(data.get('education'))
        resume_parts.append("")
    
    # Achievements Section
    if data.get('achievements'):
        resume_parts.append("KEY ACHIEVEMENTS")
        resume_parts.append("-" * 15)
        resume_parts.append(data.get('achievements'))
        resume_parts.append("")
    
    resume_parts.append(f"Generated on {datetime.now().strftime('%B %d, %Y')}")
    
    return "\n".join(resume_parts)

def generate_fallback_content(data: Dict[str, Any]):
    """Generate fallback content when OpenAI is not available"""
    
    # Create basic content sections
    full_name = data.get('fullName', '')
    job_title = data.get('jobTitle', '')
    skills = data.get('skills', '')
    
    fallback_sections = {
        'resume_summary': f"{full_name} is a motivated {job_title} with strong technical skills and a passion for delivering high-quality results. Experienced in {skills[:50]}... and committed to continuous learning and professional growth.",
        'skill_highlights': f"Technical Skills: {skills}\n\nCore Competencies:\n• Problem-solving and analytical thinking\n• Team collaboration and communication\n• Project management and organization\n• Adaptability and continuous learning",
        'cover_letter': f"As an experienced {job_title}, I am excited about the opportunity to contribute to your team. My background in {skills[:30]}... and proven track record of delivering results make me an ideal candidate for this position.",
        'portfolio_bio': f"{full_name} is a dedicated {job_title} with expertise in {skills[:40]}. Known for delivering innovative solutions and maintaining high standards of work quality, {full_name.split()[0]} brings both technical proficiency and strong collaborative skills to every project."
    }
    
    # Create full resume using fallback
    full_resume = create_full_resume(data, fallback_sections)
    
    return jsonify({
        'success': True,
        'resume': full_resume,
        'resumeSummary': fallback_sections['resume_summary'],
        'skillHighlights': fallback_sections['skill_highlights'],
        'coverLetter': fallback_sections['cover_letter'],
        'portfolioBio': fallback_sections['portfolio_bio'],
        'message': 'Content generated using fallback method (OpenAI API not configured)',
        'timestamp': datetime.now().isoformat()
    })

def generate_fallback_resume(data):
    """Generate a basic resume when OpenAI API is not available"""
    
    full_name = data.get('fullName', '')
    email = data.get('email', '')
    phone = data.get('phone', '')
    location = data.get('location', '')
    job_title = data.get('jobTitle', '')
    experience = data.get('experience', '')
    skills = data.get('skills', '')
    education = data.get('education', '')
    
    resume = f"""
{full_name.upper()}
{'=' * len(full_name)}

Contact Information:
Email: {email}
Phone: {phone}
Location: {location}

PROFESSIONAL SUMMARY
Motivated and skilled professional seeking a {job_title} position. Committed to delivering high-quality results and contributing to organizational success.

PROFESSIONAL EXPERIENCE
{experience if experience else 'Please provide your work experience details to enhance this section.'}

SKILLS
{', '.join([skill.strip() for skill in skills.split(',')]) if skills else 'Please list your relevant skills.'}

EDUCATION
{education if education else 'Please provide your educational background.'}

ADDITIONAL INFORMATION
• Strong communication and interpersonal skills
• Ability to work independently and as part of a team
• Detail-oriented with excellent problem-solving abilities
• Adaptable and eager to learn new technologies and methods

---
Resume generated on {datetime.now().strftime('%B %d, %Y')}
    """.strip()
    
    return resume

@app.route('/contact', methods=['POST'])
def contact():
    try:
        # Get data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')
        
        # Log the contact message (in a real app, you'd save to database or send email)
        logger.info(f"Contact form submission from {name} ({email}): {message}")
        
        # In a real application, you would:
        # 1. Save to database
        # 2. Send email notification
        # 3. Send confirmation email to user
        
        return jsonify({
            'success': True,
            'message': 'Thank you for your message. We will get back to you soon!'
        })
        
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to send message. Please try again.'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': bool(openai.api_key)
    })

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

@app.route('/api/health', methods=['GET'])
def enhanced_health_check():
    """Enhanced health check endpoint with system info"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': bool(openai.api_key),
        'openai_model': OPENAI_MODEL,
        'version': '1.0.0',
        'endpoints': {
            '/': 'Serve main application',
            '/generate': 'Generate AI resume content (POST)',
            '/generate-resume': 'Legacy resume generation (POST)',
            '/contact': 'Contact form submission (POST)',
            '/api/health': 'Health check (GET)'
        }
    })

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Check if running in production
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"""
    🚀 AI Resume & Portfolio Builder Server Starting...
    
    Server will be available at: http://localhost:{port}
    Debug mode: {debug_mode}
    OpenAI API configured: {bool(openai.api_key)}
    OpenAI Model: {OPENAI_MODEL}
    Max Tokens: {MAX_TOKENS}
    Temperature: {TEMPERATURE}
    
    Available Endpoints:
    • GET  /                 → Main application
    • POST /generate         → Generate AI content (NEW)
    • POST /generate-resume  → Legacy resume generation  
    • POST /contact          → Contact form
    • GET  /api/health       → Health check
    
    Environment Setup:
    export OPENAI_API_KEY="your_api_key_here"
    export OPENAI_MODEL="gpt-3.5-turbo" (optional)
    export MAX_TOKENS="2000" (optional)
    export TEMPERATURE="0.7" (optional)
    """)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
