// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── Fade-in on scroll ──
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.feature-card, .feature-list-item, .commit-card, .insight-item, .privacy-item, .pricing-card').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ── Nav background on scroll ──
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ── Slideshow ──
const slideshows = {
  macos: {
    el: document.getElementById('slideshow-macos'),
    index: 0
  },
  ios: {
    el: document.getElementById('slideshow-ios'),
    index: 0
  }
};

let activePlatform = 'macos';
let autoPlayTimer = null;

const dotsContainer = document.getElementById('slide-dots');

function getSlides(platform) {
  return slideshows[platform].el.querySelectorAll('.slide');
}

function buildDots() {
  dotsContainer.innerHTML = '';
  const slides = getSlides(activePlatform);
  const currentIndex = slideshows[activePlatform].index;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === currentIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
}

function goToSlide(index) {
  const slides = getSlides(activePlatform);
  const data = slideshows[activePlatform];

  // Remove active from current
  slides[data.index].classList.remove('active');

  // Update index
  data.index = ((index % slides.length) + slides.length) % slides.length;

  // Set new active
  slides[data.index].classList.add('active');

  // Update dots
  const dots = dotsContainer.querySelectorAll('.slide-dot');
  dots.forEach((dot, i) => dot.classList.toggle('active', i === data.index));

  resetAutoPlay();
}

function nextSlide() {
  goToSlide(slideshows[activePlatform].index + 1);
}

function prevSlide() {
  goToSlide(slideshows[activePlatform].index - 1);
}

function switchPlatform(platform) {
  if (platform === activePlatform) return;

  // Hide current slideshow
  slideshows[activePlatform].el.classList.remove('active');

  // Update active
  activePlatform = platform;

  // Show new slideshow
  slideshows[activePlatform].el.classList.add('active');

  // Update tabs
  document.querySelectorAll('.preview-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.platform === platform);
  });

  // Rebuild dots for new platform
  buildDots();
  resetAutoPlay();
}

function resetAutoPlay() {
  clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(nextSlide, 6000);
}

// Tab clicks
document.querySelectorAll('.preview-tab').forEach(tab => {
  tab.addEventListener('click', () => switchPlatform(tab.dataset.platform));
});

// Arrow clicks
document.querySelector('.slide-prev').addEventListener('click', prevSlide);
document.querySelector('.slide-next').addEventListener('click', nextSlide);

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});

// Init
buildDots();

// Start autoplay only when slideshow is visible
const slideshowSection = document.getElementById('preview');
const slideshowObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        resetAutoPlay();
      } else {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    });
  },
  { threshold: 0.3 }
);
slideshowObserver.observe(slideshowSection);

// ── Contact Modal ──
const modal = document.getElementById('contact-modal');
const supportLink = document.getElementById('support-link');
const modalClose = document.getElementById('modal-close');
const contactForm = document.getElementById('contact-form');

function openModal(e) {
  e.preventDefault();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

supportLink.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);

// Close on overlay click
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

// Form submit → mailto
contactForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value.trim() || 'Support Request';
  const message = document.getElementById('contact-message').value.trim();

  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  const mailto = `mailto:privacy@obius.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  closeModal();
  contactForm.reset();
});
