(function () {
  "use strict";

  // Products now come exclusively from Sanity CMS
  var sanityProjectId = "uudpeglz";
  var sanityDataset = "production";
  var sanityApiUrl = "https://" + sanityProjectId + ".api.sanity.io/v2025-02-19/data/query/" + sanityDataset;

  window.ozbProducts = [];
  window.sanityLoaded = false;

  function getSanityImageUrl(image) {
    console.log("🔍 Raw image object from Sanity:", image);
    
    if (!image) {
      console.warn("⚠️ No image object provided");
      return "";
    }

    // Handle different Sanity image formats
    var assetReference = null;
    
    if (typeof image === "string") {
      // If image is just a string reference
      assetReference = image;
    } else if (image.asset && image.asset._ref) {
      // If image is an object with asset._ref
      assetReference = image.asset._ref;
    } else if (image._ref) {
      // If image itself has _ref
      assetReference = image._ref;
    } else if (image.url) {
      // If Sanity already provided a URL
      console.log("✅ Using Sanity CDN URL directly:", image.url);
      return image.url;
    } else {
      console.warn("⚠️ Could not find image reference in:", image);
      return "";
    }

    console.log("📍 Asset reference found:", assetReference);
    
    if (!assetReference) {
      console.warn("⚠️ Asset reference is empty");
      return "";
    }

    // Parse the asset reference: "image-ASSETID-DIMENSIONS-FORMAT"
    // Example: "image-c5aa73d9f59f00a64f98c03758d2611dbfd12024-232x310-webp"
    var assetParts = assetReference.split("-");
    
    if (assetParts[0] !== "image") {
      console.warn("⚠️ Invalid asset reference format:", assetReference);
      return "";
    }

    // Last part is the format (webp, jpg, png, etc)
    var format = assetParts[assetParts.length - 1];
    // Everything except "image" and format is the ID and dimensions
    var idAndDimensions = assetParts.slice(1, assetParts.length - 1).join("-");
    
    var cdnUrl = "https://cdn.sanity.io/images/" + sanityProjectId + "/" + sanityDataset + "/" + idAndDimensions + "." + format;
    
    console.log("✅ Generated CDN URL:", cdnUrl);
    return cdnUrl;
  }

  function loadSanityProducts() {
    // GROQ query - dereferences category and gets first image from array
    // v5 - Using actual field names from Sanity schema
    var query = '*[_type == "product" && available != false] | order(_createdAt desc){_id, "productName": productName, price, category->{title, name}, "image": image[0], "description": description, available}';
    var requestUrl = sanityApiUrl + "?query=" + encodeURIComponent(query);

    console.log("🔄 Fetching Sanity products from:", requestUrl);

    return fetch(requestUrl)
      .then(function (response) {
        console.log("📡 Sanity API response status:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error("Sanity request failed with status " + response.status);
        }
        return response.json();
      })
      .then(function (payload) {
        console.log("✅ Sanity payload received:", payload);
        var rawProducts = payload.result || [];
        console.log("📦 Total products from Sanity:", rawProducts.length);
        
        if (rawProducts.length === 0) {
          console.warn("⚠️ No products found in Sanity. Please add and publish products in your Sanity Studio.");
          window.sanityLoaded = true;
          return;
        }

        // First pass: Log what fields each product has
        rawProducts.forEach(function (product, idx) {
          console.log("📋 Product " + idx + " raw data:", product);
          console.log("   - name:", product.name, "(type: " + typeof product.name + ")");
          console.log("   - price:", product.price, "(type: " + typeof product.price + ")");
          console.log("   - category:", product.category, "(type: " + typeof product.category + ")");
          console.log("   - image:", product.image);
        });

        var products = rawProducts.filter(function (product) {
          var hasName = product.productName && typeof product.productName === "string";
          var hasValidPrice = Number.isFinite(Number(product.price));
          var hasCategory = product.category && (product.category.title || product.category.name) && typeof (product.category.title || product.category.name) === "string";
          
          if (!hasName) console.warn("❌ Product filtered: missing productName", product);
          if (!hasValidPrice) console.warn("❌ Product filtered: missing or invalid price", product.price);
          if (!hasCategory) console.warn("❌ Product filtered: missing or invalid category", product.category);
          
          return hasName && hasValidPrice && hasCategory;
        }).map(function (product) {
          var categoryName = (product.category.title || product.category.name);
          var imageUrl = getSanityImageUrl(product.image);
          console.log("🖼️ Processing product:", product.productName, "- Image URL:", imageUrl || "NO IMAGE");
          return {
            _id: product._id,
            productName: product.productName,
            name: product.productName,
            price: Number(product.price),
            image: imageUrl,
            category: categoryName,
            description: product.description,
            available: product.available
          };
        }).filter(function (product) {
          if (!product.image) {
            console.warn("❌ Product skipped (no image):", product.productName);
            return false;
          }
          return true;
        });

        console.log("✨ Successfully loaded products from Sanity:", products.length);
        window.ozbProducts = products;
        window.sanityLoaded = true;
        // Notify all listeners that products are ready
        document.dispatchEvent(new Event("sanityProductsLoaded"));
      })
      .catch(function (error) {
        console.error("❌ Error loading Sanity products:", error);
        console.error("💡 Troubleshooting tips:");
        console.error("   1. Check CORS settings: https://manage.sanity.io/projects/uudpeglz");
        console.error("   2. Add your localhost URL to CORS origins (e.g., http://localhost:3000)");
        console.error("   3. Make sure products are PUBLISHED in Sanity (not just drafts)");
        console.error("   4. Verify product schema has: name, price, category, image fields");
        window.sanityLoaded = true;
      });
  }

  function createProductCard(product) {
    var column = document.createElement("div");
    column.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
    column.dataset.category = product.category;
    var detailUrl = 'product-detail.html?id=' + encodeURIComponent(product._id || '');
    column.innerHTML =
      '<article class="product-card position-relative">' +
        '<div class="image-holder"><a href="' + detailUrl + '"><img src="' + product.image + '" alt="' + product.productName + '" class="img-fluid"></a></div>' +
        '<div class="cart-concern position-absolute"><div class="cart-button d-flex"><a href="#" class="btn btn-medium btn-black add-to-cart" data-product-id="' + product._id + '">Add to Cart<svg class="cart-outline"><use xlink:href="#cart-outline"></use></svg></a></div></div>' +
        '<div class="card-detail pt-3"><h3 class="card-title text-uppercase mb-1"><a href="' + detailUrl + '">' + product.productName + '</a></h3><span class="item-price text-primary">₦' + Number(product.price).toLocaleString() + '</span></div>' +
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

  function renderShop() {
    var grid = document.querySelector("[data-product-grid]");
    var emptyMessage = document.querySelector("[data-products-empty]");
    var searchInput = document.querySelector("[data-product-search]");
    var categorySelect = document.querySelector("[data-product-category]");

    if (!grid) {
      return;
    }

    // Read URL parameters if present
    var urlParams = new URLSearchParams(window.location.search);
    var urlSearch = urlParams.get("s") || urlParams.get("search") || "";
    var urlCategory = urlParams.get("category") || urlParams.get("cat") || "";

    if (searchInput && urlSearch) {
      searchInput.value = urlSearch;
    }

    // Dynamically sync category options from loaded products
    if (categorySelect && window.ozbProducts && window.ozbProducts.length > 0) {
      var existingCats = Array.from(categorySelect.options).map(function(opt) { return opt.value; });
      window.ozbProducts.forEach(function(p) {
        if (p.category && !existingCats.includes(p.category)) {
          var opt = document.createElement("option");
          opt.value = p.category;
          opt.textContent = p.category;
          categorySelect.appendChild(opt);
          existingCats.push(p.category);
        }
      });

      if (urlCategory) {
        // Try matching case-insensitively
        var foundOpt = Array.from(categorySelect.options).find(function(opt) {
          return opt.value.toLowerCase() === urlCategory.toLowerCase();
        });
        if (foundOpt) {
          categorySelect.value = foundOpt.value;
        }
      }
    }

    function applyFilters() {
      var search = (searchInput ? searchInput.value : "").trim().toLowerCase();
      var category = categorySelect ? categorySelect.value : "All";
      var visibleProducts = window.ozbProducts.filter(function (product) {
        var matchesSearch = !search || product.name.toLowerCase().indexOf(search) !== -1;
        var matchesCategory = category === "All" || product.category === category;
        return matchesSearch && matchesCategory;
      });

      grid.innerHTML = "";
      
      if (!window.sanityLoaded) {
        grid.innerHTML = '<div class="col-12"><p class="text-center text-muted">Loading products from Sanity...</p></div>';
      } else if (window.ozbProducts.length === 0) {
        grid.innerHTML = '<div class="col-12"><p class="text-center text-danger"><strong>No products available.</strong> Please add and publish products in your Sanity Studio.</p></div>';
      } else if (visibleProducts.length === 0) {
        emptyMessage.hidden = false;
        return;
      } else {
        visibleProducts.forEach(function (product) {
          grid.appendChild(createProductCard(product));
        });
      }
      
      emptyMessage.hidden = visibleProducts.length !== 0;
      document.querySelectorAll("[data-product-count]").forEach(function (element) {
        element.textContent = visibleProducts.length + (visibleProducts.length === 1 ? " product" : " products");
      });
      document.dispatchEvent(new Event("productsRendered"));
    }

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (categorySelect) categorySelect.addEventListener("change", applyFilters);
    applyFilters();
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadSanityProducts().then(renderShop);
  });
})();
