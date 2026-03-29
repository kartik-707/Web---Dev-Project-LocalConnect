// ─── Dynamic Services Page ───
// Fetches real business listings from API with filters, search, sort & pagination

const searchInput = document.getElementById('searchInput');
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const ratingFilter = document.getElementById('ratingFilter');
const sortSelect = document.getElementById('sortSelect');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const pagination = document.getElementById('pagination');
const noResults = document.getElementById('noResults');

let currentPage = 1;

// ─── Fetch & render listings ───
async function fetchListings(page = 1) {
    currentPage = page;
    const params = new URLSearchParams();

    const search = searchInput ? searchInput.value.trim() : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const rating = ratingFilter ? ratingFilter.value : '';
    const sort = sortSelect ? sortSelect.value : '';

    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (rating) params.set('rating', rating);
    if (sort) params.set('sort', sort);
    params.set('page', page);
    params.set('limit', 6);

    resultsGrid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light);"><i class="fas fa-spinner fa-spin" style="font-size:30px;"></i><p style="margin-top:15px;">Loading businesses...</p></div>';
    noResults.style.display = 'none';

    try {
        const res = await fetch(`/api/business/listings?${params.toString()}`);
        const data = await res.json();

        if (data.businesses && data.businesses.length > 0) {
            renderResults(data.businesses);
            renderPagination(data.page, data.totalPages, data.total);
            noResults.style.display = 'none';
        } else {
            resultsGrid.innerHTML = '';
            noResults.style.display = 'block';
            pagination.innerHTML = '';
            resultsCount.textContent = 'No results found';
        }
    } catch (err) {
        resultsGrid.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;"><i class="fas fa-exclamation-triangle" style="font-size:30px;"></i><p style="margin-top:15px;">Failed to load listings. Is the server running?</p></div>';
    }
}

// ─── Render result cards ───
function renderResults(businesses) {
    resultsGrid.innerHTML = '';

    businesses.forEach(biz => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-image">
                ${biz.photos && biz.photos.length > 0
                    ? `<img src="/uploads/${biz.photos[0]}" alt="${biz.businessName}">`
                    : `<i class="fas ${getCategoryIcon(biz.category)} placeholder-icon"></i>`
                }
                <span class="badge-verified"><i class="fas fa-check-circle"></i> Verified</span>
            </div>
            <div class="result-content">
                <h3>${escapeHtml(biz.businessName)}</h3>
                <div class="rating-section">
                    <div class="stars">${renderStars(biz.rating)}</div>
                    <span class="rating-text">${biz.rating.toFixed(1)} (${biz.reviewCount} reviews)</span>
                </div>
                <p class="service-category"><i class="fas ${getCategoryIcon(biz.category)}"></i> ${escapeHtml(biz.category)}</p>
                <p class="service-description">${escapeHtml(biz.description || '')}</p>
                <p class="service-location"><i class="fas fa-location-dot"></i> ${escapeHtml(biz.city || '')}${biz.state ? ', ' + escapeHtml(biz.state) : ''}</p>
                <div class="service-features">
                    ${biz.yearsInBusiness ? `<span class="feature-tag"><i class="fas fa-award"></i> ${biz.yearsInBusiness}+ Years</span>` : ''}
                    ${biz.certifications ? `<span class="feature-tag"><i class="fas fa-certificate"></i> Certified</span>` : ''}
                    ${biz.serviceArea ? `<span class="feature-tag"><i class="fas fa-map-marked-alt"></i> ${truncate(biz.serviceArea, 20)}</span>` : ''}
                </div>
                <div class="result-actions">
                    <button class="btn-secondary-small" onclick="viewProfile(${biz.id})"><i class="fas fa-user"></i> View Profile</button>
                    <button class="btn-primary-small" onclick="showContactInfo(${biz.id})"><i class="fas fa-phone"></i> Contact</button>
                    <button class="btn-icon-only" title="View on Google Maps" onclick="openMap('${escapeAttr(biz.address || '')} ${escapeAttr(biz.city || '')} ${escapeAttr(biz.state || '')} ${escapeAttr(biz.zipcode || '')}')"><i class="fas fa-map-location-dot"></i></button>
                </div>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}

// ─── Star rendering ───
function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            html += '<i class="fas fa-star"></i>';
        } else if (rating >= i - 0.5) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star empty"></i>';
        }
    }
    return html;
}

// ─── Category icon mapping ───
function getCategoryIcon(category) {
    const icons = {
        'Plumbing': 'fa-wrench',
        'Electrical': 'fa-bolt',
        'Engineering': 'fa-gears',
        'Cleaning': 'fa-broom',
        'Carpentry': 'fa-hammer',
        'Painting': 'fa-paint-roller'
    };
    return icons[category] || 'fa-briefcase';
}

// ─── Pagination ───
function renderPagination(currentPage, totalPages, total) {
    resultsCount.textContent = `Showing ${total} result${total !== 1 ? 's' : ''}`;
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => fetchListings(currentPage - 1));
    pagination.appendChild(prevBtn);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => { fetchListings(i); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        pagination.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => fetchListings(currentPage + 1));
    pagination.appendChild(nextBtn);
}

// ─── View Profile ───
function viewProfile(id) {
    window.location.href = `business-profile.html?id=${id}`;
}

// ─── Contact Info Modal ───
async function showContactInfo(id) {
    const modal = document.getElementById('contactModal');
    const body = document.getElementById('contactModalBody');
    body.innerHTML = '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--dark-stone);"></i></div>';
    modal.style.display = 'flex';

    try {
        const res = await fetch(`/api/business/listing/${id}`);
        const data = await res.json();
        const biz = data.business;

        body.innerHTML = `
            <h2 style="font-size:24px;margin-bottom:5px;color:var(--text-dark);">${escapeHtml(biz.businessName)}</h2>
            <p style="color:var(--dark-stone);font-weight:600;margin-bottom:25px;"><i class="fas ${getCategoryIcon(biz.category)}"></i> ${escapeHtml(biz.category)}</p>
            
            <div class="contact-info-row">
                <i class="fas fa-phone"></i>
                <div class="info-text">
                    <div class="info-label">Phone</div>
                    <div class="info-value"><a href="tel:${biz.phone}">${escapeHtml(biz.phone)}</a></div>
                </div>
            </div>
            <div class="contact-info-row">
                <i class="fas fa-envelope"></i>
                <div class="info-text">
                    <div class="info-label">Email</div>
                    <div class="info-value"><a href="mailto:${biz.email}">${escapeHtml(biz.email)}</a></div>
                </div>
            </div>
            ${biz.website ? `
            <div class="contact-info-row">
                <i class="fas fa-globe"></i>
                <div class="info-text">
                    <div class="info-label">Website</div>
                    <div class="info-value"><a href="${biz.website}" target="_blank">${escapeHtml(biz.website)}</a></div>
                </div>
            </div>` : ''}
            <div class="contact-info-row">
                <i class="fas fa-location-dot"></i>
                <div class="info-text">
                    <div class="info-label">Address</div>
                    <div class="info-value">${escapeHtml(biz.address || '')}${biz.city ? ', ' + escapeHtml(biz.city) : ''}${biz.state ? ', ' + escapeHtml(biz.state) : ''} ${escapeHtml(biz.zipcode || '')}</div>
                </div>
            </div>
            <div class="contact-info-row">
                <i class="fas fa-clock"></i>
                <div class="info-text">
                    <div class="info-label">Business Hours (Today)</div>
                    <div class="info-value">${getTodayHours(biz.hours)}</div>
                </div>
            </div>
            <div style="margin-top:25px; display:flex; gap:10px;">
                <a href="tel:${biz.phone}" class="btn-primary-small" style="flex:1;text-align:center;text-decoration:none;padding:12px;display:block;"><i class="fas fa-phone"></i> Call Now</a>
                <button class="btn-secondary-small" style="flex:1;padding:12px;" onclick="openMap('${escapeAttr(biz.address || '')} ${escapeAttr(biz.city || '')} ${escapeAttr(biz.state || '')}')"><i class="fas fa-map"></i> Directions</button>
            </div>
        `;
    } catch (err) {
        body.innerHTML = '<p style="color:#e74c3c;text-align:center;">Failed to load contact info.</p>';
    }
}

// Close contact modal
document.getElementById('closeContactModal').addEventListener('click', () => {
    document.getElementById('contactModal').style.display = 'none';
});
document.getElementById('contactModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

// ─── Open Google Maps ───
function openMap(address) {
    const query = encodeURIComponent(address.trim());
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
}

// ─── Get today's hours ───
function getTodayHours(hours) {
    if (!hours || typeof hours !== 'object') return 'Not available';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return hours[today] || 'Not available';
}

// ─── Helpers ───
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function truncate(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

// ─── Event Listeners ───
if (categoryFilter) categoryFilter.addEventListener('change', () => fetchListings(1));
if (ratingFilter) ratingFilter.addEventListener('change', () => fetchListings(1));
if (sortSelect) sortSelect.addEventListener('change', () => fetchListings(1));
if (searchBtn) searchBtn.addEventListener('click', () => fetchListings(1));
if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchListings(1); });

// Read URL params (from homepage search)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('service') && searchInput) searchInput.value = urlParams.get('service');
if (urlParams.get('category') && categoryFilter) categoryFilter.value = urlParams.get('category');

// ─── Initial load ───
fetchListings(1);

console.log('LocalConnect Dynamic Services Loaded Successfully!');
