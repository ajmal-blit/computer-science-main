/**
 * CS DEPARTMENT - CORE UI & SESSION LOGIC
 * Optimized for Smooth Opening and Mobile Navigation
 */

// 1. 🛡️ GATEKEEPER FUNCTION (Defined globally so HTML can access it)
function checkAccess(page) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        window.location.href = page;
    } else {
        alert("Please Login to access the " + page.split('.')[0] + "! 🔒");
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // 2. ✨ SESSION & AUTH UI LOGIC
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userName = localStorage.getItem("loggedUserName");
    const authButtons = document.querySelectorAll(".logout-btn");
    const welcomeMessage = document.getElementById("welcomeMessage");

    if (isLoggedIn && userName) {
        if (welcomeMessage) welcomeMessage.innerText = "Welcome Back, " + userName + "!";
        authButtons.forEach(button => {
            button.innerText = "Log Out";
            button.style.background = "#ef4444"; // Red for Logout
            button.onclick = () => {
                localStorage.clear();
                window.location.reload();
            };
        });
    } else {
        if (welcomeMessage) welcomeMessage.innerText = "Welcome to CS Department";
        authButtons.forEach(button => {
            button.innerText = "Log In";
            button.style.background = "#22c55e"; // Green for Login
            button.onclick = () => { window.location.href = "login.html"; };
        });
    }

    // 3. ⌨️ TYPING EFFECT
    const typingContainer = document.querySelector(".typing");
    let welcomeText = "Welcome to<br><span style='color: var(--accent-color)'>Computer Science</span>";
    let i = 0;

    function typeEffect() {
        if (typingContainer && i < welcomeText.length) {
            // Check for HTML tags to inject instantly without breaking markup
            if (welcomeText.charAt(i) === '<') {
                let tag = "";
                while (welcomeText.charAt(i) !== '>' && i < welcomeText.length) {
                    tag += welcomeText.charAt(i);
                    i++;
                }
                tag += '>';
                typingContainer.innerHTML += tag;
                i++; // Move to next char after '>'
            } else {
                typingContainer.innerHTML += welcomeText.charAt(i);
                i++;
            }
            setTimeout(typeEffect, 100); // Slightly faster for a smoother feel
        }
    }
    if (typingContainer) typeEffect();

    // 4. 📱 MOBILE NAVIGATION (SLIDING ANIMATION)
    const ham = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");

    if (ham && nav) {
        ham.addEventListener("click", () => {
            nav.classList.toggle("active");
            ham.classList.toggle("is-active");
        });
    }

    // 5. 🎬 SCROLL REVEAL ANIMATIONS (Intersection Observer)
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".card, .about, .faculties, .students, .title").forEach(el => {
        observer.observe(el);
    });

    // 6. 🎓 STUDENT CARD STAGGERED REVEAL
    const studentCards = document.querySelectorAll(".student-card");
    const studentsSection = document.querySelector(".students");

    if (studentsSection && studentCards.length > 0) {
        const studentObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                studentCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add("show");
                    }, index * 50);
                });
            }
        }, { threshold: 0.1 });
        studentObserver.observe(studentsSection);
    }

    // 7. 🎯 STUDENT PROFILE POPUP LOGIC
    const popup = document.getElementById("popup");
    const popupName = document.getElementById("popup-name");
    const popupReg = document.getElementById("popup-reg");
    const closeBtn = document.querySelector(".close-btn");

    document.querySelectorAll(".student-card").forEach(card => {
        card.addEventListener("click", () => {
            const name = card.querySelector("h3").innerText;
            const reg = card.querySelector("p").innerText;

            if (popup && popupName && popupReg) {
                popupName.innerText = name;
                popupReg.innerText = reg;
                popup.classList.add("active");
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener("click", () => popup.classList.remove("active"));
    if (popup) {
        popup.addEventListener("click", (e) => {
            if (e.target === popup) popup.classList.remove("active");
        });
    }

    // 8. 🚪 FORCE SHOW (Fix for Blank Screen)
    setTimeout(() => {
        document.body.style.opacity = "1";
        document.body.classList.add("show");
    }, 50);
});
