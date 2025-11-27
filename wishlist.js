// Управление избранным
class WishlistManager {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('techmarket_wishlist')) || [];
        this.updateWishlistUI();
        this.setupWishlistModal();
    }

    toggleWishlist() {
        const modal = document.getElementById('wishlistModal');
        this.renderWishlistModal();
        modal.style.display = 'block';
    }

    addToWishlist(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (this.isInWishlist(productId)) {
            this.removeFromWishlist(productId);
            this.showNotification(`❌ "${product.name}" удален из избранного`);
        } else {
            this.wishlist.push({
                id: product.id,
                name: product.name,
                price: product.discountPrice || product.price,
                image: this.getCategoryIcon(product.category),
                category: product.category
            });
            this.showNotification(`❤️ "${product.name}" добавлен в избранное`);
        }

        this.saveWishlist();
        this.updateWishlistUI();
        this.updateProductWishlistIcon(productId);
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlist();
        this.updateWishlistUI();
        this.renderWishlistModal();
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    updateWishlistUI() {
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            wishlistCount.textContent = this.wishlist.length;
        }
    }

    updateProductWishlistIcon(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            const wishlistBtn = productCard.querySelector('.wishlist-toggle');
            if (wishlistBtn) {
                wishlistBtn.classList.toggle('active', this.isInWishlist(productId));
                wishlistBtn.innerHTML = this.isInWishlist(productId) ? '❤️' : '🤍';
            }
        }
    }

    saveWishlist() {
        localStorage.setItem('techmarket_wishlist', JSON.stringify(this.wishlist));
    }

    setupWishlistModal() {
        const modal = document.getElementById('wishlistModal');
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    renderWishlistModal() {
        const wishlistItems = document.getElementById('wishlistItems');

        if (this.wishlist.length === 0) {
            wishlistItems.innerHTML = `
                <div class="empty-wishlist">
                    <h3>😔 Избранное пусто</h3>
                    <p>Добавляйте товары в избранное, нажимая на сердечко</p>
                </div>
            `;
            return;
        }

        wishlistItems.innerHTML = this.wishlist.map(item => `
            <div class="cart-item">
                <div class="item-image">${item.image}</div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="item-price">${item.price.toLocaleString('ru-KZ')} тенге.</div>
                </div>
                <div class="item-controls">
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        🛒 В корзину
                    </button>
                    <button class="remove-btn" onclick="removeFromWishlist(${item.id})">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCategoryIcon(category) {
        const categoryObj = categories.find(cat => cat.id === category);
        return categoryObj ? categoryObj.icon : '📦';
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }
}