document.addEventListener("DOMContentLoaded", () => {
    const firebaseConfig = {
        apiKey: "AIzaSyDz7PWoH4vbObyhYXhXNqi2Cr5uwjBdwJY",
        authDomain: "cs-database-42dd0.firebaseapp.com",
        databaseURL: "https://cs-database-42dd0-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "cs-database-42dd0",
        storageBucket: "cs-database-42dd0.firebasestorage.app",
        messagingSenderId: "265634068059",
        appId: "1:265634068059:web:4437f49f445c18d574717e"
    };

    firebase.initializeApp(firebaseConfig);
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

        database.ref('globalStudentDB/' + regNo).once('value').then((snapshot) => {
            const user = snapshot.val();

            if (user && user.password === password) {
                submitBtn.innerText = "Access Granted";
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("loggedUserName", user.name); 
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
            console.error(error);
            errorMessage.style.display = "block";
            errorMessage.innerText = "Network Error.";
            resetButton(originalText);
        });
    });

    function resetButton(text) {
        submitBtn.innerText = text;
        submitBtn.disabled = false;
        document.getElementById("passInput").value = ""; 
    }
});
