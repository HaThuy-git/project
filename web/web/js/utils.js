const URL = 'http://localhost:8080';
const db_collection = {
  users: 'users',
  categories: 'categories',
  types: 'types',
  brands: 'brands',
  products: 'products',
  feedbacks: 'feedbacks'
}

// authentication
function accountLocalStorage() {
  if (localStorage.getItem('accessToken')) {
    document.getElementById('accountLocalStorage').innerHTML = localStorage.getItem('email');
    document.getElementById('accountLocalStorage').attributes['href'] = 'register.html'
  } else {
    document.getElementById('accountLocalStorage').value = 'Login';
  }
}

function logout() {
  if (localStorage.getItem('accessToken')) {
    var conf = window.confirm('Do you want logout');
    if (conf) {
      localStorage.clear();
    }
  } else {
    resetLink('login.html');
  }
}

async function login() {
  event.preventDefault();
  let _email = document.getElementById('email').value;
  let _password = document.getElementById('password').value;
  let _url = URL + '/authentication';
  var res = await fetch(_url, {
    method: 'POST',
    body: JSON.stringify({
      email: _email,
      password: _password
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  if (json.total) {
    Object.keys(json.data).forEach(_key => {
      localStorage.setItem(_key, json.data[_key]);
    });
    resetLink('index.html');
  } else {
    alert('Login failed! Please try again');
  }
}

// utils api
function convertLink(_collection, _query) {
  // if (!localStorage.accessToken) {
  //   alert('Session expired');
  //   this.clearCookie();
  //   window.location.reload();
  //   return;
  // }
  var _link = `${URL}/${_collection}?accessToken=${localStorage.accessToken}`;
  if (_query) {
    Object.keys(_query).forEach((e, i) => {
      _link += `&${e}=${_query[e]}`;
    })
  }

  return _link;
}

async function post(_collection, _object) {
  let url = convertLink(_collection, undefined);
  var res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(_object),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  return json;
}

async function page_products(pageProduct, categoryId) {
  var firstInner = '<ul class="pagination pagination-responsive"><li><a href="#">&laquo;</a></li><li><a href="#">&lsaquo;</a></li>';
  var endInner = '<li><a href="#">&rsaquo;</a></li><li><a href="#">&raquo;</a></li></ul>';
  var json = await get(URL + '/products-total?categoryId=' + categoryId);
  var length = json.total;
  var pages = 0;
  if (length % 16 === 0) {
    pages = length / 16;
  }
  else {
    pages = Math.floor(length / 16) + 1;
  }

  var _temp = '';
  for (let i = 1; i <= pages; i++) {
    if (i === pageProduct) {
      _temp += `<li><a style="background-color: #007bff; color:white; cursor:pointer;" onclick="changePage()" name="${i}">${i}</a></li>`;
      continue;
    }
    _temp += `<li><a style="cursor:pointer;" onclick="changePage()" name="${i}">${i}</a></li>`;
  }

  document.getElementById('page_navigation').innerHTML = firstInner + _temp + endInner;
}

async function page_product_list(pageProduct, categoryId) {
  var firstInner = '<ul class="pagination pagination-responsive"><li><a href="#">&laquo;</a></li><li><a href="#">&lsaquo;</a></li>';
  var endInner = '<li><a href="#">&rsaquo;</a></li><li><a href="#">&raquo;</a></li></ul>';
  var json = await get(URL + '/products-total?typeId=' + categoryId);
  var length = json.total;
  var pages = 0;
  if (length % 16 === 0) {
    pages = length / 16;
  }
  else {
    pages = Math.floor(length / 16) + 1;
  }

  var _temp = '';
  for (let i = 1; i <= pages; i++) {
    if (i === pageProduct) {
      _temp += `<li><a style="background-color: #007bff; color:white; cursor:pointer;" onclick="changePage()" name="${i}">${i}</a></li>`;
      continue;
    }
    _temp += `<li><a style="cursor:pointer;" onclick="changePage()" name="${i}">${i}</a></li>`;
  }

  document.getElementById('page_navigation').innerHTML = firstInner + _temp + endInner;
}

function changePage() {
  getProducts(parseInt(event.target.name) - 1);
  // page_products(parseInt(event.target.name))
}

// api
async function get(_url) {
  var res = await fetch(_url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  return json;
}

async function post(_url, _obj) {
  var res = await fetch(_url, {
    method: 'POST',
    body: JSON.stringify({ ..._obj }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  console.log(json)
}

async function put(_url, _obj) {
  var res = await fetch(_url, {
    method: 'PUT',
    body: JSON.stringify({ ..._obj }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  console.log(json)
}

async function uploadFile() {
  var formData = new FormData();
  formData.append('productId', '5f7f2001b2ea921e6cf3919f');
  Object.fro
  var res = await fetch(URL + '/uploads-products', {
    method: 'POST',
    body: formData,
  });
  var json = await res.json();
  console.log(json);
}

// users
async function postUser() {
  event.preventDefault();
  var res = await fetch(URL + '/register', {
    method: 'POST',
    body: JSON.stringify({
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  if (json.total) {
    alert('Account created success!');
  } else {
    alert('Something error');
  }
}

// products
// edition
async function getProduct(_nameCategory, _idDefault, _skip) {
  var _categoryId = _idDefault;
  try {
    if (localStorage.getItem('categories')) {
      var category = JSON.parse(localStorage.getItem('categories'));
      var categoryId = category.find(e => e.name === _nameCategory);

      if (categoryId) {
        _categoryId = categoryId._id;
      }
    }
  } catch (error) {

  }
  page_products(_skip + 1, _categoryId);
  var res = await fetch(URL + '/products?categoryId=' + _categoryId + `&$skip=${_skip * 16}` + '&$limit=16', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  if (json.total) {
    var htmlInner = '';
    document.getElementById('listProducts').innerHTML = htmlInner;
    var firstInner = '<div class="mid-popular">';
    var endInner = '<div class="clearfix"></div></div>';
    var _temp = ``;
    json.data.forEach((e, i) => {
      _temp += `<div class="col-md-3 item-grid simpleCart_shelfItem"><div class=" mid-pop"><div class="pro-img"><img src="${e.image}" class="img-responsive" alt=""><div class="zoom-icon "><a class="picture" href="${e.image}" rel="title" class="b-link-stripe b-animate-gothickbox"><iclass="glyphicon glyphicon-search icon "></i></a><a href="single.html?id=${e._id}"><i class="glyphicon glyphicon-menu-right icon"></i></a></div></div><div class="mid-1"><div class="women"><div class="women-top"><span></span><h6><a href="single.html?id=${e._id}">${e.name}</a></h6></div><div class="img item_add"><a href="#"><img src="images/ca.png" alt=""></a></div><div class="clearfix"></div></div><div class="mid-2"><p><label>${e.discount > 0 ? `$${e.cost.toFixed(2)}` : ''}</label><em class="item_price">$${(e.cost - e.discount).toFixed(2)}</em></p><div class="block"><div class="starbox small ghosting"> </div></div><div class="clearfix"></div></div></div></div></div>`;
      if (i + 1 === json.data.length || (i + 1) % 4 === 0) {
        htmlInner += firstInner + _temp + endInner;
        _temp = '';
      }
    });
    document.getElementById('listProducts').innerHTML = htmlInner;
  } else {
    console.log(json);
  }
}

function detailProduct() {
  console(event.target.name);
}

async function getProductList(_nameCategory, _idDefault, _skip) {
  var _categoryId = _idDefault;
  try {
    if (localStorage.getItem('types')) {
      var category = JSON.parse(localStorage.getItem('types'));
      var categoryId = category.find(e => e.name === _nameCategory);

      if (categoryId) {
        _categoryId = categoryId._id;
      }
    }
  } catch (error) {

  }
  page_product_list(_skip + 1, _categoryId);
  var res = await fetch(URL + '/products?typeId=' + _categoryId + `&$skip=${_skip * 16}` + '&$limit=16', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  if (json.total) {
    var htmlInner = '';
    document.getElementById('listProducts').innerHTML = htmlInner;
    var firstInner = '<div class="mid-popular">';
    var endInner = '<div class="clearfix"></div></div>';
    var _temp = ``;
    json.data.forEach((e, i) => {
      _temp += `<div class="col-md-3 item-grid simpleCart_shelfItem"><div class=" mid-pop"><div class="pro-img"><img src="${e.image}" class="img-responsive" alt=""><div class="zoom-icon "><a class="picture" href="${e.image}" rel="title" class="b-link-stripe b-animate-gothickbox"><iclass="glyphicon glyphicon-search icon "></i></a><a href="single.html?id=${e._id}"><i class="glyphicon glyphicon-menu-right icon"></i></a></div></div><div class="mid-1"><div class="women"><div class="women-top"><span>NEW</span><h6><a href="single.html?id=${e._id}">${e.name}</a></h6></div><div class="img item_add"><a href="#"><img src="images/ca.png" alt=""></a></div><div class="clearfix"></div></div><div class="mid-2"><p><label>${e.discount > 0 ? `$${e.cost.toFixed(2)}` : ''}</label><em class="item_price">$${(e.cost - e.discount).toFixed(2)}</em></p><div class="block"><div class="starbox small ghosting"> </div></div><div class="clearfix"></div></div></div></div></div>`;
      if (i + 1 === json.data.length || (i + 1) % 4 === 0) {
        htmlInner += firstInner + _temp + endInner;
        _temp = '';
      }
    });
    document.getElementById('listProducts').innerHTML = htmlInner;
  } else {
    console.log(json);
  }
}

async function getCategories() {
  var json = await get(URL + '/categories');
  localStorage.setItem('categories', JSON.stringify(json.data))
}

async function getTypes() {
  var json = await get(URL + '/types');
  localStorage.setItem('types', JSON.stringify(json.data))
}

function getProducts(_skip) {
  var _link = window.location.href;
  if (_link.indexOf('edition.html') !== -1) {
    getProduct('Edition set', '5f7ddf4c1e604837c8f00640', _skip);
    return;
  }
  if (_link.indexOf('tool.html') !== -1) {
    getProduct('Tool', '5f7ddf621e604837c8f00641', _skip);
    return;
  }
  if (_link.indexOf('eye.html') !== -1) {
    getProduct('Eye', '5f7ddf6d1e604837c8f00642', _skip);
    return;
  }
  if (_link.indexOf('cheek.html') !== -1) {
    getProduct('Cheek', '5f7ddf761e604837c8f00643', _skip);
    return;
  }
  if (_link.indexOf('serum.html') !== -1) {
    getProduct('Serum & Toner', '5f7ddf9a1e604837c8f00644', _skip);
    return;
  }
  if (_link.indexOf('mask.html') !== -1) {
    getProduct('Mask', '5f7ddfac1e604837c8f00645', _skip);
    return;
  }
  if (_link.indexOf('hair.html') !== -1) {
    getProduct('Body & Hair', '5f7ddfc01e604837c8f00646', _skip);
    return;
  }
  if (_link.indexOf('nail.html') !== -1) {
    getProduct('Nail', '5f7ddfcf1e604837c8f00647', _skip);
    return;
  }
  if (_link.indexOf('index.html') !== -1) {
    getProductList('New', '5f7ddeed1e604837c8f0063d', _skip);
    return;
  }
  if (_link.indexOf('single.html') !== -1) {
    var _index = _link.indexOf('?id=');
    if (_index !== -1) {
      var _id = _link.substr(_index + 4, _link.length - _index - 4);
      singlePage(_id);
    }
    return;
  }
  if (_link.indexOf('checkout.html') !== -1) {
    if (localStorage.getItem('role') === 'admin') {
      document.getElementById('role_checkout_page').style.visibility = 'hidden';
      getProductCheckoutAdmin();
      return;
    }
    document.getElementById('admin_checkout_page').style.visibility = 'hidden';
    getProductCheckout();
  }
}

async function getProductCheckout() {
  var _checkout = JSON.parse(localStorage.getItem('checkout'));
  var arr = [];
  Object.keys(_checkout).forEach((e, i) => arr.push(e));
  var json = await get(URL + '/products?$in=' + JSON.stringify({ name: '_id', value: arr }));
  var _temp = '<tr><th class="table-grid">Item</th><th>Prices</th><th>NumOfProduct </th><th>Subtotal</th></tr>';
  json.data.map((e, i) => {
    e['numOfProduct'] = _checkout[e._id];
    _temp += `<tr class="cart-header"><td class="ring-in"><a href="single.html?id=${e._id}" class="at-in"><img src="${e.image}" class="img-responsive" alt=""></a><div class="sed"><h5><a href="single.html">${e.name}</a></h5><p>(Lip Concern: Dry Lips. Skin Type: Sensitive. Specialty: Mineral Oil ) </p></div><div class="clearfix"> </div><div class="close${i + 1}"></div></td><td>$${(e.cost - e.discount).toFixed(2)}</td><td>${e.numOfProduct}</td><td class="item_price">$${((e.cost - e.discount) * e.numOfProduct).toFixed(2)}</td><td class="add-check">${e._id}</td></tr>`;
  });
  document.getElementById('listProductCheckout').innerHTML = _temp;
}

async function getProductCheckoutAdmin() {
  var json_checkouts = await get(URL + '/checkouts?resolve=0');
  var checkouts = json_checkouts.data;
  var listAdmin = []; // list of checkouts
  for (let index = 0; index < checkouts.length; index++) {
    var e = checkouts[index];
    // get user order
    var users = await get(URL + '/users?_id=' + e.userId);
    var user = '';
    if (users.total) {
      user = `<p><b>Name: </b> ${users.data[0].name}</p>` + `<p><b>Phone: </b> ${users.data[0].phone}</p>`;
    }
    // get list of products by user order
    var arr = [];
    Object.keys(e.products).forEach((id, i) => arr.push(id));
    var product_list = await get(URL + '/products?$in=' + JSON.stringify({ name: '_id', value: arr }));
    var prices = 0;
    var list_products = '';
    var details = '';
    product_list.data.forEach((product, i) => {
      prices += (product.cost - product.discount) * e.products[product._id];
      list_products += product._id;
      details += `<p><b>${product.name}</b> - ${e.products[product._id]}</p>`;
    });
    // setup data display page checkout for role=admin
    listAdmin.push({
      ...e,
      prices: prices,
      listOfProducts: list_products,
      details: details,
      user: user
    });
  }
  var _temp = '<tr><th class="table-grid">User details</th><th>Prices</th><th>List of products - numbers</th><th>id</th></tr>';
  listAdmin.forEach((e, i) => {
    _temp += `<tr><th class="table-grid">${e.user}</th><th>${e.prices}</th><th>${e.details}</th><th>${e._id}</th></tr>`;
  });
  document.getElementById('admin_listProductCheckout').innerHTML = _temp;
}

function admin_deleteProductCheckout() {
  var id = document.getElementById('admin_id_deleteProductCheckout').value;
  document.getElementById('admin_id_deleteProductCheckout').value = '';
  put(URL + '/checkouts', {
    _id: id,
    resolve: 1
  })
  getProductCheckoutAdmin();
}

async function singlePage(_id) {
  var json = await get(URL + '/products?_id=' + _id);
  var product = json.data[0];
  if (json.total) {
    document.getElementById("productNameChange").innerHTML = product.name;
    document.getElementById("costProductChange").innerHTML = `$${(product.cost - product.discount).toFixed(2)}`;
    document.getElementById("imageProductChange").innerHTML = `<ul class="slides"><li data-thumb="${product.image}"><div class="thumb-image"> <img src="${product.image}" data-imagezoom="true" class="img-responsive"> </div></li><li data-thumb="images/edition1-1.png"><div class="thumb-image"> <img src="images/edition1-1.png" data-imagezoom="true" class="img-responsive"> </div></li></ul>`;
    document.getElementById('tab1').innerHTML = `<div class="facts"><p>${product.description}</p><ul><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Research</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Design and Development</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Porting and Optimization</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>System integration</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Verification, Validation and Testing</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Maintenance and Support</li></ul></div>`;
    document.getElementById('tab2').innerHTML = `<div class="facts"><p>${product.information}</p><ul><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Multimedia Systems</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Digital media adapters</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Set top boxes for HDTV and IPTV Player </li></ul></div>0`;
    document.getElementById('tab3').innerHTML = `<div class="facts"><p>${product.reviews}</p><ul><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Research</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Design and Development</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Porting and Optimization</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>System integration</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Verification, Validation and Testing</li><li><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>Maintenance and Support</li></ul></div>`;
  }
}

function addProductToCart() {
  var _text = document.getElementById('numOfProduct').textContent;
  var _num = parseInt(_text);
  var _link = window.location.href;
  var _index = _link.indexOf('?id=');
  if (_link[_link.length - 1] === '#')
    var _id = _link.substr(_index + 4, _link.length - _index - 5);
  else
    var _id = _link.substr(_index + 4, _link.length - _index - 4);

  var arr = {};
  if (localStorage.getItem('checkout')) {
    arr = { ...JSON.parse(localStorage.getItem('checkout')) }
  }

  arr[_id] = _num;
  localStorage.setItem('checkout', JSON.stringify(arr));
  console.log(localStorage.getItem('checkout'));
}

function deleteProductCheckout() {
  var products = JSON.parse(localStorage.getItem('checkout'));
  delete products[document.getElementById('_id_deleteProductCheckout').value];
  document.getElementById('_id_deleteProductCheckout').value = '';
  localStorage.setItem('checkout', JSON.stringify(products));
  getProductCheckout();
}

function producedToBuy() {
  if (localStorage.getItem('_id')) {
    post(URL + '/checkouts', {
      userId: localStorage.getItem('_id'),
      products: JSON.parse(localStorage.getItem('checkout'))
    });
    getProductCheckout();
    localStorage.removeItem('checkout');
  }
  else {
    alert('You must login to buy now');
  }
}

// run
getCategories();
getTypes();
getProducts(0);

// function utils
function resetLink(_link) {
  let _replaceLink = _link ? _link : '';
  let _href = window.location.href;
  let _arr = _href.split('/');
  if (_arr && _arr.length) {
    window.location.href = _href.substring(0, _href.indexOf(_arr[_arr.length - 1])) + _replaceLink;
    // window.location.reload();
  }
}


// run function
accountLocalStorage();