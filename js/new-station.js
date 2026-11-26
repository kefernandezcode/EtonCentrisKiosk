/* Offline carousel. Manual playback only; wrap around, touch and keyboard support. */
(function () {
  'use strict';
  var labels = ['Facade', 'Facade', 'Lobby', 'Lobby', 'Hallway', 'Ground Floor Concourse'];
  var stage = document.getElementById('carousel-stage');
  var slides = Array.from(stage.querySelectorAll('.carousel-slide'));
  var thumbs = Array.from(document.querySelectorAll('.carousel-thumb'));
  var thumbRail = document.querySelector('.carousel-thumbs');
  var caption = document.querySelector('.station-caption');
  var count = slides.length, active = 1;
  var startX = null, startY = null, pointerId = null;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function wrap(i) { return (i + count) % count; }
  function show(index, initial) {
    var next = wrap(index);
    if (next === active && !initial) return;
    // Position newly revealed slides offscreen before animating to avoid flashing through center.
    var adjacent = next === wrap(active + 1) || next === wrap(active - 1);
    if (initial || !adjacent) stage.classList.add('no-motion');
    if (!initial && adjacent) {
      var entering = next === wrap(active + 1) ? wrap(next + 1) : wrap(next - 1);
      slides[entering].classList.add(next === wrap(active + 1) ? 'is-next' : 'is-prev');
      slides[entering].style.transition = 'none';
    }
    active = next;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-current', i === active);
      slide.classList.toggle('is-prev', i === wrap(active - 1));
      slide.classList.toggle('is-next', i === wrap(active + 1));
      slide.setAttribute('aria-hidden', String(i !== active));
    });
    thumbs.forEach(function (button) { button.setAttribute('aria-pressed', String(Number(button.dataset.index) === active)); });
    caption.querySelector('.caption-name').textContent = labels[active];
    caption.classList.remove('is-revealing');
    void caption.offsetWidth;
    caption.classList.add('is-revealing');
    var t = thumbs[active];
    var left = t.offsetLeft - thumbRail.offsetLeft;
    if (left < thumbRail.scrollLeft || left + t.offsetWidth > thumbRail.scrollLeft + thumbRail.clientWidth) {
      var target = left < thumbRail.scrollLeft ? left : left + t.offsetWidth - thumbRail.clientWidth;
      if (thumbRail.scrollTo) thumbRail.scrollTo({left: target, behavior: initial || reducedMotion ? 'auto' : 'smooth'});
      else thumbRail.scrollLeft = target;
    }
    window.requestAnimationFrame(function () { stage.classList.remove('no-motion'); slides.forEach(function (s) { s.style.transition = ''; }); });
  }
  thumbs.forEach(function (button) { button.addEventListener('click', function () { show(Number(button.dataset.index)); }); });
  stage.querySelector('.carousel-prev').addEventListener('click', function () { show(active - 1); });
  stage.querySelector('.carousel-next').addEventListener('click', function () { show(active + 1); });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(active + (e.key === 'ArrowLeft' ? -1 : 1)); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); show(e.key === 'Home' ? 0 : count - 1); }
  });
  function begin(x, y) { startX = x; startY = y; }
  function end(x, y) {
    if (startX === null) return;
    var dx = x - startX, dy = y - startY;
    startX = startY = null;
    if (Math.abs(dx) >= 35 && Math.abs(dx) > Math.abs(dy) * 1.2) show(active + (dx < 0 ? 1 : -1));
  }
  if (window.PointerEvent) {
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      pointerId = e.pointerId; begin(e.clientX, e.clientY);
      if (stage.setPointerCapture) stage.setPointerCapture(pointerId);
    });
    stage.addEventListener('pointerup', function (e) { if (e.pointerId === pointerId) { end(e.clientX, e.clientY); pointerId = null; } });
    stage.addEventListener('pointercancel', function () { pointerId = null; startX = startY = null; });
  } else {
    stage.addEventListener('touchstart', function (e) { if (!e.target.closest('button')) begin(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, {passive:true});
    stage.addEventListener('touchend', function (e) { end(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, {passive:true});
    stage.addEventListener('touchcancel', function () { startX = startY = null; });
  }
  show(1, true);
})();
