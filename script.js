const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
const isTouchDevice = touchQuery.matches || 'ontouchstart' in window;
if (isTouchDevice) document.documentElement.classList.add('touch-device');

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#main-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
  menuButton.classList.toggle('is-open', !open);
  navigation.classList.toggle('open', !open);
  document.querySelector('.nav').classList.toggle('menu-active', !open);
  document.body.classList.toggle('menu-open', !open);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menü öffnen');
    menuButton.classList.remove('is-open');
    navigation.classList.remove('open');
    document.querySelector('.nav').classList.remove('menu-active');
    document.body.classList.remove('menu-open');
  });
});

const revealElements = [...document.querySelectorAll('.reveal, .reveal-image')];
revealElements.forEach((element, index) => {
  element.style.setProperty('--delay', `${Math.min(index % 3, 2) * 90}ms`);
});

function revealVisibleElements() {
  const trigger = window.innerHeight * 0.92;
  revealElements.forEach((element) => {
    if (!element.classList.contains('visible') && element.getBoundingClientRect().top < trigger) {
      element.classList.add('visible');
    }
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -5% 0px' });
  revealElements.forEach((element) => observer.observe(element));
} else {
  window.addEventListener('scroll', revealVisibleElements, { passive: true });
}

window.requestAnimationFrame(() => window.requestAnimationFrame(revealVisibleElements));

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
    <button class="lightbox-close" type="button" aria-label="Galerie schließen"><span></span><span></span></button>
    <button class="lightbox-zoom" type="button" aria-label="Bild vergrößern">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"></circle><path d="m15.5 15.5 5 5"></path><path class="zoom-plus" d="M10.8 7.8v6M7.8 10.8h6"></path></svg>
    </button>
    <button class="lightbox-arrow lightbox-prev" type="button" aria-label="Vorheriges Bild"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5"></path></svg></button>
    <figure class="lightbox-stage">
      <div class="lightbox-image-wrap"><img src="" alt=""></div>
      <figcaption><span></span><b></b></figcaption>
    </figure>
    <button class="lightbox-arrow lightbox-next" type="button" aria-label="Nächstes Bild"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5"></path></svg></button>`;
  document.body.append(lightbox);

  const stageImage = lightbox.querySelector('.lightbox-stage img');
  const stageLabel = lightbox.querySelector('figcaption span');
  const stageCount = lightbox.querySelector('figcaption b');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const zoomButton = lightbox.querySelector('.lightbox-zoom');
  let activeIndex = 0;
  let touchStartX = 0;
  let panX = 0;
  let panY = 0;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let panStartX = 0;
  let panStartY = 0;
  let isPanning = false;
  let didDrag = false;

  function resetZoom() {
    stageImage.classList.remove('zoomed');
    zoomButton.classList.remove('active');
    zoomButton.setAttribute('aria-label', 'Bild vergrößern');
    stageImage.style.transformOrigin = '50% 50%';
    panX = 0;
    panY = 0;
    stageImage.style.setProperty('--pan-x', '0px');
    stageImage.style.setProperty('--pan-y', '0px');
  }

  function showImage(index) {
    activeIndex = (index + lightboxImages.length) % lightboxImages.length;
    const source = lightboxImages[activeIndex];
    resetZoom();
    stageImage.classList.add('changing');
    window.setTimeout(() => {
      stageImage.src = source.currentSrc || source.src;
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
  zoomButton.addEventListener('click', () => {
    const zoomed = stageImage.classList.toggle('zoomed');
    zoomButton.classList.toggle('active', zoomed);
    zoomButton.setAttribute('aria-label', zoomed ? 'Bild verkleinern' : 'Bild vergrößern');
  });
  stageImage.addEventListener('click', (event) => {
    if (didDrag) {
      didDrag = false;
      return;
    }
    const rect = stageImage.getBoundingClientRect();
    stageImage.style.transformOrigin = `${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`;
    zoomButton.click();
  });
  stageImage.addEventListener('pointerdown', (event) => {
    if (!stageImage.classList.contains('zoomed')) return;
    isPanning = true;
    didDrag = false;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    panStartX = panX;
    panStartY = panY;
    stageImage.setPointerCapture?.(event.pointerId);
    stageImage.classList.add('panning');
  });
  stageImage.addEventListener('pointermove', (event) => {
    if (!isPanning) return;
    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    if (Math.abs(dx) + Math.abs(dy) > 4) didDrag = true;
    const wrap = stageImage.parentElement.getBoundingClientRect();
    const maxX = wrap.width * .62;
    const maxY = wrap.height * .62;
    panX = Math.max(-maxX, Math.min(maxX, panStartX + dx));
    panY = Math.max(-maxY, Math.min(maxY, panStartY + dy));
    stageImage.style.setProperty('--pan-x', `${panX}px`);
    stageImage.style.setProperty('--pan-y', `${panY}px`);
  });
  function stopPanning(event) {
    if (!isPanning) return;
    isPanning = false;
    stageImage.classList.remove('panning');
    if (event?.pointerId != null) stageImage.releasePointerCapture?.(event.pointerId);
  }
  stageImage.addEventListener('pointerup', stopPanning);
  stageImage.addEventListener('pointercancel', stopPanning);
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    if (stageImage.classList.contains('zoomed')) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 55) return;
    showImage(activeIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });
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
