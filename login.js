document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const submitBtn = document.getElementById("submitBtn");
    const errorMessage = document.getElementById("errorMessage");

    // 🔥 UPGRADED: Dictionary now holds both passwords and names
    const validUsers = {
        "GVAZSCS001": { password: "01-03-2007", name: "Abdul Rashid" },
        "GVAZSCS002": { password: "13-12-2007", name: "Ajmal Nt" },
        "GVAZSCS003": { password: "18-07-2007", name: "Anshif Hyder" },
        "GVAZSCS004": { password: "06-10-2007", name: "Fathima Hannin" },
        "GVAZSCS005": { password: "03-02-2008", name: "Fathima Hanna" },
        "GVAZSCS006": { password: "03-08-2006", name: "Fathima Huda" },
        "GVAZSCS007": { password: "03-05-2006", name: "Jasfal C" },
        "GVAZSCS008": { password: "23-07-2007", name: "Jumana Jebin" },
        "GVAZSCS009": { password: "04-10-2007", name: "Mohammed Fadil" },
        "GVAZSCS010": { password: "06-11-2006", name: "Mohammed Shaheer" },
        "GVAZSCS011": { password: "18-04-2006", name: "Mohammed Sinan" },
        "GVAZSCS012": { password: "17-05-2007", name: "Muhammed Shamil" },
        "GVAZSCS013": { password: "18-05-2008", name: "Muhammed Aflah" },
        "GVAZSCS014": { password: "17-01-2007", name: "Muhammed Bazilsha" },
        "GVAZSCS015": { password: "12-04-2006", name: "Mountain Dooo" },
        "GVAZSCS016": { password: "23-04-2007", name: "Muhammed Sinan" },
        "GVAZSCS017": { password: "08-11-2006", name: "Munshifa P" },
        "GVAZSCS018": { password: "10-02-2008", name: "Safna SHeri" },
        "GVAZSCS019": { password: "23-07-2006", name: "Shamnad Pk" },
        "GVAZSCS020": { password: "23-10-2006", name: "Shelshal Jubin" },
        "ADMIN": { password: "admin123", name: "Administrator" }
    };

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        errorMessage.style.display = "none";

        const regNo = document.getElementById("regInput").value.trim().toUpperCase();
        const password = document.getElementById("passInput").value.trim();

        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Authenticating...";
        submitBtn.style.opacity = "0.8";
        submitBtn.style.cursor = "wait";
        submitBtn.disabled = true; 

        setTimeout(() => {
            // Check if user exists, then check if password matches
            const user = validUsers[regNo];
            const isAuthTrue = (user !== undefined && user.password === password);

            if (isAuthTrue) {
                submitBtn.innerText = "Access Granted";
                submitBtn.style.background = "#fff";
                submitBtn.style.color = "#020617";
                
                // 🔥 CHANGED: Use localStorage to keep them logged in permanently
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("loggedUserName", user.name); 
                
                setTimeout(() => {
                    window.location.href = "index.html"; 
                }, 800);

            } else {
                errorMessage.style.display = "block";
                errorMessage.innerText = "Invalid Registration Number or Password.";
                resetButton(originalText);
            }
            
        }, 1500);
    });

    function resetButton(text) {
        submitBtn.innerText = text;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
        submitBtn.disabled = false;
        document.getElementById("passInput").value = ""; 
    }
});
