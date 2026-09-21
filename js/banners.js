(function () {
  "use strict";

  var sanityProjectId = "uudpeglz";
  var sanityDataset = "production";
  var sanityApiUrl = "https://" + sanityProjectId + ".api.sanity.io/v2025-02-19/data/query/" + sanityDataset;

  /**
   * Convert Sanity image reference to CDN URL
   */
  function getSanityImageUrl(image) {
    if (!image) return "";

    if (Array.isArray(image) && image.length > 0) {
      image = image[0];
    }

    if (typeof image === "string" && image.startsWith("http")) {
      return image;
    }

    var imageRef = "";
    if (typeof image === "string") {
      imageRef = image;
    } else if (image.asset && image.asset._ref) {
      imageRef = image.asset._ref;
    } else if (image._ref) {
      imageRef = image._ref;
    } else if (image.url) {
      return image.url;
    }

    if (!imageRef) return "";

    var assetParts = imageRef.split("-");
    if (assetParts.length < 4 || assetParts[0] !== "image") {
      // Fallback in case format is slightly different
      if (assetParts.length >= 3) {
        var fmt = assetParts[assetParts.length - 1];
        var idDim = assetParts.slice(1, assetParts.length - 1).join("-");
        return "https://cdn.sanity.io/images/" + sanityProjectId + "/" + sanityDataset + "/" + idDim + "." + fmt;
      }
      return "";
    }

    var format = assetParts[assetParts.length - 1];
    var idAndDimensions = assetParts.slice(1, assetParts.length - 1).join("-");

    return "https://cdn.sanity.io/images/" + sanityProjectId + "/" + sanityDataset + "/" + idAndDimensions + "." + format;
  }

  /**
   * Initialize or refresh Swiper for the top billboard
   */
  function setupBillboardSwiper(slideCount) {
    if (typeof Swiper === "undefined") {
      setTimeout(function () {
        setupBillboardSwiper(slideCount);
      }, 300);
      return;
    }

    var billboardEl = document.querySelector(".main-swiper");
    if (!billboardEl) return;

    if (billboardEl.swiper) {
      try {
        billboardEl.swiper.destroy(true, true);
      } catch (e) {
        console.warn("Could not destroy previous Swiper instance:", e);
      }
    }

    var hasMultiple = slideCount > 1;
    var nextArrow = document.querySelector("#billboard .swiper-arrow-next");
    var prevArrow = document.querySelector("#billboard .swiper-arrow-prev");

    if (!hasMultiple) {
      if (nextArrow) nextArrow.style.display = "none";
      if (prevArrow) prevArrow.style.display = "none";
    } else {
      if (nextArrow) nextArrow.style.display = "flex";
      if (prevArrow) prevArrow.style.display = "flex";
    }

    window.mainSwiperInstance = new Swiper(".main-swiper", {
      speed: 600,
      loop: hasMultiple,
      autoplay: hasMultiple
        ? {
            delay: 5000,
            disableOnInteraction: false,
          }
        : false,
      navigation: {
        nextEl: "#billboard .swiper-arrow-next",
        prevEl: "#billboard .swiper-arrow-prev",
      },
    });

    console.log("✨ Billboard Swiper initialized (slides: " + slideCount + ")");
  }

  /**
   * Render dynamic billboard hero banner slides from Sanity
   */
  function displayBillboardBanners(banners) {
    var wrapper = document.getElementById("billboard-wrapper") || document.querySelector("#billboard .swiper-wrapper");
    if (!wrapper) {
      console.warn("⚠️ Billboard swiper wrapper not found");
      return;
    }

    wrapper.innerHTML = "";

    banners.forEach(function (banner) {
      var slide = document.createElement("div");
      slide.className = "swiper-slide";

      var linkUrl = banner.link || "shop.html";
      var bannerTitle = banner.title || "Special Offer";

      slide.innerHTML =
        '<div class="billboard-banner-container position-relative w-100 overflow-hidden">' +
          '<a href="' + linkUrl + '" class="d-block w-100 text-decoration-none" title="' + bannerTitle + '">' +
            '<img src="' + banner.image + '" alt="' + bannerTitle + '" class="billboard-banner-img w-100 d-block">' +
          '</a>' +
        '</div>';

      wrapper.appendChild(slide);
    });

    setupBillboardSwiper(banners.length);
  }

  /**
   * Render promotional banner in #banners-carousel-container
   */
  function displayPromotionalBanners(banners) {
    var container = document.getElementById("banners-carousel-container");
    if (!container) return;

    var carouselHtml =
      '<div class="swiper banners-swiper">' +
        '<div class="swiper-wrapper" id="banners-wrapper"></div>' +
      '</div>' +
      (banners.length > 1 ? '<div class="swiper-pagination position-absolute text-center"></div>' : "");

    container.innerHTML = carouselHtml;

    var wrapper = container.querySelector(".swiper-wrapper");
    banners.forEach(function (banner) {
      var slideHtml =
        '<div class="swiper-slide">' +
          '<div class="banner-slide" style="background-image: url(\'' + banner.image + '\'); background-position: center right; background-repeat: no-repeat; background-size: cover; min-height: 440px; border-radius: 12px; overflow: hidden;">' +
            '<div class="banner-content d-flex align-items-center padding-xlarge" style="background: linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.15) 100%); min-height: 440px;">' +
              '<div class="content-wrapper" style="max-width: 540px;">' +
                (banner.discount ? '<h3 class="banner-discount text-primary mb-2">' + banner.discount + ' off</h3>' : "") +
                '<h2 class="display-2 pb-3 text-uppercase text-dark">' + banner.title + '</h2>' +
                (banner.message ? '<p class="banner-description text-dark mb-4 lead">' + banner.message.trim() + '</p>' : "") +
                '<a href="' + (banner.link || "shop.html") + '" class="btn btn-medium btn-dark text-uppercase btn-rounded-none">' + (banner.buttonText || "Shop Sale") + '</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      var slideDiv = document.createElement("div");
      slideDiv.innerHTML = slideHtml;
      wrapper.appendChild(slideDiv.firstElementChild);
    });

    if (banners.length > 1 && typeof Swiper !== "undefined") {
      var swiperEl = container.querySelector(".banners-swiper");
      new Swiper(swiperEl, {
        spaceBetween: 0,
        centeredSlides: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: container.querySelector(".swiper-pagination"),
          clickable: true,
        },
      });
    }
  }

  /**
   * Display fallback banners if Sanity is offline or has no banner documents
   */
  function displayFallbackBanners() {
    console.warn("⚠️ Displaying fallback banners");

    // Fallback for billboard
    var billboardWrapper = document.getElementById("billboard-wrapper") || document.querySelector("#billboard .swiper-wrapper");
    if (billboardWrapper && billboardWrapper.children.length === 0) {
      billboardWrapper.innerHTML =
        '<div class="swiper-slide">' +
          '<div class="billboard-banner-container position-relative w-100 overflow-hidden">' +
            '<a href="shop.html" class="d-block w-100 text-decoration-none">' +
              '<img src="images/banner-image.png" alt="MiniStore Banner" class="billboard-banner-img w-100 d-block" style="background-color: #EDF1F3; object-fit: contain; max-height: 480px;">' +
            '</a>' +
          '</div>' +
        '</div>';
      setupBillboardSwiper(1);
    }

    // Fallback for promotional section
    var promoContainer = document.getElementById("banners-carousel-container");
    if (promoContainer) {
      promoContainer.innerHTML =
        '<div class="banner-slide bg-light-blue" style="background-image: url(\'images/single-image1.png\'); background-position: right; background-repeat: no-repeat; min-height: 400px; border-radius: 12px;">' +
          '<div class="banner-content d-flex align-items-center padding-xlarge">' +
            '<div class="content-wrapper" style="max-width: 50%;">' +
              '<h3 class="banner-discount text-primary mb-3">10% off</h3>' +
              '<h2 class="display-2 pb-4 text-uppercase text-dark">Special Offers</h2>' +
              '<p class="banner-description text-dark mb-4">Shop our latest tech collection with amazing discounts</p>' +
              '<a href="shop.html" class="btn btn-medium btn-dark text-uppercase btn-rounded-none">Shop Sale</a>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
  }

  /**
   * Fetch banners from Sanity CMS
   */
  function loadBanners() {
    var query =
      '*[_type == "banner" && (active == true || !defined(active))] | order(_createdAt desc){' +
        '_id,' +
        '_createdAt,' +
        'title,' +
        '"bannerTitle": coalesce(bannerTitle, title, name, heading),' +
        'message,' +
        '"bannerMessage": coalesce(bannerMessage, message, description, subtitle),' +
        'image,' +
        '"bannerImage": coalesce(bannerImage, image),' +
        'discount,' +
        'link,' +
        'buttonText,' +
        'active' +
      '}';

    var requestUrl = sanityApiUrl + "?query=" + encodeURIComponent(query);
    console.log("🎯 Fetching banners from Sanity CMS...");

    return fetch(requestUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Sanity banner request failed with status " + response.status);
        }
        return response.json();
      })
      .then(function (payload) {
        var rawBanners = payload.result || [];
        console.log("📦 Banners fetched from Sanity:", rawBanners.length);

        if (rawBanners.length === 0) {
          displayFallbackBanners();
          return;
        }

        var processedBanners = rawBanners
          .map(function (b) {
            var imgUrl = getSanityImageUrl(b.bannerImage || b.image);
            return {
              _id: b._id,
              title: b.bannerTitle || b.title || "Special Offer",
              message: b.bannerMessage || b.message || "",
              discount: b.discount || "",
              buttonText: b.buttonText || "Shop Product",
              link: b.link || "shop.html",
              image: imgUrl,
            };
          })
          .filter(function (b) {
            return b.image;
          });

        if (processedBanners.length === 0) {
          console.warn("⚠️ No banners with valid images found");
          displayFallbackBanners();
          return;
        }

        window.sanityBanners = processedBanners;
        console.log("✨ Successfully processed banners:", processedBanners.length);

        // Render both the billboard and promotional banners
        displayBillboardBanners(processedBanners);
        displayPromotionalBanners(processedBanners);
      })
      .catch(function (err) {
        console.error("❌ Error loading Sanity banners:", err);
        displayFallbackBanners();
      });
  }

  // Initialize on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadBanners);
  } else {
    loadBanners();
  }
})();
