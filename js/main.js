/**
 * Michael's Trattoria - Main JavaScript
 * Handles navigation, gallery lightbox, smooth scrolling, and animations
 */

(function() {
    'use strict';

    // =============================================
    // DOM Elements
    // =============================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const fadeElements = document.querySelectorAll('.fade-in');

    // Gallery state
    let currentGalleryIndex = 0;
    const galleryImages = Array.from(galleryItems).map(item => ({
        src: item.dataset.src,
        alt: item.querySelector('img').alt
    }));

    // =============================================
    // Navigation
    // =============================================

    /**
     * Handle navbar scroll effect
     */
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /**
     * Toggle mobile navigation menu
     */
    function toggleMobileMenu() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

        // Update aria-expanded
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
    }

    /**
     * Close mobile menu
     */
    function closeMobileMenu() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
        navToggle.setAttribute('aria-expanded', 'false');

        // Close any open dropdowns
        document.querySelectorAll('.nav-dropdown.open').forEach(function(dd) {
            dd.classList.remove('open');
        });
    }

    /**
     * Update active navigation link based on scroll position
     */
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    /**
     * Smooth scroll to section
     */
    function smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // =============================================
    // Lightbox Gallery
    // =============================================

    /**
     * Open lightbox with specified image
     */
    function openLightbox(index) {
        currentGalleryIndex = index;
        const image = galleryImages[index];

        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus trap for accessibility
        lightboxClose.focus();
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImage.src = '';
    }

    /**
     * Show next image in lightbox
     */
    function showNextImage() {
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    /**
     * Show previous image in lightbox
     */
    function showPrevImage() {
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    /**
     * Update lightbox image with fade effect
     */
    function updateLightboxImage() {
        const image = galleryImages[currentGalleryIndex];
        lightboxImage.style.opacity = '0';

        setTimeout(() => {
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;
            lightboxImage.style.opacity = '1';
        }, 150);
    }

    /**
     * Handle lightbox keyboard navigation
     */
    function handleLightboxKeyboard(e) {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
        }
    }

    // =============================================
    // Scroll Animations
    // =============================================

    /**
     * Initialize Intersection Observer for fade-in animations
     */
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // =============================================
    // Event Listeners
    // =============================================

    function initEventListeners() {
        // Navbar scroll effect (batched to avoid forced reflow)
        let scrollTicking = false;
        window.addEventListener('scroll', function() {
            if (!scrollTicking) {
                requestAnimationFrame(function() {
                    handleNavbarScroll();
                    updateActiveNavLink();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', toggleMobileMenu);
        }

        // Navigation links — only intercept pure hash links for smooth scroll
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    smoothScrollTo(href);
                    closeMobileMenu();
                }
            });
        });

        // Mobile dropdown toggle
        document.querySelectorAll('.nav-dropdown-toggle').forEach(function(toggle) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    toggle.closest('.nav-dropdown').classList.toggle('open');
                }
            });
        });

        // All internal anchor links (including CTAs)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId && targetId !== '#') {
                    e.preventDefault();
                    smoothScrollTo(targetId);
                }
            });
        });

        // Gallery items
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));

            // Keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `View ${item.querySelector('img').alt}`);

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });

        // Lightbox controls
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', showPrevImage);
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', showNextImage);
        }

        // Close lightbox on background click
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleLightboxKeyboard);

        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        // Rate modal
        if (openRateModalBtn) {
            openRateModalBtn.addEventListener('click', openRateModal);
        }

        if (rateModalClose) {
            rateModalClose.addEventListener('click', closeRateModal);
        }

        if (rateModal) {
            rateModal.addEventListener('click', function(e) {
                if (e.target === rateModal) {
                    closeRateModal();
                }
            });
        }

        if (rateBtnPrivate) {
            rateBtnPrivate.addEventListener('click', function() {
                showRateStep('rateStepPrivate');
            });
        }

        if (rateBackPrivate) {
            rateBackPrivate.addEventListener('click', function() {
                showRateStep('rateStep1');
            });
        }

        // Escape key closes rate modal (extend existing keyboard handler)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && rateModal && rateModal.classList.contains('active')) {
                closeRateModal();
            }
        });
    }

    // =============================================
    // Rate Your Experience Modal
    // =============================================
    // No sentiment gate: rateStep1 shows the review links (Google, TripAdvisor,
    // Facebook, Yelp) to everyone, and rateStepPrivate is an opt-in alternative
    // reachable from it - never a fork that withholds the Google link from unhappy
    // customers. That is "review gating", which Google prohibits and suspends
    // Business Profiles over. Do not re-add a Happy / Not Happy fork.
    const rateModal = document.getElementById('rateModal');
    const openRateModalBtn = document.getElementById('openRateModal');
    const rateModalClose = rateModal ? rateModal.querySelector('.rate-modal-close') : null;
    const rateBtnPrivate = document.getElementById('rateBtnPrivate');
    const rateBackPrivate = document.getElementById('rateBackPrivate');
    const rateSteps = rateModal ? rateModal.querySelectorAll('.rate-step') : [];

    function openRateModal() {
        if (!rateModal) return;
        showRateStep('rateStep1');
        rateModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeRateModal() {
        if (!rateModal) return;
        rateModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showRateStep(stepId) {
        rateSteps.forEach(function(step) {
            step.hidden = step.id !== stepId;
        });
    }

    // Private feedback form -> /api/contact (Vercel function -> Resend).
    // Replaces a dead Formspree endpoint that was silently dropping submissions.
    const rateForm = rateModal ? rateModal.querySelector('.rate-form') : null;

    function initRateForm() {
        if (!rateForm) return;

        const status = rateForm.querySelector('.rate-form-status');
        const submitBtn = rateForm.querySelector('button[type="submit"]');

        function setStatus(msg, type) {
            if (!status) return;
            status.textContent = msg;
            status.style.color = type === 'error' ? '#e05260' : (type === 'success' ? '#4CAF50' : '');
        }

        rateForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = rateForm.querySelector('[name="name"]');
            const msgInput = rateForm.querySelector('[name="message"]');
            let ok = true;
            [nameInput, msgInput].forEach(function(input) {
                if (input && !input.value.trim()) {
                    ok = false;
                    input.style.borderColor = '#e05260';
                } else if (input) {
                    input.style.borderColor = '';
                }
            });
            if (!ok) {
                setStatus('Please add your name and a short message.', 'error');
                return;
            }

            const payload = {};
            new FormData(rateForm).forEach(function(value, key) { payload[key] = value; });

            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }
            setStatus('Sending your feedback...', '');

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function(res) {
                    return res.json()
                        .catch(function() { return {}; })
                        .then(function(data) { return { ok: res.ok, data: data }; });
                })
                .then(function(result) {
                    if (result.ok) {
                        setStatus('Thank you for telling us. We\'ll reach out and make it right.', 'success');
                        rateForm.reset();
                    } else {
                        setStatus(result.data.error || 'Something went wrong. Please call us at (203) 269-5303.', 'error');
                    }
                })
                .catch(function() {
                    setStatus('Network error. Please call us at (203) 269-5303.', 'error');
                })
                .finally(function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                });
        });
    }

    // =============================================
    // Initialization
    // =============================================

    function init() {
        // Initial state
        handleNavbarScroll();
        updateActiveNavLink();

        // Initialize features
        initEventListeners();
        initScrollAnimations();
        initRateForm();

        // Add smooth transition to lightbox image
        if (lightboxImage) {
            lightboxImage.style.transition = 'opacity 0.15s ease';
        }

        console.log('Michael\'s Trattoria website initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
