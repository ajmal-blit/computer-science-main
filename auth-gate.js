// Move this out of inline HTML so a strict Content-Security-Policy can block inline scripts.
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.replace("login.html");
}
