// User App JavaScript
// Handles login, registration, and user-related interactions

class UserApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.setupFormSubmission();
    }

    // Form Validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        this.validateField(input);
                    }
                });
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove previous validation classes
        field.classList.remove('error', 'success');
        this.removeErrorMessage(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${field.name} is required`;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (field.type === 'password' && value) {
            if (field.name === 'password1' || field.name === 'password') {
                const strength = this.checkPasswordStrength(value);
                if (strength < 2) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters with numbers and letters';
                }
            }
        }

        // Phone validation (optional)
        if (field.name === 'phone' && value) {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Date validation
        if (field.type === 'date' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            const minAge = 13; // Minimum age for movie booking
            const maxAge = 120;

            const age = today.getFullYear() - selectedDate.getFullYear();
            if (age < minAge || age > maxAge) {
                isValid = false;
                errorMessage = `Age must be between ${minAge} and ${maxAge} years`;
            }
        }

        // Apply validation styling
        if (value) {
            field.classList.add(isValid ? 'success' : 'error');
            if (!isValid) {
                this.showErrorMessage(field, errorMessage);
            }
        }

        return isValid;
    }

    checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    showErrorMessage(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';

        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    removeErrorMessage(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Password Toggle Visibility
    setupPasswordToggle() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '👁️';
            toggleBtn.style.position = 'absolute';
            toggleBtn.style.right = '10px';
            toggleBtn.style.top = '50%';
            toggleBtn.style.transform = 'translateY(-50%)';
            toggleBtn.style.background = 'none';
            toggleBtn.style.border = 'none';
            toggleBtn.style.cursor = 'pointer';
            toggleBtn.style.fontSize = '1rem';

            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            field.parentNode.insertBefore(wrapper, field);
            wrapper.appendChild(field);
            wrapper.appendChild(toggleBtn);

            toggleBtn.addEventListener('click', () => {
                const isVisible = field.type === 'text';
                field.type = isVisible ? 'password' : 'text';
                toggleBtn.innerHTML = isVisible ? '👁️' : '🙈';
            });
        });
    }

    // Form Submission with AJAX
    setupFormSubmission() {
        const loginForm = document.querySelector('form[action*="login"]');
        const registerForm = document.querySelector('form[action*="register"]');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate all fields
        const inputs = form.querySelectorAll('input');
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            window.movieBookingApp.showAlert('Please fix the errors and try again.', 'error');
            return;
        }

        try {
            const response = await window.movieBookingApp.ajax('/user/login/', {
                method: 'POST',
                body: data
            });

            if (response.success) {
                window.movieBookingApp.showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/movies/';
                }, 1500);
            } else {
                window.movieBookingApp.showAlert(response.message || 'Login failed.', 'error');
            }
        } catch (error) {
            window.movieBookingApp.showAlert('Login failed. Please try again.', 'error');
        }
    }

    async handleRegistration(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate all fields
        const inputs = form.querySelectorAll('input');
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            window.movieBookingApp.showAlert('Please fix the errors and try again.', 'error');
            return;
        }

        // Check password confirmation
        if (data.password1 !== data.password2) {
            window.movieBookingApp.showAlert('Passwords do not match.', 'error');
            return;
        }

        try {
            const response = await window.movieBookingApp.ajax('/user/register/', {
                method: 'POST',
                body: data
            });

            if (response.success) {
                window.movieBookingApp.showAlert('Registration successful! Please login.', 'success');
                setTimeout(() => {
                    window.location.href = '/user/login/';
                }, 1500);
            } else {
                window.movieBookingApp.showAlert(response.message || 'Registration failed.', 'error');
            }
        } catch (error) {
            window.movieBookingApp.showAlert('Registration failed. Please try again.', 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.auth-form')) {
        window.userApp = new UserApp();
    }
});