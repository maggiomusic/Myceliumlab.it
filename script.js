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

// Hero canvas — mycelium network visualization
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let nodes = [];
let animationId;

function resize() {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    initNodes();
}

function initNodes() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const count = Math.floor((w * h) / 12000);
    nodes = [];

    for (let i = 0; i < count; i++) {
        nodes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
        });
    }
}

function draw() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    const connectionDistance = 120;

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                const alpha = (1 - dist / connectionDistance) * 0.15;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    // Draw and update nodes
    for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${node.opacity})`;
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
    }

    animationId = requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();
