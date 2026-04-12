/* jshint esversion: 11 */
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
});

// Advanced Search Script - ES5 Compatible
$('#toggleAdvanced').on('click', function () {
    var $searchContainer = $(this).closest('.arabica_entries-search');
    var $advancedFields = $searchContainer.find('.advanced-fields');
    
    // Toggle 'expanded' class
    var isExpanded = $searchContainer.toggleClass('expanded').hasClass('expanded');
});

// Global variables
var selectedAuthor = null; // null means "All Authors" (default), "NONE" means no author selected
var allAuthors = []; // Will be populated from HTML

$(document).ready(function() {
    // Initialize all components
    initializeDropdowns();
    initializePageState();
    
    // Click outside to close dropdowns
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.arabica_dropdown, .arabica_author-box, .author-dropdown').length) {
            closeAllDropdowns();
        }
    });

    // ESC key to close dropdowns
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            closeAllDropdowns();
            // Remove focus from any focused elements
            $('.author-option').removeClass('highlighted');
        }
    });

    // Enter key to submit search from search input (WITHOUT showing arabica_search-reset)
    $('#txtSearch').on('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            performSearch(false); // Don't show button on Enter
        }
    });

    // Enter key to submit search from author input (WITHOUT showing arabica_search-reset)
    $('#txtAuthor').on('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            performSearch(false); // Don't show button on Enter
        }
    });

    // Enter key to submit search from sub category input (WITHOUT showing arabica_search-reset)
    $('#txtSubCategory').on('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            performSearch(false); // Don't show button on Enter
        }
    });

    // Input field icon toggle functionality
    setupInputIconToggle('#txtSearch', '.arabica_search-box i');
    setupInputIconToggle('#txtAuthor', '.arabica_author-box i');
    setupInputIconToggle('#txtSubCategory', '.arabica_subcategory-box i');
    
    // Add smooth transitions and animations
    $('.arabica_search-box input, .author-search-input').on('focus', function() {
        $(this).closest('.arabica_search-box, .arabica_author-box').addClass('focused');
    });

    $('.arabica_search-box input, .author-search-input').on('blur', function() {
        $(this).closest('.arabica_search-box, .arabica_author-box').removeClass('focused');
    });

    // Add hover effect for author options
    $(document).on('mouseenter', '.author-option', function() {
        $('.author-option').removeClass('highlighted');
        $(this).addClass('highlighted');
    });

    $(document).on('mouseleave', '.author-option', function() {
        $(this).removeClass('highlighted');
    });

    // Enhanced visual feedback for search button (ONLY show button on button click with 1 second delay)
    $('#searchBtn').on('click', function() {
        performSearch(true, 500); // Show button with 0.5 second delay
    });
});

function initializePageState() {
    var currentUrl = window.location.href;
    var urlParams = new URLSearchParams(window.location.search);
    
    // Check if we're on the all articles page with no search parameters
    var isAllArticlesPage = currentUrl.indexOf('/Pages/ArticleListing.aspx') !== -1;
    var hasUrlParams = urlParams.toString() !== '';
    
    // Initially hide arabica_search-reset - only show when search is made or URL has params
    if (!hasUrlParams) {
        $('.arabica_search-reset').css('display', 'none');
    } else {
        $('.arabica_search-reset').css('display', 'block');
    }
    
    // Handle author search (q parameter)
    var authorQuery = urlParams.get('q');
    if (authorQuery) {
        var authorName = decodeURIComponent(authorQuery);
        $('#txtAuthor').val(authorName);
        selectedAuthor = authorName;
        
        // Show clear icon immediately for author search pages
        var $authorIcon = $('.arabica_author-box i');
        $authorIcon.attr('class', 'fa-regular fa-times clear-icon').css('cursor', 'pointer');
    }
    
    // Handle category/country search (c parameter)
    var categoryQuery = urlParams.get('c');
    if (categoryQuery) {
        var categoryNames = decodeURIComponent(categoryQuery).split(',');
        
        // Check both knowledge fields and countries by label text
        categoryNames.forEach(function(queryName) {
            var trimmedQuery = queryName.trim();
            
            // Search in knowledge fields first
            var foundInFields = false;
            $('#knowledgeFieldsDropdown input[type="checkbox"]').not('.select-all input').each(function() {
                var $checkbox = $(this);
                var $label = $checkbox.next('label');
                if (!$label.length) {
                    $label = $('label[for="' + $checkbox.attr('id') + '"]');
                }
                if (!$label.length) {
                    $label = $checkbox.closest('label');
                }
                
                var labelText = $label.text().trim();
                if (labelText === trimmedQuery) {
                    $checkbox.prop('checked', true);
                    foundInFields = true;
                    return false; // break out of loop
                }
            });
            
            // If not found in fields, search in countries
            if (!foundInFields) {
                $('#arabCountriesDropdown input[type="checkbox"]').not('.select-all input').each(function() {
                    var $checkbox = $(this);
                    var $label = $checkbox.next('label');
                    if (!$label.length) {
                        $label = $('label[for="' + $checkbox.attr('id') + '"]');
                    }
                    if (!$label.length) {
                        $label = $checkbox.closest('label');
                    }
                    
                    var labelText = $label.text().trim();
                    if (labelText === trimmedQuery) {
                        $checkbox.prop('checked', true);                        return false; // break out of loop
                    }
                });
            }
        });
        
        // Update displays for both dropdowns
        updateSelectedItemsDisplay($('#knowledgeFieldsDropdown').closest('.arabica_search-input'));
        updateSelectedItemsDisplay($('#arabCountriesDropdown').closest('.arabica_search-input'));
    }

    // Handle sub category search (sc parameter)
    var subCategoryQuery = urlParams.get('sc');
    if (subCategoryQuery) {
        var subCategoryName = decodeURIComponent(subCategoryQuery);
        $('#txtSubCategory').val(subCategoryName);
        selectedSubCategory = subCategoryName;
    }

    // Update select-all checkboxes state after initialization
    initializeDropdowns();
}



function updateButtonSearchAllVisibility() {
    // Simple logic: 
    // 1. Hide on default article page with no URL params
    // 2. Show on search result pages (URL has params) 
    // 3. Show after search is submitted (#searchBtn clicked)
    
    var urlParams = new URLSearchParams(window.location.search);
    var hasUrlParams = urlParams.toString() !== '';
    
    if (hasUrlParams) {
        // On search result pages - always show
        $('.arabica_search-reset').css('display', 'block');
    } else {
        // On default page - only show after search is submitted
        // This will be handled in performSearch() function
        $('.arabica_search-reset').css('display', 'none');
    }
}

function closeAllDropdowns() {
    $('.arabica_dropdown').removeClass('active');
    $('.arabica_dropdown-content-wrapper').css('max-height', '');
    $('#authorDropdown').removeClass('show');
    $('.author-option').removeClass('highlighted');
}

function setupInputIconToggle(inputSelector, iconSelector) {
    var $input = $(inputSelector);
    var $icon = $(iconSelector);
    var originalIconClass = $icon.attr('class');

    $input.on('input', function() {
        var hasValue = $(this).val().trim().length > 0;
        if (hasValue) {
            $icon.attr('class', 'fa-regular fa-times clear-icon').css('cursor', 'pointer');
        } else {
            $icon.attr('class', originalIconClass).css('cursor', '');
        }
    });

    $icon.on('click', function() {
        if ($icon.hasClass('clear-icon')) {
            $input.val('').trigger('input');
            $input.focus();
            
            // Special handling for author search
            if (inputSelector === '#txtAuthor') {
                selectedAuthor = null;
            }

            // Special handling for sub category search
            if (inputSelector === '#txtSubCategory') {
                selectedSubCategory = null;
            }
        }
    });
}



function initializeDropdowns() {
    // Initialize all dropdowns - check current state from HTML and sync properly
    $('.arabica_dropdown-content').each(function() {
        var $cont = $(this);
        var $allCB = $cont.find('.select-all input');
        var $allLbl = $allCB.closest('label');
        var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');

        // Check current state from HTML
        var checkedCount = $boxes.filter(':checked').length;
        var totalCount = $boxes.length;
        
        // Sync the "Select All" checkbox based on individual checkboxes
        if (checkedCount === totalCount && totalCount > 0) {
            $allCB.prop('checked', true);
            $allLbl.addClass('checked');
        } else {
            $allCB.prop('checked', false);
            $allLbl.removeClass('checked');
        }

        // Add event handlers and sync label classes
        $boxes.each(function() {
            var $cb = $(this);
            var $lbl = $cb.closest('label');
            $lbl.toggleClass('checked', $cb.prop('checked'));
            $cb.off('change').on('change', handleCheckboxChange);
        });

        // Replace any existing onclick handler for select-all
        $allCB.off('click').on('click', function() {
            toggleSelectAll(this);
        });

        // Update display
        updateSelectedItemsDisplay($cont.closest('.arabica_search-input'));
    });
}

function toggleDropdown(btn) {
    var $curr = $(btn).closest('.arabica_dropdown');
    var $wrap = $curr.find('.arabica_dropdown-content-wrapper');
    var isCurrentlyActive = $curr.hasClass('active');

    // Close all dropdowns first
    closeAllDropdowns();

    // If this dropdown wasn't active, open it
    if (!isCurrentlyActive) {
        $curr.addClass('active');
        $wrap.css('max-height', $wrap.prop('scrollHeight') + 'px');
    }
}

// Fixed toggleSelectAll to handle DOM elements from HTML onclick
function toggleSelectAll(element) {
    // Handle both jQuery objects and DOM elements
    var $allCheckbox = element.jquery ? element : $(element);
    var $cont = $allCheckbox.closest('.arabica_dropdown-content');
    
    if ($cont.length === 0) {
        console.error('Could not find dropdown content container');
        return;
    }
    
    var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
    var checked = $allCheckbox.prop('checked');
    var $labelAll = $allCheckbox.closest('label');

    $boxes.each(function() {
        var $cb = $(this);
        var $lbl = $cb.closest('label');
        $cb.prop('checked', checked);
        $lbl.toggleClass('checked', checked);
    });

    $labelAll.toggleClass('checked', checked);
    
    // Update selected items display
    updateSelectedItemsDisplay($cont.closest('.arabica_search-input'));
}

function handleCheckboxChange() {
    var $cb = $(this);
    var $lbl = $cb.closest('label');
    var $cont = $cb.closest('.arabica_dropdown-content');
    var $allCB = $cont.find('.select-all input');
    var $allLbl = $allCB.closest('label');
    var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');

    // Add or remove 'checked' class based on checkbox state
    $lbl.toggleClass('checked', $cb.prop('checked'));

    // Update select-all state
    if ($boxes.length && $boxes.filter(':checked').length === $boxes.length) {
        $allCB.prop('checked', true);
        $allLbl.addClass('checked');
    } else {
        $allCB.prop('checked', false);
        $allLbl.removeClass('checked');
    }

    // Update selected items display
    updateSelectedItemsDisplay($cont.closest('.arabica_search-input'));
}

// Fixed updateSelectedItemsDisplay to show label text instead of values
function updateSelectedItemsDisplay($searchInput) {
    var $cont = $searchInput.find('.arabica_dropdown-content');
    var $selectedContainer = $searchInput.find('.selected-items');
    var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
    var $checkedBoxes = $boxes.filter(':checked');
    
    $selectedContainer.empty();

    if ($checkedBoxes.length === $boxes.length && $checkedBoxes.length > 0) {
        // All selected - show "all" indicator with remove button
        var $allItem = $('<span class="all-selected-indicator"></span>');
        var dropdownId = $searchInput.find('.arabica_dropdown').attr('id');
        var allText = 'كل البيانات محددة'; // Default text
        
        if (dropdownId === 'arabCountriesDropdown') {
            allText = 'كل البلدان';
        } else if (dropdownId === 'knowledgeFieldsDropdown') {
            allText = 'كل الحقول';
        }
        
        $allItem.html('<span>' + allText + '</span><span class="remove-btn" onclick="removeAllSelected(this)"><i class="fa-regular fa-times"></i></span>');
        $selectedContainer.append($allItem);
    } else if ($checkedBoxes.length > 0) {
        // Some selected - show individual items using LABEL TEXT instead of values
        $checkedBoxes.each(function() {
            var $checkbox = $(this);
            var value = $checkbox.val();
            // Get the label text - try different methods to find the label
            var labelText = '';
            var $label = $checkbox.next('label');
            if ($label.length) {
                labelText = $label.text().trim();
            } else {
                $label = $checkbox.siblings('label[for="' + $checkbox.attr('id') + '"]');
                if ($label.length) {
                    labelText = $label.text().trim();
                } else {
                    $label = $checkbox.closest('label');
                    if ($label.length) {
                        labelText = $label.text().trim();
                    }
                }
            }
            
            var displayText = labelText || value; // Fallback to value if no label found
            
            var $item = $('<span class="selected-item"></span>');
            $item.html('<span>' + displayText + '</span><span class="remove-btn" onclick="removeSelectedItem(this, \'' + value + '\')"><i class="fa-regular fa-times"></i></span>');
            $selectedContainer.append($item);
        });
    } else {
        // None selected - show empty state
        $selectedContainer.append('<span class="empty-selection" style="color: #6c757d;">لا توجد عناصر محددة</span>');
    }
}

// Fixed removeAllSelected to handle DOM elements
function removeAllSelected(btn) {
    var $btn = btn.jquery ? btn : $(btn);
    var $searchInput = $btn.closest('.arabica_search-input');
    var $cont = $searchInput.find('.arabica_dropdown-content');
    var $allCheckbox = $cont.find('.select-all input');
    var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
    
    // Uncheck all boxes
    $allCheckbox.prop('checked', false).closest('label').removeClass('checked');
    $boxes.each(function() {
        $(this).prop('checked', false).closest('label').removeClass('checked');
    });
    
    updateSelectedItemsDisplay($searchInput);
}

function removeSelectedItem(btn, value) {
    var $btn = btn.jquery ? btn : $(btn);
    var $searchInput = $btn.closest('.arabica_search-input');
    var $cont = $searchInput.find('.arabica_dropdown-content');
    var $checkbox = $cont.find('input[value="' + value + '"]');
    
    if ($checkbox.length) {
        $checkbox.prop('checked', false).trigger('change');
    }
}

// Main search function - collects parameters with optional button display and delay
// @param {boolean} showButton - Whether to show the arabica_search-reset (default: false)
// @param {number} delay - Delay in milliseconds before showing the button (default: 0)
function performSearch(showButton, delay) {
    // Default values
    showButton = showButton === undefined ? false : showButton;
    delay = delay === undefined ? 1 : delay;
    
    // Collect all search parameters
    var searchParams = getSearchParameters();
    
    // Only show arabica_search-reset if there's actually a search query and showButton is true
    var hasSearchQuery = (
        searchParams.keywords || 
        searchParams.shortEntriesOnly || 
        (searchParams.author && searchParams.author.length > 0) ||
        (searchParams.knowledgeFields && searchParams.knowledgeFields.length > 0) ||
        (searchParams.arabCountries && searchParams.arabCountries.length > 0)
    );
    
    if (showButton && hasSearchQuery) {
        setTimeout(function() {
            $('.arabica_search-reset').css('display', 'block');
        }, delay);
    }
    
    // This is where the backend developer will hook in their AJAX call
    console.log('Search Parameters:', searchParams);
    
    // The backend developer will call their AJAX function here
    // Example: backendSearch(searchParams);
}

// Function to get current search parameters - backend can call this
function getSearchParameters() {
    var keywords = $('#txtSearch').val().trim();
    var shortEntriesOnly = $('#chkIsMini').prop('checked');
    
    // Handle author - null means all authors (default behavior)
    var author = selectedAuthor ? [selectedAuthor] : [];
    
    var knowledgeFields = getSelectedValues('#knowledgeFieldsDropdown');
    var arabCountries = getSelectedValues('#arabCountriesDropdown');

    // Get all possible values for comparison
    var allKnowledgeFields = getAllDropdownValues('#knowledgeFieldsDropdown');
    var allCountries = getAllDropdownValues('#arabCountriesDropdown');

    return {
        keywords: keywords || null,
        shortEntriesOnly: shortEntriesOnly,
        author: author.length > 0 ? author : null,
        knowledgeFields: knowledgeFields.length === allKnowledgeFields.length ? null : knowledgeFields,
        arabCountries: arabCountries.length === allCountries.length ? null : arabCountries,
        // Include metadata for backend
        metadata: {
            allFieldsSelected: knowledgeFields.length === allKnowledgeFields.length,
            allCountriesSelected: arabCountries.length === allCountries.length,
            noFieldsSelected: knowledgeFields.length === 0,
            noCountriesSelected: arabCountries.length === 0
        }
    };
}

function getAllDropdownValues(dropdownSelector) {
    var $dropdown = $(dropdownSelector);
    if (!$dropdown.length) return []; // Return empty array if dropdown doesn't exist
    
    var $cont = $dropdown.find('.arabica_dropdown-content');
    var $allBoxes = $cont.find('input[type="checkbox"]').not('.select-all input');
    
    var values = [];
    $allBoxes.each(function() {
        var value = $(this).val() || $(this).closest('label').text().trim();
        values.push(value);
    });
    
    return values;
}

function getSelectedValues(dropdownSelector) {
    var $dropdown = $(dropdownSelector);
    if (!$dropdown.length) return []; // Return empty array if dropdown doesn't exist
    
    var $cont = $dropdown.find('.arabica_dropdown-content');
    var $checkedBoxes = $cont.find('input[type="checkbox"]:checked').not('.select-all input');
    
    var values = [];
    $checkedBoxes.each(function() {
        var value = $(this).val() || $(this).closest('label').text().trim();
        values.push(value);
    });
    
    return values;
}



// Global function for backend to call when search results are ready
window.onSearchResultsReady = function(results) {
    // Backend developer can add their result display logic here
    console.log('Search results received:', results);
};

// Global function to get current search state (for backend use)
window.getCurrentSearchState = function() {
    return getSearchParameters();
};

// Global function to programmatically set search parameters (for backend use)
window.setSearchParameters = function(params) {
    if (params.keywords !== undefined) {
        $('#txtSearch').val(params.keywords).trigger('input');
    }
    
    if (params.shortEntriesOnly !== undefined) {
        $('#chkIsMini').prop('checked', params.shortEntriesOnly);
    }
    
    if (params.author !== undefined) {
        selectedAuthor = params.author;
        $('#txtAuthor').val(params.author || '');
    }

    if (params.subCategory !== undefined) {
        selectedSubCategory = params.subCategory;
        $('#txtSubCategory').val(params.subCategory || '');
    }
    
    if (params.knowledgeFields !== undefined) {
        setDropdownSelections('#knowledgeFieldsDropdown', params.knowledgeFields);
    }
    
    if (params.arabCountries !== undefined) {
        setDropdownSelections('#arabCountriesDropdown', params.arabCountries);
    }
};

// Helper function to programmatically set dropdown selections
function setDropdownSelections(dropdownSelector, selectedValues) {
    var $dropdown = $(dropdownSelector);
    if (!$dropdown.length) return; // Exit if dropdown doesn't exist
    
    var $cont = $dropdown.find('.arabica_dropdown-content');
    var $allCheckbox = $cont.find('.select-all input');
    var $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
    
    if (!selectedValues || selectedValues.length === 0) {
        // No items selected - uncheck all
        $allCheckbox.prop('checked', false).closest('label').removeClass('checked');
        $boxes.each(function() {
            $(this).prop('checked', false).closest('label').removeClass('checked');
        });
    } else if (selectedValues === 'all') {
        // All items selected
        $allCheckbox.prop('checked', true).closest('label').addClass('checked');
        $boxes.each(function() {
            $(this).prop('checked', true).closest('label').addClass('checked');
        });
    } else {
        // Specific items selected
        $allCheckbox.prop('checked', false).closest('label').removeClass('checked');
        
        $boxes.each(function() {
            var $cb = $(this);
            var $lbl = $cb.closest('label');
            var value = $cb.val() || $lbl.text().trim();
            var isSelected = selectedValues.indexOf(value) !== -1;
            
            $cb.prop('checked', isSelected);
            $lbl.toggleClass('checked', isSelected);
        });
        
        // Check if all items are selected
        if ($boxes.filter(':checked').length === $boxes.length) {
            $allCheckbox.prop('checked', true).closest('label').addClass('checked');
        }
    }
    
    updateSelectedItemsDisplay($dropdown.closest('.arabica_search-input'));
}
 
(function () {
  var $win          = $(window),
      $doc          = $(document),
      $sidebar      = $(".arabica_right-column-25.arabica_sticky-sidebar"),
      $overlay      = $sidebar.find(".arabica_overlay"),
      $fitContainer = $(".arabica_left-column"),
      $search       = $overlay.find(".arabica_entries-search"),
      lastScrollY   = $win.scrollTop(),
      currentTrans  = 0,
      // start as null so first checkResponsive() always runs one branch
      isMobileLayout = null;

  function updateSidebarPosition() {
    if (isMobileLayout) {
      $sidebar.css("position", "static");
      $overlay.css("transform", "none");
      return;
    }
    var scrollY  = $win.scrollTop(),
        vpH      = $win.height(),
        overH    = $overlay.outerHeight(),
        maxTrans = overH - vpH,
        delta    = scrollY - lastScrollY;

    if (scrollY + vpH >= $doc.height() - 1) {
      currentTrans = maxTrans;
    } else if (delta > 0) {
      currentTrans = Math.min(currentTrans + delta, maxTrans);
    } else if (delta < 0) {
      currentTrans = Math.max(currentTrans + delta, 0);
    }

    $sidebar.css({
      position: "sticky",
      top:      "0px",
      height:   "fit-content"
    });
    $overlay.css({
      transform:     "translateY(-" + currentTrans + "px)",
      paddingBottom: "30px"
    });

    lastScrollY = scrollY;
  }

  function checkResponsive() {
    var nowMobile = $win.width() <= 991;
    if (nowMobile !== isMobileLayout) {
      if (nowMobile) {
        // → switched to mobile (or first load is mobile)
        if ($search.length) {
          $search.detach().insertBefore($fitContainer);
        }
        $sidebar.hide();
        $overlay.css("transform", "none");
      } else {
        // → switched to desktop (or first load is desktop)
        if ($search.length) {
          $search.detach().appendTo($overlay);
        }
        $sidebar.show();
        // reset scroll-tracking so sidebarPosition works right away
        lastScrollY   = $win.scrollTop();
        currentTrans  = 0;
      }
      isMobileLayout = nowMobile;
    }
  }

  // INITIAL RUN
  checkResponsive();
  updateSidebarPosition();

  // bind events
  $win.on("resize scroll", function () {
    checkResponsive();
    updateSidebarPosition();
  });
  $doc.ready(checkResponsive);
})();

$(function () {
  $(".arabica_entries-search").on("keydown", "input", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      $("#searchBtn").trigger("click"); // run your existing search logic
    }
  });
});

/*
// wait for SharePoint to load the select
function smallInit() {
    const selects = document.querySelectorAll(".arabica_pagination .page-dropdown");
    if (!selects.length) return setTimeout(smallInit, 300);

    selects.forEach(sel => {
        if (sel.dataset.done) return;
        sel.dataset.done = "1";

        const wrap = document.createElement("div");
        wrap.className = "custom-select-wrapper";
        sel.insertAdjacentElement("beforebegin", wrap);
        wrap.appendChild(sel);

        const disp = document.createElement("div");
        disp.className = "custom-select-display";
        disp.innerHTML = `<span class='value'>${sel.options[sel.selectedIndex].text}</span> ▾`;
        wrap.appendChild(disp);

        const box = document.createElement("div");
        box.className = "custom-options";
        wrap.appendChild(box);

        [...sel.options].forEach(o => {
            const d = document.createElement("div");
            d.textContent = o.text;
            d.onclick = () => {
                disp.querySelector(".value").textContent = o.text;
                sel.value = o.value;
                wrap.classList.remove("open");
                sel.dispatchEvent(new Event("change"));
            };
            box.appendChild(d);
        });

        disp.onclick = () => wrap.classList.toggle("open");
        document.addEventListener("click", e => {
            if (!wrap.contains(e.target)) wrap.classList.remove("open");
        });
    });
}

// run after page loads
setTimeout(smallInit, 500);

// auto-run whenever SharePoint loads new AJAX content
new MutationObserver(() => smallInit())
    .observe(document.body, { childList: true, subtree: true });
*/

$("#txtAuthor").autocomplete({
  appendTo: ".arabica_author-box"
});

$("#txtSubCategory").autocomplete({
  appendTo: ".arabica_subcategory-box"
});