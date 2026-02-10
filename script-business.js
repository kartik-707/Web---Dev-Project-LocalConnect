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

// Generate Business Hours Grid
const hoursGrid = document.getElementById('hoursGrid');
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

days.forEach((day, index) => {
    const row = document.createElement('div');
    row.className = 'hours-row';
    row.innerHTML = `
        <span class="day-label">${day}</span>
        <input type="time" class="time-input" data-day="${day}" data-type="open" value="${index < 5 ? '09:00' : (index === 5 ? '10:00' : '')}">
        <span>to</span>
        <input type="time" class="time-input" data-day="${day}" data-type="close" value="${index < 5 ? '17:00' : (index === 5 ? '14:00' : '')}">
        <label class="checkbox-label">
            <input type="checkbox" class="closed-checkbox" data-day="${day}" ${index === 6 ? 'checked' : ''}> Closed
        </label>
    `;
    hoursGrid.appendChild(row);
    
    // Handle closed checkbox
    const checkbox = row.querySelector('.closed-checkbox');
    const timeInputs = row.querySelectorAll('.time-input');
    
    checkbox.addEventListener('change', function() {
        timeInputs.forEach(input => {
            input.disabled = this.checked;
            if (this.checked) {
                input.value = '';
            }
        });
    });
    
    // Initialize disabled state
    if (checkbox.checked) {
        timeInputs.forEach(input => input.disabled = true);
    }
});

// Character Counter for Description
const description = document.getElementById('description');
const charCount = document.querySelector('.char-count');

if (description && charCount) {
    description.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length} / 100 characters minimum`;
        
        if (length >= 100) {
            charCount.style.color = 'green';
        } else {
            charCount.style.color = 'var(--text-light)';
        }
    });
}

// File Upload Functionality
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const filePreview = document.getElementById('filePreview');

let uploadedFiles = [];

if (uploadBtn) {
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
}

if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
}

if (uploadArea) {
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--dark-stone)';
        this.style.background = 'var(--white)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            uploadedFiles.push(file);
            displayFilePreview(file);
        } else {
            alert(`${file.name} is either not an image or exceeds 5MB`);
        }
    }
}

function displayFilePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const preview = document.createElement('div');
        preview.className = 'file-preview-item';
        preview.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <span class="file-name">${file.name}</span>
            <button class="remove-file" onclick="removeFile('${file.name}')">&times;</button>
        `;
        filePreview.appendChild(preview);
    };
    
    reader.readAsDataURL(file);
}

function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
    const previews = document.querySelectorAll('.file-preview-item');
    previews.forEach(preview => {
        if (preview.querySelector('.file-name').textContent === fileName) {
            preview.remove();
        }
    });
}

// Add file preview styles
const fileStyles = document.createElement('style');
fileStyles.textContent = `
    .file-preview {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }
    
    .file-preview-item {
        position: relative;
        border: 2px solid var(--light-stone);
        border-radius: 8px;
        overflow: hidden;
        padding: 10px;
        background: var(--white);
    }
    
    .file-preview-item img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 6px;
    }
    
    .file-name {
        display: block;
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-light);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .remove-file {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 25px;
        height: 25px;
        background: var(--dark-stone);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
    }
    
    .remove-file:hover {
        background: var(--accent-brown);
    }
`;
document.head.appendChild(fileStyles);

// Form Validation and Submission
const businessForm = document.getElementById('businessForm');
const submitBtn = document.getElementById('submitBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');

if (businessForm) {
    businessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.checkValidity()) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Check description length
        if (description.value.length < 100) {
            alert('Business description must be at least 100 characters');
            description.focus();
            return;
        }
        
        // Check terms agreement
        const termsAgree = document.getElementById('termsAgree');
        if (!termsAgree.checked) {
            alert('Please agree to the Terms of Service and Privacy Policy');
            return;
        }
        
        // Collect form data
        const formData = collectFormData();
        
        // Show success message
        showSuccessModal(formData);
    });
}

if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', function() {
        const formData = collectFormData();
        console.log('Saving draft:', formData);
        
        alert('Draft Saved!\n\nYour business listing has been saved as a draft. You can continue editing it later from your dashboard.');
    });
}

function collectFormData() {
    const formData = {
        businessName: document.getElementById('businessName').value,
        category: document.getElementById('category').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        description: document.getElementById('description').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipcode: document.getElementById('zipcode').value,
        serviceArea: document.getElementById('serviceArea').value,
        website: document.getElementById('website').value,
        yearsInBusiness: document.getElementById('yearsInBusiness').value,
        certifications: document.getElementById('certifications').value,
        hours: {},
        services: [],
        photos: uploadedFiles.length
    };
    
    // Collect business hours
    days.forEach(day => {
        const openTime = document.querySelector(`input[data-day="${day}"][data-type="open"]`).value;
        const closeTime = document.querySelector(`input[data-day="${day}"][data-type="close"]`).value;
        const closed = document.querySelector(`.closed-checkbox[data-day="${day}"]`).checked;
        
        formData.hours[day] = closed ? 'Closed' : `${openTime} - ${closeTime}`;
    });
    
    // Collect services
    document.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
        formData.services.push(checkbox.value);
    });
    
    return formData;
}

function showSuccessModal(formData) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Submission Successful!</h2>
            <p>Thank you for listing your business with LocalConnect!</p>
            <div class="modal-details">
                <p><strong>Business Name:</strong> ${formData.businessName}</p>
                <p><strong>Category:</strong> ${formData.category}</p>
                <p><strong>Location:</strong> ${formData.city}, ${formData.state}</p>
            </div>
            <p class="next-steps">
                <strong>What happens next?</strong><br>
                Our team will review your listing within 24-48 hours. You'll receive a verification email at ${formData.email} once approved.
            </p>
            <button class="btn-primary-large" onclick="window.location.href='index.html'">Return to Homepage</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('show'), 10);
}

// Pricing Plan Selection
const selectPlanBtns = document.querySelectorAll('.select-plan');
selectPlanBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.pricing-card');
        const plan = card.getAttribute('data-plan');
        
        // Remove selected class from all cards
        document.querySelectorAll('.pricing-card').forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        if (plan === 'basic') {
            alert(`You've selected the Basic (Free) Plan!\n\nYou'll get:\n• Basic business listing\n• Business contact information\n• Up to 5 photos\n• Customer reviews\n\nContinue filling out the form above to get started.`);
        } else if (plan === 'professional') {
            alert(`You've selected the Professional Plan (₹2,499/month)!\n\nYou'll get:\n• Everything in Basic\n• Verified badge\n• Unlimited photos\n• Featured placement\n• Analytics dashboard\n• Priority support\n\nPayment will be processed after form submission.`);
        } else {
            alert(`Interested in the Enterprise Plan?\n\nPlease contact our sales team:\n📞 +91 98765 43210\n📧 rastogikartikay@gmail.com\n\nWe'll create a custom package tailored to your business needs.`);
        }
    });
    
    // Hover effects
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Benefit Cards Hover Animation
const benefitCards = document.querySelectorAll('.benefit-card');
benefitCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.benefit-icon');
        icon.style.transform = 'rotate(360deg) scale(1.1)';
        icon.style.transition = 'all 0.5s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.benefit-icon');
        icon.style.transform = 'rotate(0deg) scale(1)';
    });
});

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
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
        font-size: 32px;
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
    
    .pricing-card.selected {
        border: 3px solid var(--dark-stone);
        transform: scale(1.02);
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
document.head.appendChild(modalStyles);

// Sign In Button
const signInBtn = document.getElementById('signInBtn');
if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Sign In to access your business dashboard!\n\nFeatures:\n• Manage your listings\n• View analytics\n• Respond to reviews\n• Track leads');
    });
}

// Input Field Focus Effects
const allInputs = document.querySelectorAll('.form-input, .form-textarea');
allInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.style.transform = 'scale(1.01)';
        this.style.transition = 'all 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });
});
const openTerms = document.getElementById('openTerms');
const openPrivacy = document.getElementById('openPrivacy');
const termsModal = document.getElementById('termsModal');
const privacyModal = document.getElementById('privacyModal');
const closeButtons = document.querySelectorAll('.closeModal');

if (openTerms) {
    openTerms.addEventListener('click', e => {
        e.preventDefault();
        termsModal.style.display = 'flex';
    });
}

if (openPrivacy) {
    openPrivacy.addEventListener('click', e => {
        e.preventDefault();
        privacyModal.style.display = 'flex';
    });
}

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        termsModal.style.display = 'none';
        privacyModal.style.display = 'none';
    });
});


console.log('LocalConnect Business Listing Scripts Loaded Successfully!');