document.addEventListener("DOMContentLoaded", () => {
    // 1. Firebase Configuration (Updated with Asia-Southeast URL)
    const firebaseConfig = {
    apiKey: "AIzaSyDz7PWoH4vbObyhYXhXNqi2Cr5uwjBdwJY",
    authDomain: "cs-database-42dd0.firebaseapp.com",
    // Must include .asia-southeast1 for your region
    databaseURL: "https://cs-database-42dd0-default-rtdb.asia-southeast1.firebasedatabase.app", 
    projectId: "cs-database-42dd0",
    storageBucket: "cs-database-42dd0.firebasestorage.app",
    messagingSenderId: "265634068059",
    appId: "1:265634068059:web:4437f49f445c18d574717e"
};

    // 2. Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();

    const loginForm = document.getElementById("loginForm");
    const submitBtn = document.getElementById("submitBtn");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        errorMessage.style.display = "none";

        const regNo = document.getElementById("regInput").value.trim().toUpperCase();
        const password = document.getElementById("passInput").value.trim();

        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Authenticating...";
        submitBtn.disabled = true; 

        // 3. Fetch specific user from Firebase
        database.ref('globalStudentDB/' + regNo).once('value').then((snapshot) => {
            const userData = snapshot.val();
            
            // Validate password against the cloud field
            if (userData && userData.password === password) {
                submitBtn.innerText = "Access Granted";
                
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("loggedUserName", userData.name); 
                localStorage.setItem("loggedUserReg", regNo);
                
                setTimeout(() => {
                    window.location.href = "index.html"; 
                }, 800);
            } else {
                errorMessage.style.display = "block";
                errorMessage.innerText = "Invalid Registration Number or Password.";
                resetButton(originalText);
            }
        }).catch((error) => {
            console.error("Login Error:", error);
            errorMessage.style.display = "block";
            errorMessage.innerText = "Check your internet connection.";
            resetButton(originalText);
        });
    });

    function resetButton(text) {
        submitBtn.innerText = text;
        submitBtn.disabled = false;
        document.getElementById("passInput").value = ""; 
    }
});
