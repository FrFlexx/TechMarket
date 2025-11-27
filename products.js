// Управление товарами
class ProductManager {
    constructor() {
        this.filteredProducts = [...products];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'default';
        this.onlyInStock = false;
        this.onlyDiscount = false;
        this.onlyFastDelivery = false;
        this.minPrice = '';
        this.maxPrice = '';
        this.viewMode = 'grid';
        this.currentPage = 1;
        this.productsPerPage = 8;
        
        this.init();
    }

    init() {
        this.renderProducts();
        this.setupEventListeners();
        this.updateProductsCount();
        this.updatePriceFilters();
    }

    renderProducts() {
        const container = document.getElementById('products');
        if (!container) return;
        
        const productsToShow = this.getProductsForCurrentPage();
        
        if (this.filteredProducts.length === 0) {
            container.innerHTML = this.getNoProductsHTML();
            this.hideLoadMore();
            return;
        }

        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        this.updateLoadMoreButton();
        this.attachWishlistListeners();
    }

    createProductCard(product) {
        const isInWishlist = window.wishlistManager ? window.wishlistManager.isInWishlist(product.id) : false;
        const finalPrice = product.discountPrice || product.price;
        
        return `
            <div class="product-card fade-in" data-product-id="${product.id}">
                <div class="product-image">
                    ${this.getCategoryIcon(product.category)}
                    <div class="product-badges">
                        ${product.discountPrice ? '<div class="discount-badge">🔥 Скидка</div>' : ''}
                        ${!product.inStock ? '<div class="out-of-stock-badge">Нет в наличии</div>' : ''}
                        ${product.isNew ? '<div class="new-badge">NEW</div>' : ''}
                        ${product.fastDelivery ? '<div class="fast-delivery-badge">🚚 Быстрая доставка</div>' : ''}
                    </div>
                    <button class="wishlist-toggle ${isInWishlist ? 'active' : ''}" 
                            onclick="addToWishlist(${product.id})">
                        ${isInWishlist ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-specs">
                        ${product.specs.map(spec => `
                            <span class="spec-tag">${spec}</span>
                        `).join('')}
                    </div>
                    
                    <div class="product-rating">
                        <span class="rating-stars">${this.generateStarRating(product.rating)}</span>
                        <span class="rating-value">${product.rating}</span>
                        <span class="reviews">(${product.reviews} отзывов)</span>
                    </div>
                    
                    <div class="product-price">
                        ${product.discountPrice ? `
                            <span class="original-price">${product.price.toLocaleString('ru-KZ')} тенге.</span>
                            <span class="discount-price">${finalPrice.toLocaleString('ru-KZ')} тенге.</span>
                        ` : `
                            <span class="final-price">${finalPrice.toLocaleString('ru-KZ')} тенге.</span>
                        `}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn ${!product.inStock ? 'disabled' : ''}" 
                                onclick="addToCart(${product.id})"
                                ${!product.inStock ? 'disabled' : ''}>
                            ${product.inStock ? '🛒 В корзину' : 'Нет в наличии'}
                        </button>
                        <button class="buy-now-btn ${!product.inStock ? 'disabled' : ''}"
                                onclick="buyNow(${product.id})"
                                ${!product.inStock ? 'disabled' : ''}>
                            ⚡ Купить сейчас
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const categoryObj = categories.find(cat => cat.id === category);
        return categoryObj ? categoryObj.icon : '📦';
    }

    generateStarRating(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push('⭐');
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push('✨');
            } else {
                stars.push('☆');
            }
        }
        return stars.join('');
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.applyFilters();
        this.updateActiveNavLink(category);
    }

    search() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.searchQuery = searchInput.value.toLowerCase().trim();
            this.currentPage = 1;
            this.applyFilters();
        }
    }

    sortProducts() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            this.sortBy = sortSelect.value;
            this.applyFilters();
        }
    }

    toggleStockFilter() {
        const stockCheckbox = document.getElementById('inStockOnly');
        if (stockCheckbox) {
            this.onlyInStock = stockCheckbox.checked;
            this.currentPage = 1;
            this.applyFilters();
        }
    }

    toggleDiscountFilter() {
        const discountCheckbox = document.getElementById('discountOnly');
        if (discountCheckbox) {
            this.onlyDiscount = discountCheckbox.checked;
            this.currentPage = 1;
            this.applyFilters();
        }
    }

    toggleDeliveryFilter() {
        const deliveryCheckbox = document.getElementById('fastDelivery');
        if (deliveryCheckbox) {
            this.onlyFastDelivery = deliveryCheckbox.checked;
            this.currentPage = 1;
            this.applyFilters();
        }
    }

    applyPriceFilter() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        if (minPriceInput) this.minPrice = minPriceInput.value;
        if (maxPriceInput) this.maxPrice = maxPriceInput.value;
        
        this.currentPage = 1;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...products];

        // Фильтрация по категории
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }

        // Поиск
        if (this.searchQuery) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery) ||
                product.specs.some(spec => spec.toLowerCase().includes(this.searchQuery))
            );
        }

        // Фильтры по наличию и скидкам
        if (this.onlyInStock) {
            filtered = filtered.filter(product => product.inStock);
        }

        if (this.onlyDiscount) {
            filtered = filtered.filter(product => product.discountPrice);
        }

        if (this.onlyFastDelivery) {
            filtered = filtered.filter(product => product.fastDelivery);
        }

        // Фильтрация по цене
        if (this.minPrice) {
            filtered = filtered.filter(product => {
                const price = product.discountPrice || product.price;
                return price >= parseInt(this.minPrice);
            });
        }

        if (this.maxPrice) {
            filtered = filtered.filter(product => {
                const price = product.discountPrice || product.price;
                return price <= parseInt(this.maxPrice);
            });
        }

        // Сортировка
        filtered = this.sortProductsList(filtered);

        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateProductsCount();
        this.updatePriceFilters();
    }

    sortProductsList(productsList) {
        switch (this.sortBy) {
            case 'price_asc':
                return productsList.sort((a, b) => 
                    (a.discountPrice || a.price) - (b.discountPrice || b.price));
            case 'price_desc':
                return productsList.sort((a, b) => 
                    (b.discountPrice || b.price) - (a.discountPrice || a.price));
            case 'name':
                return productsList.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                return productsList.sort((a, b) => b.rating - a.rating);
            case 'popular':
                return productsList.sort((a, b) => {
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    return b.reviews - a.reviews;
                });
            default:
                return productsList;
        }
    }

    // Пагинация
    getProductsForCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        return this.filteredProducts.slice(0, endIndex);
    }

    loadMore() {
        this.currentPage++;
        this.renderProducts();
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (this.currentPage >= totalPages || this.filteredProducts.length <= this.productsPerPage) {
            this.hideLoadMore();
        } else {
            this.showLoadMore();
        }
    }

    hideLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }

    showLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'block';
    }

    // Вспомогательные методы
    clearFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'default';
        this.onlyInStock = false;
        this.onlyDiscount = false;
        this.onlyFastDelivery = false;
        this.minPrice = '';
        this.maxPrice = '';
        this.currentPage = 1;

        // Сброс UI
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const inStockOnly = document.getElementById('inStockOnly');
        const discountOnly = document.getElementById('discountOnly');
        const fastDelivery = document.getElementById('fastDelivery');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');

        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'default';
        if (inStockOnly) inStockOnly.checked = false;
        if (discountOnly) discountOnly.checked = false;
        if (fastDelivery) fastDelivery.checked = false;
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';

        this.applyFilters();
        this.updateActiveNavLink('all');
    }

    setViewMode(mode) {
        this.viewMode = mode;
        const container = document.getElementById('products');
        const viewBtns = document.querySelectorAll('.view-btn');
        
        if (container) {
            container.className = `products-grid ${mode}-view`;
        }
        
        viewBtns.forEach(btn => btn.classList.remove('active'));
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        this.renderProducts();
    }

    updateProductsCount() {
        const countElement = document.getElementById('productsCount');
        if (countElement) {
            countElement.textContent = `Показано: ${this.getProductsForCurrentPage().length} из ${this.filteredProducts.length}`;
        }
    }

    updatePriceFilters() {
        if (this.filteredProducts.length === 0) return;
        
        const prices = this.filteredProducts.map(p => p.discountPrice || p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        if (minPriceInput) minPriceInput.placeholder = `от ${minPrice.toLocaleString('ru-RU')}`;
        if (maxPriceInput) maxPriceInput.placeholder = `до ${maxPrice.toLocaleString('ru-RU')}`;
    }

    updateActiveNavLink(category) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        if (category === 'all') {
            const homeLink = document.querySelector('.nav-link[href="#heroSection"]');
            if (homeLink) homeLink.classList.add('active');
        } else {
            const activeLink = document.querySelector(`.nav-link[onclick*="${category}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    }

    attachWishlistListeners() {
        document.querySelectorAll('.wishlist-toggle').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    }

    getNoProductsHTML() {
        return `
            <div class="no-products">
                <h3>😔 Товары не найдены</h3>
                <p>Попробуйте изменить критерии поиска или сбросить фильтры</p>
                <button class="clear-filters" onclick="clearFilters()" style="margin-top: 1rem;">
                    🗑️ Сбросить все фильтры
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Автопоиск при вводе
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.search();
                }, 500);
            });
        }
    }
}