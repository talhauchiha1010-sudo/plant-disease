import { auth } from "./firebase-config.js";
import { confirmPasswordReset, verifyPasswordResetCode } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Parse the action code from the URL (oobCode=...)
const urlParams = new URLSearchParams(window.location.search);
const actionCode = urlParams.get('oobCode');

const resetForm = document.getElementById("resetPasswordForm");
const newPassInput = document.getElementById("newPassword");
const confirmPassInput = document.getElementById("confirmNewPassword");
const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");

if (!actionCode) {
    message.textContent = "Error: No reset code found in URL. Please retry from email.";
    resetBtn.disabled = true;
} else {
    // Optional: Verify code validity on load
    verifyPasswordResetCode(auth, actionCode)
        .then((email) => {
            // Valid code. Show email.
            message.textContent = `Resetting password for: ${email}`;
        })
        .catch((error) => {
            console.error(error);
            message.textContent = `Invalid or expired link. Please request a new one.`;
            resetBtn.disabled = true;
        });
}

resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = newPassInput.value;
    const confirmPassword = confirmPassInput.value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        message.textContent = "Updating password...";
        resetBtn.disabled = true;

        await confirmPasswordReset(auth, actionCode, newPassword);

        alert("Password reset successfully! Redirecting to login...");
        window.location.href = "1.html"; // Go back to login

    } catch (error) {
        console.error(error);
        alert("Failed to reset password: " + error.message);
        message.textContent = error.message;
        resetBtn.disabled = false;
    }
});
