// Officially supplied unit specifications (Floor plan size guide.png).
// Area and kitchen measurements are displayed as supplied; no availability was provided.
const unitDetails = {
  A: {area:'108', use:'F&B', kitchen:'21'},
  B: {area:'100', use:'F&B', kitchen:'21'},
  C: {area:'192.48', use:'F&B', kitchen:'40'},
  D: {area:'129', use:'Retail'}, E: {area:'166', use:'Retail'},
  F: {area:'58', use:'Retail'}, G: {area:'57', use:'Retail'},
  H: {area:'35.70', use:'Retail'}, I: {area:'52.50', use:'Retail'},
  J: {area:'108', use:'Retail'}, K: {area:'117', use:'F&B'},
  L: {area:'132.27', use:'F&B'}, M: {area:'123.47', use:'Retail'},
  N: {area:'92', use:'Retail'}, O: {area:'95.45', use:'F&B'},
  P: {area:'81.96', use:'F&B'}
};
// Premium reveal: change this single value to adjust all timings.
const REVEAL_MS = 2400;
const infoPanel = document.querySelector('.selected-space');
const unitCode = document.getElementById('unit-code');
const unitArea = document.getElementById('unit-area');
const areaRow = document.getElementById('unit-area-row');
const unitUse = document.getElementById('unit-use');
const kitchenRow = document.getElementById('unit-kitchen-row');
const unitKitchen = document.getElementById('unit-kitchen');
const watermark = document.getElementById('unit-watermark');
const announcement = document.getElementById('unit-announcement');
const units = document.querySelectorAll('.floorplan-svg .unit');
let counterFrame = null;
let transitionTimer = null;
const changing = infoPanel.querySelector('.editorial-changing');
infoPanel.style.setProperty('--reveal-duration', REVEAL_MS + 'ms');
function renderDetails(code, details) {
  infoPanel.classList.add('has-selection');
  if (counterFrame !== null) { cancelAnimationFrame(counterFrame); counterFrame = null; }
  infoPanel.classList.remove('is-revealing');
  watermark.textContent = code;
  unitCode.textContent = 'UNIT ' + code;
  areaRow.hidden = false;
  unitUse.textContent = details.use === 'F&B' ? 'FOOD & BEVERAGE' : 'RETAIL';
  kitchenRow.hidden = !details.kitchen;
  unitKitchen.textContent = details.kitchen ? details.kitchen + ' sqm' : '';
  announcement.textContent = 'Unit ' + code + ', area ' + details.area + ' sqm, use ' + details.use + (details.kitchen ? ', kitchen ' + details.kitchen + ' sqm' : '');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { unitArea.textContent = details.area; return; }
  const decimals = (details.area.split('.')[1] || '').length;
  unitArea.textContent = (0).toFixed(decimals);
  // Force layout before restarting CSS animations, including repeated taps.
  void infoPanel.offsetWidth;
  infoPanel.classList.add('is-revealing');
  const start = performance.now();
  function tick(now) {
    const p = Math.max(0, Math.min(1, (now - start - REVEAL_MS * .20) / (REVEAL_MS * .65)));
    const ease = 1 - Math.pow(1 - p, 3);
    unitArea.textContent = p === 1 ? details.area : (Number(details.area) * ease).toFixed(decimals);
    counterFrame = p < 1 ? requestAnimationFrame(tick) : null;
  }
  counterFrame = requestAnimationFrame(tick);
}
function reveal(code, details) {
  if (transitionTimer !== null) clearTimeout(transitionTimer);
  if (counterFrame !== null) { cancelAnimationFrame(counterFrame); counterFrame = null; }
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { infoPanel.classList.remove('is-dissolving'); renderDetails(code, details); return; }
  infoPanel.classList.add('is-dissolving');
  transitionTimer = setTimeout(() => {
    transitionTimer = null;
    renderDetails(code, details);
    infoPanel.classList.remove('is-dissolving');
  }, 180);
}
units.forEach((unit) => {
  unit.setAttribute('tabindex', '0');
  unit.setAttribute('role', 'button');
  unit.setAttribute('aria-label', `Select unit ${unit.dataset.unit}`);
  unit.setAttribute('aria-pressed', 'false');
  const selectUnit = () => {
    const code = unit.dataset.unit;
    const details = unitDetails[code];
    if (!details) return;
    units.forEach((item) => {
      item.classList.toggle('is-selected', item === unit);
      item.setAttribute('aria-pressed', String(item === unit));
    });
    reveal(code, details);
  };
  unit.addEventListener('click', selectUnit);
  unit.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectUnit(); }
  });
});
// Position the HTML information in the empty lower-left portion of the SVG.
// Account for SVG's centered, aspect-preserving letterboxing on every screen size.
const stage = document.querySelector('.floorplan-stage');
const plan = stage.querySelector('svg');
const info = stage.querySelector('.selected-space');
function placeInfo() {
  const b = plan.getBoundingClientRect();
  const v = plan.viewBox.baseVal;
  if (!b.width || !b.height || !v.width || !v.height) return;
  const scale = Math.min(b.width / v.width, b.height / v.height);
  const originX = (b.width - v.width * scale) / 2;
  const originY = (b.height - v.height * scale) / 2;
  info.style.left = (originX + (112 - v.x) * scale) + 'px';
  info.style.top = 'auto';
  info.style.bottom = (b.height - originY - (1216.5 - v.y) * scale) + 'px';
  info.style.width = (350 * scale) + 'px';
  info.style.setProperty('--plan-scale', scale);
  info.style.fontSize = (20 * scale) + 'px';
}
placeInfo();
window.addEventListener('resize', placeInfo);
window.addEventListener('load', placeInfo);
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(placeInfo).observe(stage);
