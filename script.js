/* ========================================
   Mycelium — Interactive Scripts
   ======================================== */

// Navigation scroll effect
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    nav.classList.toggle('nav--scrolled', currentScroll > 50);
    lastScroll = currentScroll;
});

// Mobile menu
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('nav__menu--open');
});

navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('nav__menu--open');
    });
});

// Scroll reveal
const revealElements = document.querySelectorAll(
    '.section__header, .vision__text, .vision__stats, .ecosystem__card, ' +
    '.technology__item, .impact__card, .cta__content'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal--visible');
            }
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

revealElements.forEach(el => revealObserver.observe(el));

// Stat counter animation
const statNumbers = document.querySelectorAll('.stat__number[data-count]');

const counterObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 1500;
                const start = performance.now();

                function update(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(target * eased);
                    if (progress < 1) requestAnimationFrame(update);
                }

                requestAnimationFrame(update);
                counterObserver.unobserve(el);
            }
        });
    },
    { threshold: 0.5 }
);

statNumbers.forEach(el => counterObserver.observe(el));

// Hero canvas — synapse filament visualization
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let filaments = [];
let pulses = [];
let animationId;
let time = 0;

function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    initFilaments();
}

function initFilaments() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    filaments = [];
    pulses = [];

    const count = Math.floor((w * h) / 40000) + 6;

    for (let i = 0; i < count; i++) {
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        const points = generateBranch(startX, startY, w, h);
        filaments.push({
            points,
            baseOpacity: Math.random() * 0.15 + 0.05,
            phaseOffset: Math.random() * Math.PI * 2,
            width: Math.random() * 1.2 + 0.4,
        });

        // Add sub-branches
        const branchCount = Math.floor(Math.random() * 3) + 1;
        for (let b = 0; b < branchCount; b++) {
            const branchIdx = Math.floor(Math.random() * (points.length - 2)) + 1;
            const bp = points[branchIdx];
            const subPoints = generateBranch(bp.x, bp.y, w, h, true);
            filaments.push({
                points: subPoints,
                baseOpacity: Math.random() * 0.1 + 0.03,
                phaseOffset: Math.random() * Math.PI * 2,
                width: Math.random() * 0.8 + 0.3,
            });
        }
    }
}

function generateBranch(startX, startY, w, h, isSubBranch) {
    const points = [{ x: startX, y: startY }];
    const segCount = isSubBranch ? Math.floor(Math.random() * 6) + 3 : Math.floor(Math.random() * 10) + 6;
    const segLen = isSubBranch ? Math.random() * 30 + 15 : Math.random() * 50 + 25;
    let angle = Math.random() * Math.PI * 2;

    for (let i = 0; i < segCount; i++) {
        angle += (Math.random() - 0.5) * 1.2;
        const last = points[points.length - 1];
        const nx = last.x + Math.cos(angle) * segLen;
        const ny = last.y + Math.sin(angle) * segLen;
        points.push({ x: nx, y: ny });
    }
    return points;
}

function spawnPulse() {
    if (filaments.length === 0) return;
    const fi = Math.floor(Math.random() * filaments.length);
    const filament = filaments[fi];
    pulses.push({
        filamentIndex: fi,
        progress: 0,
        speed: Math.random() * 0.008 + 0.004,
        intensity: Math.random() * 0.6 + 0.4,
        size: Math.random() * 6 + 3,
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

    // Spawn pulses periodically
    if (Math.random() < 0.06) spawnPulse();

    // Draw filaments
    for (const fil of filaments) {
        const pts = fil.points;
        if (pts.length < 2) continue;

        const breathe = Math.sin(time * 0.8 + fil.phaseOffset) * 0.5 + 0.5;
        const alpha = fil.baseOpacity + breathe * 0.06;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length - 1; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = fil.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Subtle glow layer
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.lineWidth = fil.width + 2;
        ctx.stroke();
    }

    // Draw pulses (traveling light along filaments)
    for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress > 1) {
            pulses.splice(i, 1);
            continue;
        }

        const fil = filaments[pulse.filamentIndex];
        const pos = getPointOnFilament(fil.points, pulse.progress);
        const fadeIn = Math.min(pulse.progress * 5, 1);
        const fadeOut = Math.min((1 - pulse.progress) * 5, 1);
        const alpha = pulse.intensity * fadeIn * fadeOut;

        // Bright core
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulse.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(220, 240, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(200, 220, 255, 0)`);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Outer glow
        const outerGlow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulse.size * 3);
        outerGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.15})`);
        outerGlow.addColorStop(1, `rgba(200, 220, 255, 0)`);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();
