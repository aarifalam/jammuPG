    // Dark Mode Functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    document.body.appendChild(starsContainer);

    // Create enhanced stars with different sizes
    function createStars() {
        const starsCount = 200;
        
        // Clear existing stars
        starsContainer.innerHTML = '';
        
        for (let i = 0; i < starsCount; i++) {
            const star = document.createElement('div');
            
            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            // Random size and animation
            const sizeType = Math.random();
            let sizeClass = 'small';
            let duration = Math.random() * 3 + 2; // 2-5 seconds
            
            if (sizeType > 0.7) {
                sizeClass = 'medium';
                duration = Math.random() * 4 + 3; // 3-7 seconds
            } else if (sizeType > 0.9) {
                sizeClass = 'large';
                duration = Math.random() * 5 + 4; // 4-9 seconds
            }
            
            star.className = `star ${sizeClass}`;
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.setProperty('--duration', `${duration}s`);
            star.style.animationDelay = `${Math.random() * duration}s`;
            
            starsContainer.appendChild(star);
        }
        
        // Create shooting stars occasionally
        createShootingStars();
    }

    // Create shooting stars
    function createShootingStars() {
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance every interval
                const shootingStar = document.createElement('div');
                shootingStar.className = 'shooting-star';
                
                const startX = Math.random() * 100 + 50; // Start from right side
                const startY = Math.random() * 30; // Start from top
                
                shootingStar.style.left = `${startX}%`;
                shootingStar.style.top = `${startY}%`;
                shootingStar.style.animation = `shoot ${Math.random() * 2 + 1}s linear`;
                
                starsContainer.appendChild(shootingStar);
                
                // Remove after animation
                setTimeout(() => {
                    shootingStar.remove();
                }, 3000);
            }
        }, 5000); // Check every 5 seconds
    }

    // Initialize dark mode from localStorage
    function initializeDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        createStars();
    }

    // Toggle dark mode
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Recreate stars when entering dark mode
        if (isDarkMode) {
            createStars();
        }
    }

    // Event listener
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initializeDarkMode);
