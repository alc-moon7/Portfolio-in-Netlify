// Loading Screen
      window.addEventListener('load', function() {
          const loader = document.getElementById('loader');
          setTimeout(() => {
              loader.style.opacity = '0';
              loader.style.visibility = 'hidden';

              // Create galaxy background after page loads
              createGalaxy();
              createPlanets();
          }, 1000);
      });

      // Theme Toggle
      const themeToggle = document.getElementById('themeToggle');
      const sunIcon = document.getElementById('sunIcon');
      const moonIcon = document.getElementById('moonIcon');
      const html = document.documentElement;

      // Check for saved theme preference or respect OS setting
      const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      html.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);

      themeToggle.addEventListener('click', () => {
          const currentTheme = html.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

          html.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          updateThemeIcon(newTheme);
      });

      function updateThemeIcon(theme) {
          if (theme === 'dark') {
              sunIcon.style.display = 'none';
              moonIcon.style.display = 'block';
          } else {
              sunIcon.style.display = 'block';
              moonIcon.style.display = 'none';
          }
      }

      // Mobile Menu Toggle
      const menuToggle = document.getElementById('menuToggle');
      const navMenu = document.getElementById('navMenu');

      menuToggle.addEventListener('click', () => {
          navMenu.classList.toggle('active');
      });

      // Close mobile menu when clicking a nav link
      document.querySelectorAll('nav a').forEach(link => {
          link.addEventListener('click', () => {
              navMenu.classList.remove('active');
          });
      });

      // Scroll Indicator
      const scrollIndicator = document.getElementById('scrollIndicator');

      window.addEventListener('scroll', () => {
          const scrollTop = document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = (scrollTop / scrollHeight) * 100;

          scrollIndicator.style.width = `${scrolled}%`;
      });

      // Section Reveal Animation
      const sections = document.querySelectorAll('section');

      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('section-visible');
              }
          });
      }, {
          threshold: 0.1
      });

      sections.forEach(section => {
          observer.observe(section);
      });

      // Skill Bar Animation
      const skillBars = document.querySelectorAll('.skill-progress');

      const skillObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const width = entry.target.getAttribute('data-width');
                  entry.target.style.width = `${width}%`;
              }
          });
      }, {
          threshold: 0.5
      });

      skillBars.forEach(bar => {
          skillObserver.observe(bar);
      });

      // Mission Photo Carousel
      (function initPhotoCarousel() {
          const carousel = document.getElementById('photoCarousel');
          if (!carousel) return;

          const slides = Array.from(carousel.querySelectorAll('.photo-slide'));
          if (!slides.length) return;

          const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
          const prevControl = carousel.querySelector('[data-carousel-nav="prev"]');
          const nextControl = carousel.querySelector('[data-carousel-nav="next"]');
          const autoplayDelay = 3000;
          const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
          let activeIndex = 0;
          let autoplayId = null;

          const setActiveSlide = (index) => {
              slides.forEach((slide, idx) => {
                  const isActive = idx === index;
                  slide.classList.toggle('active', isActive);
                  slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
              });

              dots.forEach((dot, idx) => {
                  const isActive = idx === index;
                  dot.classList.toggle('active', isActive);
                  dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                  if (isActive) {
                      dot.setAttribute('aria-current', 'true');
                  } else {
                      dot.removeAttribute('aria-current');
                  }
              });

              activeIndex = index;
          };

          const goToSlide = (nextIndex) => {
              const normalizedIndex = (nextIndex + slides.length) % slides.length;
              setActiveSlide(normalizedIndex);
          };

          const stopAutoplay = () => {
              if (autoplayId) {
                  clearInterval(autoplayId);
                  autoplayId = null;
              }
          };

          const startAutoplay = () => {
              if (slides.length < 2 || motionQuery.matches) {
                  stopAutoplay();
                  return;
              }

              stopAutoplay();
              autoplayId = setInterval(() => {
                  goToSlide(activeIndex + 1);
              }, autoplayDelay);
          };

          if (prevControl) {
              prevControl.addEventListener('click', () => {
                  goToSlide(activeIndex - 1);
                  startAutoplay();
              });
          }

          if (nextControl) {
              nextControl.addEventListener('click', () => {
                  goToSlide(activeIndex + 1);
                  startAutoplay();
              });
          }

          dots.forEach((dot, idx) => {
              dot.addEventListener('click', () => {
                  if (idx === activeIndex) return;
                  goToSlide(idx);
                  startAutoplay();
              });
          });

          carousel.addEventListener('mouseenter', stopAutoplay);
          carousel.addEventListener('mouseleave', startAutoplay);

          document.addEventListener('visibilitychange', () => {
              if (document.hidden) {
                  stopAutoplay();
              } else {
                  startAutoplay();
              }
          });

          if (typeof motionQuery.addEventListener === 'function') {
              motionQuery.addEventListener('change', startAutoplay);
          } else if (typeof motionQuery.addListener === 'function') {
              motionQuery.addListener(startAutoplay);
          }

          setActiveSlide(0);
          startAutoplay();
      })();

      // Hero Typewriter Animation
      const typewriterEl = document.getElementById('typewriter');

      if (typewriterEl) {
          const phraseList = (typewriterEl.dataset.phrases || '')
              .split('|')
              .map(phrase => phrase.trim())
              .filter(Boolean);
          const phrases = phraseList.length ? phraseList : ['Exploring the world of technology with Muntakim Ahmed'];
          let phraseIndex = 0;
          let charIndex = 0;
          let deleting = false;
          const typingSpeed = 110;
          const deletingSpeed = 60;
          const pauseDuration = 1500;

          const loopTypewriter = () => {
              const currentPhrase = phrases[phraseIndex];
              typewriterEl.textContent = currentPhrase.slice(0, charIndex);

              let delay = deleting ? deletingSpeed : typingSpeed;

              if (!deleting && charIndex === currentPhrase.length) {
                  deleting = true;
                  delay = pauseDuration;
              } else if (deleting && charIndex === 0) {
                  deleting = false;
                  phraseIndex = (phraseIndex + 1) % phrases.length;
                  delay = 400;
              }

              charIndex += deleting ? -1 : 1;
              setTimeout(loopTypewriter, Math.max(delay, 40));
          };

          loopTypewriter();
      }

      // Hero Stat Counters
      const heroStats = document.querySelector('.hero-stats');
      const statValues = document.querySelectorAll('.stat-value');

      if (heroStats && statValues.length) {
          const statsObserver = new IntersectionObserver((entries, observer) => {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      statValues.forEach(counter => animateCounter(counter));
                      observer.disconnect();
                  }
              });
          }, { threshold: 0.4 });

          statsObserver.observe(heroStats);
      }

      function animateCounter(counter) {
          const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
          const duration = 1500;
          const startTime = performance.now();

          const step = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              counter.textContent = Math.floor(progress * target);

              if (progress < 1) {
                  requestAnimationFrame(step);
              } else {
                  counter.textContent = target;
              }
          };

          requestAnimationFrame(step);
      }

      // Smooth Scrolling
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function(e) {
              e.preventDefault();

              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                  window.scrollTo({
                      top: target.offsetTop - 80,
                      behavior: 'smooth'
                  });
              }
          });
      });

      // Active Navigation Highlighting
      window.addEventListener('scroll', () => {
          const scrollPosition = window.scrollY + 200;

          document.querySelectorAll('section').forEach(section => {
              const sectionTop = section.offsetTop;
              const sectionHeight = section.offsetHeight;

              if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                  const id = section.getAttribute('id');
                  document.querySelector(`nav a[href="#${id}"]`).classList.add('nav-active');
              } else {
                  const id = section.getAttribute('id');
                  document.querySelector(`nav a[href="#${id}"]`).classList.remove('nav-active');
              }
          });
      });

      // Project Filters
      const filterButtons = document.querySelectorAll('.filter-btn');
      const projectCards = document.querySelectorAll('.project-card');

      if (filterButtons.length && projectCards.length) {
          filterButtons.forEach(button => {
              button.addEventListener('click', () => {
                  if (button.classList.contains('active')) return;

                  const filterValue = button.dataset.filter;
                  filterButtons.forEach(btn => btn.classList.remove('active'));
                  button.classList.add('active');

                  projectCards.forEach(card => {
                      const category = card.dataset.category || 'all';
                      const shouldShow = filterValue === 'all' || category === filterValue;

                      if (shouldShow) {
                          card.style.removeProperty('display');
                          requestAnimationFrame(() => card.classList.remove('hide'));
                      } else {
                          card.classList.add('hide');
                          setTimeout(() => {
                              if (card.classList.contains('hide')) {
                                  card.style.display = 'none';
                              }
                          }, 220);
                      }
                  });
              });
          });
      }

      // Parallax Layers on pointer move
      const parallaxItems = document.querySelectorAll('[data-parallax]');
      if (parallaxItems.length) {
          window.addEventListener('pointermove', (event) => {
              const xRatio = (event.clientX / window.innerWidth) - 0.5;
              const yRatio = (event.clientY / window.innerHeight) - 0.5;

              parallaxItems.forEach(item => {
                  const factor = parseFloat(item.dataset.parallax) || 0.05;
                  const translateX = -(xRatio * factor * 80);
                  const translateY = -(yRatio * factor * 60);

                  item.style.setProperty('--parallaxX', `${translateX}px`);
                  item.style.setProperty('--parallaxY', `${translateY}px`);
              });
          });
      }

      // Card Tilt Interaction
      const tiltElements = document.querySelectorAll('.project-card, .skill-category');

      function applyTilt(event) {
          const rect = this.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const rotateY = ((x / rect.width) - 0.5) * 12;
          const rotateX = ((0.5 - y / rect.height)) * 12;

          this.style.setProperty('--tiltX', `${rotateX.toFixed(2)}deg`);
          this.style.setProperty('--tiltY', `${rotateY.toFixed(2)}deg`);
      }

      function resetTilt() {
          this.style.setProperty('--tiltX', '0deg');
          this.style.setProperty('--tiltY', '0deg');
      }

      tiltElements.forEach(element => {
          element.addEventListener('mousemove', applyTilt);
          element.addEventListener('mouseleave', resetTilt);
      });

      // Create Galaxy Background
      function createGalaxy() {
          const galaxy = document.getElementById('galaxy');
          const starCount = 200;

          for (let i = 0; i < starCount; i++) {
              const star = document.createElement('div');
              star.classList.add('star');

              // Random position
              const x = Math.random() * 100;
              const y = Math.random() * 100;

              // Random size (0.5px to 3px)
              const size = Math.random() * 2.5 + 0.5;

              // Random animation duration (2s to 5s)
              const duration = Math.random() * 3 + 2;
              const delay = Math.random() * 5;

              star.style.left = `${x}%`;
              star.style.top = `${y}%`;
              star.style.width = `${size}px`;
              star.style.height = `${size}px`;
              star.style.setProperty('--animation-duration', `${duration}s`);
              star.style.animationDelay = `${delay}s`;

              galaxy.appendChild(star);
          }
      }

      // Create Planets
      function createPlanets() {
          const galaxy = document.getElementById('galaxy');
          const planetCount = 3;

          for (let i = 0; i < planetCount; i++) {
              const planet = document.createElement('div');
              planet.classList.add('planet');

              // Random size (20px to 60px)
              const size = Math.random() * 40 + 20;

              // Random orbit radius (100px to 300px)
              const orbitRadius = Math.random() * 200 + 100;

              // Random orbit duration (30s to 60s)
              const orbitDuration = Math.random() * 30 + 30;

              // Random position angle
              const angle = Math.random() * 360;

              // Random colors
              const colors = [
                  {color: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.5)'},
                  {color: '#48dbfb', glow: 'rgba(72, 219, 251, 0.5)'},
                  {color: '#1dd1a1', glow: 'rgba(29, 209, 161, 0.5)'},
                  {color: '#feca57', glow: 'rgba(254, 202, 87, 0.5)'},
                  {color: '#5f27cd', glow: 'rgba(95, 39, 205, 0.5)'}
              ];
              const colorIndex = Math.floor(Math.random() * colors.length);

              planet.style.width = `${size}px`;
              planet.style.height = `${size}px`;
              planet.style.setProperty('--orbit-radius', `${orbitRadius}px`);
              planet.style.setProperty('--orbit-duration', `${orbitDuration}s`);
              planet.style.setProperty('--planet-color', colors[colorIndex].color);
              planet.style.setProperty('--planet-glow', colors[colorIndex].glow);
              planet.style.transform = `rotate(${angle}deg) translateX(${orbitRadius}px) rotate(-${angle}deg)`;

              galaxy.appendChild(planet);
          }
      }

      // Testimonials Slider
      const testimonialCards = document.querySelectorAll('.testimonial-card');
      const testimonialDots = document.querySelectorAll('.testimonial-dot');
      const prevTestimonial = document.getElementById('testimonialPrev');
      const nextTestimonial = document.getElementById('testimonialNext');
      let testimonialIndex = 0;
      let testimonialTimer;

      function showTestimonial(newIndex) {
          if (!testimonialCards.length) return;

          testimonialCards[testimonialIndex].classList.remove('active');
          if (testimonialDots[testimonialIndex]) {
              testimonialDots[testimonialIndex].classList.remove('active');
          }

          testimonialIndex = (newIndex + testimonialCards.length) % testimonialCards.length;

          testimonialCards[testimonialIndex].classList.add('active');
          if (testimonialDots[testimonialIndex]) {
              testimonialDots[testimonialIndex].classList.add('active');
          }
      }

      function startTestimonialLoop() {
          if (testimonialCards.length < 2) return;
          testimonialTimer = setInterval(() => {
              showTestimonial(testimonialIndex + 1);
          }, 6000);
      }

      function resetTestimonialLoop() {
          if (testimonialCards.length < 2) return;
          clearInterval(testimonialTimer);
          startTestimonialLoop();
      }

      if (prevTestimonial && nextTestimonial) {
          prevTestimonial.addEventListener('click', () => {
              showTestimonial(testimonialIndex - 1);
              resetTestimonialLoop();
          });

          nextTestimonial.addEventListener('click', () => {
              showTestimonial(testimonialIndex + 1);
              resetTestimonialLoop();
          });
      }

      testimonialDots.forEach(dot => {
          dot.addEventListener('click', () => {
              const index = parseInt(dot.dataset.index, 10);
              showTestimonial(index);
              resetTestimonialLoop();
          });
      });

      showTestimonial(0);
      startTestimonialLoop();

      // Easter Egg (Konami Code)
      const konamiCode = [
          'ArrowUp', 'ArrowUp', 
          'ArrowDown', 'ArrowDown', 
          'ArrowLeft', 'ArrowRight', 
          'ArrowLeft', 'ArrowRight', 
          'b', 'a'
      ];
      let konamiIndex = 0;

      document.addEventListener('keydown', (e) => {
          if (e.key === konamiCode[konamiIndex]) {
              konamiIndex++;

              if (konamiIndex === konamiCode.length) {
                  showEasterEgg();
                  konamiIndex = 0;
              }
          } else {
              konamiIndex = 0;
          }
      });

      function showEasterEgg() {
          const easterEgg = document.getElementById('easter-egg');
          const overlay = document.getElementById('easterOverlay');

          easterEgg.classList.add('show');
          overlay.classList.add('show');

          document.getElementById('closeEaster').addEventListener('click', () => {
              easterEgg.classList.remove('show');
              overlay.classList.remove('show');
          });
      }

      // Form Submission
      const contactForm = document.getElementById('contactForm');

      contactForm.addEventListener('submit', (e) => {
          e.preventDefault();

          // Form validation and submission logic would go here
          alert('Thank you for your message! In a real implementation, this would send your message.');
          contactForm.reset();
      });

      // PWA Setup (for when deployed)
      if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                  .then(registration => {
                      console.log('ServiceWorker registration successful');
                  }).catch(err => {
                      console.log('ServiceWorker registration failed: ', err);
                  });
          });
      }
let lastScroll = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 100) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScroll = currentScroll;

});

// Call Netlify serverless function instead of hitting DB directly
fetch('/.netlify/functions/db')
  .then(r => r.json())
  .then(data => console.log('Function response:', data))
  .catch(err => console.error('Function error:', err));

