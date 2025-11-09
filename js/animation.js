/* Premium animations using GSAP */
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const D = (d) => (reduce ? 0 : d);

// ==== 1) Hero intro ====
function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from("#header .logo, #header nav li, #header .theme-toggle", {
    y: -18, opacity: 0, stagger: 0.06, duration: D(0.6)
  })
    .from("#home .hero-title", { y: 24, opacity: 0, duration: D(0.7) }, "-=0.2")
    .from("#home .hero-subtitle", { y: 20, opacity: 0, duration: D(0.6) }, "-=0.35")
    .from("#home .hero-description", { y: 16, opacity: 0, duration: D(0.6) }, "-=0.35")
    .from("#home .cta-buttons .btn", { y: 14, opacity: 0, stagger: 0.08, duration: D(0.5) }, "-=0.35");

  gsap.fromTo("#galaxy", { yPercent: -4 }, { yPercent: 0, duration: D(1.2), ease: "power2.out" });
}

// ==== 2) Scroll progress ====
function scrollProgress() {
  gsap.to("#scrollIndicator", {
    width: "100%", ease: "none",
    scrollTrigger: { scrub: true }
  });
}

// ==== 3) Section reveals ====
function sectionReveals() {
  document.querySelectorAll("section").forEach((sec) => {
    gsap.fromTo(sec, { opacity: 0, y: 28 }, {
      opacity: 1, y: 0, duration: D(0.8), ease: "power2.out",
      scrollTrigger: { trigger: sec, start: "top 80%", toggleActions: "play none none reverse" }
    });
  });
}

// ==== 4) Projects parallax ====
function projectsParallax() {
  gsap.utils.toArray(".projects-grid .project-card").forEach((card) => {
    gsap.fromTo(card, { y: 32, opacity: 0 }, {
      y: 0, opacity: 1, duration: D(0.7), ease: "power2.out",
      scrollTrigger: { trigger: card, start: "top 85%" }
    });

    gsap.to(card, {
      y: -12,
      scrollTrigger: { trigger: card, scrub: true, start: "top bottom", end: "bottom top" }
    });
  });
}

// ==== 5) Skill bars + counter ====
function skillBars() {
  gsap.utils.toArray(".skill-progress").forEach((bar) => {
    const w = parseFloat(bar.getAttribute("data-width")) || 0;
    const parent = bar.closest(".skill-item");
    const label = parent?.querySelector(".skill-header span:last-child");
    gsap.fromTo(bar, { width: "0%" }, {
      width: w + "%", duration: D(0.9), ease: "power2.out",
      scrollTrigger: { trigger: parent, start: "top 80%", once: true },
      onUpdate(self) {
        if (!label) return;
        const current = Math.round(w * self.progress());
        label.textContent = current + "%";
      }
    });
  });
}

// ==== 6) Magnetic buttons + custom cursor ====
function magneticAndCursor() {
  const buttons = gsap.utils.toArray(".btn, .btn-outline");
  const cursor = document.querySelector(".cursor-dot");
  if (!cursor) return;

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      btn.style.setProperty("--mx", x + "px");
      btn.style.setProperty("--my", y + "px");
      gsap.to(btn, { x: (x - r.width/2)*0.05, y: (y - r.height/2)*0.2, duration: D(0.3) });
    });
    btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: D(0.4), ease: "elastic.out(1, .4)" }));
  });

  window.addEventListener("mousemove", (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: D(0.12), ease: "power2.out" });
  });

  document.querySelectorAll("a, button, .btn").forEach((el) => {
    el.addEventListener("mouseenter", () => gsap.to(cursor, { scale: 1.8, duration: D(0.15) }));
    el.addEventListener("mouseleave", () => gsap.to(cursor, { scale: 1, duration: D(0.2) }));
  });
}

// ==== 7) Galaxy mouse parallax ====
function galaxyParallax() {
  const g = document.getElementById("galaxy");
  if (!g) return;
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 6;
    const y = (e.clientY / window.innerHeight - 0.5) * 6;
    gsap.to(g, { xPercent: x, yPercent: y, duration: D(0.6), ease: "power2.out" });
  });
}

// ==== 8) Smart header hide ====
function headerSmartHide() {
  const header = document.querySelector("header");
  if (!header) return;
  ScrollTrigger.create({
    start: 0,
    end: () => document.body.scrollHeight,
    onUpdate: (self) => {
      const y = self.scroll();
      const farDown = y > 120;
      if (self.direction === 1 && farDown) header.classList.add("hide");
      else header.classList.remove("hide");
    }
  });
}

// Boot
window.addEventListener("load", () => {
  heroIntro();
  scrollProgress();
  sectionReveals();
  projectsParallax();
  skillBars();
  magneticAndCursor();
  galaxyParallax();
  headerSmartHide();
});
