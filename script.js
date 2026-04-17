// ==========================================
// LARRABY - INTERACCIONES DE LA WEB
// - Menú móvil
// - Navbar con estado al hacer scroll
// - Scroll suave con offset para header fijo
// - Animaciones al entrar en viewport
// - Validación básica del formulario
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  const animatedElements = document.querySelectorAll("[data-animate]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ==========================================
  // UTILIDADES
  // ==========================================
  const getHeaderOffset = () => (header ? header.offsetHeight + 12 : 96);

  const scrollToTarget = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return false;

    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });

    return true;
  };

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  };

  // ==========================================
  // HEADER EN SCROLL
  // ==========================================
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  // ==========================================
  // MENÚ MÓVIL
  // ==========================================
  const openMenu = () => {
    if (!menuToggle || !siteNav) return;
    body.classList.add("menu-open");
    menuToggle.classList.add("is-open");
    siteNav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    if (!menuToggle || !siteNav) return;
    body.classList.remove("menu-open");
    menuToggle.classList.remove("is-open");
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.contains("is-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = siteNav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (window.innerWidth <= 980 && siteNav.classList.contains("is-open") && !clickedInsideMenu && !clickedToggle) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  // ==========================================
  // SCROLL SUAVE PARA ANCLAS INTERNAS
  // ==========================================
  const openLegalByHash = (hash) => {
    if (!hash) return;

    const target = document.querySelector(hash);
    if (target && target.tagName.toLowerCase() === "details") {
      target.open = true;
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.getAttribute("href");
      if (!targetSelector || targetSelector === "#") return;

      const target = document.querySelector(targetSelector);
      if (!target) return;

      event.preventDefault();

      if (link.dataset.openLegal) {
        openLegalByHash(targetSelector);
      }

      scrollToTarget(targetSelector);
      closeMenu();

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", targetSelector);
      }
    });
  });

  if (window.location.hash) {
    openLegalByHash(window.location.hash);
    window.setTimeout(() => {
      scrollToTarget(window.location.hash);
    }, 80);
  }

  window.addEventListener("hashchange", () => {
    openLegalByHash(window.location.hash);
  });

  // ==========================================
  // ENLACES ACTIVOS SEGÚN SECCIÓN VISIBLE
  // ==========================================
  const navMap = new Map(
    Array.from(document.querySelectorAll('.nav-link[href^="#"]')).map((link) => [
      link.getAttribute("href").replace("#", ""),
      link
    ])
  );

  const trackedSections = [
    { id: "inicio", navKey: "inicio" },
    { id: "soluciones", navKey: "soluciones" },
    { id: "tecnologias", navKey: "soluciones" },
    { id: "clientes", navKey: "soluciones" },
    { id: "acceso-apps", navKey: "acceso-apps" },
    { id: "contacto", navKey: "contacto" }
  ].filter((item) => document.getElementById(item.id));

  if ("IntersectionObserver" in window && trackedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const trackedSection = trackedSections.find((item) => item.id === entry.target.id);
          if (!trackedSection) return;

          navMap.forEach((navLink) => navLink.classList.remove("active"));
          const activeLink = navMap.get(trackedSection.navKey);
          if (activeLink) {
            activeLink.classList.add("active");
          }
        });
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: 0.01
      }
    );

    trackedSections.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) sectionObserver.observe(section);
    });
  }

  // ==========================================
  // ANIMACIONES DE ENTRADA EN VIEWPORT
  // ==========================================
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    animatedElements.forEach((element) => revealObserver.observe(element));
  } else {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
  }

  // ==========================================
  // PREFILL DE MENSAJE DESDE TARJETAS DE SERVICIO
  // ==========================================
  const messageField = document.getElementById("message");
  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!messageField) return;
      if (messageField.value.trim()) return;

      const serviceName = button.dataset.service || "el servicio seleccionado";
      messageField.value = `Hola, me gustaría recibir más información sobre ${serviceName}.`;
    });
  });

  // ==========================================
  // VALIDACIÓN BÁSICA DEL FORMULARIO
  // ==========================================
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm) {
    const fields = {
      name: {
        element: document.getElementById("name"),
        validator: (value) => value.trim().length >= 2,
        error: "Introduce tu nombre."
      },
      email: {
        element: document.getElementById("email"),
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        error: "Introduce un email válido."
      },
      company: {
        element: document.getElementById("company"),
        validator: (value) => value.trim().length >= 2,
        error: "Indica el nombre de tu empresa."
      },
      message: {
        element: document.getElementById("message"),
        validator: (value) => value.trim().length >= 12,
        error: "Escribe un mensaje con algo más de detalle."
      }
    };

    const setFieldError = (element, message = "") => {
      if (!element) return;
      const field = element.closest(".form-field");
      if (!field) return;

      field.classList.toggle("has-error", Boolean(message));
      const errorElement = field.querySelector(".field-error");
      if (errorElement) {
        errorElement.textContent = message;
      }
    };

    const validateField = (fieldKey) => {
      const fieldConfig = fields[fieldKey];
      if (!fieldConfig || !fieldConfig.element) return true;

      const isValid = fieldConfig.validator(fieldConfig.element.value);
      setFieldError(fieldConfig.element, isValid ? "" : fieldConfig.error);
      return isValid;
    };

    Object.keys(fields).forEach((fieldKey) => {
      const field = fields[fieldKey].element;
      if (!field) return;

      field.addEventListener("blur", () => {
        validateField(fieldKey);
      });

      field.addEventListener("input", () => {
        validateField(fieldKey);
        if (formStatus && formStatus.textContent) {
          formStatus.textContent = "";
          formStatus.className = "form-status";
        }
      });
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      let formIsValid = true;
      let firstInvalidField = null;

      Object.keys(fields).forEach((fieldKey) => {
        const isValid = validateField(fieldKey);
        if (!isValid) {
          formIsValid = false;
          if (!firstInvalidField) {
            firstInvalidField = fields[fieldKey].element;
          }
        }
      });

      if (!formIsValid) {
        if (formStatus) {
          formStatus.textContent = "Revisa los campos marcados para continuar.";
          formStatus.className = "form-status is-error";
        }
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
        return;
      }

      if (formStatus) {
        formStatus.textContent =
          "Formulario validado correctamente. Esta demo local ya está preparada para conectarse a tu backend o servicio de formularios.";
        formStatus.className = "form-status is-success";
      }

      contactForm.reset();
      Object.keys(fields).forEach((fieldKey) => {
        const field = fields[fieldKey].element;
        if (field) setFieldError(field, "");
      });
    });
  }

  // ==========================================
  // AÑO DINÁMICO EN FOOTER
  // ==========================================
  const currentYear = document.getElementById("currentYear");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear().toString();
  }
});