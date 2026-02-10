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

// Mission & Vision Cards Hover Effects
const mvCards = document.querySelectorAll('.mv-card');
mvCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.mv-icon');
        icon.style.transform = 'scale(1.15) rotate(5deg)';
        icon.style.transition = 'all 0.4s ease';
        this.style.transform = 'translateY(-10px)';
        this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.mv-icon');
        icon.style.transform = 'scale(1) rotate(0deg)';
        this.style.transform = 'translateY(0)';
    });
    
    card.addEventListener('click', function() {
        const cardType = this.getAttribute('data-card');
        if (cardType === 'mission') {
            alert('Our Mission\n\nWe empower communities by:\n• Connecting people with trusted professionals\n• Building quality relationships\n• Ensuring transparency in every interaction\n• Supporting local business growth');
        } else {
            alert('Our Vision\n\nWe envision a world where:\n• Every customer finds the perfect professional\n• Every business thrives in their community\n• Trust and quality are guaranteed\n• Local services are accessible to all');
        }
    });
});

// Value Cards Interactive Effects
const valueCards = document.querySelectorAll('.value-card');
valueCards.forEach((card, index) => {
    // Staggered animation on load
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.transition = 'all 0.6s ease';
    }, index * 150);
    
    // Hover effect
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-12px) scale(1.03)';
        const icon = this.querySelector('.value-icon');
        icon.style.transform = 'rotate(360deg) scale(1.1)';
        icon.style.transition = 'all 0.6s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        const icon = this.querySelector('.value-icon');
        icon.style.transform = 'rotate(0deg) scale(1)';
    });
    
    // Click to show more info
    card.addEventListener('click', function() {
        const valueName = this.getAttribute('data-value');
        showValueDetails(valueName);
    });
});

function showValueDetails(value) {
    const valueInfo = {
        trust: {
            title: 'Trust',
            details: 'We build trust through:\n\n• Rigorous business verification process\n• Authentic customer reviews\n• Transparent pricing\n• Secure communication channels\n• Professional dispute resolution'
        },
        community: {
            title: 'Community',
            details: 'We strengthen communities by:\n\n• Supporting local businesses\n• Creating job opportunities\n• Building lasting relationships\n• Promoting neighborhood connections\n• Celebrating local success stories'
        },
        excellence: {
            title: 'Excellence',
            details: 'We pursue excellence through:\n\n• Superior customer service\n• Continuous platform improvements\n• Quality assurance standards\n• Professional development resources\n• Regular feedback implementation'
        },
        innovation: {
            title: 'Innovation',
            details: 'We innovate by:\n\n• Adopting latest technologies\n• Creating user-friendly features\n• Implementing AI-powered matching\n• Developing mobile solutions\n• Pioneering industry standards'
        }
    };
    
    const info = valueInfo[value];
    alert(`${info.title}\n\n${info.details}`);
}

// Team Cards Interactive Elements
const teamCards = document.querySelectorAll('.team-card');
teamCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'all 0.3s ease';
        
        const img = this.querySelector('.image-placeholder');
        img.style.background = 'var(--dark-stone)';
        img.querySelector('i').style.color = 'var(--white)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        
        const img = this.querySelector('.image-placeholder');
        img.style.background = '';
        img.querySelector('i').style.color = '';
    });
    
    card.addEventListener('click', function() {
        const member = this.getAttribute('data-member');
        showTeamMemberDetails(member);
    });
});

function showTeamMemberDetails(memberId) {
    const members = {
        '1': {
            name: 'Sarah Johnson',
            role: 'Founder & CEO',
            bio: 'Sarah founded LocalConnect in 2020 after recognizing the need for a better way to connect communities with service professionals.',
            education: 'MBA from Stanford University',
            experience: '15 years in tech startups',
            linkedin: '#',
            email: 'sarah@localconnect.com'
        },
        '2': {
            name: 'Michael Chen',
            role: 'Chief Technology Officer',
            bio: 'Michael leads our technology team, focusing on creating innovative solutions that make our platform better every day.',
            education: 'MS Computer Science, MIT',
            experience: 'Ex-Google, 12 years in software development',
            linkedin: '#',
            email: 'michael@localconnect.com'
        },
        '3': {
            name: 'Emily Rodriguez',
            role: 'Head of Customer Success',
            bio: 'Emily ensures that every user has an outstanding experience with LocalConnect, leading our customer support team.',
            education: 'BA Business Administration',
            experience: '10 years in customer success',
            linkedin: '#',
            email: 'emily@localconnect.com'
        },
        '4': {
            name: 'David Thompson',
            role: 'Head of Business Development',
            bio: 'David works with service professionals to help them grow their businesses and reach more customers.',
            education: 'MBA from Harvard Business School',
            experience: '14 years in business development',
            linkedin: '#',
            email: 'david@localconnect.com'
        }
    };
    
    const member = members[memberId];
    alert(`${member.name}\n${member.role}\n\n${member.bio}\n\n📚 ${member.education}\n💼 ${member.experience}\n📧 ${member.email}`);
}

// Animated Counter for Impact Stats
function animateCounter(element, target, suffix = '+') {
    let current = 0;
    const increment = target / 100;
    const duration = 2000;
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// Intersection Observer for Stats Animation
const impactStats = document.querySelector('.impact-stats');
const impactCards = document.querySelectorAll('.impact-card');

if (impactStats) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                impactCards.forEach((card, index) => {
                    const counter = card.querySelector('.counter');
                    const target = parseInt(card.getAttribute('data-count'));
                    const suffix = target === 98 ? '%' : '+';
                    
                    setTimeout(() => {
                        animateCounter(counter, target, suffix);
                        
                        // Add pulse animation
                        card.style.animation = 'pulse 0.6s ease';
                    }, index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(impactStats);
}

// Impact Cards Hover Effect
impactCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.08)';
        this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    card.addEventListener('click', function() {
        const count = this.getAttribute('data-count');
        const description = this.querySelector('p').textContent;
        alert(`${count}${count === '98' ? '%' : '+'} ${description}\n\nThis milestone represents our commitment to connecting communities with trusted service professionals. Thank you for being part of our journey!`);
    });
});

// Story Section Scroll Animation
const storySection = document.querySelector('.story-section');
if (storySection) {
    const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const storyText = entry.target.querySelector('.story-text');
                const storyImage = entry.target.querySelector('.story-image');
                
                storyText.style.opacity = '0';
                storyText.style.transform = 'translateX(-50px)';
                
                storyImage.style.opacity = '0';
                storyImage.style.transform = 'translateX(50px)';
                
                setTimeout(() => {
                    storyText.style.opacity = '1';
                    storyText.style.transform = 'translateX(0)';
                    storyText.style.transition = 'all 0.8s ease';
                }, 100);
                
                setTimeout(() => {
                    storyImage.style.opacity = '1';
                    storyImage.style.transform = 'translateX(0)';
                    storyImage.style.transition = 'all 0.8s ease';
                }, 300);
            }
        });
    }, { threshold: 0.3 });
    
    storyObserver.observe(storySection);
}

// Story Image Hover Effect
const storyImage = document.querySelector('.story-image .image-placeholder');
if (storyImage) {
    storyImage.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) rotate(2deg)';
        this.style.transition = 'all 0.4s ease';
    });
    
    storyImage.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
}

// CTA Buttons Hover Effects
const ctaButtons = document.querySelectorAll('.cta-buttons a');
ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) translateY(-3px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) translateY(0)';
    });
});

// Add pulse animation
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
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
document.head.appendChild(pulseStyle);

// Sign In Button
const signInBtn = document.getElementById('signInBtn');
if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Join LocalConnect!\n\nSign in to:\n• Connect with professionals\n• Save your favorites\n• Leave reviews\n• Access exclusive features\n\nComing soon!');
    });
}

// Social Links in Footer
const socialLinks = document.querySelectorAll('.social-links a');
socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) rotate(360deg)';
        this.style.transition = 'all 0.5s ease';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) rotate(0deg)';
    });
});

// Smooth scroll for all links
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

// Parallax effect for page header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.page-header');
    if (header) {
        const scrolled = window.pageYOffset;
        header.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

console.log('LocalConnect About Page Scripts Loaded Successfully!');