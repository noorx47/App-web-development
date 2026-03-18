var API_URL = 'http://localhost:3000/api';

var cart = JSON.parse(localStorage.getItem('nexen_cart')) || [];

function showCart() {
    var container = document.getElementById('cartItems');
    var totalEl = document.getElementById('cartTotal');

    if (cart.length == 0) {
        container.innerHTML = '<p class="loading_text">No items in bag.</p>';
        totalEl.textContent = '€0';
        return;
    }

    var html = '';
    var total = 0;

    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        html += '<div class="cart_item">';
        html += '<span class="cart_item_name">' + item.name + '</span>';
        html += '<span class="cart_item_price">€' + item.price + '</span>';
        html += '</div>';
        total += item.price;
    }

    container.innerHTML = html;
    totalEl.textContent = '€' + total;
}

paypal.Buttons({
    createOrder: function(data, actions) {
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

        var products = [];
        for (var i = 0; i < cart.length; i++) {
            products.push({
                product: cart[i].id,
                quantity: 1
            });
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