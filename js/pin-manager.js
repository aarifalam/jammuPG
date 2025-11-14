// Enhanced Pin Manager - Optimized Version
class PinManager {
    constructor() {
        // Singleton pattern to prevent multiple instances
        if (window.pinManagerInstance) {
            return window.pinManagerInstance;
        }
        window.pinManagerInstance = this;
        
        this.pinnedCards = [];
        this.jsonFilePath = 'js/pinned-cards.json';
        this.initialized = false;
        this.init();
    }

    async init() {
        if (this.initialized) return;
        
        await this.loadFromJSON();
        this.initialized = true;
        console.log('📌 Enhanced Pin Manager Ready!');
        console.log('Pinned cards:', this.getPinnedCards().length);
    }

    // Load pinned cards from JSON file
    async loadFromJSON() {
        try {
            const response = await fetch(this.jsonFilePath + '?v=' + Date.now());
            if (response.ok) {
                const data = await response.json();
                this.pinnedCards = data.pinnedCards || [];
                console.log('📋 Loaded pinned cards:', this.pinnedCards.length);
                this.applyPinnedOrder();
            }
        } catch (error) {
            console.log('❌ Could not load pinned-cards.json');
            this.pinnedCards = [];
        }
    }

    // Apply pinned order based on JSON data
    applyPinnedOrder() {
        const container = document.querySelector('.cards-container');
        if (!container) {
            console.log('❌ Cards container not found');
            return;
        }

        const cards = Array.from(container.querySelectorAll('.card'));
        if (cards.length === 0) return;

        // Use Map for faster lookups
        const pinnedMap = new Map(this.pinnedCards.map(card => [card.id, card]));
        
        const pinnedCards = [];
        const unpinnedCards = [];
        
        cards.forEach(card => {
            const cardId = this.getCardId(card);
            const pinnedCard = pinnedMap.get(cardId);
            
            if (pinnedCard) {
                pinnedCards.push({ card, priority: pinnedCard.priority });
                this.addPinIndicator(card);
            } else {
                unpinnedCards.push(card);
                this.removePinIndicator(card);
            }
        });

        // Sort pinned cards by priority
        pinnedCards.sort((a, b) => a.priority - b.priority);

        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();

            // Add pinned cards first
            pinnedCards.forEach(({ card }) => {
                fragment.appendChild(card);
            });

            // Add unpinned cards
            unpinnedCards.forEach(card => {
                fragment.appendChild(card);
            });

            container.innerHTML = '';
            container.appendChild(fragment);
            
            console.log('📌 Applied pinned order:', pinnedCards.length + ' pinned cards');
            
            // Notify rotation algorithm if it exists
            if (window.cardRotator && typeof window.cardRotator.applyRotation === 'function') {
                setTimeout(() => {
                    window.cardRotator.applyRotation();
                }, 100);
            }
        });
    }

    // Add visual pin indicator to card
    addPinIndicator(card) {
        if (!card.querySelector('.pin-indicator')) {
            const pinIndicator = document.createElement('div');
            pinIndicator.className = 'pin-indicator';
            pinIndicator.innerHTML = '<i class="fas fa-thumbtack"></i> Pinned';
            pinIndicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: bold;
                z-index: 10;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            
            if (window.getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }
            card.appendChild(pinIndicator);
        }
    }

    // Remove visual pin indicator
    removePinIndicator(card) {
        const pinIndicator = card.querySelector('.pin-indicator');
        if (pinIndicator) {
            pinIndicator.remove();
        }
    }

    // Get unique identifier for card (INCLUDES ROOM TYPE)
    getCardId(card) {
        const title = card.querySelector('.card-title')?.textContent.trim() || '';
        const area = card.querySelector('.area-tag')?.textContent.trim() || '';
        const roomType = card.getAttribute('data-type') || '';
        const badge = card.querySelector('.card-badge')?.textContent.trim() || '';
        
        // Use room type from data attribute or extract from badge
        let finalRoomType = roomType;
        if (!finalRoomType && badge) {
            finalRoomType = badge.toLowerCase().includes('double') ? 'double' :
                          badge.toLowerCase().includes('triple') ? 'triple' :
                          badge.toLowerCase().includes('single') ? 'single' : '';
        }
        
        return `${title}-${area}-${finalRoomType}`.replace(/\s+/g, ' ').trim();
    }

    // Get card data for criteria matching
    getCardData(card) {
        const title = card.querySelector('.card-title')?.textContent.trim() || '';
        const area = card.querySelector('.area-tag')?.textContent.trim() || '';
        const roomType = card.getAttribute('data-type') || '';
        const priceRange = card.getAttribute('data-price') || '';
        const badge = card.querySelector('.card-badge')?.textContent.trim() || '';
        
        // Determine room type from data attribute or badge
        let finalRoomType = roomType;
        if (!finalRoomType && badge) {
            finalRoomType = badge.toLowerCase().includes('double') ? 'double' :
                          badge.toLowerCase().includes('triple') ? 'triple' :
                          badge.toLowerCase().includes('single') ? 'single' : 'unknown';
        }
        
        // Extract features
        const features = Array.from(card.querySelectorAll('.feature-tag'))
            .map(tag => tag.textContent.toLowerCase().trim());
        
        return {
            id: `${title}-${area}-${finalRoomType}`.replace(/\s+/g, ' ').trim(),
            title,
            area,
            roomType: finalRoomType,
            priceRange,
            features,
            badge,
            element: card
        };
    }

    // Get pinned card data
    getPinnedCardData(cardId) {
        return this.pinnedCards.find(card => card.id === cardId);
    }

    // Check if card matches pin criteria
    matchesCriteria(cardData, criteria) {
        if (criteria.roomType && criteria.roomType !== 'all' && cardData.roomType !== criteria.roomType) {
            return false;
        }
        
        if (criteria.priceRange && criteria.priceRange !== 'all' && cardData.priceRange !== criteria.priceRange) {
            return false;
        }
        
        if (criteria.area && criteria.area !== 'all') {
            const cardArea = cardData.area.toLowerCase().replace(/\s+/g, '-');
            if (cardArea !== criteria.area) {
                return false;
            }
        }
        
        if (criteria.features && criteria.features.length > 0) {
            const hasAllFeatures = criteria.features.every(feature => 
                cardData.features.some(cardFeature => 
                    cardFeature.includes(feature.toLowerCase())
                )
            );
            if (!hasAllFeatures) return false;
        }
        
        if (criteria.badge && criteria.badge !== 'all') {
            if (!cardData.badge.toLowerCase().includes(criteria.badge.toLowerCase())) {
                return false;
            }
        }
        
        return true;
    }

    // Pin cards based on criteria
    pinCardsByCriteria(criteria) {
        const cards = Array.from(document.querySelectorAll('.card'));
        let matchedCards = [];
        
        cards.forEach(card => {
            const cardData = this.getCardData(card);
            if (this.matchesCriteria(cardData, criteria) && !this.isPinned(cardData.id)) {
                matchedCards.push(cardData);
            }
        });
        
        // Add matched cards to pinned cards
        matchedCards.forEach((cardData, index) => {
            const priority = this.pinnedCards.length + index + 1;
            this.pinnedCards.push({
                id: cardData.id,
                title: cardData.title,
                area: cardData.area,
                roomType: cardData.roomType,
                priority: priority,
                pinnedAt: new Date().toISOString(),
                criteria: criteria
            });
        });
        
        console.log(`📌 Pinned ${matchedCards.length} cards by criteria:`, criteria);
        this.applyPinnedOrder();
        this.saveToJSON();
        
        return matchedCards.length;
    }

    // Unpin cards based on criteria
    unpinCardsByCriteria(criteria) {
        const initialLength = this.pinnedCards.length;
        
        this.pinnedCards = this.pinnedCards.filter(pinnedCard => {
            return !pinnedCard.criteria || !this.matchesCriteria(pinnedCard, criteria);
        });
        
        const removedCount = initialLength - this.pinnedCards.length;
        console.log(`📌 Unpinned ${removedCount} cards by criteria:`, criteria);
        
        this.applyPinnedOrder();
        this.saveToJSON();
        
        return removedCount;
    }

    // Manual pin/unpin methods
    pinCard(cardId, priority = null) {
        if (this.isPinned(cardId)) {
            console.log('📌 Card already pinned:', cardId);
            return false;
        }
        
        const card = Array.from(document.querySelectorAll('.card')).find(card => 
            this.getCardId(card) === cardId
        );
        
        if (!card) {
            console.log('❌ Card not found:', cardId);
            return false;
        }
        
        const cardData = this.getCardData(card);
        const newPriority = priority || this.pinnedCards.length + 1;
        
        this.pinnedCards.push({
            id: cardData.id,
            title: cardData.title,
            area: cardData.area,
            roomType: cardData.roomType,
            priority: newPriority,
            pinnedAt: new Date().toISOString()
        });
        
        console.log('📌 Manually pinned card:', cardId);
        this.applyPinnedOrder();
        this.saveToJSON();
        return true;
    }

    unpinCard(cardId) {
        const initialLength = this.pinnedCards.length;
        this.pinnedCards = this.pinnedCards.filter(card => card.id !== cardId);
        
        if (this.pinnedCards.length < initialLength) {
            console.log('📌 Manually unpinned card:', cardId);
            this.applyPinnedOrder();
            this.saveToJSON();
            return true;
        }
        return false;
    }

    // Clear all pinned cards
    clearAllPins() {
        this.pinnedCards = [];
        console.log('📌 Cleared all pinned cards');
        this.applyPinnedOrder();
        this.saveToJSON();
    }

    // Save to JSON (for demonstration)
    async saveToJSON() {
        try {
            localStorage.setItem('pinnedCards_backup', JSON.stringify({
                pinnedCards: this.pinnedCards,
                settings: { maxPinnedCards: 10, version: "2.2" }
            }));
            console.log('💾 Pinned cards backup saved to localStorage');
        } catch (error) {
            console.log('❌ Could not save to localStorage');
        }
    }

    // Check if card is pinned
    isPinned(cardId) {
        return this.pinnedCards.some(card => card.id === cardId);
    }

    // Get all pinned cards for debugging
    getPinnedCards() {
        return this.pinnedCards.sort((a, b) => a.priority - b.priority);
    }

    // Debug method to show all card IDs
    debugCardIds() {
        const cards = Array.from(document.querySelectorAll('.card'));
        console.log('🃏 All Card IDs:');
        cards.forEach(card => {
            const cardData = this.getCardData(card);
            console.log(`- ${cardData.id} (${cardData.roomType})`);
        });
    }

    // Get statistics
    getStats() {
        return {
            totalPinned: this.pinnedCards.length,
            byRoomType: this.pinnedCards.reduce((acc, card) => {
                acc[card.roomType] = (acc[card.roomType] || 0) + 1;
                return acc;
            }, {}),
            byArea: this.pinnedCards.reduce((acc, card) => {
                acc[card.area] = (acc[card.area] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Initialize when DOM is ready - SINGLE INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing instance
    delete window.pinManagerInstance;
    
    setTimeout(() => {
        window.pinManager = new PinManager();
        
        // Add global methods for manual control
        window.pinCardsByCriteria = (criteria) => {
            return window.pinManager.pinCardsByCriteria(criteria);
        };
        
        window.unpinCardsByCriteria = (criteria) => {
            return window.pinManager.unpinCardsByCriteria(criteria);
        };
        
        window.pinCard = (cardId, priority) => {
            return window.pinManager.pinCard(cardId, priority);
        };
        
        window.unpinCard = (cardId) => {
            return window.pinManager.unpinCard(cardId);
        };
        
        window.clearAllPins = () => {
            window.pinManager.clearAllPins();
        };
        
        window.debugCardIds = () => {
            window.pinManager.debugCardIds();
        };
        
        window.getPinStats = () => {
            return window.pinManager.getStats();
        };
        
        // Reapply pin order when filters change - with debouncing
        const originalApplyFilters = window.applyFilters;
        if (originalApplyFilters) {
            let filterTimeout;
            window.applyFilters = function() {
                originalApplyFilters();
                clearTimeout(filterTimeout);
                filterTimeout = setTimeout(() => {
                    window.pinManager.applyPinnedOrder();
                }, 150);
            };
        }
        
        console.log('🎯 Optimized Pin Manager Ready!');
        console.log('Available methods:');
        console.log('- pinCardsByCriteria({roomType: "triple"})');
        console.log('- unpinCardsByCriteria({roomType: "double"})');
        console.log('- pinCard("Rakshit PG-NANAK NAGAR-triple")');
        console.log('- getPinStats() // Get pinning statistics');
        console.log('- debugCardIds() // See all card IDs');
        
    }, 500);
});