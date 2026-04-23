// Theatre App JavaScript
// Handles theatre-related interactions

class TheatreApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupTheatreInteractions();
        this.setupTheatreFilters();
    }

    setupTheatreInteractions() {
        // Theatre card click handlers
        const theatreCards = document.querySelectorAll('.theatre-card');
        theatreCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn')) {
                    // Click on card - view theatre details
                    const theatreId = card.dataset.theatreId;
                    if (theatreId) {
                        window.location.href = `/theatres/${theatreId}/`;
                    }
                }
            });
        });

        // View shows button handlers
        const viewShowsButtons = document.querySelectorAll('.btn-view-shows');
        viewShowsButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const theatreId = button.dataset.theatreId;
                if (theatreId) {
                    window.location.href = `/show/?theatre=${theatreId}`;
                }
            });
        });
    }

    setupTheatreFilters() {
        const locationFilter = document.getElementById('location-filter');
        const ratingFilter = document.getElementById('rating-filter');

        if (locationFilter) {
            locationFilter.addEventListener('change', () => this.filterTheatres());
        }

        if (ratingFilter) {
            ratingFilter.addEventListener('change', () => this.filterTheatres());
        }
    }

    filterTheatres() {
        const selectedLocation = document.getElementById('location-filter')?.value;
        const selectedRating = document.getElementById('rating-filter')?.value;

        const theatreCards = document.querySelectorAll('.theatre-card');

        theatreCards.forEach(card => {
            const location = card.dataset.location;
            const rating = parseFloat(card.dataset.rating) || 0;

            const matchesLocation = !selectedLocation || location === selectedLocation;
            const matchesRating = !selectedRating || rating >= parseFloat(selectedRating);

            if (matchesLocation && matchesRating) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });

        this.updateNoTheatresMessage();
    }

    updateNoTheatresMessage() {
        const visibleCards = document.querySelectorAll('.theatre-card[style*="display: block"]');
        let noTheatresMsg = document.getElementById('no-theatres');

        if (visibleCards.length === 0) {
            if (!noTheatresMsg) {
                noTheatresMsg = document.createElement('div');
                noTheatresMsg.id = 'no-theatres';
                noTheatresMsg.className = 'card';
                noTheatresMsg.innerHTML = '<p>No theatres found matching your criteria.</p>';
                document.querySelector('.theatres-grid').appendChild(noTheatresMsg);
            }
            noTheatresMsg.style.display = 'block';
        } else if (noTheatresMsg) {
            noTheatresMsg.style.display = 'none';
        }
    }

    // Load theatre data via AJAX
    async loadTheatreData() {
        if (!document.querySelector('.theatres-grid')) return;

        try {
            const data = await window.movieBookingApp.ajax('/api/theatres/');
            this.renderTheatres(data.theatres);
        } catch (error) {
            console.warn('Failed to load theatres via AJAX, using static content');
        }
    }

    renderTheatres(theatres) {
        const grid = document.querySelector('.theatres-grid');
        if (!grid || !theatres) return;

        grid.innerHTML = '';

        theatres.forEach(theatre => {
            const theatreCard = this.createTheatreCard(theatre);
            grid.appendChild(theatreCard);
        });

        // Re-setup interactions
        this.setupTheatreInteractions();
    }

    createTheatreCard(theatre) {
        const card = document.createElement('div');
        card.className = 'card theatre-card';
        card.dataset.theatreId = theatre.id;
        card.dataset.location = theatre.location;
        card.dataset.rating = theatre.rating;

        card.innerHTML = `
            <div class="theatre-header">
                <h3>${theatre.name}</h3>
                <div class="theatre-rating">
                    ${this.generateStarRating(theatre.rating)}
                </div>
            </div>
            <div class="theatre-details">
                <p><strong>Location:</strong> ${theatre.location}</p>
                <p><strong>Screens:</strong> ${theatre.total_screens}</p>
                <p><strong>Facilities:</strong> ${theatre.facilities.join(', ')}</p>
            </div>
            <div class="theatre-actions">
                <a href="/theatres/${theatre.id}/" class="btn">View Details</a>
                <button class="btn btn-secondary btn-view-shows" data-theatre-id="${theatre.id}">
                    View Shows
                </button>
            </div>
        `;

        return card;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }

        if (hasHalfStar) {
            stars += '⭐½';
        }

        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return `${stars} ${rating}/5`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.theatres-grid, .theatre-card')) {
        window.theatreApp = new TheatreApp();
    }
});