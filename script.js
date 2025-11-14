const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const root = document.documentElement;
const body = document.body;
const navLinks = selectAll(".primary-nav a");
const panelTargets = selectAll("[data-panel-target]");
const helpToggle = select("#helpToggle");
const helpPanel = select("#helpPanel");
const helpClose = helpPanel?.querySelector(".help-close");
const soundscape = select("#soundscape");
const parallaxLayers = selectAll("[data-depth]");
const panelScrim = select("#panelScrim");
const panelCloseFab = select("#panelCloseFab");
const navDotToggle = select("#navDotToggle");
const mobileNav = select("#mobileNav");
const heroSection = select("#hero");
const panels = new Map();
selectAll(".panel").forEach((panel) => panels.set(panel.id, panel));
const cardElements = selectAll("[data-card]");
const homeButtons = selectAll("[data-home-button]");

const toggleHelpPanel = (forceState) => {
    if (!helpPanel) return;
    const shouldOpen = forceState ?? helpPanel.hidden;
    helpPanel.hidden = !shouldOpen;
    helpToggle?.setAttribute("aria-expanded", (!helpPanel.hidden).toString());
};

helpToggle?.addEventListener("click", () => toggleHelpPanel());
helpClose?.addEventListener("click", () => toggleHelpPanel(false));

document.addEventListener("click", (event) => {
    if (!helpPanel || helpPanel.hidden) return;
    if (event.target === helpPanel || helpPanel.contains(event.target) || event.target === helpToggle) return;
    toggleHelpPanel(false);
});

let mobileNavOpen = false;
const setMobileNavState = (open) => {
    if (!mobileNav || !navDotToggle) return;
    if (open === mobileNavOpen) return;
    if (open) {
        mobileNav.hidden = false;
        requestAnimationFrame(() => mobileNav.classList.add("is-visible"));
    } else {
        mobileNav.classList.remove("is-visible");
        const finalize = () => {
            if (!mobileNav.classList.contains("is-visible")) {
                mobileNav.hidden = true;
            }
        };
        mobileNav.addEventListener("transitionend", finalize, { once: true });
        window.setTimeout(finalize, 300);
    }
    mobileNavOpen = open;
    navDotToggle.setAttribute("aria-expanded", open.toString());
};

const closeMobileNav = () => setMobileNavState(false);

const toggleMobileNav = () => setMobileNavState(!mobileNavOpen);

navDotToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMobileNav();
});

mobileNav?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("[data-panel-target]")) {
        closeMobileNav();
    }
});

document.addEventListener("click", (event) => {
    if (!mobileNavOpen) return;
    if (event.target === navDotToggle || navDotToggle?.contains(event.target)) return;
    if (mobileNav?.contains(event.target)) return;
    closeMobileNav();
});

class Carousel {
    constructor(root) {
        this.root = root;
        this.id = root.dataset.carousel;
        this.loop = root.dataset.loop === "true";
        this.strip = select("[data-strip]", root);
        this.cards = selectAll(".info-card", this.strip);
        this.prev = select("[data-carousel-prev]", root);
        this.next = select("[data-carousel-next]", root);
        this.indicators = select("[data-indicators]", root);
        this.dots = [];
        this.index = 0;
        this.dragState = { active: false, startX: 0, scrollLeft: 0 };
        this.scrollFrame = null;
        this.buildIndicators();
        this.bindEvents();
        this.updateIndicators(0);
    }

    buildIndicators() {
        if (!this.indicators) return;
        this.indicators.innerHTML = "";
        this.dots = this.cards.map((card, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.setAttribute("aria-label", `Go to slide ${index + 1}`);
            button.addEventListener("click", () => this.scrollTo(index));
            this.indicators.appendChild(button);
            return button;
        });
        if (this.dots.length) {
            this.dots[0].classList.add("is-active");
        }
    }

    bindEvents() {
        this.prev?.addEventListener("click", () => this.step(-1));
        this.next?.addEventListener("click", () => this.step(1));
        this.strip.addEventListener("scroll", () => {
            if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
            this.scrollFrame = requestAnimationFrame(() => this.updateIndexFromScroll());
        });
        this.strip.addEventListener("pointerdown", (event) => this.startDrag(event));
        this.strip.addEventListener("pointermove", (event) => this.performDrag(event));
        const endDrag = (event) => this.stopDrag(event);
        this.strip.addEventListener("pointerup", endDrag);
        this.strip.addEventListener("pointercancel", endDrag);
        this.strip.addEventListener("pointerleave", endDrag);
    }

    startDrag(event) {
        this.dragState.active = true;
        this.dragState.startX = event.clientX;
        this.dragState.scrollLeft = this.strip.scrollLeft;
        this.strip.setPointerCapture(event.pointerId);
        this.strip.classList.add("is-dragging");
    }

    performDrag(event) {
        if (!this.dragState.active) return;
        const delta = event.clientX - this.dragState.startX;
        this.strip.scrollLeft = this.dragState.scrollLeft - delta;
    }

    stopDrag(event) {
        if (!this.dragState.active) return;
        this.dragState.active = false;
        this.strip.classList.remove("is-dragging");
        try {
            this.strip.releasePointerCapture(event.pointerId);
        } catch {
            // ignore when capture is already released
        }
    }

    step(delta) {
        if (!this.cards.length) return;
        if (this.loop) {
            const total = this.cards.length;
            const targetIndex = (this.index + delta + total) % total;
            this.scrollTo(targetIndex);
            return;
        }
        this.scrollTo(this.index + delta);
    }

    scrollTo(targetIndex) {
        if (!this.cards.length) return;
        let index = targetIndex;
        if (this.loop) {
            const total = this.cards.length;
            index = ((targetIndex % total) + total) % total;
        } else {
            index = Math.max(0, Math.min(targetIndex, this.cards.length - 1));
        }
        const target = this.cards[index];
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        }
    }

    updateIndexFromScroll() {
        const left = this.strip.scrollLeft;
        const closest = this.cards.reduce(
            (result, card, index) => {
                const distance = Math.abs(card.offsetLeft - left);
                if (distance < result.distance) {
                    return { index, distance };
                }
                return result;
            },
            { index: 0, distance: Number.POSITIVE_INFINITY }
        );
        this.updateIndicators(closest.index);
    }

    updateIndicators(activeIndex) {
        this.index = activeIndex;
        if (!this.dots.length) return;
        this.dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === activeIndex);
        });
    }
}

const carouselInstances = new Map();
selectAll("[data-carousel]").forEach((carouselRoot) => {
    const instance = new Carousel(carouselRoot);
    carouselInstances.set(carouselRoot.dataset.carousel, instance);
});

const setActiveNav = (sectionId) => {
    navLinks.forEach((link) => {
        const isActive = Boolean(sectionId && link.dataset.nav === sectionId);
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "true");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

const closePanelButtons = selectAll("[data-close-panel]");
const heroScene = heroSection?.dataset.scene || "dawn";
let activeCarousel = null;
let openPanelId = null;

const showPanelScrim = () => {
    if (!panelScrim) return;
    panelScrim.hidden = false;
    requestAnimationFrame(() => {
        panelScrim.classList.add("is-visible");
        document.body.classList.add("panel-open-scroll-lock");
    });
};

const hidePanelScrim = () => {
    if (!panelScrim) return;
    panelScrim.classList.remove("is-visible");
    document.body.classList.remove("panel-open-scroll-lock");
};

panelScrim?.addEventListener("transitionend", (event) => {
    if (event.target === panelScrim && !panelScrim.classList.contains("is-visible")) {
        panelScrim.hidden = true;
        document.body.classList.remove("panel-open-scroll-lock");
    }
});

const focusHero = () => {
    const firstCTA = heroSection?.querySelector(".hero-nav-btn");
    if (firstCTA) {
        firstCTA.focus({ preventScroll: true });
    }
};

const openPanel = (panelId) => {
    if (!panelId || !panels.has(panelId)) return;
    if (openPanelId === panelId) return;
    if (openPanelId) {
        closePanel({ restoreFocus: false, keepScrim: true });
    }
    const panel = panels.get(panelId);
    if (!panel) return;
    openPanelId = panelId;
    body.setAttribute("data-panel-open", "true");
    panelCloseFab?.removeAttribute("hidden");
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => panel.classList.add("panel--active"));
    showPanelScrim();
    closeMobileNav();
    setActiveNav(panelId);
    body.dataset.scene = panel.dataset.scene || heroScene;
    const carouselKey = select("[data-carousel]", panel)?.dataset.carousel;
    activeCarousel = carouselKey ? carouselInstances.get(carouselKey) ?? null : null;
    if (!panel.hasAttribute("tabindex")) {
        panel.setAttribute("tabindex", "-1");
    }
    try {
        panel.focus({ preventScroll: true });
    } catch {
        // focus not supported
    }
};

const closePanel = ({ restoreFocus = true, keepScrim = false } = {}) => {
    if (!openPanelId) {
        if (!keepScrim) {
            hidePanelScrim();
        }
        if (restoreFocus) {
            focusHero();
        }
        return;
    }
    const panel = panels.get(openPanelId);
    if (panel) {
        panel.classList.remove("panel--active");
        panel.setAttribute("aria-hidden", "true");
        const finalize = () => {
            panel.hidden = true;
        };
        panel.addEventListener("transitionend", finalize, { once: true });
        window.setTimeout(() => {
            if (!panel.hidden && !panel.classList.contains("panel--active")) {
                finalize();
            }
        }, 520);
    }
    openPanelId = null;
    activeCarousel = null;
    setActiveNav(null);
    body.removeAttribute("data-panel-open");
    body.dataset.scene = heroScene;
    if (!keepScrim) {
        hidePanelScrim();
        panelCloseFab?.setAttribute("hidden", "hidden");
    }
    closeAllCards();
    if (restoreFocus) {
        focusHero();
    }
};

panelTargets.forEach((target) => {
    target.addEventListener("click", (event) => {
        event.preventDefault();
        openPanel(target.dataset.panelTarget);
    });
});

closePanelButtons.forEach((button) => button.addEventListener("click", () => closePanel()));
panelScrim?.addEventListener("click", () => closePanel());
panelCloseFab?.addEventListener("click", () => closePanel());
setActiveNav(null);
homeButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
        closePanel();
        closeMobileNav();
        heroSection?.scrollIntoView({ behavior: "smooth" });
    })
);

const pointerOffset = { x: 0, y: 0 };
let scrollOffset = 0;

const applyParallax = () => {
    parallaxLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth) || 0;
        const translateX = pointerOffset.x * depth;
        const translateY = pointerOffset.y * depth + scrollOffset * depth;
        layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
};

const updateSceneShift = (clientX, clientY) => {
    const { innerWidth, innerHeight } = window;
    const normalized = Math.min(Math.max(clientY / innerHeight, 0), 1) * 0.75 + Math.min(Math.max(clientX / innerWidth, 0), 1) * 0.25;
    root.style.setProperty("--scene-shift", Math.min(Math.max(normalized, 0), 1).toFixed(3));
};

document.addEventListener("pointermove", (event) => {
    const { innerWidth, innerHeight } = window;
    pointerOffset.x = (event.clientX / innerWidth - 0.5) * 50;
    pointerOffset.y = (event.clientY / innerHeight - 0.5) * 25;
    updateSceneShift(event.clientX, event.clientY);
    applyParallax();
});

window.addEventListener(
    "scroll",
    () => {
        scrollOffset = window.scrollY * 0.05;
        applyParallax();
        updateSceneShift(window.innerWidth / 2, (window.scrollY % window.innerHeight) || window.innerHeight / 2);
    },
    { passive: true }
);

applyParallax();
updateSceneShift(window.innerWidth / 2, window.innerHeight / 2);

cardElements.forEach((card) => {
    card.dataset.flipped = "false";
    const toggles = selectAll(".card-toggle", card);
    toggles.forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.addEventListener("click", (event) => {
            event.stopPropagation();
            const flipped = card.dataset.flipped === "true";
            const nextState = (!flipped).toString();
            card.dataset.flipped = nextState;
            toggles.forEach((btn) => btn.setAttribute("aria-expanded", nextState));
        });
    });
});

const closeAllCards = () => {
    cardElements.forEach((card) => {
        if (card.dataset.flipped === "true") {
            card.dataset.flipped = "false";
            selectAll(".card-toggle", card).forEach((btn) => btn.setAttribute("aria-expanded", "false"));
        }
    });
};

const toggleAudio = async () => {
    if (!soundscape) return;
    try {
        if (soundscape.paused) {
            await soundscape.play();
            body.dataset.sound = "on";
        } else {
            soundscape.pause();
            body.dataset.sound = "off";
        }
    } catch (error) {
        console.warn("Unable to toggle audio", error);
    }
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeAllCards();
        toggleHelpPanel(false);
        closePanel();
        closeMobileNav();
    }
    if (["KeyM", "KeyP", "KeyS", " "].includes(event.code)) {
        event.preventDefault();
        toggleAudio();
    }
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
        if (activeCarousel) {
            event.preventDefault();
            activeCarousel.step(-1);
        }
    }
    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
        if (activeCarousel) {
            event.preventDefault();
            activeCarousel.step(1);
        }
    }
});

window.addEventListener("resize", () => {
    applyParallax();
    if (window.innerWidth > 1024) {
        closeMobileNav();
    }
});
