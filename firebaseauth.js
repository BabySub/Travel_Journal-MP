// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDOURdB1SE018tDRe9RxVp7PIV8oDnLbzs",
  authDomain: "map-journal-5738f.firebaseapp.com",
  projectId: "map-journal-5738f",
  storageBucket: "map-journal-5738f.firebasestorage.app",
  messagingSenderId: "754274852438",
  appId: "1:754274852438:web:3a1d490a8b95a55544e5f7",
  measurementId: "G-VXDJVT0ZG3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Message display function
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Handle Sign-Up
document.getElementById("submitSignUp")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("rEmail")?.value.trim();
  const password = document.getElementById("rPassword")?.value.trim();
  const firstName = document.getElementById("fName")?.value.trim();

  if (!email || !password || !firstName ) {
    showMessage("⚠️ Please fill all fields", "signUpMessage");
    return;
  }

  showLoadingToast("Creating your account...");

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const userData = { email, firstName};
    await setDoc(doc(db, "users", user.uid), userData);

    hideLoadingToast();
    showCustomToast("🎉 Account Created Successfully!", "index.html");
  } catch (error) {
    hideLoadingToast();
    const errorMsg =
      error.code === "auth/email-already-in-use"
        ? "⚠️ Email Address Already Exists"
        : "❌ Unable to create user. Please try again.";
    showMessage(errorMsg, "signUpMessage");
    console.error("SignUp Error:", error);
  }
});

// Handle Sign-In
document.getElementById("submitSignIn")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    showMessage("⚠️ Email and password are required", "signInMessage");
    return;
  }

  showLoadingToast("Signing you in...");

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("loggedInUserId", user.uid);

    const welcomeName = user.displayName || user.email || "User";

    hideLoadingToast();
    showCustomToast(`✅ Welcome, ${welcomeName}`, "journal.html");

  } catch (error) {
    hideLoadingToast();
    let message = "❌ Login failed. Please try again.";
    if (error.code === "auth/invalid-credential") {
      message = "⚠️ Incorrect Email or Password";
    } else if (error.code === "auth/user-not-found") {
      message = "❌ Account does not exist";
    }
    showMessage(message, "signInMessage");
    console.error("SignIn Error:", error);
  }
});

// ✅ GOOGLE SIGN-IN FUNCTIONALITY
document.getElementById("googleSignIn")?.addEventListener("click", handleGoogleSignIn);
document.getElementById("googleSignUp")?.addEventListener("click", handleGoogleSignIn);

async function handleGoogleSignIn() {
  const provider = new GoogleAuthProvider();
  showLoadingToast("Signing in with Google...");
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userData = {
      email: user.email,
      displayName: user.displayName,
    };

    await setDoc(doc(db, "users", user.uid), userData, { merge: true });
    localStorage.setItem("loggedInUserId", user.uid);

    hideLoadingToast();
    showCustomToast(`✅ Welcome, ${user.displayName}`, "journal.html");
  } catch (error) {
    hideLoadingToast();
    console.error("Google sign-in error:", error);
    showCustomToast("❌ Google sign-in failed. Try again.");
  }
}
