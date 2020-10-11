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
async function getProduct(_nameCategory, _idDefault) {
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

  var res = await fetch(URL + '/products?categoryId=' + _categoryId, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  var json = await res.json();
  if (json.total) {
    var htmlInner = '';
    var firstInner = '<div class="mid-popular">';
    var endInner = '<div class="clearfix"></div></div>';
    var _temp = ``;
    json.data.forEach((e, i) => {
      _temp += `<div class="col-md-3 item-grid simpleCart_shelfItem"><div class=" mid-pop"><div class="pro-img"><img src="${e.image}" class="img-responsive" alt=""><div class="zoom-icon "><a class="picture" href="${e.image}" rel="title" class="b-link-stripe b-animate-gothickbox"><iclass="glyphicon glyphicon-search icon "></i></a><a href="single.html"><i class="glyphicon glyphicon-menu-right icon"></i></a></div></div><div class="mid-1"><div class="women"><div class="women-top"><span></span><h6><a href="single.html">${e.name}</a></h6></div><div class="img item_add"><a href="#"><img src="images/ca.png" alt=""></a></div><div class="clearfix"></div></div><div class="mid-2"><p><label>${e.discount > 0 ? `$${e.cost.toFixed(2)}` : ''}</label><em class="item_price">$${(e.cost - e.discount).toFixed(2)}</em></p><div class="block"><div class="starbox small ghosting"> </div></div><div class="clearfix"></div></div></div></div></div>`;
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

function getProducts() {
  var _link = window.location.href;
  if (_link.indexOf('edition.html') !== -1) {
    getProduct('Edition set', '5f7ddf4c1e604837c8f00640');
    return;
  }
  if (_link.indexOf('tool.html') !== -1) {
    getProduct('Tool', '5f7ddf621e604837c8f00641');
    return;
  }
  if (_link.indexOf('eye.html') !== -1) {
    getProduct('Eye', '5f7ddf6d1e604837c8f00642');
    return;
  }
  if (_link.indexOf('cheek.html') !== -1) {
    getProduct('Cheek', '5f7ddf761e604837c8f00643');
    return;
  }
  if (_link.indexOf('serum.html') !== -1) {
    getProduct('Serum & Toner', '5f7ddf9a1e604837c8f00644');
    return;
  }
  if (_link.indexOf('mask.html') !== -1) {
    getProduct('Mask', '5f7ddfac1e604837c8f00645');
    return;
  }
  if (_link.indexOf('hair.html') !== -1) {
    getProduct('Body & Hair', '5f7ddfc01e604837c8f00646');
    return;
  }
  if (_link.indexOf('nail.html') !== -1) {
    getProduct('Nail', '5f7ddfcf1e604837c8f00647');
    return;
  }
}

getCategories();

getProducts();

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