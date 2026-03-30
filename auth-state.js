// Shared Auth State — loaded on every page
// Checks session and updates navbar + footer based on account type
// Includes interactive hover/click effects for the navbar

(function() {
    window.__localconnectUser = null;

    async function checkAuthState() {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    window.__localconnectUser = data.user;
                    updateNavbar(data.user);
                    updateFooter(data.user);
                }
            }
        } catch (err) {
            // Server not running or not logged in
        }
        // Always add nav interactions after auth check
        addNavInteractions();
    }

    function injectAuthStyles() {
        if (document.getElementById('auth-nav-styles')) return;
        const style = document.createElement('style');
        style.id = 'auth-nav-styles';
        style.textContent = `
            /* ─── Auth nav buttons ─── */
            .nav-user-area {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }
            .nav-user-pill {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--dark-stone);
                font-weight: 600;
                font-size: 14px;
                padding: 8px 16px;
                background: var(--stone-cream);
                border-radius: 24px;
                white-space: nowrap;
                cursor: default;
                transition: all 0.3s ease;
                user-select: none;
            }
            .nav-user-pill i {
                font-size: 18px;
                transition: transform 0.3s ease;
            }
            .nav-user-pill:hover {
                background: var(--light-stone);
                transform: scale(1.03);
            }
            .nav-user-pill:hover i {
                transform: rotate(15deg);
            }
            .nav-auth-link {
                padding: 8px 18px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 13px;
                transition: all 0.3s ease;
                cursor: pointer;
                white-space: nowrap;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border: none;
                position: relative;
                overflow: hidden;
            }
            .nav-auth-link::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                width: 0;
                height: 2px;
                background: currentColor;
                transition: all 0.3s ease;
                transform: translateX(-50%);
                opacity: 0.5;
            }
            .nav-auth-link:hover::after {
                width: 70%;
            }
            .nav-auth-link.primary {
                background: var(--dark-stone);
                color: var(--white);
            }
            .nav-auth-link.primary:hover {
                background: var(--accent-brown);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(107, 87, 68, 0.3);
            }
            .nav-auth-link.primary:active {
                transform: translateY(0px) scale(0.97);
                box-shadow: none;
            }
            .nav-auth-link.primary::after {
                background: rgba(255,255,255,0.4);
            }
            .nav-auth-link.outline {
                background: transparent;
                color: var(--text-light);
                border: 1.5px solid var(--light-stone);
            }
            .nav-auth-link.outline:hover {
                background: var(--stone-cream);
                color: var(--text-dark);
                border-color: var(--dark-stone);
                transform: translateY(-2px);
            }
            .nav-auth-link.outline:active {
                transform: translateY(0px) scale(0.97);
            }

            /* ─── Nav link hover effects ─── */
            .nav-menu a {
                position: relative;
                transition: color 0.3s ease, transform 0.2s ease;
            }
            .nav-menu a::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 0;
                height: 2.5px;
                background: var(--dark-stone);
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            .nav-menu a:hover::after,
            .nav-menu a.active::after {
                width: 100%;
            }
            .nav-menu a:hover {
                color: var(--dark-stone);
                transform: translateY(-1px);
            }
            .nav-menu a:active {
                transform: translateY(1px);
            }

            /* ─── Logo hover ─── */
            .logo {
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            .logo:hover {
                transform: scale(1.04);
            }
            .logo:hover i {
                animation: logoBounce 0.5s ease;
            }
            .logo:active {
                transform: scale(0.97);
            }

            @keyframes logoBounce {
                0%, 100% { transform: translateY(0); }
                40% { transform: translateY(-4px); }
                60% { transform: translateY(-2px); }
            }

            /* ─── Ripple effect for buttons ─── */
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.35);
                transform: scale(0);
                animation: rippleAnim 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes rippleAnim {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            /* ─── Footer link hover effects ─── */
            .footer-col ul li a {
                transition: all 0.3s ease;
                display: inline-block;
            }
            .footer-col ul li a:hover {
                padding-left: 8px;
                opacity: 1;
                color: white;
            }

            /* ─── Social link interactive effects ─── */
            .social-links a {
                transition: all 0.3s ease;
            }
            .social-links a:hover {
                transform: translateY(-3px) scale(1.1);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .social-links a:active {
                transform: translateY(0) scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }

    // ─── Add interactive JS events to navbar ───
    function addNavInteractions() {
        injectAuthStyles();

        // Ripple effect on primary/secondary buttons
        document.querySelectorAll('.btn-primary, .btn-secondary, .nav-auth-link, .btn-signin, .btn-primary-large, .btn-secondary-large').forEach(btn => {
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Nav menu links — scale on hover with slight bounce
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });
            link.addEventListener('mouseleave', function() {
                this.style.transition = 'transform 0.2s ease';
            });
        });

        // Logo icon — rotate on hover
        const logoIcon = document.querySelector('.logo i');
        if (logoIcon) {
            const logo = document.querySelector('.logo');
            logo.addEventListener('mouseenter', () => {
                logoIcon.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                logoIcon.style.transform = 'rotate(-15deg) scale(1.15)';
            });
            logo.addEventListener('mouseleave', () => {
                logoIcon.style.transition = 'transform 0.3s ease';
                logoIcon.style.transform = 'rotate(0deg) scale(1)';
            });
        }

        // Category cards — tilt on hover
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                this.style.transform = `translateY(-8px) perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.transition = 'transform 0.4s ease';
            });
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'transform 0.1s ease';
            });
        });

        // Step cards — number counter animation on scroll
        const stepNumbers = document.querySelectorAll('.step-number');
        if (stepNumbers.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'stepPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            stepNumbers.forEach(num => observer.observe(num));

            const popStyle = document.createElement('style');
            popStyle.textContent = `
                @keyframes stepPop {
                    0% { transform: translateX(-50%) scale(0); }
                    60% { transform: translateX(-50%) scale(1.3); }
                    100% { transform: translateX(-50%) scale(1); }
                }
            `;
            document.head.appendChild(popStyle);
        }

        // Stat items — count up animation
        const statItems = document.querySelectorAll('.stat-item h3');
        if (statItems.length > 0) {
            const statObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        statObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            statItems.forEach(item => statObserver.observe(item));
        }

        // Footer social links — spin icon on hover
        document.querySelectorAll('.social-links a').forEach(link => {
            link.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transition = 'transform 0.4s ease';
                    icon.style.transform = 'rotate(360deg)';
                }
            });
            link.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transition = 'transform 0.4s ease';
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });

        // Professional cards / result cards — image zoom on hover
        document.querySelectorAll('.professional-card, .result-card').forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                card.addEventListener('mouseenter', () => {
                    img.style.transition = 'transform 0.5s ease';
                    img.style.transform = 'scale(1.08)';
                });
                card.addEventListener('mouseleave', () => {
                    img.style.transition = 'transform 0.5s ease';
                    img.style.transform = 'scale(1)';
                });
            }
        });

        // Navbar scroll effect — shadow deepens on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                if (scrollY > 10) {
                    navbar.style.boxShadow = '0 4px 20px rgba(44, 36, 22, 0.15)';
                    navbar.style.backdropFilter = 'blur(10px)';
                } else {
                    navbar.style.boxShadow = '0 2px 10px rgba(44, 36, 22, 0.1)';
                    navbar.style.backdropFilter = 'none';
                }
                // Subtle hide/show on scroll direction
                if (scrollY > lastScroll && scrollY > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                    navbar.style.transition = 'transform 0.35s ease, box-shadow 0.3s ease';
                } else {
                    navbar.style.transform = 'translateY(0)';
                    navbar.style.transition = 'transform 0.35s ease, box-shadow 0.3s ease';
                }
                lastScroll = scrollY;
            });
        }
    }

    // Counter animation helper
    function animateCounter(element) {
        const text = element.textContent;
        const match = text.match(/([\d,]+)/);
        if (!match) return;
        const target = parseInt(match[1].replace(/,/g, ''));
        const suffix = text.replace(match[1], '').trim();
        const prefix = text.substring(0, text.indexOf(match[1]));
        const duration = 1500;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            element.textContent = prefix + current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else element.textContent = text; // restore original
        }
        requestAnimationFrame(update);
    }

    function updateNavbar(user) {
        const navButtons = document.querySelector('.nav-buttons');
        if (!navButtons) return;

        const isBusiness = user.accountType === 'business';

        navButtons.className = 'nav-user-area';
        navButtons.innerHTML = `
            <span class="nav-user-pill">
                <i class="fas fa-user-circle"></i>
                Hi, ${user.firstName}
            </span>
            ${isBusiness
                ? `<a href="my-listings.html" class="nav-auth-link primary"><i class="fas fa-store"></i> My Listings</a>`
                : `<a href="services.html" class="nav-auth-link primary"><i class="fas fa-search"></i> Services</a>`
            }
            <a href="#" class="nav-auth-link outline" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        `;

        document.getElementById('logoutBtn').addEventListener('click', async function(e) {
            e.preventDefault();
            // Animate the button before logout
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            this.style.pointerEvents = 'none';
            try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            } catch (err) { /* ignore */ }
            setTimeout(() => { window.location.href = 'index.html'; }, 500);
        });

        // Update nav menu
        const navMenu = document.querySelector('.nav-menu, #navMenu');
        if (navMenu) {
            const links = navMenu.querySelectorAll('a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!isBusiness && href === 'business-listing.html') {
                    link.closest('li').style.display = 'none';
                }
            });
            if (isBusiness) {
                const hasMyListings = Array.from(links).some(l => l.getAttribute('href') === 'my-listings.html');
                if (!hasMyListings) {
                    const li = document.createElement('li');
                    li.innerHTML = '<a href="my-listings.html">My Listings</a>';
                    const contactLi = Array.from(navMenu.children).find(child => {
                        const a = child.querySelector('a');
                        return a && a.getAttribute('href') === 'contact.html';
                    });
                    if (contactLi) navMenu.insertBefore(li, contactLi);
                    else navMenu.appendChild(li);
                }
            }
        }

        // Re-apply interactions to new DOM elements
        setTimeout(() => addNavInteractions(), 50);
    }

    function updateFooter(user) {
        if (!user) return;
        const isBusiness = user.accountType === 'business';

        document.querySelectorAll('.footer a').forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();

            if (href === 'signin.html' && (text === 'My Account' || text === 'Sign In')) {
                if (isBusiness) {
                    link.setAttribute('href', 'my-listings.html');
                    link.textContent = 'My Dashboard';
                } else {
                    link.setAttribute('href', 'services.html');
                    link.textContent = 'My Account';
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuthState);
    } else {
        checkAuthState();
    }
})();
