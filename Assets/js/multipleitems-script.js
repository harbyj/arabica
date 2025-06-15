$(function() {
  //
  // 1) GRID / LIST LAYOUT TOGGLE
  //
  var $gridBtn    = $('.arabica_grid');
  var $listBtn    = $('.arabica_list');
  var $container  = $('.arabica_featured-content');
  var storageKey  = 'layoutPreference';

  // Apply saved preference
  var saved = localStorage.getItem(storageKey) || 'list';
  if (saved === 'grid') {
    $container.addClass('grid-posts');
    $gridBtn.addClass('active');
    $listBtn.removeClass('active');
  } else {
    $container.removeClass('grid-posts');
    $listBtn.addClass('active');
    $gridBtn.removeClass('active');
  }

  // Fade-out / fade-in switch
  function applyLayout(isGrid) {
    var isCurrentlyGrid = $container.hasClass('grid-posts');
    if ((isGrid && isCurrentlyGrid) || (!isGrid && !isCurrentlyGrid)) {
      return; // nothing to do
    }

    $container.addClass('fade-out');

    // after fade-out completes (timeout matches your CSS transition)
    setTimeout(function() {
      $container.removeClass('fade-out');

      if (isGrid) {
        $container.addClass('grid-posts');
        $gridBtn.addClass('active');
        $listBtn.removeClass('active');
        localStorage.setItem(storageKey, 'grid');
      } else {
        $container.removeClass('grid-posts');
        $listBtn.addClass('active');
        $gridBtn.removeClass('active');
        localStorage.setItem(storageKey, 'list');
      }

      // force reflow then fade in
      void $container[0].offsetWidth;
      $container.addClass('fade-in');

      // cleanup fade-in after its transition
      setTimeout(function() {
        $container.removeClass('fade-in');
      }, 0);
    }, 0);
  }

  $gridBtn.on('click', function(){ applyLayout(true); });
  $listBtn.on('click', function(){ applyLayout(false); });



  //
  // 2) DROPDOWN TOGGLE + “SELECT ALL” HANDLING
  //
  // Toggle a dropdown open/closed
  window.toggleDropdown = function(btn) {
    var $curr  = $(btn).closest('.arabica_dropdown');
    var $wrap  = $curr.find('.arabica_dropdown-content-wrapper');
    var $other = $('.arabica_dropdown').not($curr);

    // close all others
    $other.removeClass('active')
          .find('.arabica_dropdown-content-wrapper')
          .css('max-height', '');

    // toggle this one
    $curr.toggleClass('active');
    if ($curr.hasClass('active')) {
      $wrap.css('max-height', $wrap.prop('scrollHeight') + 'px');
    } else {
      $wrap.css('max-height', '');
    }
  };

  // “Select All” toggles every non-select-all checkbox
  function toggleSelectAll($allCheckbox) {
    var $cont = $allCheckbox.closest('.arabica_dropdown-content');
    var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
    var checked = $allCheckbox.prop('checked');
    var $labelAll = $allCheckbox.closest('label');

    $boxes.each(function() {
      var $cb = $(this),
          $lbl = $cb.closest('label');
      $cb.prop('checked', checked);
      $lbl.toggleClass('checked', checked);
    });

    $labelAll.toggleClass('checked', checked);
  }

  // Individual checkbox change → update its label + “select all” state
  function handleCheckboxChange() {
    var $cb    = $(this),
        $lbl   = $cb.closest('label'),
        $cont  = $cb.closest('.arabica_dropdown-content'),
        $allCB = $cont.find('.select-all input'),
        $allLbl= $allCB.closest('label'),
        $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');

    $lbl.toggleClass('checked', $cb.prop('checked'));

    // if every individual is checked → set select-all
    if ($boxes.length && $boxes.filter(':checked').length === $boxes.length) {
      $allCB.prop('checked', true);
      $allLbl.addClass('checked');
    } else {
      $allCB.prop('checked', false);
      $allLbl.removeClass('checked');
    }
  }

  // Init dropdowns on DOM ready
  $('.arabica_dropdown-content').each(function() {
    var $cont = $(this);
    var $allCB = $cont.find('.select-all input');
    var $allLbl= $allCB.closest('label');
    var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');

    // default: all checked
    $allCB.prop('checked', true);
    $allLbl.addClass('checked');

    $boxes.each(function() {
      var $cb  = $(this),
          $lbl = $cb.closest('label');
      $cb.prop('checked', true);
      $lbl.addClass('checked');
      $cb.on('change', handleCheckboxChange);
    });

    $allCB.on('click', function() {
      toggleSelectAll($(this));
    });
  });

  // clicking outside closes dropdown
  $(window).on('click', function(e) {
    if (!$(e.target).closest('.arabica_dropdown').length && !$(e.target).is('input[type="checkbox"]')) {
      $('.arabica_dropdown').removeClass('active');
    }
  });
});
