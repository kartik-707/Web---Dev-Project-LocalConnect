// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = this.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Character Counter for Message
const messageField = document.getElementById('message');
const charCounter = document.getElementById('charCounter');

if (messageField && charCounter) {
    messageField.addEventListener('input', function() {
        const length = this.value.length;
        charCounter.textContent = `${length} / 500`;
        
        if (length > 500) {
            charCounter.style.color = 'red';
        } else if (length > 400) {
            charCounter.style.color = 'orange';
        } else {
            charCounter.style.color = 'var(--text-light)';
        }
    });
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Simulate form submission
        setTimeout(() => {
            showSuccessMessage(formData);
            contactForm.reset();
            charCounter.textContent = '0 / 500';
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }, 1500);
    });
}

function showSuccessMessage(formData) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Message Sent Successfully!</h2>
            <p>Thank you for contacting us, ${formData.firstName}!</p>
            <div class="modal-details">
                <p><strong>Subject:</strong> ${formData.subject}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
            </div>
            <p class="next-steps">
                We've received your message and will get back to you within 24 hours. 
                A confirmation email has been sent to ${formData.email}.
            </p>
            <button class="btn-primary-large" onclick="this.closest('.success-modal').remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Info Cards Click to Copy
const infoCards = document.querySelectorAll('.info-card');
infoCards.forEach(card => {
    card.addEventListener('click', function() {
        const cardType = this.querySelector('h3').textContent;
        
        if (cardType === 'Email Us') {
            const email = 'rastogikartikay@gmail.com';
            copyToClipboard(email);
            showNotification('Email copied to clipboard!');
        } else if (cardType === 'Call Us') {
            const phone = '+91 98765 43210';
            copyToClipboard(phone);
            showNotification('Phone number copied to clipboard!');
        } else if (cardType === 'Visit Us') {
            showNotification('Opening location in Google Maps...');
            setTimeout(() => {
                openGoogleMaps();
            }, 500);
        }
    });
    
    // Hover effect
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
        this.style.transition = 'all 0.3s ease';
        this.style.cursor = 'pointer';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Copy to Clipboard Function
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// FAQ Cards Accordion
const faqCards = document.querySelectorAll('.faq-card');
faqCards.forEach((card, index) => {
    card.addEventListener('click', function() {
        // Toggle active class
        this.classList.toggle('active');
        
        // Expand/collapse with animation
        const answer = this.querySelector('p');
        if (this.classList.contains('active')) {
            this.style.background = 'var(--white)';
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.style.marginTop = '15px';
        } else {
            this.style.background = '';
            answer.style.maxHeight = '0';
            answer.style.marginTop = '0';
        }
    });
    
    // Initialize collapsed state
    const answer = card.querySelector('p');
    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'all 0.3s ease';
    answer.style.marginTop = '0';
    
    // Hover effect
    card.addEventListener('mouseenter', function() {
        if (!this.classList.contains('active')) {
            this.style.transform = 'translateX(5px)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Social Links Hover Effects
const socialLinks = document.querySelectorAll('.social-link');
socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) rotate(360deg)';
        this.style.transition = 'all 0.5s ease';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) rotate(0deg)';
    });
    
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.title;
        showNotification(`Opening ${platform}...`);
    });
});

// Map Button
const openMapBtn = document.getElementById('openMapBtn');
const mapPlaceholder = document.getElementById('mapPlaceholder');

if (openMapBtn) {
    openMapBtn.addEventListener('click', openGoogleMaps);
}

if (mapPlaceholder) {
    mapPlaceholder.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.transition = 'all 0.3s ease';
    });
    
    mapPlaceholder.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

function openGoogleMaps() {
    const location = 'VIT Chennai, Vandalur-Kelambakkam Road, Chennai, Tamil Nadu 600127';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
}

// Help Center Button
const helpCenterBtn = document.getElementById('helpCenterBtn');
if (helpCenterBtn) {
    helpCenterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Help Center\n\nBrowse our comprehensive help articles:\n\n• Getting Started Guide\n• Account Management\n• Listing Your Business\n• Payment & Billing\n• Safety & Trust\n• FAQ Database\n\nSearch for answers or contact support 24/7');
    });
}

// Notification System
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--dark-stone);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Form Input Focus Effects
const formInputs = document.querySelectorAll('.form-input, .form-textarea');
formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
        this.parentElement.style.transition = 'all 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Email Links Click Handler
const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
emailLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const email = this.textContent;
        copyToClipboard(email);
        showNotification(`Email copied: ${email}`);
    });
});

// Phone Links Click Handler
const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
phoneLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const phone = this.textContent;
        copyToClipboard(phone);
        showNotification(`Phone number copied: ${phone}`);
    });
});

// Add styles for animations and modal
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .success-modal.show {
        opacity: 1;
    }
    
    .modal-content {
        background: white;
        padding: 40px;
        border-radius: 16px;
        max-width: 500px;
        text-align: center;
        animation: modalSlideIn 0.4s ease;
    }
    
    @keyframes modalSlideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .success-icon {
        font-size: 80px;
        color: #4CAF50;
        margin-bottom: 20px;
    }
    
    .modal-content h2 {
        font-size: 28px;
        margin-bottom: 15px;
        color: var(--text-dark);
    }
    
    .modal-details {
        background: var(--stone-cream);
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: left;
    }
    
    .modal-details p {
        margin: 10px 0;
        color: var(--text-dark);
    }
    
    .next-steps {
        margin: 20px 0;
        line-height: 1.6;
        color: var(--text-light);
    }
    
    .faq-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .faq-card.active h3 {
        color: var(--dark-stone);
    }
    
    .char-counter {
        display: block;
        text-align: right;
        font-size: 13px;
        color: var(--text-light);
        margin-top: 5px;
    }
    
    .nav-menu.active {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 768px) {
        .mobile-menu-toggle {
            display: block !important;
            font-size: 24px;
            cursor: pointer;
            color: var(--dark-stone);
        }
    }
`;
document.head.appendChild(styles);

// Sign In Button
const signInBtn = document.getElementById('signInBtn');
if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Sign In to access your account!\n\nFeatures:\n• Track your inquiries\n• Save favorite businesses\n• Manage reviews\n• Get personalized support');
    });
}

console.log('LocalConnect Contact Page Scripts Loaded Successfully!');