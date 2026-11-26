// Approved brochure wording and locally extracted property artwork (v25).
const connectionInfo = {
  cyberpod: {title:'CYBERPOD OFFICE TOWERS', icon:'cyberpod-icon.png', headline:'Integrated Future-Ready Business Towers', copy:'Centris Cyberpod is a hub for global and local firms, equipped to meet the demands of high-volume, around-the-clock operations.', photo:'assets/location/cyberpod-photo.png', logo:'assets/location/cyberpod-logo.png', logoAlt:'Eton Centris Cyberpod'},
  'open-spaces': {title:'OPEN SPACES', icon:'open-spaces-icon.png', headline:'Where Dining, Leisure, and Community Meet', copy:'Centris Walk offers a vibrant open-air environment designed for longer dwell time, and community experiences.', photo:'assets/location/open-spaces-photo.png', logo:'assets/location/open-spaces-logo.png', logoAlt:'Eton Centris Walk'},
  'event-areas': {title:'EVENT AREAS', icon:'event-areas-icon.png', headline:'Event Spaces That Adapts to Every Milestone', copy:'Elements at Centris is a 1,165 sqm contemporary event space designed for a variety of occasions, from brand activations to private celebrations.', photo:'assets/location/event-areas-photo.png', logo:'assets/location/event-areas-logo.png', logoAlt:'Eton Centris Elements'}
};
const buttons = Array.from(document.querySelectorAll('.map-hotspot'));
const card = document.getElementById('location-brochure');
const stage = document.getElementById('location-map-stage');
const area = stage.parentElement;
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let active = '', timer = null;
// Measure the longest approved headline using the actual computed font. Use one
// size for all three cards, even when the shorter one is currently selected.
function fitBrochureHeadlines() {
  if (card.hidden) return;
  const title = document.getElementById('brochure-headline');
  const width = title.getBoundingClientRect().width;
  if (!width) return;
  title.style.removeProperty('--brochure-headline-size');
  const style = getComputedStyle(title);
  const baseSize = parseFloat(style.fontSize);
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;white-space:nowrap;width:max-content;max-width:none;';
  probe.style.fontFamily = style.fontFamily;
  probe.style.fontWeight = style.fontWeight;
  probe.style.fontStyle = style.fontStyle;
  probe.style.fontSize = style.fontSize;
  probe.style.letterSpacing = style.letterSpacing;
  card.appendChild(probe);
  let widest = 0;
  Object.keys(connectionInfo).forEach(key => {
    probe.textContent = connectionInfo[key].headline;
    widest = Math.max(widest, probe.getBoundingClientRect().width);
  });
  probe.remove();
  if (widest > 0) title.style.setProperty('--brochure-headline-size', (baseSize * Math.min(1, width * .98 / widest)) + 'px');
}
function fitMap() {
  const w = Math.min(area.clientWidth, area.clientHeight * 1080 / 1015, 1080);
  if (w > 0) { stage.style.width = w + 'px'; stage.style.height = (w * 1015 / 1080) + 'px'; stage.style.fontSize = (w / 1080 * 22) + 'px'; fitBrochureHeadlines(); }
}
function renderCard(key) {
  const data = connectionInfo[key];
  document.getElementById('brochure-icon').src = 'assets/location/' + data.icon;
  document.getElementById('brochure-title').textContent = data.title;
  document.getElementById('brochure-headline').textContent = data.headline;
  document.getElementById('brochure-description').textContent = data.copy;
  const photo = document.getElementById('brochure-photo');
  const logo = document.getElementById('brochure-logo');
  logo.src = data.logo; logo.alt = data.logoAlt;
  photo.hidden = !data.photo;
  document.getElementById('brochure-placeholder').hidden = !!data.photo;
  if (data.photo) { photo.src = data.photo; photo.alt = data.headline; }
}
function select(key) {
  if (timer !== null) { clearTimeout(timer); timer = null; }
  const previous = active;
  active = key === active ? '' : key;
  buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.connection === active)));
  if (active) stage.classList.add('has-selection');
  const delay = reduced() ? 0 : (active ? 180 : 300);
  if (!active) {
    card.classList.remove('is-visible'); card.setAttribute('aria-hidden','true');
    timer = setTimeout(() => { if (!active) { card.hidden = true; stage.classList.remove('has-selection'); } }, delay); return;
  }
  const show = () => {
    renderCard(active); card.hidden = false; fitBrochureHeadlines(); card.setAttribute('aria-hidden','false');
    card.classList.toggle('is-switching', !!previous);
    void card.offsetWidth; card.classList.add('is-visible');
  };
  if (!card.hidden && previous) { card.classList.remove('is-visible'); timer = setTimeout(show, delay); }
  else show();
}
buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.connection)));
fitMap(); window.addEventListener('resize',fitMap); window.addEventListener('load',fitMap);
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitMap).observe(area);

if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitBrochureHeadlines); if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone',fitBrochureHeadlines); }
