// Booking App JavaScript
// Handles seat selection, booking summary, and payment

class BookingApp {
    constructor() {
        this.selectedSeats = new Set();
        this.bookedSeats = new Set();
        this.ticketPrice = 150; // Default price per ticket (INR)
        this.init();
    }

    init() {
        this.loadPricesFromButton();
        this.loadBookedSeats();
        this.setupSeatSelection();
        this.setupBookingSummary();
        this.setupBookingForm();
        this.setupModalSystem();
        this.updateUI();
    }

    // Load prices from the book button data attributes
    loadPricesFromButton() {
        const bookBtn = document.querySelector('.btn-book');
        if (bookBtn) {
            this.ticketPrice = parseFloat(bookBtn.dataset.price) || 150;
        }
    }

    // Load booked seats from server
    async loadBookedSeats() {
        try {
            const showId = this.getShowId();
            if (!showId) return;

            const data = await window.movieBookingApp.ajax(`/api/shows/${showId}/booked-seats/`);
            this.bookedSeats = new Set(data.bookedSeats || []);
            this.renderSeats();
        } catch (error) {
            console.warn('Failed to load booked seats:', error);
            // Fallback: render seats without booked data
            this.renderSeats();
        }
    }

    // Seat Selection System
    setupSeatSelection() {
        const seatGrid = document.querySelector('.seat-grid');
        if (!seatGrid) return;

        // Create seat grid if not exists
        if (!seatGrid.children.length) {
            this.renderSeats();
        }

        // Seat click handlers
        seatGrid.addEventListener('click', (e) => {
            const seat = e.target.closest('.seat');
            if (seat && !seat.classList.contains('booked')) {
                this.toggleSeat(seat);
            }
        });
    }

    renderSeats() {
        const seatGrid = document.querySelector('.seat-grid');
        if (!seatGrid) return;

        seatGrid.innerHTML = '';

        // Create 8 rows, 10 seats per row
        for (let row = 1; row <= 8; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';

            // Row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = String.fromCharCode(64 + row); // A, B, C, etc.
            rowDiv.appendChild(rowLabel);

            // Seats
            for (let seat = 1; seat <= 10; seat++) {
                const seatDiv = document.createElement('div');
                const seatId = `${String.fromCharCode(64 + row)}${seat}`;

                seatDiv.className = 'seat';
                seatDiv.dataset.seatId = seatId;
                seatDiv.textContent = seat;

                // Check if seat is booked
                if (this.bookedSeats.has(seatId)) {
                    seatDiv.classList.add('booked');
                }

                // Check if seat is selected
                if (this.selectedSeats.has(seatId)) {
                    seatDiv.classList.add('selected');
                }

                rowDiv.appendChild(seatDiv);
            }

            seatGrid.appendChild(rowDiv);
        }

        // Add screen indicator
        const screenDiv = document.createElement('div');
        screenDiv.className = 'screen';
        screenDiv.textContent = 'SCREEN';
        seatGrid.insertBefore(screenDiv, seatGrid.firstChild);
    }

    toggleSeat(seatElement) {
        const seatId = seatElement.dataset.seatId;

        if (this.selectedSeats.has(seatId)) {
            // Deselect seat
            this.selectedSeats.delete(seatId);
            seatElement.classList.remove('selected');
        } else {
            // Select seat
            this.selectedSeats.add(seatId);
            seatElement.classList.add('selected');
        }

        this.updateUI();
    }

    // Booking Summary
    setupBookingSummary() {
        // Summary is updated in updateUI()
    }

    updateUI() {
        this.updateSeatCount();
        this.updateTotalPrice();
        this.updateBookingSummary();
        this.updateBookButton();
    }

    updateSeatCount() {
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            countElement.textContent = this.selectedSeats.size;
        }
    }

    updateTotalPrice() {
        const totalPrice = this.selectedSeats.size * this.ticketPrice;
        const priceElement = document.getElementById('total-price');
        if (priceElement) {
            priceElement.textContent = `₹${totalPrice}`;
        }
    }

    updateBookingSummary() {
        const summaryElement = document.querySelector('.booking-summary');
        if (!summaryElement) return;

        const selectedSeatsList = document.getElementById('selected-seats-list');
        if (selectedSeatsList) {
            if (this.selectedSeats.size > 0) {
                const seatsArray = Array.from(this.selectedSeats).sort();
                selectedSeatsList.innerHTML = seatsArray.map(seat =>
                    `<span class="seat-tag">${seat}</span>`
                ).join('');
            } else {
                selectedSeatsList.innerHTML = '<em>No seats selected</em>';
            }
        }
    }

    updateBookButton() {
        const bookBtn = document.querySelector('.btn-book');
        if (bookBtn) {
            bookBtn.disabled = this.selectedSeats.size === 0;
            bookBtn.textContent = this.selectedSeats.size === 0 ?
                'Select Seats to Book' : `Book ${this.selectedSeats.size} Seat${this.selectedSeats.size > 1 ? 's' : ''}`;
        }
    }

    // Booking Form and Modal System
    setupBookingForm() {
        const bookBtn = document.querySelector('.btn-book');
        if (bookBtn) {
            bookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.selectedSeats.size > 0) {
                    this.showConfirmationModal();
                }
            });
        }
    }

    setupModalSystem() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Close modal buttons
        const closeButtons = document.querySelectorAll('.modal-close, .btn-cancel');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                this.closeModal(modal);
            });
        });
    }

    showConfirmationModal() {
        const modal = document.getElementById('booking-confirmation-modal');
        if (!modal) return;

        // Update modal content
        const seatsList = document.getElementById('confirm-seats');
        const totalPrice = document.getElementById('confirm-total');

        if (seatsList) {
            seatsList.textContent = Array.from(this.selectedSeats).sort().join(', ');
        }

        if (totalPrice) {
            totalPrice.textContent = `₹${this.selectedSeats.size * this.ticketPrice}`;
        }

        modal.style.display = 'block';
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Booking Submission
    async submitBooking() {
        const showId = this.getShowId();
        if (!showId || this.selectedSeats.size === 0) {
            window.movieBookingApp.showAlert('Please select seats to book.', 'error');
            return;
        }

        const bookingData = {
            show_id: showId,
            seats: Array.from(this.selectedSeats),
            total_price: this.selectedSeats.size * this.ticketPrice
        };

        try {
            const response = await window.movieBookingApp.ajax('/booking/create/', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });

            if (response.success) {
                this.closeModal(document.getElementById('booking-confirmation-modal'));
                this.selectedSeats.forEach(seat => this.bookedSeats.add(seat));
                this.selectedSeats.clear();
                this.renderSeats();
                this.updateUI();
                window.location.href = response.payment_url;
            } else {
                window.movieBookingApp.showAlert(response.message || 'Booking failed.', 'error');
            }
        } catch (error) {
            window.movieBookingApp.showAlert(error.message || 'Booking failed. Please try again.', 'error');
        }
    }

    showPaymentSuccessModal() {
        const modal = document.getElementById('payment-success-modal');
        if (modal) {
            modal.style.display = 'block';
            // Auto-close after 3 seconds
            setTimeout(() => {
                this.closeModal(modal);
                // Redirect to bookings page
                window.location.href = '/booking/history/';
            }, 3000);
        }
    }

    // Utility Functions
    getShowId() {
        const urlParams = new URLSearchParams(window.location.search);
        const queryShowId = urlParams.get('show');
        if (queryShowId) {
            return queryShowId;
        }

        const showInfo = document.getElementById('show-info');
        if (showInfo) {
            return showInfo.dataset.showId;
        }

        const match = window.location.pathname.match(/\/booking\/book\/(\d+)\/?$/);
        if (match) {
            return match[1];
        }

        return null;
    }

    // Seat Selection Helpers
    selectSeats(seats) {
        seats.forEach(seatId => {
            if (!this.bookedSeats.has(seatId)) {
                this.selectedSeats.add(seatId);
            }
        });
        this.renderSeats();
        this.updateUI();
    }

    clearSelection() {
        this.selectedSeats.clear();
        this.renderSeats();
        this.updateUI();
    }

    // Keyboard shortcuts for seat selection
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'a':
                        e.preventDefault();
                        // Select all available seats in a row (example)
                        break;
                    case 'c':
                        e.preventDefault();
                        this.clearSelection();
                        break;
                }
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.seat-grid, .booking-summary')) {
        window.bookingApp = new BookingApp();
    }
});

// Global function for modal buttons
function confirmBooking() {
    if (window.bookingApp) {
        window.bookingApp.submitBooking();
    }
}