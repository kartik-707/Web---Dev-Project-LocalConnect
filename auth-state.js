// Shared Auth State — loaded on every page
// Checks session and updates navbar accordingly

(function() {
    async function checkAuthState() {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    updateNavbar(data.user);
                }
            }
        } catch (err) {
            // Server not running or not logged in — leave navbar as-is
        }
    }

    function updateNavbar(user) {
        const navButtons = document.querySelector('.nav-buttons');
        if (!navButtons) return;

        navButtons.innerHTML = `
            <span class="nav-user-greeting" style="
                display: flex; align-items: center; gap: 8px;
                color: var(--dark-stone); font-weight: 600; font-size: 14px;
            ">
                <i class="fas fa-user-circle" style="font-size: 20px;"></i>
                Hi, ${user.firstName}
            </span>
            <a href="#" class="btn-secondary" id="logoutBtn">Logout</a>
            <a href="business-listing.html" class="btn-primary">Add Business</a>
        `;

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                } catch (err) { /* ignore */ }
                window.location.href = 'index.html';
            });
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuthState);
    } else {
        checkAuthState();
    }
})();
