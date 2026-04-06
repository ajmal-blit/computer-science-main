/**
 * CS DEPARTMENT - CORE UI & SESSION LOGIC
 * Includes: Session Guard, Typing Effect, Animations, and Popup Logic
 */

// 1. 🛡️ IMMEDIATE SESSION CHECK (Runs before page renders)
const isLoggedIn = localStorage.getItem("isLoggedIn");
const loggedUserName = localStorage.getItem("loggedUserName");
const loggedUserReg = localStorage.getItem("loggedUserReg"); //

if (!isLoggedIn || isLoggedIn !== "true") {
    // If no active session, kick back to login immediately
    window.location.replace("login.html"); //
}

document.addEventListener("DOMContentLoaded", () => {
    
    // 2. ✨ PERSONALIZED WELCOME & TYPING EFFECT
    const typingContainer = document.querySelector(".typing");
    // Use the name stored during Firebase login for the welcome message
    const welcomeText = `Welcome To Computer Science . '; //
    let i = 0;

    function typeEffect() {
        if (typingContainer && i < welcomeText.length) {
            typingContainer.innerHTML += welcomeText.charAt(i);
            i++;
            setTimeout(typeEffect, 100);
        }
    }
    typeEffect();

    // 3. 📱 MOBILE NAVIGATION (HAMBURGER)
    const ham = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");

    if (ham && nav) {
        ham.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }

    // 4. 🎬 SCROLL REVEAL ANIMATIONS
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, observerOptions);

    // Apply fade-in to main sections
    document.querySelectorAll(".card, .about, .faculties, .students-title").forEach(el => {
        el.classList.add("fade");
        observer.observe(el);
    });

    // 5. 🎓 STUDENT CARD STAGGERED REVEAL
    const studentCards = document.querySelectorAll(".student-card");
    const studentsSection = document.querySelector(".students");

    if (studentsSection && studentCards.length > 0) {
        const studentObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    studentCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add("show");
                        }, index * 80); // Staggered delay for smooth entrance
                    });
                }
            });
        }, { threshold: 0.2 });

        studentObserver.observe(studentsSection);
    }

    // 6. 🎯 STUDENT PROFILE POPUP LOGIC
    const popup = document.getElementById("popup");
    const popupName = document.getElementById("popup-name");
    const popupReg = document.getElementById("popup-reg");
    const popupInfo = document.getElementById("popup-info");
    const closeBtn = document.querySelector(".close-btn");

    document.querySelectorAll(".student-card").forEach(card => {
        card.addEventListener("click", () => {
            const name = card.querySelector("h3").innerText;
            const reg = card.querySelector("p").innerText;

            if (popupName && popupReg) {
                popupName.innerText = name;
                popupReg.innerText = reg;
                popupInfo.innerText = "DEPARTMENT OF\nCOMPUTER SCIENCE";
                popup.classList.add("active");
            }
        });
    });

    // Close Popup Logic
    if (closeBtn) {
        closeBtn.onclick = () => popup.classList.remove("active");
    }

    if (popup) {
        popup.onclick = (e) => {
            if (e.target === popup) popup.classList.remove("active");
        };
    }

    // 7. 🚪 LOGOUT LOGIC (Global)
    const logoutButtons = document.querySelectorAll(".logout-btn");
    logoutButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Clear all Firebase-related session data
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedUserName");
            localStorage.removeItem("loggedUserReg");
            
            // Redirect to login page
            window.location.replace("login.html"); //
        });
    });

    // 8. 🎬 FINAL PAGE LOAD FADE
    document.body.classList.add("show");
});

// Final fallback for page load
window.addEventListener("load", () => {
    document.body.style.opacity = "1";
});
