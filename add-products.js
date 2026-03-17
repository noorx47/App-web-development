var API_URL = 'http://localhost:3000/api';
var form = document.getElementById('add_productform');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  var name = document.getElementById('name').value;
  var description = document.getElementById('description').value;
  var price = document.getElementById('price').value;
  var imageUrl = document.getElementById('imgurl').value;
  var category = document.getElementById('category').value;
  var stock = document.getElementById('stock').value;
  var condition = document.getElementById('condition').value;

  var productData = {
    name: name,
    description: description,
    price: Number(price),
    category: category,
    stock: Number(stock),
    imageUrl: imageUrl,
    condition: condition
  };

  try {
    var response = await fetch(API_URL + '/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    var result = await response.json();
    console.log('Server response:', result);

    if (response.ok) {
        document.getElementById('form_messages').innerHTML = '<p class="success_msg">Product added successfully!</p>';
        form.reset();
    } else {
       document.getElementById('form_messages').innerHTML = '<p class="error_msg">Error: ' + result.message + '</p>';
    }
    } catch (error) {
    document.getElementById('form_messages').innerHTML = '<p class="error_msg">Could not connect to server.</p>';
  }
});