(function () {
  "use strict";

  var sanityProjectId = "uudpeglz";
  var sanityDataset = "production";
  var sanityApiUrl = "https://" + sanityProjectId + ".api.sanity.io/v2025-02-19/data/query/" + sanityDataset;

  /**
   * Create a product card element for the grid
   */
  function createProductCard(product) {
    var column = document.createElement("div");
    column.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
    column.dataset.category = product.category || "";
    var detailUrl = 'product-detail.html?id=' + encodeURIComponent(product._id || '');
    
    column.innerHTML =
      '<article class="product-card position-relative">' +
        '<div class="image-holder"><a href="' + detailUrl + '"><img src="' + product.image + '" alt="' + product.productName + '" class="img-fluid"></a></div>' +
        '<div class="cart-concern position-absolute"><div class="cart-button d-flex"><a href="#" class="btn btn-medium btn-black add-to-cart" data-product-id="' + product._id + '">Add to Cart<svg class="cart-outline"><use xlink:href="#cart-outline"></use></svg></a></div></div>' +
        '<div class="card-detail pt-3">' +
          '<h3 class="card-title text-uppercase"><a href="' + detailUrl + '">' + product.productName + '</a></h3>' +
          '<span class="item-price text-primary">₦' + Number(product.price).toLocaleString() + '</span>' +
        '</div>' +
      '</article>';

    // Add to cart button handler
    var addBtn = column.querySelector('.add-to-cart');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (typeof window.addToCart === 'function') {
          window.addToCart(product._id, product.productName, product.price, product.image);
        }
      });
    }

    return column;
  }

  /**
   * Create a category section with responsive product grid
   */
  function createCategorySection(category, products) {
    var categoryId = 'category-' + (category._id || category.title).replace(/\s+/g, '-').toLowerCase();
    var categoryTitle = category.title || category.name || "Products";

    var section = document.createElement('section');
    section.id = categoryId;
    section.className = "product-store position-relative padding-large no-padding-top";

    var container = document.createElement('div');
    container.className = "container";

    var headerRow = document.createElement('div');
    headerRow.className = "row";
    headerRow.innerHTML =
      '<div class="display-header d-flex justify-content-between align-items-center pb-4">' +
        '<h2 class="display-7 text-dark text-uppercase mb-0">' + categoryTitle + '</h2>' +
        '<div class="btn-right">' +
          '<a href="shop.html?category=' + encodeURIComponent(categoryTitle) + '" class="btn btn-medium btn-normal text-uppercase">Go to Shop</a>' +
        '</div>' +
      '</div>';

    var gridRow = document.createElement('div');
    gridRow.className = "row g-4 product-grid";
    gridRow.id = "grid-" + categoryId;

    products.forEach(function (product) {
      gridRow.appendChild(createProductCard(product));
    });

    container.appendChild(headerRow);
    container.appendChild(gridRow);
    section.appendChild(container);

    return section;
  }

  /**
   * Generate all category sections in a responsive grid
   */
  function generateCategorySections() {
    if (!window.ozbProducts || window.ozbProducts.length === 0) {
      console.warn("⏳ Products not yet loaded, waiting...");
      setTimeout(generateCategorySections, 500);
      return;
    }

    console.log("🎯 Generating category product grids...");

    var container = document.getElementById('dynamic-product-categories');
    if (!container) {
      console.error("❌ Container #dynamic-product-categories not found");
      return;
    }

    // Clear previous contents
    container.innerHTML = "";

    // Group products by category
    var productsByCategory = {};
    window.ozbProducts.forEach(function (product) {
      var cat = product.category || "General";
      if (!productsByCategory[cat]) {
        productsByCategory[cat] = [];
      }
      productsByCategory[cat].push(product);
    });

    var categoryNames = Object.keys(productsByCategory);

    if (categoryNames.length === 0) {
      console.warn("⚠️ No categories found in products");
      return;
    }

    // Create a grid section for each category that has products
    categoryNames.forEach(function (catName) {
      var categoryProducts = productsByCategory[catName];
      if (categoryProducts && categoryProducts.length > 0) {
        var categoryObj = { _id: catName, title: catName };
        var section = createCategorySection(categoryObj, categoryProducts);
        container.appendChild(section);
      }
    });

    console.log("✨ All category product grids rendered successfully");
  }

  // Listen for products loaded event
  document.addEventListener('sanityProductsLoaded', generateCategorySections);

  // Fallback for when products are already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (window.sanityLoaded && window.ozbProducts) {
        generateCategorySections();
      }
    });
  } else {
    if (window.sanityLoaded && window.ozbProducts) {
      generateCategorySections();
    }
  }
})();
