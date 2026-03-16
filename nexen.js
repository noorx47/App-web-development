var API_URL = 'http://localhost:3000/api';
var cart = [];

async function loadProducts(category, search) {

  if (!category) { category = 'all'; }
  if (!search) { search = ''; }

  var container = document.getElementById('productContainer');
  container.innerHTML = '<p class="loading_text">Loading products...</p>';

  try {
    var url;
    if (search != '') {
      url = API_URL + '/products/search?q=' + search;
    } else {
      url = API_URL + '/products';
    }

    var response = await fetch(url);
    var products = await response.json();

    var filtered = [];
    if (category == 'all') {
      filtered = products;
    } else {
      for (var i = 0; i < products.length; i++) {
        if (products[i].category == category) {
          filtered.push(products[i]);
        }
      }
    }

    if (filtered.length == 0) {
      container.innerHTML = '<p class="loading_text">No products found.</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var product = filtered[i];
      html += '<article class="product_information" onclick="openModal(\'' + product._id + '\')">';
      html += '  <div class="product_image">';
      html += '    <img src="' + product.imageUrl + '" alt="' + product.name + '">';
      html += '  </div>';
      html += '  <div class="product_info">';
      html += '    <h3 class="product_name">' + product.name + '</h3>';
      html += '    <p class="product_specs_">' + product.description + '</p>';
      html += '    <div class="product_prices_">';
      html += '      <span class="product_rating">' + product.condition + ' Condition</span>';
      html += '      <span class="product-price">€' + product.price + '</span>';
      html += '    </div>';
      html += '    <button class="btn_atc" onclick="event.stopPropagation(); addToCart(\'' + product._id + '\', \'' + product.name + '\', ' + product.price + ', this)">Add to Bag</button>';
      html += '  </div>';
      html += '</article>';
    }

    container.innerHTML = html;

  } catch (error) {
    container.innerHTML = '<p class="loading_text">Could not load products. Make sure the server is running.</p>';
    console.log('Error:', error);
  }
}

async function openModal(productId) {
  console.log('Modal opening for:', productId);
  console.log('fetching from:', API_URL + '/products/' + productId);
  try {
    var response = await fetch(API_URL + '/products/' + productId);
    var product = await response.json();
    console.log('Product details:', product);

    document.getElementById('modal_image').src = product.imageUrl;
    document.getElementById('modal_name').textContent = product.name;
    document.getElementById('modal_description').textContent = product.description;
    document.getElementById('modal_condition').textContent = product.condition + ' Condition';
    document.getElementById('modal_price').textContent = '€' + product.price;
    document.getElementById('modal_category').textContent = product.category;

    var modalButton = document.getElementById('modal_atc');
    modalButton.onclick = function() {
      addToCart(product._id, product.name, product.price, modalButton);
    };

    var modal = document.getElementById('productModal');
    modal.classList.add('modal_open');
    document.body.style.overflow = 'hidden';

  } catch (error) {
    console.log('Error loading product details:', error);
  }
}

function closeModal() {
  var modal = document.getElementById('productModal');
  console.log('Modal elemet:', document.getElementById('productModal'));
  modal.classList.remove('modal_open');
  document.body.style.overflow = '';
}

document.getElementById('productModal').addEventListener('click', function(e) {
  if (e.target == this) {
    closeModal();
  }
});

function addToCart(id, name, price, button) {
  var item = { id: id, name: name, price: price };
  cart.push(item);

  button.textContent = '✓ Added!';
  button.classList.add('btn_added');

  setTimeout(function() {
    button.textContent = 'Add to Bag';
    button.classList.remove('btn_added');
  }, 1500);
}

var tabs = document.querySelectorAll('.tab, .tab_active');
for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener('click', function() {
    var allTabs = document.querySelectorAll('.tab, .tab_active');
    for (var j = 0; j < allTabs.length; j++) {
      allTabs[j].className = 'tab';
    }
    this.className = 'tab_active';
    loadProducts(this.dataset.category);
  });
}

var searchBox = document.getElementById('searchInput');
searchBox.addEventListener('input', function() {
  loadProducts('all', this.value);
});

loadProducts();