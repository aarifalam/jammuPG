    // DOM Elements
    const areaFilter = document.getElementById('area');
    const typeFilter = document.getElementById('room-type');
    const priceFilter = document.getElementById('price-range');
    const cardsContainer = document.querySelector('.cards-container');
    let cards = document.querySelectorAll('.card');

    // Filter configuration
    const filterConfig = {
        area: 'all',
        roomType: 'all',
        priceRange: 'all'
    };

    // Price range mapping
    const priceRanges = {
        'low': { min: 5000, max: 7000 },
        'medium': { min: 7000, max: 9000 },
        'high': { min: 9000, max: Infinity }
    };

    // Initialize filters
    function initializeFilters() {
        // Set initial filter values
        filterConfig.area = areaFilter.value;
        filterConfig.roomType = typeFilter.value;
        filterConfig.priceRange = priceFilter.value;
        
        // Add loading state
        cardsContainer.classList.add('filtering');
        
        // Apply initial filter
        applyFilters();
        
        // Remove loading state after a short delay
        setTimeout(() => {
            cardsContainer.classList.remove('filtering');
        }, 300);
    }

    // Enhanced filter functionality
    function applyFilters() {
        const areaValue = filterConfig.area;
        const typeValue = filterConfig.roomType;
        const priceValue = filterConfig.priceRange;
        
        let visibleCount = 0;
        
        cards.forEach(card => {
            const cardArea = card.getAttribute('data-area');
            const cardType = card.getAttribute('data-type');
            const cardPrice = parsePrice(card.querySelector('.card-price').textContent);
            
            const areaMatch = areaValue === 'all' || cardArea === areaValue;
            const typeMatch = typeValue === 'all' || cardType === typeValue;
            const priceMatch = priceValue === 'all' || checkPriceRange(cardPrice, priceValue);
            
            if (areaMatch && typeMatch && priceMatch) {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.5s ease-in-out';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        showNoResultsMessage(visibleCount === 0);
        
        // Update results count
        updateResultsCount(visibleCount);
    }

    // Parse price from text content
    function parsePrice(priceText) {
        const priceMatch = priceText.match(/₹([\d,]+)/);
        return priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
    }

    // Check if price falls within selected range
    function checkPriceRange(price, range) {
        if (range === 'all') return true;
        
        const rangeConfig = priceRanges[range];
        return price >= rangeConfig.min && price <= rangeConfig.max;
    }

    // Show no results message
    function showNoResultsMessage(show) {
        let noResultsMsg = document.getElementById('no-results-message');
        
        if (show && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No PGs Found</h3>
                <p>Try adjusting your filters to see more results</p>
                <button class="btn btn-primary" onclick="resetFilters()">
                    <i class="fas fa-redo"></i> Reset Filters
                </button>
            `;
            cardsContainer.appendChild(noResultsMsg);
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // Update results count
    function updateResultsCount(count) {
        let resultsCount = document.getElementById('results-count');
        
        if (!resultsCount) {
            resultsCount = document.createElement('div');
            resultsCount.id = 'results-count';
            resultsCount.className = 'results-count';
            document.querySelector('.filter-section').appendChild(resultsCount);
        }
        
        resultsCount.textContent = `${count} PG${count !== 1 ? 's' : ''} found`;
    }

    // Reset all filters
    function resetFilters() {
        areaFilter.value = 'all';
        typeFilter.value = 'all';
        priceFilter.value = 'all';
        
        filterConfig.area = 'all';
        filterConfig.roomType = 'all';
        filterConfig.priceRange = 'all';
        
        applyFilters();
    }

    // Debounce function for performance
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

    // Event Listeners
    areaFilter.addEventListener('change', function() {
        filterConfig.area = this.value;
        applyFilters();
    });

    typeFilter.addEventListener('change', function() {
        filterConfig.roomType = this.value;
        applyFilters();
    });

    priceFilter.addEventListener('change', function() {
        filterConfig.priceRange = this.value;
        applyFilters();
    });

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initializeFilters();
        
        // Add animation to cards on load
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    });

    // Handle window resize for responsive adjustments
    window.addEventListener('resize', debounce(function() {
        cards = document.querySelectorAll('.card');
    }, 250));
