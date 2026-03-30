/* ================= PAGE LOAD ================= */
window.addEventListener("load", () => {
    document.body.classList.add("show");
});

/* ================= TYPING ================= */
const text = "Welcome To Computer Science.";
let i = 0;

function typeEffect(){
    if(i < text.length){
        document.querySelector(".typing").innerHTML += text.charAt(i);
        i++;
        setTimeout(typeEffect, 80);
    }
}
typeEffect();

/* ================= NAV ================= */
const ham = document.querySelector(".hamburger");
const nav = document.querySelector(".nav-links");
const overlay = document.querySelector(".overlay");

/* TOGGLE MENU */
ham.addEventListener("click", () => {
    nav.classList.toggle("active");
    ham.classList.toggle("active");
    overlay.classList.toggle("active");
});

/* CLOSE MENU */
overlay.addEventListener("click", () => {
    nav.classList.remove("active");
    ham.classList.remove("active");
    overlay.classList.remove("active");
});

/* ================= ACTIVE LINK ================= */
document.querySelectorAll(".nav-links a").forEach(link => {
    if(link.href === window.location.href){
        link.classList.add("active-link");
    }
});

/* ================= SCROLL EFFECT ================= */
window.addEventListener("scroll", () => {
    document.querySelector(".nav")
        .classList.toggle("scrolled", window.scrollY > 10);
});

/* ================= LOGOUT ================= */
document.querySelectorAll(".logout-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedUserName");
        window.location.replace("login.html");
    });
});
