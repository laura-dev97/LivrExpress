/* ==========================================================================
   LIVREXPRESS DAKAR - INTERACTIVE JAVASCRIPT
   Calculateur de Tarif, Modale WhatsApp, Mobile Drawer & Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. Sticky Navbar & Header Shadow
     -------------------------------------------------------------------------- */
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* --------------------------------------------------------------------------
     2. Mobile Menu Drawer & Overlay
     -------------------------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav .nav-link');

  function toggleMobileMenu() {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }
  if (overlay) {
    overlay.addEventListener('click', toggleMobileMenu);
  }
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  /* --------------------------------------------------------------------------
     3. Dakar Express Rate Calculator Matrix
     -------------------------------------------------------------------------- */
  const zoneDepartureSelect = document.getElementById('departZone');
  const zoneArrivalSelect = document.getElementById('arriveeZone');
  const simPriceElement = document.getElementById('simPrice');
  const simEtaElement = document.getElementById('simEta');
  const simBtn = document.getElementById('simBtn');

  // Matrix zone distance mapping (Zone IDs: 1=Centre, 2=Almadies/Ouakam, 3=Grand Yoff/Parcelles, 4=Banlieue Pikine, 5=Rufisque)
  const zoneRates = {
    'plateau': { zone: 1 },
    'medina': { zone: 1 },
    'fann': { zone: 1 },
    'almadies': { zone: 2 },
    'ngor': { zone: 2 },
    'yoff': { zone: 2 },
    'grand_yoff': { zone: 3 },
    'parcelles': { zone: 3 },
    'pikine': { zone: 4 },
    'guediawaye': { zone: 4 },
    'keur_massar': { zone: 5 },
    'rufisque': { zone: 5 }
  };

  function calculateRate() {
    const depKey = zoneDepartureSelect.value;
    const arrKey = zoneArrivalSelect.value;

    if (!depKey || !arrKey) return;

    const depZone = zoneRates[depKey]?.zone || 1;
    const arrZone = zoneRates[arrKey]?.zone || 1;
    const zoneDiff = Math.abs(depZone - arrZone);

    let price = 1500;
    let eta = "20 - 30 min";

    if (depKey === arrKey) {
      price = 1500;
      eta = "15 - 25 min";
    } else if (zoneDiff === 1) {
      price = 2000;
      eta = "30 - 40 min";
    } else if (zoneDiff === 2) {
      price = 2500;
      eta = "35 - 45 min";
    } else if (zoneDiff === 3) {
      price = 3500;
      eta = "45 - 60 min";
    } else {
      price = 4500;
      eta = "60 - 75 min";
    }

    // Animate price count-up
    animateValue(simPriceElement, parseInt(simPriceElement.textContent.replace(/\D/g, '')) || 1500, price, 400);
    simEtaElement.textContent = `Temps estimé : ~${eta}`;
  }

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = Math.floor(progress * (end - start) + start);
      obj.innerHTML = `${currentVal.toLocaleString('fr-FR')} <span class="price-currency">FCFA</span>`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  if (zoneDepartureSelect && zoneArrivalSelect) {
    zoneDepartureSelect.addEventListener('change', calculateRate);
    zoneArrivalSelect.addEventListener('change', calculateRate);
  }

  if (simBtn) {
    simBtn.addEventListener('click', (e) => {
      e.preventDefault();
      calculateRate();
      openOrderModal();
      showToast("Estimation chargée ! Remplissez vos coordonnées pour valider.");
    });
  }

  /* --------------------------------------------------------------------------
     4. Order Modal & WhatsApp Generator
     -------------------------------------------------------------------------- */
  const modalBackdrop = document.getElementById('orderModal');
  const modalCloseBtn = document.getElementById('modalClose');
  const orderBtns = document.querySelectorAll('.js-open-order');
  const orderForm = document.getElementById('orderForm');

  function openOrderModal(planName = '') {
    if (modalBackdrop) {
      modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (planName) {
        const noteField = document.getElementById('orderNotes');
        if (noteField) noteField.value = `Formule choisie : ${planName}`;
      }
    }
  }

  function closeOrderModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  orderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || '';
      openOrderModal(plan);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeOrderModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeOrderModal();
      }
    });
  }

  // Submit Order Form -> WhatsApp Direct Message
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value;
      const phone = document.getElementById('clientPhone').value;
      const depart = document.getElementById('orderDepart').value;
      const arrivee = document.getElementById('orderArrivee').value;
      const details = document.getElementById('orderDetails').value;
      const notes = document.getElementById('orderNotes').value;

      const waPhone = "221778900000"; // Numéro WhatsApp LivrExpress Dakar

      let message = `🚀 *NULLE COMMANDE LIVREXPRESS DAKAR*\n\n`;
      message += `👤 *Client:* ${name}\n`;
      message += `📞 *Téléphone:* ${phone}\n`;
      message += `📍 *Départ (Enlèvement):* ${depart}\n`;
      message += `🏁 *Arrivée (Livraison):* ${arrivee}\n`;
      message += `📦 *Nature du colis:* ${details}\n`;
      if (notes) message += `📝 *Notes/Offre:* ${notes}\n`;
      message += `\nMerci de confirmer la prise en charge immédiate !`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${waPhone}?text=${encodedMsg}`;

      closeOrderModal();
      showToast("REDIRECTION WHATSAPP... Votre livreur est prêt !");
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    });
  }

  /* --------------------------------------------------------------------------
     5. Toast Notification System
     -------------------------------------------------------------------------- */
  function showToast(text) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas fa-check-circle" style="color:#00C853; font-size:1.3rem;"></i> <span>${text}</span>`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  /* --------------------------------------------------------------------------
     6. Active Nav Link on Scroll Highlight
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

  /* --------------------------------------------------------------------------
     7. FAQ Accordion Toggle
     -------------------------------------------------------------------------- */
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const faqItem = btn.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

});

