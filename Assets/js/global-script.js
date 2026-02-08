/* jshint esversion: 11 */
$(function(){var $menuToggle=$('#menuToggle');var $menuClose=$('#menuClose');var $mobileNav=$('#mobileNav');var $body=$('body');var $navMenu=$('#navMenu > ul');var $mobileNavList=$('.arabica_mobile_nav_list');var $shareLinks=$('.arabica_share-link');$menuToggle.on('click',function(){$mobileNav.removeClass('hidden').addClass('visible');$body.addClass('no-scroll');});$menuClose.on('click',function(){$mobileNav.removeClass('visible').addClass('hidden');$body.removeClass('no-scroll');});if($navMenu.length&&$mobileNavList.length){$mobileNavList.empty();$mobileNavList.append($navMenu.clone());}
$shareLinks.on('click',function(e){e.preventDefault();var $link=$(this);var shareData={title:$link.data('share-title'),url:$link.data('share-url')};if(navigator.share){navigator.share(shareData).then(function(){console.log('Share was successful.');}).catch(function(err){console.log('Sharing failed',err);});}else{alert('Web Share API is not supported in your browser.');}});
$(document).on("click",'a[href^="#"]',function(t){var e=$(this).attr("href");if("#"!==e&&""!==e){var n=e.substring(1),a=$(e);a.length||(a=$('[name="'+n+'"]')),a.length&&(t.preventDefault(),$("html, body").animate({scrollTop:a.offset().top-96},400))}});});document.addEventListener("DOMContentLoaded",()=>{const header=document.querySelector(".header");const sidebar=document.querySelector(".arabica_sticky-sidebar");let lastScrollY=window.scrollY;let ticking=!1;let stopTimer=null;let isHeaderHovered=!1;const HIDE_DELAY=1000;const updateSidebarOffset=()=>{if(!sidebar)return;const isHeaderHidden=header.classList.contains("hidden");const offset=isHeaderHidden?"0":`${header.offsetHeight}px`;sidebar.style.setProperty("--sidebar-offset",offset);};const updateHeader=()=>{const currentY=window.scrollY;if(currentY>50)header.classList.add("scrolled");else header.classList.remove("scrolled");header.classList.remove("hidden");updateSidebarOffset();clearTimeout(stopTimer);stopTimer=setTimeout(()=>{if(window.scrollY>100&&!isHeaderHovered){header.classList.add("hidden");updateSidebarOffset();}},HIDE_DELAY);lastScrollY=currentY;ticking=!1;};window.addEventListener("scroll",()=>{if(!ticking){window.requestAnimationFrame(updateHeader);ticking=!0;}});header.addEventListener("mouseenter",()=>{isHeaderHovered=!0;header.classList.remove("hidden");updateSidebarOffset();clearTimeout(stopTimer);});header.addEventListener("mouseleave",()=>{isHeaderHovered=!1;clearTimeout(stopTimer);stopTimer=setTimeout(()=>{if(window.scrollY>100&&!isHeaderHovered){header.classList.add("hidden");updateSidebarOffset();}},HIDE_DELAY);});});document.addEventListener('DOMContentLoaded',function(){const submenuToggles=document.querySelectorAll('.submenu-toggle');submenuToggles.forEach(toggle=>{const parentLi=toggle.closest('.has-submenu');const submenu=parentLi.querySelector('.submenu');parentLi.addEventListener('mouseenter',function(){submenu.classList.add('active');toggle.classList.add('active');});parentLi.addEventListener('mouseleave',function(){submenu.classList.remove('active');toggle.classList.remove('active');});});const menuToggle=document.getElementById('menuToggle');const navMenu=document.getElementById('navMenu');if(menuToggle){menuToggle.addEventListener('click',function(){navMenu.classList.toggle('active');});}
const currentPath=window.location.pathname;function isCurrentPage(linkHref){if(!linkHref)return!1;if(linkHref.startsWith('#'))return!1;const link=document.createElement('a');link.href=linkHref;const linkPath=link.pathname;return currentPath===linkPath||(currentPath.startsWith(linkPath)&&linkPath!=='/');}
const navItems=document.querySelectorAll('.arabica_nav > ul > li');navItems.forEach(li=>{const mainLink=li.querySelector('a:not(.submenu a)');const submenu=li.querySelector('.submenu');let isActive=!1;if(mainLink&&isCurrentPage(mainLink.getAttribute('href'))){li.classList.add('current');isActive=!0;}
if(submenu&&!isActive){const submenuLinks=submenu.querySelectorAll('a');submenuLinks.forEach(subLink=>{if(isCurrentPage(subLink.getAttribute('href'))){li.classList.add('current');}});}});});$(document).ready(function(){var attempts=0;var maxAttempts=20;var checkMode=function(){if($('.ms-cui-tabContainer').length>0){$('body').addClass('editor');return;}
attempts++;if(attempts>=maxAttempts){$('body').addClass('visitor');return;}
setTimeout(checkMode,300);};checkMode();});(function($){function setScrollbarWidthVar(){var scrollbarWidth=window.innerWidth-document.documentElement.clientWidth;$("html").css("--scrollbar-width",scrollbarWidth+"px");}
$(function(){setScrollbarWidthVar();$(window).on("resize",setScrollbarWidthVar);});})(jQuery);

document.addEventListener("DOMContentLoaded", function () {
  const lazyImages = document.querySelectorAll(".arabica-lazy");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;

        img.onload = () => {
          img.classList.add("is-loaded");
        };

        observer.unobserve(img);
      }
    });
  }, { rootMargin: "100px" });

  lazyImages.forEach(img => observer.observe(img));
});
