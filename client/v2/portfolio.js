// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};
let recentProducts = [];
let reasonablePrice = [];

// favorite products
let favoriteProducts = [];

// brands on the page 
let brands = [];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const selectBrand = document.querySelector('#brand-select');
const selectSort = document.querySelector('#sort-select');
const selectReasonablePrice = document.querySelector('#reasonable-price-select');
const selectRecent = document.querySelector('#recent-select');
const selectFavorite = document.querySelector('#favorite-select');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbBrands = document.querySelector('#nbBrands');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
const spanLatestRelease = document.querySelector('#latestRelease');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Fetch brands from api
 * @return {Object}
 */

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app/brands`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {brands};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {brands};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = (pagination, products, brands) => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
  spanNbBrands.innerHTML = brands.result.length;
  spanNbNewProducts.innerHTML = recentProducts.length;

  let sortedProducts = sortByDateRecentToOld(products);
  spanLatestRelease.innerHTML = sortedProducts[0].released;
};

const renderP = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Render brands selector
 */
const renderBrands = brands => {
  const options = brands.result.map(brand => `<option value="${brand}">${brand}</option>`
  ).join('');
  
  selectBrand.innerHTML = options;;
};

const render = (products, pagination, brands) => {
  renderProducts(products);
  renderPagination(pagination);
  renderBrands(brands);
  renderIndicators(pagination,products,brands);
};


/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/**
 * Filter by brands
 */

selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, event.target.value);
  
  setCurrentProducts(products);

  let selectedBrand = event.target.value;
  let currentBrand = {};
  currentBrand[selectedBrand] = [];

  for (const product of currentProducts) {
    if (product.brand == selectedBrand) {
    currentBrand[product.brand].push(product)
    }
  };
  render(currentBrand[selectedBrand], currentPagination, brands);
});

/**
 * Filter by recent products
 */

selectRecent.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  setCurrentProducts(products);

  if(event.target.value == "Yes"){
    recentDate(currentProducts,onlyRecentProducts);
  }
  else {
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);
    setCurrentProducts(products);
    render(currentProducts, currentPagination, brands);
  }

  render(onlyRecentProducts, currentPagination, brands);
});


/**
 * Select page
 */
selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/**
 * Load page
 */

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  const brands = await fetchBrands();

  console.log("products", products);
  setCurrentProducts(products);
  console.log("current", currentProducts);

  renderProducts(products);
  renderBrands(products);
  console.log(currentPagination);

  localStorage.setItem('favoriteProducts',JSON.stringify(favoriteProducts));

  //let [p50, p90, p95] = getPValueIndicator(currentProducts);

  //renderPValues(p50, p90, p95);
  //render(currentProducts, currentPagination, brands);
});



/**
 * Functions
 */


/**
 * Sort by date
 */

function sortByDateRecentToOld(data) {
  const sorted = data.sort((a, b) => {
    if (a.released > b.released) {
      return -1;
    }
  });
  return sorted;
  };
  
  function sortByDateOldToRecent(data) {
    const sorted = data.sort((a, b) => {
      if (a.released < b.released) {
        return -1;
      }
    });
    return sorted;
    };

  /**
   * Transform date
   */

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
  
    return [year, month, day].join('-');
  }

  function recentDate(currentProducts, onlyRecentProducts) {
    let twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
     twoWeeksAgo = formatDate(twoWeeksAgo);
    
  
     for (let i = 0; i<currentProducts.length; i++) {
      if (currentProducts[i].released > twoWeeksAgo) {
       onlyRecentProducts.push(currentProducts[i]);
        }
      };
  }
  

