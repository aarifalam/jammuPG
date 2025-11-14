// Modern Loading System for Jammu PG Finder
class LoadingManager {
    constructor() {
        this.init();
    }

    init() {
        this.createLoadingScreen();
        this.optimizePerformance();
        this.setupIntersectionObserver();
        this.preloadCriticalResources();
    }

    // Create elegant loading screen
    createLoadingScreen() {
        const loadingHTML = `
            <div id="app-loading" class="app-loading">
                <div class="loading-container">
                    <div class="loading-spinner">
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                    </div>
                    <div class="loading-content">
                        <div class="loading-logo">
                            <i class="fas fa-home"></i>
                            <span>Jammu PG Finder</span>
                        </div>
                        <div class="loading-text">
                            <div class="loading-title">Finding your perfect stay...</div>
                            <div class="loading-subtitle">Loading premium PG options</div>
                        </div>
                        <div class="loading-progress">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <div class="progress-text">0%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
        this.simulateProgress();
    }

    // Simulate loading progress
    simulateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;

            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.floor(progress)}%`;

            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 500);
            }
        }, 200);
    }

    // Hide loading screen with smooth transition
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('app-loading');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                loadingScreen.remove();
                this.initializeLazyLoading();
            }, 500);
        }
    }

    // Optimize performance
    optimizePerformance() {
        // Prevent layout thrashing
        this.debounceResize();
        
        // Optimize images
        this.lazyLoadImages();
        
        // Preconnect to important domains
        this.addPreconnects();
    }

    // Setup intersection observer for lazy loading
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        this.observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
        }
    }

    // Lazy load images
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (this.observer) {
                this.observer.observe(img);
            } else {
                // Fallback for browsers without IntersectionObserver
                img.src = img.dataset.src;
            }
        });
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'css/jammu-pg.css',
            'css/dark-mode.css'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'font';
            document.head.appendChild(link);
        });
    }

    // Add preconnect for external domains
    addPreconnects() {
        const domains = [
            'https://cdnjs.cloudflare.com/ajax/libs',
            'https://images.unsplash.com'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // Debounce resize events
    debounceResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                window.dispatchEvent(new Event('optimizedResize'));
            }, 100);
        });
    }

    // Initialize lazy loading after page load
    initializeLazyLoading() {
        // Lazy load cards with staggered animation
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Show loading state for filters
    showFilterLoading() {
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.classList.add('filtering');
            
            setTimeout(() => {
                filterSection.classList.remove('filtering');
            }, 300);
        }
    }

    // Show skeleton loading for cards
    showSkeletonLoading(count = 6) {
        const container = document.querySelector('.cards-container');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'card skeleton';
            skeleton.innerHTML = `
                <div class="card-image skeleton-shimmer"></div>
                <div class="card-content">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-subtitle"></div>
                    <div class="skeleton-features">
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-tag"></div>
                    </div>
                    <div class="skeleton-footer">
                        <div class="skeleton-price"></div>
                        <div class="skeleton-button"></div>
                    </div>
                </div>
            `;
            container.appendChild(skeleton);
        }
    }

    // Hide skeleton loading
    hideSkeletonLoading() {
        const skeletons = document.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => {
            skeleton.style.opacity = '0';
            setTimeout(() => skeleton.remove(), 300);
        });
    }
}

// Initialize loading manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.loadingManager = new LoadingManager();
    
    // Add loading states to existing functionality
    enhanceExistingFunctions();
});

// Enhance existing functions with loading states
function enhanceExistingFunctions() {
    // Enhance filter functionality with loading
    if (typeof applyFilters === 'function') {
        const originalApplyFilters = applyFilters;
        window.applyFilters = function() {
            if (window.loadingManager) {
                window.loadingManager.showFilterLoading();
            }
            
            // Show skeleton during filter
            const container = document.querySelector('.cards-container');
            const originalDisplay = container.style.display;
            container.style.opacity = '0.5';
            
            setTimeout(() => {
                originalApplyFilters();
                container.style.opacity = '1';
                
                // Reapply lazy loading animations
                if (window.loadingManager) {
                    window.loadingManager.initializeLazyLoading();
                }
            }, 200);
        };
    }

    // Add loading to dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 600);
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}