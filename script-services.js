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

// Get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Set search fields from URL parameters
const searchInput = document.getElementById('searchInput');
const locationInput = document.getElementById('locationInput');

if (searchInput && getURLParameter('service')) {
    searchInput.value = decodeURIComponent(getURLParameter('service'));
}

if (locationInput && getURLParameter('location')) {
    locationInput.value = decodeURIComponent(getURLParameter('location'));
}

if (getURLParameter('category')) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = getURLParameter('category');
        filterResults();
    }
}

// Map Button Click
const mapBtn = document.getElementById('mapBtn');
if (mapBtn) {
    mapBtn.addEventListener('click', function() {
        const location = locationInput.value || 'VIT Chennai, Vandalur-Kelambakkam Road, Chennai';
        alert(`Opening Google Maps for: ${location}\n\nIn production, this would open an interactive map showing all service providers in this area.`);
        // In real app: window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`);
    });
}

// Filter Toggle
const filterToggle = document.getElementById('filterToggle');
let filtersExpanded = false;

if (filterToggle) {
    filterToggle.addEventListener('click', function() {
        filtersExpanded = !filtersExpanded;
        if (filtersExpanded) {
            this.innerHTML = '<i class="fas fa-times"></i> Close Filters';
            alert('Advanced filters panel would expand here:\n\n• Price Range\n• Availability\n• Service Type\n• Distance Radius\n• Special Features');
        } else {
            this.innerHTML = '<i class="fas fa-sliders"></i> Filters';
        }
    });
}

// Category Filter
const categoryFilter = document.getElementById('categoryFilter');
const ratingFilter = document.getElementById('ratingFilter');
const sortSelect = document.getElementById('sortSelect');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');

function filterResults() {
    const selectedCategory = categoryFilter.value;
    const selectedRating = ratingFilter.value;
    const cards = document.querySelectorAll('.result-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardRating = parseFloat(card.getAttribute('data-rating'));
        
        let showCard = true;

        // Category filter
        if (selectedCategory && cardCategory !== selectedCategory) {
            showCard = false;
        }

        // Rating filter
        if (selectedRating) {
            const minRating = parseFloat(selectedRating);
            if (cardRating < minRating) {
                showCard = false;
            }
        }

        if (showCard) {
            card.style.display = 'grid';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    resultsCount.textContent = `Showing ${visibleCount} results`;
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', filterResults);
}

if (ratingFilter) {
    ratingFilter.addEventListener('change', filterResults);
}

// Sort Functionality
if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        const cards = Array.from(document.querySelectorAll('.result-card'));
        
        cards.sort((a, b) => {
            if (sortBy === 'rating') {
                return parseFloat(b.getAttribute('data-rating')) - parseFloat(a.getAttribute('data-rating'));
            } else if (sortBy === 'reviews') {
                const reviewsA = parseInt(a.querySelector('.rating-text').textContent.match(/\d+/)[0]);
                const reviewsB = parseInt(b.querySelector('.rating-text').textContent.match(/\d+/)[0]);
                return reviewsB - reviewsA;
            } else if (sortBy === 'distance') {
                const distA = parseFloat(a.querySelector('.service-location').textContent.match(/[\d.]+/)[0]);
                const distB = parseFloat(b.querySelector('.service-location').textContent.match(/[\d.]+/)[0]);
                return distA - distB;
            }
            return 0;
        });
        
        cards.forEach(card => resultsGrid.appendChild(card));
        
        // Show sorting notification
        showNotification(`Results sorted by: ${this.options[this.selectedIndex].text}`);
    });
}

// View Profile Buttons
const viewProfileBtns = document.querySelectorAll('.view-profile');
viewProfileBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const businessName = this.closest('.result-content').querySelector('h3').textContent;
        const rating = this.closest('.result-content').querySelector('.rating-text').textContent;
        alert(`Opening detailed profile for:\n\n${businessName}\nRating: ${rating}\n\nProfile includes:\n• Full service details\n• Photo gallery\n• Customer reviews\n• Pricing information\n• Contact options`);
    });
});

// Contact Buttons
const contactBtns = document.querySelectorAll('.contact-btn');
contactBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const businessName = this.closest('.result-content').querySelector('h3').textContent;
        alert(`Contact ${businessName}\n\nPhone: +91 98765 43210\nEmail: contact@localconnect.com\n\nBusiness Hours:\nMon-Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM`);
    });
});

// Map Location Buttons
const mapLocationBtns = document.querySelectorAll('.map-location');
mapLocationBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const businessName = this.closest('.result-content').querySelector('h3').textContent;
        const location = this.closest('.result-content').querySelector('.service-location').textContent;
        alert(`Opening map for:\n${businessName}\n${location}\n\nThis would show the exact location on Google Maps with directions.`);
    });
});

// Pagination
let currentPage = 1;
const pageButtons = document.querySelectorAll('.page-btn[data-page]');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');

function updatePagination(page) {
    currentPage = page;
    
    // Update active state
    pageButtons.forEach(btn => {
        if (parseInt(btn.getAttribute('data-page')) === page) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = page === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = page === 5;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showNotification(`Showing page ${page} of results`);
}

pageButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const page = parseInt(this.getAttribute('data-page'));
        updatePagination(page);
    });
});

if (prevBtn) {
    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            updatePagination(currentPage - 1);
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', function() {
        if (currentPage < 5) {
            updatePagination(currentPage + 1);
        }
    });
}

// Result Cards Hover Effect
const resultCards = document.querySelectorAll('.result-card');
resultCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
        this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Feature Tags Interaction
const featureTags = document.querySelectorAll('.feature-tag');
featureTags.forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'all 0.2s ease';
    });
    
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Search functionality
const searchForm = document.querySelector('.search-bar-section');
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const service = searchInput.value.trim();
    const location = locationInput.value.trim();
    
    if (service || location) {
        showNotification(`Searching for: ${service || 'All services'} in ${location || 'All locations'}`);
        // In real app: update URL and fetch results
    }
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
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
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
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

// Sign In Button
const signInBtn = document.getElementById('signInBtn');
if (signInBtn) {
    signInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Sign In feature coming soon!\n\nBenefits:\n• Save favorite professionals\n• Track service requests\n• Leave reviews\n• Get special offers');
    });
}

console.log('LocalConnect Services Page Scripts Loaded Successfully!');