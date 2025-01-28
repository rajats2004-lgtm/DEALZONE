// Add this single toggleForms function at the top of your file
window.toggleForms = function() {
    const loginForm = document.querySelector('#loginForm');
    const registerForm = document.querySelector('#registerForm');
    const toggleText = document.querySelector('#toggleText');

    if (loginForm && registerForm && toggleText) {
        if (loginForm.style.display === 'block') {
            // Switch to Register
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            toggleText.textContent = "Already have an account? Login";
        } else {
            // Switch to Login
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            toggleText.textContent = "Don't have an account? Sign up";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Cart State
    let cart = [];
    let isCartOpen = false;

    // Add wishlist state with local storage
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    let isWishlistOpen = false;

    // Initialize the product display
    displayProducts(products);
    
    // Cart Toggle
    const cartIcon = document.getElementById('cartIcon');
    const cartNav = document.getElementById('cartNav');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');

    // Wishlist Toggle
    const wishlistIcon = document.getElementById('wishlistIcon');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const closeWishlist = document.getElementById('closeWishlist');

    function toggleCart() {
        isCartOpen = !isCartOpen;
        cartSidebar.style.transform = isCartOpen ? 'translateX(0)' : 'translateX(100%)';
        
        // Get the checkout button
        const checkoutBtn = document.getElementById('fixedCheckoutBtn');
        
        // Show/hide checkout button based on cart state
        if (checkoutBtn) {
            checkoutBtn.style.display = isCartOpen ? 'block' : 'none';
        }
    }

    function toggleWishlist() {
        isWishlistOpen = !isWishlistOpen;
        wishlistSidebar.style.transform = isWishlistOpen ? 'translateX(0)' : 'translateX(100%)';
    }

    cartIcon.addEventListener('click', toggleCart);
    cartNav.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);

    wishlistIcon.addEventListener('click', toggleWishlist);
    closeWishlist.addEventListener('click', toggleWishlist);

    // Category Filtering
    const categoryButtons = document.querySelectorAll('button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => {
                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('bg-white');
            });

            button.classList.remove('bg-white');
            button.classList.add('bg-green-500', 'text-white');

            const category = button.textContent;
            if (category === 'All') {
                displayProducts(products);
            } else {
                const filteredProducts = products.filter(product => 
                    product.category === category
                );
                displayProducts(filteredProducts);
            }
        });
    });

    // Search with debounce
    const searchInput = document.querySelector('input[type="text"]');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredProducts);
        }, 300);
    });

    // Add to Cart Function
    window.addToCart = function(product) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        updateCartUI();
        // Show cart when item is added
        if (!isCartOpen) {
            toggleCart();
        }
        
        // Show notification
        showNotification(`Added ${product.name} to cart`);
    }

    // Update Cart UI
    function updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.querySelectorAll('.cart-count');
        
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.forEach(count => count.textContent = totalItems);

        // Remove existing checkout button if it exists
        const existingCheckoutBtn = document.getElementById('fixedCheckoutBtn');
        if (existingCheckoutBtn) {
            existingCheckoutBtn.remove();
        }

        // Add fixed checkout button if cart has items
        if (cart.length > 0) {
            const checkoutBtn = document.createElement('div');
            checkoutBtn.id = 'fixedCheckoutBtn';
            checkoutBtn.className = 'fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50';
            // Initially hide the button if cart is closed
            checkoutBtn.style.display = isCartOpen ? 'block' : 'none';
            checkoutBtn.innerHTML = `
                <button onclick="showDeliveryDetails()" 
                        class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all font-medium">
                    Proceed to Checkout (${totalItems} ${totalItems === 1 ? 'item' : 'items'})
                </button>
            `;
            document.body.appendChild(checkoutBtn);
        }

        // Update cart items
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-shopping-cart text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">Your cart is empty</p>
                </div>
            `;
            
            // Clear cart summary when cart is empty
            const cartSummary = document.querySelector('.space-y-2');
            if (cartSummary) {
                cartSummary.innerHTML = `
                    <div class="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹0</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                        <span>GST (18%):</span>
                        <span>₹0</span>
                    </div>
                    <div class="flex justify-between text-gray-600">
                        <span>Delivery:</span>
                        <span>₹0</span>
                    </div>
                    <div class="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>₹0</span>
                    </div>
                `;
            }
            return;
        }

        // Update cart items display
        cartItems.innerHTML = cart.map(item => `
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div class="flex items-start space-x-4">
                    <img src="${item.image}" alt="${item.name}" 
                         class="w-20 h-20 object-cover rounded-lg"
                         onerror="handleImageError(this)"
                         ${item.backupImage ? `data-backup-image="${item.backupImage}"` : ''}>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-medium text-gray-800">${item.name}</h3>
                                <p class="text-sm text-gray-500 mt-1">${item.category}</p>
                            </div>
                            <button onclick="removeFromCart(${item.id})" 
                                    class="text-gray-400 hover:text-red-500 p-1">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="mt-2">
                            <p class="text-green-600 font-bold">${formatPrice(item.price)}</p>
                            <div class="flex items-center space-x-3 mt-2">
                                <button onclick="updateQuantity(${item.id}, -1)" 
                                        class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
                                    <i class="fas fa-minus text-sm"></i>
                                </button>
                                <span class="font-medium">${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, 1)" 
                                        class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">
                                    <i class="fas fa-plus text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mt-2 text-right">
                            <p class="text-sm text-gray-600">
                                Subtotal: <span class="font-bold">${formatPrice(item.price * item.quantity)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Calculate and update cart summary
        const cartSummary = document.querySelector('.space-y-2');
        if (cartSummary) {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.18; // 18% GST
            const delivery = subtotal > 0 ? 499 : 0; // ₹499 delivery fee if cart not empty
            const total = subtotal + tax + delivery;

            cartSummary.innerHTML = `
                <div class="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>${formatPrice(subtotal)}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                    <span>GST (18%):</span>
                    <span>${formatPrice(tax)}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                    <span>Delivery:</span>
                    <span>${formatPrice(delivery)}</span>
                </div>
                <div class="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${formatPrice(total)}</span>
                </div>
            `;
        }
    }

    // Remove from cart
    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
        showNotification('Item removed from cart');
    }

    // Update quantity
    window.updateQuantity = function(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                updateCartUI();
            }
        }
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-sm';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Proceed to checkout
    window.proceedToCheckout = function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        // Show delivery modal
        deliveryModal.classList.remove('hidden');
    }

    // Profile Management
    const profileNav = document.getElementById('profileNav');
    
    profileNav.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        
        if (!localStorage.getItem('isLoggedIn')) {
            modal.innerHTML = `
                <div class="bg-white rounded-lg max-w-md w-full mx-4">
                    <div class="p-6">
                        <!-- Close button -->
                        <div class="flex justify-end mb-4">
                            <button onclick="document.getElementById('profileModal').remove()" 
                                    class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <!-- Not Signed Up Message -->
                        <div class="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                            <i class="fas fa-user-circle text-gray-400 text-4xl mb-2"></i>
                            <h3 class="text-lg font-semibold text-gray-800">You are not signed up</h3>
                            <p class="text-sm text-gray-600 mt-1">Sign up or login to access your profile</p>
                        </div>

                        <!-- Guest View -->
                        <div id="guestView" style="display: block;">
                            <div class="space-y-4">
                                <button onclick="document.querySelector('#loginForm').style.display='block'; document.querySelector('#guestView').style.display='none';" 
                                        class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
                                    Login
                                </button>
                                <button onclick="document.querySelector('#registerForm').style.display='block'; document.querySelector('#guestView').style.display='none';" 
                                        class="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">
                                    Create Account
                                </button>
                            </div>
                        </div>

                        <!-- Login Form -->
                        <div id="loginForm" style="display: none;">
                            <h2 class="text-2xl font-bold mb-6">Login</h2>
                            <form onsubmit="handleLogin(event)" class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 mb-2">Email</label>
                                    <input type="email" name="email" required
                                           class="w-full p-3 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Password</label>
                                    <input type="password" name="password" required
                                           class="w-full p-3 border rounded-lg">
                                </div>
                                <button type="submit" 
                                        class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
                                    Login
                                </button>
                            </form>
                            <div class="mt-4 text-center">
                                <button type="button" onclick="document.querySelector('#registerForm').style.display='block'; document.querySelector('#loginForm').style.display='none';" 
                                        class="text-green-500 hover:text-green-600">
                                    Don't have an account? Sign up
                                </button>
                            </div>
                        </div>

                        <!-- Register Form -->
                        <div id="registerForm" style="display: none;">
                            <h2 class="text-2xl font-bold mb-6">Create Account</h2>
                            <form onsubmit="handleRegister(event)" class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 mb-2">Full Name</label>
                                    <input type="text" name="name" required
                                           class="w-full p-3 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Email</label>
                                    <input type="email" name="email" required
                                           class="w-full p-3 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Password</label>
                                    <input type="password" name="password" required
                                           class="w-full p-3 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Confirm Password</label>
                                    <input type="password" name="confirmPassword" required
                                           class="w-full p-3 border rounded-lg">
                                </div>
                                <button type="submit" 
                                        class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
                                    Create Account
                                </button>
                            </form>
                            <div class="mt-4 text-center">
                                <button type="button" onclick="document.querySelector('#loginForm').style.display='block'; document.querySelector('#registerForm').style.display='none';" 
                                        class="text-green-500 hover:text-green-600">
                                    Already have an account? Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Logged In View
            const userData = JSON.parse(localStorage.getItem('userData'));
            modal.innerHTML = `
                <div class="bg-white min-h-screen">
                    <!-- Header -->
                    <div class="p-4 border-b">
                        <div class="flex justify-between items-center">
                            <h1 class="text-xl font-semibold">Profile</h1>
                            <button onclick="document.getElementById('profileModal').remove()" 
                                    class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Profile Info -->
                    <div class="p-4 border-b">
                        <div class="flex items-start space-x-4">
                            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <span class="text-2xl font-bold text-gray-600">
                                    ${userData.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 class="text-xl font-semibold">${userData.name}</h2>
                                <p class="text-gray-500">${userData.email}</p>
                                <p class="text-gray-500 mt-1">
                                    <i class="fas fa-phone mr-2"></i>
                                    ${userData.phone || '+1234567890'}
                                </p>
                                <p class="text-gray-500">
                                    <i class="fas fa-map-marker-alt mr-2"></i>
                                    ${userData.address || '123 Street, City, Country'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Menu Options -->
                    <div class="p-4 space-y-4">
                        <a href="#" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div class="flex items-center">
                                <i class="fas fa-shopping-bag text-green-500 w-6"></i>
                                <span class="ml-3">My Orders</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </a>

                        <a href="#" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div class="flex items-center">
                                <i class="fas fa-heart text-green-500 w-6"></i>
                                <span class="ml-3">Wishlist</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </a>

                        <a href="#" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div class="flex items-center">
                                <i class="fas fa-map-marker-alt text-green-500 w-6"></i>
                                <span class="ml-3">Addresses</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </a>

                        <a href="#" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div class="flex items-center">
                                <i class="fas fa-credit-card text-green-500 w-6"></i>
                                <span class="ml-3">Payment Methods</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </a>

                        <a href="#" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div class="flex items-center">
                                <i class="fas fa-cog text-green-500 w-6"></i>
                                <span class="ml-3">Settings</span>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </a>

                        <button onclick="handleLogout()" 
                                class="w-full mt-6 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600">
                            Logout
                        </button>
                    </div>

                    <!-- Bottom Navigation -->
                    <div class="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-4">
                        <a href="#" class="text-gray-500 hover:text-gray-700 text-center">
                            <i class="fas fa-home"></i>
                            <p class="text-xs mt-1">Home</p>
                        </a>
                        <a href="#" class="text-gray-500 hover:text-gray-700 text-center">
                            <i class="fas fa-search"></i>
                            <p class="text-xs mt-1">Search</p>
                        </a>
                        <a href="#" class="text-gray-500 hover:text-gray-700 text-center">
                            <i class="fas fa-shopping-cart"></i>
                            <p class="text-xs mt-1">Cart</p>
                        </a>
                        <a href="#" class="text-green-500 text-center">
                            <i class="fas fa-user"></i>
                            <p class="text-xs mt-1">Profile</p>
                        </a>
                    </div>
                </div>
            `;
        }
        
        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });

    // Delivery Management
    const deliveryModal = document.getElementById('deliveryModal');
    const closeDelivery = document.getElementById('closeDelivery');
    const deliveryForm = document.getElementById('deliveryForm');

    // Delivery Modal Functions
    function toggleDelivery() {
        deliveryModal.classList.toggle('hidden');
    }

    closeDelivery.addEventListener('click', toggleDelivery);

    deliveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add delivery form submission logic here
        alert('Delivery details saved');
        toggleDelivery();
    });

    // Update the getDiscountedPrice function to handle special discounts
    function getDiscountedPrice(originalPrice, productId) {
        if (typeof originalPrice === 'number') {
            // 75% off for new launch product (ID: 1)
            if (productId === 1) {
                return Math.round(originalPrice * 0.25); // 75% off = 25% of original price
            }
            // 70% off for other products
            return Math.round(originalPrice * 0.3); // 70% off = 30% of original price
        }
        return originalPrice; // Return original if price is not a number (e.g., "Coming Soon")
    }

    // Update the displayProducts function to pass product ID
    function displayProducts(productsToShow) {
        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = '';

        productsToShow.forEach(product => {
            const isLiked = wishlist.some(item => item.id === product.id);
            const discountedPrice = getDiscountedPrice(product.price, product.id);
            const showDiscount = typeof product.price === 'number';
            const discountPercent = product.id === 1 ? '75% OFF' : '70% OFF';
            
            const productCard = `
                <div class="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                    <div class="relative w-full h-40 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                        ${showDiscount ? `
                            <div class="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                ${discountPercent}
                            </div>
                        ` : ''}
                        <button onclick="toggleWishlistItem(${product.id})" 
                                data-product-id="${product.id}"
                                class="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-all">
                            <i class="fas fa-heart ${isLiked ? 'text-red-500' : 'text-gray-400'} transition-colors duration-300"></i>
                        </button>
                        <div class="absolute inset-0 flex items-center justify-center loading-spinner">
                            <div class="loading-shimmer"></div>
                        </div>
                        <img src="${product.image}" 
                             alt="${product.name}" 
                             class="w-full h-full object-contain loading transition-opacity duration-300 opacity-0"
                             onload="handleImageLoad(this)"
                             onerror="handleImageError(this)"
                             ${product.backupImage ? `data-backup-image="${product.backupImage}"` : ''}>
                    </div>
                    <h3 class="font-medium text-gray-800 line-clamp-1">${product.name}</h3>
                    <p class="text-gray-600 text-sm mt-2 line-clamp-2">${product.description || ''}</p>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-sm ${product.available ? 'text-green-500' : 'text-red-500'}">
                            ${product.available ? 'In Stock' : 'Sold Out'}
                        </span>
                        <span class="text-sm text-yellow-500">${product.rating} ★</span>
                    </div>
                    <div class="mt-3">
                        ${showDiscount ? `
                            <div class="flex items-center gap-2 mb-2">
                                <p class="text-lg font-bold text-green-600">${formatPrice(discountedPrice)}</p>
                                <p class="text-sm text-gray-500 line-through">${formatPrice(product.price)}</p>
                            </div>
                        ` : `
                            <p class="text-lg font-bold text-gray-800">${product.price}</p>
                        `}
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick='addToCart({...${JSON.stringify({...product, price: discountedPrice})}})'
                                    class="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center justify-center">
                                <i class="fas fa-shopping-cart mr-1"></i>
                                Add to Cart
                            </button>
                            <button onclick="showProductDetails(${product.id})"
                                    class="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium flex items-center justify-center">
                                <i class="fas fa-eye mr-1"></i>
                                View Detail
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.innerHTML += productCard;
        });

        // Check for cached images after adding to DOM
        const productImages = productGrid.querySelectorAll('img');
        productImages.forEach(img => {
            if (img.complete) {
                handleImageLoad(img);
            }
        });
    }

    // Update the showProductDetails function to handle special discounts
    window.showProductDetails = function(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            const discountedPrice = getDiscountedPrice(product.price, product.id);
            const showDiscount = typeof product.price === 'number';
            const discountPercent = product.id === 1 ? '75% OFF' : '70% OFF';
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-white z-50 overflow-y-auto';
            modal.innerHTML = `
                <div class="min-h-screen">
                    <!-- Navigation Bar -->
                    <div class="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex justify-between items-center">
                        <button class="text-gray-600 hover:text-gray-800" onclick="this.closest('.fixed').remove()">
                            <i class="fas fa-arrow-left text-xl"></i>
                        </button>
                        <h1 class="text-xl font-bold">${product.name}</h1>
                        <div class="w-8"></div>
                    </div>

                    <div class="container mx-auto px-4 py-6">
                        <!-- Product Images Gallery -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="space-y-4">
                                <div class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-xl overflow-hidden">
                                    <img src="${product.image}" 
                                         alt="${product.name}"
                                         class="w-full h-full object-contain"
                                         onerror="handleImageError(this)"
                                         ${product.backupImage ? `data-backup-image="${product.backupImage}"` : ''}>
                                </div>
                                <div class="grid grid-cols-4 gap-2">
                                    <img src="${product.image}" 
                                         class="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity border-2 border-green-500">
                                    ${product.backupImage ? `
                                    <img src="${product.backupImage}" 
                                         class="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity">
                                    ` : ''}
                                    <!-- Placeholder images for additional views -->
                                    <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-image text-gray-400 text-2xl"></i>
                                    </div>
                                    <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-image text-gray-400 text-2xl"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- Product Info -->
                            <div class="space-y-6">
                                <div>
                                    <h2 class="text-3xl font-bold text-gray-800">${product.name}</h2>
                                    <div class="flex items-center space-x-4 mt-2">
                                        <div class="flex items-center text-yellow-500">
                                            <span class="text-lg font-semibold">${product.rating}</span>
                                            <i class="fas fa-star ml-1"></i>
                                        </div>
                                        <span class="text-gray-400">|</span>
                                        <span class="${product.available ? 'text-green-500' : 'text-red-500'} font-medium">
                                            ${product.available ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>

                                <div class="text-4xl font-bold text-gray-800">
                                    ${showDiscount ? `
                                        <div class="flex items-center gap-3">
                                            <span class="text-green-600">${formatPrice(discountedPrice)}</span>
                                            <span class="text-lg text-gray-500 line-through">${formatPrice(product.price)}</span>
                                            <span class="text-red-500 text-lg font-semibold">${discountPercent}</span>
                                        </div>
                                    ` : formatPrice(product.price)}
                                </div>

                                <div class="space-y-4">
                                    <h3 class="text-lg font-semibold">Key Features</h3>
                                    <ul class="space-y-2">
                                        ${product.description.split('...').map(feature => 
                                            `<li class="flex items-start">
                                                <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                                                <span>${feature.trim()}</span>
                                             </li>`
                                        ).join('')}
                                    </ul>
                                </div>

                                <div class="space-y-4">
                                    <h3 class="text-lg font-semibold">Product Description</h3>
                                    <p class="text-gray-600 leading-relaxed">
                                        Experience the next level of innovation with the ${product.name}. 
                                        This cutting-edge device combines powerful performance with elegant design, 
                                        offering you the perfect blend of style and functionality.
                                    </p>
                                </div>

                                <div class="grid grid-cols-2 gap-4 pt-4">
                                    <button onclick='addToCart({...${JSON.stringify({...product, price: discountedPrice})}})'
                                            class="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all font-medium flex items-center justify-center">
                                        <i class="fas fa-shopping-cart mr-2"></i>
                                        Add to Cart
                                    </button>
                                    <button onclick='toggleWishlistItem(${product.id})'
                                            class="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium flex items-center justify-center">
                                        <i class="fas fa-heart mr-2 ${wishlist.some(item => item.id === product.id) ? 'text-red-500' : ''}"></i>
                                        Wishlist
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Specifications -->
                        <div class="mt-12">
                            <h3 class="text-2xl font-bold mb-6">Specifications</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-semibold mb-2">General</h4>
                                        <div class="space-y-2">
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">Brand</span>
                                                <span class="font-medium">${product.name.split(' ')[0]}</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">Model</span>
                                                <span class="font-medium">${product.name}</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">Category</span>
                                                <span class="font-medium">${product.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    // Global function for updating cart quantities
    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(item => item.id !== productId);
            }
            updateCartUI();
        }
    }

    // Add Wishlist Functions
    window.toggleWishlistItem = function(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = wishlist.find(item => item.id === productId);
        const heartIcon = document.querySelector(`[data-product-id="${productId}"] i.fa-heart`);
        
        if (existingItem) {
            wishlist = wishlist.filter(item => item.id !== productId);
            showNotification(`Removed ${product.name} from wishlist`);
            if (heartIcon) {
                heartIcon.classList.remove('text-red-500');
                heartIcon.classList.add('text-gray-400');
            }
        } else {
            wishlist.push(product);
            showNotification(`Added ${product.name} to wishlist`);
            if (heartIcon) {
                heartIcon.classList.remove('text-gray-400');
                heartIcon.classList.add('text-red-500');
            }
        }

        // Animate heart
        if (heartIcon) {
            heartIcon.classList.add('heart-pop');
            setTimeout(() => heartIcon.classList.remove('heart-pop'), 300);
        }
        
        // Save to localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        updateWishlistUI();
        displayProducts(products); // Refresh products to update heart icons
    }

    function updateWishlistUI() {
        const wishlistItems = document.getElementById('wishlistItems');
        const wishlistCount = document.querySelector('.wishlist-count');
        
        // Animate count change
        wishlistCount.classList.add('scale-110', 'transition-transform');
        setTimeout(() => {
            wishlistCount.classList.remove('scale-110');
        }, 200);
        
        wishlistCount.textContent = wishlist.length;

        if (wishlist.length === 0) {
            wishlistItems.innerHTML = `
                <div class="text-center py-8 animate-fade-in">
                    <i class="fas fa-heart text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">Your wishlist is empty</p>
                </div>
            `;
            return;
        }

        wishlistItems.innerHTML = wishlist.map(item => `
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4 animate-fade-in">
                <div class="flex items-start space-x-4">
                    <img src="${item.image}" 
                         alt="${item.name}" 
                         class="w-20 h-20 object-cover rounded-lg"
                         onerror="handleImageError(this)"
                         ${item.backupImage ? `data-backup-image="${item.backupImage}"` : ''}>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-medium text-gray-800">${item.name}</h3>
                                <p class="text-sm text-gray-500 mt-1">${item.category}</p>
                                <p class="text-green-600 font-bold mt-2">${formatPrice(item.price)}</p>
                            </div>
                            <button onclick="toggleWishlistItem(${item.id})" 
                                    class="text-red-500 hover:text-red-600 p-1">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                        <button onclick='addToCart(${JSON.stringify(item).replace(/'/g, "\\'")})'
                                class="mt-3 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add clear wishlist functionality
    const clearWishlistBtn = document.getElementById('clearWishlist');
    
    clearWishlistBtn.addEventListener('click', () => {
        if (wishlist.length === 0) {
            showNotification('Wishlist is already empty');
            return;
        }

        // Show confirmation dialog
        const confirmClear = confirm('Are you sure you want to clear your wishlist?');
        
        if (confirmClear) {
            // Clear wishlist with animation
            const wishlistItems = document.querySelectorAll('#wishlistItems > div');
            wishlistItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate-fade-out');
                }, index * 100);
            });

            // Clear after animations
            setTimeout(() => {
                wishlist = [];
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                updateWishlistUI();
                displayProducts(products); // Refresh products to update heart icons
                showNotification('Wishlist cleared');
            }, wishlistItems.length * 100 + 300);
        }
    });

    // Add the showDeliveryDetails function
    window.showDeliveryDetails = function() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-white z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="min-h-screen">
                <!-- Header -->
                <div class="sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex justify-between items-center">
                    <button class="text-gray-600 hover:text-gray-800" onclick="this.closest('.fixed').remove()">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">Checkout</h1>
                    <div class="w-8"></div>
                </div>

                <!-- Enhanced Progress Steps -->
                <div class="px-4 py-6">
                    <div class="flex justify-between items-center mb-8 relative">
                        <!-- Progress Line -->
                        <div class="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2">
                            <div class="h-full bg-green-500 transition-all duration-500" style="width: 50%"></div>
                        </div>
                        
                        <!-- Steps -->
                        <div class="flex justify-between relative z-10 w-full">
                            <div class="flex flex-col items-center">
                                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mb-2">
                                    <i class="fas fa-shopping-cart"></i>
                                </div>
                                <span class="text-sm font-medium text-green-500">Cart</span>
                            </div>
                            <div class="flex flex-col items-center">
                                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mb-2">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <span class="text-sm font-medium text-green-500">Delivery</span>
                            </div>
                            <div class="flex flex-col items-center">
                                <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mb-2">
                                    <i class="fas fa-credit-card"></i>
                                </div>
                                <span class="text-sm font-medium text-gray-400">Payment</span>
                            </div>
                        </div>
                    </div>

                    <!-- Form -->
                    <form id="deliveryForm" class="space-y-6" onsubmit="handleDeliverySubmit(event)">
                        <div>
                            <h2 class="text-lg font-semibold mb-4">Contact Information</h2>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 mb-2">Full Name</label>
                                    <input type="text" required
                                           class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Phone Number</label>
                                    <input type="tel" required
                                           class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Email</label>
                                    <input type="email" required
                                           class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold mb-4">Delivery Address</h2>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 mb-2">Street Address</label>
                                    <input type="text" required
                                           class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-gray-700 mb-2">City</label>
                                        <input type="text" required
                                               class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Postal Code</label>
                                        <input type="text" required
                                               class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Options -->
                        <div class="border-t pt-6">
                            <h2 class="text-lg font-semibold mb-4">Payment Method</h2>
                            <div class="space-y-3">
                                <!-- Card Payment -->
                                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                    <input type="radio" name="payment" value="card" class="text-green-500" required 
                                           onchange="toggleCardFields(true)">
                                    <div class="ml-4 flex-1">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="font-medium">Credit/Debit Card</p>
                                                <p class="text-sm text-gray-500">Pay using card</p>
                                            </div>
                                            <div class="flex space-x-2">
                                                <i class="fab fa-cc-visa text-2xl text-blue-600"></i>
                                                <i class="fab fa-cc-mastercard text-2xl text-red-500"></i>
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                <!-- Card Details (initially hidden) -->
                                <div id="cardFields" class="hidden space-y-4 p-4 bg-gray-50 rounded-lg animate-fade-in">
                                    <div class="relative">
                                        <label class="block text-gray-700 mb-2">Card Number</label>
                                        <div class="relative">
                                            <input type="text" 
                                                   placeholder="1234 5678 9012 3456"
                                                   class="w-full p-3 pl-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                                                   maxlength="19"
                                                   oninput="formatCardNumber(this)">
                                            <div id="cardTypeDisplay" class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hidden">
                                                <!-- Card type icon will be inserted here -->
                                            </div>
                                        </div>
                                        <p id="cardNumberError" class="text-red-500 text-sm mt-1 hidden"></p>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-gray-700 mb-2">Expiry Date</label>
                                            <input type="text" 
                                                   placeholder="MM/YY"
                                                   class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                                                   maxlength="5"
                                                   oninput="formatExpiryDate(this)">
                                            <p id="expiryError" class="text-red-500 text-sm mt-1 hidden"></p>
                                        </div>
                                        <div>
                                            <label class="block text-gray-700 mb-2">CVV</label>
                                            <div class="relative">
                                                <input type="password" 
                                                       placeholder="123"
                                                       class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                                                       maxlength="4"
                                                       oninput="validateCVV(this)">
                                                <i class="fas fa-question-circle absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-help"
                                                   title="3 or 4 digits usually found on the back of your card"></i>
                                            </div>
                                            <p id="cvvError" class="text-red-500 text-sm mt-1 hidden"></p>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Card Holder Name</label>
                                        <input type="text" 
                                               placeholder="Name on card"
                                               class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                                               oninput="validateCardHolder(this)">
                                        <p id="nameError" class="text-red-500 text-sm mt-1 hidden"></p>
                                    </div>
                                </div>

                                <!-- UPI Payment -->
                                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                    <input type="radio" name="payment" value="upi" class="text-green-500" required
                                           onchange="toggleCardFields(false)">
                                    <div class="ml-4 flex-1">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="font-medium">UPI</p>
                                                <p class="text-sm text-gray-500">Pay using UPI</p>
                                            </div>
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" 
                                                 class="h-8" alt="UPI">
                                        </div>
                                    </div>
                                </label>

                                <!-- Cash on Delivery (Disabled) -->
                                <div class="flex items-center p-4 border rounded-lg bg-gray-50 opacity-75 cursor-not-allowed">
                                    <input type="radio" name="payment" value="cod" class="text-gray-400" disabled>
                                    <div class="ml-4 flex-1">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="font-medium text-gray-500">Cash on Delivery</p>
                                                <p class="text-sm text-gray-500">Currently Unavailable</p>
                                            </div>
                                            <i class="fas fa-money-bill-wave text-2xl text-gray-400"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="border-t pt-4">
                            <h3 class="font-semibold mb-3">Order Summary</h3>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Subtotal</span>
                                    <span>${formatPrice(total)}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Delivery Fee</span>
                                    <span>${formatPrice(499)}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">GST (18%)</span>
                                    <span>${formatPrice(total * 0.18)}</span>
                                </div>
                                <div class="flex justify-between font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span>${formatPrice(total + 499 + (total * 0.18))}</span>
                                </div>
                            </div>
                            
                            <button type="submit" 
                                    class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all font-medium mt-4">
                                Place Order
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Handle delivery form submission
    window.handleDeliverySubmit = function(event) {
        event.preventDefault();
        // Here you would typically send the order to your backend
        alert('Order placed successfully!');
        // Clear cart
        cart = [];
        updateCartUI();
        // Close delivery modal
        event.target.closest('.fixed').remove();
        // Show success message
        showNotification('Order placed successfully!');
    }

    // Add these helper functions for card input formatting
    window.formatCardNumber = function(input) {
        // Remove non-digits
        let value = input.value.replace(/\D/g, '');
        
        // Add space after every 4 digits
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        input.value = value;

        // Detect card type and update UI
        const cardType = detectCardType(value);
        const cardTypeDisplay = document.getElementById('cardTypeDisplay');
        
        if (cardTypeDisplay) {
            if (cardType.type) {
                cardTypeDisplay.innerHTML = cardType.icon;
                cardTypeDisplay.classList.remove('hidden');
            } else {
                cardTypeDisplay.classList.add('hidden');
            }
        }

        // Validate card number length
        const cardNumberError = document.getElementById('cardNumberError');
        if (cardNumberError) {
            if (value.replace(/\s/g, '').length > 16) {
                cardNumberError.textContent = 'Card number is too long';
                cardNumberError.classList.remove('hidden');
                input.classList.add('border-red-500');
            } else {
                cardNumberError.classList.add('hidden');
                input.classList.remove('border-red-500');
            }
        }
    }

    window.formatExpiryDate = function(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0,2) + '/' + value.slice(2);
        }
        input.value = value;
    }

    window.toggleCardFields = function(show) {
        const cardFields = document.getElementById('cardFields');
        if (show) {
            cardFields.classList.remove('hidden');
            cardFields.classList.add('animate-fade-in');
        } else {
            cardFields.classList.add('hidden');
            cardFields.classList.remove('animate-fade-in');
        }
    }

    // Add card type detection and validation helper functions
    window.detectCardType = function(number) {
        // Remove all non-digit characters
        number = number.replace(/\D/g, '');
        
        let cardType = '';
        let cardIcon = '';

        // Visa
        if (number.match(/^4/)) {
            cardType = 'visa';
            cardIcon = '<i class="fab fa-cc-visa text-blue-600"></i>';
        }
        // Mastercard
        else if (number.match(/^5[1-5]/)) {
            cardType = 'mastercard';
            cardIcon = '<i class="fab fa-cc-mastercard text-red-500"></i>';
        }
        // American Express
        else if (number.match(/^3[47]/)) {
            cardType = 'amex';
            cardIcon = '<i class="fab fa-cc-amex text-blue-400"></i>';
        }
        // Discover
        else if (number.match(/^6(?:011|5)/)) {
            cardType = 'discover';
            cardIcon = '<i class="fab fa-cc-discover text-orange-500"></i>';
        }
        // Diners Club
        else if (number.match(/^3(?:0[0-5]|[68])/)) {
            cardType = 'diners';
            cardIcon = '<i class="fab fa-cc-diners-club text-gray-600"></i>';
        }
        // JCB
        else if (number.match(/^(?:2131|1800|35)/)) {
            cardType = 'jcb';
            cardIcon = '<i class="fab fa-cc-jcb text-green-600"></i>';
        }

        return { type: cardType, icon: cardIcon };
    }

    // Add CVV validation
    window.validateCVV = function(input) {
        const value = input.value.replace(/\D/g, '');
        const cvvError = document.getElementById('cvvError');
        
        if (cvvError) {
            if (value.length < 3) {
                cvvError.textContent = 'CVV must be at least 3 digits';
                cvvError.classList.remove('hidden');
                input.classList.add('border-red-500');
            } else {
                cvvError.classList.add('hidden');
                input.classList.remove('border-red-500');
            }
        }
    }

    // Add card holder name validation
    window.validateCardHolder = function(input) {
        const nameError = document.getElementById('nameError');
        
        if (nameError) {
            if (input.value.length < 3) {
                nameError.textContent = 'Please enter the full name as shown on card';
                nameError.classList.remove('hidden');
                input.classList.add('border-red-500');
            } else {
                nameError.classList.add('hidden');
                input.classList.remove('border-red-500');
            }
        }
    }

    // Profile tab management
    window.showProfileTab = function(tabName) {
        const tabs = ['orders', 'wishlist', 'settings'];
        tabs.forEach(tab => {
            const tabElement = document.getElementById(`${tab}Tab`);
            if (tabElement) {
                tabElement.classList.toggle('hidden', tab !== tabName);
            }
        });
        
        // Update tab buttons
        const buttons = document.querySelectorAll('.border-b button');
        buttons.forEach(button => {
            if (button.textContent.toLowerCase().includes(tabName)) {
                button.classList.add('text-green-600', 'border-b-2', 'border-green-500');
                button.classList.remove('text-gray-500');
            } else {
                button.classList.remove('text-green-600', 'border-b-2', 'border-green-500');
                button.classList.add('text-gray-500');
            }
        });
    }

    // Add this to your order history section in the profile modal
    function getOrderStatus(status, steps) {
        const statusSteps = {
            'pending': 0,
            'confirmed': 1,
            'shipped': 2,
            'delivered': 3
        };
        
        return `
            <div class="relative pb-8">
                <!-- Progress Bar -->
                <div class="absolute left-8 top-8 bottom-0 w-1 bg-gray-200">
                    <div class="h-full bg-green-500" style="height: ${(statusSteps[status.toLowerCase()] / 3) * 100}%"></div>
                </div>
                
                <!-- Steps -->
                <div class="space-y-8">
                    <div class="flex items-center">
                        <div class="relative z-10">
                            <div class="w-16 h-16 ${steps >= 1 ? 'bg-green-500' : 'bg-gray-200'} rounded-full flex items-center justify-center">
                                <i class="fas fa-clipboard-check text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="font-medium ${steps >= 1 ? 'text-green-500' : 'text-gray-500'}">Order Confirmed</h3>
                            <p class="text-sm text-gray-500">Your order has been confirmed</p>
                        </div>
                    </div>

                    <div class="flex items-center">
                        <div class="relative z-10">
                            <div class="w-16 h-16 ${steps >= 2 ? 'bg-green-500' : 'bg-gray-200'} rounded-full flex items-center justify-center">
                                <i class="fas fa-box text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="font-medium ${steps >= 2 ? 'text-green-500' : 'text-gray-500'}">Processing</h3>
                            <p class="text-sm text-gray-500">Your order is being processed</p>
                        </div>
                    </div>

                    <div class="flex items-center">
                        <div class="relative z-10">
                            <div class="w-16 h-16 ${steps >= 3 ? 'bg-green-500' : 'bg-gray-200'} rounded-full flex items-center justify-center">
                                <i class="fas fa-truck text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="font-medium ${steps >= 3 ? 'text-green-500' : 'text-gray-500'}">Shipped</h3>
                            <p class="text-sm text-gray-500">Your order is on the way</p>
                            ${steps >= 3 ? `
                                <div class="mt-2">
                                    <p class="text-sm text-gray-600">Tracking ID: <span class="font-medium">TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}</span></p>
                                    <button onclick="trackOrder('${order.id}')" class="text-green-500 text-sm hover:text-green-600 mt-1">
                                        Track Order <i class="fas fa-arrow-right ml-1"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="flex items-center">
                        <div class="relative z-10">
                            <div class="w-16 h-16 ${steps >= 4 ? 'bg-green-500' : 'bg-gray-200'} rounded-full flex items-center justify-center">
                                <i class="fas fa-check text-white text-xl"></i>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="font-medium ${steps >= 4 ? 'text-green-500' : 'text-gray-500'}">Delivered</h3>
                            <p class="text-sm text-gray-500">Package has been delivered</p>
                            ${steps >= 4 ? `
                                <div class="mt-2">
                                    <button onclick="rateOrder('${order.id}')" class="text-yellow-500 text-sm hover:text-yellow-600">
                                        Rate your purchase <i class="fas fa-star ml-1"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Add these helper functions
    window.toggleOrderDetails = function(orderId) {
        const details = document.getElementById(`order-${orderId}-details`);
        const button = details.previousElementSibling.querySelector('button i');
        
        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            button.classList.remove('fa-chevron-down');
            button.classList.add('fa-chevron-up');
        } else {
            details.classList.add('hidden');
            button.classList.remove('fa-chevron-up');
            button.classList.add('fa-chevron-down');
        }
    }

    window.trackOrder = function(orderId) {
        // Show tracking modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold">Track Order</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-medium">Current Location</p>
                            <p class="text-sm text-gray-500">Mumbai, Maharashtra</p>
                        </div>
                        <div class="text-right">
                            <p class="font-medium">Estimated Delivery</p>
                            <p class="text-sm text-gray-500">Tomorrow by 7:00 PM</p>
                        </div>
                    </div>
                    <div class="relative pt-4">
                        <div class="h-2 bg-gray-200 rounded-full">
                            <div class="h-full bg-green-500 rounded-full" style="width: 75%"></div>
                        </div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600">Your package is out for delivery and will arrive soon.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    window.rateOrder = function(orderId) {
        // Show rating modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold">Rate Your Purchase</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-center space-x-2">
                        ${[1,2,3,4,5].map(star => `
                            <button onclick="setRating(${star})" class="text-3xl text-gray-300 hover:text-yellow-500 transition-colors">
                                <i class="fas fa-star"></i>
                            </button>
                        `).join('')}
                    </div>
                    <textarea placeholder="Write your review (optional)" 
                              class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                              rows="3"></textarea>
                    <button onclick="submitReview('${orderId}')" 
                            class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all">
                        Submit Review
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Add this function to generate a random OTP
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    // Update the handleRegister function
    window.handleRegister = function(event) {
        event.preventDefault();
        const name = event.target.name.value;
        const email = event.target.email.value;
        const password = event.target.password.value;

        // Simple validation
        if (!name || !email || !password) {
            showNotification('Please fill in all fields');
            return;
        }

        // Generate OTP
        const otp = generateOTP();
        // Store OTP and user data temporarily
        sessionStorage.setItem('pendingRegistration', JSON.stringify({
            name,
            email,
            password,
            otp
        }));

        // Show OTP verification modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold mb-2">Verify Your Email</h2>
                    <p class="text-gray-600">We've sent a verification code to</p>
                    <p class="text-gray-800 font-medium">${email}</p>
                </div>

                <form onsubmit="verifyOTP(event)" class="space-y-4">
                    <div class="flex justify-center space-x-3">
                        <input type="text" maxlength="1" class="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:border-green-500 focus:outline-none" required>
                        <input type="text" maxlength="1" class="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:border-green-500 focus:outline-none" required>
                        <input type="text" maxlength="1" class="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:border-green-500 focus:outline-none" required>
                        <input type="text" maxlength="1" class="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:border-green-500 focus:outline-none" required>
                        <input type="text" maxlength="1" class="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:border-green-500 focus:outline-none" required>
                        <input type="text" maxlength="1" class="w-12 h-12 text-center text-xl font-bold border rounded-lg focus:border-green-500 focus:outline-none" required>
                    </div>

                    <div class="text-center">
                        <button type="submit" class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all">
                            Verify OTP
                        </button>
                        <div class="mt-4 text-gray-600">
                            Didn't receive the code? 
                            <button type="button" onclick="resendOTP()" class="text-green-500 hover:text-green-600">
                                Resend
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Add auto-focus and auto-advance functionality to OTP inputs
        const otpInputs = modal.querySelectorAll('input');
        otpInputs.forEach((input, index) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= 0 && e.key <= 9) {
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                } else if (e.key === 'Backspace') {
                    if (index > 0) {
                        otpInputs[index - 1].focus();
                    }
                }
            });
        });

        // Focus first input
        otpInputs[0].focus();

        // Simulate sending OTP email
        showNotification('OTP sent to your email');
    }

    // Add OTP verification function
    window.verifyOTP = function(event) {
        event.preventDefault();
        const inputs = event.target.querySelectorAll('input');
        const enteredOTP = Array.from(inputs).map(input => input.value).join('');
        
        const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));
        
        if (enteredOTP === pendingRegistration.otp.toString()) {
            // Store user data
            const userData = {
                name: pendingRegistration.name,
                email: pendingRegistration.email,
            };
            
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Clear temporary storage
            sessionStorage.removeItem('pendingRegistration');
            
            showNotification('Account created successfully!');
            // Remove both modals
            document.querySelector('.z-[60]').remove(); // OTP modal
            document.getElementById('profileModal').remove();
            location.reload();
        } else {
            showNotification('Invalid OTP. Please try again.');
        }
    }

    // Add resend OTP function
    window.resendOTP = function() {
        const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));
        const newOTP = generateOTP();
        
        // Update stored OTP
        pendingRegistration.otp = newOTP;
        sessionStorage.setItem('pendingRegistration', JSON.stringify(pendingRegistration));
        
        showNotification('New OTP sent to your email');
    }

    // Update the banner HTML in index.html
    const bannerProduct = products[0];
    const discountedPrice = getDiscountedPrice(bannerProduct.price, bannerProduct.id);

    // Update the banner HTML
    const banner = document.querySelector('.bg-gradient-to-r');
    if (banner) {
        banner.innerHTML = `
            <div class="space-y-1 sm:space-y-2">
                <div class="flex items-center gap-2">
                    <span class="bg-white/20 px-2 py-1 rounded-full text-xs sm:text-sm">New Launch</span>
                    <span class="bg-red-500 px-2 py-1 rounded-full text-xs sm:text-sm">75% OFF</span>
                </div>
                <h2 class="text-xl sm:text-3xl font-bold">${bannerProduct.name}</h2>
                <div class="flex items-center gap-2">
                    <p class="text-white/80 text-sm sm:text-base line-through">₹${bannerProduct.price.toLocaleString()}</p>
                    <p class="text-white text-base sm:text-lg font-bold">₹${discountedPrice.toLocaleString()}</p>
                </div>
                <button onclick="addToCart({...${JSON.stringify({...bannerProduct, price: discountedPrice})})" 
                        class="mt-2 sm:mt-4 bg-white text-green-600 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all">
                    Shop Now
                </button>
            </div>
            <div class="relative">
                <img src="${bannerProduct.image}" 
                     alt="${bannerProduct.name}" 
                     class="h-24 sm:h-32 w-24 sm:w-32 object-cover rounded-lg"
                     onerror="handleImageError(this)"
                     data-backup-image="${bannerProduct.backupImage || ''}">
            </div>
        `;
    }

    // Add notification functionality
    const notificationButton = document.querySelector('.fa-bell');
    const notifications = [
        {
            id: 1,
            title: "REPUBLIC SALE",
            message: "70% OFF on all products! Sale live from 20th Jan to 26th Jan. Don't miss out on amazing deals! 🎉",
            time: "Just now",
            type: "sale"
        },
        {
            id: 2,
            title: "Special Offer",
            message: "Get 10% off on all Apple products!",
            time: "2 hours ago"
        },
        {
            id: 3,
            title: "New Arrival",
            message: "iPhone 15 Pro Max now in stock!",
            time: "1 day ago"
        }
    ];

    notificationButton.addEventListener('click', () => {
        // Create notification panel
        const existingPanel = document.getElementById('notificationPanel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.className = 'fixed right-4 top-24 w-80 bg-white rounded-lg shadow-xl z-50 animate-fade-in';
        
        let notificationHTML = `
            <div class="p-4 border-b">
                <div class="flex justify-between items-center">
                    <h3 class="font-semibold text-lg">Notifications</h3>
                    <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('#notificationPanel').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="max-h-96 overflow-y-auto">
        `;

        if (notifications.length === 0) {
            notificationHTML += `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-2xl mb-2"></i>
                    <p>No new notifications</p>
                </div>
            `;
        } else {
            notifications.forEach(notification => {
                notificationHTML += `
                    <div class="p-4 border-b hover:bg-gray-50 cursor-pointer">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium text-sm ${notification.type === 'sale' ? 'text-red-500' : ''}">${notification.title}</h4>
                                <p class="text-gray-600 text-sm mt-1">${notification.message}</p>
                                <span class="text-gray-400 text-xs mt-2">${notification.time}</span>
                                ${notification.type === 'sale' ? `
                                <div class="mt-2">
                                    <span class="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Limited Time Offer</span>
                                </div>
                                ` : ''}
                            </div>
                            <button class="text-gray-400 hover:text-gray-600" onclick="removeNotification(${notification.id})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        notificationHTML += `</div>`;
        panel.innerHTML = notificationHTML;
        document.body.appendChild(panel);

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !notificationButton.contains(e.target)) {
                panel.remove();
            }
        });
    });

    // Function to remove notification
    window.removeNotification = function(id) {
        const index = notifications.findIndex(n => n.id === id);
        if (index > -1) {
            notifications.splice(index, 1);
            // Update notification count
            const notificationCount = document.querySelector('.fa-bell + span');
            notificationCount.textContent = notifications.length;
            // Refresh panel
            notificationButton.click();
            notificationButton.click();
        }
    };
});

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Enhanced error handling and loading states for images
function handleImageError(img) {
    if (img.dataset.backupImage) {
        const originalSrc = img.src;
        img.src = img.dataset.backupImage;
        img.removeAttribute('data-backup-image');
        
        img.onerror = () => {
            if (img.src !== originalSrc) {
                img.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                img.classList.remove('loading');
                img.classList.add('error');
                showNotification('Product image could not be loaded');
            }
        };
    } else {
        img.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
        img.classList.remove('loading');
        img.classList.add('error');
    }
}

// Add loading state handler with cache check
function handleImageLoad(img) {
    // Check if image is already cached by the browser
    if (img.complete) {
        img.classList.remove('loading');
        img.classList.add('loaded');
        // Hide spinner immediately for cached images
        const spinner = img.parentElement.querySelector('.loading-spinner');
        if (spinner) spinner.style.opacity = '0';
    } else {
        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
    }
}

window.handleLogin = async function(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    // Simple validation
    if (!email || !password) {
        showNotification('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.message);
            return;
        }

        // Store user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        showNotification('Login successful!');
        document.getElementById('profileModal').remove();
        location.reload();
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred during login');
    }
}

window.handleRegister = async function(event) {
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    // Simple validation
    if (!name || !email || !password) {
        showNotification('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.message);
            return;
        }

        showNotification('Registration successful! Please login.');
        // Switch to login form
        document.querySelector('#loginForm').style.display = 'block';
        document.querySelector('#registerForm').style.display = 'none';
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An error occurred during registration');
    }
}

// Add OTP verification function
window.verifyOTP = function(event) {
    event.preventDefault();
    const inputs = event.target.querySelectorAll('input');
    const enteredOTP = Array.from(inputs).map(input => input.value).join('');
    
    const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));
    
    if (enteredOTP === pendingRegistration.otp.toString()) {
        // Store user data
        const userData = {
            name: pendingRegistration.name,
            email: pendingRegistration.email,
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Clear temporary storage
        sessionStorage.removeItem('pendingRegistration');
        
        showNotification('Account created successfully!');
        // Remove both modals
        document.querySelector('.z-[60]').remove(); // OTP modal
        document.getElementById('profileModal').remove();
        location.reload();
    } else {
        showNotification('Invalid OTP. Please try again.');
    }
}

// Add resend OTP function
window.resendOTP = function() {
    const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));
    const newOTP = generateOTP();
    
    // Update stored OTP
    pendingRegistration.otp = newOTP;
    sessionStorage.setItem('pendingRegistration', JSON.stringify(pendingRegistration));
    
    showNotification('New OTP sent to your email');
} 