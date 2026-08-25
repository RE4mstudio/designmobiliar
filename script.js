const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#main-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
  navigation.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menü öffnen');
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal, .reveal-image').forEach((element, index) => {
  element.style.setProperty('--delay', `${Math.min(index % 3, 2) * 90}ms`);
  observer.observe(element);
});

// Compact glass header: hide while scrolling down, reveal while scrolling up.
const siteHeader = document.querySelector('.nav');
let lastScrollY = window.scrollY;
let scrollTicking = false;

function updateHeader() {
  const currentScrollY = window.scrollY;
  const movingDown = currentScrollY > lastScrollY;

  siteHeader.classList.toggle('is-scrolled', currentScrollY > 48);
  siteHeader.classList.toggle('is-hidden', movingDown && currentScrollY > 150);

  if (!movingDown || currentScrollY < 48) siteHeader.classList.remove('is-hidden');
  lastScrollY = Math.max(currentScrollY, 0);
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateHeader);
}, { passive: true });

// Product lightbox gallery.
const lightboxImages = [...document.querySelectorAll('.metro-gallery img')];

if (lightboxImages.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Produktgalerie');
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Galerie schließen">Schließen ×</button>
    <button class="lightbox-arrow lightbox-prev" type="button" aria-label="Vorheriges Bild">←</button>
    <figure class="lightbox-stage">
      <img src="" alt="">
      <figcaption><span></span><b></b></figcaption>
    </figure>
    <button class="lightbox-arrow lightbox-next" type="button" aria-label="Nächstes Bild">→</button>`;
  document.body.append(lightbox);

  const stageImage = lightbox.querySelector('.lightbox-stage img');
  const stageLabel = lightbox.querySelector('figcaption span');
  const stageCount = lightbox.querySelector('figcaption b');
  const closeButton = lightbox.querySelector('.lightbox-close');
  let activeIndex = 0;

  function showImage(index) {
    activeIndex = (index + lightboxImages.length) % lightboxImages.length;
    const source = lightboxImages[activeIndex];
    stageImage.classList.add('changing');
    window.setTimeout(() => {
      stageImage.src = source.src;
      stageImage.alt = source.alt;
      stageLabel.textContent = source.alt;
      stageCount.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(lightboxImages.length).padStart(2, '0')}`;
      stageImage.classList.remove('changing');
    }, 120);
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    lightboxImages[activeIndex].focus();
  }

  lightboxImages.forEach((image, index) => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `${image.alt} vergrößern`);
    image.addEventListener('click', () => openLightbox(index));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeIndex - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
  });
}
