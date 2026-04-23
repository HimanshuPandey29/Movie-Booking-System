// Show App JavaScript
// Handles show listings, filtering, and selection

class ShowApp {
    constructor() {
        this.selectedShow = null;
        this.init();
    }

    init() {
        this.setupShowInteractions();
        this.setupShowFilters();
        this.setupShowStorage();
        this.loadShowData();
    }

    // Show Interaction Handlers
    setupShowInteractions() {
        // Show card click handlers
        const showCards = document.querySelectorAll('.show-card');
        showCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn')) {
                    // Click on card (not button) - select show
                    const showId = card.dataset.showId;
                    if (showId) {
                        this.selectShow(showId, card);
                    }
                }
            });
        });

        // Book tickets button handlers
        const bookButtons = document.querySelectorAll('.btn-book-tickets');
        bookButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleBookTickets(e));
        });
    }

    selectShow(showId, cardElement = null) {
        // Remove previous selection
        document.querySelectorAll('.show-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new show
        if (cardElement) {
            cardElement.classList.add('selected');
        } else {
            const card = document.querySelector(`[data-show-id="${showId}"]`);
            if (card) card.classList.add('selected');
        }

        this.selectedShow = showId;
        this.storeSelectedShow(showId);

        // Update UI
        this.updateBookButtons();
    }

    handleBookTickets(e) {
        e.preventDefault();
        const button = e.target;
        const showId = button.dataset.showId || this.selectedShow;

        if (showId) {
            // Store selected show
            this.storeSelectedShow(showId);

            // Check if user is logged in
            const isLoggedIn = document.querySelector('[href*="logout"]') !== null;

            if (!isLoggedIn) {
                window.movieBookingApp.showAlert('Please login to book tickets.', 'info');
                setTimeout(() => {
                    window.location.href = '/user/login/';
                }, 1500);
                return;
            }

            // Redirect to booking page
            window.location.href = `/booking/book-seats/?show=${showId}`;
        } else {
            window.movieBookingApp.showAlert('Please select a show first.', 'error');
        }
    }

    // Show Data Storage
    storeSelectedShow(showId) {
        try {
            localStorage.setItem('selectedShow', showId);
            sessionStorage.setItem('selectedShow', showId);
            this.selectedShow = showId;
        } catch (error) {
            console.warn('Failed to store show selection:', error);
        }
    }

    getSelectedShow() {
        return localStorage.getItem('selectedShow') || sessionStorage.getItem('selectedShow');
    }

    // Show Filters
    setupShowFilters() {
        const dateFilter = document.getElementById('date-filter');
        const timeFilter = document.getElementById('time-filter');
        const theatreFilter = document.getElementById('theatre-filter');

        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterShows());
        }

        if (timeFilter) {
            timeFilter.addEventListener('change', () => this.filterShows());
        }

        if (theatreFilter) {
            theatreFilter.addEventListener('change', () => this.filterShows());
        }
    }

    filterShows() {
        const selectedDate = document.getElementById('date-filter')?.value;
        const selectedTime = document.getElementById('time-filter')?.value;
        const selectedTheatre = document.getElementById('theatre-filter')?.value;

        const showCards = document.querySelectorAll('.show-card');

        showCards.forEach(card => {
            const showDate = card.dataset.date;
            const showTime = card.dataset.time;
            const theatreId = card.dataset.theatreId;

            const matchesDate = !selectedDate || showDate === selectedDate;
            const matchesTime = !selectedTime || showTime.startsWith(selectedTime);
            const matchesTheatre = !selectedTheatre || theatreId === selectedTheatre;

            if (matchesDate && matchesTime && matchesTheatre) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });

        this.updateNoShowsMessage();
    }

    updateNoShowsMessage() {
        const visibleCards = document.querySelectorAll('.show-card[style*="display: block"]');
        let noShowsMsg = document.getElementById('no-shows');

        if (visibleCards.length === 0) {
            if (!noShowsMsg) {
                noShowsMsg = document.createElement('div');
                noShowsMsg.id = 'no-shows';
                noShowsMsg.className = 'card';
                noShowsMsg.innerHTML = '<p>No shows found matching your criteria.</p>';
                document.querySelector('.shows-grid').appendChild(noShowsMsg);
            }
            noShowsMsg.style.display = 'block';
        } else if (noShowsMsg) {
            noShowsMsg.style.display = 'none';
        }
    }

    updateBookButtons() {
        const bookButtons = document.querySelectorAll('.btn-book-tickets');
        bookButtons.forEach(button => {
            const showId = button.dataset.showId;
            button.disabled = !this.selectedShow || this.selectedShow !== showId;
        });
    }

    // Load Show Data (AJAX)
    async loadShowData() {
        const movieId = this.getMovieId();
        if (!movieId || !document.querySelector('.shows-grid')) return;

        try {
            const data = await window.movieBookingApp.ajax(`/api/movies/${movieId}/shows/`);
            this.renderShows(data.shows);
        } catch (error) {
            console.warn('Failed to load shows via AJAX, using static content');
        }
    }

    renderShows(shows) {
        const grid = document.querySelector('.shows-grid');
        if (!grid || !shows) return;

        grid.innerHTML = '';

        shows.forEach(show => {
            const showCard = this.createShowCard(show);
            grid.appendChild(showCard);
        });

        // Re-setup interactions for new cards
        this.setupShowInteractions();
    }

    createShowCard(show) {
        const card = document.createElement('div');
        card.className = 'card show-card';
        card.dataset.showId = show.id;
        card.dataset.date = show.date;
        card.dataset.time = show.time;
        card.dataset.theatreId = show.theatre_id;

        const showDate = new Date(show.date);
        const formattedDate = showDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="show-header">
                <h3>${show.theatre_name}</h3>
                <span class="show-time">${show.time}</span>
            </div>
            <div class="show-details">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Screen:</strong> ${show.screen_number}</p>
                <p><strong>Available Seats:</strong> ${show.available_seats}</p>
                <p><strong>Price:</strong> ₹${show.price}</p>
            </div>
            <div class="show-actions">
                <button class="btn btn-secondary btn-book-tickets" data-show-id="${show.id}">
                    Book Tickets
                </button>
            </div>
        `;

        return card;
    }

    // Utility Functions
    getMovieId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('movie') || window.movieApp?.getSelectedMovie();
    }

    // Show time sorting
    sortShowsByTime() {
        const showsGrid = document.querySelector('.shows-grid');
        if (!showsGrid) return;

        const showCards = Array.from(showsGrid.querySelectorAll('.show-card'));
        showCards.sort((a, b) => {
            const timeA = a.dataset.time;
            const timeB = b.dataset.time;
            return timeA.localeCompare(timeB);
        });

        showCards.forEach(card => showsGrid.appendChild(card));
    }

    // Auto-select first available show
    autoSelectFirstShow() {
        const firstShow = document.querySelector('.show-card');
        if (firstShow && !this.selectedShow) {
            const showId = firstShow.dataset.showId;
            this.selectShow(showId, firstShow);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.shows-grid, .show-card')) {
        window.showApp = new ShowApp();

        // Auto-select first show after a short delay
        setTimeout(() => {
            window.showApp.autoSelectFirstShow();
        }, 500);
    }
});