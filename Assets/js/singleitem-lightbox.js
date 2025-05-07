/* jshint esversion: 11 */
$(function() {
  /* ------------------------------
         GLOBAL LIGHTBOX SETUP
     ------------------------------ */
  const lightbox = $('<div>').addClass('arabica_article_lightbox');
  const lightboxContent = $('<div>').addClass('arabica_article_lightbox-content');
  const closeBtn = $('<span>').addClass('arabica_article_close-btn').html(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path fill="#ffffff"
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12
               5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `);
  const lightboxImg = $('<img>').attr('id', 'lightbox-img');
  const lightboxCaption = $('<div>').addClass('arabica_article_lightbox-caption').attr('id', 'lightbox-caption');
  const galleryGrid = $('<div>').addClass('arabica_article_lightbox-gallery-grid').css('display', 'none');

  lightbox.append(closeBtn);
  lightboxContent.append(lightboxImg).append(lightboxCaption);
  lightbox.append(galleryGrid).append(lightboxContent);
  $('body').append(lightbox);

  let currentGallery = [];
  let currentIndex = 0;
  let lbTouchStartX = 0;
  let lbTouchEndX = 0;

  function openLightbox(src, alt, caption, gallery = []) {
    lightboxImg.attr({ src: src, alt: alt });
    lightboxCaption.text(caption);
    lightbox.addClass('active');
    $('body').addClass('no-scroll');

    if (gallery.length > 1) {
      currentGallery = gallery;
      currentIndex = gallery.findIndex(item => item.src === src);
      updateGalleryGrid(gallery);
      galleryGrid.css('display', 'flex');
    } else {
      currentGallery = [];
      galleryGrid.html('').css('display', 'none');
    }
  }

  function closeLightbox() {
    lightbox.addClass('closing');
    $('body').removeClass('no-scroll');
    setTimeout(() => {
      lightbox.removeClass('active closing');
      currentGallery = [];
      galleryGrid.html('');
    }, 400);
  }

  function updateGalleryGrid(gallery) {
    galleryGrid.html(
      gallery.map((item, i) =>
        `<img src="${item.src}" alt="${item.alt}" data-index="${i}" class="${i === currentIndex ? 'active' : ''}">`
      ).join('')
    );

    const activeImg = galleryGrid.find(`[data-index="${currentIndex}"]`);
    if (activeImg.length) {
      activeImg.addClass('active');
      requestAnimationFrame(() => {
        const vw = window.innerWidth;
        const gw = galleryGrid[0].scrollWidth;

        if (gw > vw) {
          galleryGrid.css('left', '0');
          const center = activeImg[0].offsetLeft + activeImg[0].offsetWidth / 2;
          const idealTranslate = vw / 2 - center;
          const clamped = Math.min(0, Math.max(vw - gw, idealTranslate));
          galleryGrid.css({
            transition: 'transform 0.3s ease-in-out',
            transform: `translateX(${clamped}px)`
          });
        } else {
          galleryGrid.css({ left: '', transform: '', transition: '' });
        }
      });
    }
  }

  let gridTouchStartX = 0;
  let currentGridTranslate = 0;

  galleryGrid.on('touchstart', e => {
    const vw = window.innerWidth;
    const gw = galleryGrid[0].scrollWidth;
    if (gw > vw) {
      gridTouchStartX = e.touches[0].clientX;
      galleryGrid.css('transition', 'none');
    }
  });

  galleryGrid.on('touchmove', e => {
    const vw = window.innerWidth;
    const gw = galleryGrid[0].scrollWidth;
    if (gw > vw) {
      let delta = e.touches[0].clientX - gridTouchStartX;
      let tx = currentGridTranslate + delta;
      tx = Math.min(0, Math.max(vw - gw, tx));
      galleryGrid.css('transform', `translateX(${tx}px)`);
    }
  });

  galleryGrid.on('touchend', () => {
    const vw = window.innerWidth;
    const gw = galleryGrid[0].scrollWidth;
    if (gw > vw) {
      const matrix = new DOMMatrixReadOnly(galleryGrid.css('transform'));
      currentGridTranslate = matrix.m41;
      galleryGrid.css('transition', 'transform 0.3s ease-in-out');
    }
  });

  function updateLightboxContent() {
    const { src, alt, caption } = currentGallery[currentIndex];
    lightboxImg.css('opacity', '0');
    setTimeout(() => {
      lightboxImg.attr({ src: src, alt: alt });
      lightboxCaption.text(caption);
      updateGalleryGrid(currentGallery);
      lightboxImg.css('opacity', '1');
    }, 150);
  }

  const showNextImage = () => {
    if (currentGallery.length) {
      currentIndex = (currentIndex + 1) % currentGallery.length;
      updateLightboxContent();
    }
  };

  const showPrevImage = () => {
    if (currentGallery.length) {
      currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      updateLightboxContent();
    }
  };

  closeBtn.on('click', closeLightbox);
  lightbox.on('click', function(e) {
    if (e.target === lightbox[0]) closeLightbox();
  });

  $(document).on('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') showNextImage();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') showPrevImage();
  });

  let lastWheel = 0;
  lightbox.on('wheel', e => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheel < 400) return;
    lastWheel = now;
    if (e.deltaY > 0) showNextImage();
    if (e.deltaY < 0) showPrevImage();
  }, { passive: false });

  galleryGrid.on('click', 'img', function() {
    currentIndex = parseInt($(this).data('index'), 10);
    updateLightboxContent();
  });

  lightboxImg.on('touchstart', e => { lbTouchStartX = e.touches[0].clientX; });
  lightboxImg.on('touchmove', e => { lbTouchEndX = e.touches[0].clientX; });
  lightboxImg.on('touchend', () => {
    if (lbTouchStartX - lbTouchEndX > 50) showNextImage();
    if (lbTouchEndX - lbTouchStartX > 50) showPrevImage();
  });

  /* ------------------------------
         GALLERY SLIDER SETUP
     ------------------------------ */
  $('.arabica_article-gallery-container').each(function() {
    const container = $(this);
    const isMobile = window.matchMedia('only screen and (max-width: 767px)').matches;
    const selector = isMobile ? 
      '.arabica_article-image-gallery, .arabica_article-mobile-gallery' : 
      '.arabica_article-image-gallery';

    const galleryItems = container.find(selector);
    if (!galleryItems.length) return;

    const slider = $('<div>').addClass('arabica_article_slider').css('position', 'relative');
    const sliderWrapper = $('<div>').addClass('arabica_article_slider_wrapper');

    galleryItems.each(function() { sliderWrapper.append(this); });
    slider.append(sliderWrapper);

    const prevBtn = $('<button>').addClass('arabica_article_slider-nav arabica_article_slider-prev').html(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#ffffff" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
      </svg>
    `);
    const nextBtn = $('<button>').addClass('arabica_article_slider-nav arabica_article_slider-next').html(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#ffffff" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
      </svg>
    `);
    const counter = $('<span>').addClass('arabica_article_slider-counter').html(
      `<i class="fa-regular fa-images"></i> 1 / ${galleryItems.length}`
    );

    slider.append(prevBtn, nextBtn, counter);
    container.html('').append(slider);

    let currentSlide = 0;
    let sliderWidth = slider.width();
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isHorizontalDrag = false;

    const setSliderPosition = () => {
      sliderWrapper.css('transform', `translateX(-${currentSlide * sliderWidth}px)`);
    };

    const updateSliderHeight = () => {
      const el = sliderWrapper.children().eq(currentSlide);
      if (el.length) slider.css('height', `${el[0].offsetHeight}px`);
    };

    const updateNavButtonsPosition = () => {
      const slideEl = sliderWrapper.children().eq(currentSlide);
      if (!slideEl.length) return;

      const imgEl = slideEl.find('img');
      if (imgEl.length) {
        const imgRect = imgEl[0].getBoundingClientRect();
        const sliderRect = slider[0].getBoundingClientRect();
        const centerY = imgRect.top - sliderRect.top + imgEl[0].offsetHeight / 2;
        prevBtn.css('top', `${centerY}px`);
        nextBtn.css('top', `${centerY}px`);
      }
    };

    const updateCounter = () => {
      counter.html(`<i class="fa-regular fa-images"></i> ${currentSlide + 1} / ${galleryItems.length}`);
      const slideEl = sliderWrapper.children().eq(currentSlide);
      const capEl = slideEl.find('figcaption');
      const gap = capEl.length ? capEl[0].offsetHeight + 10 : 10;
      counter.css('bottom', `${gap}px`);
    };

    const updateSliderLayout = () => {
      sliderWidth = slider.width();
      setSliderPosition();
      updateSliderHeight();
      updateNavButtonsPosition();
      updateCounter();
    };

    updateSliderLayout();
    $(window).on('resize', updateSliderLayout);

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % galleryItems.length;
      sliderWrapper.css('transition', 'transform 0.3s ease-in-out');
      setSliderPosition();
      updateSliderLayout();
    };

    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + galleryItems.length) % galleryItems.length;
      sliderWrapper.css('transition', 'transform 0.3s ease-in-out');
      setSliderPosition();
      updateSliderLayout();
    };

    nextBtn.on('click', nextSlide);
    prevBtn.on('click', prevSlide);

    sliderWrapper.on('touchstart', e => {
      isDragging = true;
      isHorizontalDrag = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      sliderWrapper.css('transition', 'none');
    });

    sliderWrapper.on('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!isHorizontalDrag) {
        if (Math.abs(dx) > Math.abs(dy)) isHorizontalDrag = true;
        else return;
      }
      sliderWrapper.css('transform', `translateX(-${currentSlide * sliderWidth - dx}px)`);
    });

    sliderWrapper.on('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (isHorizontalDrag) {
        if (dx < -50) nextSlide();
        else if (dx > 50) prevSlide();
        else setSliderPosition();
      } else {
        setSliderPosition();
      }
      sliderWrapper.css('transition', 'transform 0.3s ease-in-out');
    });

    sliderWrapper.find('a').each(function() {
      const link = $(this);
      const href = link.attr('href');
      if (/\.(jpe?g|png|gif|webp|svg)$/i.test(href)) {
        link.on('click', e => {
          e.preventDefault();
          const imgEl = link.find('img');
          const altText = imgEl.length ? imgEl.attr('alt') : '';
          const captionText = link.next('figcaption').length ? link.next('figcaption').text() : '';
          const gallery = container.find('a').map(function() {
            const a = $(this);
            return {
              src: a.attr('href'),
              alt: a.find('img').attr('alt') || '',
              caption: a.next('figcaption').length ? a.next('figcaption').text() : ''
            };
          }).get();
          openLightbox(href, altText, captionText, gallery);
        });
      }
    });
  });

  /* ------------------------------
     MOBILE GALLERY LIGHTBOX ON DESKTOP
     ------------------------------ */
  if (!window.matchMedia('only screen and (max-width: 767px)').matches) {
    $('.arabica_article-gallery-container .arabica_article-mobile-gallery a').each(function() {
      const link = $(this);
      const href = link.attr('href');
      if (/\.(jpe?g|png|gif|webp|svg)$/i.test(href)) {
        link.on('click', e => {
          e.preventDefault();
          const imgEl = link.find('img');
          const altText = imgEl.length ? imgEl.attr('alt') : '';
          const captionText = link.next('figcaption').length ? link.next('figcaption').text() : '';
          const containerEl = link.closest('.arabica_article-gallery-container');
          const gallery = containerEl.find('.arabica_article-mobile-gallery a').map(function() {
            const a = $(this);
            return {
              src: a.attr('href'),
              alt: a.find('img').attr('alt') || '',
              caption: a.next('figcaption').length ? a.next('figcaption').text() : ''
            };
          }).get();
          openLightbox(href, altText, captionText, gallery);
        });
      }
    });
  }

  /* ------------------------------
         SINGLE IMAGE SETUP
     ------------------------------ */
  $('.arabica_article-content a, .arabica_article-image a, .arabica_news-content a, .arabica_news-image a').each(function() {
    const anchor = $(this);
    const href = anchor.attr('href');
    if (/\.(jpe?g|png|gif|webp|svg)$/i.test(href) && !anchor.closest('.arabica_article-image-gallery, .arabica_article-mobile-gallery').length) {
      anchor.on('click', e => {
        e.preventDefault();
        const imgEl = anchor.find('img');
        const altText = imgEl.length ? imgEl.attr('alt') : '';
        const captionText = anchor.next('figcaption').length ? anchor.next('figcaption').text() : '';
        openLightbox(href, altText, captionText);
      });
    }
  });

  /* ------------------------------
         OBJECT-FIT ADJUSTMENT
     ------------------------------ */
  $('.arabica_article-image-gallery, .arabica_article-mobile-gallery').each(function() {
    const gallery = $(this);
    const img = gallery.find('img');
    if (img.length) {
      const galleryRatio = gallery.width() / gallery.height();
      const imageRatio = img[0].naturalWidth / img[0].naturalHeight;
      const lowerBound = galleryRatio * 0.85;
      const upperBound = galleryRatio * 1.15;
      if (imageRatio >= lowerBound && imageRatio <= upperBound) {
        img.css('object-fit', 'cover');
      } else {
        img.css('object-fit', 'contain');
      }
    }
  });

  /* ------------------------------
         MOBILE GALLERY NAV BUTTONS ON DESKTOP
     ------------------------------ */
  if (window.innerWidth >= 768) {
    $('.arabica_article-gallery-container').each(function() {
      const container = $(this);
      if (!container.find('.arabica_article-mobile-gallery').length) return;

      const wrapper = $('<div>').addClass('slider-container').css('position', 'relative');
      container.before(wrapper);
      wrapper.append(container);

      const prev = $('<button>').addClass('slider-btn prev hidden').attr('aria-label', 'Previous').css('position', 'absolute').html(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#ffffff" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
        </svg>
      `);
      const next = $('<button>').addClass('slider-btn next hidden').attr('aria-label', 'Next').css('position', 'absolute').html(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#ffffff" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
        </svg>
      `);

      wrapper.append(prev, next);

      const isRtl = container.css('direction') === 'rtl';
      if (isRtl) {
        prev.css('right', '8px');
        next.css('left', '8px');
      } else {
        prev.css('left', '8px');
        next.css('right', '8px');
      }

      const items = container.find('.arabica_article-mobile-gallery');
      const gap = parseInt(container.css('gap')) || 0;
      const step = () => items[0].getBoundingClientRect().width + gap;

      function updateButtons() {
        const raw = container[0].scrollLeft;
        const norm = isRtl ? -raw : raw;
        const max = container[0].scrollWidth - container.width();
        prev.toggleClass('visible', norm > 1).toggleClass('hidden', norm <= 1);
        next.toggleClass('visible', norm + 1 < max).toggleClass('hidden', norm + 1 >= max);
      }

      prev.on('click', () => {
        container[0].scrollBy({
          left: isRtl ? step() : -step(),
          behavior: 'smooth'
        });
      });

      next.on('click', () => {
        container[0].scrollBy({
          left: isRtl ? step() : step(),
          behavior: 'smooth'
        });
      });

      container.on('scroll', updateButtons);
      $(window).on('resize', updateButtons);

      const img = container.find('img');
      function positionButtons() {
        const imgRect = img[0].getBoundingClientRect();
        const wrapRect = wrapper[0].getBoundingClientRect();
        const centerY = imgRect.top - wrapRect.top + imgRect.height / 2;
        prev.css('top', `${centerY}px`);
        next.css('top', `${centerY}px`);
      }

      $(window).on('resize', positionButtons);
      container.on('scroll', positionButtons);
      positionButtons();
      updateButtons();
    });
  }
});