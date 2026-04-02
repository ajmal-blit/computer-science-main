// ================= USER SYSTEM =================
const user = JSON.parse(localStorage.getItem("user"));

// Redirect if not logged in
if (!user) {
  window.location.href = "login.html";
}

// Welcome message
document.addEventListener("DOMContentLoaded", () => {
  const welcome = document.getElementById("welcomeMessage");
  if (welcome && user) {
    welcome.innerText = "Welcome Back, " + user.name + "!";
  }
});

// ================= TYPING EFFECT =================
const text = "Welcome To Computer Science ";
let i = 0;

function typeEffect() {
  const typingEl = document.querySelector(".typing");
  if (!typingEl) return;

  typingEl.innerHTML = ""; // prevent duplication

  function type() {
    if (i < text.length) {
      typingEl.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, 80);
    }
  }

  type();
}

typeEffect();

// ================= HAMBURGER =================
const ham = document.querySelector(".hamburger");
const nav = document.querySelector(".nav-links");

if (ham && nav) {
  ham.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

// ================= SCROLL ANIMATION =================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".card, .about, .faculties").forEach(el => {
  el.classList.add("fade");
  observer.observe(el);
});

// ================= STUDENT STAGGER =================
const studentCards = document.querySelectorAll(".student-card");
const studentsSection = document.querySelector(".students");

if (studentsSection) {
  const studentObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        studentCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add("show");
          }, index * 80);
        });
      }
    });
  }, { threshold: 0.2 });

  studentObserver.observe(studentsSection);
}

// ================= POPUP =================
const popup = document.getElementById("popup");
const popupName = document.getElementById("popup-name");
const popupReg = document.getElementById("popup-reg");
const popupInfo = document.getElementById("popup-info");
const closeBtn = document.querySelector(".close-btn");

document.querySelectorAll(".student-card").forEach(card => {
  card.addEventListener("click", () => {
    if (!popup) return;

    const name = card.querySelector("h3")?.innerText;
    const reg = card.querySelector("p")?.innerText;

    popupName.innerText = name || "";
    popupReg.innerText = reg || "";
    popupInfo.innerText = "DEPARTMENT OF COMPUTER SCIENCE";

    popup.classList.add("active");
  });
});

// Close popup
if (closeBtn && popup) {
  closeBtn.onclick = () => popup.classList.remove("active");

  popup.onclick = (e) => {
    if (e.target === popup) {
      popup.classList.remove("active");
    }
  };
}

// ================= PAGE LOAD ANIMATION =================
window.addEventListener("load", () => {
  document.body.classList.add("show");
});

// ================= LOGOUT =================
const logoutButtons = document.querySelectorAll(".logout-btn");

logoutButtons.forEach(button => {
  button.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
});