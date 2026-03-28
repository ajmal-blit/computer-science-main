document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const submitBtn = document.getElementById("submitBtn");
    const errorMessage = document.getElementById("errorMessage"); // Grab the error box

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent page refresh

        // Hide the error message on every new attempt
        errorMessage.style.display = "none";

        const regNo = document.getElementById("regInput").value.trim();
        const password = document.getElementById("passInput").value.trim();

        // Button Loading State
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Authenticating...";
        submitBtn.style.opacity = "0.8";
        submitBtn.style.cursor = "wait";
        submitBtn.disabled = true; // Prevent multiple clicks

        // Simulate a network request (1.5 seconds)
        setTimeout(() => {
            
            // 🔥 MOCK AUTHENTICATION CHECK
            // We set a dummy "correct" login here for testing purposes.
            const isAuthTrue = (regNo === "GVAZSCS001" && password === "123456");

            if (isAuthTrue) {
                // SUCCESS (TRUE): Save session and redirect
                submitBtn.innerText = "Access Granted";
                submitBtn.style.background = "#fff";
                submitBtn.style.color = "#020617";
                
                // 🔥 NEW: Tell the browser the user is officially logged in
                sessionStorage.setItem("isLoggedIn", "true");
                
                setTimeout(() => {
                    // 🔥 NEW: Redirect to your main index page
                    window.location.href = "index.html"; 
                }, 800);

            } else {
                // FAIL (FALSE): Show error message
                errorMessage.style.display = "block";
                errorMessage.innerText = "Invalid Registration Number or Password.";
                
                resetButton(originalText);
            }
            
        }, 1500);
    });

    // Helper function to reset the form button after a failure
    function resetButton(text) {
        submitBtn.innerText = text;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
        submitBtn.disabled = false;
        
        // Best Practice: Clear the password field after a failed attempt
        document.getElementById("passInput").value = ""; 
    }
});