// Главное приложение
class TechMarketApp {
    constructor() {
        this.productManager = null;
        this.cartManager = null;
        this.wishlistManager = null;
        this.init();
    }

    init() {
        console.log('🚀 Инициализация TechMarket...');
        this.initManagers();
        this.setupGlobalFunctions();
        this.hidePreloader();
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    initManagers() {
        try {
            // Инициализируем менеджеры в правильном порядке
            this.wishlistManager = new WishlistManager();
            this.cartManager = new CartManager();
            this.productManager = new ProductManager();
            
            // Делаем глобально доступными
            window.productManager = this.productManager;
            window.cartManager = this.cartManager;
            window.wishlistManager = this.wishlistManager;
            window.app = this;

            console.log('✅ Все менеджеры инициализированы!');
        } catch (error) {
            console.error('❌ Ошибка инициализации менеджеров:', error);
        }
    }

    setupGlobalFunctions() {
        // Глобальные функции для HTML атрибутов
        window.showHome = () => this.showHome();
        window.scrollToProducts = () => this.scrollToProducts();
        window.toggleSupportChat = () => this.toggleSupportChat();
        window.filterByCategory = (category) => this.filterByCategory(category);
        window.addToCart = (productId) => this.addToCart(productId);
        window.addToWishlist = (productId) => this.addToWishlist(productId);
        window.removeFromCart = (productId) => this.removeFromCart(productId);
        window.updateQuantity = (productId, change) => this.updateQuantity(productId, change);
        window.removeFromWishlist = (productId) => this.removeFromWishlist(productId);
        window.buyNow = (productId) => this.buyNow(productId);
        window.toggleWishlist = () => this.toggleWishlist();
        
        // Функции для продукт менеджера
        window.searchProducts = () => this.searchProducts();
        window.sortProducts = () => this.sortProducts();
        window.toggleStockFilter = () => this.toggleStockFilter();
        window.toggleDiscountFilter = () => this.toggleDiscountFilter();
        window.toggleDeliveryFilter = () => this.toggleDeliveryFilter();
        window.applyPriceFilter = () => this.applyPriceFilter();
        window.clearFilters = () => this.clearFilters();
        window.setViewMode = (mode) => this.setViewMode(mode);
        window.loadMore = () => this.loadMore();
    }

    // Обертки для методов менеджеров
    filterByCategory(category) {
        if (this.productManager) {
            this.productManager.filterByCategory(category);
        }
    }

    addToCart(productId) {
        if (this.cartManager) {
            this.cartManager.addToCart(parseInt(productId));
        }
    }

    addToWishlist(productId) {
        if (this.wishlistManager) {
            this.wishlistManager.addToWishlist(parseInt(productId));
        }
    }

    removeFromCart(productId) {
        if (this.cartManager) {
            this.cartManager.removeFromCart(parseInt(productId));
        }
    }

    updateQuantity(productId, change) {
        if (this.cartManager) {
            this.cartManager.updateQuantity(parseInt(productId), parseInt(change));
        }
    }

    removeFromWishlist(productId) {
        if (this.wishlistManager) {
            this.wishlistManager.removeFromWishlist(parseInt(productId));
        }
    }

    buyNow(productId) {
        if (this.cartManager) {
            this.cartManager.buyNow(parseInt(productId));
        }
    }

    toggleWishlist() {
        if (this.wishlistManager) {
            this.wishlistManager.toggleWishlist();
        }
    }

    searchProducts() {
        if (this.productManager) {
            this.productManager.search();
        }
    }

    sortProducts() {
        if (this.productManager) {
            this.productManager.sortProducts();
        }
    }

    toggleStockFilter() {
        if (this.productManager) {
            this.productManager.toggleStockFilter();
        }
    }

    toggleDiscountFilter() {
        if (this.productManager) {
            this.productManager.toggleDiscountFilter();
        }
    }

    toggleDeliveryFilter() {
        if (this.productManager) {
            this.productManager.toggleDeliveryFilter();
        }
    }

    applyPriceFilter() {
        if (this.productManager) {
            this.productManager.applyPriceFilter();
        }
    }

    clearFilters() {
        if (this.productManager) {
            this.productManager.clearFilters();
        }
    }

    setViewMode(mode) {
        if (this.productManager) {
            this.productManager.setViewMode(mode);
        }
    }

    loadMore() {
        if (this.productManager) {
            this.productManager.loadMore();
        }
    }

    hidePreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }
            }, 1000);
        });
    }

    setupEventListeners() {
        // Плавная прокрутка для навигации
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });

        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => modal.style.display = 'none');
            }
        });

        // Обработка Enter в поиске
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts();
                }
            });
        }

        // Анимации при скролле
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Наблюдаем за карточками товаров и другими элементами
        setTimeout(() => {
            document.querySelectorAll('.product-card, .feature-card, .offer-card').forEach(el => {
                observer.observe(el);
            });
        }, 1000);
    }

    showHome() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.filterByCategory('all');
    }

    scrollToProducts() {
        const productsSection = document.getElementById('productsSection');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleSupportChat() {
        this.showNotification('💬 Чат поддержки будет доступен в следующей версии');
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('🎉 Добро пожаловать в TechMarket! Начните покупки прямо сейчас.');
        }, 2000);
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.style.background = type === 'error' ? 'var(--danger)' : 'var(--secondary)';
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 4000);
        }
    }
}

// Запуск приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', function() {
    window.techMarketApp = new TechMarketApp();
    console.log('🎉 TechMarket полностью загружен и готов к работе!');
});

// Глобальные обработчики ошибок
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});