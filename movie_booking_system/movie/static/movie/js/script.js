// Movie App JavaScript
// Handles movie interactions, search, and filtering

class MovieApp {
    constructor() {
        this.selectedMovie = null;
        this.init();
    }

    init() {
        this.setupMovieInteractions();
        this.setupSearchAndFilter();
        this.setupMovieStorage();
        this.loadMovieData();
    }

    // Movie Interaction Handlers
    setupMovieInteractions() {
        // Book Now button handlers
        const bookButtons = document.querySelectorAll('.btn[href*="booking"]');
        bookButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleBookNow(e));
        });

        // Movie card hover effects
        const movieCards = document.querySelectorAll('.movie-card');
        movieCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn')) {
                    // Click on card (not button) - go to details
                    const movieId = card.dataset.movieId;
                    if (movieId) {
                        window.location.href = `/movies/${movieId}/`;
                    }
                }
            });
        });
    }

    handleBookNow(e) {
        e.preventDefault();
        const button = e.target;
        const movieCard = button.closest('.movie-card, .show-card');
        const movieId = movieCard ? movieCard.dataset.movieId : null;

        if (movieId) {
            // Store selected movie in localStorage
            this.storeSelectedMovie(movieId);

            // Check if user is logged in
            const isLoggedIn = document.querySelector('[href*="logout"]') !== null;

            if (!isLoggedIn) {
                window.movieBookingApp.showAlert('Please login to book tickets.', 'info');
                setTimeout(() => {
                    window.location.href = '/user/login/';
                }, 1500);
                return;
            }

            // Redirect to shows page for this movie
            window.location.href = `/show/?movie=${movieId}`;
        } else {
            window.movieBookingApp.showAlert('Movie selection failed. Please try again.', 'error');
        }
    }

    // Movie Data Storage
    storeSelectedMovie(movieId) {
        try {
            localStorage.setItem('selectedMovie', movieId);
            sessionStorage.setItem('selectedMovie', movieId);
            this.selectedMovie = movieId;
        } catch (error) {
            console.warn('Failed to store movie selection:', error);
        }
    }

    getSelectedMovie() {
        return localStorage.getItem('selectedMovie') || sessionStorage.getItem('selectedMovie');
    }

    // Search and Filter Functionality
    setupSearchAndFilter() {
        const searchInput = document.getElementById('movie-search');
        const genreFilter = document.getElementById('genre-filter');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.filterMovies();
            }, 300));
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', () => {
                this.filterMovies();
            });
        }
    }

    filterMovies() {
        const searchTerm = document.getElementById('movie-search')?.value.toLowerCase() || '';
        const selectedGenre = document.getElementById('genre-filter')?.value || '';
        const movieCards = document.querySelectorAll('.movie-card');

        movieCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const genre = card.dataset.genre || '';
            const description = card.querySelector('.movie-description')?.textContent.toLowerCase() || '';

            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesGenre = !selectedGenre || genre === selectedGenre;

            if (matchesSearch && matchesGenre) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });

        this.updateNoResultsMessage();
    }

    updateNoResultsMessage() {
        const visibleCards = document.querySelectorAll('.movie-card[style*="display: block"]');
        let noResultsMsg = document.getElementById('no-results');

        if (visibleCards.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'no-results';
                noResultsMsg.className = 'card';
                noResultsMsg.innerHTML = '<p>No movies found matching your criteria.</p>';
                document.querySelector('.movies-grid').appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }

    // Load Movie Data (AJAX)
    async loadMovieData() {
        if (!document.querySelector('.movies-grid')) return;

        try {
            const data = await window.movieBookingApp.ajax('/api/movies/');
            this.renderMovies(data.movies);
        } catch (error) {
            console.warn('Failed to load movies via AJAX, using static content');
        }
    }

    renderMovies(movies) {
        const grid = document.querySelector('.movies-grid');
        if (!grid || !movies) return;

        grid.innerHTML = '';

        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            grid.appendChild(movieCard);
        });
    }

    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'card movie-card';
        card.dataset.movieId = movie.id;
        card.dataset.genre = movie.genre;

        card.innerHTML = `
            <div class="movie-poster">
                ${movie.poster ? `<img src="${movie.poster}" alt="${movie.title}">` :
                  '<div class="no-poster"><span>🎬</span><p>No Poster</p></div>'}
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span class="genre">${movie.genre}</span>
                    <span class="duration">${movie.duration} min</span>
                </div>
                <p class="movie-description">${movie.description.substring(0, 100)}...</p>
                <div class="movie-actions">
                    <a href="/movies/${movie.id}/" class="btn">View Details</a>
                    <a href="/show/?movie=${movie.id}" class="btn btn-secondary book-btn">Book Now</a>
                </div>
            </div>
        `;

        // Add event listeners
        const bookBtn = card.querySelector('.book-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', (e) => this.handleBookNow(e));
        }

        return card;
    }

    // Utility Functions
    debounce(func, wait) {
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

    // Movie Rating System (Optional)
    setupMovieRating() {
        const ratingElements = document.querySelectorAll('.movie-rating');
        ratingElements.forEach(element => {
            const rating = parseFloat(element.dataset.rating) || 0;
            element.innerHTML = this.generateStarRating(rating);
        });
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }

        // Half star
        if (hasHalfStar) {
            stars += '⭐½';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return `${stars} ${rating}/5`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.movies-grid, .movie-card')) {
        window.movieApp = new MovieApp();
    }
});