(function () {
  "use strict";

  var storageKey = "ozb-cart";
  var whatsappNumber = "2348032039723";

  function getCart() {
    try {
      var storedCart = JSON.parse(localStorage.getItem(storageKey));
      if (!Array.isArray(storedCart)) {
        return [];
      }

      return storedCart.filter(function (item) {
        return item && typeof item.name === "string" && typeof item.image === "string" &&
          Number.isFinite(Number(item.price)) && Number(item.price) >= 0 &&
          Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0;
      }).map(function (item) {
        return {
          name: item.name,
          price: Number(item.price),
          image: item.image,
          quantity: Number(item.quantity)
        };
      });
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }

  function addToCart(arg1, arg2, arg3, arg4, arg5) {
    var product = {};
    if (arg1 && typeof arg1 === "object") {
      product = {
        name: arg1.name || arg1.productName || "Product",
        price: Number(arg1.price) || 0,
        image: arg1.image || "",
        quantity: Number(arg1.quantity) || 1
      };
    } else {
      // Called with (id, name, price, image, quantity)
      product = {
        name: arg2 || "Product",
        price: Number(arg3) || 0,
        image: arg4 || "",
        quantity: Number(arg5) || 1
      };
    }

    var cart = getCart();
    var existingProduct = cart.find(function (item) {
      return item.name === product.name;
    });

    if (existingProduct) {
      existingProduct.quantity += product.quantity;
    } else {
      cart.push({
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity
      });
    }

    saveCart(cart);
    updateCartCount();
    window.alert(product.name + " was added to your cart.");
  }

  function updateCartCount() {
    var count = getCart().reduce(function (total, item) {
      return total + item.quantity;
    }, 0);

    document.querySelectorAll("[data-cart-count]").forEach(function (element) {
      element.textContent = count;
    });
  }

  window.addToCart = addToCart;
  window.getCart = getCart;
  window.updateCartCount = updateCartCount;

  function addCartIcons() {
    document.querySelectorAll(".cart-button a").forEach(function (button) {
      if (button.querySelector("svg")) {
        return;
      }

      var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("class", "cart-outline");
      icon.setAttribute("viewBox", "0 0 16 16");
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = '<path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>';
      button.appendChild(icon);
    });
  }

  function renderCart() {
    var list = document.querySelector("[data-cart-items]");
    var totalElement = document.querySelector("[data-cart-total]");
    var emptyMessage = document.querySelector("[data-cart-empty]");
    var cart = getCart();

    if (!list) {
      return;
    }

    list.innerHTML = "";
    var total = 0;

    if (cart.length === 0) {
      emptyMessage.hidden = false;
      totalElement.textContent = "₦0";
      return;
    }

    emptyMessage.hidden = true;

    cart.forEach(function (item, index) {
      var itemTotal = item.price * item.quantity;
      total += itemTotal;
      var row = document.createElement("div");
      row.className = "row align-items-center border-bottom py-3";

      var imageColumn = document.createElement("div");
      imageColumn.className = "col-3 col-md-2";
      var image = document.createElement("img");
      image.src = item.image;
      image.alt = item.name;
      image.className = "img-fluid";
      imageColumn.appendChild(image);

      var detailsColumn = document.createElement("div");
      detailsColumn.className = "col-9 col-md-4";
      var name = document.createElement("h3");
      name.className = "h5 mb-1";
      name.textContent = item.name;
      var unitPrice = document.createElement("p");
      unitPrice.className = "mb-0";
      unitPrice.textContent = "₦" + item.price.toLocaleString() + " each";
      detailsColumn.append(name, unitPrice);

      var quantityColumn = document.createElement("div");
      quantityColumn.className = "col-6 col-md-3 mt-3 mt-md-0";
      quantityColumn.innerHTML = '<button type="button" class="btn btn-sm btn-outline-dark" data-decrease="' + index + '">-</button> <span class="mx-2"></span><button type="button" class="btn btn-sm btn-outline-dark" data-increase="' + index + '">+</button>';
      quantityColumn.querySelector("span").textContent = item.quantity;

      var totalColumn = document.createElement("div");
      totalColumn.className = "col-6 col-md-3 text-end mt-3 mt-md-0";
      var itemTotalElement = document.createElement("strong");
      itemTotalElement.textContent = "₦" + itemTotal.toLocaleString();
      var removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "btn btn-sm btn-link text-danger";
      removeButton.dataset.remove = index;
      removeButton.textContent = "Remove";
      totalColumn.append(itemTotalElement, document.createTextNode(" "), removeButton);

      row.append(imageColumn, detailsColumn, quantityColumn, totalColumn);
      list.appendChild(row);
    });

    totalElement.textContent = "₦" + total.toLocaleString();
  }

  function changeQuantity(index, amount) {
    var cart = getCart();
    if (!cart[index]) {
      return;
    }

    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }

    saveCart(cart);
    renderCart();
    updateCartCount();
  }

  function checkoutOnWhatsApp() {
    var cart = getCart();
    if (cart.length === 0) {
      window.alert("Your cart is empty.");
      return;
    }

    var total = cart.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
    var message = "Hello OZB GROUP, I would like to place this order:\n\n";

    cart.forEach(function (item) {
      message += "- " + item.name + " x" + item.quantity + " = ₦" + (item.price * item.quantity).toLocaleString() + "\n";
    });

    message += "\nTotal: ₦" + total.toLocaleString();
    window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message), "_blank");
  }

  document.addEventListener("click", function (event) {
    var addButton = event.target.closest(".cart-button a");
    if (addButton) {
      event.preventDefault();
      var card = addButton.closest(".product-card");
      addToCart({
        name: card.querySelector(".card-title a").textContent.trim(),
        price: parseInt(card.querySelector(".item-price").textContent.replace(/[^0-9]/g, ""), 10),
        image: card.querySelector("img").getAttribute("src")
      });
      return;
    }

    var increaseButton = event.target.closest("[data-increase]");
    if (increaseButton) {
      changeQuantity(Number(increaseButton.dataset.increase), 1);
      return;
    }

    var decreaseButton = event.target.closest("[data-decrease]");
    if (decreaseButton) {
      changeQuantity(Number(decreaseButton.dataset.decrease), -1);
      return;
    }

    var removeButton = event.target.closest("[data-remove]");
    if (removeButton) {
      var cart = getCart();
      cart.splice(Number(removeButton.dataset.remove), 1);
      saveCart(cart);
      renderCart();
      updateCartCount();
      return;
    }

    if (event.target.closest("[data-whatsapp-checkout]")) {
      checkoutOnWhatsApp();
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    addCartIcons();
    renderCart();
    updateCartCount();
  });

  document.addEventListener("productsRendered", addCartIcons);
})();
