import { auth, db } from "./firebase-config.js";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ============================
   DOM Elements
============================ */

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotForm = document.getElementById("forgotForm");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const showForgot = document.getElementById("showForgot");
const showLoginFromForgot = document.getElementById("showLoginFromForgot");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");

const forgotEmail = document.getElementById("forgotEmail");

const googleLoginBtn = document.getElementById("googleLoginBtn");
const googleSignupBtn = document.getElementById("googleSignupBtn");

/* ============================
   Toggle Forms
============================ */

if (showSignup) {
    showSignup.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        forgotForm.style.display = "none";
        signupForm.style.display = "block";
    });
}

if (showLogin) {
    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.style.display = "none";
        forgotForm.style.display = "none";
        loginForm.style.display = "block";
    });
}

if (showForgot) {
    showForgot.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        signupForm.style.display = "none";
        forgotForm.style.display = "block";
    });
}

if (showLoginFromForgot) {
    showLoginFromForgot.addEventListener("click", (e) => {
        e.preventDefault();
        forgotForm.style.display = "none";
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    });
}

/* ============================
   LOGIN
============================ */

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                window.location.href = "/dashboard";   // ✅ FIXED
            } else {
                alert("Account not found in database.");
                await signOut(auth);
            }

        } catch (error) {
            alert("Login failed: " + error.message);
        }
    });
}

/* ============================
   SIGNUP
============================ */

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = signupEmail.value.trim();
        const password = signupPassword.value.trim();
        const confirmPassword = signupConfirmPassword.value.trim();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                createdAt: new Date().toISOString(),
                role: "user"
            });

            await signOut(auth);

            alert("Account created successfully! Please log in.");

            signupForm.style.display = "none";
            loginForm.style.display = "block";

        } catch (error) {
            alert("Signup failed: " + error.message);
        }
    });
}

/* ============================
   GOOGLE AUTH
============================ */

const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                createdAt: new Date().toISOString(),
                role: "user",
                authProvider: "google"
            });
        }

        window.location.href = "/dashboard";   // ✅ FIXED

    } catch (error) {
        alert("Google Auth failed: " + error.message);
    }
};

if (googleLoginBtn) googleLoginBtn.addEventListener("click", handleGoogleAuth);
if (googleSignupBtn) googleSignupBtn.addEventListener("click", handleGoogleAuth);

/* ============================
   FORGOT PASSWORD
============================ */

if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = forgotEmail.value.trim();

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent!");
            forgotForm.style.display = "none";
            loginForm.style.display = "block";
        } catch (error) {
            alert("Error sending reset email: " + error.message);
        }
    });
}
