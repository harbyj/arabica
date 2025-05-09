$(function() {
  // Cache modal elements
  var $modal = $('#editorModal');
  var $closeBtn = $modal.find('.modal-close');
  var $body = $('body');

  // Editor fields in the modal
  var editorElements = {
    editorName:     $('#editorName'),
    editorRegion:   $('#editorRegion'),
    editorTitle:    $('#editorTitle'),
    editorField:    $('#editorField'),
    editorBio:      $('#editorBio'),
    editorImage:    $('#editorImage'),
    editorEmail:    $('#editorEmail'),
    separator:      $modal.find('.modal-separator')
  };

  // Utility: hide if empty, else show as displayType
  function hideIfEmpty($el, displayType) {
    if (!$el.length || $.trim($el.text()) === '') {
      $el.hide();
    } else {
      $el.css('display', displayType);
    }
  }

  // Show/hide separator between field and title
  function updateSeparator() {
    var hasField = $.trim(editorElements.editorField.text());
    var hasTitle = $.trim(editorElements.editorTitle.text());
    editorElements.separator.toggle( !!(hasField && hasTitle) );
  }

  // Click handler for each editor link
  $('.arabica_editor-link').on('click', function(e) {
    e.preventDefault();
    var $link    = $(this);
    var $info    = $link.find('.arabica_editor-info');

    // Helper to copy text content
    function updateContent($targetEl, selector, displayType) {
      var $src = $info.find(selector);
      if ($src.length && $.trim($src.text())) {
        $targetEl.text( $src.text() ).css('display', displayType);
      } else {
        $targetEl.empty().hide();
      }
    }

    updateContent(editorElements.editorName,   '.arabica_editor-name',     'block');
    updateContent(editorElements.editorRegion, '.arabica_editor-region',   'inline-block');
    updateContent(editorElements.editorTitle,  '.arabica_editor-job',      'inline-block');
    updateContent(editorElements.editorField,  '.arabica_editor-category', 'inline-block');

    // Bio (innerHTML)
    var $bioSrc = $info.find('.arabica_editor-bio');
    if ($bioSrc.length && $.trim($bioSrc.html())) {
      editorElements.editorBio.html( $bioSrc.html() ).css('display','inline-block');
    } else {
      editorElements.editorBio.empty().hide();
    }

    // Image
    var $imgSrc = $link.find('.arabica_editor-image');
    if ($imgSrc.length) {
      editorElements.editorImage.hide().attr('src','');
      setTimeout(function(){
        editorElements.editorImage
          .attr('src', $imgSrc.attr('src'))
          .attr('alt', editorElements.editorName.text() || $imgSrc.attr('alt') )
          .css('display','inline-block');
      }, 1);
    } else {
      editorElements.editorImage.hide();
    }

    // Email (inline-flex)
    var $emailSrc = $info.find('.arabica_editor-email');
    if ($emailSrc.length && $.trim($emailSrc.text())) {
      var email = $.trim($emailSrc.text());
      editorElements.editorEmail
        .attr('href','mailto:'+email)
        .html( email + ' <i class="fa-solid fa-envelope"></i>' )
        .css({
          'display':'inline-flex',
          'align-items':'center',
          'gap':'10px'
        });
    } else {
      editorElements.editorEmail
        .attr('href','#').empty().hide();
    }

    // Hide any other empty parts
    $.each(editorElements, function(key, $el) {
      if (key === 'separator') return;
      var dt = key === 'editorName' ? 'block'
               : key === 'editorEmail' ? 'inline-flex'
                 : 'inline-block';
      hideIfEmpty($el, dt);
    });

    updateSeparator();

    // Lock scroll & show
    $body.addClass('no-scroll');
    $modal.addClass('show');
  });

  // Close function
  function closeModal() {
    $modal.removeClass('show');
    $body.removeClass('no-scroll');
  }

  // Close triggers
  $closeBtn.on('click', closeModal);
  $(window).on('click', function(e){
    if ($(e.target).is($modal)) closeModal();
  }).on('keydown', function(e){
    if (e.key === 'Escape' && $modal.hasClass('show')) closeModal();
  });

  // On DOM ready: insert separators between category & job
  $('.arabica_editor-category').each(function(){
    var $field = $(this);
    var $title = $field.next('.arabica_editor-job');
    if ($title.length && $.trim($field.text()) && $.trim($title.text()))
    {
      $('<span class="editor-separator">|</span>')
        .insertAfter($field);
    }
  });
});
