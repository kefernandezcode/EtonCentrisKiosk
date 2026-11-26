/* v20 navigation: works with local files, no external dependencies. */
(function () {
  'use strict';
  var HALF_MS = 400, busy = false, root = document.documentElement;
  var key = 'eton-kiosk-transition';
  var routes = ['index.html','screensaver.html','home.html','new-station.html','explore-spaces.html','location-connections.html'];
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function nativeTransition() {
    return /^https?:$/.test(location.protocol) && 'onpageswap' in window && window.CSS && CSS.supports('view-transition-name', 'kiosk-logo');
  }
  function currentPage() { return location.pathname.split('/').pop() || 'index.html'; }
  function move(target, replace) { if (replace) location.replace(target); else location.href = target; }
  function remember(target) { try { sessionStorage.setItem(key, target); } catch (e) {} }
  function consume() {
    var pending = false;
    try { pending = sessionStorage.getItem(key) === currentPage(); sessionStorage.removeItem(key); }
    catch (e) { pending = true; }
    return pending;
  }
  function incoming() {
    if (consume() && !reduced() && !nativeTransition()) {
      root.classList.add('kiosk-fade-in');
      // Start the cleanup after DOM is ready so the animation has a chance to paint.
      var clear = function () { setTimeout(function () { root.classList.remove('kiosk-fade-in'); }, HALF_MS + 100); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clear); else clear();
    }
  }
  function go(target, replace) {
    if (busy || routes.indexOf(target) < 0 || target === currentPage()) return false;
    busy = true;
    if (reduced() || nativeTransition()) { move(target, replace); return true; }
    root.classList.remove('kiosk-fade-in');
    root.classList.add('kiosk-fade-out');
    remember(target);
    setTimeout(function () { move(target, replace); }, HALF_MS);
    return true;
  }
  window.KioskNavigation = {go: go};
  incoming();
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var node = event.target;
    while (node && node !== document && node.tagName !== 'A') node = node.parentNode;
    if (!node || node === document || node.hasAttribute('download') || node.target && node.target !== '_self') return;
    var href = node.getAttribute('href');
    if (routes.indexOf(href) < 0) return;
    // Welcome's tap-anywhere handler owns navigation, including its button.
    if (document.body && document.body.classList.contains('welcome-page')) return;
    event.preventDefault();
    go(href, false);
  }, true);
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) { busy = false; root.classList.remove('kiosk-fade-out'); root.classList.remove('kiosk-fade-in'); }
  });
})();
