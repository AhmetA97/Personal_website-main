// main.js

document.addEventListener('DOMContentLoaded', function () {
  // Setup smooth scrolling for navigation links
  setupSmoothScrolling();

  // Set up dark mode toggle
  setupDarkModeToggle();

  // Setup iframe resizing
  setupIframeResizing();

  // Initial call to update theme-aware icons
  updateThemeAwareIcons();

  // Add the new animation setup
  setupScrollAnimations();

  // Add mobile menu setup
  setupMobileMenu();
});

// Function to resize iframes based on content
function setupIframeResizing() {
  const iframes = document.querySelectorAll('.section-iframe');

  iframes.forEach((iframe) => {
    iframe.onload = function () {
      try {
        // Set sandbox attribute to allow scripts but maintain security
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');

        // Resize iframe based on content
        setTimeout(() => {
          const height = iframe.contentDocument.documentElement.scrollHeight;
          iframe.style.height = height + 50 + 'px';

          // Apply current theme to newly loaded iframe
          const currentTheme =
            document.documentElement.getAttribute('data-theme');
          applyThemeToIframe(iframe, currentTheme);
        }, 100);
      } catch (e) {
        console.warn('Cannot resize iframe:', e);
      }
    };
  });
}

// Setup dark mode toggle with iframe support
function setupDarkModeToggle() {
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) return;

  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Set initial theme
  let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Apply theme to all existing iframes
  document.querySelectorAll('.section-iframe').forEach((iframe) => {
    applyThemeToIframe(iframe, currentTheme);
  });

  // Toggle theme when button is clicked
  toggleButton.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);

    // Update theme in all iframes
    document.querySelectorAll('.section-iframe').forEach((iframe) => {
      applyThemeToIframe(iframe, currentTheme);
    });

    // Update theme-aware icons
    updateThemeAwareIcons();
  });
}

// Function to apply theme to a single iframe
function applyThemeToIframe(iframe, theme) {
  try {
    if (iframe.contentDocument && iframe.contentDocument.documentElement) {
      // Set theme attribute on the html element
      iframe.contentDocument.documentElement.setAttribute('data-theme', theme);

      // Create a link element to load the proper theme CSS
      let themeLink =
        iframe.contentDocument.getElementById('dynamic-theme-link');
      if (!themeLink) {
        themeLink = iframe.contentDocument.createElement('link');
        themeLink.id = 'dynamic-theme-link';
        themeLink.rel = 'stylesheet';
        iframe.contentDocument.head.appendChild(themeLink);
      }

      // Set the link to load your theme CSS file
      themeLink.href = `../css/style.css`;
    }
  } catch (e) {
    console.warn('Cannot apply theme to iframe:', e);
  }
}

// Setup smooth scrolling
function setupSmoothScrolling() {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    });
  });
}

// Lightbox functionality for profile image
document.addEventListener('DOMContentLoaded', function () {
  const profileImg = document.querySelector('.profile img');
  const lightbox = document.getElementById('profile-lightbox');
  const lightboxClose = document.querySelector('.lightbox-close');

  // Open lightbox when profile image is clicked
  profileImg.addEventListener('click', function () {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  });

  // Close lightbox when close button is clicked
  lightboxClose.addEventListener('click', function () {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
  });

  // Close lightbox when clicking outside the image
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close lightbox when ESC key is pressed
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// Add this to your existing theme toggle handling code
function updateThemeAwareIcons() {
  const isDarkTheme =
    document.documentElement.getAttribute('data-theme') === 'dark';
  const icons = document.querySelectorAll('.theme-aware-icon');

  icons.forEach((icon) => {
    if (isDarkTheme) {
      const darkSrc = icon.getAttribute('data-dark-src');
      if (darkSrc) icon.src = darkSrc;
    } else {
      const lightSrc = icon.src.replace('-dark.', '-light.');
      icon.src = lightSrc;
    }
  });
}

// Section navigation map functionality
document.addEventListener('DOMContentLoaded', function () {
  const sections = [
    'about',
    'experience',
    'skills',
    'projects',
    'education',
    'certificates',
    'honors',
    'contact',
  ];

  const sectionMap = document.querySelector('.section-map');
  const prevButton = document.getElementById('prev-section');
  const nextButton = document.getElementById('next-section');
  const currentSectionText = document.getElementById('current-section');

  let currentIndex = 0;

  // Function to update the displayed section name
  function updateSectionDisplay() {
    const sectionName = sections[currentIndex];
    currentSectionText.textContent =
      sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    // Add a nice transition effect
    currentSectionText.style.opacity = '0';
    setTimeout(() => {
      currentSectionText.style.opacity = '1';
    }, 200);
  }

  // Navigation functions
  function goToNextSection() {
    currentIndex = (currentIndex + 1) % sections.length;
    scrollToCurrentSection();
  }

  function goToPrevSection() {
    currentIndex = (currentIndex - 1 + sections.length) % sections.length;
    scrollToCurrentSection();
  }

  // Update this function to properly scroll to sections
  function scrollToCurrentSection() {
    const section = document.getElementById(sections[currentIndex]);

    if (section) {
      // Add an offset to account for fixed header/navigation
      const headerOffset = 80; // Adjust based on your header height
      const offsetPosition = section.offsetTop - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      updateSectionDisplay();
    }
  }

  // Event listeners
  prevButton.addEventListener('click', goToPrevSection);
  nextButton.addEventListener('click', goToNextSection);

  // Show section map when scrolling starts
  window.addEventListener('scroll', function () {
    if (window.scrollY > 200) {
      sectionMap.classList.add('visible');
    } else {
      sectionMap.classList.remove('visible');
    }

    // Determine which section is currently in view
    const scrollPosition = window.scrollY;

    for (let i = 0; i < sections.length; i++) {
      const section = document.getElementById(sections[i]);
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;

      if (
        scrollPosition >= sectionTop - 100 &&
        scrollPosition < sectionBottom - 100
      ) {
        if (currentIndex !== i) {
          currentIndex = i;
          updateSectionDisplay();
        }
        break;
      }
    }
  });

  // Initialize with first section
  updateSectionDisplay();
});

// Function to handle scroll animations with mobile improvements
function setupScrollAnimations() {
  // Get all elements to animate
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  // Use different thresholds for mobile and desktop
  const isMobile = window.innerWidth <= 768;
  const threshold = isMobile ? 0.05 : 0.1; // Much lower threshold for mobile

  // Create an observer for scroll animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // If element is in view or we're on mobile and just barely visible
        if (entry.isIntersecting) {
          // Add visible class with a slight delay
          setTimeout(() => {
            entry.target.classList.add('animate-visible');

            // Force opacity to 1 after a safety timeout (in case animation fails)
            setTimeout(() => {
              if (!entry.target.classList.contains('animate-visible')) {
                entry.target.classList.add('animate-visible');
              }
            }, 1000);
          }, 100);

          // Unobserve after animation is triggered
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: threshold,
      rootMargin: isMobile ? '0px' : '-50px', // Different margin for mobile
    }
  );

  // Observe all elements with animation class
  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  // Add a safety fallback for project cards
  const projectSection = document.getElementById('projects');
  if (projectSection) {
    // Force project section to be visible after page load on mobile
    if (isMobile) {
      setTimeout(() => {
        projectSection.classList.add('animate-visible');

        // Also make all project cards visible
        const projectCards = projectSection.querySelectorAll('.project-card');
        projectCards.forEach((card) => {
          card.classList.add('animate-visible');
        });
      }, 1500); // Delay to allow for scrolling
    }
  }
}

// Add window resize event to handle orientation changes
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
      element.classList.add('animate-visible');
    });
  }
});

// Mobile menu functionality
function setupMobileMenu() {
  // Create mobile menu toggle button
  const header = document.querySelector('header');
  const menuToggle = document.createElement('button');
  menuToggle.className = 'mobile-menu-toggle';
  menuToggle.setAttribute('aria-label', 'Toggle mobile menu');
  menuToggle.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(menuToggle);

  // Add toggle functionality
  menuToggle.addEventListener('click', function () {
    document.body.classList.toggle('mobile-menu-active');

    // Change hamburger to X
    this.classList.toggle('active');

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        document.body.classList.remove('mobile-menu-active');
        menuToggle.classList.remove('active');
      });
    });
  });
}
