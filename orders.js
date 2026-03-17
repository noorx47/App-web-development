var API_URL = 'http://localhost:3000/api';

async function loadOrders() {
    var container = document.getElementById('ordersContainer');

    try {
        var response = await fetch(API_URL + '/orders');
        var orders = await response.json();

        if (orders.length == 0) {
            container.innerHTML = '<p class="loading_text">No orders yet.</p>';
            return;
        }

        var html = '';

        for (var i = 0; i < orders.length; i++) {
            var order = orders[i];
            var date = new Date(order.createdAt).toLocaleDateString();

            html += '<div class="order_card">';
            html += '<div class="order_header">';
            html += '<span class="order_id">Order #' + order._id.slice(-6) + '</span>';
            html += '<span class="order_date">' + date + '</span>';
            html += '<span class="order_status">' + order.status + '</span>';
            html += '</div>';
            html += '<div class="order_products">';

            for (var j = 0; j < order.products.length; j++) {
                var item = order.products[j];
                if (item.product) {
                    html += '<div class="order_item">';
                    html += '<span>' + item.product.name + '</span>';
                    html += '<span>Qty: ' + item.quantity + '</span>';
                    html += '</div>';
                }
            }

            html += '</div>';
            html += '<div class="order_total">Total: €' + order.totalPrice + '</div>';
            html += '</div>';
        }

        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<p class="loading_text">Could not load orders.</p>';
    }
}

loadOrders();