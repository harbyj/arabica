$(function() {
  //
  // 1) SLIDER WITH AUTO-SLIDE, MANUAL BUTTONS & SWIPES
  //
  var $slides          = $('.arabica_slide'),
      $btnContainer    = $('.arabica_slider-buttons'),
      currentSlide     = 0,
      autoSlideTimer,
      isPageVisible    = true,
      $slider          = $('.arabica_slider');

  // build buttons
  $btnContainer.empty();
  $slides.each(function(i) {
    $('<button type="button">')
      .attr('data-slide', i)
      .toggleClass('active', i === 0)
      .appendTo($btnContainer);
  });
  var $buttons = $btnContainer.find('button');

  function showSlide(idx) {
    $slides.toggleClass('active', false)
           .eq(idx).addClass('active');
    $buttons.toggleClass('active', false)
            .eq(idx).addClass('active');
  }
  function nextSlide() {
    currentSlide = (currentSlide + 1) % $slides.length;
    showSlide(currentSlide);
  }
  function startAuto() {
    stopAuto();
    autoSlideTimer = setInterval(nextSlide, 10000);
  }
  function stopAuto() {
    clearInterval(autoSlideTimer);
  }
  function resetAuto() {
    stopAuto();
    startAuto();
  }

  // nav-button click
  $buttons.on('click', function() {
    currentSlide = +$(this).data('slide');
    showSlide(currentSlide);
    resetAuto();
  });

  // swipe handling
  var touchStartX = 0, touchEndX = 0;
  $slider.on('touchstart', function(e) {
    touchStartX = e.originalEvent.touches[0].clientX;
  }).on('touchend', function(e) {
    touchEndX = e.originalEvent.changedTouches[0].clientX;
    var dist = touchEndX - touchStartX;
    if      (dist > 50)  currentSlide = (currentSlide - 1 + $slides.length) % $slides.length;
    else if (dist < -50) currentSlide = (currentSlide + 1) % $slides.length;
    showSlide(currentSlide);
    resetAuto();
  });

  // pause when tab hidden
  $(document).on('visibilitychange', function() {
    if (document.hidden) stopAuto();
    else               startAuto();
  });

  // init
  showSlide(currentSlide);
  startAuto();



  //
  // 2) "LOAD MORE" #1: featured-article - SIMPLE SHOW/HIDE
  //
  var $load1       = $('#loadMoreBtn'),
      $arts1       = $('.arabica_featured-article'),
      $plus1       = $load1.find('.fa-plus'),
      $minus1      = $load1.find('.fa-minus'),
      $loading1    = $load1.find('.arabica_loading-icon'),
      expanded1    = false;

  // Initial state - hide articles 2+
  $arts1.each(function(i, el) {
    if (i >= 2) $(el).hide();
  });
  $plus1.show();
  $minus1.hide();
  $loading1.hide();

  $load1.on('click', function(e) {
    e.preventDefault();
    
    const $hiddenArts = $arts1.slice(2);
    
    if (!expanded1) {
      $hiddenArts.show();
      $plus1.hide();
      $minus1.show();
    } else {
      $hiddenArts.hide();
      $minus1.hide();
      $plus1.show();
    }
    
    expanded1 = !expanded1;
  });



  //
  // 3) "LOAD MORE" #2: short-article - SIMPLE SHOW/HIDE
  //
  var $load2       = $('#loadMoreBtn2'),
      $arts2       = $('.arabica_short-article'),
      $plus2       = $load2.find('.fa-plus'),
      $minus2      = $load2.find('.fa-minus'),
      $loading2    = $load2.find('.arabica_loading-icon'),
      expanded2    = false;

  // Check if elements exist
  if ($load2.length && $arts2.length) {
    // Initial state - hide articles 6+
    $arts2.each(function(i, el) {
      if (i >= 6) $(el).hide();
    });
    $plus2.show();
    $minus2.hide();
    $loading2.hide();

    $load2.on('click', function(e) {
      e.preventDefault();
      
      const $hiddenArts2 = $arts2.slice(6);
      
      if (!expanded2) {
        $hiddenArts2.show();
        $plus2.hide();
        $minus2.show();
      } else {
        $hiddenArts2.hide();
        $minus2.hide();
        $plus2.show();
      }
      
      expanded2 = !expanded2;
    });
  }
});

$(document).ready(function() {
    $('.arabica_card-container')
        .find('br').remove().end()
        .html(function(i, html) {
            return html.replace(/&ZeroWidthSpace;|​|&nbsp;(?=\s*(<|$))/g, '');
        });
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isSafari) {
    var $el = $('.arabica_latest-article-image');
    $el.css('height', '64px');

    // remove it immediately after render
    setTimeout(function () {
      $el.css('height', '');
    }, 0);
  }
});