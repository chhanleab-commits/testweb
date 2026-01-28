// Basic helpers
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* ---------- NAV TOGGLE & ACTIVE LINKS ---------- */
const navToggle = $('#navToggle');
const navMenu = $('#navMenu');
const navLinks = $$('.nav-link');

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  // swap icon
  navToggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  lucide.createIcons();
});

// close menu on link click (mobile)
navLinks.forEach(a => a.addEventListener('click', () => {
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.innerHTML = '<i data-lucide="menu"></i>';
  lucide.createIcons();
}));

// highlight active nav on scroll
const sections = $$('main section[id]');
function onScroll() {
  const scrollPos = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const id = sec.id;
    const link = $(`a[href="#${id}"]`);
    if (!link) return;
    if (scrollPos >= top && scrollPos < bottom) {
      link.classList.add('active');
    } else link.classList.remove('active');
  });
}
window.addEventListener('scroll', onScroll);
onScroll();

/* ---------- SMOOTH SCROLL for anchor links ---------- */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#' || href === '') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    target.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* ---------- REVEAL ON SCROLL (IntersectionObserver) ---------- */
const reveals = $$('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: 0.15});

reveals.forEach(r => revealObserver.observe(r));

/* ---------- SKILL BARS + COUNTERS ---------- */
const skillFills = $$('.skill-fill');
const skillPercents = $$('.skill-percent');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const fill = entry.target.querySelector('.skill-fill') || entry.target;
    const percentEl = entry.target.querySelector('.skill-percent');
    const value = parseInt(fill.dataset.value || percentEl?.dataset?.value || 0, 10);

    // animate width
    if (fill.style.width === '' || fill.style.width === '0px' || fill.style.width === '0%') {
      fill.style.width = value + '%';
    }

    // animate number
    if (percentEl) {
      let current = 0;
      const step = Math.max(1, Math.floor(value / 30));
      const timer = setInterval(() => {
        current += step;
        if (current >= value) {
          current = value;
          clearInterval(timer);
        }
        percentEl.textContent = current + '%';
      }, 12);
    }
    skillObserver.unobserve(entry.target);
  });
}, {threshold: 0.2});

$$('#skills .skill').forEach(s => skillObserver.observe(s));

/* ---------- BUTTON RIPPLE ---------- */
document.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('.ripple');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  btn.style.setProperty('--r-x', x + 'px');
  btn.style.setProperty('--r-y', y + 'px');
  btn.classList.remove('ripple-animate');
  // force reflow
  void btn.offsetWidth;
  btn.classList.add('ripple-animate');
  setTimeout(() => btn.classList.remove('ripple-animate'), 700);
});

/* ---------- PROJECT MODAL ---------- */
const projectCards = $$('.project-card');
const modal = $('#projectModal');
const modalClose = $('#modalClose');
const projectTitle = $('#projectTitle');
const projectDesc = $('#projectDesc');
const projectTech = $('#projectTech');
const modalDemo = $('#modalDemo');
const modalCode = $('#modalCode');

projectCards.forEach(card => {
  const btn = card.querySelector('.view-btn');
  btn.addEventListener('click', () => {
    const data = JSON.parse(card.dataset.project);
    projectTitle.textContent = data.title;
    projectDesc.textContent = data.desc;
    projectTech.innerHTML = data.tech.map(t => `<span class="tags"><span style="margin-right:8px;background:transparent;color:var(--accent1)">${t}</span></span>`).join('');
    // DEMO button
    if (data.demo) {
      modalDemo.onclick = () => {
        window.open(data.demo, "_blank"); // opens Snake.html in new tab
      };
      modalDemo.style.pointerEvents = "auto";
      modalDemo.style.opacity = "1";
    } else {
      modalDemo.onclick = null;
      modalDemo.style.pointerEvents = "none";
      modalDemo.style.opacity = "0.4"; // dim if no demo
    }

    // CODE button
    if (data.code) {
      modalCode.onclick = () => {
        window.open(data.code, "_blank"); // opens GitHub
      };
      modalCode.style.pointerEvents = "auto";
      modalCode.style.opacity = "1";
    } else {
      modalCode.onclick = null;
      modalCode.style.pointerEvents = "none";
      modalCode.style.opacity = "0.4"; // dim if no code
    }
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}

/* ---------- CONTACT FORM (simple validation + toast) ---------- */
const contactForm = $('#contactForm');
const toast = $('#toast');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const message = $('#message').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill all fields');
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showToast('Enter a valid email');
    return;
  }

  // fake send
  contactForm.reset();
  showToast('Message sent — I will reply soon!', 3500);
});

function showToast(text, duration = 2200){
  toast.textContent = text;
  toast.style.display = 'block';
  setTimeout(()=> {
    toast.style.opacity = '1';
  },10);
  setTimeout(()=> {
    toast.style.opacity = '0';
    setTimeout(()=> toast.style.display='none',400);
  }, duration);
}

/* ---------- INITIALIZE YEAR & small utilities ---------- */
$('#year').textContent = new Date().getFullYear();

/* ensure lucide icons re-render if dynamic HTML changed */
const reInitLucide = () => { if (window.lucide) lucide.createIcons(); };
window.addEventListener('load', reInitLucide);
