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

// --- Mycelium Node: clickable bullets ---
const bullets = document.querySelectorAll('.node__bullet');
const detailPanel = document.getElementById('nodeDetail');
const specsTemplate = document.getElementById('nodeSpecs');

bullets.forEach(btn => {
    btn.addEventListener('click', () => {
        const spec = btn.dataset.spec;
        bullets.forEach(b => b.classList.toggle('is-active', b === btn));

        const node = specsTemplate.content.querySelector(`[data-spec="${spec}"]`);
        if (!node) return;

        const clone = node.cloneNode(true);
        detailPanel.innerHTML = '';
        detailPanel.appendChild(clone);
        detailPanel.classList.add('is-populated');
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});

// --- Applicazioni horizontal scroller ---
const appsRail = document.getElementById('appsRail');
const appsPrev = document.getElementById('appsPrev');
const appsNext = document.getElementById('appsNext');

function scrollApps(direction) {
    if (!appsRail) return;
    const first = appsRail.querySelector('.apps__item');
    const step = first ? first.getBoundingClientRect().width + 24 : 400;
    appsRail.scrollBy({ left: direction * step, behavior: 'smooth' });
}

appsPrev?.addEventListener('click', () => scrollApps(-1));
appsNext?.addEventListener('click', () => scrollApps(1));

// --- Contact form: open mail client with prefilled message ---
const contactForm = document.getElementById('contactForm');

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('senderEmail').value.trim();
    const subject = document.getElementById('subject').value.trim();
    if (!email || !subject) return;

    const body = encodeURIComponent(
        `Buongiorno,\n\nVi scrivo da ${email} per la seguente richiesta:\n\n[scrivi qui il tuo messaggio]\n\nGrazie.\n`
    );
    const to = 'federico@myceliumlab.it';
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll(
    '.page__header, .home__center, .home__copyright, ' +
    '.node__stage, .node__detail, .node__cta, ' +
    '.apps, .visit__grid > *, .values__grid > *, .footer'
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
