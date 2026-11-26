(function () {
  var IDLE_TIMEOUT = 1 * 60 * 1000;
  var timer, lastActivity;
  function check() {
    var remaining = IDLE_TIMEOUT - (Date.now() - lastActivity);
    if (remaining <= 0) { if (window.KioskNavigation) window.KioskNavigation.go('index.html', true); else window.location.replace('index.html'); }
    else timer = setTimeout(check, remaining);
  }
  function reset() { lastActivity = Date.now(); clearTimeout(timer); timer = setTimeout(check, IDLE_TIMEOUT); }
  ['pointerdown','mousemove','mousedown','touchstart','keydown','wheel','scroll'].forEach(function(event) { window.addEventListener(event, reset, true); });
  window.addEventListener('pageshow', reset);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { clearTimeout(timer); check(); } });
  reset();
})();
