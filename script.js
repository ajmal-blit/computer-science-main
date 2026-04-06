/**
 * CS DEPARTMENT - CORE UI & SESSION LOGIC
 * Includes: Typing Effect, Animations, and Popup Logic
 */

// 1. 🛡️ REMOVED GLOBAL SESSION CHECK 
// We now handle page protection inside each specific page's HTML 
// or via the checkAccess() function for a better user experience.

document.addEventListener("DOMContentLoaded", () => {
    
    // 2. ✨ PERSONALIZED WELCOME & TYPING EFFECT
    const typingContainer = document.querySelector(".typing");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loggedUserName = localStorage.getItem("loggedUserName");

    // Use a dynamic greeting based on login status
    let welcomeText = "Welcome to Computer Science Department";
    if (isLoggedIn && loggedUserName) {
        welcomeText = `Welcome Back, ${loggedUserName}!`;
    }

    let i = 0;
    function typeEffect() {
        if (typingContainer && i < welcomeText.length) {
            typingContainer.innerHTML += welcomeText.charAt(i);
            i++;
            setTimeout(typeEffect, 80); // Slightly faster for better feel
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

    document.querySelectorAll(".card, .about, .faculties, .students, .title").forEach(el => {
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
                        }, index * 50); 
                    });
                }
            });
        }, { threshold: 0.1 });

        studentObserver.observe(studentsSection);
    }

    // 6. 🎯 STUDENT PROFILE POPUP LOGIC
    const popup = document.getElementById("popup");
    const popupName = document.getElementById("popup-name");
    const popupReg = document.getElementById("popup-reg");
    const closeBtn = document.querySelector(".close-btn");

    document.querySelectorAll(".student-card").forEach(card => {
        card.addEventListener("click", () => {
            const name = card.querySelector("h3").innerText;
            const reg = card.querySelector("p").innerText;

            if (popupName && popupReg) {
                popupName.innerText = name;
                popupReg.innerText = reg;
                popup.classList.add("active");
            }
        });
    });

    if (closeBtn) {
        closeBtn.onclick = () => popup.classList.remove("active");
    }

    if (popup) {
        popup.onclick = (e) => {
            if (e.target === popup) popup.classList.remove("active");
        };
    }

    // 7. 🚪 LOGOUT LOGIC
    const logoutButtons = document.querySelectorAll(".logout-btn");
    logoutButtons.forEach(button => {
        button.addEventListener("click", () => {
            localStorage.clear(); // Clears all session data at once
            window.location.href = "login.html"; 
        });
    });
});

// Helper for index.html links to prevent "Instant Replacements"
function checkAccess(page) {
    if (localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = page;
    } else {
        alert("Please Login to access this section! 🔒");
        window.location.href = "login.html";
    }
}
