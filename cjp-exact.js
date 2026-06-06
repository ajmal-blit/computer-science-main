document.addEventListener('DOMContentLoaded',()=>{normalizeLayout();setupDepartmentDrawer();setupAuth();setupPopup();setupRail();injectEventBarrel();});
function normalizeLayout(){document.body.style.opacity='1';let nav=document.querySelector('.masthead,.site-header,.nav');if(!document.querySelector('.top-strip')){document.body.insertAdjacentHTML('afterbegin','<div class="top-strip"><div class="strip-track"><span>Department Launch · Volume 1, Edition 1</span><span>Filed under: Computer Science</span><span>Sponsored by Students</span><span>HQ: Grace Valley College</span><span>Together We Learn</span><span>You cannot stop innovation</span></div></div>')}if(!nav){nav=document.createElement('header');nav.className='masthead';document.body.insertBefore(nav,document.body.children[1]||null)}nav.classList.add('masthead');let brand=nav.querySelector('.brand,.brand-mark,.head-nav');if(!brand){nav.insertAdjacentHTML('afterbegin','<a class="brand" href="index.html"><span>COMPUTER SCIENCE</span><small>Grace Valley College · Est. 2025</small></a>')}let links=nav.querySelector('.site-nav,.main-nav,.nav-links');if(!links){links=document.createElement('nav');links.className='site-nav';nav.appendChild(links)}links.classList.add('site-nav');links.innerHTML='<a href="index.html">Home</a><button class="department-trigger" type="button">Department</button><a href="resources.html">Resources</a><a href="events.html">Events</a><a href="insights.html">Leaderboard</a><a href="dashboard.html">Dashboard</a><a href="forum.html">Forum</a>';let actions=nav.querySelector('.nav-actions');if(!actions){actions=document.createElement('div');actions.className='nav-actions';nav.appendChild(actions)}let btn=nav.querySelector('.logout-btn,.login-pill,.btn-nav');if(!btn){btn=document.createElement('button');btn.className='login-pill logout-btn';btn.textContent='Login';actions.appendChild(btn)}else{btn.classList.add('login-pill','logout-btn');actions.prepend(btn)}let ham=nav.querySelector('.menu-toggle,.hamburger');if(!ham){ham=document.createElement('button');ham.className='menu-toggle';ham.innerHTML='<span></span><span></span><span></span>';actions.appendChild(ham)}else{ham.classList.add('menu-toggle')}const cur=location.pathname.split('/').pop()||'index.html';links.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===cur)a.classList.add('active')});ham.onclick=()=>links.classList.toggle('active');}
function setupDepartmentDrawer(){let drawer=document.querySelector('.department-drawer');if(!drawer){drawer=document.createElement('aside');drawer.className='department-drawer';drawer.innerHTML='<button class="drawer-close" type="button">×</button><p class="eyebrow">Clicked Department</p><h2>Teachers<br>and Sections.</h2><div class="drawer-columns"><section><h3>Faculty Menu</h3><a href="index.html#faculties-section"><b>Seetha Miss</b><span>Head of Department</span></a><a href="index.html#faculties-section"><b>Rekha Miss</b><span>Tutor And Major Handler</span></a><a href="index.html#faculties-section"><b>Ramya Miss</b><span>Minor 3 Handler</span></a><a href="index.html#faculties-section"><b>Ramshi Miss</b><span>Minor 4 Handler</span></a></section><section><h3>Section Menu</h3><a href="index.html#about-section"><b>About</b><span>Department vision</span></a><a href="index.html#faculties-section"><b>Faculties</b><span>Teacher cards</span></a><a href="index.html#students-section"><b>Students</b><span>Class register</span></a><a href="events.html"><b>Events</b><span>Event slides</span></a><a href="resources.html"><b>Resources</b><span>Notes and labs</span></a><a href="forum.html"><b>Forum</b><span>Queries and answers</span></a></section></div>';document.body.appendChild(drawer)}const triggers=document.querySelectorAll('.department-trigger');triggers.forEach(t=>t.onclick=e=>{e.preventDefault();drawer.classList.toggle('open');triggers.forEach(x=>x.classList.toggle('active',drawer.classList.contains('open')))});drawer.querySelector('.drawer-close').onclick=()=>{drawer.classList.remove('open');triggers.forEach(x=>x.classList.remove('active'))};drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>drawer.classList.remove('open')))}
function setupAuth(){const logged=localStorage.getItem('isLoggedIn')==='true',user=localStorage.getItem('loggedUserName');document.querySelectorAll('.logout-btn,.login-pill,.btn-nav').forEach(b=>{b.textContent=logged?'Log Out':'Login';b.onclick=()=>{if(logged){localStorage.clear();location.reload()}else location.href='login.html'}});const w=document.getElementById('welcomeMessage');if(w)w.textContent=logged&&user?'Welcome Back, '+user+'!':'Welcome to CS Department'}
function setupPopup(){document.querySelectorAll('.student-card').forEach(card=>{if(card.dataset.ready)return;card.dataset.ready='1';card.onclick=()=>{const p=document.getElementById('popup')||document.querySelector('.popup-modal,.popup');if(!p)return;const n=card.querySelector('h3')?.textContent||'';const r=card.querySelector('p')?.textContent||'';const ne=document.getElementById('popup-name');const re=document.getElementById('popup-reg');if(ne)ne.textContent=n;if(re)re.textContent=r;p.style.display='flex'}});document.querySelectorAll('.close-btn').forEach(b=>b.onclick=()=>{const p=document.getElementById('popup')||document.querySelector('.popup-modal,.popup');if(p)p.style.display='none'});const p=document.getElementById('popup')||document.querySelector('.popup-modal,.popup');if(p&&!p.dataset.ready){p.dataset.ready='1';p.addEventListener('click',e=>{if(e.target===p)p.style.display='none'})}}
function setupRail(){if(!document.querySelector('.floating-sections')){document.body.insertAdjacentHTML('beforeend','<nav class="floating-sections"><a href="index.html#about-section">About</a><a href="index.html#faculties-section">Teachers</a><a href="index.html#students-section">Students</a><a href="events.html">Events</a></nav>')}const rail=document.querySelector('.floating-sections');const run=()=>rail.classList.toggle('visible',scrollY>360);addEventListener('scroll',run,{passive:true});run()}
function injectEventBarrel(){const container=document.querySelector('.event-container');if(!container||document.querySelector('.barrel-section,.event-slide-section'))return;const html='<section class="event-slide-section barrel-section no-3d-events"><div class="event-slide-copy"><p class="eyebrow green">Live Events</p><h2>Event Slide Rail.</h2><p>A clean sideways sliding showcase that works smoothly on mobile and desktop.</p></div><div class="event-rail" aria-label="Department event slider"><a class="event-slide-card barrel-card" href="#web-forge"><small>13 OCT 2025 · COMPUTER LAB</small><h3>WEB FORGE</h3><p>2-hour HTML & CSS development program.</p></a><a class="event-slide-card barrel-card" href="#website-launch"><small>31 MAR 2026 · SMART ROOM</small><h3>WEBSITE LAUNCH</h3><p>Department website launch and portal reveal.</p></a><a class="event-slide-card barrel-card" href="#coordinators"><small>COORDINATORS</small><h3>STUDENT TEAM</h3><p>Ajmal NT, Muhammed Aflah A, Shelshal Jubin KC, Muhammed Shaheer.</p></a><a class="event-slide-card barrel-card" href="#thanks"><small>SPECIAL THANKS</small><h3>FACULTY</h3><p>Principal, Seetha Miss, Rekha Miss, and faculty support.</p></a></div></section>';const cover=container.querySelector('.page-cover');if(cover)cover.insertAdjacentHTML('afterend',html);else container.insertAdjacentHTML('afterbegin',html)}


// FINAL STRIKE responsive + replica polish
(function(){
  document.addEventListener('DOMContentLoaded',()=>{
    document.body.style.opacity='1';
    // Repeating ticker content for smooth infinite strip.
    const track=document.querySelector('.strip-track');
    if(track && track.children.length<10){ track.innerHTML += track.innerHTML; }
    // Bottom mobile navigation similar to the reference mobile action rail.
    if(!document.querySelector('.bottom-nav')){
      document.body.insertAdjacentHTML('beforeend',`<nav class="bottom-nav" aria-label="Quick mobile navigation">
        <a href="index.html">Home</a><a href="insights.html">Top</a><a href="forum.html">Forum</a><a href="resources.html">Labs</a><a href="events.html">Events</a>
      </nav>`);
    }
    const cur=(location.pathname.split('/').pop()||'index.html');
    document.querySelectorAll('.bottom-nav a,.site-nav a').forEach(a=>{ if(a.getAttribute('href')===cur) a.classList.add('active'); });
    // Better close behavior for mobile menu and department drawer.
    document.addEventListener('click',e=>{
      const nav=document.querySelector('.site-nav');
      const drawer=document.querySelector('.department-drawer');
      if(nav && nav.classList.contains('active') && !e.target.closest('.masthead,.nav,.site-nav,.menu-toggle')) nav.classList.remove('active');
      if(drawer && drawer.classList.contains('open') && !e.target.closest('.department-drawer,.department-trigger')) drawer.classList.remove('open');
    });
    // Staggered reveal without requiring libraries.
    const cards=document.querySelectorAll('.resource-section,.program-card,.showcase-card,.query-card,.student-card,.manifesto-list article,.stat-card-new,.highlight-box');
    cards.forEach((el,i)=>{el.style.setProperty('--delay',`${Math.min(i*35,420)}ms`); el.classList.add('ultra-reveal')});
    const io=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('is-visible');io.unobserve(en.target)}})},{threshold:.12});
    cards.forEach(el=>io.observe(el));
  });
})();


// Repair pass: keep nav/drawer from visually trapping text and mark sideways barrel mode.
document.addEventListener('DOMContentLoaded',()=>{
  document.documentElement.classList.add('sideways-barrel-ready');
  const drawer=document.querySelector('.department-drawer');
  const triggers=document.querySelectorAll('.department-trigger');
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && drawer){drawer.classList.remove('open');triggers.forEach(t=>t.classList.remove('active'));}
  });
  document.querySelectorAll('.site-nav a,.main-nav a,.nav-links a').forEach(a=>a.addEventListener('click',()=>{
    document.querySelectorAll('.site-nav,.main-nav,.nav-links').forEach(n=>n.classList.remove('active'));
  }));
});
