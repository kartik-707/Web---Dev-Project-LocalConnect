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

// Search Functionality
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const locationInput = document.getElementById('locationInput');

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const service = searchInput.value.trim();
        const location = locationInput.value.trim();
        
        if (service || location) {
            // Redirect to services page with search parameters
            window.location.href = `services.html?service=${encodeURIComponent(service)}&location=${encodeURIComponent(location)}`;
        } else {
            alert('Please enter a service or location to search');
        }
    });
}

// Enter key to search
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

if (locationInput) {
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Popular Tags Click
const popularTags = document.querySelectorAll('.popular-tag');
popularTags.forEach(tag => {
    tag.addEventListener('click', function(e) {
        e.preventDefault();
        const service = this.textContent.trim();
        searchInput.value = service;
        searchBtn.click();
    });
});

// Category Cards Click
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        window.location.href = `services.html?category=${category}`;
    });
    
    // Hover effect with scale
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-12px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Professional Card Buttons
const viewButtons = document.querySelectorAll('.btn-view');
const contactButtons = document.querySelectorAll('.btn-contact');

viewButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const professionalName = this.closest('.professional-info').querySelector('h3').textContent;
        alert(`Opening profile for ${professionalName}`);
        // In a real app: window.location.href = 'profile.html?id=xxx';
    });
});

contactButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const professionalName = this.closest('.professional-info').querySelector('h3').textContent;
        alert(`Contact ${professionalName}\nPhone: +91 98765 43210\nEmail: contact@example.com`);
        // In a real app: open contact modal or redirect
    });
});

// Sign In Button
const signInBtn = document.getElementById('signInBtn');
if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Sign In feature coming soon!\n\nYou will be able to:\n• Save favorite professionals\n• Track your service requests\n• Leave reviews\n• Get personalized recommendations');
    });
}

// Animated Counter for Stats
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const duration = 2000; // 2 seconds
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// Intersection Observer for Stats Animation
const statsSection = document.querySelector('.stats');
const statItems = document.querySelectorAll('.stat-item');

if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statItems.forEach((item, index) => {
                    const counter = item.querySelector('.counter');
                    const target = parseInt(item.getAttribute('data-count'));
                    setTimeout(() => {
                        animateCounter(counter, target);
                    }, index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add hover effect to all buttons
const allButtons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
allButtons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Professional cards hover effect
const professionalCards = document.querySelectorAll('.professional-card');
professionalCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Step cards animation on scroll
const stepCards = document.querySelectorAll('.step-card');
const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 150);
        }
    });
}, { threshold: 0.3 });

stepCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    stepObserver.observe(card);
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple to primary buttons
document.querySelectorAll('.btn-primary, .search-btn').forEach(button => {
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.addEventListener('click', createRipple);
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
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
document.head.appendChild(style);

console.log('LocalConnect Homepage Scripts Loaded Successfully!');