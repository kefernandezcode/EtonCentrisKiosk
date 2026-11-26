(function () {
  var video = document.querySelector('.welcome-video');
  var visual = document.querySelector('.welcome-visual');
  var leaving = false;
  function begin(event) {
    if (event) event.preventDefault();
    if (leaving) return;
    leaving = true;
    if (window.KioskNavigation) window.KioskNavigation.go('home.html', true);
    else window.location.replace('home.html');
  }
  if (video && visual) {
    function fallback() { visual.classList.remove('video-playing'); }
    function playing() { visual.classList.add('video-playing'); }
    function startVideo() {
      if (leaving) return;
      video.muted = true;
      video.defaultMuted = true;
      var result;
      try { result = video.play(); } catch (e) { fallback(); return; }
      if (result && typeof result.catch === 'function') result.catch(fallback);
    }
    video.addEventListener('playing', playing);
    video.addEventListener('error', fallback);
    video.addEventListener('abort', fallback);
    video.addEventListener('emptied', fallback);
    window.addEventListener('pageshow', function () { leaving = false; startVideo(); });
    startVideo();
  }
  document.body.addEventListener('click', begin);
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ' || event.keyCode === 13 || event.keyCode === 32) begin(event);
  });
})();
