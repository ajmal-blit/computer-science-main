// FINAL BUG FIX PASS: flat event slider, mobile table safety, and robust menu behavior.
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '1';

  // Make sure the menu opens/closes reliably even if previous scripts attached handlers.
  const navLinks = document.querySelector('.site-nav,.nav-links');
  const menuBtn = document.querySelector('.menu-toggle,.hamburger');
  if (menuBtn && navLinks) {
    menuBtn.setAttribute('type', 'button');
    menuBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      navLinks.classList.toggle('active');
    };
  }

  // Add labels to SGPA table cells if a browser drops them during dynamic render.
  function labelInsightRows(){
    const labels = ['Rank','Name','Reg No','SGPA'];
    document.querySelectorAll('.sgpa-table tbody tr').forEach(row => {
      row.querySelectorAll('td').forEach((td, i) => {
        if (!td.getAttribute('data-label')) td.setAttribute('data-label', labels[i] || 'Info');
      });
    });
  }
  labelInsightRows();
  const insightBody = document.querySelector('.sgpa-table tbody');
  if (insightBody) new MutationObserver(labelInsightRows).observe(insightBody, {childList:true, subtree:true});

  // Replace the old barrel with a clean flat sideways slider on ALL pages (Home & Events).
  document.querySelectorAll('.barrel-section, .event-slide-section').forEach(rail => {
    // Prevent duplicate injections
    if (rail.classList.contains('event-flat-slider')) return;
    
    const slider = document.createElement('section');
    slider.className = 'event-flat-slider';
    slider.innerHTML = `
      <div class="event-flat-copy">
        <p class="eyebrow green">Live Events</p>
        <h2>Event Slide Rail.</h2>
        <p>All The Events We Organized With Title To Our Department..</p>
        <div class="slider-controls" aria-label="Event slider controls">
          <button type="button" class="event-prev" aria-label="Previous event">‹</button>
          <button type="button" class="event-next" aria-label="Next event">›</button>
        </div>
      </div>
      <div class="event-slider-wrap">
        <div class="event-track" tabindex="0" aria-label="Sideways event cards">
          <a class="event-card-flat" href="events.html#web-forge"><small>13 OCT 2025 · COMPUTER LAB</small><h3>WEB FORGE</h3><p>2-hour HTML & CSS development program with hands-on practice.</p></a>
          <a class="event-card-flat" href="events.html#website-launch"><small>31 MAR 2026 · SMART ROOM</small><h3>WEBSITE LAUNCH</h3><p>Official department website launch and student portal reveal.</p></a>
          <a class="event-card-flat" href="events.html#coordinators"><small>STUDENT TEAM</small><h3>COORDINATORS</h3><p>Ajmal NT, Muhammed Aflah A, Shelshal Jubin KC, Muhammed Shaheer.</p></a>
          <a class="event-card-flat" href="events.html#thanks"><small>SPECIAL THANKS</small><h3>FACULTY SUPPORT</h3><p>Principal, Seetha Miss, Rekha Miss and the faculty team.</p></a>
        </div>
      </div>`;
      
    rail.replaceWith(slider);
    
    const track = slider.querySelector('.event-track');
    const step = () => Math.max(260, Math.floor(track.clientWidth * 0.82));
    slider.querySelector('.event-next').addEventListener('click', () => track.scrollBy({left: step(), behavior:'smooth'}));
    slider.querySelector('.event-prev').addEventListener('click', () => track.scrollBy({left: -step(), behavior:'smooth'}));
    
    // Auto-slide only when the user is not interacting.
    let paused = false;
    ['mouseenter','focusin','touchstart','pointerdown'].forEach(evt => track.addEventListener(evt, () => paused = true, {passive:true}));
    ['mouseleave','focusout'].forEach(evt => track.addEventListener(evt, () => paused = false, {passive:true}));
    setInterval(() => {
      if (paused || document.hidden) return;
      const nearEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 12;
      track.scrollTo({left: nearEnd ? 0 : track.scrollLeft + step(), behavior:'smooth'});
    }, 3600);
  });

  // Close overlays when a link is chosen or user taps outside.
  document.addEventListener('click', (e) => {
    const drawer = document.querySelector('.department-drawer');
    const nav = document.querySelector('.site-nav,.nav-links');
    if (nav && nav.classList.contains('active') && !e.target.closest('.masthead,.nav,.site-nav,.nav-links,.menu-toggle,.hamburger')) nav.classList.remove('active');
    if (drawer && drawer.classList.contains('open') && !e.target.closest('.department-drawer,.department-trigger')) drawer.classList.remove('open');
  });
});
