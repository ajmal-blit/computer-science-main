
/* ✨ TYPING EFFECT */
const text = "Welcome To Computer Science ";
let i = 0;

function typeEffect(){
    if(i < text.length){
        document.querySelector(".typing").innerHTML += text.charAt(i);
        i++;
        setTimeout(typeEffect, 100);
    }
}

typeEffect();

/* 📱 HAMBURGER */
const ham = document.querySelector(".hamburger");
const nav = document.querySelector(".nav-links");

ham.addEventListener("click", () => {
    nav.classList.toggle("active");
});

/* 🎬 SCROLL ANIMATION */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});

document.querySelectorAll(".card, .about, .faculties").forEach(el => {
    el.classList.add("fade");
    observer.observe(el);
});

/* 🎬 STUDENT STAGGER ANIMATION */
const studentCards = document.querySelectorAll(".student-card");

const studentObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            studentCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add("show");
                }, index * 100); // delay between cards
            });
        }
    });
}, { threshold: 0.2 });

studentObserver.observe(document.querySelector(".students"));

/* 🎯 POPUP LOGIC */
const popup = document.getElementById("popup");
const popupName = document.getElementById("popup-name");
const popupReg = document.getElementById("popup-reg");
const popupInfo = document.getElementById("popup-info");
const closeBtn = document.querySelector(".close-btn");

/* 🎓 CLICK STUDENT */
document.querySelectorAll(".student-card").forEach(card => {
    card.addEventListener("click", () => {

        const name = card.querySelector("h3").innerText;
        const reg = card.querySelector("p").innerText;

        popupName.innerText = name;
        popupReg.innerText = reg;
        popupInfo.innerText = "\nDEPARTMENT OF \nCOMPUTER SCIENCE";

        popup.classList.add("active");
    });
});

/* ❌ CLOSE */
closeBtn.onclick = () => popup.classList.remove("active");

/* CLICK OUTSIDE */
popup.onclick = (e) => {
    if(e.target === popup){
        popup.classList.remove("active");
    }
};

/* 🎬 PAGE LOAD FADE IN */
window.addEventListener("load", () => {
    document.body.classList.add("show");
});

// Grab ALL buttons with the 'logout-btn' class
const logoutButtons = document.querySelectorAll(".logout-btn");

// Loop through each button and attach the click event
logoutButtons.forEach(button => {
    button.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedUserName");
        window.location.replace("login.html");
    });
});

// News Flicker 
const carousel = document.querySelector('.carousel');

if (carousel) {
  new Flickity(carousel, {
    autoPlay: 2000,
    wrapAround: true,
    prevNextButtons: false,
    pageDots: false
  });
}

// Ai Assistant

// Open / Close chat
function toggleChat() {
  const chat = document.getElementById("chat-container");
  chat.classList.toggle("hidden");
}

// Add message to UI
function addMessage(text, type) {
  const chat = document.getElementById("chat");

  const div = document.createElement("div");
  div.classList.add("message", type);
  div.innerText = text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Send message to backend
async function send() {
  const inputBox = document.getElementById("input");
  const message = inputBox.value.trim();

  if (!message) return;

  addMessage(message, "user");
  inputBox.value = "";

  // Show thinking message
  const thinking = document.createElement("div");
  thinking.classList.add("message", "ai");
  thinking.innerText = "Typing...";
  document.getElementById("chat").appendChild(thinking);

  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    thinking.remove(); // remove typing

    addMessage(data.reply, "ai");

  } catch (err) {
    thinking.remove();
    addMessage("Server error ⚠️", "ai");
  }
}

// Enter key support
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") send();
  });

  addMessage("Hi 👋 Ask me anything about the department.", "ai");
});