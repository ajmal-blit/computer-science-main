/* 🛡️ SESSION GUARD - Run immediately */
const isLoggedIn = localStorage.getItem("isLoggedIn");
const loggedUserName = localStorage.getItem("loggedUserName");

if (!isLoggedIn || isLoggedIn !== "true") {
    // Redirect if no session found
    window.location.replace("login.html");
}

document.addEventListener("DOMContentLoaded", () => {
    /* ✨ TYPING EFFECT */
    const text = "Welcome To Computer Science .";
    let i = 0;

    function typeEffect(){
        const typingEl = document.querySelector(".typing");
        if(typingEl && i < text.length){
            typingEl.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeEffect, 100);
        }
    }
    typeEffect();

    /* 📱 HAMBURGER MENU */
    const ham = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");
    if(ham) {
        ham.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }

    /* 🎬 SCROLL FADE ANIMATIONS */
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

    /* 🎬 STUDENT CARD STAGGER */
    const studentCards = document.querySelectorAll(".student-card");
    const studentsSection = document.querySelector(".students");
    if (studentsSection) {
        const studentObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    studentCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add("show");
                        }, index * 100);
                    });
                }
            });
        }, { threshold: 0.2 });
        studentObserver.observe(studentsSection);
    }

    /* 🎯 STUDENT POPUP LOGIC */
    const popup = document.getElementById("popup");
    const popupName = document.getElementById("popup-name");
    const popupReg = document.getElementById("popup-reg");
    const popupInfo = document.getElementById("popup-info");
    const closeBtn = document.querySelector(".close-btn");

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

    if(closeBtn) closeBtn.onclick = () => popup.classList.remove("active");
    if(popup) {
        popup.onclick = (e) => {
            if(e.target === popup) popup.classList.remove("active");
        };
    }

    /* 🚪 LOGOUT LOGIC */
    const logoutButtons = document.querySelectorAll(".logout-btn");
    logoutButtons.forEach(button => {
        button.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedUserName");
            localStorage.removeItem("loggedUserReg");
            window.location.replace("login.html");
        });
    });
});

/* 🎬 PAGE LOAD FADE IN */
window.addEventListener("load", () => {
    document.body.classList.add("show");
});
