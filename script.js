/**
 * CS DEPARTMENT - CORE UI & SESSION LOGIC
 * Includes: Typing Effect, Animations, Popup Logic, and Access Control
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. ✨ PERSONALIZED WELCOME & TYPING EFFECT
    const typingContainer = document.querySelector(".typing");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loggedUserName = localStorage.getItem("loggedUserName");

    // Dynamic greeting based on login status
    let welcomeText = "Welcome to Computer Science .";

    let i = 0;
    function typeEffect() {
        if (typingContainer && i < welcomeText.length) {
            typingContainer.innerHTML += welcomeText.charAt(i);
            i++;
            setTimeout(typeEffect, 100); // Speed of typing
        }
    }
    // Start typing effect only if the container exists on the page
    if (typingContainer) {
        typeEffect();
    }

    // 2. 📱 MOBILE NAVIGATION (HAMBURGER)
    const ham = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");

    if (ham && nav) {
        ham.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }

    // 3. 🎬 SCROLL REVEAL ANIMATIONS
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, observerOptions);

    // Apply observer to main sections
    document.querySelectorAll(".card, .about, .faculties, .students, .title").forEach(el => {
        observer.observe(el);
    });

    // 4. 🎓 STUDENT CARD STAGGERED REVEAL
    const studentCards = document.querySelectorAll(".student-card");
    const studentsSection = document.querySelector(".students");

    if (studentsSection && studentCards.length > 0) {
        const studentObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    studentCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add("show");
                        }, index * 50); // 50ms delay between each card
                    });
                }
            });
        }, { threshold: 0.1 });

        studentObserver.observe(studentsSection);
    }

    // 5. 🎯 STUDENT PROFILE POPUP LOGIC
    const popup = document.getElementById("popup");
    const popupName = document.getElementById("popup-name");
    const popupReg = document.getElementById("popup-reg");
    const closeBtn = document.querySelector(".close-btn");

    document.querySelectorAll(".student-card").forEach(card => {
        card.addEventListener("click", () => {
            const name = card.querySelector("h3").innerText;
            const reg = card.querySelector("p").innerText;

            if (popupName && popupReg && popup) {
                popupName.innerText = name;
                popupReg.innerText = reg;
                popup.classList.add("active");
            }
        });
    });

    // Close Popup Logic
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (popup) popup.classList.remove("active");
        });
    }

    if (popup) {
        popup.addEventListener("click", (e) => {
            // Close only if clicking outside the popup content
            if (e.target === popup) popup.classList.remove("active");
        });
    }

    // 6. 🚪 LOGOUT LOGIC (For buttons on index.html)
    const logoutButtons = document.querySelectorAll(".logout-btn");
    logoutButtons.forEach(button => {
        // If it says "Log Out", clear data. If it says "Log In", just go to login page.
        button.addEventListener("click", () => {
            if (button.innerText === "Log Out") {
                localStorage.clear(); 
                window.location.reload(); // Refresh the page to show Guest state
            } else {
                window.location.href = "login.html";
            }
        });
    });

    // 7. 🎬 FIX FOR BLANK SCREEN: Force body opacity to 1
    // This ensures your CSS animations don't get stuck hidden
    document.body.style.opacity = "1";
    document.body.classList.add("show");
});

/**
 * 8. 🛡️ GATEKEEPER FUNCTION FOR NAVIGATION LINKS
 * This must be OUTSIDE the DOMContentLoaded block so your HTML can access it.
 */
function checkAccess(page) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (isLoggedIn) {
        window.location.href = page;
    } else {
        alert("Please Login to access this section! 🔒");
        window.location.href = "login.html";
    }
}
