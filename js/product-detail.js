(function() {
  "use strict";

  var sanityProjectId = "uudpeglz";
  var sanityDataset = "production";
  var sanityApiUrl = "https://" + sanityProjectId + ".api.sanity.io/v2025-02-19/data/query/" + sanityDataset;
  var whatsappNumber = "2348032039723";

  /**
   * Get URL parameter value
   */
  function getUrlParam(paramName) {
    var params = new URLSearchParams(window.location.search);
    return params.get(paramName);
  }

  /**
   * Convert Sanity image reference to CDN URL
   */
  function getSanityImageUrl(image) {
    if (!image) return "";
    
    if (typeof image === "string" && image.startsWith("http")) {
      return image;
    }

    var imageString = typeof image === "string" ? image : (image.asset && image.asset._ref) || image._ref || "";
    if (!imageString) return "";

    var assetParts = imageString.split("-");
    if (assetParts.length < 3 || assetParts[0] !== "image") {
      return "";
    }

    var format = assetParts[assetParts.length - 1];
    var idAndDimensions = assetParts.slice(1, assetParts.length - 1).join("-");
    
    return "https://cdn.sanity.io/images/" + sanityProjectId + "/" + sanityDataset + "/" + idAndDimensions + "." + format;
  }

  /**
   * Load single product from Sanity by ID
   */
  function loadProductDetail() {
    var productId = getUrlParam("id");
    
    if (!productId) {
      showError("No product ID provided. Please select a product from the shop.");
      return;
    }

    // GROQ query to fetch single product with all details
    var query = '*[_id == "' + productId + '"]{_id, "productName": productName, price, category->{title, name}, "image": image, "description": description, available}[0]';
    var requestUrl = sanityApiUrl + "?query=" + encodeURIComponent(query);

    fetch(requestUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("API Error: " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (!data.result) {
          showError("Product not found.");
          return;
        }

        var product = data.result;
        displayProduct(product);
      })
      .catch(function (error) {
        console.error("❌ Error fetching product:", error);
        showError("Failed to load product details. Please try again.");
      });
  }

  /**
   * Display product details on page
   */
  function displayProduct(product) {
    try {
      var loadingEl = document.getElementById("product-detail-loading");
      var contentEl = document.getElementById("product-detail-content");
      var errorEl = document.getElementById("product-detail-error");

      if (loadingEl) loadingEl.style.display = "none";
      if (contentEl) contentEl.style.display = "block";
      if (errorEl) errorEl.style.display = "none";

      var productName = product.productName || product["Product Name"] || "OZB Product";
      var price = Number(product.price) || 0;
      var categoryName = (product.category && (product.category.title || product.category.name)) || "General";
      var description = product.description || "Premium quality product available at OZB Communication. Guaranteed authentic with warranty support.";

      // Update page title
      document.title = productName + " | OZB Communication";

      // Product breadcrumb & name
      var breadcrumbName = document.getElementById("product-breadcrumb-name");
      if (breadcrumbName) breadcrumbName.textContent = productName;

      var nameEl = document.getElementById("product-detail-name");
      if (nameEl) nameEl.textContent = productName;

      // Price formatted in Naira
      var priceEl = document.getElementById("product-detail-price");
      if (priceEl) priceEl.textContent = "₦" + price.toLocaleString();

      // Category
      var catEl = document.getElementById("product-detail-category");
      if (catEl) catEl.textContent = categoryName;

      var catFullEl = document.getElementById("product-detail-category-full");
      if (catFullEl) catFullEl.textContent = categoryName;

      // Description
      var descEl = document.getElementById("product-detail-description");
      if (descEl) descEl.textContent = description;

      var descFullEl = document.getElementById("product-detail-description-full");
      if (descFullEl) descFullEl.textContent = description;

      // Availability
      var isAvailable = product.available !== false;
      var availabilityText = isAvailable ? "In Stock" : "Out of Stock";
      var availabilityClass = isAvailable ? "badge bg-success text-white" : "badge bg-secondary text-white";

      var availEl = document.getElementById("product-detail-available");
      if (availEl) {
        availEl.innerHTML = '<span class="' + availabilityClass + ' px-3 py-2 text-uppercase">' + availabilityText + '</span>';
      }

      var availFullEl = document.getElementById("product-detail-available-full");
      if (availFullEl) availFullEl.textContent = availabilityText;

      // Product ID
      var idEl = document.getElementById("product-detail-id");
      if (idEl) idEl.textContent = product._id || "N/A";

      // Images
      var images = [];
      if (Array.isArray(product.image)) {
        images = product.image;
      } else if (product.image) {
        images = [product.image];
      }
      displayProductImages(images, productName);

      // Add to Cart and WhatsApp actions
      setupProductActions(product, productName, price, images);

    } catch (error) {
      console.error("❌ Error displaying product:", error);
      showError("Error displaying product details.");
    }
  }

  /**
   * Display product images and thumbnail switcher
   */
  function displayProductImages(images, productName) {
    var mainImageEl = document.getElementById("product-main-image");
    var thumbnailsContainer = document.getElementById("product-thumbnails");

    if (!images || images.length === 0) {
      if (mainImageEl) {
        mainImageEl.src = "images/single-image1.png";
        mainImageEl.alt = productName;
      }
      if (thumbnailsContainer) thumbnailsContainer.innerHTML = "";
      return;
    }

    var mainImageUrl = getSanityImageUrl(images[0]);
    if (mainImageEl) {
      mainImageEl.src = mainImageUrl || "images/single-image1.png";
      mainImageEl.alt = productName;
    }

    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = "";

      if (images.length > 1) {
        images.forEach(function (image, index) {
          var thumbUrl = getSanityImageUrl(image);
          if (thumbUrl) {
            var thumbBtn = document.createElement("button");
            thumbBtn.type = "button";
            thumbBtn.className = "btn p-1 me-2 mb-2 product-thumb-btn" + (index === 0 ? " active-thumb" : "");
            thumbBtn.style.border = index === 0 ? "2px solid var(--primary-color)" : "1px solid #ddd";
            thumbBtn.style.borderRadius = "4px";
            thumbBtn.style.background = "#fff";
            thumbBtn.innerHTML = '<img src="' + thumbUrl + '" alt="' + productName + ' thumbnail" style="width: 60px; height: 60px; object-fit: contain;">';

            thumbBtn.addEventListener("click", function () {
              if (mainImageEl) mainImageEl.src = thumbUrl;
              thumbnailsContainer.querySelectorAll(".product-thumb-btn").forEach(function (b) {
                b.style.border = "1px solid #ddd";
              });
              thumbBtn.style.border = "2px solid var(--primary-color)";
            });

            thumbnailsContainer.appendChild(thumbBtn);
          }
        });
      }
    }
  }

  /**
   * Setup Add to Cart & WhatsApp Buy Buttons & Quantity selector
   */
  function setupProductActions(product, productName, price, images) {
    var addBtn = document.getElementById("add-to-cart-btn");
    var whatsappBtn = document.getElementById("whatsapp-buy-btn");
    var quantityInput = document.getElementById("quantity");
    var qtyPlus = document.getElementById("qty-plus");
    var qtyMinus = document.getElementById("qty-minus");

    if (qtyPlus && quantityInput) {
      qtyPlus.onclick = function() {
        var current = parseInt(quantityInput.value, 10) || 1;
        quantityInput.value = current + 1;
      };
    }

    if (qtyMinus && quantityInput) {
      qtyMinus.onclick = function() {
        var current = parseInt(quantityInput.value, 10) || 1;
        if (current > 1) {
          quantityInput.value = current - 1;
        }
      };
    }

    var firstImageUrl = (images && images.length > 0) ? getSanityImageUrl(images[0]) : "";

    if (addBtn) {
      addBtn.onclick = function () {
        var qty = parseInt(quantityInput ? quantityInput.value : "1", 10) || 1;
        if (typeof window.addToCart === "function") {
          window.addToCart({
            name: productName,
            price: price,
            image: firstImageUrl,
            quantity: qty
          });
        }
      };

      if (product.available === false) {
        addBtn.disabled = true;
        addBtn.textContent = "Out of Stock";
      }
    }

    if (whatsappBtn) {
      whatsappBtn.onclick = function() {
        var qty = parseInt(quantityInput ? quantityInput.value : "1", 10) || 1;
        var total = price * qty;
        var msg = "Hello OZB Communications, I would like to order:\n\n" +
                  "- " + productName + " x" + qty + " = ₦" + total.toLocaleString() + "\n\n" +
                  "Link: " + window.location.href;
        window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(msg), "_blank");
      };
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    var loadingEl = document.getElementById("product-detail-loading");
    var contentEl = document.getElementById("product-detail-content");
    var errorEl = document.getElementById("product-detail-error");

    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "none";
    if (errorEl) {
      errorEl.style.display = "block";
      var msgEl = errorEl.querySelector(".error-message");
      if (msgEl) msgEl.textContent = message;
    }
  }

  // Load product when page is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadProductDetail);
  } else {
    loadProductDetail();
  }
})();
