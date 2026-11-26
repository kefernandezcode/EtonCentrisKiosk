const dialog = document.getElementById('section-dialog');
const dialogTitle = document.getElementById('dialog-title');
const closeButton = document.querySelector('.dialog-close');

const sectionNames = {
  'new-station': 'The New Eton Centris Station',
  'spaces': 'Explore the Spaces',
  'location': 'Location and Connections'
};

document.querySelectorAll('[data-section]').forEach((card) => {
  card.addEventListener('click', () => {
    const section = card.dataset.section;
    if (section === 'new-station') {
      if (window.KioskNavigation) window.KioskNavigation.go('new-station.html'); else window.location.href = 'new-station.html';
      return;
    }
    if (section === 'spaces') {
      if (window.KioskNavigation) window.KioskNavigation.go('explore-spaces.html'); else window.location.href = 'explore-spaces.html';
      return;
    }
    if (section === 'location' || section === 'connections') {
      if (window.KioskNavigation) window.KioskNavigation.go('location-connections.html'); else window.location.href = 'location-connections.html';
      return;
    }
    dialogTitle.textContent = sectionNames[section] || 'Explore';
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  });
});

closeButton.addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
