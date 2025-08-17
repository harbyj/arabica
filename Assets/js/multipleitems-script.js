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


$('#toggleAdvanced').on('click', function () {
  const $searchContainer = $(this).closest('.arabica_entries-search');
  const $advancedFields = $searchContainer.find('.advanced-fields');

  // Toggle 'expanded' class
  const isExpanded = $searchContainer.toggleClass('expanded').hasClass('expanded');
});



  
  let selectedAuthor = null; // null means "All Authors" (default), "NONE" means no author selected
        let allAuthors = []; // Will be populated from HTML

        $(document).ready(function() {
            // Initialize all components
            initializeAuthorSearch();
            initializeDropdowns();
            loadStateFromURL(); // Load previous selections from URL parameters
            
            // Click outside to close dropdowns
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.arabica_dropdown, .arabica_author-box, .author-dropdown').length) {
                    closeAllDropdowns();
                }
            });

            // ESC key to close dropdowns
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeAllDropdowns();
                    // Remove focus from any focused elements
                    $('.author-option').removeClass('highlighted');
                }
            });

            // Enter key to submit search from search input
            $('#searchKeywords').on('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch();
                }
            });

            // Input field icon toggle functionality
            setupInputIconToggle('#searchKeywords', '.arabica_search-box i');
            setupInputIconToggle('#authorSearch', '.arabica_author-box i');
        });

        function loadStateFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Load search keywords
            const keywords = urlParams.get('keywords');
            if (keywords) {
                $('#searchKeywords').val(keywords).trigger('input');
            }
            
            // Load short entries toggle
            const shortOnly = urlParams.get('short_only');
            if (shortOnly === 'true') {
                $('#shortEntriesOnly').prop('checked', true);
            }
            
            // Load selected author
            const author = urlParams.get('author');
            if (author) {
                const authorList = author.split(',');
                if (authorList.length === 1) {
                    selectedAuthor = authorList[0];
                    updateSelectedAuthorDisplay();
                }
            }
            
            // Load knowledge fields
            const knowledgeFields = urlParams.get('knowledge_fields');
            if (knowledgeFields !== null) {
                setDropdownSelections('#knowledgeFieldsDropdown', knowledgeFields);
            }
            
            // Load countries
            const countries = urlParams.get('countries');
            if (countries !== null) {
                setDropdownSelections('#arabCountriesDropdown', countries);
            }
        }

        function setDropdownSelections(dropdownSelector, selectedValues) {
            const $dropdown = $(dropdownSelector);
            const $cont = $dropdown.find('.arabica_dropdown-content');
            const $allCheckbox = $cont.find('.select-all input');
            const $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
            
            if (selectedValues === '') {
                // No items selected - uncheck all
                $allCheckbox.prop('checked', false).closest('label').removeClass('checked');
                $boxes.each(function() {
                    $(this).prop('checked', false).closest('label').removeClass('checked');
                });
            } else if (selectedValues) {
                // Specific items selected
                const valueArray = selectedValues.split(',');
                $allCheckbox.prop('checked', false).closest('label').removeClass('checked');
                
                $boxes.each(function() {
                    const $cb = $(this);
                    const $lbl = $cb.closest('label');
                    const value = $cb.val() || $lbl.text().trim();
                    const isSelected = valueArray.includes(value);
                    
                    $cb.prop('checked', isSelected);
                    $lbl.toggleClass('checked', isSelected);
                });
                
                // Check if all items are selected
                if ($boxes.filter(':checked').length === $boxes.length) {
                    $allCheckbox.prop('checked', true).closest('label').addClass('checked');
                }
            }
            // If selectedValues is null/undefined, keep default state (all selected)
            
            updateSelectedItemsDisplay($dropdown.closest('.arabica_search-input'));
        }

        function closeAllDropdowns() {
            $('.arabica_dropdown').removeClass('active');
            $('.arabica_dropdown-content-wrapper').css('max-height', '');
            $('#authorDropdown').removeClass('show');
            $('.author-option').removeClass('highlighted');
        }

        function setupInputIconToggle(inputSelector, iconSelector) {
            const $input = $(inputSelector);
            const $icon = $(iconSelector);
            const originalIconClass = $icon.attr('class');

            $input.on('input', function() {
                const hasValue = $(this).val().trim().length > 0;
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
                    if (inputSelector === '#authorSearch') {
                        $('#authorDropdown').removeClass('show');
                        showAllAuthorsInDropdown();
                    }
                }
            });
        }

        function initializeAuthorSearch() {
            const $authorSearch = $('#authorSearch');
            const $authorDropdown = $('#authorDropdown');
            const $authorDropdownContent = $('#authorDropdownContent');

            // Add "All Authors" option at the top if it doesn't exist
            if (!$authorDropdownContent.find('.all-author').length) {
                $authorDropdownContent.prepend('<div class="author-option all-author" data-value="">كل المؤلفين</div>');
            }

            // Get all author from HTML (excluding the "All Authors" option)
            allAuthors = [];
            $authorDropdownContent.find('.author-option').not('.all-author').each(function() {
                allAuthors.push($(this).data('value') || $(this).text().trim());
            });

            // Add click handlers to all author options
            $authorDropdownContent.find('.author-option').on('click', function() {
                const author = $(this).data('value') || $(this).text().trim();
                const isAllAuthors = $(this).hasClass('all-author');
                
                if (isAllAuthors) {
                    selectedAuthor = null; // null means "All Authors"
                } else {
                    selectedAuthor = author;
                }
                
                updateSelectedAuthorDisplay();
                $authorSearch.val('');
                $authorDropdown.removeClass('show');
                showAllAuthorsInDropdown();
            });

            // Click on input to open dropdown
            $authorSearch.on('click', function() {
                closeAllDropdowns();
                $authorDropdown.addClass('show');
            });

            // Search functionality
            $authorSearch.on('input', function() {
                const searchTerm = $(this).val().toLowerCase();
                filterAuthors(searchTerm);
                
                if (searchTerm.length > 0) {
                    closeAllDropdowns();
                    $authorDropdown.addClass('show');
                } else {
                    showAllAuthorsInDropdown();
                }
            });

            // Enhanced keyboard navigation
            $authorSearch.on('keydown', function(e) {
                const $dropdown = $('#authorDropdown');
                const $options = $dropdown.find('.author-option:visible');
                const $current = $options.filter('.highlighted');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!$dropdown.hasClass('show')) {
                        $dropdown.addClass('show');
                        return;
                    }
                    
                    if ($current.length === 0) {
                        $options.first().addClass('highlighted');
                    } else {
                        $current.removeClass('highlighted');
                        const nextIndex = $options.index($current) + 1;
                        if (nextIndex < $options.length) {
                            $options.eq(nextIndex).addClass('highlighted');
                        } else {
                            $options.first().addClass('highlighted');
                        }
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (!$dropdown.hasClass('show')) {
                        $dropdown.addClass('show');
                        return;
                    }
                    
                    if ($current.length === 0) {
                        $options.last().addClass('highlighted');
                    } else {
                        $current.removeClass('highlighted');
                        const prevIndex = $options.index($current) - 1;
                        if (prevIndex >= 0) {
                            $options.eq(prevIndex).addClass('highlighted');
                        } else {
                            $options.last().addClass('highlighted');
                        }
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if ($current.length > 0) {
                        $current.click();
                    } else {
                        // If no option is highlighted, perform search
                        performSearch();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeAllDropdowns();
                    $(this).blur();
                }
            });

            function filterAuthors(searchTerm) {
                $authorDropdownContent.find('.author-option').each(function() {
                    const $option = $(this);
                    const authorName = $option.data('value') || $option.text().trim();
                    const matchesSearch = authorName.toLowerCase().includes(searchTerm);
                    const isAllAuthors = $option.hasClass('all-author');
                    const isSelected = (selectedAuthor === authorName) || (selectedAuthor === null && isAllAuthors);
                    
                    if ((matchesSearch || isAllAuthors)) {
                        $option.show();
                        
                        if (isSelected) {
                            $option.addClass('selected');
                        } else {
                            $option.removeClass('selected');
                        }
                    } else {
                        $option.hide();
                        $option.removeClass('selected');
                    }
                });

                // Show "no results" message if no visible options
                const visibleOptions = $authorDropdownContent.find('.author-option:visible');
                let $noResults = $authorDropdownContent.find('.no-results');
                
                if (visibleOptions.length === 0 && searchTerm.length > 0) {
                    if ($noResults.length === 0) {
                        $authorDropdownContent.append('<div class="no-results author-option" style="color: #6c757d;">لا توجد نتائج</div>');
                        $noResults = $authorDropdownContent.find('.no-results');
                    }
                    $noResults.show();
                } else {
                    $noResults.hide();
                }
            }

            function showAllAuthorsInDropdown() {
                $authorDropdownContent.find('.author-option').each(function() {
                    const $option = $(this);
                    const authorName = $option.data('value') || $option.text().trim();
                    const isAllAuthors = $option.hasClass('all-author');
                    const isSelected = (selectedAuthor === authorName) || (selectedAuthor === null && isAllAuthors);
                    
                    $option.show();
                    
                    if (isSelected) {
                        $option.addClass('selected');
                    } else {
                        $option.removeClass('selected');
                    }
                });
                $authorDropdownContent.find('.no-results').hide();
            }

            // Initialize display
            updateSelectedAuthorDisplay();
            showAllAuthorsInDropdown();
        }

        function updateSelectedAuthorDisplay() {
            const $container = $('#selectedAuthors');
            $container.empty();

            if (selectedAuthor === "NONE") {
                // Show empty state - no author selected
                $container.append('<span class="empty-selection" style="color: #6c757d;">لم يتم اختيار أي مؤلف</span>');
            } else if (selectedAuthor) {
                // Show selected author with remove button
                const $item = $('<span class="selected-item"></span>');
                $item.html(`
                    <span>${selectedAuthor}</span>
                    <span class="remove-btn" onclick="removeAuthor()">
                        <i class="fa-regular fa-times"></i>
                    </span>
                `);
                $container.append($item);
            } else {
                // Show "All Authors" indicator with remove button
                const $item = $('<span class="all-selected-indicator"></span>');
                $item.html(`
                    <span>كل المؤلفين</span>
                    <span class="remove-btn" onclick="removeAuthor()">
                        <i class="fa-regular fa-times"></i>
                    </span>
                `);
                $container.append($item);
            }
        }

        function removeAuthor() {
            if (selectedAuthor === null) {
                // Currently "All Authors", change to "No Authors"
                selectedAuthor = "NONE";
            } else if (selectedAuthor === "NONE") {
                // Currently "No Authors", change back to "All Authors"
                selectedAuthor = null;
            } else {
                // Currently specific author, reset to "All Authors"
                selectedAuthor = null;
            }
            updateSelectedAuthorDisplay();
            showAllAuthorsInDropdown();
        }

        function initializeDropdowns() {
            // Initialize all dropdowns with default state (all selected)
            $('.arabica_dropdown-content').each(function() {
                const $cont = $(this);
                const $allCB = $cont.find('.select-all input');
                const $allLbl = $allCB.closest('label');
                const $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');

                // Set all as checked by default
                $allCB.prop('checked', true);
                $allLbl.addClass('checked');

                $boxes.each(function() {
                    const $cb = $(this);
                    const $lbl = $cb.closest('label');
                    $cb.prop('checked', true);
                    $lbl.addClass('checked');
                    $cb.on('change', handleCheckboxChange);
                });

                $allCB.on('click', function() {
                    toggleSelectAll($(this));
                });

                // Update display
                updateSelectedItemsDisplay($cont.closest('.arabica_search-input'));
            });
        }

        function toggleDropdown(btn) {
            const $curr = $(btn).closest('.arabica_dropdown');
            const $wrap = $curr.find('.arabica_dropdown-content-wrapper');
            const isCurrentlyActive = $curr.hasClass('active');

            // Close all dropdowns first
            closeAllDropdowns();

            // If this dropdown wasn't active, open it
            if (!isCurrentlyActive) {
                $curr.addClass('active');
                $wrap.css('max-height', $wrap.prop('scrollHeight') + 'px');
            }
        }

        function toggleSelectAll($allCheckbox) {
            const $cont = $allCheckbox.closest('.arabica_dropdown-content');
            const $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
            const checked = $allCheckbox.prop('checked');
            const $labelAll = $allCheckbox.closest('label');

            $boxes.each(function() {
                const $cb = $(this);
                const $lbl = $cb.closest('label');
                $cb.prop('checked', checked);
                $lbl.toggleClass('checked', checked);
            });

            $labelAll.toggleClass('checked', checked);
            
            // Update selected items display
            updateSelectedItemsDisplay($cont.closest('.arabica_search-input'));
        }

        function handleCheckboxChange() {
            const $cb = $(this);
            const $lbl = $cb.closest('label');
            const $cont = $cb.closest('.arabica_dropdown-content');
            const $allCB = $cont.find('.select-all input');
            const $allLbl = $allCB.closest('label');
            const $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');

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

        function updateSelectedItemsDisplay($searchInput) {
            const $cont = $searchInput.find('.arabica_dropdown-content');
            const $selectedContainer = $searchInput.find('.selected-items');
            const $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
            const $checkedBoxes = $boxes.filter(':checked');
            
            $selectedContainer.empty();

            if ($checkedBoxes.length === $boxes.length) {
                // All selected - show "all" indicator with remove button
                const $allItem = $('<span class="all-selected-indicator"></span>');
                const dropdownId = $searchInput.find('.arabica_dropdown').attr('id');
                let allText = 'كل البيانات محددة'; // Default text
                
                if (dropdownId === 'arabCountriesDropdown') {
                    allText = 'كل البلدان';
                } else if (dropdownId === 'knowledgeFieldsDropdown') {
                    allText = 'كل الحقول';
                }
                
                $allItem.html(`
                    <span>${allText}</span>
                    <span class="remove-btn" onclick="removeAllSelected(this)">
                        <i class="fa-regular fa-times"></i>
                    </span>
                `);
                $selectedContainer.append($allItem);
            } else if ($checkedBoxes.length > 0) {
                // Some selected - show individual items
                $checkedBoxes.each(function() {
                    const value = $(this).val() || $(this).closest('label').text().trim();
                    const $item = $('<span class="selected-item"></span>');
                    $item.html(`
                        <span>${value}</span>
                        <span class="remove-btn" onclick="removeSelectedItem(this, '${value}')">
                            <i class="fa-regular fa-times"></i>
                        </span>
                    `);
                    $selectedContainer.append($item);
                });
            } else {
                // None selected - show empty state
                $selectedContainer.append('<span class="empty-selection" style="color: #6c757d;">لا توجد عناصر محددة</span>');
            }
        }

        function removeAllSelected(btn) {
            const $btn = $(btn);
            const $searchInput = $btn.closest('.arabica_search-input');
            const $cont = $searchInput.find('.arabica_dropdown-content');
            const $allCheckbox = $cont.find('.select-all input');
            const $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');
            
            // Uncheck all boxes
            $allCheckbox.prop('checked', false).closest('label').removeClass('checked');
            $boxes.each(function() {
                $(this).prop('checked', false).closest('label').removeClass('checked');
            });
            
            updateSelectedItemsDisplay($searchInput);
        }

        function removeSelectedItem(btn, value) {
            const $btn = $(btn);
            const $searchInput = $btn.closest('.arabica_search-input');
            const $cont = $searchInput.find('.arabica_dropdown-content');
            const $checkbox = $cont.find(`input[value="${value}"]`);
            
            if ($checkbox.length) {
                $checkbox.prop('checked', false).trigger('change');
            }
        }

        function resetAllFields() {
            // Reset search keywords
            $('#searchKeywords').val('').trigger('input');
            
            // Reset short entries toggle
            $('#shortEntriesOnly').prop('checked', false);
            
            // Reset selected author to default (All Authors)
            selectedAuthor = null;
            $('#authorSearch').val('').trigger('input');
            $('#authorDropdown').removeClass('show');
            updateSelectedAuthorDisplay();
            
            // Reset all dropdowns to default (all selected)
            $('.arabica_dropdown-content').each(function() {
                const $cont = $(this);
                const $allCB = $cont.find('.select-all input');
                const $allLbl = $allCB.closest('label');
                const $boxes = $cont.find('input[type="checkbox"]').not('.select-all input');

                // Set all as checked (default state)
                $allCB.prop('checked', true);
                $allLbl.addClass('checked');

                $boxes.each(function() {
                    const $cb = $(this);
                    const $lbl = $cb.closest('label');
                    $cb.prop('checked', true);
                    $lbl.addClass('checked');
                });

                // Update display
                updateSelectedItemsDisplay($cont.closest('.arabica_search-input'));
            });

            // Close all dropdowns
            closeAllDropdowns();
        }

        function performSearch() {
            // Collect all search parameters
            const keywords = $('#searchKeywords').val().trim();
            const shortEntriesOnly = $('#shortEntriesOnly').prop('checked');
            
            // Handle author - null means all author (default behavior)
            const author = selectedAuthor ? [selectedAuthor] : [];
            
            const knowledgeFields = getSelectedValues('#knowledgeFieldsDropdown');
            const arabCountries = getSelectedValues('#arabCountriesDropdown');

            // Get all possible values for comparison
            const allKnowledgeFields = getAllDropdownValues('#knowledgeFieldsDropdown');
            const allCountries = getAllDropdownValues('#arabCountriesDropdown');

            // Create URL parameters
            const params = new URLSearchParams();
            
            // Add parameters only if they have values
            if (keywords) {
                params.append('keywords', keywords);
            }
            
            if (shortEntriesOnly) {
                params.append('short_only', 'true');
            }
            
            // Only add author parameter if a specific author is selected (not "All Authors")
            if (author.length > 0) {
                params.append('author', author.join(','));
            }
            
            // Handle knowledge fields
            if (knowledgeFields.length === 0) {
                // No fields selected - this will show no results
                params.append('knowledge_fields', '');
            } else if (knowledgeFields.length < allKnowledgeFields.length) {
                // Some fields selected - add them to params
                params.append('knowledge_fields', knowledgeFields.join(','));
            }
            // If all fields selected, don't add parameter (default behavior)
            
            // Handle countries
            if (arabCountries.length === 0) {
                // No countries selected - this will show no results
                params.append('countries', '');
            } else if (arabCountries.length < allCountries.length) {
                // Some countries selected - add them to params
                params.append('countries', arabCountries.join(','));
            }
            // If all countries selected, don't add parameter (default behavior)

            // Navigate to search results page
            const searchUrl = `entries.html${params.toString() ? '?' + params.toString() : ''}`;
            
            // Add loading state to button
            const $btn = $('.arabica_featured-article-button');
            $btn.addClass('loading');
            
            // Small delay to show loading animation, then navigate
            setTimeout(() => {
                window.location.href = searchUrl;
            }, 500);
        }

        function getAllDropdownValues(dropdownSelector) {
            const $dropdown = $(dropdownSelector);
            const $cont = $dropdown.find('.arabica_dropdown-content');
            const $allBoxes = $cont.find('input[type="checkbox"]').not('.select-all input');
            
            const values = [];
            $allBoxes.each(function() {
                const value = $(this).val() || $(this).closest('label').text().trim();
                values.push(value);
            });
            
            return values;
        }

        function getSelectedValues(dropdownSelector) {
            const $dropdown = $(dropdownSelector);
            const $cont = $dropdown.find('.arabica_dropdown-content');
            const $checkedBoxes = $cont.find('input[type="checkbox"]:checked').not('.select-all input');
            
            const values = [];
            $checkedBoxes.each(function() {
                const value = $(this).val() || $(this).closest('label').text().trim();
                values.push(value);
            });
            
            return values;
        }

        // Function to populate search results header
        function populateSearchResultsHeader() {
            const $searchHead = $('.arabica_search-head');
            if ($searchHead.length === 0) return; // Exit if search head doesn't exist on this page
            
            const urlParams = new URLSearchParams(window.location.search);
            
            // Check if there are any actual search parameters that would change the display
            const hasSearchParams = checkForActiveSearchParams(urlParams);
            
            // If no active search parameters, keep the default content
            if (!hasSearchParams) {
                return; // Keep the default HTML content as is
            }
            
            // Clear existing content and rebuild with search results format
            $searchHead.empty();
            
            // Add the search results title
            $searchHead.append('<span class="arabica_search-title">نتائج البحث في: </span>');
            
            // Add search query if present
            const keywords = urlParams.get('keywords');
            if (keywords && keywords.trim()) {
                $searchHead.append(`<span class="arabica_search-query">${keywords}</span>`);
            }
            
            // Add short entries indicator if enabled
            const shortOnly = urlParams.get('short_only');
            if (shortOnly === 'true') {
                $searchHead.append(`<span class="arabica_search-query short-entries">المداخل القصيرة فقط</span>`);
            }
            
            // Add author if specific author is selected
            const author = urlParams.get('author');
            if (author && author.trim()) {
                const authorList = author.split(',');
                authorList.forEach(author => {
                    if (author.trim()) {
                        $searchHead.append(`<span class="arabica_search-author"><i class="fa-regular fa-user-pen"></i> ${author.trim()}</span>`);
                    }
                });
            }
            
            // Add knowledge fields if specific ones are selected (not all or none)
            const knowledgeFields = urlParams.get('knowledge_fields');
            if (knowledgeFields !== null && knowledgeFields.trim() !== '') {
                const fieldList = knowledgeFields.split(',');
                fieldList.forEach(field => {
                    if (field.trim()) {
                        $searchHead.append(`<span class="arabica_search-category">${field.trim()}</span>`);
                    }
                });
            }
            
            // Add countries if specific ones are selected (not all or none)
            const countries = urlParams.get('countries');
            if (countries !== null && countries.trim() !== '') {
                const countryList = countries.split(',');
                countryList.forEach(country => {
                    if (country.trim()) {
                        $searchHead.append(`<span class="arabica_search-country">${country.trim()}</span>`);
                    }
                });
            }
        }

        // Function to check if there are any active search parameters that should trigger search results display
        function checkForActiveSearchParams(urlParams) {
            // Check for search keywords
            const keywords = urlParams.get('keywords');
            if (keywords && keywords.trim()) {
                return true;
            }
            
            // Check for short entries toggle
            const shortOnly = urlParams.get('short_only');
            if (shortOnly === 'true') {
                return true;
            }
            
            // Check for specific author selection
            const author = urlParams.get('author');
            if (author && author.trim()) {
                return true;
            }
            
            // Check for specific knowledge fields selection (not all, not none)
            const knowledgeFields = urlParams.get('knowledge_fields');
            if (knowledgeFields !== null && knowledgeFields.trim() !== '') {
                return true;
            }
            
            // Check for specific countries selection (not all, not none)
            const countries = urlParams.get('countries');
            if (countries !== null && countries.trim() !== '') {
                return true;
            }
            
            // Special case: if knowledge_fields or countries is empty string, it means "none selected"
            // This is also an active search that should show search results
            if (knowledgeFields === '' || countries === '') {
                return true;
            }
            
            return false; // No active search parameters found
        }

        // Additional utility functions for enhanced UX
        $(document).ready(function() {
            // Populate search results header on page load
            populateSearchResultsHeader();
            
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

            // Enhanced visual feedback
            $('.arabica_featured-article-button').on('click', function() {
                const $btn = $(this);
                $btn.addClass('loading');
                setTimeout(() => {
                    $btn.removeClass('loading');
                }, 1000);
            });
        });

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
