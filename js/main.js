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
        // Navbar scroll effect
        window.addEventListener('scroll', handleNavbarScroll, { passive: true });
        window.addEventListener('scroll', updateActiveNavLink, { passive: true });

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', toggleMobileMenu);
        }

        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                smoothScrollTo(targetId);
                closeMobileMenu();
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
