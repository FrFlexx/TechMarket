// Управление корзиной
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('techmarket_cart')) || [];
        this.updateCartUI();
        this.setupModal();
        this.updateStats();
    }

    addToCart(productId) {
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        if (!product.inStock) {
            this.showNotification('❌ Этот товар временно отсутствует на складе', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.discountPrice || product.price,
                originalPrice: product.price,
                quantity: 1,
                image: this.getCategoryIcon(product.category),
                category: product.category
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`✅ "${product.name}" добавлен в корзину`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.renderCartModal();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateCartUI();
                this.renderCartModal();
            }
        }
    }

    updateCartUI() {
        const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }

    saveCart() {
        localStorage.setItem('techmarket_cart', JSON.stringify(this.cart));
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.style.background = type === 'error' ? 'var(--danger)' : 'var(--secondary)';
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    setupModal() {
        const cartIcon = document.getElementById('cartIcon');
        const modal = document.getElementById('cartModal');
        const closeBtn = modal.querySelector('.close');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.renderCartModal();
                modal.style.display = 'block';
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }
    }

    renderCartModal() {
        const cartItems = document.getElementById('cartItems');
        const totalPrice = document.getElementById('totalPrice');
        const savingsElement = document.getElementById('cartSavings');
        const savingsAmount = document.getElementById('savingsAmount');

        if (!cartItems || !totalPrice) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = this.getEmptyCartHTML();
            totalPrice.textContent = '0';
            if (savingsElement) savingsElement.style.display = 'none';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item slide-up">
                <div class="item-image">${item.image}</div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="item-price">
                        ${item.price.toLocaleString('ru-KZ')} тенге. × ${item.quantity}
                        ${item.originalPrice > item.price ? 
                            `<div class="item-savings">Экономия: ${((item.originalPrice - item.price) * item.quantity).toLocaleString('ru-KZ')} тенге.</div>` : 
                            ''}
                    </div>
                </div>
                <div class="item-controls">
                    <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        const total = this.calculateTotal();
        const savings = this.calculateSavings();
        const deliveryCost = this.getDeliveryCost();
        const finalTotal = total + deliveryCost;
        
        totalPrice.textContent = finalTotal.toLocaleString('ru-KZ');
        
        if (savings > 0 && savingsElement && savingsAmount) {
            savingsAmount.textContent = savings.toLocaleString('ru-KZ');
            savingsElement.style.display = 'block';
        } else if (savingsElement) {
            savingsElement.style.display = 'none';
        }
    }

    calculateTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    calculateSavings() {
        return this.cart.reduce((sum, item) => {
            if (item.originalPrice > item.price) {
                return sum + ((item.originalPrice - item.price) * item.quantity);
            }
            return sum;
        }, 0);
    }

    getDeliveryCost() {
        const deliveryOption = document.querySelector('input[name="delivery"]:checked');
        return deliveryOption && deliveryOption.value === 'express' ? 500 : 0;
    }

    getCategoryIcon(category) {
        const categoryObj = categories.find(cat => cat.id === category);
        return categoryObj ? categoryObj.icon : '📦';
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('❌ Корзина пуста! Добавьте товары перед оформлением заказа.', 'error');
            return;
        }

        const total = this.calculateTotal();
        const savings = this.calculateSavings();
        const deliveryCost = this.getDeliveryCost();
        const finalTotal = total + deliveryCost;
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
        
        let message = `🎉 Заказ успешно оформлен!\n\n`;
        message += `📦 Товаров: ${itemCount} шт.\n`;
        message += `💰 Сумма: ${total.toLocaleString('ru-KZ')} тенге.\n`;
        
        if (savings > 0) {
            message += `💵 Экономия: ${savings.toLocaleString('ru-KZ')} тенге.\n`;
        }
        
        message += `🚚 Доставка: ${deliveryType === 'express' ? 'Экспресс (+500 тенге.)' : 'Стандартная (бесплатно)'}\n`;
        message += `💎 Итого: ${finalTotal.toLocaleString('ru-KZ')} тенге.\n\n`;
        message += `📞 С вами свяжется наш менеджер для подтверждения заказа.\n`;
        message += `🙏 Спасибо за покупку!`;
        
        this.showCheckoutSuccess(message);
        
        projectStats.totalOrders++;
        projectStats.totalRevenue += finalTotal;
        this.updateStats();
        
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.renderCartModal();
        
        setTimeout(() => {
            const modal = document.getElementById('cartModal');
            if (modal) modal.style.display = 'none';
        }, 3000);
    }

    showCheckoutSuccess(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
                    <div style="white-space: pre-line; font-weight: 600;">${message}</div>
                </div>
            `;
            notification.style.background = 'linear-gradient(135deg, var(--secondary), #0da271)';
            notification.style.display = 'block';
            notification.style.maxWidth = '400px';
            
            setTimeout(() => {
                notification.style.display = 'none';
                notification.innerHTML = '';
                notification.style.maxWidth = 'none';
            }, 5000);
        }
    }

    buyNow(productId) {
        this.cart = [];
        this.addToCart(productId);
        
        setTimeout(() => {
            this.renderCartModal();
            const modal = document.getElementById('cartModal');
            if (modal) modal.style.display = 'block';
        }, 300);
    }

    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <div style="font-size: 4rem; margin-bottom: 1rem;">😔</div>
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из каталога, чтобы сделать заказ</p>
                <button class="cta-button" onclick="document.getElementById('cartModal').style.display='none'; scrollToProducts();" 
                        style="margin-top: 1rem;">
                    🎯 Перейти к покупкам
                </button>
            </div>
        `;
    }

    updateStats() {
        const totalProducts = document.getElementById('totalProducts');
        const totalOrders = document.getElementById('totalOrders');
        
        if (totalProducts) totalProducts.textContent = products.length;
        if (totalOrders) totalOrders.textContent = projectStats.totalOrders;
    }
}