// Shopping Cart Functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.cartCount = document.getElementById('cartCount');
        this.cartItems = document.getElementById('cartItems');
        this.cartTotal = document.getElementById('cartTotal');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.cartToggle = document.getElementById('cartToggle');
        this.cartClose = document.getElementById('cartClose');
        this.btnCheckout = document.getElementById('btnCheckout');
        this.btnContinue = document.getElementById('btnContinue');
        
        this.init();
    }
    
    init() {
        this.updateCart();
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Cart toggle
        this.cartToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.openCart();
        });
        
        // Cart close
        this.cartClose.addEventListener('click', () => {
            this.closeCart();
        });
        
        // Overlay close
        this.cartOverlay.addEventListener('click', () => {
            this.closeCart();
        });
        
        // Continue shopping
        this.btnContinue.addEventListener('click', () => {
            this.closeCart();
        });
        
        // Checkout
        this.btnCheckout.addEventListener('click', () => {
            this.checkout();
        });
        
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-order, .btn-vaccine-order')) {
                e.preventDefault();
                this.addToCart(e.target);
            }
        });
    }
    
    addToCart(button) {
        const product = {
            id: button.dataset.product,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            quantity: 1
        };
        
        // Check if item already exists
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(product);
        }
        
        this.saveCart();
        this.updateCart();
        this.showNotification(`${product.name} added to cart!`, 'success');
        
        // Add animation to button
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);
    }
    
    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCart();
        this.showNotification('Item removed from cart', 'info');
    }
    
    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateCart();
            }
        }
    }
    
    updateCart() {
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
        // Update cart items display
        if (this.items.length === 0) {
            this.cartItems.innerHTML = `
                <div class="cart-empty">
                    <span class="empty-icon">🛒</span>
                    <p>Your cart is empty</p>
                    <small>Add some products to get started!</small>
                </div>
            `;
        } else {
            this.cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">${this.getProductIcon(item.id)}</div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">USD ${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', -1)">−</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="cart.removeFromCart('${item.id}')">Remove</button>
                </div>
            `).join('');
        }
        
        // Update total
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartTotal.textContent = `USD ${total.toFixed(2)}`;
    }
    
    getProductIcon(productId) {
        const icons = {
            'day-old-chicks': '🐤',
            'road-runner-special': '🐥',
            'newcastle-vaccine': '💉',
            'bronchitis-vaccine': '🦠',
            'gumboro-vaccine': '🛡️',
            'fowl-pox-vaccine': '🐓',
            'antibiotic': '💊',
            'coccidiostat': '🩹',
            'dewormer': '🌿',
            'vitamin-b': '🧴',
            'calcium': '🥚',
            'probiotics': '🌾',
            'protein': '💪',
            'electrolytes': '🌊',
            'syringes': '💉',
            'thermometer': '🌡️',
            'disinfectant': '🧴',
            'first-aid': '📦'
        };
        return icons[productId] || '📦';
    }
    
    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }
    
    openCart() {
        this.cartSidebar.classList.add('active');
        this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeCart() {
        this.cartSidebar.classList.remove('active');
        this.cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Scroll to contact form and pre-fill with cart items
        document.getElementById('contact').scrollIntoView({
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            const messageField = document.getElementById('message');
            const cartSummary = this.items.map(item => 
                `${item.name} x${item.quantity} = USD ${(item.price * item.quantity).toFixed(2)}`
            ).join('\n');
            
            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            messageField.value = `I would like to order:\n\n${cartSummary}\n\nTotal: USD ${total.toFixed(2)}\n\nPlease contact me to complete this order.`;
            messageField.focus();
            
            this.closeCart();
        }, 1000);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Newsletter Section Functionality
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                farmSize: document.getElementById('farmSize').value,
                tips: document.getElementById('tips').checked,
                market: document.getElementById('market').checked,
                offers: document.getElementById('offers').checked
            };
            
            // Validation
            let isValid = true;
            let errorMessage = '';
            
            if (!formData.fullName) {
                errorMessage = 'Please enter your full name';
                isValid = false;
            } else if (!formData.email) {
                errorMessage = 'Please enter your email address';
                isValid = false;
            } else if (!isValidEmail(formData.email)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            } else if (!formData.farmSize) {
                errorMessage = 'Please select your farm size';
                isValid = false;
            }
            
            if (!isValid) {
                showNotification(errorMessage, 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = newsletterForm.querySelector('.btn-newsletter');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-text">Subscribing...</span><span class="btn-icon">⏳</span>';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                showNotification('Successfully subscribed! Check your email for a confirmation message.', 'success');
                
                // Reset form
                newsletterForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Log the subscription (in a real application, this would be sent to a server)
                console.log('Newsletter subscription:', formData);
                
                // Add to local storage for demo purposes
                const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
                subscribers.push({
                    ...formData,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
            }, 2000);
        });
    }
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add animation to newsletter elements when they come into view
    const newsletterElements = document.querySelectorAll('.newsletter-feature, .form-card, .testimonial-card');
    
    const newsletterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    newsletterElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        newsletterObserver.observe(element);
    });
    
    // Add interactive effects to form inputs
    const inputs = document.querySelectorAll('#newsletterForm input, #newsletterForm select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // Add hover effect to newsletter features
    const newsletterFeatures = document.querySelectorAll('.newsletter-feature');
    newsletterFeatures.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
        });
        
        feature.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add ripple effect to newsletter button
    const newsletterBtn = document.querySelector('.btn-newsletter');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
    
    // Add subscriber count display (demo feature)
    const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
    const subscriberCount = document.createElement('div');
    subscriberCount.className = 'subscriber-count';
    subscriberCount.innerHTML = `
        <div style="text-align: center; margin-top: 2rem; padding: 1rem; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <span style="font-size: 2rem;">👥</span>
            <p style="margin: 0.5rem 0 0 0; color: #8B4513; font-weight: 600;">${subscribers.length}+ Farmers Subscribed</p>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">Join our growing community!</p>
        </div>
    `;
    
    // Insert subscriber count after the form
    const formCard = document.querySelector('.form-card');
    if (formCard && subscribers.length > 0) {
        formCard.parentNode.insertBefore(subscriberCount, formCard.nextSibling);
    }
});

// Vaccines & Medicines Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    const vaccineTabButtons = document.querySelectorAll('.vaccine-tab-btn');
    const vaccineTabContents = document.querySelectorAll('.vaccine-tab-content');
    
    // Initialize first tab as active
    if (vaccineTabButtons.length > 0 && vaccineTabContents.length > 0) {
        vaccineTabButtons[0].classList.add('active');
        vaccineTabContents[0].classList.add('active');
    }
    
    // Add click event listeners to vaccine tab buttons
    vaccineTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Remove active class from all buttons and contents
            vaccineTabButtons.forEach(btn => btn.classList.remove('active'));
            vaccineTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetCategory);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Smooth scroll to vaccines section
            const vaccinesSection = document.getElementById('vaccines');
            if (vaccinesSection) {
                setTimeout(() => {
                    vaccinesSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });
    
    // Add animation to vaccine cards when they come into view
    const vaccineCards = document.querySelectorAll('.vaccine-card');
    
    const vaccineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all vaccine cards
    vaccineCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        vaccineObserver.observe(card);
    });
    
    // Add order functionality for vaccine products
    const vaccineOrderButtons = document.querySelectorAll('.btn-vaccine-order');
    vaccineOrderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const vaccineCard = this.closest('.vaccine-card');
            const vaccineName = vaccineCard.querySelector('h3').textContent;
            const vaccinePrice = vaccineCard.querySelector('.price-value').textContent;
            
            // Scroll to contact form
            document.getElementById('contact').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Pre-fill contact form with vaccine information
            setTimeout(() => {
                const messageField = document.getElementById('message');
                if (messageField) {
                    messageField.value = `I would like to order ${vaccineName} (${vaccinePrice})`;
                    messageField.focus();
                }
            }, 1000);
        });
    });
    
    // Add hover effects for vaccine cards
    vaccineCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add search functionality for vaccines (similar to knowledge base)
    const vaccineSearchInput = document.createElement('input');
    vaccineSearchInput.type = 'text';
    vaccineSearchInput.placeholder = 'Search vaccines and medicines...';
    vaccineSearchInput.className = 'vaccine-search';
    vaccineSearchInput.style.cssText = `
        width: 100%;
        max-width: 400px;
        margin: 0 auto 2rem;
        padding: 1rem;
        border: 2px solid #8B4513;
        border-radius: 25px;
        font-size: 1rem;
        display: block;
        outline: none;
        transition: border-color 0.3s ease;
    `;
    
    // Insert search input before vaccine tabs
    const vaccineSection = document.querySelector('#vaccines .section-intro');
    if (vaccineSection) {
        vaccineSection.parentNode.insertBefore(vaccineSearchInput, vaccineSection.nextSibling);
    }
    
    // Add search functionality for vaccines
    vaccineSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // If search term is empty, show all content
        if (searchTerm === '') {
            vaccineTabContents.forEach(content => {
                content.style.display = content.classList.contains('active') ? 'block' : 'none';
            });
            document.querySelector('.vaccine-categories .category-tabs').style.display = 'flex';
            document.querySelector('.vaccine-info-banner').style.display = 'block';
            return;
        }
        
        // Hide category tabs and info banner during search
        document.querySelector('.vaccine-categories .category-tabs').style.display = 'none';
        document.querySelector('.vaccine-info-banner').style.display = 'none';
        
        // Search through all vaccine cards
        let hasResults = false;
        vaccineTabContents.forEach(content => {
            const cards = content.querySelectorAll('.vaccine-card');
            let contentHasResults = false;
            
            cards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'block';
                    contentHasResults = true;
                    hasResults = true;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show content if it has matching cards
            content.style.display = contentHasResults ? 'block' : 'none';
        });
        
        // Show no results message if needed
        let noResultsMsg = document.querySelector('.vaccine-no-results');
        if (!hasResults && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'vaccine-no-results';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>No results found for "${this.value}"</h3>
                    <p>Try searching for terms like "vaccine", "antibiotic", "supplement", or "equipment"</p>
                </div>
            `;
            document.querySelector('.vaccine-content').appendChild(noResultsMsg);
        } else if (hasResults && noResultsMsg) {
            noResultsMsg.remove();
        }
    });
    
    // Add clear search button for vaccines
    const vaccineClearBtn = document.createElement('button');
    vaccineClearBtn.textContent = 'Clear';
    vaccineClearBtn.className = 'vaccine-clear-search-btn';
    vaccineClearBtn.style.cssText = `
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: #8B4513;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: none;
        font-size: 12px;
    `;
    
    // Position the vaccine search input container
    vaccineSearchInput.parentNode.style.position = 'relative';
    vaccineSearchInput.parentNode.appendChild(vaccineClearBtn);
    
    // Show/hide clear button
    vaccineSearchInput.addEventListener('input', function() {
        vaccineClearBtn.style.display = this.value ? 'block' : 'none';
    });
    
    // Clear search functionality
    vaccineClearBtn.addEventListener('click', function() {
        vaccineSearchInput.value = '';
        vaccineSearchInput.dispatchEvent(new Event('input'));
        vaccineSearchInput.focus();
    });
});

// Enhanced Landing Page Features
document.addEventListener('DOMContentLoaded', function() {
    // Animate hero stats counters
    const statNumbers = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalText = target.textContent;
                const number = parseInt(finalText.replace(/[^0-9]/g, ''));
                const suffix = finalText.replace(/[0-9]/g, '');
                
                if (!isNaN(number)) {
                    animateCounter(target, number, suffix, 2000);
                }
                statsObserver.unobserve(target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => statsObserver.observe(stat));
    
    // Enhanced parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        const particles = document.querySelector('.hero-particles');
        const floatingIcons = document.querySelectorAll('.floating-icon');
        
        if (hero && heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
            heroContent.style.opacity = 1 - scrolled / 800;
        }
        
        if (particles) {
            particles.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
        
        floatingIcons.forEach((icon, index) => {
            const speed = 0.1 + (index * 0.05);
            icon.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Add hover effect to hero buttons
    const heroButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    heroButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add ripple effect to buttons
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add CSS for ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // Enhanced chick animations
    const chicks = document.querySelectorAll('.chick');
    chicks.forEach((chick, index) => {
        chick.addEventListener('mouseenter', function() {
            this.style.transform = `scale(1.3) rotate(${Math.random() * 20 - 10}deg)`;
            this.style.filter = 'brightness(1.2)';
        });
        
        chick.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.filter = 'brightness(1)';
        });
        
        // Add random floating animations
        setInterval(() => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            const randomRotate = Math.random() * 10 - 5;
            
            chick.style.transition = 'transform 0.5s ease';
            chick.style.transform = `translateX(${randomX}px) translateY(${randomY}px) rotate(${randomRotate}deg)`;
        }, 3000 + (index * 1000));
    });
    
    // Add dynamic particle generation
    const heroParticles = document.querySelector('.hero-particles');
    if (heroParticles) {
        setInterval(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: 100%;
                pointer-events: none;
                animation: rise-particle ${Math.random() * 3 + 2}s ease-out forwards;
            `;
            
            heroParticles.appendChild(particle);
            
            setTimeout(() => particle.remove(), 5000);
        }, 2000);
    }
    
    // Add CSS for rising particle animation
    const particleStyle = document.createElement('style');
    particleStyle.textContent = `
        @keyframes rise-particle {
            to {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(particleStyle);
    
    // Add smooth reveal animation for hero elements
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-description, .hero-stats, .hero-features, .hero-cta');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});

// Counter animation function
function animateCounter(element, target, suffix, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
        }
    }
    
    updateCounter();
}

// Knowledge Base Tab Functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initialize first tab as active
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');
    }
    
    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetCategory);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Smooth scroll to knowledge base section
            const knowledgeSection = document.getElementById('knowledge');
            if (knowledgeSection) {
                setTimeout(() => {
                    knowledgeSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });
    
    // Add animation to knowledge cards when they come into view
    const knowledgeCards = document.querySelectorAll('.knowledge-card');
    const tipCards = document.querySelectorAll('.tip-card');
    
    const knowledgeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all knowledge and tip cards
    [...knowledgeCards, ...tipCards].forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        knowledgeObserver.observe(card);
    });
    
    // Add search functionality for knowledge base
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search knowledge base...';
    searchInput.className = 'knowledge-search';
    searchInput.style.cssText = `
        width: 100%;
        max-width: 400px;
        margin: 0 auto 2rem;
        padding: 1rem;
        border: 2px solid #8B4513;
        border-radius: 25px;
        font-size: 1rem;
        display: block;
        outline: none;
        transition: border-color 0.3s ease;
    `;
    
    // Insert search input before category tabs
    const knowledgeIntro = document.querySelector('.knowledge-intro');
    if (knowledgeIntro) {
        knowledgeIntro.parentNode.insertBefore(searchInput, knowledgeIntro.nextSibling);
    }
    
    // Add search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // If search term is empty, show all content
        if (searchTerm === '') {
            tabContents.forEach(content => {
                content.style.display = content.classList.contains('active') ? 'block' : 'none';
            });
            document.querySelector('.category-tabs').style.display = 'flex';
            document.querySelector('.quick-tips').style.display = 'block';
            return;
        }
        
        // Hide category tabs and quick tips during search
        document.querySelector('.category-tabs').style.display = 'none';
        document.querySelector('.quick-tips').style.display = 'none';
        
        // Search through all knowledge cards
        let hasResults = false;
        tabContents.forEach(content => {
            const cards = content.querySelectorAll('.knowledge-card');
            let contentHasResults = false;
            
            cards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'block';
                    contentHasResults = true;
                    hasResults = true;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show content if it has matching cards
            content.style.display = contentHasResults ? 'block' : 'none';
        });
        
        // Show no results message if needed
        let noResultsMsg = document.querySelector('.no-results');
        if (!hasResults && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>No results found for "${this.value}"</h3>
                    <p>Try searching for terms like "temperature", "feeding", "health", or "brooder"</p>
                </div>
            `;
            document.querySelector('.category-content').appendChild(noResultsMsg);
        } else if (hasResults && noResultsMsg) {
            noResultsMsg.remove();
        }
    });
    
    // Add clear search button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'clear-search-btn';
    clearBtn.style.cssText = `
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: #8B4513;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: none;
        font-size: 12px;
    `;
    
    // Position the search input container
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(clearBtn);
    
    // Show/hide clear button
    searchInput.addEventListener('input', function() {
        clearBtn.style.display = this.value ? 'block' : 'none';
    });
    
    // Clear search functionality
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    });
    
    // Add keyboard navigation for tabs
    document.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('tab-btn')) {
            const currentIndex = Array.from(tabButtons).indexOf(e.target);
            
            if (e.key === 'ArrowRight' && currentIndex < tabButtons.length - 1) {
                tabButtons[currentIndex + 1].focus();
                tabButtons[currentIndex + 1].click();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                tabButtons[currentIndex - 1].focus();
                tabButtons[currentIndex - 1].click();
            }
        }
    });
    
    // Add print functionality for knowledge base
    const printBtn = document.createElement('button');
    printBtn.textContent = '🖨️ Print Guide';
    printBtn.className = 'print-btn';
    printBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #8B4513;
        color: white;
        border: none;
        border-radius: 25px;
        padding: 1rem 1.5rem;
        cursor: pointer;
        font-weight: 600;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
    `;
    
    document.body.appendChild(printBtn);
    
    // Only show print button when on knowledge base section
    window.addEventListener('scroll', function() {
        const knowledgeSection = document.getElementById('knowledge');
        if (knowledgeSection) {
            const rect = knowledgeSection.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                printBtn.style.display = 'block';
            } else {
                printBtn.style.display = 'none';
            }
        }
    });
    
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.textContent = `
        @media print {
            body * {
                visibility: hidden;
            }
            #knowledge, #knowledge * {
                visibility: visible;
            }
            #knowledge {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            .tab-btn, .knowledge-search, .clear-search-btn, .print-btn, .header, .footer {
                display: none !important;
            }
            .tab-content {
                display: block !important;
            }
            .knowledge-card {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    `;
    document.head.appendChild(printStyles);
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.about-card, .product-card, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form Validation and Submission
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            quantity: document.getElementById('quantity').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        // Validation
        let isValid = true;
        let errorMessage = '';
        
        if (!formData.name) {
            errorMessage = 'Please enter your name';
            isValid = false;
        } else if (!formData.phone) {
            errorMessage = 'Please enter your phone number';
            isValid = false;
        } else if (!formData.quantity) {
            errorMessage = 'Please enter the number of chicks you want';
            isValid = false;
        } else if (isNaN(formData.quantity) || formData.quantity <= 0) {
            errorMessage = 'Please enter a valid number of chicks';
            isValid = false;
        } else if (formData.phone.length < 10) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
        
        if (!isValid) {
            showNotification(errorMessage, 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = orderForm.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Show success message
            showNotification('Order placed successfully! We will contact you soon.', 'success');
            
            // Reset form
            orderForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Log the order (in a real application, this would be sent to a server)
            console.log('Order placed:', formData);
        }, 2000);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #007bff, #0056b3)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Order Button Click Handlers
document.querySelectorAll('.btn-order').forEach(button => {
    button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.price').textContent;
        
        // Scroll to contact form
        document.getElementById('contact').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Pre-fill some information if needed
        setTimeout(() => {
            const messageField = document.getElementById('message');
            if (messageField) {
                messageField.value = `I'm interested in ordering ${productName} (${productPrice})`;
                messageField.focus();
            }
        }, 1000);
    });
});

// Add hover effect to chicks
document.querySelectorAll('.chick').forEach(chick => {
    chick.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2) rotate(10deg)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    chick.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - scrolled / 800;
    }
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle && heroSubtitle) {
        setTimeout(() => {
            typeWriter(heroTitle, 'WHITE HORSE', 150);
            setTimeout(() => {
                typeWriter(heroSubtitle, 'ROAD RUNNER CHICKS', 150);
            }, 2000);
        }, 500);
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Counter animation for statistics (if needed)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Add hover sound effect (optional)
function playHoverSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Add hover sound to buttons (optional)
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        try {
            playHoverSound();
        } catch (e) {
            // Ignore if audio context is not supported
        }
    });
});
