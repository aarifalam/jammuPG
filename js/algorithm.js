// Smart Card Rotation Algorithm - Random Top Positions
class CardRotationAlgorithm {
    constructor() {
        this.rotationEnabled = true;
        this.topPositions = 3; // Number of top spots
        this.rotationKey = 'card_rotation_data';
        this.rotationInterval = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    init() {
        console.log('🔄 Smart Card Rotation Algorithm Ready!');
        
        // Inject styles first
        this.injectStyles();
        
        // Apply rotation when DOM is ready
        setTimeout(() => {
            this.applyRotation();
        }, 1000);
        
        // Re-apply when page becomes visible (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => this.applyRotation(), 500);
            }
        });

        // Auto-rotate every 30 minutes
        setInterval(() => {
            if (this.rotationEnabled && !document.hidden) {
                this.applyRotation();
            }
        }, this.rotationInterval);
    }

    // Inject CSS styles
    injectStyles() {
        if (!document.querySelector('#rotation-algorithm-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'rotation-algorithm-styles';
            styleSheet.textContent = `
                .rotation-badge {
                    animation: pulseGlow 2s ease-in-out infinite;
                }

                @keyframes pulseGlow {
                    0%, 100% { 
                        box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3); 
                        transform: scale(1);
                    }
                    50% { 
                        box-shadow: 0 4px 20px rgba(238, 90, 36, 0.6); 
                        transform: scale(1.05);
                    }
                }

                .card {
                    transition: all 0.3s ease;
                }

                .rotation-badge .badge-rank {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    margin-right: 4px;
                }

                .rotation-badge .badge-text {
                    font-size: 10px;
                    letter-spacing: 0.5px;
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }

    // Get all eligible cards for rotation (exclude pinned cards)
    getEligibleCards() {
        const container = document.querySelector('.cards-container');
        if (!container) return [];
        
        const cards = Array.from(container.querySelectorAll('.card'));
        return cards.filter(card => {
            // Exclude already pinned cards from random rotation
            const isPinned = card.querySelector('.pin-indicator');
            return !isPinned;
        });
    }

    // Get rotation history from localStorage
    getRotationHistory() {
        try {
            const history = localStorage.getItem(this.rotationKey);
            return history ? JSON.parse(history) : { lastRotation: 0, topCards: [] };
        } catch {
            return { lastRotation: 0, topCards: [] };
        }
    }

    // Save rotation history to localStorage
    saveRotationHistory(topCards) {
        try {
            const history = {
                lastRotation: Date.now(),
                topCards: topCards.map(card => this.getCardIdentifier(card)),
                rotationCount: (this.getRotationHistory().rotationCount || 0) + 1
            };
            localStorage.setItem(this.rotationKey, JSON.stringify(history));
        } catch (error) {
            console.log('❌ Could not save rotation history');
        }
    }

    // Get unique identifier for card
    getCardIdentifier(card) {
        const title = card.querySelector('.card-title')?.textContent.trim() || '';
        const area = card.querySelector('.area-tag')?.textContent.trim() || '';
        const roomType = card.getAttribute('data-type') || '';
        return `${title}-${area}-${roomType}`;
    }

    // Smart card selection algorithm
    selectTopCards(eligibleCards, history) {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Filter out cards that were recently in top positions
        const recentTopCards = history.topCards || [];
        const availableCards = eligibleCards.filter(card => {
            const cardId = this.getCardIdentifier(card);
            return !recentTopCards.includes(cardId);
        });

        // If not enough fresh cards, use all eligible cards
        const pool = availableCards.length >= this.topPositions ? availableCards : eligibleCards;
        
        // Shuffle the pool using Fisher-Yates algorithm
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Select top cards
        return shuffled.slice(0, this.topPositions);
    }

    // Add rotation badges to top cards
    addRotationBadges(topCards) {
        // Remove existing rotation badges
        document.querySelectorAll('.rotation-badge').forEach(badge => badge.remove());
        
        // Add new badges
        topCards.forEach((card, index) => {
            const badge = document.createElement('div');
            badge.className = 'rotation-badge';
            badge.innerHTML = `
                <span class="badge-rank">#${index + 1}</span>
                <span class="badge-text">TOP PICK</span>
            `;
            
            badge.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: bold;
                z-index: 20;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
            
            card.style.position = 'relative';
            card.appendChild(badge);
            
            // Add subtle highlight effect
            card.style.transition = 'all 0.3s ease';
            card.style.border = '2px solid transparent';
            setTimeout(() => {
                card.style.border = '2px solid #ffa726';
                setTimeout(() => {
                    card.style.border = '2px solid transparent';
                }, 2000);
            }, 100 * (index + 1));
        });
    }

    // Apply smart rotation
    applyRotation() {
        if (!this.rotationEnabled) {
            console.log('🔄 Rotation disabled');
            return;
        }
        
        const eligibleCards = this.getEligibleCards();
        if (eligibleCards.length <= this.topPositions) {
            console.log('🔄 Not enough cards for rotation');
            return;
        }

        console.log('🔄 Applying rotation to', eligibleCards.length, 'eligible cards');

        // Get rotation history
        const rotationHistory = this.getRotationHistory();
        
        // Select cards for top positions using smart algorithm
        const topCards = this.selectTopCards(eligibleCards, rotationHistory);
        
        if (topCards.length === 0) {
            console.log('❌ No cards selected for rotation');
            return;
        }

        // Reorder cards in DOM
        this.reorderCards(topCards, eligibleCards);
        
        // Add visual badges
        this.addRotationBadges(topCards);
        
        // Update rotation history
        this.saveRotationHistory(topCards);
        
        console.log('🎯 Applied smart rotation to cards:', topCards.map((card, index) => 
            `#${index + 1}: ${card.querySelector('.card-title')?.textContent.trim()}`
        ));
    }

    // Reorder cards in DOM
    reorderCards(topCards, allEligibleCards) {
        const container = document.querySelector('.cards-container');
        if (!container) {
            console.log('❌ Cards container not found');
            return;
        }

        // Get all cards including pinned ones
        const allCards = Array.from(container.querySelectorAll('.card'));
        
        // Get pinned cards (they should stay at the top)
        const pinnedCards = allCards.filter(card => 
            card.querySelector('.pin-indicator')
        );
        
        // Get remaining cards (excluding pinned and top cards)
        const remainingCards = allEligibleCards.filter(card => 
            !topCards.includes(card) && !pinnedCards.includes(card)
        );

        // Shuffle remaining cards for variety
        const shuffledRemaining = [...remainingCards];
        for (let i = shuffledRemaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledRemaining[i], shuffledRemaining[j]] = [shuffledRemaining[j], shuffledRemaining[i]];
        }

        // Create new order: Pinned -> Top Cards -> Remaining
        const newOrder = [...pinnedCards, ...topCards, ...shuffledRemaining];

        // Rebuild container
        const fragment = document.createDocumentFragment();
        newOrder.forEach(card => {
            fragment.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    // Enable/disable rotation
    setRotationEnabled(enabled) {
        this.rotationEnabled = enabled;
        console.log(`🔄 Rotation ${enabled ? 'enabled' : 'disabled'}`);
        if (enabled) {
            this.applyRotation();
        } else {
            // Remove rotation badges
            document.querySelectorAll('.rotation-badge').forEach(badge => badge.remove());
        }
    }

    // Force immediate rotation
    forceRotation() {
        console.log('🔄 Forcing card rotation...');
        this.applyRotation();
    }

    // Get rotation status
    getStatus() {
        const history = this.getRotationHistory();
        return {
            enabled: this.rotationEnabled,
            lastRotation: history.lastRotation,
            rotationCount: history.rotationCount || 0,
            topPositions: this.topPositions
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for pin manager to initialize first
    setTimeout(() => {
        window.cardRotator = new CardRotationAlgorithm();
        
        // Add global methods for control
        window.enableRotation = () => window.cardRotator.setRotationEnabled(true);
        window.disableRotation = () => window.cardRotator.setRotationEnabled(false);
        window.forceRotation = () => window.cardRotator.forceRotation();
        window.getRotationStatus = () => window.cardRotator.getStatus();
        
        console.log('🎲 Smart Rotation Algorithm Ready!');
        console.log('Available commands:');
        console.log('- enableRotation()');
        console.log('- disableRotation()'); 
        console.log('- forceRotation()');
        console.log('- getRotationStatus()');
        
    }, 2000); // Wait longer for pin manager to complete
});