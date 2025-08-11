$(function() {
  // Cache elements
  var $menuToggle    = $('#menuToggle');
  var $menuClose     = $('#menuClose');
  var $mobileNav     = $('#mobileNav');
  var $body          = $('body');
  var $navMenu       = $('#navMenu ul');
  var $mobileNavList = $('.arabica_mobile_nav_list');
  var $shareLinks    = $('.arabica_share-link');

  // Show mobile nav
  $menuToggle.on('click', function() {
    $mobileNav
      .removeClass('hidden')
      .addClass('visible');
    $body.addClass('no-scroll');
  });

  // Hide mobile nav
  $menuClose.on('click', function() {
    $mobileNav
      .removeClass('visible')
      .addClass('hidden');
    $body.removeClass('no-scroll');
  });

  // Clone desktop <ul> into mobile nav
  if ($navMenu.length && $mobileNavList.length) {
    $mobileNavList.append( $navMenu.clone() );
  }

  // Native share dialog
  $shareLinks.on('click', function(e) {
    e.preventDefault();
    var $link = $(this);
    var shareData = {
      title: $link.data('share-title'),
      url:   $link.data('share-url')
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(function(){ console.log('Share was successful.'); })
        .catch(function(err){ console.log('Sharing failed', err); });
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  });

  // Smooth in-page anchor scrolling
  $(document).on('click', 'a[href^="#"]', function(e) {
    var href = $(this).attr('href');
    var targetId = href.slice(1);
    if (!targetId) return; // just "#" or empty

    var $target = $('#' + targetId);
    if (!$target.length) {
      $target = $('[name="' + targetId + '"]').first();
    }
    if ($target.length) {
      e.preventDefault();
      var offset = 20; // adjust if you have fixed headers
      var pos = $target.offset().top - offset;
      $('html, body').animate({ scrollTop: pos }, 400);
    }
  });
});