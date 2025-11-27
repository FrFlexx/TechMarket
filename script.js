// Данные товаров
const products = [
    { 
        id: 1, 
        name: "iPhone 15 Pro", 
        price: 99990, 
        description: "Новый iPhone с титановым корпусом и камерой 48 Мп"
    },
    { 
        id: 2, 
        name: "Samsung Galaxy S24", 
        price: 79990, 
        description: "Флагманский смартфон с AI-функциями"
    },
    { 
        id: 3, 
        name: "MacBook Air M3", 
        price: 129990, 
        description: "Ультратонкий ноутбук с чипом Apple M3"
    },
    { 
        id: 4, 
        name: "Sony WH-1000XM5", 
        price: 29990, 
        description: "Наушники с шумоподавлением"
    }
];

// Отображение товаров
function displayProducts() {
    const container = document.getElementById('products');
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="price">${product.price.toLocaleString('ru-KZ')} тенге.</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                🛒 Добавить в корзину
            </button>
        </div>
    `).join('');
}

// Простая корзина
let cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    alert(`✅ "${product.name}" добавлен в корзину!`);
    console.log('Корзина:', cart);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    console.log('🛒 Магазин загружен! Товаров:', products.length);
});