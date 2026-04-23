// Payment App JavaScript
// Handles payment processing and confirmation

class PaymentApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupPaymentForm();
        this.setupPaymentMethods();
        this.setupPaymentValidation();
    }

    setupPaymentForm() {
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePayment(e));
        }
    }

    setupPaymentMethods() {
        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => {
                this.showPaymentFields(method.value);
            });
        });

        // Show fields for initially selected method
        const selectedMethod = document.querySelector('input[name="payment_method"]:checked');
        if (selectedMethod) {
            this.showPaymentFields(selectedMethod.value);
        }
    }

    showPaymentFields(method) {
        // Hide all payment fields
        const allFields = document.querySelectorAll('.payment-fields');
        allFields.forEach(field => field.style.display = 'none');

        // Show selected method fields
        const selectedFields = document.querySelector(`.payment-fields.${method}`);
        if (selectedFields) {
            selectedFields.style.display = 'block';
        }
    }

    setupPaymentValidation() {
        // Card number formatting
        const cardNumber = document.getElementById('card_number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = '';
                for (let i = 0; i < value.length; i++) {
                    if (i % 4 === 0 && i > 0) formattedValue += ' ';
                    formattedValue += value[i];
                }
                e.target.value = formattedValue;
            });
        }

        // Expiry date formatting
        const expiryDate = document.getElementById('expiry_date');
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV validation
        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }

        // UPI ID validation
        const upiId = document.getElementById('upi_id');
        if (upiId) {
            upiId.addEventListener('input', (e) => {
                // Basic UPI ID validation
                const upiRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/;
                if (upiRegex.test(e.target.value)) {
                    e.target.classList.remove('error');
                    e.target.classList.add('success');
                } else {
                    e.target.classList.remove('success');
                    e.target.classList.add('error');
                }
            });
        }
    }

    async handlePayment(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const paymentData = Object.fromEntries(formData);

        // Validate payment data
        if (!this.validatePaymentData(paymentData)) {
            return;
        }

        // Show processing state
        this.setProcessingState(true);

        try {
            // Simulate payment processing
            await this.processPayment(paymentData);

            // Show success
            this.showPaymentSuccess();

        } catch (error) {
            window.movieBookingApp.showAlert('Payment failed. Please try again.', 'error');
        } finally {
            this.setProcessingState(false);
        }
    }

    validatePaymentData(data) {
        const method = data.payment_method;

        if (method === 'card') {
            if (!data.card_number || data.card_number.replace(/\s/g, '').length < 16) {
                window.movieBookingApp.showAlert('Please enter a valid card number.', 'error');
                return false;
            }

            if (!data.expiry_date || !/^\d{2}\/\d{2}$/.test(data.expiry_date)) {
                window.movieBookingApp.showAlert('Please enter a valid expiry date (MM/YY).', 'error');
                return false;
            }

            if (!data.cvv || data.cvv.length < 3) {
                window.movieBookingApp.showAlert('Please enter a valid CVV.', 'error');
                return false;
            }

            if (!data.card_holder_name) {
                window.movieBookingApp.showAlert('Please enter card holder name.', 'error');
                return false;
            }
        }

        if (method === 'upi') {
            if (!data.upi_id || !/^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/.test(data.upi_id)) {
                window.movieBookingApp.showAlert('Please enter a valid UPI ID.', 'error');
                return false;
            }
        }

        if (method === 'netbanking') {
            if (!data.bank_name) {
                window.movieBookingApp.showAlert('Please select a bank.', 'error');
                return false;
            }
        }

        return true;
    }

    async processPayment(paymentData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate payment processing
        const success = Math.random() > 0.1; // 90% success rate

        if (!success) {
            throw new Error('Payment declined');
        }

        // Here you would make actual API call to payment gateway
        // const response = await window.movieBookingApp.ajax('/api/payment/process/', {
        //     method: 'POST',
        //     body: paymentData
        // });

        return { success: true, transaction_id: 'TXN' + Date.now() };
    }

    setProcessingState(processing) {
        const submitBtn = document.querySelector('button[type="submit"]');
        const form = document.getElementById('payment-form');

        if (processing) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
            form.style.opacity = '0.7';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Complete Payment';
            form.style.opacity = '1';
        }
    }

    showPaymentSuccess() {
        // Hide payment form
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.style.display = 'none';
        }

        // Show success message
        const successDiv = document.getElementById('payment-success');
        if (successDiv) {
            successDiv.style.display = 'block';
            successDiv.innerHTML = `
                <div class="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                <p>Your booking has been confirmed.</p>
                <p>Transaction ID: TXN${Date.now()}</p>
                <a href="/booking/history/" class="btn">View My Bookings</a>
            `;
        }

        // Auto-redirect after 5 seconds
        setTimeout(() => {
            window.location.href = '/booking/history/';
        }, 5000);
    }

    // Payment method helpers
    getPaymentMethodDetails(method) {
        const methods = {
            card: {
                name: 'Credit/Debit Card',
                fields: ['card_number', 'expiry_date', 'cvv', 'card_holder_name']
            },
            upi: {
                name: 'UPI',
                fields: ['upi_id']
            },
            netbanking: {
                name: 'Net Banking',
                fields: ['bank_name']
            },
            wallet: {
                name: 'Digital Wallet',
                fields: ['wallet_type']
            }
        };

        return methods[method] || null;
    }

    // Security helpers
    maskCardNumber(cardNumber) {
        const lastFour = cardNumber.slice(-4);
        return '**** **** **** ' + lastFour;
    }

    validateCardExpiry(expiry) {
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expMonth = parseInt(month);
        const expYear = parseInt(year);

        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;

        return true;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('payment-form')) {
        window.paymentApp = new PaymentApp();
    }
});