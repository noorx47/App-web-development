var API_URL = 'http://localhost:3000/api';

function getCart() {
    return JSON.parse(localStorage.getItem('nexen_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('nexen_cart', JSON.stringify(cart));
}

function showCart() {
    var cart = getCart();
    var container = document.getElementById('cartItems');
    var totalEl = document.getElementById('cartTotal');

    if (cart.length == 0) {
        container.innerHTML = '<p class="loading_text">No items in bag.</p>';
        totalEl.textContent = '€0';
        document.getElementById('paypal-button-container').style.display = 'none';
        return;
    }

    var grouped = [];
    for (var i = 0; i < cart.length; i++) {
        var found = false;
        for (var j = 0; j < grouped.length; j++) {
            if (grouped[j].id == cart[i].id) {
                grouped[j].quantity += 1;
                found = true;
                break;
            }
        }
        if (!found) {
            grouped.push({ id: cart[i].id, name: cart[i].name, price: cart[i].price, quantity: 1 });
        }
    }

    var html = '';
    var total = 0;

    for (var i = 0; i < grouped.length; i++) {
        var item = grouped[i];
        total += item.price * item.quantity;

        html += '<div class="cart_item">';
        html += '<span class="cart_item_name">' + item.name + '</span>';
        html += '<div class="cart_item_controls">';
        html += '<button class="qty_btn" onclick="decreaseQty(\'' + item.id + '\')">−</button>';
        html += '<span class="qty_count">' + item.quantity + '</span>';
        html += '<button class="qty_btn" onclick="increaseQty(\'' + item.id + '\', \'' + item.name + '\', ' + item.price + ')">+</button>';
        html += '</div>';
        html += '<span class="cart_item_price">€' + (item.price * item.quantity) + '</span>';
        html += '<button class="remove_btn" onclick="removeItem(\'' + item.id + '\')">✕</button>';
        html += '</div>';
    }

    container.innerHTML = html;
    totalEl.textContent = '€' + total;
    document.getElementById('paypal-button-container').style.display = 'block';
}

function increaseQty(id, name, price) {
    var cart = getCart();
    cart.push({ id: id, name: name, price: price });
    saveCart(cart);
    showCart();
}

function decreaseQty(id) {
    var cart = getCart();
    for (var i = cart.length - 1; i >= 0; i--) {
        if (cart[i].id == id) {
            cart.splice(i, 1);
            break;
        }
    }
    saveCart(cart);
    showCart();
}

function removeItem(id) {
    var cart = getCart();
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id != id) {
            newCart.push(cart[i]);
        }
    }
    saveCart(newCart);
    showCart();
}

paypal.Buttons({
    createOrder: function(data, actions) {
        var cart = getCart();
        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            total += cart[i].price;
        }
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: total.toFixed(2),
                    currency_code: 'EUR'
                }
            }]
        });
    },

    onApprove: async function(data, actions) {
        var order = await actions.order.capture();
        var cart = getCart();

        var products = [];
        for (var i = 0; i < cart.length; i++) {
            products.push({ product: cart[i].id, quantity: 1 });
        }

        var total = 0;
        for (var i = 0; i < cart.length; i++) {
            total += cart[i].price;
        }

        var orderData = {
            products: products,
            totalPrice: total,
            paypalTransactionId: order.id,
            status: 'completed',
            customerName: order.payer.name.given_name + ' ' + order.payer.name.surname,
            customerEmail: order.payer.email_address
        };

        try {
            var response = await fetch(API_URL + '/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                localStorage.removeItem('nexen_cart');
                document.getElementById('payment_message').innerHTML = '<p class="success_msg">Payment successful! Your order has been placed.</p>';
                document.getElementById('paypal-button-container').style.display = 'none';
                document.getElementById('cartItems').innerHTML = '';
                document.getElementById('cartTotal').textContent = '€0';
            }
        } catch (error) {
            document.getElementById('payment_message').innerHTML = '<p class="error_msg">Payment captured but order could not be saved.</p>';
        }
    },

    onError: function(err) {
        document.getElementById('payment_message').innerHTML = '<p class="error_msg">Payment failed. Please try again.</p>';
    }

}).render('#paypal-button-container');

showCart();