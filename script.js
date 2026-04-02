
/* ✨ TYPING EFFECT */
const text = "Welcome To Computer Science .";
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


document.addEventListener("DOMContentLoaded", () => {
    // Check local storage for the user
    const userName = localStorage.getItem("loggedUserName");
    
    // Grab all buttons with the class "logout-btn" (both mobile and desktop)
    const authButtons = document.querySelectorAll(".logout-btn"); 
    const welcomeMessage = document.getElementById("welcomeMessage");

    if (userName) {
        // --- USER IS LOGGED IN ---
        if (welcomeMessage) {
            welcomeMessage.innerText = "Welcome Back, " + userName + "!";
        }
        
        authButtons.forEach(button => {
            button.innerText = "Log Out";
            
            // Log them out when clicked
            button.addEventListener("click", () => {
                localStorage.removeItem("loggedUserName");
                localStorage.setItem("isLoggedIn", "false");
                // Reload the page to update the button and clear the welcome message
                window.location.reload(); 
            });
        });
    } else {
        // --- USER IS NOT LOGGED IN ---
        authButtons.forEach(button => {
            button.innerText = "Log In";
            
            // Send them to the login page when clicked
            button.addEventListener("click", () => {
                window.location.href = "login.html";
            });
        });
    }
});

