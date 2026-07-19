/* ========================================
   Mycelium Lab — Interactive scripts
   ======================================== */

// --- Mobile sidenav toggle ---
const sidenav = document.getElementById('sidenav');
const mobilenavToggle = document.getElementById('mobilenavToggle');

mobilenavToggle.addEventListener('click', () => {
    sidenav.classList.toggle('is-open');
});

sidenav.querySelectorAll('.sidenav__link').forEach(link => {
    link.addEventListener('click', () => sidenav.classList.remove('is-open'));
});

// --- Scrollspy: highlight active section in sidenav ---
const sections = Array.from(document.querySelectorAll('.page'));
const navLinks = Array.from(document.querySelectorAll('.sidenav__link'));

const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(l => {
                l.classList.toggle('is-active', l.dataset.target === id);
            });
        }
    });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

sections.forEach(s => spy.observe(s));

// --- Caratteristiche: selettore gamma Mycelium Node / GreenCare ---
const rangeTabs = Array.from(document.querySelectorAll('.range__tab'));

if (rangeTabs.length) {
    function selectRange(tab) {
        rangeTabs.forEach(t => {
            const on = t === tab;
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', String(on));
            // Solo la tab attiva resta nel flusso di Tab: le frecce muovono fra le gamme.
            t.tabIndex = on ? 0 : -1;
            if (!panel) return;
            panel.hidden = !on;
            panel.classList.toggle('is-active', on);
        });
    }

    rangeTabs.forEach(tab => {
        tab.addEventListener('click', () => selectRange(tab));

        tab.addEventListener('keydown', (e) => {
            const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (!dir) return;
            e.preventDefault();
            const next = rangeTabs[(rangeTabs.indexOf(tab) + dir + rangeTabs.length) % rangeTabs.length];
            selectRange(next);
            next.focus();
        });
    });

    // L'hash apre direttamente una gamma (utile per link, QR e campagne).
    // Gli alias sono grafie alternative che portano allo stesso tab; l'URL
    // canonico resta il nome della gamma (#greencare, #harvest).
    const RANGE_ALIASES = { harvester: 'harvest' };

    function openRangeFromHash() {
        const hash = location.hash.replace('#', '').toLowerCase();
        if (!hash) return;
        const range = RANGE_ALIASES[hash] || hash;
        const tab = rangeTabs.find(t => t.dataset.range === range);
        if (tab && !tab.classList.contains('is-active')) selectRange(tab);
    }

    openRangeFromHash();
    window.addEventListener('hashchange', openRangeFromHash);
}

// --- Mycelium Node: label click opens a full-screen popup ---
const nodeLabels = document.querySelectorAll('.node__label');
const popup = document.getElementById('nodePopup');
const popupContent = popup?.querySelector('.node__popup-content');
const popupClose = document.getElementById('nodePopupClose');
const backdrop = document.getElementById('nodeBackdrop');
const specsTemplate = document.getElementById('nodeSpecs');

function openPopup(specEl) {
    if (!popup || !popupContent) return;
    popupContent.innerHTML = '';
    Array.from(specEl.children).forEach(child => popupContent.appendChild(child.cloneNode(true)));
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    backdrop?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    if (!popup) return;
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    backdrop?.classList.remove('is-open');
    nodeLabels.forEach(l => l.classList.remove('is-active'));
    document.body.style.overflow = '';
}

nodeLabels.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const spec = btn.dataset.spec;
        nodeLabels.forEach(l => l.classList.toggle('is-active', l === btn));
        const node = specsTemplate.content.querySelector(`[data-spec="${spec}"]`);
        if (node) openPopup(node);
    });
});

popupClose?.addEventListener('click', closePopup);
backdrop?.addEventListener('click', closePopup);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup?.classList.contains('is-open')) closePopup();
});

// --- Volantino Green Care: aperto all'avvio, si riduce a icona dopo ~10s ---
const flyer = document.getElementById('greenCareFlyer');

if (flyer) {
    const flyerPill = document.getElementById('greenCarePill');
    const flyerClose = document.getElementById('greenCareClose');
    const flyerZoom = document.getElementById('greenCareZoom');
    const flyerBackdrop = document.getElementById('greenCareBackdrop');
    const AUTO_COLLAPSE_MS = 10000;
    let collapseTimer;

    // Stati: 'icon' (pill) -> 'open' (volantino) -> 'zoom' (al doppio)
    function setFlyerState(state) {
        flyer.dataset.state = state;
        flyerPill.setAttribute('aria-expanded', String(state !== 'icon'));
        flyerZoom.setAttribute('aria-pressed', String(state === 'zoom'));
        flyerZoom.setAttribute('aria-label',
            state === 'zoom' ? 'Riporta il volantino alla dimensione normale'
                             : 'Ingrandisci il volantino al doppio');
        // Lo zoom è uno stato di lettura attiva: non va memorizzato né chiuso da solo.
        // Blocca anche lo scroll: pannello e backdrop sono fixed e, senza blocco,
        // resterebbero sospesi sopra le sezioni successive alla home.
        if (state === 'zoom') {
            clearTimeout(collapseTimer);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            sessionStorage.setItem('greencare-flyer', state);
        }
    }

    function scheduleCollapse() {
        clearTimeout(collapseTimer);
        collapseTimer = setTimeout(() => {
            // Non chiudere sotto il cursore dell'utente: riprova più tardi.
            if (flyer.matches(':hover')) return scheduleCollapse();
            setFlyerState('icon');
        }, AUTO_COLLAPSE_MS);
    }

    // Chi ha già ridotto il volantino in questa sessione lo ritrova ridotto.
    if (sessionStorage.getItem('greencare-flyer') === 'icon') {
        setFlyerState('icon');
    } else {
        scheduleCollapse();
    }

    flyerPill.addEventListener('click', () => {
        setFlyerState('open');
        scheduleCollapse();
    });

    flyerClose.addEventListener('click', () => {
        clearTimeout(collapseTimer);
        setFlyerState('icon');
    });

    flyerZoom.addEventListener('click', () => {
        if (flyer.dataset.state === 'zoom') {
            setFlyerState('open');
            scheduleCollapse();
        } else {
            setFlyerState('zoom');
        }
    });

    // Dal backdrop si torna al volantino, non alla pill: chiude lo zoom, non tutto.
    flyerBackdrop.addEventListener('click', () => {
        setFlyerState('open');
        scheduleCollapse();
    });

    // La sidenav resta sopra il backdrop (z-index a livello di root): chi la usa
    // sta lasciando la home, quindi lo zoom si chiude e sblocca lo scroll.
    sidenav.querySelectorAll('.sidenav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (flyer.dataset.state === 'zoom') setFlyerState('icon');
        });
    });

    // Esc scende di un livello per volta: zoom -> volantino -> pill.
    // Se è aperto il popup Caratteristiche, l'Esc è suo.
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (popup?.classList.contains('is-open')) return;
        if (flyer.dataset.state === 'zoom') {
            setFlyerState('open');
            scheduleCollapse();
        } else if (flyer.dataset.state === 'open') {
            clearTimeout(collapseTimer);
            setFlyerState('icon');
        }
    });
}

// --- Gallerie a scorrimento automatico (Applicazioni e hero GreenCare) ---
function initGallery({ rail, dots, itemSelector, dotClass, interval = 4500 }) {
    if (!rail) return;
    const items = Array.from(rail.querySelectorAll(itemSelector));
    if (items.length < 2) return;   // una sola immagine: niente pallini ne' autoscroll

    let currentIdx = 0;
    let paused = false;

    // Build pagination dots
    if (dots) {
        items.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = dotClass + (i === 0 ? ' is-active' : '');
            dot.setAttribute('aria-label', `Vai a immagine ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dots.appendChild(dot);
        });
    }

    function goTo(i) {
        currentIdx = (i + items.length) % items.length;
        const item = items[currentIdx];
        if (!item) return;
        rail.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
        syncDots();
    }

    function syncDots() {
        if (!dots) return;
        dots.querySelectorAll('.' + dotClass).forEach((d, idx) => {
            d.classList.toggle('is-active', idx === currentIdx);
        });
    }

    setInterval(() => { if (!paused) goTo(currentIdx + 1); }, interval);

    // Pause on hover / focus, resume on leave
    ['mouseenter', 'focusin'].forEach(ev =>
        rail.addEventListener(ev, () => paused = true));
    ['mouseleave', 'focusout'].forEach(ev =>
        rail.addEventListener(ev, () => paused = false));

    // Sync dots when user scrolls manually (swipe / scrollbar)
    let scrollDebounce;
    rail.addEventListener('scroll', () => {
        clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(() => {
            const closest = items.reduce((best, el, i) => {
                const d = Math.abs(el.offsetLeft - rail.scrollLeft);
                return d < best.d ? { d, i } : best;
            }, { d: Infinity, i: 0 });
            currentIdx = closest.i;
            syncDots();
        }, 120);
    });
}

initGallery({
    rail: document.getElementById('appsRail'),
    dots: document.getElementById('appsDots'),
    itemSelector: '.apps__item',
    dotClass: 'apps__dot',
});

initGallery({
    rail: document.getElementById('gcRail'),
    dots: document.getElementById('gcDots'),
    itemSelector: '.gc__slide',
    dotClass: 'gc__dot',
    interval: 5200,
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll(
    '.page__header, .home__center, .home__copyright, ' +
    '.node__stage, .node__labels, .node__cta, ' +
    '.apps, .visit__image, .visit__info, .values__hero, .values__block, .values__closing, .footer'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

// =========================================
// Background canvas: mycelial filaments
// =========================================

const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let filaments = [];
let pulses = [];
let time = 0;

const ACCENT_R = 236, ACCENT_G = 26, ACCENT_B = 163;

function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    initFilaments();
}

function initFilaments() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    filaments = [];
    pulses = [];

    const count = Math.floor((w * h) / 50000) + 5;

    for (let i = 0; i < count; i++) {
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        const points = generateBranch(startX, startY, false);
        filaments.push({
            points,
            baseOpacity: Math.random() * 0.12 + 0.04,
            phaseOffset: Math.random() * Math.PI * 2,
            width: Math.random() * 1.0 + 0.4,
        });

        const branchCount = Math.floor(Math.random() * 3) + 1;
        for (let b = 0; b < branchCount; b++) {
            const branchIdx = Math.floor(Math.random() * (points.length - 2)) + 1;
            const bp = points[branchIdx];
            const subPoints = generateBranch(bp.x, bp.y, true);
            filaments.push({
                points: subPoints,
                baseOpacity: Math.random() * 0.08 + 0.025,
                phaseOffset: Math.random() * Math.PI * 2,
                width: Math.random() * 0.6 + 0.25,
            });
        }
    }
}

function generateBranch(startX, startY, isSub) {
    const points = [{ x: startX, y: startY }];
    const segCount = isSub ? Math.floor(Math.random() * 6) + 3 : Math.floor(Math.random() * 10) + 6;
    const segLen = isSub ? Math.random() * 30 + 15 : Math.random() * 50 + 25;
    let angle = Math.random() * Math.PI * 2;

    for (let i = 0; i < segCount; i++) {
        angle += (Math.random() - 0.5) * 1.2;
        const last = points[points.length - 1];
        points.push({
            x: last.x + Math.cos(angle) * segLen,
            y: last.y + Math.sin(angle) * segLen,
        });
    }
    return points;
}

function spawnPulse() {
    if (filaments.length === 0) return;
    const fi = Math.floor(Math.random() * filaments.length);
    pulses.push({
        filamentIndex: fi,
        progress: 0,
        speed: Math.random() * 0.007 + 0.003,
        intensity: Math.random() * 0.7 + 0.3,
        size: Math.random() * 5 + 2.5,
    });
}

function getPointOnFilament(points, t) {
    const idx = t * (points.length - 1);
    const i = Math.floor(idx);
    const frac = idx - i;
    if (i >= points.length - 1) return points[points.length - 1];
    return {
        x: points[i].x + (points[i + 1].x - points[i].x) * frac,
        y: points[i].y + (points[i + 1].y - points[i].y) * frac,
    };
}

function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    time += 0.01;

    if (Math.random() < 0.06) spawnPulse();

    for (const fil of filaments) {
        const pts = fil.points;
        if (pts.length < 2) continue;

        const breathe = Math.sin(time * 0.8 + fil.phaseOffset) * 0.5 + 0.5;
        const alpha = fil.baseOpacity + breathe * 0.05;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);

        ctx.strokeStyle = `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, ${alpha})`;
        ctx.lineWidth = fil.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.strokeStyle = `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, ${alpha * 0.25})`;
        ctx.lineWidth = fil.width + 3;
        ctx.stroke();
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) { pulses.splice(i, 1); continue; }

        const fil = filaments[pulse.filamentIndex];
        const pos = getPointOnFilament(fil.points, pulse.progress);
        const fadeIn = Math.min(pulse.progress * 5, 1);
        const fadeOut = Math.min((1 - pulse.progress) * 5, 1);
        const alpha = pulse.intensity * fadeIn * fadeOut;

        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulse.size);
        gradient.addColorStop(0, `rgba(255, 200, 235, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, ${alpha * 0.7})`);
        gradient.addColorStop(1, `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, 0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        const outer = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulse.size * 3);
        outer.addColorStop(0, `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, ${alpha * 0.18})`);
        outer.addColorStop(1, `rgba(${ACCENT_R}, ${ACCENT_G}, ${ACCENT_B}, 0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = outer;
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();
