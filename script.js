// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const resumeForm = document.getElementById('resumeForm');
const resumeOutput = document.getElementById('resumeOutput');
const resumeContent = document.getElementById('resumeContent');
const contactForm = document.querySelector('.contact-form');

// Navigation Toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Resume Form Submission
if (resumeForm) {
    resumeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        showLoading();
        
        // Hide previous output and errors
        hideResults();
        hideErrors();
        
        // Collect form data
        const formData = collectFormData();
        
        try {
            // Send data to Flask backend  
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            // Hide loading
            hideLoading();
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Display generated resume and portfolio content
                displayResults(result);
                
                // Scroll to results
                scrollToResults();
                
                // Show success message if there's a fallback message
                if (result.message) {
                    showSuccessMessage(result.message);
                }
            } else {
                throw new Error(result.error || 'Failed to generate resume');
            }
            
        } catch (error) {
            console.error('Error generating resume:', error);
            hideLoading();
            
            // Show user-friendly error message
            const errorMessage = getErrorMessage(error);
            showError(errorMessage);
        }
    });
}

// Form Data Collection
function collectFormData() {
    const formData = {
        // Template Selection
        template: getSelectedTemplate(),
        
        // Personal Information
        fullName: getFieldValue('fullName'),
        email: getFieldValue('email'),
        phone: getFieldValue('phone'),
        location: getFieldValue('location'),
        
        // Career Information
        careerObjective: getFieldValue('careerObjective'),
        jobTitle: getFieldValue('jobTitle'),
        
        // Professional Details
        experience: getFieldValue('experience'),
        skills: getFieldValue('skills'),
        education: getFieldValue('education'),
        achievements: getFieldValue('achievements')
    };
    
    console.log('Collected form data:', formData);
    return formData;
}

// Helper function to get field value safely
function getFieldValue(fieldId) {
    const element = document.getElementById(fieldId);
    return element ? element.value.trim() : '';
}

// Form Validation
function validateForm() {
    let isValid = true;
    const requiredFields = [
        { id: 'fullName', name: 'Full Name' },
        { id: 'email', name: 'Email' },
        { id: 'jobTitle', name: 'Job Title' },
        { id: 'skills', name: 'Skills' }
    ];
    
    // Clear previous errors
    clearValidationErrors();
    
    // Validate required fields
    requiredFields.forEach(field => {
        const value = getFieldValue(field.id);
        if (!value) {
            showFieldError(field.id, `${field.name} is required`);
            isValid = false;
        }
    });
    
    // Validate email format
    const email = getFieldValue('email');
    if (email && !isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field-specific error
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
    }
    
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#ef4444';
        field.setAttribute('aria-invalid', 'true');
    }
}

// Clear all validation errors
function clearValidationErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.opacity = '0';
    });
    
    const fields = document.querySelectorAll('.form-group input, .form-group textarea');
    fields.forEach(field => {
        field.style.borderColor = '';
        field.removeAttribute('aria-invalid');
    });
}

// Loading State Management
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
        loading.style.display = 'block';
    }
    
    // Disable form submission button
    const submitBtn = document.getElementById('generateBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span>Generating Resume...';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        loading.style.display = 'none';
    }
    
    // Re-enable form submission button
    const submitBtn = document.getElementById('generateBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">🤖</span>Generate AI Resume';
    }
}

// Result Display Management
function displayResults(result) {
    const resumeOutput = document.getElementById('resumeOutput');
    const resumeContent = document.getElementById('resumeContent');
    
    if (!resumeOutput || !resumeContent) {
        console.error('Resume output elements not found');
        return;
    }
    
    // Store generated content for PDF generation
    storeGeneratedContent(result);
    
    // Display the generated resume
    if (result.resume) {
        resumeContent.innerHTML = formatResumeText(result.resume);
        resumeOutput.classList.remove('hidden');
        resumeOutput.style.display = 'block';
    }
    
    // If portfolio content is included, display it as well
    if (result.portfolio) {
        displayPortfolioContent(result.portfolio);
    }
    
    console.log('Results displayed successfully');
    console.log('Available content sections:', {
        resume: !!result.resume,
        resumeSummary: !!result.resumeSummary,
        skillHighlights: !!result.skillHighlights,
        coverLetter: !!result.coverLetter,
        portfolioBio: !!result.portfolioBio
    });
}

function hideResults() {
    const resumeOutput = document.getElementById('resumeOutput');
    if (resumeOutput) {
        resumeOutput.classList.add('hidden');
        resumeOutput.style.display = 'none';
    }
}

function scrollToResults() {
    const resumeOutput = document.getElementById('resumeOutput');
    if (resumeOutput) {
        setTimeout(() => {
            resumeOutput.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }, 300);
    }
}

// Display portfolio content (if provided)
function displayPortfolioContent(portfolioData) {
    // This function can be expanded to show portfolio content
    // For now, we'll just log it
    console.log('Portfolio content received:', portfolioData);
    
    // You can add portfolio display logic here if needed
    // For example, updating the portfolio section with dynamic content
}

// Format resume text for better display
function formatResumeText(text) {
    // Basic formatting - convert newlines to proper HTML
    return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Error Handling and Display
function getErrorMessage(error) {
    if (error.message.includes('Failed to fetch')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.message.includes('500')) {
        return 'Server error occurred. Please try again in a few moments.';
    } else if (error.message.includes('400')) {
        return 'Invalid form data. Please check your inputs and try again.';
    } else if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
    } else {
        return error.message || 'An unexpected error occurred. Please try again.';
    }
}

function showError(message) {
    // Create or get error element
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'error-banner';
        errorDiv.style.cssText = `
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 1rem 1.5rem;
            margin: 1.5rem 0;
            border-radius: 12px;
            text-align: center;
            font-weight: 500;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: relative;
            animation: slideDown 0.3s ease-out;
        `;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.75rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #dc2626;
            cursor: pointer;
            line-height: 1;
        `;
        closeBtn.onclick = () => hideErrors();
        errorDiv.appendChild(closeBtn);
        
        // Insert after the form
        const form = document.getElementById('resumeForm');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(errorDiv, form.nextSibling);
        }
    }
    
    errorDiv.innerHTML = `<span>${message}</span>`;
    errorDiv.style.display = 'block';
    
    // Add close button back if it was removed
    if (!errorDiv.querySelector('button')) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.75rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #dc2626;
            cursor: pointer;
            line-height: 1;
        `;
        closeBtn.onclick = () => hideErrors();
        errorDiv.appendChild(closeBtn);
    }
    
    // Scroll to error
    setTimeout(() => {
        errorDiv.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        hideErrors();
    }, 10000);
}

function hideErrors() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Download Resume as PDF using jsPDF
function downloadResume() {
    try {
        const resumeContentEl = document.getElementById('resumeContent');
        if (!resumeContentEl || !resumeContentEl.textContent.trim()) {
            showError('No resume content available to download. Please generate a resume first.');
            return;
        }

        // Show loading state
        showPdfGenerationLoading();

        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Get resume data
        const resumeData = getResumeDataForPdf();
        
        // Generate PDF with professional formatting
        generatePdfContent(doc, resumeData);

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${resumeData.name || 'Resume'}_${timestamp}.pdf`;

        // Save the PDF
        doc.save(filename);

        // Hide loading and show success
        hidePdfGenerationLoading();
        showSuccessMessage(`Resume saved as ${filename}`);

        // Track download analytics (optional)
        console.log(`PDF downloaded: ${filename}`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        hidePdfGenerationLoading();
        showError('Failed to generate PDF. Please try again or copy the text manually.');
        
        // Fallback: copy to clipboard
        fallbackCopyToClipboard();
    }
}

// Get structured resume data for PDF generation
function getResumeDataForPdf() {
    const resumeContentEl = document.getElementById('resumeContent');
    const resumeText = resumeContentEl.textContent || resumeContentEl.innerText;
    
    // Parse resume content into structured data
    const data = {
        raw: resumeText,
        name: extractSectionContent(resumeText, '', '='),
        contact: extractSectionContent(resumeText, 'Email:', 'PROFESSIONAL SUMMARY'),
        summary: extractSectionContent(resumeText, 'PROFESSIONAL SUMMARY', 'SKILLS'),
        skills: extractSectionContent(resumeText, 'SKILLS', 'PROFESSIONAL EXPERIENCE'),
        experience: extractSectionContent(resumeText, 'PROFESSIONAL EXPERIENCE', 'EDUCATION'),
        education: extractSectionContent(resumeText, 'EDUCATION', 'KEY ACHIEVEMENTS'),
        achievements: extractSectionContent(resumeText, 'KEY ACHIEVEMENTS', 'Generated on')
    };
    
    return data;
}

// Extract content between sections
function extractSectionContent(text, startMarker, endMarker) {
    let content = '';
    
    if (!startMarker) {
        // Extract name (first line)
        const lines = text.split('\n');
        return lines[0] ? lines[0].trim() : '';
    }
    
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return '';
    
    let endIndex = text.length;
    if (endMarker) {
        endIndex = text.indexOf(endMarker, startIndex);
        if (endIndex === -1) endIndex = text.length;
    }
    
    content = text.substring(startIndex + startMarker.length, endIndex).trim();
    
    // Clean up section dividers and extra whitespace
    content = content.replace(/^[-=]+\s*/gm, '').trim();
    
    return content;
}

// Generate professional PDF content
function generatePdfContent(doc, data) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    
    // Get template-specific colors
    const template = getSelectedTemplate();
    const templateColors = getTemplateColors(template);
    
    // Set default font
    doc.setFont('helvetica');
    
    // Header - Name
    if (data.name) {
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(templateColors.primary.r, templateColors.primary.g, templateColors.primary.b);
        
        const nameWidth = doc.getTextWidth(data.name);
        const nameX = (pageWidth - nameWidth) / 2;
        doc.text(data.name, nameX, yPosition);
        yPosition += 10;
        
        // Add line under name
        doc.setDrawColor(templateColors.primary.r, templateColors.primary.g, templateColors.primary.b);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
    }
    
    // Contact Information
    if (data.contact) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        
        const contactLines = data.contact.split('\n').filter(line => line.trim());
        const contactText = contactLines.join(' • ');
        
        const contactWidth = doc.getTextWidth(contactText);
        const contactX = (pageWidth - contactWidth) / 2;
        doc.text(contactText, contactX, yPosition);
        yPosition += 12;
    }
    
    // Professional Summary
    yPosition = addSection(doc, 'PROFESSIONAL SUMMARY', data.summary, yPosition, margin, contentWidth, pageHeight);
    
    // Skills & Expertise  
    yPosition = addSection(doc, 'SKILLS & EXPERTISE', data.skills, yPosition, margin, contentWidth, pageHeight);
    
    // Professional Experience
    if (data.experience) {
        yPosition = addSection(doc, 'PROFESSIONAL EXPERIENCE', data.experience, yPosition, margin, contentWidth, pageHeight);
    }
    
    // Education
    if (data.education) {
        yPosition = addSection(doc, 'EDUCATION', data.education, yPosition, margin, contentWidth, pageHeight);
    }
    
    // Key Achievements
    if (data.achievements) {
        yPosition = addSection(doc, 'KEY ACHIEVEMENTS', data.achievements, yPosition, margin, contentWidth, pageHeight);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    const footerText = `Generated on ${new Date().toLocaleDateString()}`;
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
}

// Add a section to the PDF
function addSection(doc, title, content, yPosition, margin, contentWidth, pageHeight) {
    if (!content || !content.trim()) return yPosition;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
    }
    
    // Section title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const template = getSelectedTemplate();
    const templateColors = getTemplateColors(template);
    doc.setTextColor(templateColors.primary.r, templateColors.primary.g, templateColors.primary.b);
    doc.text(title, margin, yPosition);
    yPosition += 6;
    
    // Section content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    // Split content into lines that fit the page width
    const lines = doc.splitTextToSize(content.trim(), contentWidth);
    
    // Add each line, checking for page breaks
    for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
        }
        
        doc.text(lines[i], margin, yPosition);
        yPosition += 4;
    }
    
    return yPosition + 6; // Add extra space after section
}

// Show PDF generation loading
function showPdfGenerationLoading() {
    const downloadBtn = document.querySelector('button[onclick="downloadResume()"]');
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span class="btn-icon">📄</span>Generating PDF...';
        downloadBtn.style.opacity = '0.7';
    }
}

// Hide PDF generation loading
function hidePdfGenerationLoading() {
    const downloadBtn = document.querySelector('button[onclick="downloadResume()"]');
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<span class="btn-icon">📄</span>Download PDF';
        downloadBtn.style.opacity = '1';
    }
}

// Fallback copy to clipboard
function fallbackCopyToClipboard() {
    const resumeContent = document.getElementById('resumeContent');
    if (resumeContent && navigator.clipboard) {
        const text = resumeContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            showSuccessMessage('Resume text copied to clipboard as fallback!');
        }).catch(() => {
            showError('Unable to copy to clipboard. Please select and copy the text manually.');
        });
    }
}

// Download Portfolio Bio as PDF
function downloadPortfolioBio() {
    try {
        // Check if we have portfolio content from the API response
        if (!window.lastGeneratedContent || !window.lastGeneratedContent.portfolioBio) {
            showError('No portfolio content available. Please generate a resume first.');
            return;
        }

        // Show loading state
        showPdfGenerationLoading();

        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // Get user name from form or generated content
        const userName = document.getElementById('fullName')?.value || 'Professional';
        const jobTitle = document.getElementById('jobTitle')?.value || '';
        
        // Get template colors
        const template = getSelectedTemplate();
        const templateColors = getTemplateColors(template);

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(templateColors.primary.r, templateColors.primary.g, templateColors.primary.b);
        doc.text('Professional Portfolio Bio', margin, yPosition);
        yPosition += 12;

        // Subtitle
        if (userName && jobTitle) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`${userName} - ${jobTitle}`, margin, yPosition);
            yPosition += 15;
        }

        // Bio content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        const bioContent = window.lastGeneratedContent.portfolioBio;
        const lines = doc.splitTextToSize(bioContent, contentWidth);

        for (let i = 0; i < lines.length; i++) {
            doc.text(lines[i], margin, yPosition);
            yPosition += 6;
        }

        // Additional sections if available
        if (window.lastGeneratedContent.skillHighlights) {
            yPosition += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(templateColors.primary.r, templateColors.primary.g, templateColors.primary.b);
            doc.text('Key Skills', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);

            const skillLines = doc.splitTextToSize(window.lastGeneratedContent.skillHighlights, contentWidth);
            for (let i = 0; i < Math.min(skillLines.length, 10); i++) { // Limit to prevent overflow
                doc.text(skillLines[i], margin, yPosition);
                yPosition += 5;
            }
        }

        // Footer
        const footerText = `Generated on ${new Date().toLocaleDateString()}`;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - footerWidth) / 2, doc.internal.pageSize.height - 10);

        // Save the PDF
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${userName.replace(/\s+/g, '_')}_Portfolio_Bio_${timestamp}.pdf`;
        doc.save(filename);

        hidePdfGenerationLoading();
        showSuccessMessage(`Portfolio bio saved as ${filename}`);

    } catch (error) {
        console.error('Error generating portfolio PDF:', error);
        hidePdfGenerationLoading();
        showError('Failed to generate portfolio PDF. Please try again.');
    }
}

// Store generated content globally for PDF generation
function storeGeneratedContent(result) {
    window.lastGeneratedContent = {
        resume: result.resume,
        resumeSummary: result.resumeSummary,
        skillHighlights: result.skillHighlights,
        coverLetter: result.coverLetter,
        portfolioBio: result.portfolioBio,
        timestamp: result.timestamp || new Date().toISOString()
    };
}

// Edit Resume function
function editResume() {
    if (resumeOutput) {
        resumeOutput.style.display = 'none';
        
        // Scroll back to form
        const resumeSection = document.getElementById('resume');
        if (resumeSection) {
            resumeSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Show success message
function showSuccessMessage(message) {
    // Create or get success element
    let successDiv = document.getElementById('success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.className = 'success-banner';
        successDiv.style.cssText = `
            background: #d1fae5;
            border: 1px solid #a7f3d0;
            color: #065f46;
            padding: 1rem 1.5rem;
            margin: 1.5rem 0;
            border-radius: 12px;
            text-align: center;
            font-weight: 500;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1001;
            min-width: 300px;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.75rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #065f46;
            cursor: pointer;
            line-height: 1;
        `;
        closeBtn.onclick = () => {
            successDiv.style.display = 'none';
        };
        successDiv.appendChild(closeBtn);
        
        document.body.appendChild(successDiv);
    }
    
    // Update message content
    const messageSpan = successDiv.querySelector('span') || document.createElement('span');
    messageSpan.textContent = message;
    if (!successDiv.querySelector('span')) {
        successDiv.insertBefore(messageSpan, successDiv.firstChild);
    }
    
    successDiv.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        if (successDiv.style.display !== 'none') {
            successDiv.style.display = 'none';
        }
    }, 5000);
}

// Contact Form Submission
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            message: document.getElementById('message').value
        };
        
        try {
            const response = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessMessage('Message sent successfully! We\'ll get back to you soon.');
                contactForm.reset();
            } else {
                showError(result.error || 'Failed to send message');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to send message. Please try again later.');
        }
    });
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }
});

// Add fade-in animation to sections when they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Resume Builder initialized');
    
    // Add dynamic styles
    addAnimationStyles();
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Initialize template selection
    initializeTemplateSelection();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize section animations
    initializeSectionAnimations();
    
    // Initialize navigation
    initializeNavigation();
    
    // Log form elements for debugging
    logFormElements();
});

function initializeSectionAnimations() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Make home section visible immediately
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.style.opacity = '1';
        homeSection.style.transform = 'translateY(0)';
    }
}

function initializeNavigation() {
    // Enhanced mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', !isActive);
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navToggle && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

function logFormElements() {
    const form = document.getElementById('resumeForm');
    if (form) {
        console.log('Form found:', form);
        const requiredFields = form.querySelectorAll('[required]');
        console.log(`Found ${requiredFields.length} required fields`);
    } else {
        console.warn('Resume form not found');
    }
}

// Theme Toggle Functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log(`Applied theme: ${savedTheme}`);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('Theme toggle initialized');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log(`Theme changed from ${currentTheme} to ${newTheme}`);
    
    // Show theme change notification
    const themeMessage = newTheme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
    showSuccessMessage(themeMessage);
}

// Template Selection Functionality
function initializeTemplateSelection() {
    const templateOptions = document.querySelectorAll('input[name="template"]');
    
    templateOptions.forEach(option => {
        option.addEventListener('change', handleTemplateChange);
    });
    
    // Set initial template
    const selectedTemplate = document.querySelector('input[name="template"]:checked');
    if (selectedTemplate) {
        updateTemplatePreview(selectedTemplate.value);
        console.log(`Initial template: ${selectedTemplate.value}`);
    }
    
    console.log('Template selection initialized');
}

function handleTemplateChange(event) {
    const selectedTemplate = event.target.value;
    updateTemplatePreview(selectedTemplate);
    
    console.log(`Template changed to: ${selectedTemplate}`);
    showSuccessMessage(`Template changed to ${getTemplateDisplayName(selectedTemplate)}`);
}

function updateTemplatePreview(templateName) {
    // Update the resume content area styling based on template
    const resumeContent = document.getElementById('resumeContent');
    if (resumeContent) {
        // Remove existing template classes
        resumeContent.classList.remove('template-modern', 'template-classic', 'template-creative');
        // Add new template class
        resumeContent.classList.add(`template-${templateName}`);
    }
    
    // Store selected template for PDF generation
    if (window.lastGeneratedContent) {
        window.lastGeneratedContent.selectedTemplate = templateName;
    }
}

function getTemplateDisplayName(templateName) {
    const templateNames = {
        'modern': 'Modern Professional',
        'classic': 'Classic Elegant', 
        'creative': 'Creative Bold'
    };
    return templateNames[templateName] || templateName;
}

function getSelectedTemplate() {
    const selectedTemplate = document.querySelector('input[name="template"]:checked');
    return selectedTemplate ? selectedTemplate.value : 'modern';
}

// Get template-specific color values for PDF generation
function getTemplateColors(templateName) {
    const colorMap = {
        'modern': {
            primary: { r: 30, g: 58, b: 138 },   // Navy blue
            accent: { r: 59, g: 130, b: 246 }    // Light blue
        },
        'classic': {
            primary: { r: 16, g: 120, b: 88 },   // Emerald green
            accent: { r: 34, g: 197, b: 94 }     // Light green
        },
        'creative': {
            primary: { r: 126, g: 34, b: 206 },  // Purple
            accent: { r: 168, g: 85, b: 247 }    // Light purple
        }
    };
    
    return colorMap[templateName] || colorMap['modern'];
}

// Utility function for API error handling
function handleApiError(error, userMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError('Unable to connect to the server. Please check your internet connection.');
    } else if (error.message.includes('404')) {
        showError('Service not found. Please try again later.');
    } else if (error.message.includes('500')) {
        showError('Server error. Please try again later.');
    } else {
        showError(userMessage);
    }
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
});

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Add CSS animations dynamically
function addAnimationStyles() {
    if (!document.getElementById('dynamic-animations')) {
        const style = document.createElement('style');
        style.id = 'dynamic-animations';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Real-time form validation
function initializeFormValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmailField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Required field validation
    const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', validateRequiredField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateEmailField(e) {
    const email = e.target.value.trim();
    if (email && !isValidEmail(email)) {
        showFieldError(e.target.id, 'Please enter a valid email address');
    }
}

function validateRequiredField(e) {
    const value = e.target.value.trim();
    if (!value) {
        const fieldName = e.target.getAttribute('aria-label') || 
                         e.target.previousElementSibling?.textContent?.replace('*', '').trim() || 
                         'This field';
        showFieldError(e.target.id, `${fieldName} is required`);
    }
}

function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
    field.removeAttribute('aria-invalid');
    
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.opacity = '0';
    }
}
