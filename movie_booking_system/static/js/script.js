// Modern JavaScript for Movie Booking System

window.movieBookingApp = {
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },

    async ajax(url, options = {}) {
        const headers = Object.assign({
            'Content-Type': 'application/json',
        }, options.headers || {});

        let csrftoken = this.getCookie('csrftoken');
        if (!csrftoken) {
            csrftoken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        }
        if (csrftoken) {
            headers['X-CSRFToken'] = csrftoken;
        }

        const response = await fetch(url, Object.assign({}, options, { headers, credentials: 'same-origin' }));
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok) {
            let error = 'Request failed.';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                error = data.message || error;
            } else {
                error = await response.text();
            }
            throw new Error(error);
        }
        return contentType.includes('application/json') ? await response.json() : await response.text();
    },

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 4000);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Page load animation
    document.body.classList.add('loaded');

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form validation enhancement
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    });

    // Alert auto-hide
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });

    // Movie card hover effects
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
            ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Keyboard navigation for seat selection
    if (document.querySelector('.seats-grid')) {
        document.addEventListener('keydown', function(e) {
            if (e.key >= '1' && e.key <= '9') {
                const seats = document.querySelectorAll('.seat.available');
                if (seats[e.key - 1]) {
                    seats[e.key - 1].click();
                }
            }
        });
    }
});

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    // Remove previous validation classes
    field.classList.remove('error', 'success');

    // Basic validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }

    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
    }

    if (field.type === 'password' && value && value.length < 8) {
        isValid = false;
    }

    // Apply validation classes
    if (value) {
        field.classList.add(isValid ? 'success' : 'error');
    }

    return isValid;
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}
