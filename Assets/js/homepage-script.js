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
  // 2) “LOAD MORE” #1: featured-article, first 2 shown
  //
  var $load1       = $('#loadMoreBtn'),
      $arts1       = $('.arabica_featured-article'),
      $plus1       = $load1.find('.fa-plus'),
      $minus1      = $load1.find('.fa-minus'),
      $loading1    = $load1.find('.arabica_loading-icon'),
      expanded1    = false;

  // initial state
  $arts1.slice(2).addClass('hidden');
  $plus1.show();
  $minus1.hide();
  $loading1.hide();

  $load1.on('click', function(e) {
    e.preventDefault();
    $plus1.hide();
    $minus1.hide();
    $loading1.show();
    $load1.css('pointer-events','none');

    setTimeout(function() {
      if (!expanded1) {
        $arts1.slice(2).removeClass('hidden');
        $minus1.show();
      } else {
        $arts1.slice(2).addClass('hidden');
        $plus1.show();
      }
      $loading1.hide();
      $load1.css('pointer-events','auto');
      expanded1 = !expanded1;
    }, 0);
  });



  //
  // 3) “LOAD MORE” #2: short-article, first 6 shown
  //
  var $load2       = $('#loadMoreBtn2'),
      $arts2       = $('.arabica_short-article'),
      $plus2       = $load2.find('.fa-plus'),
      $minus2      = $load2.find('.fa-minus'),
      $loading2    = $load2.find('.arabica_loading-icon'),
      expanded2    = false;

  // initial state
  $arts2.each(function(i, el) {
    if (i >= 6) $(el).addClass('hidden').hide();
  });
  $plus2.show();
  $minus2.hide();
  $loading2.hide();

  function showArticle($art) {
    $art.show();
    // force reflow
    void $art[0].offsetWidth;
    $art.removeClass('hidden');
  }
  function hideArticle($art) {
    $art.addClass('hidden').one('transitionend', function() {
      if ($art.hasClass('hidden')) $art.hide();
    });
  }

  $load2.on('click', function(e) {
    e.preventDefault();
    $plus2.hide();
    $minus2.hide();
    $loading2.show();
    $load2.css('pointer-events','none');

    setTimeout(function() {
      if (!expanded2) {
        $arts2.slice(6).each(function(_, el) {
          showArticle($(el));
        });
        $minus2.show();
      } else {
        $arts2.slice(6).each(function(_, el) {
          hideArticle($(el));
        });
        $plus2.show();
      }
      $loading2.hide();
      $load2.css('pointer-events','auto');
      expanded2 = !expanded2;
    }, 0);
  });
});
$(document).ready(function() {
    $('.arabica_card-container')
        .find('br').remove().end()
        .html(function(i, html) {
            return html.replace(/&ZeroWidthSpace;|​|&nbsp;(?=\s*(<|$))/g, '');
        });
});