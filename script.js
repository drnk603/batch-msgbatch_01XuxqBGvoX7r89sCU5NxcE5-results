(function() {
  'use strict';

  const app = {
    initialized: false,
    burgerOpen: false
  };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    const toggle = document.querySelector('.c-nav__toggle');
    const menu = document.querySelector('.c-nav__menu');
    const body = document.body;

    if (!toggle || !menu) return;

    const focusableElements = 'a[href], button:not([disabled]), input, textarea, select';

    function openMenu() {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      app.burgerOpen = true;
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      app.burgerOpen = false;
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      app.burgerOpen ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && app.burgerOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      const nav = toggle.closest('.c-nav');
      if (app.burgerOpen && nav && !nav.contains(e.target)) {
        closeMenu();
      }
    });

    const navLinks = document.querySelectorAll('.c-nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (app.burgerOpen) closeMenu();
      });
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && app.burgerOpen) {
        closeMenu();
      }
    }, 250));
  }

  function initScrollSpy() {
    if (app.scrollSpyInit) return;
    app.scrollSpyInit = true;

    const navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');
    const sections = [];

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        const section = document.querySelector(href);
        if (section) {
          sections.push({ link, section });
        }
      }
    });

    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeLink = sections.find(s => s.section === entry.target)?.link;
          if (activeLink) {
            navLinks.forEach(l => {
              l.classList.remove('active');
              l.removeAttribute('aria-current');
            });
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -80px 0px'
    });

    sections.forEach(({ section }) => observer.observe(section));
  }

  function initSmoothScroll() {
    if (app.smoothScrollInit) return;
    app.smoothScrollInit = true;

    document.addEventListener('click', (e) => {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          const header = document.querySelector('.l-header');
          const offset = header ? header.offsetHeight : 80;
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  function initActiveMenu() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    const pathname = window.location.pathname;
    const navLinks = document.querySelectorAll('.c-nav__link');

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return;

      let isActive = false;

      if (linkPath === '/' || linkPath === '/index.html') {
        isActive = pathname === '/' || pathname.endsWith('/index.html');
      } else if (linkPath.startsWith('/')) {
        isActive = pathname === linkPath || pathname.endsWith(linkPath);
      }

      if (isActive) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });
  }

  function initImages() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    const images = document.querySelectorAll('img');

    images.forEach(img => {
      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      const isCritical = img.classList.contains('c-logo__img') || img.hasAttribute('data-critical');
      if (!img.hasAttribute('loading') && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function handleError() {
        const fallbackSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" font-family="sans-serif" font-size="14" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3EImage%3C/text%3E%3C/svg%3E';
        this.src = fallbackSVG;
        this.removeEventListener('error', handleError);
      });
    });
  }

  function showNotification(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `${message}<button type="button" class="btn-close" aria-label="Close"></button>`;

    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 150);
      });
    }

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 150);
    }, 5000);
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const id = field.id;
    const name = field.name;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\+\d\s\-\(\)]{7,20}$/;
    const namePattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;

    if (field.hasAttribute('required') && !value) {
      return 'Dieses Feld ist erforderlich';
    }

    if (type === 'email' || id.includes('email') || name.includes('email')) {
      if (value && !emailPattern.test(value)) {
        return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      }
    }

    if (type === 'tel' || id.includes('phone') || name.includes('phone')) {
      if (value && !phonePattern.test(value)) {
        return 'Bitte geben Sie eine gültige Telefonnummer ein';
      }
    }

    if (id.includes('name') || id.includes('Name') || name.includes('name')) {
      if (value && !namePattern.test(value)) {
        return 'Bitte geben Sie einen gültigen Namen ein';
      }
    }

    if (field.tagName === 'TEXTAREA' && value && value.length < 10) {
      return 'Bitte geben Sie mindestens 10 Zeichen ein';
    }

    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      return 'Bitte akzeptieren Sie die Datenschutzbestimmungen';
    }

    return null;
  }

  function showFieldError(field, message) {
    const group = field.closest('.c-form__group');
    if (!group) return;

    group.classList.add('is-invalid');
    let errorElement = group.querySelector('.c-form__error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  function clearFieldError(field) {
    const group = field.closest('.c-form__group');
    if (!group) return;

    group.classList.remove('is-invalid');
    const errorElement = group.querySelector('.c-form__error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  function initForms() {
    if (app.formsInit) return;
    app.formsInit = true;

    const forms = document.querySelectorAll('.c-form');

    forms.forEach(form => {
      const fields = form.querySelectorAll('.c-form__input, .c-form__textarea, .c-form__select, .c-form__checkbox');
      
      fields.forEach(field => {
        field.addEventListener('blur', () => {
          const error = validateField(field);
          if (error) {
            showFieldError(field, error);
          } else {
            clearFieldError(field);
          }
        });

        field.addEventListener('input', () => {
          if (field.closest('.c-form__group')?.classList.contains('is-invalid')) {
            const error = validateField(field);
            if (!error) {
              clearFieldError(field);
            }
          }
        });
      });

      form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        let isValid = true;
        const formData = new FormData(this);

        fields.forEach(field => {
          const error = validateField(field);
          if (error) {
            showFieldError(field, error);
            isValid = false;
          } else {
            clearFieldError(field);
          }
        });

        if (!isValid) {
          showNotification('Bitte korrigieren Sie die Fehler im Formular', 'danger');
          return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }

          showNotification('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.', 'success');
          
          setTimeout(() => {
            window.location.href = '/thank_you.html';
          }, 1500);
        }, 1000);
      });
    });
  }

  function initScrollToTop() {
    if (app.scrollToTopInit) return;
    app.scrollToTopInit = true;

    let scrollBtn = document.querySelector('.scroll-to-top');
    
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-to-top';
      scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:48px;height:48px;border-radius:50%;background:var(--color-accent);color:white;border:none;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s;z-index:999;font-size:24px;';
      document.body.appendChild(scrollBtn);
    }

    const toggleVisibility = throttle(() => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }, 100);

    window.addEventListener('scroll', toggleVisibility);

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initPrivacyModal() {
    if (app.privacyModalInit) return;
    app.privacyModalInit = true;

    const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    privacyLinks.forEach(link => {
      if (link.textContent.toLowerCase().includes('datenschutz') || 
          link.textContent.toLowerCase().includes('privacy')) {
        
        link.addEventListener('click', (e) => {
          if (window.location.pathname.includes('privacy')) return;
        });
      }
    });
  }

  function initHeaderScroll() {
    if (app.headerScrollInit) return;
    app.headerScrollInit = true;

    const header = document.querySelector('.l-header');
    if (!header) return;

    const handleScroll = throttle(() => {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
  }

  function init() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initScrollSpy();
    initSmoothScroll();
    initActiveMenu();
    initImages();
    initForms();
    initScrollToTop();
    initPrivacyModal();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.app = app;
})();
